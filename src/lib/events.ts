import { createClient } from '@/lib/supabase/server'
import { Event } from '@/types'

export async function fetchEvents(opts: { limit?: number } = {}): Promise<Event[]> {
  const supabase = await createClient()

  let q = supabase
    .from('events')
    .select('*, business:businesses(id, name, slug)')
    .eq('status', 'upcoming')
    .gte('start_datetime', new Date().toISOString())
    .order('start_datetime', { ascending: true })

  if (opts.limit) q = q.limit(opts.limit)

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
    .single()

  if (error) return null
  return data as Event
}
