import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { BusinessCard } from '@/components/business/BusinessCard'
import { BusinessFilters } from '@/components/business/BusinessFilters'
import { fetchBusinesses } from '@/lib/businesses'
import { BusinessCategory, DiasporaOrigin } from '@/types'
import { CATEGORY_LABELS } from '@/lib/utils'

interface PageProps {
  searchParams: Promise<{ category?: string; diaspora?: string; q?: string }>
}

async function BusinessGrid({
  category,
  diaspora,
  query,
}: {
  category?: BusinessCategory
  diaspora?: DiasporaOrigin
  query?: string
}) {
  const businesses = await fetchBusinesses({ category, diaspora, query })

  if (businesses.length === 0) {
    return (
      <div className="text-center py-24 text-zinc-500">
        <p className="text-lg">No businesses found.</p>
        <p className="text-sm mt-1">Try a different filter or submit one that&apos;s missing.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {businesses.map((b) => (
        <BusinessCard key={b.id} business={b} />
      ))}
    </div>
  )
}

export default async function BusinessesPage({ searchParams }: PageProps) {
  const { category, diaspora, q } = await searchParams

  const heading = category
    ? CATEGORY_LABELS[category as BusinessCategory]
    : 'All Businesses'

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-zinc-950 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-white text-3xl font-bold mb-2">{heading}</h1>
          <p className="text-zinc-500 text-sm mb-8">
            Black-owned businesses in Denver — African American, African, and Caribbean
          </p>

          {/* Search */}
          <form className="mb-8">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search businesses..."
              className="w-full max-w-md bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400"
            />
          </form>

          <div className="flex gap-10">
            {/* Filters sidebar */}
            <div className="hidden md:block w-48 shrink-0">
              <Suspense>
                <BusinessFilters />
              </Suspense>
            </div>

            {/* Grid */}
            <div className="flex-1 min-w-0">
              <Suspense
                fallback={
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-64 bg-zinc-800 rounded-xl animate-pulse" />
                    ))}
                  </div>
                }
              >
                <BusinessGrid
                  category={category as BusinessCategory | undefined}
                  diaspora={diaspora as DiasporaOrigin | undefined}
                  query={q}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
