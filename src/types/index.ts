export type BusinessCategory =
  | 'restaurant'
  | 'barbershop'
  | 'salon'
  | 'thrift'
  | 'retail'
  | 'health'
  | 'fitness'
  | 'entertainment'
  | 'professional_services'
  | 'art_culture'
  | 'faith'
  | 'education'
  | 'other'

export type DiasporaOrigin = 'african_american' | 'african' | 'caribbean' | 'pan_african'

export type ListingStatus = 'pending' | 'approved' | 'rejected' | 'archived'

export type EventStatus = 'pending' | 'upcoming' | 'rejected' | 'cancelled' | 'past'

export type EventCategory =
  | 'Music'
  | 'Art'
  | 'Food & Drink'
  | 'Film'
  | 'Comedy'
  | 'Fashion'
  | 'Sports'
  | 'Networking'
  | 'Community'
  | 'Faith'
  | 'Education'
  | 'Other'

export interface Category {
  id: number
  slug: string
  name: string
  icon: string
  display_order: number
}

export interface Neighborhood {
  id: number
  slug: string
  name: string
}

export interface Business {
  id: string
  slug: string
  name: string
  description: string | null
  category: BusinessCategory
  subcategory: string | null
  diaspora_origin: DiasporaOrigin[] | null
  address: string | null
  city: string
  state: string
  zip: string | null
  neighborhood_id: number | null
  neighborhood?: Neighborhood
  phone: string | null
  email: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  hours: Record<string, string> | null
  cover_image_url: string | null
  logo_url: string | null
  status: ListingStatus
  is_verified: boolean
  is_featured: boolean
  source: string | null
  verified_at: string | null
  review_notes: string | null
  google_place_id: string | null
  created_at: string
  updated_at: string
  // joined
  images?: BusinessImage[]
}

export interface BusinessImage {
  id: string
  business_id: string
  url: string
  alt_text: string | null
  display_order: number
}

export interface Event {
  id: string
  slug: string
  title: string
  description: string | null
  business_id: string | null
  business?: Pick<Business, 'id' | 'name' | 'slug'>
  start_datetime: string
  end_datetime: string | null
  timezone: string
  venue_name: string | null
  address: string | null
  city: string
  state: string
  is_free: boolean
  ticket_url: string | null
  ticket_price_min: number | null
  ticket_price_max: number | null
  cover_image_url: string | null
  category: string | null
  tags: string[] | null
  eventbrite_id: string | null
  status: EventStatus
  source: string | null
  review_notes: string | null
  created_at: string
}

export interface Submission {
  id: string
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
  status: ListingStatus
  source: string | null
  review_notes: string | null
  created_at: string
}

export interface SearchFilters {
  query?: string
  category?: BusinessCategory
  neighborhood?: string
  diaspora_origin?: DiasporaOrigin
  is_free?: boolean
  lat?: number
  lng?: number
  radius_miles?: number
}
