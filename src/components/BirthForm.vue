<script setup>
import { ref } from 'vue'
import { searchPlaces } from '../lib/geocode.js'

const emit = defineEmits(['submit'])

// Format français : JJ/MM/AAAA et HH:MM (24 h)
// Valeurs par défaut : Che Guevara (Rosario, Argentine)
const date = ref('14/06/1928')
const time = ref('03:05')
const place = ref('Rosario, Argentine')
const loading = ref(false)
const error = ref('')

// Autocomplétion d'adresse (Nominatim)
const suggestions = ref([])
const showSuggestions = ref(false)
const searching = ref(false)
const selectedLocation = ref(null)
let debounceTimer = null

function onPlaceInput() {
  // Une nouvelle frappe invalide la sélection précédente.
  selectedLocation.value = null
  clearTimeout(debounceTimer)
  const query = place.value.trim()
  if (query.length < 3) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }
  // Anti-rebond pour respecter la limite de débit de Nominatim.
  debounceTimer = setTimeout(async () => {
    searching.value = true
    try {
      suggestions.value = await searchPlaces(query, 5)
      showSuggestions.value = true
    } catch {
      suggestions.value = []
    } finally {
      searching.value = false
    }
  }, 350)
}

function selectSuggestion(s) {
  place.value = s.displayName
  selectedLocation.value = s
  suggestions.value = []
  showSuggestions.value = false
}

function hideSuggestions() {
  // Léger délai pour laisser le clic sur une suggestion se déclencher.
  setTimeout(() => {
    showSuggestions.value = false
  }, 150)
}

// Masque de saisie : l'utilisateur tape les chiffres, les / s'insèrent seuls.
function onDateInput(e) {
  const digits = e.target.value.replace(/\D/g, '').slice(0, 8)
  let out = digits.slice(0, 2)
  if (digits.length >= 3) out += '/' + digits.slice(2, 4)
  if (digits.length >= 5) out += '/' + digits.slice(4, 8)
  date.value = out
  e.target.value = out
}

// Masque de saisie : les : s'insèrent seuls.
function onTimeInput(e) {
  const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
  let out = digits.slice(0, 2)
  if (digits.length >= 3) out += ':' + digits.slice(2, 4)
  time.value = out
  e.target.value = out
}

function parseDate(value) {
  const m = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!m) throw new Error('Date invalide. Format attendu : JJ/MM/AAAA')
  const [, d, mo, y] = m.map(Number)
  if (mo < 1 || mo > 12 || d < 1 || d > 31) throw new Error('Date invalide.')
  return { year: y, month: mo, day: d }
}

function parseTime(value) {
  const m = value.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) throw new Error('Heure invalide. Format attendu : HH:MM')
  const [, hh, mm] = m.map(Number)
  if (hh > 23 || mm > 59) throw new Error('Heure invalide.')
  return { hour: hh, minute: mm }
}

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const { year, month, day } = parseDate(date.value)
    const { hour, minute } = parseTime(time.value)
    await emit('submit', {
      year, month, day, hour, minute,
      place: place.value,
      location: selectedLocation.value,
    })
  } catch (e) {
    error.value = e.message || String(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <div class="row">
      <div>
        <label for="date">Date</label>
        <input
          id="date"
          type="text"
          :value="date"
          @input="onDateInput"
          inputmode="numeric"
          maxlength="10"
          placeholder="JJ/MM/AAAA"
          required
        />
      </div>
      <div>
        <label for="time">Heure</label>
        <input
          id="time"
          type="text"
          :value="time"
          @input="onTimeInput"
          inputmode="numeric"
          maxlength="5"
          placeholder="HH:MM"
          required
        />
      </div>
    </div>
    <div class="field place-field">
      <label for="place">Lieu</label>
      <input
        id="place"
        type="text"
        v-model="place"
        @input="onPlaceInput"
        @focus="showSuggestions = suggestions.length > 0"
        @blur="hideSuggestions"
        autocomplete="off"
        placeholder="ex. Marseille, France"
        required
      />
      <ul v-if="showSuggestions && suggestions.length" class="suggestions">
        <li
          v-for="(s, i) in suggestions"
          :key="i"
          @mousedown.prevent="selectSuggestion(s)"
        >
          {{ s.displayName }}
        </li>
      </ul>
      <p v-if="searching" class="hint">Recherche…</p>
    </div>
    <button type="submit" :disabled="loading">
      {{ loading ? 'Calcul en cours…' : 'Calculer le thème' }}
    </button>
    <p v-if="error" class="error">{{ error }}</p>
  </form>
</template>

<style scoped>
.place-field {
  position: relative;
}

.suggestions {
  position: absolute;
  z-index: 10;
  left: 0;
  right: 0;
  margin: 0.25rem 0 0;
  padding: 0;
  list-style: none;
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 6px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  max-height: 16rem;
  overflow-y: auto;
}

.suggestions li {
  padding: 0.6rem 0.85rem;
  font-size: 0.9rem;
  cursor: pointer;
  border-bottom: 1px solid var(--line);
}

.suggestions li:last-child {
  border-bottom: none;
}

.suggestions li:hover {
  background: rgba(0, 0, 0, 0.04);
}

.hint {
  font-size: 0.8rem;
  color: var(--muted);
  margin: 0.4rem 0 0;
}
</style>
