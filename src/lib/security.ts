import 'server-only'

import { createHash } from 'crypto'
import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const RATE_LIMIT_MAX = 5

export async function getClientIdentifier(): Promise<string> {
  const headerStore = await headers()
  const forwardedFor = headerStore.get('x-forwarded-for')?.split(',')[0]?.trim()
  const realIp = headerStore.get('x-real-ip')?.trim()
  const raw = forwardedFor || realIp || 'unknown'
  return createHash('sha256')
    .update(`${raw}:${process.env.RATE_LIMIT_SALT ?? 'black-atlas-dev'}`)
    .digest('hex')
}

export async function checkRateLimit(formType: 'business' | 'event'): Promise<boolean> {
  const identifierHash = await getClientIdentifier()
  const supabase = createAdminClient()
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()

  const { data: recent, error } = await supabase
    .from('submission_rate_limits')
    .select('id, attempt_count, window_start')
    .eq('identifier_hash', identifierHash)
    .eq('form_type', formType)
    .gte('window_start', windowStart)
    .maybeSingle()

  if (error) {
    console.error(JSON.stringify({ event: 'rate_limit_read_failed', formType, message: error.message }))
    return false
  }

  if (!recent) {
    const { error: insertError } = await supabase.from('submission_rate_limits').insert({
      identifier_hash: identifierHash,
      form_type: formType,
      attempt_count: 1,
      window_start: new Date().toISOString(),
    })
    if (insertError) {
      console.error(JSON.stringify({ event: 'rate_limit_insert_failed', formType, message: insertError.message }))
      return false
    }
    return true
  }

  if (recent.attempt_count >= RATE_LIMIT_MAX) return false

  const { error: updateError } = await supabase
    .from('submission_rate_limits')
    .update({ attempt_count: recent.attempt_count + 1 })
    .eq('id', recent.id)

  if (updateError) {
    console.error(JSON.stringify({ event: 'rate_limit_update_failed', formType, message: updateError.message }))
    return false
  }

  return true
}

export async function verifyTurnstile(token: FormDataEntryValue | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  if (!secret && !siteKey) return true
  if (!secret || typeof token !== 'string' || token.length === 0) return false

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret,
      response: token,
    }),
  })

  if (!response.ok) return false
  const result = (await response.json()) as { success?: boolean }
  return result.success === true
}

export function isHoneypotEmpty(formData: FormData): boolean {
  return !formData.get('company_website')
}
