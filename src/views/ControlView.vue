<script setup>
import { ref, onMounted } from 'vue'
import BirthForm from '../components/BirthForm.vue'
import ChartView from '../components/ChartView.vue'
import { geocode } from '../lib/geocode.js'
import { computeChart } from '../lib/chart.js'
import { useChartStore } from '../stores/chart.js'
import {
  saveBackgroundVideo,
  loadBackgroundVideo,
  clearBackgroundVideo,
} from '../lib/videoStore.js'

const store = useChartStore()
const error = ref('')

// URL de la vue projecteur, en tenant compte du base path (GitHub Pages).
const displayUrl = import.meta.env.BASE_URL + 'display'

// --- Vidéo de fond de la vue projecteur ---
const hasVideo = ref(false)
const videoBusy = ref(false)
const videoError = ref('')

onMounted(async () => {
  hasVideo.value = !!(await loadBackgroundVideo())
})

async function handleVideo(event) {
  const file = event.target.files?.[0]
  if (!file) return
  videoError.value = ''
  videoBusy.value = true
  try {
    await saveBackgroundVideo(file)
    hasVideo.value = true
  } catch (e) {
    videoError.value = e.message || String(e)
  } finally {
    videoBusy.value = false
    event.target.value = '' // permet de re-sélectionner le même fichier
  }
}

async function removeVideo() {
  await clearBackgroundVideo()
  hasVideo.value = false
}

async function handleSubmit(input) {
  error.value = ''
  try {
    // Réutilise les coordonnées issues de l'autocomplétion si disponibles.
    const loc = input.location || (await geocode(input.place))
    const chart = computeChart({
      year: input.year,
      month: input.month,
      day: input.day,
      hour: input.hour,
      minute: input.minute,
      latitude: loc.latitude,
      longitude: loc.longitude,
    })
    const meta = {
      dateLabel: `${String(input.day).padStart(2, '0')}/${String(input.month).padStart(2, '0')}/${input.year}`,
      timeLabel: `${String(input.hour).padStart(2, '0')}:${String(input.minute).padStart(2, '0')}`,
      placeLabel: loc.displayName,
    }
    store.setChart(chart, meta)
  } catch (e) {
    error.value = e.message || String(e)
  }
}
</script>

<template>
  <main>
    <h1>Thème natal</h1>
    <p class="sub">Saisissez votre date, heure et lieu de naissance.</p>
    <p class="sub">
      <a :href="displayUrl" target="_blank" rel="noopener">Ouvrir la vue projecteur ↗</a>
    </p>

    <section class="bg-video">
      <label class="bg-video__label">Vidéo de fond (vue projecteur)</label>
      <input type="file" accept="video/*" :disabled="videoBusy" @change="handleVideo" />
      <p v-if="videoBusy" class="sub">Enregistrement…</p>
      <p v-else-if="hasVideo" class="sub">
        Vidéo enregistrée ✓
        <button type="button" class="bg-video__remove" @click="removeVideo">Retirer</button>
      </p>
      <p v-if="videoError" class="error">{{ videoError }}</p>
    </section>

    <BirthForm @submit="handleSubmit" />

    <p v-if="error" class="error">{{ error }}</p>

    <ChartView v-if="store.chart && store.meta" :chart="store.chart" :meta="store.meta" />
  </main>
</template>

<style scoped>
.bg-video {
  margin: 1rem 0 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.bg-video__label {
  font-size: 0.9rem;
  color: var(--muted);
}

.bg-video__remove {
  margin-left: 0.5rem;
  cursor: pointer;
}
</style>
