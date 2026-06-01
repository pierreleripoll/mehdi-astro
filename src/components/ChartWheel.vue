<script setup>
import { computed } from 'vue'
import { ZODIAC_ICONS } from '../lib/zodiacIcons.js'

const props = defineProps({
  chart: { type: Object, required: true },
})

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
].map((name) => ({ name, icon: ZODIAC_ICONS[name] }))

const ICON_SIZE = 20

const ASPECT_COLOR = {
  conjunction: '#1a1a1a',
  opposition: '#b3261e',
  trine: '#2563eb',
  square: '#b3261e',
  sextile: '#2563eb',
}

const SIZE = 500
const CX = SIZE / 2
const CY = SIZE / 2
const R_OUTER = 240
const R_ZODIAC_IN = 208
const R_HOUSE_OUT = 208
const R_HOUSE_IN = 158
const R_PLANET = 184
const R_ASPECT = 150
const R_INNER = 60

const ascLon = computed(() => props.chart.ascLongitude ?? 0)

function lonToAngle(lon) {
  // Ecliptic longitude (0..360, 0 = 0° Aries) → SVG angle (rad).
  // Place ascendant at the left horizon (9 o'clock = π).
  // Longitudes increase counter-clockwise around the wheel.
  const deg = 180 + (lon - ascLon.value)
  return (deg * Math.PI) / 180
}

function polar(r, angleRad) {
  return {
    x: CX + r * Math.cos(angleRad),
    y: CY - r * Math.sin(angleRad),
  }
}

function arcPath(rOuter, rInner, lonStart, lonEnd) {
  const a1 = lonToAngle(lonStart)
  const a2 = lonToAngle(lonEnd)
  const p1 = polar(rOuter, a1)
  const p2 = polar(rOuter, a2)
  const p3 = polar(rInner, a2)
  const p4 = polar(rInner, a1)
  const sweep = 0
  const large = 0
  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} ${sweep} ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${large} ${1 - sweep} ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ')
}

const zodiacSegments = computed(() => {
  return SIGNS.map((sign, i) => {
    const startLon = i * 30
    const endLon = (i + 1) * 30
    const midLon = startLon + 15
    const mid = polar((R_OUTER + R_ZODIAC_IN) / 2, lonToAngle(midLon))
    return {
      ...sign,
      path: arcPath(R_OUTER, R_ZODIAC_IN, startLon, endLon),
      labelX: mid.x,
      labelY: mid.y,
    }
  })
})

const houseSpokes = computed(() => {
  return props.chart.houses.map((h) => {
    const a = lonToAngle(h.longitude)
    const outer = polar(R_HOUSE_OUT, a)
    const inner = polar(R_HOUSE_IN, a)
    const labelPos = polar(R_HOUSE_IN + 10, lonToAngle(h.longitude + 1))
    const isAngle = h.number === 1 || h.number === 4 || h.number === 7 || h.number === 10
    return {
      number: h.number,
      x1: outer.x, y1: outer.y,
      x2: inner.x, y2: inner.y,
      labelX: labelPos.x, labelY: labelPos.y,
      strong: isAngle,
    }
  })
})

function spreadPlanets(items, minSep = 7) {
  // Items must have { longitude, ... }. Returns items with `displayLon` field
  // adjusted so glyphs don't visually overlap (operates on a copy).
  const sorted = items
    .map((p, i) => ({ ...p, idx: i, displayLon: ((p.longitude - ascLon.value) % 360 + 360) % 360 }))
    .sort((a, b) => a.displayLon - b.displayLon)
  for (let pass = 0; pass < 4; pass++) {
    for (let i = 0; i < sorted.length; i++) {
      const cur = sorted[i]
      const next = sorted[(i + 1) % sorted.length]
      let diff = next.displayLon - cur.displayLon
      if (i === sorted.length - 1) diff += 360
      if (diff < minSep) {
        const push = (minSep - diff) / 2
        cur.displayLon -= push
        next.displayLon += push
      }
    }
  }
  return sorted.map((p) => ({
    ...p,
    renderLon: p.displayLon + ascLon.value,
  }))
}

const planetGlyphs = computed(() => {
  const all = [...props.chart.planets, ...props.chart.points]
    .filter((p) => p.glyph)
  const spread = spreadPlanets(all)
  return spread.map((p) => {
    const pos = polar(R_PLANET, lonToAngle(p.renderLon))
    const tick = polar(R_HOUSE_OUT - 2, lonToAngle(p.longitude))
    return {
      ...p,
      x: pos.x, y: pos.y,
      tickX: tick.x, tickY: tick.y,
    }
  })
})

const aspectLines = computed(() => {
  return props.chart.aspects
    .filter((a) => a.point1Longitude != null && a.point2Longitude != null)
    .map((a) => {
      const p1 = polar(R_ASPECT, lonToAngle(a.point1Longitude))
      const p2 = polar(R_ASPECT, lonToAngle(a.point2Longitude))
      return {
        x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
        color: ASPECT_COLOR[a.aspectKey] || '#999',
        key: `${a.point1Key}-${a.point2Key}-${a.aspectKey}`,
      }
    })
})

