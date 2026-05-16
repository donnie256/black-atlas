import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MapPin, Calendar, Store, Scissors, Utensils, Shirt } from "lucide-react";

const CATEGORY_LINKS = [
  { href: "/businesses?category=restaurant", label: "Restaurants", icon: Utensils },
  { href: "/businesses?category=barbershop", label: "Barbershops", icon: Scissors },
  { href: "/businesses?category=salon", label: "Salons", icon: Store },
  { href: "/businesses?category=thrift", label: "Thrift Stores", icon: Shirt },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-black text-white py-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 text-amber-400 text-sm font-medium mb-4 uppercase tracking-widest">
              <MapPin className="w-4 h-4" />
              Denver, Colorado
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
              Everything Black
              <br />
              <span className="text-amber-400">in Denver</span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto mb-10">
              The definitive guide to Black-owned businesses, restaurants, events, and culture —
              African American, African, and Caribbean.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/businesses"
                className="bg-amber-400 text-black font-semibold px-8 py-3 rounded-full hover:bg-amber-300 transition-colors"
              >
                Explore Businesses
              </Link>
              <Link
                href="/events"
                className="border border-zinc-700 text-white px-8 py-3 rounded-full hover:border-zinc-500 transition-colors"
              >
                Upcoming Events
              </Link>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-zinc-950 py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-white text-2xl font-bold mb-8 text-center">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {CATEGORY_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-400/30 rounded-xl p-6 transition-all group"
                >
                  <Icon className="w-7 h-7 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-white text-sm font-medium">{label}</span>
                </Link>
              ))}
            </div>
            <div className="text-center mt-6">
              <Link href="/businesses" className="text-amber-400 text-sm hover:underline">
                View all categories →
              </Link>
            </div>
          </div>
        </section>

        {/* Events CTA */}
        <section className="bg-zinc-900 py-16 px-4 border-y border-zinc-800">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-amber-400/10 rounded-xl p-3">
                <Calendar className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">What&apos;s happening?</h3>
                <p className="text-zinc-400 text-sm">Events, pop-ups, and community gatherings in Denver</p>
              </div>
            </div>
            <Link
              href="/events"
              className="shrink-0 bg-zinc-800 text-white font-medium px-6 py-3 rounded-full hover:bg-zinc-700 transition-colors"
            >
              See all events
            </Link>
          </div>
        </section>

        {/* Submit CTA */}
        <section className="bg-black py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-white text-2xl font-bold mb-3">Know a business we&apos;re missing?</h2>
            <p className="text-zinc-400 mb-6">
              Help us build the most complete directory of Black-owned businesses in Denver.
            </p>
            <Link
              href="/submit"
              className="inline-block border border-amber-400 text-amber-400 font-semibold px-8 py-3 rounded-full hover:bg-amber-400 hover:text-black transition-all"
            >
              Submit a Business
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
