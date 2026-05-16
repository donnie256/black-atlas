import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils'
import { BusinessCategory } from '@/types'

const PLACES_API = 'https://places.googleapis.com/v1/places:searchText'

const SEARCH_QUERIES: { query: string; category: BusinessCategory }[] = [
  { query: 'Black owned restaurant Denver Colorado', category: 'restaurant' },
  { query: 'African restaurant Denver Colorado', category: 'restaurant' },
  { query: 'Caribbean restaurant Denver Colorado', category: 'restaurant' },
  { query: 'Black owned barbershop Denver Colorado', category: 'barbershop' },
  { query: 'Black owned hair salon Denver Colorado', category: 'salon' },
  { query: 'Black owned thrift store Denver Colorado', category: 'thrift' },
  { query: 'Black owned boutique retail Denver Colorado', category: 'retail' },
  { query: 'Black owned spa wellness Denver Colorado', category: 'health' },
]

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

interface PlacesPhoto {
  name: string // e.g. "places/ChIJ.../photos/AXCi2y..."
}

interface PlacesResult {
  id: string
  displayName: { text: string }
  formattedAddress: string
  nationalPhoneNumber?: string
  websiteUri?: string
  location: { latitude: number; longitude: number }
  regularOpeningHours?: {
    weekdayDescriptions: string[] // ["Monday: 9:00 AM – 5:00 PM", ...]
  }
  photos?: PlacesPhoto[]
}

// Fetches the CDN photo URL from a Places photo reference.
// Returns a key-free CDN URL safe to store and display.
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

// Maps Google's ["Monday: 9:00 AM – 5:00 PM", ...] to { mon: "9:00 AM – 5:00 PM", ... }
function parseHours(weekdayDescriptions: string[]): Record<string, string> {
  const hours: Record<string, string> = {}
  weekdayDescriptions.forEach((desc, i) => {
    const key = DAY_KEYS[i]
    if (!key) return
    // Strip the day name prefix: "Monday: 9:00 AM – 5:00 PM" → "9:00 AM – 5:00 PM"
    const value = desc.replace(/^[^:]+:\s*/, '')
    hours[key] = value
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
            radius: 40000,
          },
        },
        maxResultCount: 20,
      }),
    })

    if (!res.ok) {
      console.error(`Places API error for query "${query}": ${res.status}`)
      continue
    }

    const data = await res.json()
    const places: PlacesResult[] = data.places ?? []

    for (const place of places) {
      const { data: existing } = await supabase
        .from('businesses')
        .select('id')
        .eq('google_place_id', place.id)
        .single()

      if (existing) {
        skipped++
        continue
      }

      // Fetch cover photo if available
      const firstPhoto = place.photos?.[0]
      const cover_image_url = firstPhoto
        ? await fetchPhotoUrl(firstPhoto.name, apiKey)
        : null

      // Parse hours if available
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

      // Space out photo requests to avoid hitting rate limits
      await new Promise((r) => setTimeout(r, 150))
    }

    await new Promise((r) => setTimeout(r, 300))
  }

  return NextResponse.json({ imported, skipped })
}
