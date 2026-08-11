import { createClient } from '@/lib/supabase/server'
import { Business, BusinessCategory, DiasporaOrigin } from '@/types'

interface FetchBusinessesOptions {
  category?: BusinessCategory
  diaspora?: DiasporaOrigin
  query?: string
  limit?: number
  offset?: number
}

export async function fetchBusinesses(opts: FetchBusinessesOptions = {}): Promise<Business[]> {
  const supabase = await createClient()

  let q = supabase
    .from('businesses')
    .select('*, neighborhood:neighborhoods(id, slug, name)')
    .eq('status', 'approved')
    .order('is_featured', { ascending: false })
    .order('name')

  if (opts.category) q = q.eq('category', opts.category)
  if (opts.diaspora) q = q.contains('diaspora_origin', [opts.diaspora])
  if (opts.query) {
    q = q.textSearch('name_description_subcategory', opts.query, {
      type: 'websearch',
      config: 'english',
    })
  }
  if (opts.limit) q = q.limit(opts.limit)
  if (opts.offset) q = q.range(opts.offset, opts.offset + (opts.limit ?? 20) - 1)

  const { data, error } = await q

  if (error) {
    console.error('fetchBusinesses error:', error.message)
    return []
  }

  return data as Business[]
}

export async function fetchBusinessBySlug(slug: string): Promise<Business | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('businesses')
    .select('*, neighborhood:neighborhoods(id, slug, name), images:business_images(*)')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single()

  if (error) return null
  return data as Business
}
