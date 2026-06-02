<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import ChartWheel from '../components/ChartWheel.vue'
import { useChartStore } from '../stores/chart.js'
import { loadBackgroundVideo, subscribeBackgroundVideo } from '../lib/videoStore.js'

const store = useChartStore()

// The background video is uploaded in the control tab and stored in IndexedDB.
// We read the blob, turn it into an object URL, and refresh whenever the
// control tab broadcasts a change. Object URLs are revoked to avoid leaks.
const videoSrc = ref('')
let currentUrl = ''

async function refreshVideo() {
  const blob = await loadBackgroundVideo()
  if (currentUrl) {
    URL.revokeObjectURL(currentUrl)
    currentUrl = ''
  }
  currentUrl = blob ? URL.createObjectURL(blob) : ''
  videoSrc.value = currentUrl
}

let unsubscribe = () => {}
onMounted(() => {
  refreshVideo()
  unsubscribe = subscribeBackgroundVideo(refreshVideo)
})
onUnmounted(() => {
  unsubscribe()
  if (currentUrl) URL.revokeObjectURL(currentUrl)
})
</script>

<template>
  <main class="display">
    <video
      v-if="videoSrc"
      class="bg-video"
      :src="videoSrc"
      autoplay
      muted
      loop
      playsinline
    ></video>
    <div v-if="store.chart" class="wheel-wrap">
      <ChartWheel :chart="store.chart" />
    </div>
    <p v-else class="waiting">Waiting for chart…</p>
  </main>
</template>

<style scoped>
/* The wheel is a 500x500 viewBox SVG (width:100% inside its box), so a square
   wrapper sized to the smaller viewport edge scales it up cleanly. */
.display {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2vmin;
  overflow: hidden;
}

/* Decorative looping background, sits behind the wheel. */
.bg-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.wheel-wrap {
  position: relative;
  z-index: 1;
  width: min(50vh, 96vw);
  height: min(50vh, 96vw);
}

.waiting {
  position: relative;
  z-index: 1;
  color: var(--muted);
  font-size: clamp(1rem, 3vmin, 1.5rem);
  letter-spacing: 0.02em;
}
</style>
