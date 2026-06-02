// Stores the projector background video chosen in the control tab.
//
// The file is kept in IndexedDB (it handles large binary blobs and persists
// across reloads, unlike localStorage) and the display tab is notified over a
// BroadcastChannel to (re)load it. Both tabs share one browser/origin, so the
// video never leaves the machine and stays at full quality.

const DB_NAME = 'mehdi-astro'
const STORE = 'media'
const KEY = 'bg-video'
const CHANNEL = 'mehdi-astro:video'

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function notifyChanged() {
  const bc = new BroadcastChannel(CHANNEL)
  bc.postMessage('updated')
  bc.close()
}

// Persist the chosen video (a File/Blob) and tell the display tab to reload.
export async function saveBackgroundVideo(blob) {
  const db = await openDb()
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).put(blob, KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
  notifyChanged()
}

// Return the stored video Blob, or null if none has been set.
export async function loadBackgroundVideo() {
  const db = await openDb()
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(KEY)
      req.onsuccess = () => resolve(req.result ?? null)
      req.onerror = () => reject(req.error)
    })
  } finally {
    db.close()
  }
}

// Remove the stored video and tell the display tab to clear its background.
export async function clearBackgroundVideo() {
  const db = await openDb()
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).delete(KEY)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } finally {
    db.close()
  }
  notifyChanged()
}

// Subscribe to background-video changes. Returns an unsubscribe function.
export function subscribeBackgroundVideo(onUpdate) {
  const bc = new BroadcastChannel(CHANNEL)
  bc.onmessage = () => onUpdate()
  return () => bc.close()
}
