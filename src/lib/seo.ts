import { Business, BusinessCategory, Event } from '@/types'
import { CATEGORY_LABELS, DIASPORA_LABELS } from './utils'

type JsonLdObject = Record<string, unknown>

const DEFAULT_SITE_URL = 'http://localhost:3000'

const BUSINESS_SCHEMA_BY_CATEGORY: Record<BusinessCategory, string> = {
  restaurant: 'Restaurant',
  barbershop: 'HealthAndBeautyBusiness',
  salon: 'BeautySalon',
  thrift: 'Store',
  retail: 'Store',
  health: 'HealthAndBeautyBusiness',
  fitness: 'ExerciseGym',
  entertainment: 'EntertainmentBusiness',
  professional_services: 'ProfessionalService',
  art_culture: 'LocalBusiness',
  faith: 'PlaceOfWorship',
  education: 'EducationalOrganization',
  other: 'LocalBusiness',
}

const SUBCATEGORY_SCHEMA_MATCHES: Array<[RegExp, string]> = [
  [/\b(african market|market|grocery|grocer)\b/i, 'GroceryStore'],
  [/\b(coffee|cafe)\b/i, 'CafeOrCoffeeShop'],
  [/\b(bookstore|books?)\b/i, 'BookStore'],
  [/\b(clothing|apparel|fashion)\b/i, 'ClothingStore'],
  [/\b(beauty|salon)\b/i, 'BeautySalon'],
  [/\b(gym|fitness|training)\b/i, 'ExerciseGym'],
  [/\b(restaurant|food|soul food|ethiopian|caribbean)\b/i, 'Restaurant'],
]

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(/\/+$/, '')
}

export function absoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `${getSiteUrl()}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`
}

export function getBusinessSchemaType(business: Pick<Business, 'category' | 'subcategory'>) {
  const subcategory = business.subcategory?.trim()

  if (subcategory) {
    const match = SUBCATEGORY_SCHEMA_MATCHES.find(([pattern]) => pattern.test(subcategory))
    if (match) return match[1]
  }

  return BUSINESS_SCHEMA_BY_CATEGORY[business.category]
}

function compactJsonLd<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(compactJsonLd).filter((item) => item != null) as T
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => entry != null && (!Array.isArray(entry) || entry.length > 0))
        .map(([key, entry]) => [key, compactJsonLd(entry)])
    ) as T
  }

  return value
}

function buildPostalAddress(item: {
  address: string | null
  city: string
  state: string
  zip?: string | null
}) {
  return compactJsonLd({
    '@type': 'PostalAddress',
    streetAddress: item.address,
    addressLocality: item.city,
    addressRegion: item.state,
    postalCode: item.zip,
    addressCountry: 'US',
  })
}

function normalizeInstagramUrl(instagram: string | null) {
  if (!instagram) return null
  if (/^https?:\/\//i.test(instagram)) return instagram
  return `https://www.instagram.com/${instagram.replace(/^@/, '')}`
}

export function buildBusinessJsonLd(business: Business): JsonLdObject {
  const pageUrl = absoluteUrl(`/businesses/${business.slug}`)
  const sameAs = [business.website, normalizeInstagramUrl(business.instagram), business.facebook].filter(
    Boolean
  ) as string[]

  const keywords = [
    CATEGORY_LABELS[business.category],
    business.subcategory,
    ...(business.diaspora_origin?.map((origin) => DIASPORA_LABELS[origin]) ?? []),
    'Black-owned Denver',
    'Denver Black community',
  ].filter(Boolean)

  return compactJsonLd({
    '@context': 'https://schema.org',
    '@type': getBusinessSchemaType(business),
    '@id': `${pageUrl}#business`,
    name: business.name,
    description: business.description ?? `${business.name} on Black Atlas Denver.`,
    url: pageUrl,
    image: business.cover_image_url ?? business.logo_url,
    telephone: business.phone,
    address: buildPostalAddress(business),
    sameAs,
    isAccessibleForFree: true,
    areaServed: {
      '@type': 'City',
      name: 'Denver',
      addressRegion: 'CO',
      addressCountry: 'US',
    },
    additionalType: business.subcategory,
    keywords: keywords.join(', '),
  })
}

function buildEventLocation(event: Event) {
  if (!event.venue_name && !event.address) return undefined

  return compactJsonLd({
    '@type': 'Place',
    name: event.venue_name ?? `${event.city}, ${event.state}`,
    address: buildPostalAddress({
      address: event.address,
      city: event.city,
      state: event.state,
    }),
  })
}

function buildEventOffers(event: Event) {
  const hasPrice = event.ticket_price_min != null || event.ticket_price_max != null

  if (!event.ticket_url && !hasPrice && !event.is_free) {
    return undefined
  }

  const baseOffer = {
    url: event.ticket_url,
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    validFrom: event.created_at,
  }

  if (event.is_free && !event.ticket_url && !hasPrice) {
    return compactJsonLd({
      '@type': 'Offer',
      ...baseOffer,
      price: 0,
    })
  }

  if (
    hasPrice &&
    event.ticket_price_min != null &&
    event.ticket_price_max != null &&
    event.ticket_price_min !== event.ticket_price_max
  ) {
    return compactJsonLd({
      '@type': 'AggregateOffer',
      ...baseOffer,
      lowPrice: event.ticket_price_min,
      highPrice: event.ticket_price_max,
    })
  }

  return compactJsonLd({
    '@type': 'Offer',
    ...baseOffer,
    price: hasPrice ? (event.ticket_price_min ?? event.ticket_price_max) : undefined,
  })
}

export function buildEventJsonLd(event: Event): JsonLdObject {
  const pageUrl = absoluteUrl(`/events/${event.slug}`)

  return compactJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${pageUrl}#event`,
    name: event.title,
    description: event.description ?? `${event.title} on Black Atlas Denver.`,
    url: pageUrl,
    startDate: event.start_datetime,
    endDate: event.end_datetime,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: event.cover_image_url,
    location: buildEventLocation(event),
    organizer: event.business
      ? {
          '@type': 'Organization',
          name: event.business.name,
          url: absoluteUrl(`/businesses/${event.business.slug}`),
        }
      : {
          '@type': 'Organization',
          name: 'Black Atlas Denver',
          url: getSiteUrl(),
        },
    offers: buildEventOffers(event),
    keywords: [event.category, ...(event.tags ?? []), 'Black Denver events'].filter(Boolean).join(', '),
  })
}
