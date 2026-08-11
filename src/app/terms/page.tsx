import { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Terms',
  description: 'Terms for using Black Atlas Denver.',
}

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-zinc-950 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-white text-3xl font-bold mb-4">Terms</h1>
          <div className="space-y-4 text-zinc-400 leading-relaxed">
            <p>
              Black Atlas Denver is a community directory. Listings and event information may be
              submitted by the public, imported from third-party sources, or edited by admins.
            </p>
            <p>
              Information can change. Confirm hours, prices, event details, ownership, and access
              directly with the business, organizer, or venue before making plans.
            </p>
            <p>
              Submissions may be edited, rejected, archived, or removed at the discretion of site
              admins.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

