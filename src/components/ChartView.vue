<script setup>
import ChartWheel from './ChartWheel.vue'
defineProps({
  chart: { type: Object, required: true },
  meta: { type: Object, required: true },
})
</script>

<template>
  <section class="chart">
    <p class="meta">
      {{ meta.dateLabel }} · {{ meta.timeLabel }}<br />
      {{ meta.placeLabel }}
    </p>

    <ChartWheel :chart="chart" />

    <h2>Angles</h2>
    <table>
      <tbody>
        <tr v-for="a in chart.angles" :key="a.name">
          <td>{{ a.name }}</td>
          <td>
            <span class="glyph">{{ a.signGlyph }}</span>{{ a.sign }} {{ a.degree }}
          </td>
        </tr>
      </tbody>
    </table>

    <h2>Planets</h2>
    <table>
      <tbody>
        <tr v-for="p in chart.planets" :key="p.key">
          <td><span class="glyph">{{ p.glyph }}</span>{{ p.name }}</td>
          <td>
            <span class="glyph">{{ p.signGlyph }}</span>{{ p.sign }} {{ p.degree }}
            <span v-if="p.retrograde" style="color: var(--muted)"> ℞</span>
          </td>
        </tr>
      </tbody>
    </table>

    <h2>Points</h2>
    <table>
      <tbody>
        <tr v-for="p in chart.points" :key="p.key">
          <td><span class="glyph">{{ p.glyph }}</span>{{ p.name }}</td>
          <td>
            <span class="glyph">{{ p.signGlyph }}</span>{{ p.sign }} {{ p.degree }}
          </td>
        </tr>
      </tbody>
    </table>

    <h2>Houses</h2>
    <table>
      <tbody>
        <tr v-for="h in chart.houses" :key="h.number">
          <td>House {{ h.number }}</td>
          <td>
            <span class="glyph">{{ h.signGlyph }}</span>{{ h.sign }} {{ h.degree }}
          </td>
        </tr>
      </tbody>
    </table>

    <h2>Aspects</h2>
    <table>
      <tbody>
        <tr v-for="(a, i) in chart.aspects" :key="i">
          <td>{{ a.point1 }} <span class="glyph">{{ a.glyph }}</span> {{ a.point2 }}</td>
          <td>{{ a.type }} · orb {{ a.orb }}°</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
