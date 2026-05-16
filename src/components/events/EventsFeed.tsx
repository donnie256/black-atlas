'use client'

import { useState, useTransition } from 'react'
import { EventCard } from './EventCard'
import { loadMoreEvents } from '@/app/events/actions'
import { Event } from '@/types'

const PAGE_SIZE = 20

interface EventsFeedProps {
  initialEvents: Event[]
  hasMore: boolean
}

export function EventsFeed({ initialEvents, hasMore: initialHasMore }: EventsFeedProps) {
  const [events, setEvents] = useState(initialEvents)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [isPending, startTransition] = useTransition()

  function loadMore() {
    startTransition(async () => {
      const next = await loadMoreEvents(events.length)
      setEvents((prev) => [...prev, ...next])
      setHasMore(next.length === PAGE_SIZE)
    })
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isPending}
            className="px-6 py-2.5 rounded-full text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50"
          >
            {isPending ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </>
  )
}
