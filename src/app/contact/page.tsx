import { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact Black Atlas Denver about listings, corrections, and partnerships.',
}

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-zinc-950 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-white text-3xl font-bold mb-4">Contact</h1>
          <div className="space-y-4 text-zinc-400 leading-relaxed">
            <p>
              For corrections, removals, verification requests, or partnership questions, contact
              the Black Atlas Denver team.
            </p>
            <p>
              Add a production contact email or form endpoint before launch.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

