'use client'

import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface SaveButtonProps {
  businessId: string
  initialSaved: boolean
  userId: string | null
}

export function SaveButton({ businessId, initialSaved, userId }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (!userId) {
      window.location.href = '/login'
      return
    }

    setLoading(true)
    const supabase = createClient()

    if (saved) {
      await supabase
        .from('saved_businesses')
        .delete()
        .eq('user_id', userId)
        .eq('business_id', businessId)
    } else {
      await supabase
        .from('saved_businesses')
        .insert({ user_id: userId, business_id: businessId })
    }

    setSaved(!saved)
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        'flex items-center gap-2 text-sm px-4 py-2 rounded-full border transition-all',
        saved
          ? 'bg-amber-400/10 border-amber-400 text-amber-400'
          : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
      )}
    >
      <Bookmark className={cn('w-4 h-4', saved && 'fill-amber-400')} />
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}
