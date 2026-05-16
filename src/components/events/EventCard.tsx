'use client'

import Link from 'next/link'
import { MapPin, Ticket } from 'lucide-react'
import { Event } from '@/types'

interface EventCardProps {
  event: Event
}

function getDateParts(datetime: string) {
  const d = new Date(datetime)
  return {
    month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: d.getDate(),
    weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
    time: d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  }
}

export function EventCard({ event }: EventCardProps) {
  const { month, day, weekday, time } = getDateParts(event.start_datetime)

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-amber-400/40 transition-all"
    >
      {/* Date block */}
      <div className="flex flex-col items-center justify-center bg-zinc-800 group-hover:bg-zinc-700 transition-colors px-4 min-w-[72px] shrink-0">
        <span className="text-amber-400 text-xs font-bold tracking-widest">{month}</span>
        <span className="text-white text-3xl font-bold leading-none">{day}</span>
        <span className="text-zinc-500 text-xs mt-0.5">{weekday}</span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-1.5 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">
            {event.title}
          </h3>
        </div>

        {event.category && (
          <span className="text-zinc-500 text-xs">{event.category}</span>
        )}

        <div className="flex flex-col gap-1 mt-auto pt-2 text-zinc-500 text-xs">
          <span>{time}</span>
          {(event.venue_name || event.address) && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue_name ?? event.address ?? '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 truncate hover:text-amber-400 transition-colors"
            >
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{event.venue_name ?? event.address}</span>
            </a>
          )}
          {!event.is_free && event.ticket_url && (
            <span className="flex items-center gap-1 text-amber-400/70">
              <Ticket className="w-3 h-3 shrink-0" />
              Tickets available
            </span>
          )}
        </div>
      </div>

      {/* Cover image strip */}
      {event.cover_image_url && (
        <div className="w-24 shrink-0 hidden sm:block">
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
    </Link>
  )
}
