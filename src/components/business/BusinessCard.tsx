import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Globe, Link2, BadgeCheck } from 'lucide-react'
import { Business } from '@/types'
import { CATEGORY_LABELS, DIASPORA_LABELS } from '@/lib/utils'

interface BusinessCardProps {
  business: Business
}

export function BusinessCard({ business }: BusinessCardProps) {
  const sourceLabel = business.is_verified
    ? 'Verified'
    : business.google_place_id
      ? 'Google import'
      : business.source === 'community'
        ? 'Community submitted'
        : null

  return (
    <Link
      href={`/businesses/${business.slug}`}
      className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-amber-400/40 transition-all"
    >
      {/* Cover image */}
      <div className="h-40 bg-zinc-800 relative overflow-hidden">
        {business.cover_image_url ? (
          <Image
            src={business.cover_image_url}
            alt={business.name}
            width={640}
            height={360}
            unoptimized
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-sm">
            No photo yet
          </div>
        )}
        {business.is_featured && (
          <span className="absolute top-2 left-2 bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
        {sourceLabel && (
          <span className="absolute bottom-2 left-2 bg-black/75 text-zinc-200 text-[11px] font-medium px-2 py-0.5 rounded-full">
            {sourceLabel}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-white font-semibold text-base leading-tight group-hover:text-amber-400 transition-colors">
                {business.name}
              </h3>
              {business.is_verified && (
                <BadgeCheck className="w-4 h-4 text-amber-400 shrink-0" />
              )}
            </div>
            <p className="text-zinc-500 text-xs mt-0.5">
              {CATEGORY_LABELS[business.category]}
              {business.subcategory && ` · ${business.subcategory}`}
            </p>
          </div>
        </div>

        {/* Diaspora tags */}
        {business.diaspora_origin && business.diaspora_origin.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {business.diaspora_origin.map((origin) => (
              <span
                key={origin}
                className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700"
              >
                {DIASPORA_LABELS[origin]}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        {business.description && (
          <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed">
            {business.description}
          </p>
        )}

        {/* Footer meta */}
        <div className="flex items-center gap-3 mt-auto pt-2 border-t border-zinc-800 text-zinc-500 text-xs">
          {business.address && (
            <span className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              {business.neighborhood?.name ?? business.city}
            </span>
          )}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {business.phone && <Phone className="w-3 h-3" />}
            {business.website && <Globe className="w-3 h-3" />}
            {business.instagram && <Link2 className="w-3 h-3" />}
          </div>
        </div>
      </div>
    </Link>
  )
}
