import { describe, expect, it } from 'vitest'
import { Business, Event } from '@/types'
import { buildBusinessJsonLd, buildEventJsonLd, getBusinessSchemaType } from './seo'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

const baseBusiness: Business = {
  id: 'business-1',
  slug: 'test-business',
  name: 'Test Business',
  description: 'A test business.',
  category: 'retail',
  subcategory: null,
  diaspora_origin: ['african'],
  address: '123 Main St',
  city: 'Denver',
  state: 'CO',
  zip: '80205',
  neighborhood_id: null,
  phone: '3035550100',
  email: null,
  website: 'https://example.com',
  instagram: '@testbusiness',
  facebook: null,
  hours: null,
  cover_image_url: 'https://example.com/cover.jpg',
  logo_url: null,
  status: 'approved',
  is_verified: true,
  is_featured: false,
  source: 'community',
  verified_at: null,
  review_notes: null,
  google_place_id: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
}

const baseEvent: Event = {
  id: 'event-1',
  slug: 'test-event',
  title: 'Test Event',
  description: 'A test event.',
  business_id: 'business-1',
  business: { id: 'business-1', name: 'Test Business', slug: 'test-business' },
  start_datetime: '2026-09-01T18:00:00.000Z',
  end_datetime: '2026-09-01T21:00:00.000Z',
  timezone: 'America/Denver',
  venue_name: 'Test Venue',
  address: '456 Market St',
  city: 'Denver',
  state: 'CO',
  is_free: false,
  ticket_url: 'https://tickets.example.com/test-event',
  ticket_price_min: 10,
  ticket_price_max: 25,
  cover_image_url: 'https://example.com/event.jpg',
  category: 'Music',
  tags: ['concert'],
  eventbrite_id: null,
  status: 'upcoming',
  source: 'community',
  review_notes: null,
  created_at: '2026-01-01T00:00:00.000Z',
}

describe('getBusinessSchemaType', () => {
  it('uses category mappings', () => {
    expect(getBusinessSchemaType({ category: 'restaurant', subcategory: null })).toBe('Restaurant')
    expect(getBusinessSchemaType({ category: 'salon', subcategory: null })).toBe('BeautySalon')
    expect(getBusinessSchemaType({ category: 'fitness', subcategory: null })).toBe('ExerciseGym')
  })

  it('uses specific subcategory overrides before category fallback', () => {
    expect(getBusinessSchemaType({ category: 'retail', subcategory: 'African Market' })).toBe('GroceryStore')
    expect(getBusinessSchemaType({ category: 'retail', subcategory: 'Coffee Shop' })).toBe('CafeOrCoffeeShop')
    expect(getBusinessSchemaType({ category: 'retail', subcategory: 'Bookstore' })).toBe('BookStore')
  })
})

describe('buildBusinessJsonLd', () => {
  it('builds specific business schema with address and identity links', () => {
    const jsonLd = buildBusinessJsonLd({ ...baseBusiness, subcategory: 'African Market' })

    expect(jsonLd['@type']).toBe('GroceryStore')
    expect(jsonLd.name).toBe('Test Business')
    expect(jsonLd.url).toBe(`${siteUrl}/businesses/test-business`)
    expect(jsonLd.address).toMatchObject({
      '@type': 'PostalAddress',
      streetAddress: '123 Main St',
      addressLocality: 'Denver',
      addressRegion: 'CO',
      postalCode: '80205',
    })
    expect(jsonLd.sameAs).toEqual(['https://example.com', 'https://www.instagram.com/testbusiness'])
  })
})

describe('buildEventJsonLd', () => {
  it('builds event schema with organizer, location, and aggregate offer', () => {
    const jsonLd = buildEventJsonLd(baseEvent)

    expect(jsonLd['@type']).toBe('Event')
    expect(jsonLd.name).toBe('Test Event')
    expect(jsonLd.location).toMatchObject({
      '@type': 'Place',
      name: 'Test Venue',
    })
    expect(jsonLd.organizer).toMatchObject({
      '@type': 'Organization',
      name: 'Test Business',
      url: `${siteUrl}/businesses/test-business`,
    })
    expect(jsonLd.offers).toMatchObject({
      '@type': 'AggregateOffer',
      lowPrice: 10,
      highPrice: 25,
    })
  })

  it('does not claim a ticketed event is free when no imported price is present', () => {
    const jsonLd = buildEventJsonLd({
      ...baseEvent,
      is_free: true,
      ticket_price_min: null,
      ticket_price_max: null,
    })

    expect(jsonLd.offers).toMatchObject({
      '@type': 'Offer',
      url: 'https://tickets.example.com/test-event',
    })
    expect(jsonLd.offers).not.toHaveProperty('price')
  })
})
