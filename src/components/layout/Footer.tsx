import Link from 'next/link'
import { BrandLogo } from './BrandLogo'

export function Footer() {
  return (
    <footer className="bg-black text-zinc-500 border-t border-zinc-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <BrandLogo markClassName="h-8 w-8" textClassName="text-lg" />
            <p className="text-sm mt-2 leading-relaxed">
              Connecting Denver&apos;s Black community — African American, African, and Caribbean.
            </p>
          </div>
          <div>
            <p className="text-white text-sm font-medium mb-3">Explore</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/businesses" className="hover:text-white transition-colors">Businesses</Link></li>
              <li><Link href="/events" className="hover:text-white transition-colors">Events</Link></li>
              <li><Link href="/businesses?category=restaurant" className="hover:text-white transition-colors">Restaurants</Link></li>
              <li><Link href="/businesses?category=barbershop" className="hover:text-white transition-colors">Barbershops</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white text-sm font-medium mb-3">Community</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/submit" className="hover:text-white transition-colors">Submit a Business</Link></li>
              <li><Link href="/events/submit" className="hover:text-white transition-colors">Submit an Event</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white text-sm font-medium mb-3">Info</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-zinc-800 mt-8 pt-6 text-xs">
          &copy; {new Date().getFullYear()} Black Atlas. Built for the community.
        </div>
      </div>
    </footer>
  )
}
