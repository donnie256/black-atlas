import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { submitEvent } from './actions'
import Script from 'next/script'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submit an Event',
  description: "Submit a Denver Black community event for review on Black Atlas Denver.",
  alternates: { canonical: '/events/submit' },
}

const EVENT_CATEGORIES = [
  'Music', 'Art', 'Food & Drink', 'Film', 'Comedy', 'Fashion',
  'Sports', 'Networking', 'Community', 'Faith', 'Education', 'Other',
]

interface PageProps {
  searchParams: Promise<{ error?: string }>
}

const ERRORS: Record<string, string> = {
  invalid: 'Please check the form and try again.',
  challenge: 'Please complete the verification challenge.',
  rate: 'Too many submissions. Try again later.',
  server: 'We could not save this event. Try again later.',
}

export default async function SubmitEventPage({ searchParams }: PageProps) {
  const { error } = await searchParams
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  return (
    <>
      {turnstileSiteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />}
      <Navbar />
      <main className="flex-1 bg-zinc-950 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-white text-3xl font-bold mb-2">Submit an Event</h1>
          <p className="text-zinc-400 text-sm mb-8">
            Got a Black community event in Denver? Submit it and we&apos;ll review it before it goes live.
          </p>

          <form action={submitEvent} className="flex flex-col gap-6">
            {error && ERRORS[error] && (
              <p className="bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-lg px-3 py-2">
                {ERRORS[error]}
              </p>
            )}
            <input
              type="text"
              name="company_website"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />
            <section className="flex flex-col gap-4">
              <h2 className="text-white font-semibold text-sm uppercase tracking-widest border-b border-zinc-800 pb-2">
                Event Details
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm" htmlFor="title">
                  Event name <span className="text-amber-400">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Black Art Market Denver"
                  className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="What's this event about?"
                  className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm" htmlFor="category">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="">Select a category</option>
                  {EVENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 text-sm" htmlFor="date">
                    Date <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    required
                    className="bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 text-sm" htmlFor="time">Time</label>
                  <input
                    id="time"
                    name="time"
                    type="time"
                    className="bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-white font-semibold text-sm uppercase tracking-widest border-b border-zinc-800 pb-2">
                Location
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm" htmlFor="venue_name">Venue name</label>
                <input
                  id="venue_name"
                  name="venue_name"
                  type="text"
                  placeholder="e.g. Cervantes' Masterpiece Ballroom"
                  className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm" htmlFor="address">Address</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="2637 Welton St, Denver, CO"
                  className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-white font-semibold text-sm uppercase tracking-widest border-b border-zinc-800 pb-2">
                Tickets
              </h2>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="is_free"
                    value="true"
                    defaultChecked
                    className="accent-amber-400"
                  />
                  <span className="text-zinc-300 text-sm">Free</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="is_free"
                    value="false"
                    className="accent-amber-400"
                  />
                  <span className="text-zinc-300 text-sm">Paid</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 text-sm" htmlFor="ticket_price">
                    Ticket price ($)
                  </label>
                  <input
                    id="ticket_price"
                    name="ticket_price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 text-sm" htmlFor="ticket_url">
                    Ticket / RSVP link
                  </label>
                  <input
                    id="ticket_url"
                    name="ticket_url"
                    type="url"
                    placeholder="https://eventbrite.com/..."
                    className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </section>

            <button
              type="submit"
              className="bg-amber-400 text-black font-bold py-3 rounded-lg hover:bg-amber-300 transition-colors"
            >
              Submit Event
            </button>

            {turnstileSiteKey && (
              <div className="cf-turnstile self-center" data-sitekey={turnstileSiteKey} />
            )}

            <p className="text-zinc-600 text-xs text-center">
              Events are reviewed before publishing. We reserve the right to remove anything not relevant to Denver&apos;s Black community.
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
