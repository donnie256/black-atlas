'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils'
import { redirect } from 'next/navigation'

export async function submitEvent(formData: FormData) {
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const date = formData.get('date') as string
  const time = formData.get('time') as string
  const venue_name = formData.get('venue_name') as string
  const address = formData.get('address') as string
  const is_free = formData.get('is_free') === 'true'
  const ticket_url = formData.get('ticket_url') as string
  const ticket_price = formData.get('ticket_price') as string
  const category = formData.get('category') as string

  if (!title || !date) return

  const start_datetime = time ? `${date}T${time}:00` : `${date}T00:00:00`
  const slug = slugify(`${title}-${Date.now()}`)

  const supabase = createAdminClient()

  await supabase.from('events').insert({
    slug,
    title,
    description: description || null,
    start_datetime,
    venue_name: venue_name || null,
    address: address || null,
    city: 'Denver',
    state: 'CO',
    is_free,
    ticket_url: ticket_url || null,
    ticket_price_min: !is_free && ticket_price ? parseFloat(ticket_price) : null,
    category: category || null,
    status: 'upcoming',
  })

  redirect('/events/submit/thanks')
}
