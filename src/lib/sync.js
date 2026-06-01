// Cross-tab sync for the control / display tabs.
// Both tabs run in the same browser on the same origin, so we use a
// BroadcastChannel for instant updates plus a localStorage snapshot so a
// display tab opened later still shows the most recent chart.

const CHANNEL = 'mehdi-astro'
const STORAGE_KEY = 'mehdi-astro:chart'

// Publish the latest chart from the control tab. Payload is { chart, meta }
// and contains only plain JSON-serializable data.
export function publishChart(payload) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // ignore storage quota / private mode errors
  }
  const bc = new BroadcastChannel(CHANNEL)
  bc.postMessage(payload)
  bc.close()
}

// Subscribe to live chart updates. Returns an unsubscribe function.
export function subscribeChart(onUpdate) {
  const bc = new BroadcastChannel(CHANNEL)
  bc.onmessage = (event) => onUpdate(event.data)
  return () => bc.close()
}

// Read the last published chart (returns null if none / invalid).
export function loadLastChart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
