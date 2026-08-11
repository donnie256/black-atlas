'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { BusinessCategory, DiasporaOrigin } from '@/types'
import { CATEGORY_LABELS, DIASPORA_LABELS, cn } from '@/lib/utils'

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [BusinessCategory, string][]
const DIASPORA = Object.entries(DIASPORA_LABELS) as [DiasporaOrigin, string][]

export function BusinessFilters() {
  const router = useRouter()
  const params = useSearchParams()

  const activeCategory = params.get('category') as BusinessCategory | null
  const activeDiaspora = params.get('diaspora') as DiasporaOrigin | null

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString())
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    router.push(`/businesses?${next.toString()}`)
  }

  const toggle = (key: string, value: string, current: string | null) => {
    updateParam(key, current === value ? null : value)
  }

  return (
    <aside className="flex flex-col gap-6">
      {/* Category */}
      <div>
        <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
          Category
        </h3>
        <div className="flex flex-wrap md:flex-col gap-1">
          {CATEGORIES.map(([value, label]) => (
            <button
              key={value}
              onClick={() => toggle('category', value, activeCategory)}
              className={cn(
                'text-left text-sm px-3 py-1.5 rounded-lg transition-colors',
                activeCategory === value
                  ? 'bg-amber-400 text-black font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Diaspora */}
      <div>
        <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">
          Community
        </h3>
        <div className="flex flex-wrap md:flex-col gap-1">
          {DIASPORA.map(([value, label]) => (
            <button
              key={value}
              onClick={() => toggle('diaspora', value, activeDiaspora)}
              className={cn(
                'text-left text-sm px-3 py-1.5 rounded-lg transition-colors',
                activeDiaspora === value
                  ? 'bg-amber-400 text-black font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear */}
      {(activeCategory || activeDiaspora) && (
        <button
          onClick={() => router.push('/businesses')}
          className="text-xs text-zinc-500 hover:text-white underline text-left"
        >
          Clear filters
        </button>
      )}
    </aside>
  )
}
