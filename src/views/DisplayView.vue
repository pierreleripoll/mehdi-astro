<script setup>
import ChartWheel from '../components/ChartWheel.vue'
import { useChartStore } from '../stores/chart.js'

const store = useChartStore()
</script>

<template>
  <main class="display">
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
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2vmin;
}

.wheel-wrap {
  width: min(96vw, 96vh);
  height: min(96vw, 96vh);
}

.waiting {
  color: var(--muted);
  font-size: clamp(1rem, 3vmin, 1.5rem);
  letter-spacing: 0.02em;
}
</style>
