import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/NavbarServer'
import { Footer } from '@/components/layout/Footer'
import { fetchEventBySlug } from '@/lib/events'
import { formatPrice } from '@/lib/utils'
import { Calendar, MapPin, Ticket, ArrowLeft, Link2, ExternalLink } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

function formatFullDate(datetime: string): string {
  return new Date(datetime).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(datetime: string): string {
  return new Date(datetime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

export default async function EventPage({ params }: PageProps) {
  const { slug } = await params
  const event = await fetchEventBySlug(slug)

  if (!event) notFound()

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-zinc-950 min-h-screen">
        {/* Cover */}
        <div className="h-56 sm:h-72 bg-zinc-800 relative">
          {event.cover_image_url && (
            <img
              src={event.cover_image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative pb-16">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to events
          </Link>

          <div className="flex flex-wrap gap-2 mb-3">
            {event.is_free && (
              <span className="bg-green-500/20 text-green-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Free
              </span>
            )}
            {event.category && (
              <span className="bg-zinc-800 text-zinc-400 text-xs px-2.5 py-0.5 rounded-full">
                {event.category}
              </span>
            )}
            {event.tags?.map((tag) => (
              <span key={tag} className="bg-zinc-800 text-zinc-500 text-xs px-2.5 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-white text-3xl sm:text-4xl font-bold mb-6 leading-tight">
            {event.title}
          </h1>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Main */}
            <div className="md:col-span-2">
              {event.description && (
                <section>
                  <h2 className="text-white font-semibold mb-3">About this event</h2>
                  <p className="text-zinc-400 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </section>
              )}

              {event.business && (
                <div className="mt-6 pt-6 border-t border-zinc-800">
                  <p className="text-zinc-500 text-sm">Hosted by</p>
                  <Link
                    href={`/businesses/${event.business.slug}`}
                    className="text-amber-400 hover:underline font-medium"
                  >
                    {event.business.name}
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="flex flex-col gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4">
                {/* Date & time */}
                <div className="flex gap-3">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-zinc-300">
                    <p>{formatFullDate(event.start_datetime)}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {formatTime(event.start_datetime)}
                      {event.end_datetime && ` – ${formatTime(event.end_datetime)}`}
                    </p>
                  </div>
                </div>

                {/* Location */}
                {(event.venue_name || event.address) && (
                  <div className="flex gap-3">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-zinc-300">
                      {event.venue_name && <p>{event.venue_name}</p>}
                      {event.address && <p className="text-zinc-500 text-xs mt-0.5">{event.address}, {event.city}</p>}
                    </div>
                  </div>
                )}

                {/* Price */}
                <div className="flex gap-3">
                  <Ticket className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-300">
                    {event.is_free ? 'Free' : formatPrice(event.ticket_price_min, event.ticket_price_max)}
                  </span>
                </div>

                {/* Eventbrite link */}
                {event.ticket_url && (
                  <a
                    href={event.ticket_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-amber-400 text-black font-semibold text-sm py-2.5 rounded-lg hover:bg-amber-300 transition-colors"
                  >
                    Get tickets
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {event.eventbrite_id && (
                  <div className="flex gap-2 items-center text-zinc-600 text-xs">
                    <Link2 className="w-3 h-3" />
                    Via Eventbrite
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
