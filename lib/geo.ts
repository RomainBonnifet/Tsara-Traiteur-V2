// Convertit des degrés en radians (requis par la formule de Haversine)
function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

// Formule de Haversine : calcule la distance en km entre deux points GPS.
// Elle tient compte de la courbure de la Terre — indispensable dès qu'on
// dépasse quelques dizaines de km, sinon l'erreur devient significative.
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // rayon moyen de la Terre en km
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

// Géocode une adresse via l'API Adresse (gouvernement français, gratuite, sans clé).
// Retourne { lat, lng, label } ou null si l'adresse est introuvable / score trop bas.
export async function geocodeAdresse(adresse: string): Promise<{ lat: number; lng: number; label: string } | null> {
  const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(adresse)}&limit=1`
  const res = await fetch(url)
  if (!res.ok) return null

  const data = await res.json()
  const feature = data.features?.[0]

  // Un score < 0.5 signifie que l'API n'est pas sûre du résultat :
  // adresse trop vague, fautes de frappe, lieu inconnu, etc.
  if (!feature || feature.properties.score < 0.5) return null

  const [lng, lat] = feature.geometry.coordinates // GeoJSON : [lng, lat] (ordre inversé !)
  return { lat, lng, label: feature.properties.label }
}

// Vérifie qu'une adresse est dans le rayon de livraison configuré dans .env.
// Retourne { ok: true } ou { ok: false, message, distanceKm }
export async function verifierRayon(adresse: string): Promise<
  { ok: true; label: string } | { ok: false; message: string; distance?: number }
> {
  const businessLat = parseFloat(process.env.BUSINESS_LAT!)
  const businessLng = parseFloat(process.env.BUSINESS_LNG!)
  const radius = parseFloat(process.env.DELIVERY_RADIUS_KM!)

  const coords = await geocodeAdresse(adresse)

  if (!coords) {
    return { ok: false, message: "Adresse introuvable. Vérifiez l'adresse saisie." }
  }

  const distance = distanceKm(businessLat, businessLng, coords.lat, coords.lng)

  if (distance > radius) {
    return {
      ok: false,
      message: `Cette adresse est à ${Math.round(distance)} km — hors de la zone de livraison (${radius} km max).`,
      distance: Math.round(distance),
    }
  }

  return { ok: true, label: coords.label }
}
