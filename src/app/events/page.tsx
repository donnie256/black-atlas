import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { EventCard } from '@/components/events/EventCard'
import { fetchEvents } from '@/lib/events'
import Link from 'next/link'
import { Calendar } from 'lucide-react'

export default async function EventsPage() {
  const events = await fetchEvents()

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-zinc-950 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-white text-3xl font-bold mb-1">Events</h1>
              <p className="text-zinc-500 text-sm">
                Upcoming events from Denver&apos;s Black community
              </p>
            </div>
            <Link
              href="/events/submit"
              className="text-sm border border-zinc-700 text-zinc-300 hover:border-amber-400 hover:text-amber-400 px-4 py-2 rounded-full transition-colors"
            >
              + Submit Event
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-24">
              <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-lg">No upcoming events yet.</p>
              <p className="text-zinc-600 text-sm mt-1">
                Check back soon or{' '}
                <Link href="/events/submit" className="text-amber-400 hover:underline">
                  submit one
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
