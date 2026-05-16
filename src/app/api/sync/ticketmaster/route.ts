import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils'

const TM_API = 'https://app.ticketmaster.com/discovery/v2/events.json'

// Genre/segment IDs that skew toward Black cultural events
const SEARCHES = [
  { keyword: 'black', classificationName: 'Music' },
  { keyword: 'afrobeats' },
  { keyword: 'r&b soul' },
  { keyword: 'hip hop' },
  { keyword: 'gospel' },
  { keyword: 'juneteenth' },
  { keyword: 'african' },
  { keyword: 'caribbean' },
  { keyword: 'reggae' },
]

interface TMEvent {
  id: string
  name: string
  description?: string
  info?: string
  url: string
  images: { url: string; width: number; height: number }[]
  dates: {
    start: { dateTime?: string; localDate: string; localTime?: string }
  }
  priceRanges?: { min: number; max: number; currency: string }[]
  _embedded?: {
    venues?: {
      name: string
      address?: { line1: string }
      city?: { name: string }
      state?: { stateCode: string }
    }[]
  }
}

function getBestImage(images: TMEvent['images']): string | null {
  if (!images?.length) return null
  // Prefer 16:9 ratio images, largest available
  const sorted = [...images].sort((a, b) => b.width - a.width)
  return sorted[0]?.url ?? null
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return syncTicketmaster()
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return syncTicketmaster()
}

async function syncTicketmaster() {
  const apiKey = process.env.TICKETMASTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Ticketmaster API key not configured' }, { status: 500 })
  }

  const supabase = createAdminClient()
  let synced = 0
  let skipped = 0

  for (const search of SEARCHES) {
    const params = new URLSearchParams({
      apikey: apiKey,
      keyword: search.keyword,
      city: 'Denver',
      stateCode: 'CO',
      countryCode: 'US',
      size: '20',
      sort: 'date,asc',
    })

    if ('classificationName' in search && search.classificationName) {
      params.set('classificationName', search.classificationName)
    }

    const res = await fetch(`${TM_API}?${params}`)
    if (!res.ok) {
      console.error(`Ticketmaster error for "${search.keyword}": ${res.status}`)
      continue
    }

    const data = await res.json()
    const events: TMEvent[] = data._embedded?.events ?? []

    for (const event of events) {
      // Skip if already imported
      const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('eventbrite_id', `tm_${event.id}`)
        .single()

      if (existing) { skipped++; continue }

      const venue = event._embedded?.venues?.[0]
      const startDatetime = event.dates.start.dateTime
        ?? `${event.dates.start.localDate}T${event.dates.start.localTime ?? '00:00:00'}`
      const priceRange = event.priceRanges?.[0]
      const isFree = !priceRange || priceRange.min === 0
      const slug = slugify(`${event.name}-${event.id.slice(-6)}`)

      const { error } = await supabase.from('events').insert({
        slug,
        title: event.name,
        description: event.description ?? event.info ?? null,
        start_datetime: startDatetime,
        venue_name: venue?.name ?? null,
        address: venue?.address?.line1 ?? null,
        city: venue?.city?.name ?? 'Denver',
        state: venue?.state?.stateCode ?? 'CO',
        is_free: isFree,
        ticket_url: event.url,
        ticket_price_min: isFree ? null : (priceRange?.min ?? null),
        ticket_price_max: isFree ? null : (priceRange?.max ?? null),
        cover_image_url: getBestImage(event.images),
        eventbrite_id: `tm_${event.id}`, // reusing field to track TM events
        status: 'upcoming',
      })

      if (!error) synced++
    }

    await new Promise((r) => setTimeout(r, 200))
  }

  return NextResponse.json({ synced, skipped })
}
