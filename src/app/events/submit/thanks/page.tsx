import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CheckCircle } from 'lucide-react'

export default function EventThanksPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-zinc-950 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
          <h1 className="text-white text-2xl font-bold mb-2">Event submitted</h1>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            Your event is queued for review. Thanks for keeping the community informed.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/events"
              className="bg-amber-400 text-black font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-amber-300 transition-colors"
            >
              See all events
            </Link>
            <Link
              href="/events/submit"
              className="border border-zinc-700 text-zinc-300 px-6 py-2.5 rounded-full text-sm hover:border-zinc-500 transition-colors"
            >
              Submit another
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
