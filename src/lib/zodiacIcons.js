// Minimalist zodiac glyphs, hand-drawn as SVG paths.
// Each icon lives in a 24x24 viewBox and is rendered with stroke (no fill)
// so it inherits the chart's line weight and color.

export const ZODIAC_ICONS = {
  Aries: 'M 12 19 V 7 M 12 7 Q 5 7 5 13 M 12 7 Q 19 7 19 13',
  Taurus: 'M 12 19 a 4.5 4.5 0 1 1 0 -9 a 4.5 4.5 0 1 1 0 9 M 6 8 Q 12 4 18 8',
  Gemini: 'M 8 6 V 18 M 16 6 V 18 M 6 6 H 18 M 6 18 H 18',
  Cancer: 'M 5 10 a 4 4 0 0 1 8 0 M 19 14 a 4 4 0 0 1 -8 0 M 8.5 10 a 1.2 1.2 0 1 0 0.01 0 M 15.5 14 a 1.2 1.2 0 1 0 0.01 0',
  Leo: 'M 11 14 a 3 3 0 1 1 0 -0.01 M 13 12 Q 19 11 18 6 Q 17 3 13 4 M 13 4 Q 11 4 11 6',
  Virgo: 'M 5 18 V 9 Q 5 6 8 6 Q 11 6 11 9 V 18 M 11 9 Q 11 6 14 6 Q 17 6 17 9 V 18 M 17 9 Q 17 6 19 7 Q 21 8 20 11 Q 19 14 17 14',
  Libra: 'M 4 18 H 20 M 4 15 H 8 M 16 15 H 20 M 8 15 Q 12 8 16 15',
  Scorpio: 'M 4 18 V 9 Q 4 6 7 6 Q 10 6 10 9 V 18 M 10 9 Q 10 6 13 6 Q 16 6 16 9 V 18 M 16 9 Q 16 6 18 7 Q 21 8 20 12 L 22 10 M 20 12 L 22 14',
  Sagittarius: 'M 5 19 L 18 6 M 13 6 H 19 V 12 M 9 12 L 13 16',
  Capricorn: 'M 5 7 L 9 18 L 13 7 Q 16 7 17 10 Q 18 13 17 16 Q 16 19 13 18 Q 11 17 12 14',
  Aquarius: 'M 4 10 L 8 8 L 12 10 L 16 8 L 20 10 M 4 16 L 8 14 L 12 16 L 16 14 L 20 16',
  Pisces: 'M 7 6 Q 4 12 7 18 M 17 6 Q 20 12 17 18 M 5 12 H 19',
}
