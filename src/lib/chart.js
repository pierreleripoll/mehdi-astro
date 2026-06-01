import { Origin, Horoscope } from 'circular-natal-horoscope-js'

const SIGN_GLYPHS = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
}

const PLANET_GLYPHS = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northnode: '☊', southnode: '☋', lilith: '⚸', chiron: '⚷', sirius: '★',
}

const ASPECT_GLYPHS = {
  conjunction: '☌', opposition: '☍', trine: '△',
  square: '□', sextile: '⚹', quincunx: '⚻',
  'semi-square': '∠', 'sesqui-quadrate': '⚼', 'semi-sextile': '⚺',
}

function fmtDeg(decimalDegrees) {
  const inSign = decimalDegrees % 30
  const deg = Math.floor(inSign)
  const min = Math.floor((inSign - deg) * 60)
  return `${deg}°${String(min).padStart(2, '0')}'`
}

export function computeChart({ year, month, day, hour, minute, latitude, longitude }) {
  const origin = new Origin({
    year, month: month - 1, date: day, hour, minute,
    latitude, longitude,
  })

  const horoscope = new Horoscope({
    origin,
    houseSystem: 'placidus',
    zodiac: 'tropical',
    aspectPoints: ['bodies', 'points', 'angles'],
    aspectWithPoints: ['bodies', 'points', 'angles'],
    aspectTypes: ['major'],
    language: 'en',
  })

  const planets = horoscope.CelestialBodies.all.map((b) => ({
    name: b.label,
    key: b.key,
    glyph: PLANET_GLYPHS[b.key] || '',
    sign: b.Sign.label,
    signGlyph: SIGN_GLYPHS[b.Sign.label] || '',
    longitude: b.ChartPosition.Ecliptic.DecimalDegrees,
    degree: fmtDeg(b.ChartPosition.Ecliptic.DecimalDegrees),
    retrograde: b.isRetrograde,
  }))

  const points = horoscope.CelestialPoints.all.map((p) => ({
    name: p.label,
    key: p.key,
    glyph: PLANET_GLYPHS[p.key] || '',
    sign: p.Sign.label,
    signGlyph: SIGN_GLYPHS[p.Sign.label] || '',
    longitude: p.ChartPosition.Ecliptic.DecimalDegrees,
    degree: fmtDeg(p.ChartPosition.Ecliptic.DecimalDegrees),
  }))

  const asc = horoscope.Ascendant
  const mc = horoscope.Midheaven
  const ascLongitude = asc.ChartPosition.Ecliptic.DecimalDegrees
  const mcLongitude = mc.ChartPosition.Ecliptic.DecimalDegrees
  const angles = [
    {
      name: 'Ascendant', key: 'ascendant', glyph: 'AC',
      sign: asc.Sign.label, signGlyph: SIGN_GLYPHS[asc.Sign.label] || '',
      longitude: ascLongitude,
      degree: fmtDeg(ascLongitude),
    },
    {
      name: 'Midheaven', key: 'midheaven', glyph: 'MC',
      sign: mc.Sign.label, signGlyph: SIGN_GLYPHS[mc.Sign.label] || '',
      longitude: mcLongitude,
      degree: fmtDeg(mcLongitude),
    },
  ]

  const houses = horoscope.Houses.map((h, i) => ({
    number: i + 1,
    sign: h.Sign.label,
    signGlyph: SIGN_GLYPHS[h.Sign.label] || '',
    longitude: h.ChartPosition.StartPosition.Ecliptic.DecimalDegrees,
    degree: fmtDeg(h.ChartPosition.StartPosition.Ecliptic.DecimalDegrees),
  }))

  const lookup = {}
  planets.forEach((p) => { lookup[p.key] = p.longitude })
  points.forEach((p) => { lookup[p.key] = p.longitude })
  lookup.ascendant = ascLongitude
  lookup.midheaven = mcLongitude

  const aspects = horoscope.Aspects.all.map((a) => ({
    point1: a.point1Label,
    point2: a.point2Label,
    point1Key: a.point1Key,
    point2Key: a.point2Key,
    point1Longitude: lookup[a.point1Key],
    point2Longitude: lookup[a.point2Key],
    type: a.label,
    aspectKey: a.aspectKey,
    glyph: ASPECT_GLYPHS[a.aspectKey] || '',
    orb: a.orb.toFixed(2),
  }))

  return { planets, points, angles, houses, aspects, ascLongitude, mcLongitude }
}
