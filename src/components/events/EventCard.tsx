import Link from 'next/link'
import { Calendar, MapPin, Ticket } from 'lucide-react'
import { Event } from '@/types'
import { formatPrice } from '@/lib/utils'

interface EventCardProps {
  event: Event
}

function formatEventDate(datetime: string): string {
  return new Date(datetime).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatEventTime(datetime: string): string {
  return new Date(datetime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function EventCard({ event }: EventCardProps) {
  const date = formatEventDate(event.start_datetime)
  const time = formatEventTime(event.start_datetime)

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-amber-400/40 transition-all"
    >
      {/* Cover */}
      <div className="h-40 bg-zinc-800 relative overflow-hidden">
        {event.cover_image_url ? (
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Calendar className="w-10 h-10 text-zinc-700" />
          </div>
        )}
        {event.is_free && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Free
          </span>
        )}
        {event.category && (
          <span className="absolute top-2 right-2 bg-black/60 text-zinc-300 text-xs px-2 py-0.5 rounded-full">
            {event.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="text-white font-semibold text-base leading-tight group-hover:text-amber-400 transition-colors line-clamp-2">
          {event.title}
        </h3>

        {event.description && (
          <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}

        <div className="flex flex-col gap-1 mt-auto pt-3 border-t border-zinc-800 text-zinc-500 text-xs">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-amber-400 shrink-0" />
            {date} · {time}
          </span>
          {(event.venue_name || event.address) && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              {event.venue_name ?? event.address}
            </span>
          )}
          {!event.is_free && (
            <span className="flex items-center gap-1.5">
              <Ticket className="w-3 h-3 text-amber-400 shrink-0" />
              {formatPrice(event.ticket_price_min, event.ticket_price_max)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
