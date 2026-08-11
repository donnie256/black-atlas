import { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'Privacy policy for Black Atlas Denver.',
}

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-zinc-950 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <h1 className="text-white text-3xl font-bold mb-4">Privacy</h1>
          <div className="space-y-4 text-zinc-400 leading-relaxed">
            <p>
              Black Atlas Denver collects information submitted through listing and event forms so
              admins can review, publish, correct, or reject submissions.
            </p>
            <p>
              The app also uses basic security signals, including hashed request identifiers, to
              reduce spam and abuse. Admin and hosting logs may retain operational metadata.
            </p>
            <p>
              Do not submit private information that should not be reviewed by site admins.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

