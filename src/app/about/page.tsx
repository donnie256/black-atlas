import { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Black Atlas Denver and its community directory mission.',
}

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-zinc-950 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-white text-3xl font-bold mb-4">About Black Atlas Denver</h1>
          <div className="space-y-4 text-zinc-400 leading-relaxed">
            <p>
              Black Atlas Denver helps residents and visitors discover Black-owned businesses,
              events, restaurants, services, and cultural spaces across the Denver area.
            </p>
            <p>
              Listings may be community submitted, imported from public data sources, or manually
              verified by an admin. Verified badges are reserved for businesses that have been
              manually confirmed.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

