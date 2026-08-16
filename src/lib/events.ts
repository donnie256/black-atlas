import { createClient } from '@/lib/supabase/server'
import { Event } from '@/types'

export type DateFilter = 'weekend' | 'week' | 'month' | 'all'

interface FetchEventsOptions {
  limit?: number
  offset?: number
  dateFilter?: DateFilter
  category?: string
}

function getDateRange(filter: DateFilter): { start: string; end?: string } {
  const now = new Date()
  const start = now.toISOString()

  if (filter === 'weekend') {
    const day = now.getDay()
    const daysUntilFri = day <= 5 ? 5 - day : 0
    const fri = new Date(now)
    fri.setDate(now.getDate() + daysUntilFri)
    fri.setHours(0, 0, 0, 0)
    const sun = new Date(fri)
    sun.setDate(fri.getDate() + 2)
    sun.setHours(23, 59, 59, 999)
    return { start: fri.toISOString(), end: sun.toISOString() }
  }

  if (filter === 'week') {
    const end = new Date(now)
    end.setDate(now.getDate() + 7)
    return { start, end: end.toISOString() }
  }

  if (filter === 'month') {
    const end = new Date(now)
    end.setDate(now.getDate() + 30)
    return { start, end: end.toISOString() }
  }

  const end = new Date(now)
  end.setDate(now.getDate() + 60)
  return { start, end: end.toISOString() }
}

export async function fetchEvents(opts: FetchEventsOptions = {}): Promise<Event[]> {
  const supabase = await createClient()
  const { dateFilter = 'all', category } = opts

  const { start, end } = getDateRange(dateFilter)

  let q = supabase
    .from('events')
    .select('*, business:businesses(id, name, slug)')
    .eq('status', 'upcoming')
    .gte('start_datetime', start)
    .order('start_datetime', { ascending: true })

  if (end) q = q.lte('start_datetime', end)
  if (category) q = q.eq('category', category)
  if (opts.offset) q = q.range(opts.offset, opts.offset + (opts.limit ?? 20) - 1)
  else if (opts.limit) q = q.limit(opts.limit)

  const { data, error } = await q

  if (error) {
    console.error('fetchEvents error:', error.message)
    return []
  }

  return data as Event[]
}

export async function fetchEventBySlug(slug: string): Promise<Event | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('events')
    .select('*, business:businesses(id, name, slug)')
    .eq('slug', slug)
    .eq('status', 'upcoming')
    .gte('start_datetime', new Date().toISOString())
    .single()

  if (error) return null
  return data as Event
}

// Groups events into labelled buckets for the date-grouped layout
export function groupEventsByDate(events: Event[]): { label: string; events: Event[] }[] {
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  const tomorrowStart = new Date(todayStart)
  tomorrowStart.setDate(todayStart.getDate() + 1)

  // Find the coming Friday
  const day = now.getDay()
  const daysUntilFri = day <= 5 ? 5 - day : 6
  const weekendStart = new Date(todayStart)
  weekendStart.setDate(todayStart.getDate() + daysUntilFri)
  const weekendEnd = new Date(weekendStart)
  weekendEnd.setDate(weekendStart.getDate() + 2)

  const nextWeekEnd = new Date(todayStart)
  nextWeekEnd.setDate(todayStart.getDate() + 14)

  const groups: { label: string; events: Event[] }[] = [
    { label: 'Today', events: [] },
    { label: 'Tomorrow', events: [] },
    { label: 'This Weekend', events: [] },
    { label: 'Next Week', events: [] },
    { label: 'Coming Up', events: [] },
  ]

  for (const event of events) {
    const d = new Date(event.start_datetime)

    if (d >= todayStart && d < tomorrowStart) {
      groups[0].events.push(event)
    } else if (d >= tomorrowStart && d < weekendStart) {
      groups[1].events.push(event)
    } else if (d >= weekendStart && d <= weekendEnd) {
      groups[2].events.push(event)
    } else if (d > weekendEnd && d <= nextWeekEnd) {
      groups[3].events.push(event)
    } else {
      groups[4].events.push(event)
    }
  }

  return groups.filter((g) => g.events.length > 0)
}
