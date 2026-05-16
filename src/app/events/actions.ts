'use server'

import { fetchEvents } from '@/lib/events'
import { Event } from '@/types'

export async function loadMoreEvents(offset: number): Promise<Event[]> {
  return fetchEvents({ limit: 20, offset })
}
