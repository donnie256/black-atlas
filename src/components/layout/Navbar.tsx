'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MapPin } from 'lucide-react'

const NAV_LINKS = [
  { href: '/businesses', label: 'Businesses' },
  { href: '/events', label: 'Events' },
  { href: '/submit', label: 'Submit a Listing' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="bg-black text-white sticky top-0 z-50 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <MapPin className="w-5 h-5 text-amber-400" />
            <span>Black Atlas</span>
            <span className="text-zinc-400 text-sm font-normal">Denver</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm transition-colors',
                  pathname?.startsWith(link.href)
                    ? 'text-amber-400 font-medium'
                    : 'text-zinc-400 hover:text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}
