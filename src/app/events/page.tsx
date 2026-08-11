import { Suspense } from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { EventsFeed } from '@/components/events/EventsFeed'
import { DateFilter, fetchEvents } from '@/lib/events'
import { EVENT_CATEGORIES } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Events',
  description: "Upcoming events from Denver's Black community.",
  alternates: { canonical: '/events' },
}

const PAGE_SIZE = 20

interface PageProps {
  searchParams: Promise<{ date?: DateFilter; category?: string }>
}

const DATE_FILTERS: { value: DateFilter; label: string }[] = [
  { value: 'all', label: 'Next 60 days' },
  { value: 'weekend', label: 'This weekend' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
]

function filterHref(dateFilter: DateFilter, category?: string | null) {
  const params = new URLSearchParams()
  if (dateFilter !== 'all') params.set('date', dateFilter)
  if (category) params.set('category', category)
  const qs = params.toString()
  return qs ? `/events?${qs}` : '/events'
}

async function EventsList({ dateFilter, category }: { dateFilter: DateFilter; category?: string }) {
  const events = await fetchEvents({ limit: PAGE_SIZE, dateFilter, category })

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

  return <EventsFeed initialEvents={events} hasMore={events.length === PAGE_SIZE} dateFilter={dateFilter} category={category} />
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

export default async function EventsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const dateFilter = DATE_FILTERS.some((filter) => filter.value === params.date) ? params.date! : 'all'
  const category = EVENT_CATEGORIES.includes(params.category as never) ? params.category : undefined

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

          <div className="mb-8 flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {DATE_FILTERS.map((filter) => (
                <Link
                  key={filter.value}
                  href={filterHref(filter.value, category)}
                  className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                    dateFilter === filter.value
                      ? 'bg-amber-400 text-black font-medium'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {filter.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={filterHref(dateFilter)}
                className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                  !category
                    ? 'bg-zinc-100 text-black font-medium'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                All
              </Link>
              {EVENT_CATEGORIES.map((c) => (
                <Link
                  key={c}
                  href={filterHref(dateFilter, c)}
                  className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                    category === c
                      ? 'bg-zinc-100 text-black font-medium'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          <Suspense fallback={<EventsSkeleton />}>
            <EventsList dateFilter={dateFilter} category={category} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  )
}
