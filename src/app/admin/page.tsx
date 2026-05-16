import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { CATEGORY_LABELS } from '@/lib/utils'
import { Business, Submission } from '@/types'
import { approveSubmission, rejectSubmission, approveBusiness, rejectBusiness } from './actions'
import { CheckCircle, XCircle } from 'lucide-react'

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
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col gap-3">
      {business.cover_image_url && (
        <img
          src={business.cover_image_url}
          alt={business.name}
          className="w-full h-40 object-cover"
        />
      )}
      <div className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-white font-semibold">{business.name}</p>
          <p className="text-zinc-500 text-sm">{CATEGORY_LABELS[business.category]}</p>
        </div>
        {business.google_place_id && (
          <span className="text-xs text-zinc-600 shrink-0">via Google Places</span>
        )}
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
      </div>
    </div>
  )
}

export default async function AdminPage({ searchParams }: PageProps) {
  const { tab = 'pending', section = 'submissions' } = await searchParams
  const supabase = createAdminClient()

  const [
    { data: submissions },
    { count: pendingSubmissions },
    { data: businesses },
    { count: pendingBusinesses },
  ] = await Promise.all([
    supabase.from('submissions').select('*').eq('status', tab).order('created_at', { ascending: false }),
    supabase.from('submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('businesses').select('*').eq('status', tab).order('created_at', { ascending: false }),
    supabase.from('businesses').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
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
        ) : (
          businesses && businesses.length > 0 ? (
            <div className="flex flex-col gap-4">
              {(businesses as Business[]).map((b) => (
                <BusinessRow key={b.id} business={b} />
              ))}
            </div>
          ) : (
            <p className="text-zinc-600 text-center py-16">No {tab} businesses.</p>
          )
        )}
      </div>
    </main>
  )
}
