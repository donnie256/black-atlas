'use server'

import { fetchEvents } from '@/lib/events'
import { DateFilter } from '@/lib/events'
import { Event } from '@/types'

export async function loadMoreEvents(
  offset: number,
  opts: { dateFilter?: DateFilter; category?: string } = {}
): Promise<Event[]> {
  return fetchEvents({ limit: 20, offset, ...opts })
}
