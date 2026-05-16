import { Suspense } from 'react'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { EventsFeed } from '@/components/events/EventsFeed'
import { fetchEvents } from '@/lib/events'

export const dynamic = 'force-dynamic'

const PAGE_SIZE = 20

async function EventsList() {
  const events = await fetchEvents({ limit: PAGE_SIZE })

  if (events.length === 0) {
    return (
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
    )
  }

  return <EventsFeed initialEvents={events} hasMore={events.length === PAGE_SIZE} />
}

function EventsSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-24 bg-zinc-900 border border-zinc-800 rounded-xl animate-pulse" />
      ))}
    </div>
  )
}

export default function EventsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-zinc-950 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-start justify-between mb-8 gap-4">
            <div>
              <h1 className="text-white text-3xl font-bold mb-1">Events</h1>
              <p className="text-zinc-500 text-sm">
                Upcoming events from Denver&apos;s Black community
              </p>
            </div>
            <Link
              href="/events/submit"
              className="shrink-0 bg-amber-400 text-black font-semibold text-sm px-4 py-2 rounded-full hover:bg-amber-300 transition-colors"
            >
              + Submit Event
            </Link>
          </div>

          <Suspense fallback={<EventsSkeleton />}>
            <EventsList />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
