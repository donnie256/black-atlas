import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils'

const EVENTBRITE_API = 'https://www.eventbriteapi.com/v3'
// Denver bounding box for location-based search
const DENVER_LAT = '39.7392'
const DENVER_LNG = '-104.9903'
const SEARCH_RADIUS = '25mi'

// Keywords that indicate Black/African American/African/Caribbean events
const COMMUNITY_KEYWORDS = [
  'black', 'african american', 'african', 'caribbean', 'afro',
  'juneteenth', 'kwanzaa', 'black history', 'melanin', 'soul',
  'hip hop', 'r&b', 'gospel', 'jerk', 'jollof', 'five points',
]

interface EventbriteEvent {
  id: string
  name: { text: string }
  description: { text: string | null }
  start: { utc: string }
  end: { utc: string }
  url: string
  is_free: boolean
  ticket_availability?: { minimum_ticket_price?: { major_value: string } }
  venue?: {
    name: string
    address: { localized_address_display: string }
    latitude: string
    longitude: string
  }
  logo?: { url: string }
  category_id?: string
}

function isRelevantEvent(event: EventbriteEvent): boolean {
  const text = [
    event.name.text,
    event.description.text ?? '',
  ].join(' ').toLowerCase()

  return COMMUNITY_KEYWORDS.some((kw) => text.includes(kw))
}

export async function POST(req: NextRequest) {
  // Protect the endpoint
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = process.env.EVENTBRITE_PRIVATE_TOKEN
  if (!token) {
    return NextResponse.json({ error: 'Eventbrite token not configured' }, { status: 500 })
  }

  const supabase = createAdminClient()
  let synced = 0
  let skipped = 0
  let page = 1
  let hasMore = true

  while (hasMore) {
    const url = new URL(`${EVENTBRITE_API}/events/search/`)
    url.searchParams.set('location.latitude', DENVER_LAT)
    url.searchParams.set('location.longitude', DENVER_LNG)
    url.searchParams.set('location.within', SEARCH_RADIUS)
    url.searchParams.set('start_date.range_start', new Date().toISOString())
    url.searchParams.set('expand', 'venue,ticket_availability,logo')
    url.searchParams.set('page', String(page))
    url.searchParams.set('page_size', '50')

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Eventbrite API error: ${res.status}` }, { status: 502 })
    }

    const data = await res.json()
    const events: EventbriteEvent[] = data.events ?? []
    hasMore = data.pagination?.has_more_items ?? false
    page++

    for (const event of events) {
      if (!isRelevantEvent(event)) {
        skipped++
        continue
      }

      const slug = slugify(`${event.name.text}-${event.id.slice(-6)}`)
      const price = event.ticket_availability?.minimum_ticket_price?.major_value
        ? parseFloat(event.ticket_availability.minimum_ticket_price.major_value)
        : null

      const { error } = await supabase.from('events').upsert(
        {
          slug,
          title: event.name.text,
          description: event.description.text ?? null,
          start_datetime: event.start.utc,
          end_datetime: event.end.utc,
          venue_name: event.venue?.name ?? null,
          address: event.venue?.address?.localized_address_display ?? null,
          city: 'Denver',
          state: 'CO',
          is_free: event.is_free,
          ticket_url: event.url,
          ticket_price_min: event.is_free ? null : price,
          cover_image_url: event.logo?.url ?? null,
          eventbrite_id: event.id,
          status: 'upcoming',
        },
        { onConflict: 'eventbrite_id' }
      )

      if (!error) synced++
    }

    // Avoid hammering the API
    if (hasMore) await new Promise((r) => setTimeout(r, 200))
  }

  return NextResponse.json({ synced, skipped })
}
