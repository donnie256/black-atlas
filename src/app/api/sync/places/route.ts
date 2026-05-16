import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils'
import { BusinessCategory } from '@/types'

const PLACES_API = 'https://places.googleapis.com/v1/places:searchText'

// Primary: culturally specific queries + Five Points / Park Hill neighborhood bias
// Fallback queries ready if blackOwnedBusiness attribute isn't exposed by the API
const SEARCH_QUERIES: { query: string; category: BusinessCategory }[] = [
  // Soul food / African / Caribbean — ownership is implicit in the cuisine type
  { query: 'soul food restaurant Denver Colorado', category: 'restaurant' },
  { query: 'African restaurant Denver Colorado', category: 'restaurant' },
  { query: 'Jamaican restaurant Denver Colorado', category: 'restaurant' },
  { query: 'Afro-Caribbean restaurant Denver Colorado', category: 'restaurant' },
  { query: 'Ethiopian restaurant Denver Colorado', category: 'restaurant' },
  // Hair braiding / Black hair — near 100% Black-owned
  { query: 'African hair braiding salon Denver Colorado', category: 'salon' },
  { query: 'Black hair braiding Denver Colorado', category: 'salon' },
  { query: 'natural hair salon Denver Colorado', category: 'salon' },
  // Five Points — Denver's historically Black neighborhood
  { query: 'barbershop Five Points Denver', category: 'barbershop' },
  { query: 'restaurant Five Points Denver', category: 'restaurant' },
  { query: 'beauty salon Five Points Denver', category: 'salon' },
  // Park Hill — significant Black community
  { query: 'barbershop Park Hill Denver', category: 'barbershop' },
  { query: 'restaurant Park Hill Denver', category: 'restaurant' },
  // Explicit Black-owned searches
  { query: 'Black owned barbershop Denver Colorado', category: 'barbershop' },
  { query: 'Black owned boutique Denver Colorado', category: 'retail' },
  { query: 'Black owned spa wellness Denver Colorado', category: 'health' },
]

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

interface PlacesPhoto {
  name: string
}

interface PlacesResult {
  id: string
  displayName: { text: string }
  formattedAddress: string
  nationalPhoneNumber?: string
  websiteUri?: string
  location: { latitude: number; longitude: number }
  regularOpeningHours?: {
    weekdayDescriptions: string[]
  }
  photos?: PlacesPhoto[]
  // Black-owned attribute — self-reported by business on Google Business Profile
  // May or may not be returned depending on API version/coverage
  blackOwnedBusiness?: boolean
  identities?: { name: string }[]
}

async function fetchPhotoUrl(photoName: string, apiKey: string): Promise<string | null> {
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=1200&skipHttpRedirect=true&key=${apiKey}`
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    return data.photoUri ?? null
  } catch {
    return null
  }
}

function parseHours(weekdayDescriptions: string[]): Record<string, string> {
  const hours: Record<string, string> = {}
  weekdayDescriptions.forEach((desc, i) => {
    const key = DAY_KEYS[i]
    if (!key) return
    hours[key] = desc.replace(/^[^:]+:\s*/, '')
  })
  return hours
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Google Places API key not configured' }, { status: 500 })
  }

  const supabase = createAdminClient()
  let imported = 0
  let skipped = 0
  const queryResults: Record<string, number> = {}

  for (const { query, category } of SEARCH_QUERIES) {
    const res = await fetch(PLACES_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.nationalPhoneNumber',
          'places.websiteUri',
          'places.location',
          'places.regularOpeningHours',
          'places.photos',
        ].join(','),
      },
      body: JSON.stringify({
        textQuery: query,
        locationBias: {
          circle: {
            center: { latitude: 39.7392, longitude: -104.9903 },
            radius: 25000, // tightened from 40km to 25km — keeps results closer to Denver proper
          },
        },
        maxResultCount: 20,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error(`Places API error for "${query}": ${res.status} — ${errText}`)
      continue
    }

    const data = await res.json()
    const places: PlacesResult[] = data.places ?? []
    queryResults[query] = places.length

    for (const place of places) {
      const { data: existing } = await supabase
        .from('businesses')
        .select('id')
        .eq('google_place_id', place.id)
        .single()

      if (existing) { skipped++; continue }

      const firstPhoto = place.photos?.[0]
      const cover_image_url = firstPhoto ? await fetchPhotoUrl(firstPhoto.name, apiKey) : null
      const hours = place.regularOpeningHours?.weekdayDescriptions
        ? parseHours(place.regularOpeningHours.weekdayDescriptions)
        : null

      const name = place.displayName.text
      const slug = slugify(`${name}-denver`)

      const { error } = await supabase.from('businesses').insert({
        slug,
        name,
        category,
        address: place.formattedAddress,
        city: 'Denver',
        state: 'CO',
        phone: place.nationalPhoneNumber ?? null,
        website: place.websiteUri ?? null,
        hours,
        cover_image_url,
        google_place_id: place.id,
        status: 'pending',
      })

      if (!error) imported++

      await new Promise((r) => setTimeout(r, 150))
    }

    await new Promise((r) => setTimeout(r, 300))
  }

  return NextResponse.json({ imported, skipped, queryResults })
}
