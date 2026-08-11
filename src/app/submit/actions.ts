'use server'

import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, isHoneypotEmpty, verifyTurnstile } from '@/lib/security'
import { parseBusinessSubmission } from '@/lib/validation'
import { redirect } from 'next/navigation'

export async function submitBusiness(formData: FormData) {
  if (!isHoneypotEmpty(formData)) redirect('/submit?error=invalid')
  if (!(await verifyTurnstile(formData.get('cf-turnstile-response')))) redirect('/submit?error=challenge')
  if (!(await checkRateLimit('business'))) redirect('/submit?error=rate')

  const supabase = await createClient()
  const parsed = parseBusinessSubmission(formData)

  if (!parsed.ok) {
    console.error(JSON.stringify({ event: 'business_submission_validation_failed', errors: parsed.errors }))
    redirect('/submit?error=invalid')
  }

  const { error } = await supabase.from('submissions').insert({
    ...parsed.value,
    status: 'pending',
    source: 'community',
  })

  if (error) {
    console.error(JSON.stringify({ event: 'business_submission_insert_failed', message: error.message }))
    redirect('/submit?error=server')
  }

  redirect('/submit/thanks')
}
