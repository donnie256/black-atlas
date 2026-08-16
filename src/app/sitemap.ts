import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { absoluteUrl } from '@/lib/seo'

const STATIC_ROUTES = [
  '',
  '/businesses',
  '/events',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/submit',
  '/events/submit',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const [{ data: businesses }, { data: events }] = await Promise.all([
    supabase
      .from('businesses')
      .select('slug, updated_at')
      .eq('status', 'approved')
      .order('updated_at', { ascending: false })
      .limit(5000),
    supabase
      .from('events')
      .select('slug, updated_at, start_datetime')
      .eq('status', 'upcoming')
      .gte('start_datetime', now)
      .order('start_datetime', { ascending: true })
      .limit(5000),
  ])

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: absoluteUrl(route || '/'),
    lastModified: new Date(),
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.7,
  }))

  const businessEntries: MetadataRoute.Sitemap = (businesses ?? []).map((business) => ({
    url: absoluteUrl(`/businesses/${business.slug}`),
    lastModified: business.updated_at ? new Date(business.updated_at) : undefined,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const eventEntries: MetadataRoute.Sitemap = (events ?? []).map((event) => ({
    url: absoluteUrl(`/events/${event.slug}`),
    lastModified: event.updated_at ? new Date(event.updated_at) : new Date(event.start_datetime),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  return [...staticEntries, ...businessEntries, ...eventEntries]
}