const angleMarkers = computed(() => {
  const list = []
  for (const a of props.chart.angles) {
    const ang = lonToAngle(a.longitude)
    const outer = polar(R_OUTER + 8, ang)
    const inner = polar(R_OUTER, ang)
    const label = polar(R_OUTER + 22, ang)
    list.push({
      key: a.key,
      label: a.glyph,
      x1: inner.x, y1: inner.y,
      x2: outer.x, y2: outer.y,
      labelX: label.x, labelY: label.y,
    })
  }
  return list
})
</script>

<template>
  <svg
    class="wheel"
    :viewBox="`0 0 ${SIZE} ${SIZE}`"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- zodiac ring background segments -->
    <g class="zodiac">
      <path
        v-for="(seg, i) in zodiacSegments"
        :key="seg.name"
        :d="seg.path"
        :class="['zodiac-seg', i % 2 === 0 ? 'even' : 'odd']"
      />
      <g
        v-for="seg in zodiacSegments"
        :key="`l-${seg.name}`"
        :transform="`translate(${seg.labelX - ICON_SIZE / 2}, ${seg.labelY - ICON_SIZE / 2}) scale(${ICON_SIZE / 24})`"
      >
        <path :d="seg.icon" class="sign-icon" />
      </g>
    </g>

    <!-- house cusps -->
    <g class="houses">
      <line
        v-for="h in houseSpokes"
        :key="`h-${h.number}`"
        :x1="h.x1" :y1="h.y1"
        :x2="h.x2" :y2="h.y2"
        :class="['cusp', { strong: h.strong }]"
      />
      <text
        v-for="h in houseSpokes"
        :key="`hn-${h.number}`"
        :x="h.labelX" :y="h.labelY"
        class="house-num"
      >{{ h.number }}</text>
    </g>

    <!-- aspect lines (drawn before planets so glyphs sit on top) -->
    <g class="aspects">
      <line
        v-for="a in aspectLines"
        :key="a.key"
        :x1="a.x1" :y1="a.y1"
        :x2="a.x2" :y2="a.y2"
        :stroke="a.color"
      />
    </g>

    <!-- inner rim circles -->
    <circle :cx="CX" :cy="CY" :r="R_HOUSE_IN" class="rim" />
    <circle :cx="CX" :cy="CY" :r="R_HOUSE_OUT" class="rim" />
    <circle :cx="CX" :cy="CY" :r="R_OUTER" class="rim" />
    <circle :cx="CX" :cy="CY" :r="R_INNER" class="rim faint" />

    <!-- planets -->
    <g class="planets">
      <line
        v-for="p in planetGlyphs"
        :key="`t-${p.key}`"
        :x1="p.tickX" :y1="p.tickY"
        :x2="CX + (p.tickX - CX) * (R_PLANET + 8) / R_HOUSE_OUT"
        :y2="CY + (p.tickY - CY) * (R_PLANET + 8) / R_HOUSE_OUT"
        class="tick"
      />
      <text
        v-for="p in planetGlyphs"
        :key="`p-${p.key}`"
        :x="p.x" :y="p.y"
        class="planet-glyph"
      >{{ p.glyph }}</text>
    </g>

    <!-- AC / MC markers on the outer rim -->
    <g class="angles">
      <line
        v-for="m in angleMarkers"
        :key="`am-${m.key}`"
        :x1="m.x1" :y1="m.y1"
        :x2="m.x2" :y2="m.y2"
        class="angle-tick"
      />
      <text
        v-for="m in angleMarkers"
        :key="`al-${m.key}`"
        :x="m.labelX" :y="m.labelY"
        class="angle-label"
      >{{ m.label }}</text>
    </g>
  </svg>
</template>

<style scoped>
.wheel {
  display: block;
  width: 100%;
  height: auto;
  margin: 0 auto 2rem;
}

.zodiac-seg {
  fill: transparent;
  stroke: var(--line);
  stroke-width: 0.6;
}
.zodiac-seg.even { fill: rgba(0, 0, 0, 0.025); }

.sign-icon {
  fill: none;
  stroke: var(--ink);
  stroke-width: 1.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.cusp {
  stroke: var(--line);
  stroke-width: 0.6;
}
.cusp.strong {
  stroke: var(--ink);
  stroke-width: 1.2;
}

.house-num {
  font-size: 9px;
  fill: var(--muted);
  text-anchor: middle;
  dominant-baseline: middle;
  font-variant-numeric: tabular-nums;
}

.rim {
  fill: none;
  stroke: var(--ink);
  stroke-width: 0.8;
}
.rim.faint {
  stroke: var(--line);
}

.aspects line {
  stroke-width: 0.5;
  opacity: 0.45;
}

.planet-glyph {
  font-size: 20px;
  text-anchor: middle;
  dominant-baseline: middle;
  fill: var(--ink);
}

.tick {
  stroke: var(--ink);
  stroke-width: 0.5;
}

.angle-tick {
  stroke: var(--ink);
  stroke-width: 1.4;
}

.angle-label {
  font-size: 10px;
  letter-spacing: 0.05em;
  text-anchor: middle;
  dominant-baseline: middle;
  fill: var(--ink);
}
</style>
