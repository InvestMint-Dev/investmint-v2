import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { bankingApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { AuditEntry } from '../../types'
import {
  Shield,
  FileText,
  Scale,
  ClipboardList,
  Lock,
  Download,
  CheckCircle2,
  Clock,
} from 'lucide-react'

type Tab = 'overview' | 'policy' | 'alm' | 'audit'

const DOCUMENTS = [
  { title: 'Cash Management Policy', status: 'complete', updated: 'May 2024', category: 'Policy' },
  { title: 'Investment Policy Statement (IPS)', status: 'complete', updated: 'May 2024', category: 'Policy' },
  { title: 'Asset-Liability Matching Strategy', status: 'complete', updated: 'Apr 2024', category: 'ALM' },
  { title: 'Liquidity Risk Framework', status: 'complete', updated: 'Apr 2024', category: 'ALM' },
  { title: 'Counterparty Risk Assessment', status: 'pending', updated: '—', category: 'Risk' },
  { title: 'Board Authorization Record', status: 'complete', updated: 'Mar 2024', category: 'Governance' },
  { title: 'Q1 2024 Investment Review', status: 'complete', updated: 'Apr 2024', category: 'Audit' },
  { title: 'Q2 2024 Investment Review', status: 'pending', updated: '—', category: 'Audit' },
]

const ALM_BUCKETS = [
  { label: 'Liquid (0–30 days)', amount: '$245,000', allocation: '28%', instruments: 'CASH, CSAV', color: 'bg-green-500' },
  { label: 'Short-term (1–6 months)', amount: '$310,000', allocation: '36%', instruments: 'VSB, ZST', color: 'bg-green-400' },
  { label: 'Medium-term (6–18 months)', amount: '$200,000', allocation: '23%', instruments: 'ZAG', color: 'bg-green-300' },
  { label: 'Strategic (18+ months)', amount: '$113,000', allocation: '13%', instruments: 'XIC, XEF', color: 'bg-green-200' },
]

export default function ClientVaultPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const { userId } = useAuth()

  const { data: auditEntries, isLoading: auditLoading } = useQuery<AuditEntry[]>({
    queryKey: ['audit', userId],
    queryFn: async () => {
      const res = await bankingApi.get(`/api/audit/${userId}`)
      return res.data.data || []
    },
    enabled: !!userId,
  })

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: Shield },
    { key: 'policy', label: 'Policy', icon: FileText },
    { key: 'alm', label: 'ALM Strategy', icon: Scale },
    { key: 'audit', label: 'Audit Trail', icon: ClipboardList },
  ]

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Governance Layer</span>
        </div>
        <h1 className="page-title flex items-center gap-2">
          <Lock size={20} className="text-gray-500" /> ClientVault
        </h1>
        <p className="page-subtitle">
          Institutional-grade governance infrastructure. Documented policy, risk frameworks, asset-liability alignment, and an auditable record of every decision.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-5 animate-fade-in">
          {/* Status cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Documents', value: '8', sub: '6 complete', icon: FileText },
              { label: 'Policy Status', value: 'Active', sub: 'Last reviewed Apr 2024', icon: CheckCircle2 },
              { label: 'ALM Buckets', value: '4', sub: 'All calibrated', icon: Scale },
              { label: 'Audit Records', value: '12', sub: 'This year', icon: ClipboardList },
            ].map(({ label, value, sub, icon: Icon }) => (
              <div key={label} className="stat-card">
                <div className="flex items-center justify-between mb-3">
                  <span className="stat-label">{label}</span>
                  <Icon size={14} className="text-gray-400" />
                </div>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          {/* Document library */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Document Library</h2>
              <span className="text-xs text-gray-400">Encrypted & audited</span>
            </div>
            <div className="space-y-1">
              {DOCUMENTS.map((doc) => (
                <div key={doc.title} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-gray-50 group cursor-pointer transition-colors">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${doc.status === 'complete' ? 'bg-green-500' : 'bg-amber-400'}`} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-800">{doc.title}</span>
                  </div>
                  <span className="badge-gray text-[10px]">{doc.category}</span>
                  <span className="text-xs text-gray-400 w-20 text-right">{doc.updated}</span>
                  {doc.status === 'complete' ? (
                    <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                  ) : (
                    <Clock size={14} className="text-amber-400 flex-shrink-0" />
                  )}
                  <Download size={13} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Policy */}
      {tab === 'policy' && (
        <div className="space-y-4 animate-fade-in">
          <div className="card p-6">
            <h2 className="section-title mb-1">Cash Management Policy</h2>
            <p className="text-xs text-gray-400 mb-5">Effective: March 2024 · Next review: September 2024</p>
            {[
              { heading: 'Objective', body: 'To ensure that idle corporate cash is managed in a systematic, disciplined, and risk-aware manner that preserves capital, maintains adequate liquidity for operations, and generates a meaningful yield on deployable balances.' },
              { heading: 'Authorized Instruments', body: 'Investment-grade fixed income ETFs (IG rating BBB+ or higher), short-duration bond ETFs (duration < 3 years), high-interest savings ETFs, and cash equivalents. Equity instruments are permitted only for the strategic tranche (18+ months horizon) up to 15% of deployable capital.' },
              { heading: 'Liquidity Reserve', body: 'A minimum of 20% of average monthly operating expenses (based on the trailing 12 months) must be maintained in instruments redeemable within 2 business days at all times.' },
              { heading: 'Review Cadence', body: 'This policy is reviewed quarterly by the CFO and the InvestMint advisory team. Material changes require board authorization and are recorded in ClientVault within 5 business days.' },
            ].map(({ heading, body }) => (
              <div key={heading} className="mb-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-1.5">{heading}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button className="btn-secondary text-sm"><Download size={14} /> Download PDF</button>
              <span className="text-xs text-gray-400">Last modified by InvestMint Advisory · Apr 12, 2024</span>
            </div>
          </div>
        </div>
      )}

      {/* ALM Strategy */}
      {tab === 'alm' && (
        <div className="space-y-5 animate-fade-in">
          <div className="card p-6">
            <h2 className="section-title mb-1">Asset-Liability Matching Strategy</h2>
            <p className="text-xs text-gray-400 mb-5">
              Cash is bucketed by timing requirement. Each tranche is matched to instruments with appropriate liquidity and yield profiles.
            </p>

            {/* Visual bucketing */}
            <div className="mb-6">
              <div className="flex rounded-xl overflow-hidden h-4">
                {ALM_BUCKETS.map((b, i) => (
                  <div
                    key={i}
                    className={`${b.color} h-full transition-all`}
                    style={{ width: b.allocation }}
                    title={b.label}
                  />
                ))}
              </div>
              <div className="flex gap-4 mt-2 flex-wrap">
                {ALM_BUCKETS.map((b, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className={`w-2.5 h-2.5 rounded-sm ${b.color}`} />
                    {b.label.split(' (')[0]} · {b.allocation}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {ALM_BUCKETS.map((bucket) => (
                <div key={bucket.label} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className={`w-1 h-10 rounded-full ${bucket.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{bucket.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Instruments: {bucket.instruments}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{bucket.amount}</p>
                    <p className="text-xs text-gray-400">{bucket.allocation} of portfolio</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audit Trail */}
      {tab === 'audit' && (
        <div className="card p-5 animate-fade-in">
          <h2 className="section-title mb-4">Audit Trail</h2>
          {auditLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-12" />)}
            </div>
          ) : auditEntries && auditEntries.length > 0 ? (
            <div className="space-y-1">
              {auditEntries.map((entry) => (
                <div key={entry._id} className="flex items-start gap-4 py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-28 text-xs text-gray-400 pt-0.5">
                    {new Date(entry.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{entry.action}</p>
                    {entry.detail && <p className="text-xs text-gray-500 mt-0.5">{entry.detail}</p>}
                  </div>
                  <span className="badge-gray text-[10px] flex-shrink-0">{entry.actor}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <ClipboardList size={28} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No audit entries yet.</p>
              <p className="text-xs text-gray-400 mt-1">Your advisor will log activity here as your engagement progresses.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
