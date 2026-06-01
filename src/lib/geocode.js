export async function geocode(place) {
  const results = await searchPlaces(place, 1)
  if (!results.length) throw new Error(`Aucun résultat pour « ${place} »`)
  return results[0]
}

// Recherche multi-résultats pour l'autocomplétion d'adresse.
export async function searchPlaces(query, limit = 5) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=${limit}&q=${encodeURIComponent(query)}`
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'fr' },
  })
  if (!res.ok) throw new Error('Échec du géocodage')
  const results = await res.json()
  return results.map((r) => ({
    latitude: parseFloat(r.lat),
    longitude: parseFloat(r.lon),
    displayName: r.display_name,
  }))
}
