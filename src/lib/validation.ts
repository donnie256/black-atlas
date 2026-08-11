import { BusinessCategory, EventCategory } from '@/types'

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] }

export const BUSINESS_CATEGORIES: BusinessCategory[] = [
  'restaurant',
  'barbershop',
  'salon',
  'thrift',
  'retail',
  'health',
  'fitness',
  'entertainment',
  'professional_services',
  'art_culture',
  'faith',
  'education',
  'other',
]

export const EVENT_CATEGORIES: EventCategory[] = [
  'Music',
  'Art',
  'Food & Drink',
  'Film',
  'Comedy',
  'Fashion',
  'Sports',
  'Networking',
  'Community',
  'Faith',
  'Education',
  'Other',
]

export interface BusinessSubmissionInput {
  name: string
  category: BusinessCategory
  address: string | null
  phone: string | null
  website: string | null
  instagram: string | null
  description: string | null
  submitter_name: string | null
  submitter_email: string | null
  notes: string | null
}

export interface EventSubmissionInput {
  slug: string
  title: string
  description: string | null
  start_datetime: string
  venue_name: string | null
  address: string | null
  city: string
  state: string
  is_free: boolean
  ticket_url: string | null
  ticket_price_min: number | null
  category: EventCategory | null
  status: 'pending'
}

function clean(value: FormDataEntryValue | null, max: number): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().replace(/\s+/g, ' ')
  if (!trimmed) return null
  return trimmed.slice(0, max)
}

function normalizeUrl(value: string | null): string | null {
  if (!value) return null
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`
  try {
    const url = new URL(withScheme)
    if (!['http:', 'https:'].includes(url.protocol)) return null
    return url.toString()
  } catch {
    return null
  }
}

function normalizeInstagram(value: string | null): string | null {
  if (!value) return null
  const handle = value.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').split(/[/?#]/)[0]
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(handle)) return null
  return handle
}

function normalizeEmail(value: string | null): string | null {
  if (!value) return null
  const email = value.toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return null
  return email
}

function normalizePhone(value: string | null): string | null {
  if (!value) return null
  const digits = value.replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 15) return null
  return digits
}

export function parseBusinessSubmission(formData: FormData): ValidationResult<BusinessSubmissionInput> {
  const errors: string[] = []
  const name = clean(formData.get('name'), 120)
  const category = clean(formData.get('category'), 60) as BusinessCategory | null
  const websiteInput = clean(formData.get('website'), 250)
  const instagramInput = clean(formData.get('instagram'), 80)
  const emailInput = clean(formData.get('submitter_email'), 254)
  const phoneInput = clean(formData.get('phone'), 40)

  if (!name || name.length < 2) errors.push('Business name is required.')
  if (!category || !BUSINESS_CATEGORIES.includes(category)) errors.push('Choose a valid category.')

  const website = normalizeUrl(websiteInput)
  if (websiteInput && !website) errors.push('Enter a valid website URL.')

  const instagram = normalizeInstagram(instagramInput)
  if (instagramInput && !instagram) errors.push('Enter a valid Instagram handle.')

  const submitter_email = normalizeEmail(emailInput)
  if (emailInput && !submitter_email) errors.push('Enter a valid email address.')

  const phone = normalizePhone(phoneInput)
  if (phoneInput && !phone) errors.push('Enter a valid phone number.')

  if (errors.length || !name || !category) return { ok: false, errors }

  return {
    ok: true,
    value: {
      name,
      category,
      address: clean(formData.get('address'), 180),
      phone,
      website,
      instagram,
      description: clean(formData.get('description'), 800),
      submitter_name: clean(formData.get('submitter_name'), 120),
      submitter_email,
      notes: clean(formData.get('notes'), 800),
    },
  }
}

export function parseEventSubmission(formData: FormData, slug: string): ValidationResult<EventSubmissionInput> {
  const errors: string[] = []
  const title = clean(formData.get('title'), 140)
  const date = clean(formData.get('date'), 20)
  const time = clean(formData.get('time'), 20)
  const category = clean(formData.get('category'), 60) as EventCategory | null
  const ticketUrlInput = clean(formData.get('ticket_url'), 250)
  const isFree = formData.get('is_free') !== 'false'
  const ticketPriceInput = clean(formData.get('ticket_price'), 20)

  if (!title || title.length < 3) errors.push('Event name is required.')
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) errors.push('Choose a valid event date.')
  if (time && !/^\d{2}:\d{2}$/.test(time)) errors.push('Choose a valid event time.')
  if (category && !EVENT_CATEGORIES.includes(category)) errors.push('Choose a valid event category.')

  const ticket_url = normalizeUrl(ticketUrlInput)
  if (ticketUrlInput && !ticket_url) errors.push('Enter a valid ticket or RSVP URL.')

  const price = ticketPriceInput ? Number(ticketPriceInput) : null
  if (!isFree && (price === null || !Number.isFinite(price) || price < 0 || price > 99999)) {
    errors.push('Enter a valid ticket price.')
  }

  const start = date ? new Date(`${date}T${time || '00:00'}:00`) : null
  if (!start || Number.isNaN(start.getTime())) errors.push('Choose a valid event date and time.')
  if (start && start.getTime() < Date.now() - 24 * 60 * 60 * 1000) errors.push('Event date must be in the future.')

  if (errors.length || !title || !start) return { ok: false, errors }

  return {
    ok: true,
    value: {
      slug,
      title,
      description: clean(formData.get('description'), 2000),
      start_datetime: start.toISOString(),
      venue_name: clean(formData.get('venue_name'), 160),
      address: clean(formData.get('address'), 180),
      city: 'Denver',
      state: 'CO',
      is_free: isFree,
      ticket_url,
      ticket_price_min: isFree ? null : price,
      category,
      status: 'pending',
    },
  }
}

