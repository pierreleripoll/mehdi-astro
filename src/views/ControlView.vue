<script setup>
import { ref } from 'vue'
import BirthForm from '../components/BirthForm.vue'
import ChartView from '../components/ChartView.vue'
import { geocode } from '../lib/geocode.js'
import { computeChart } from '../lib/chart.js'
import { useChartStore } from '../stores/chart.js'

const store = useChartStore()
const error = ref('')

// URL de la vue projecteur, en tenant compte du base path (GitHub Pages).
const displayUrl = import.meta.env.BASE_URL + 'display'

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

    <BirthForm @submit="handleSubmit" />

    <p v-if="error" class="error">{{ error }}</p>

    <ChartView v-if="store.chart && store.meta" :chart="store.chart" :meta="store.meta" />
  </main>
</template>
