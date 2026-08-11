import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils'

const TM_API = 'https://app.ticketmaster.com/discovery/v2/events.json'

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

type AppCategory =
  | 'Music' | 'Art' | 'Food & Drink' | 'Film' | 'Comedy'
  | 'Fashion' | 'Sports' | 'Networking' | 'Community' | 'Faith'
  | 'Education' | 'Other'

interface TMClassification {
  segment?: { name: string }
  genre?: { name: string }
  subGenre?: { name: string }
}

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
  classifications?: TMClassification[]
  _embedded?: {
    venues?: {
      name: string
      address?: { line1: string }
      city?: { name: string }
      state?: { stateCode: string }
    }[]
  }
}

function mapCategory(classifications?: TMClassification[]): AppCategory {
  const c = classifications?.[0]
  const segment = c?.segment?.name ?? ''
  const genre = c?.genre?.name ?? ''
  const sub = c?.subGenre?.name ?? ''
  const all = [segment, genre, sub].join(' ').toLowerCase()

  if (/gospel|faith|church|worship|spiritual/.test(all)) return 'Faith'
  if (/comedy|stand.?up|humor/.test(all)) return 'Comedy'
  if (/film|movie|cinema/.test(all)) return 'Film'
  if (/sport|basketball|football|soccer|tennis|boxing|fitness/.test(all)) return 'Sports'
  if (/fashion|style/.test(all)) return 'Fashion'
  if (/food|drink|culinary|dining|tasting/.test(all)) return 'Food & Drink'
  if (/art|exhibit|gallery|visual|museum/.test(all)) return 'Art'
  if (/education|lecture|seminar|workshop|class/.test(all)) return 'Education'
  if (/network|business|conference|summit/.test(all)) return 'Networking'
  if (/community|cultural|festival|juneteenth|african|caribbean/.test(all)) return 'Community'
  if (/music|concert|hip.?hop|r&b|soul|jazz|reggae|afrobeat|rap/.test(all)) return 'Music'

  // Fall back on segment
  if (segment === 'Music') return 'Music'
  if (segment === 'Arts & Theatre') return 'Art'
  if (segment === 'Sports') return 'Sports'
  if (segment === 'Film') return 'Film'

  return 'Other'
}

function getBestImage(images: TMEvent['images']): string | null {
  if (!images?.length) return null
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
      console.error(JSON.stringify({ event: 'ticketmaster_api_error', keyword: search.keyword, status: res.status }))
      continue
    }

    const data = await res.json()
    const events: TMEvent[] = data._embedded?.events ?? []

    for (const event of events) {
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
      const isFree = priceRange ? priceRange.min === 0 : false
      const category = mapCategory(event.classifications)
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
        category,
        eventbrite_id: `tm_${event.id}`,
        source: 'ticketmaster',
        status: 'upcoming',
      })

      if (!error) synced++
      else console.error(JSON.stringify({ event: 'ticketmaster_insert_failed', ticketmasterId: event.id, message: error.message }))
    }

    await new Promise((r) => setTimeout(r, 200))
  }

  return NextResponse.json({ synced, skipped })
}
