import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { submitBusiness } from './actions'
import { CATEGORY_LABELS } from '@/lib/utils'
import { BusinessCategory } from '@/types'
import Script from 'next/script'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Submit a Business',
  description: 'Submit a Black-owned Denver business for review on Black Atlas Denver.',
  alternates: { canonical: '/submit' },
}

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [BusinessCategory, string][]

interface PageProps {
  searchParams: Promise<{ error?: string }>
}

const ERRORS: Record<string, string> = {
  invalid: 'Please check the form and try again.',
  challenge: 'Please complete the verification challenge.',
  rate: 'Too many submissions. Try again later.',
  server: 'We could not save this submission. Try again later.',
}

export default async function SubmitPage({ searchParams }: PageProps) {
  const { error } = await searchParams
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  return (
    <>
      {turnstileSiteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />}
      <Navbar />
      <main className="flex-1 bg-zinc-950 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-white text-3xl font-bold mb-2">Submit a Business</h1>
          <p className="text-zinc-400 text-sm mb-8">
            Know a Black-owned business in Denver we&apos;re missing? Submit it and we&apos;ll review it within a few days.
          </p>

          <form action={submitBusiness} className="flex flex-col gap-6">
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
            {/* Business info */}
            <section className="flex flex-col gap-4">
              <h2 className="text-white font-semibold text-sm uppercase tracking-widest border-b border-zinc-800 pb-2">
                Business Info
              </h2>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm" htmlFor="name">
                  Business name <span className="text-amber-400">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Soul Kitchen Denver"
                  className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm" htmlFor="category">
                  Category <span className="text-amber-400">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  className="bg-zinc-900 border border-zinc-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="What makes this business special?"
                  className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm" htmlFor="address">
                  Address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="123 Welton St, Denver, CO"
                  className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 text-sm" htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(720) 555-0100"
                    className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 text-sm" htmlFor="instagram">Instagram</label>
                  <input
                    id="instagram"
                    name="instagram"
                    type="text"
                    placeholder="@handle"
                    className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm" htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://example.com"
                  className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>
            </section>

            {/* Submitter info */}
            <section className="flex flex-col gap-4">
              <h2 className="text-white font-semibold text-sm uppercase tracking-widest border-b border-zinc-800 pb-2">
                Your Info
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 text-sm" htmlFor="submitter_name">Your name</label>
                  <input
                    id="submitter_name"
                    name="submitter_name"
                    type="text"
                    placeholder="First Last"
                    className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-zinc-400 text-sm" htmlFor="submitter_email">Your email</label>
                  <input
                    id="submitter_email"
                    name="submitter_email"
                    type="email"
                    placeholder="you@example.com"
                    className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-sm" htmlFor="notes">
                  Anything else we should know?
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={2}
                  placeholder="e.g. I'm the owner, or I'm a regular customer"
                  className="bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>
            </section>

            <button
              type="submit"
              className="bg-amber-400 text-black font-bold py-3 rounded-lg hover:bg-amber-300 transition-colors"
            >
              Submit Business
            </button>

            {turnstileSiteKey && (
              <div className="cf-turnstile self-center" data-sitekey={turnstileSiteKey} />
            )}

            <p className="text-zinc-600 text-xs text-center">
              All submissions are reviewed before going live. We&apos;ll reach out if we have questions.
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  )
}
