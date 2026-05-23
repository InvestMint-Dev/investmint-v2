import { useQuery } from '@tanstack/react-query'
import { bankingApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { AdvisoryActivity } from '../../types'
import { Calendar, MessageSquare, CheckCircle2, ChevronRight, Building, Clock } from 'lucide-react'

const ADVISORS = [
  {
    name: 'Michael Chen',
    title: 'Senior Advisor',
    bank: 'Former VP, RBC Capital Markets',
    expertise: ['Fixed Income', 'Cash Management', 'Risk Frameworks'],
    bio: '18 years of institutional cash management and fixed income at RBC. Led the corporate treasury advisory practice for mid-market clients.',
  },
  {
    name: 'Sarah MacLeod',
    title: 'Lead Advisor',
    bank: 'Former Director, TD Securities',
    expertise: ['ALM Strategy', 'FX Risk', 'Liability Management'],
    bio: '14 years structuring asset-liability matching strategies for Canadian corporations at TD Securities. Specialist in FX risk and currency hedging.',
  },
]

export default function AdvisoryPage() {
  const { userId } = useAuth()

  const { data: activities, isLoading } = useQuery<AdvisoryActivity[]>({
    queryKey: ['advisoryActivity', userId],
    queryFn: async () => {
      const res = await bankingApi.get(`/api/advisoryActivity/${userId}`)
      return res.data.data || []
    },
    enabled: !!userId,
  })

  const nextReview = activities?.find((a) => a.status === 'scheduled')
  const lastReview = activities?.find((a) => a.status === 'complete' && a.type === 'Review')

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Human Layer</span>
        </div>
        <h1 className="page-title">Advisory</h1>
        <p className="page-subtitle max-w-2xl">
          The system runs on data. But every balance sheet reflects goals, constraints, and risk tolerances that data alone can't capture.
          Former capital markets executives ensure the system reflects your business — not a generic template.
        </p>
      </div>

      {/* Your advisory team */}
      <div>
        <h2 className="section-title mb-3">Your Advisory Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ADVISORS.map((advisor) => (
            <div key={advisor.name} className="card p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                  {advisor.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900">{advisor.name}</p>
                  <p className="text-sm text-green-600 font-medium">{advisor.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Building size={11} className="text-gray-400" />
                    <p className="text-xs text-gray-400">{advisor.bank}</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{advisor.bio}</p>
              <div className="flex flex-wrap gap-1.5">
                {advisor.expertise.map((e) => (
                  <span key={e} className="badge-gray text-[10px]">{e}</span>
                ))}
              </div>
              <div className="divider mt-4 mb-3" />
              <button className="flex items-center gap-2 text-sm text-green-600 font-medium hover:text-green-700 transition-colors">
                <MessageSquare size={14} /> Send message <ChevronRight size={14} className="ml-auto" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule a review */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="section-title mb-1">Schedule a Review</h2>
            <p className="text-sm text-gray-500 max-w-sm">
              Quarterly reviews ensure your cash strategy stays aligned with how your business is evolving.
              Reviews typically run 45–60 minutes.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button className="btn-primary">
              <Calendar size={15} /> Book review
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            {
              label: 'Next Review',
              value: nextReview ? new Date(nextReview.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
              sub: nextReview ? `${nextReview.advisor}` : 'None scheduled',
            },
            {
              label: 'Last Review',
              value: lastReview ? new Date(lastReview.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
              sub: lastReview ? lastReview.title : 'No reviews yet',
            },
            { label: 'Review Cadence', value: 'Quarterly', sub: 'Adjustable on request' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">{label}</p>
              <p className="font-semibold text-gray-900 text-sm">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Advisory Activity</h2>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-12" />)}
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="space-y-1">
            {activities.map((item) => (
              <div key={item._id} className="flex items-center gap-4 py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 w-24 text-xs text-gray-400">
                  {new Date(item.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.advisor}</p>
                </div>
                <span className="badge-gray text-[10px] flex-shrink-0">{item.type}</span>
                {item.status === 'complete'
                  ? <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                  : <span className="badge-amber text-[10px]">Scheduled</span>
                }
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">No advisory activity yet.</p>
            <p className="text-xs text-gray-400 mt-1">Activity will appear here once your advisor logs sessions.</p>
          </div>
        )}
      </div>

      {/* What advisors do */}
      <div className="card p-6">
        <h2 className="section-title mb-4">What Your Advisors Do</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: 'Interpret the data', body: "Translate InvestMint's AI outputs into specific portfolio actions that fit your business context — not just the numbers." },
            { title: 'Structure your strategy', body: 'Work with you to define the ALM buckets, timing constraints, and risk thresholds that go into your Investment Policy Statement.' },
            { title: 'Keep you defensible', body: 'Ensure every decision has a documented rationale in ClientVault — so your board, auditors, or future investors can follow the logic.' },
            { title: 'Catch what the model misses', body: 'Surface events — a covenant, a coming raise, a seasonal dip — that affect your cash strategy before they show up in the data.' },
          ].map(({ title, body }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 size={11} className="text-green-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-0.5">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
