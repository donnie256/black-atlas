import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils'
import { BusinessCategory } from '@/types'

const PLACES_API = 'https://places.googleapis.com/v1/places:searchText'

// Queries to run — maps to our business categories
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

interface PlacesResult {
  id: string
  displayName: { text: string }
  formattedAddress: string
  nationalPhoneNumber?: string
  websiteUri?: string
  location: { latitude: number; longitude: number }
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
        'X-Goog-FieldMask':
          'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.location',
      },
      body: JSON.stringify({
        textQuery: query,
        locationBias: {
          circle: {
            center: { latitude: 39.7392, longitude: -104.9903 },
            radius: 40000, // ~25 miles in meters
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
      // Check if already imported
      const { data: existing } = await supabase
        .from('businesses')
        .select('id')
        .eq('google_place_id', place.id)
        .single()

      if (existing) {
        skipped++
        continue
      }

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
        google_place_id: place.id,
        status: 'pending', // requires manual approval before going live
      })

      if (!error) imported++
    }

    await new Promise((r) => setTimeout(r, 300))
  }

  return NextResponse.json({ imported, skipped })
}
