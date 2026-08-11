import Link from 'next/link'
import Image from 'next/image'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { CATEGORY_LABELS } from '@/lib/utils'
import { Business, Event, Submission } from '@/types'
import {
  approveBusiness,
  approveEvent,
  approveSubmission,
  archiveEvent,
  rejectBusiness,
  rejectEvent,
  rejectSubmission,
  verifyBusiness,
} from './actions'
import { signOutAdmin } from './login/actions'
import { CheckCircle, ShieldCheck, XCircle } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ tab?: string; section?: string }>
}

function SubmissionRow({ submission }: { submission: Submission }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-white font-semibold">{submission.name}</p>
          <p className="text-zinc-500 text-sm">{CATEGORY_LABELS[submission.category]}</p>
        </div>
        <span className="text-zinc-600 text-xs shrink-0">
          {new Date(submission.created_at).toLocaleDateString()}
        </span>
      </div>

      {submission.description && (
        <p className="text-zinc-400 text-sm leading-relaxed">{submission.description}</p>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500">
        {submission.address && <span>📍 {submission.address}</span>}
        {submission.phone && <span>📞 {submission.phone}</span>}
        {submission.website && <span>🌐 {submission.website}</span>}
        {submission.instagram && <span>@ {submission.instagram}</span>}
      </div>

      {(submission.submitter_name || submission.submitter_email) && (
        <p className="text-zinc-600 text-xs border-t border-zinc-800 pt-2">
          Submitted by {submission.submitter_name ?? '—'} · {submission.submitter_email ?? '—'}
        </p>
      )}

      {submission.status === 'pending' && (
        <div className="flex gap-2 pt-1">
          <form action={approveSubmission.bind(null, submission.id)}>
            <button type="submit" className="flex items-center gap-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors">
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
          </form>
          <form action={rejectSubmission.bind(null, submission.id)}>
            <button type="submit" className="flex items-center gap-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors">
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </form>
        </div>
      )}

      {submission.status !== 'pending' && (
        <span className={`text-xs font-medium ${submission.status === 'approved' ? 'text-green-400' : 'text-red-400'}`}>
          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
        </span>
      )}
    </div>
  )
}

function BusinessRow({ business }: { business: Business }) {
  const source = business.is_verified
    ? 'Manually verified'
    : business.google_place_id
      ? 'Google import'
      : business.source === 'community'
        ? 'Community submitted'
        : business.source ?? 'Unknown source'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col gap-3">
      {business.cover_image_url && (
        <Image
          src={business.cover_image_url}
          alt={business.name}
          width={900}
          height={360}
          unoptimized
          className="w-full h-40 object-cover"
        />
      )}
      <div className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-white font-semibold">{business.name}</p>
          <p className="text-zinc-500 text-sm">{CATEGORY_LABELS[business.category]}</p>
        </div>
        <span className="text-xs text-zinc-600 shrink-0">{source}</span>
      </div>

      {business.description && (
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">{business.description}</p>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500">
        {business.address && <span>📍 {business.address}</span>}
        {business.phone && <span>📞 {business.phone}</span>}
        {business.website && <span>🌐 {business.website}</span>}
        {business.instagram && <span>@ {business.instagram}</span>}
      </div>

      {business.status === 'pending' && (
        <div className="flex gap-2 pt-1">
          <form action={approveBusiness.bind(null, business.id)}>
            <button type="submit" className="flex items-center gap-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors">
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
          </form>
          <form action={rejectBusiness.bind(null, business.id)}>
            <button type="submit" className="flex items-center gap-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors">
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </form>
        </div>
      )}
      {business.status === 'approved' && !business.is_verified && (
        <form action={verifyBusiness.bind(null, business.id)}>
          <button type="submit" className="flex items-center gap-1.5 bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors">
            <ShieldCheck className="w-4 h-4" /> Mark verified
          </button>
        </form>
      )}
      </div>
    </div>
  )
}

function EventRow({ event }: { event: Event }) {
  const source = event.source === 'ticketmaster'
    ? 'Ticketmaster'
    : event.eventbrite_id?.startsWith('tm_')
      ? 'Ticketmaster'
      : event.eventbrite_id
        ? 'Eventbrite'
        : event.source === 'community'
          ? 'Community submitted'
          : event.source ?? 'Unknown source'

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col gap-3">
      {event.cover_image_url && (
        <Image
          src={event.cover_image_url}
          alt={event.title}
          width={900}
          height={360}
          unoptimized
          className="w-full h-40 object-cover"
        />
      )}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-white font-semibold">{event.title}</p>
            <p className="text-zinc-500 text-sm">
              {new Date(event.start_datetime).toLocaleString()} {event.category ? `· ${event.category}` : ''}
            </p>
          </div>
          <span className="text-xs text-zinc-600 shrink-0">{source}</span>
        </div>

        {event.description && (
          <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2">{event.description}</p>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500">
          {event.venue_name && <span>{event.venue_name}</span>}
          {event.address && <span>{event.address}</span>}
          {event.ticket_url && <span>{event.ticket_url}</span>}
        </div>

        {event.status === 'pending' && (
          <div className="flex gap-2 pt-1">
            <form action={approveEvent.bind(null, event.id)}>
              <button type="submit" className="flex items-center gap-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors">
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
            </form>
            <form action={rejectEvent.bind(null, event.id)}>
              <button type="submit" className="flex items-center gap-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm font-medium px-4 py-1.5 rounded-lg transition-colors">
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </form>
          </div>
        )}

        {event.status === 'upcoming' && (
          <form action={archiveEvent.bind(null, event.id)}>
            <button type="submit" className="text-sm text-zinc-400 hover:text-white underline text-left">
              Archive event
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default async function AdminPage({ searchParams }: PageProps) {
  await requireAdmin()
  const { tab = 'pending', section = 'submissions' } = await searchParams
  const supabase = createAdminClient()

  const [
    { data: submissions },
    { count: pendingSubmissions },
    { data: businesses },
    { count: pendingBusinesses },
    { data: events },
    { count: pendingEvents },
  ] = await Promise.all([
    supabase.from('submissions').select('*').eq('status', tab).order('created_at', { ascending: false }),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('businesses').select('*').eq('status', tab).order('created_at', { ascending: false }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('events').select('*').eq('status', tab === 'approved' ? 'upcoming' : tab).order('created_at', { ascending: false }),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const tabs = ['pending', 'approved', 'rejected']

  return (
    <main className="min-h-screen bg-zinc-950">
      <header className="bg-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <span className="text-white font-semibold text-sm">Black Atlas Admin</span>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/businesses" className="text-zinc-400 hover:text-white transition-colors">Businesses</Link>
          <Link href="/events" className="text-zinc-400 hover:text-white transition-colors">Events</Link>
          <Link href="/" className="text-amber-400 hover:text-amber-300 transition-colors">← Back to site</Link>
          <form action={signOutAdmin}>
            <button className="text-zinc-400 hover:text-white transition-colors">Sign out</button>
          </form>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Section switcher */}
        <div className="flex gap-3 mb-8">
          <a
            href={`/admin?section=submissions&tab=${tab}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              section === 'submissions'
                ? 'bg-amber-400 text-black'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Submissions
            {(pendingSubmissions ?? 0) > 0 && (
              <span className="ml-2 bg-zinc-700 text-zinc-300 text-xs px-1.5 py-0.5 rounded-full">
                {pendingSubmissions}
              </span>
            )}
          </a>
          <a
            href={`/admin?section=businesses&tab=${tab}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              section === 'businesses'
                ? 'bg-amber-400 text-black'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Businesses
            {(pendingBusinesses ?? 0) > 0 && (
              <span className="ml-2 bg-zinc-700 text-zinc-300 text-xs px-1.5 py-0.5 rounded-full">
                {pendingBusinesses}
              </span>
            )}
          </a>
          <a
            href={`/admin?section=events&tab=${tab}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              section === 'events'
                ? 'bg-amber-400 text-black'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            Events
            {(pendingEvents ?? 0) > 0 && (
              <span className="ml-2 bg-zinc-700 text-zinc-300 text-xs px-1.5 py-0.5 rounded-full">
                {pendingEvents}
              </span>
            )}
          </a>
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map((t) => (
            <a
              key={t}
              href={`/admin?section=${section}&tab=${t}`}
              className={`text-sm px-4 py-1.5 rounded-full capitalize transition-colors ${
                tab === t
                  ? 'bg-zinc-100 text-black font-medium'
                  : 'text-zinc-400 hover:text-white border border-zinc-700'
              }`}
            >
              {t}
            </a>
          ))}
        </div>

        {/* Content */}
        {section === 'submissions' ? (
          submissions && submissions.length > 0 ? (
            <div className="flex flex-col gap-4">
              {(submissions as Submission[]).map((s) => (
                <SubmissionRow key={s.id} submission={s} />
              ))}
            </div>
          ) : (
            <p className="text-zinc-600 text-center py-16">No {tab} submissions.</p>
          )
        ) : section === 'businesses' ? (
          businesses && businesses.length > 0 ? (
            <div className="flex flex-col gap-4">
              {(businesses as Business[]).map((b) => (
                <BusinessRow key={b.id} business={b} />
              ))}
            </div>
          ) : (
            <p className="text-zinc-600 text-center py-16">No {tab} businesses.</p>
          )
        ) : (
          events && events.length > 0 ? (
            <div className="flex flex-col gap-4">
              {(events as Event[]).map((event) => (
                <EventRow key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-zinc-600 text-center py-16">No {tab} events.</p>
          )
        )}
      </div>
    </main>
  )
}
