import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { fetchBusinessBySlug } from '@/lib/businesses'
import { CATEGORY_LABELS, DIASPORA_LABELS, formatPhone } from '@/lib/utils'
import { MapPin, Phone, Globe, BadgeCheck, ArrowLeft, Clock, Link2 } from 'lucide-react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const business = await fetchBusinessBySlug(slug)
  if (!business) return { title: 'Business not found' }

  return {
    title: business.name,
    description: business.description ?? `${business.name} on Black Atlas Denver.`,
    alternates: { canonical: `/businesses/${business.slug}` },
    openGraph: {
      title: business.name,
      description: business.description ?? `${business.name} on Black Atlas Denver.`,
      images: business.cover_image_url ? [business.cover_image_url] : undefined,
    },
  }
}

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday',
  thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}

export default async function BusinessPage({ params }: PageProps) {
  const { slug } = await params
  const business = await fetchBusinessBySlug(slug)

  if (!business) notFound()
  const sourceLabel = business.is_verified
    ? 'Manually verified'
    : business.google_place_id
      ? 'Google import, reviewed before publishing'
      : business.source === 'community'
        ? 'Community submitted, reviewed before publishing'
        : null

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-zinc-950 min-h-screen">
        {/* Cover */}
        <div className="h-56 sm:h-72 bg-zinc-800 relative">
          {business.cover_image_url && (
            <Image
              src={business.cover_image_url}
              alt={business.name}
              width={1600}
              height={640}
              unoptimized
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative pb-16">
          {/* Back */}
          <Link
            href="/businesses"
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to businesses
          </Link>

          <div className="flex items-start gap-4 mb-6">
            {/* Logo */}
            {business.logo_url && (
              <Image
                src={business.logo_url}
                alt={`${business.name} logo`}
                width={64}
                height={64}
                unoptimized
                className="w-16 h-16 rounded-xl object-cover border-2 border-zinc-700 shrink-0"
              />
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-white text-3xl font-bold">{business.name}</h1>
                {business.is_verified && (
                  <BadgeCheck className="w-6 h-6 text-amber-400" />
                )}
                {business.is_featured && (
                  <span className="bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                    Featured
                  </span>
                )}
              </div>
              {sourceLabel && (
                <p className="text-zinc-500 text-xs mt-2">{sourceLabel}</p>
              )}
              <p className="text-zinc-400 mt-1">
                {CATEGORY_LABELS[business.category]}
                {business.subcategory && ` · ${business.subcategory}`}
              </p>
              {business.diaspora_origin && business.diaspora_origin.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {business.diaspora_origin.map((o) => (
                    <span key={o} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700">
                      {DIASPORA_LABELS[o]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Main */}
            <div className="md:col-span-2 flex flex-col gap-6">
              {business.description && (
                <section>
                  <h2 className="text-white font-semibold mb-2">About</h2>
                  <p className="text-zinc-400 leading-relaxed">{business.description}</p>
                </section>
              )}

              {/* Hours */}
              {business.hours && (
                <section>
                  <h2 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Hours
                  </h2>
                  <div className="flex flex-col gap-1.5">
                    {DAYS.map((day) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-zinc-500 w-24">{DAY_LABELS[day]}</span>
                        <span className="text-zinc-300">
                          {(business.hours as Record<string, string>)[day] ?? 'Closed'}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Photo gallery */}
              {business.images && business.images.length > 0 && (
                <section>
                  <h2 className="text-white font-semibold mb-3">Photos</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {business.images.map((img) => (
                      <Image
                        key={img.id}
                        src={img.url}
                        alt={img.alt_text ?? business.name}
                        width={360}
                        height={240}
                        unoptimized
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="flex flex-col gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4">
                {business.address && (
                  <div className="flex gap-3">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-sm text-zinc-300">
                      <p>{business.address}</p>
                      <p>{business.city}, {business.state} {business.zip}</p>
                      {business.neighborhood && (
                        <p className="text-zinc-500 text-xs mt-0.5">{business.neighborhood.name}</p>
                      )}
                    </div>
                  </div>
                )}

                {business.phone && (
                  <a href={`tel:${business.phone}`} className="flex gap-3 group">
                    <Phone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                      {formatPhone(business.phone)}
                    </span>
                  </a>
                )}

                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex gap-3 group">
                    <Globe className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors truncate">
                      {business.website.replace(/^https?:\/\//, '')}
                    </span>
                  </a>
                )}

                {business.instagram && (
                  <a
                    href={`https://instagram.com/${business.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 group"
                  >
                    <Link2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                      Instagram · @{business.instagram.replace('@', '')}
                    </span>
                  </a>
                )}

                {business.facebook && (
                  <a href={business.facebook} target="_blank" rel="noopener noreferrer" className="flex gap-3 group">
                    <Link2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">Facebook</span>
                  </a>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
