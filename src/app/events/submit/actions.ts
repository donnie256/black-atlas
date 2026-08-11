'use server'

import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, isHoneypotEmpty, verifyTurnstile } from '@/lib/security'
import { slugify } from '@/lib/utils'
import { parseEventSubmission } from '@/lib/validation'
import { redirect } from 'next/navigation'

export async function submitEvent(formData: FormData) {
  if (!isHoneypotEmpty(formData)) redirect('/events/submit?error=invalid')
  if (!(await verifyTurnstile(formData.get('cf-turnstile-response')))) redirect('/events/submit?error=challenge')
  if (!(await checkRateLimit('event'))) redirect('/events/submit?error=rate')

  const title = typeof formData.get('title') === 'string' ? String(formData.get('title')) : 'event'
  const slug = slugify(`${title}-${Date.now()}`)
  const parsed = parseEventSubmission(formData, slug)

  if (!parsed.ok) {
    console.error(JSON.stringify({ event: 'event_submission_validation_failed', errors: parsed.errors }))
    redirect('/events/submit?error=invalid')
  }

  const supabase = await createClient()
  const { error } = await supabase.from('events').insert({
    ...parsed.value,
    source: 'community',
  })

  if (error) {
    console.error(JSON.stringify({ event: 'event_submission_insert_failed', message: error.message }))
    redirect('/events/submit?error=server')
  }

  redirect('/events/submit/thanks')
}
