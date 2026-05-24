import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { bankingApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { AuditEntry, AdvisoryActivity } from '../../types'
import {
  ArrowLeft, Star, CheckCircle2, Clock, AlertTriangle,
  PlusCircle, ClipboardList, MessageSquare, BarChart2,
} from 'lucide-react'
import { toast } from 'sonner'

type Tab = 'overview' | 'screener' | 'audit' | 'advisory'

interface ClientDetail {
  client: { _id: string; email: string; data_from: string }
  company: { companyName: string; city: string; province: string; companyBankAccounts: any[] } | null
  etfs: any[]
  alerts: any[]
  audit: AuditEntry[]
  activity: AdvisoryActivity[]
}

export default function AdvisorClientDetailPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const { userId } = useAuth()
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('overview')
  const [showAuditForm, setShowAuditForm] = useState(false)
  const [showActivityForm, setShowActivityForm] = useState(false)

  const { data, isLoading } = useQuery<ClientDetail>({
    queryKey: ['advisor-client', clientId],
    queryFn: async () => {
      const res = await bankingApi.get(`/api/advisor/${userId}/client/${clientId}`)
      return res.data.data
    },
    enabled: !!userId && !!clientId,
  })

  const auditForm = useForm<{ action: string; detail: string }>()
  const activityForm = useForm<{ type: string; title: string; notes: string; status: string; date: string }>()

  const addAudit = useMutation({
    mutationFn: async (vals: { action: string; detail: string }) => {
      await bankingApi.post(`/api/audit/${clientId}`, { ...vals, actor: 'InvestMint Advisory' })
    },
    onSuccess: () => {
      toast.success('Audit entry added')
      qc.invalidateQueries({ queryKey: ['advisor-client', clientId] })
      auditForm.reset()
      setShowAuditForm(false)
    },
    onError: () => toast.error('Failed to add entry'),
  })

  const addActivity = useMutation({
    mutationFn: async (vals: { type: string; title: string; notes: string; status: string; date: string }) => {
      await bankingApi.post(`/api/advisoryActivity/${clientId}`, { ...vals, advisor: 'InvestMint Advisory' })
    },
    onSuccess: () => {
      toast.success('Activity logged')
      qc.invalidateQueries({ queryKey: ['advisor-client', clientId] })
      activityForm.reset()
      setShowActivityForm(false)
    },
    onError: () => toast.error('Failed to log activity'),
  })

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'overview', label: 'Overview', icon: BarChart2 },
    { key: 'screener', label: 'Screener', icon: Star },
    { key: 'audit', label: 'Audit Trail', icon: ClipboardList },
    { key: 'advisory', label: 'Advisory', icon: MessageSquare },
  ]

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-5xl animate-fade-in">
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Client not found or not assigned to you.</p>
        <Link to="/advisor/clients" className="text-green-600 text-sm mt-2 inline-block">← Back to clients</Link>
      </div>
    )
  }

  const { client, company, etfs, alerts, audit, activity } = data
  const recommended = etfs.filter((e) => e.recommended)
  const activeAlerts = alerts.filter((a) => !a.dismissed)

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      {/* Header */}
      <div>
        <Link to="/advisor/clients" className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 mb-3 transition-colors">
          <ArrowLeft size={13} /> All clients
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Advisor View</span>
              {activeAlerts.length > 0 && (
                <span className="badge-amber text-[10px]">
                  <AlertTriangle size={10} className="inline mr-0.5" />
                  {activeAlerts.length} alert{activeAlerts.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <h1 className="page-title">{company?.companyName || client.email}</h1>
            {company && (
              <p className="page-subtitle">{company.city}{company.province ? `, ${company.province}` : ''} · {client.email}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {client.data_from === 'UNF' && <span className="badge-green text-xs">QuickBooks</span>}
            {client.data_from === 'uploaded' && <span className="badge-blue text-xs">Excel</span>}
            {(!client.data_from || client.data_from === 'null') && <span className="badge-gray text-xs">Not connected</span>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === key ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Bank Accounts', value: String(company?.companyBankAccounts?.length ?? 0) },
              { label: 'ETF Recommendations', value: String(recommended.length) },
              { label: 'Active Alerts', value: String(activeAlerts.length), highlight: activeAlerts.length > 0 },
              { label: 'Audit Entries', value: String(audit.length) },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="stat-card">
                <span className="stat-label">{label}</span>
                <span className={`stat-value ${highlight ? 'text-amber-500' : ''}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Bank accounts */}
          {company?.companyBankAccounts && company.companyBankAccounts.length > 0 && (
            <div className="card p-5">
              <h2 className="section-title mb-4">Bank Accounts</h2>
              <div className="space-y-1">
                {company.companyBankAccounts.map((acc: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 py-2.5 px-3 rounded-lg bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{acc.bank}</p>
                      <p className="text-xs text-gray-400">{acc.bankerName} · {acc.currency}</p>
                    </div>
                    {acc.currentInterestRate && (
                      <span className="text-xs text-gray-500">{acc.currentInterestRate}% rate</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active alerts */}
          {activeAlerts.length > 0 && (
            <div className="card p-5">
              <h2 className="section-title mb-4">Rebalancing Alerts</h2>
              <div className="space-y-2">
                {activeAlerts.map((alert: any) => (
                  <div key={alert._id} className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                    <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{alert.asset}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{alert.message}</p>
                    </div>
                    <span className={`badge text-[10px] flex-shrink-0 ml-auto ${
                      alert.severity === 'high' ? 'badge-amber' : 'badge-gray'
                    }`}>{alert.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Screener */}
      {tab === 'screener' && (
        <div className="card overflow-hidden animate-fade-in">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="section-title">ETF Recommendations</h2>
            <p className="text-xs text-gray-400 mt-0.5">Calibrated to client's investment profile</p>
          </div>
          {etfs.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No screener data yet — client hasn't completed onboarding.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="py-2.5 px-4 text-left w-8" />
                    <th className="py-2.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Instrument</th>
                    <th className="py-2.5 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Category</th>
                    <th className="py-2.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Yield</th>
                    <th className="py-2.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">1Y Return</th>
                    <th className="py-2.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Volatility</th>
                    <th className="py-2.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">MER</th>
                  </tr>
                </thead>
                <tbody>
                  {[...etfs].sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0)).map((etf) => (
                    <tr key={etf.ticker} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        {etf.recommended && <Star size={12} className="text-green-500 fill-green-500" />}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900 text-sm">{etf.ticker}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{etf.name}</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="badge-gray text-[10px]">{etf.category}</span>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-700">{etf.yield?.toFixed(2)}%</td>
                      <td className="py-3 px-4 text-right text-sm text-green-600">{etf.returns1y?.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-600">{etf.volatility?.toFixed(1)}%</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-500">{etf.expenseRatio?.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Audit Trail */}
      {tab === 'audit' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Audit Trail</h2>
            <button onClick={() => setShowAuditForm(!showAuditForm)} className="btn-primary text-sm">
              <PlusCircle size={14} /> Add Entry
            </button>
          </div>

          {showAuditForm && (
            <div className="card p-5 animate-fade-in">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">New Audit Entry</h3>
              <form onSubmit={auditForm.handleSubmit((d) => addAudit.mutate(d))} className="space-y-3">
                <div>
                  <label className="label">Action</label>
                  <input {...auditForm.register('action', { required: true })} className="input" placeholder="e.g. Portfolio rebalanced" />
                </div>
                <div>
                  <label className="label">Detail</label>
                  <input {...auditForm.register('detail')} className="input" placeholder="Additional context or notes" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={addAudit.isPending} className="btn-primary text-sm">
                    {addAudit.isPending ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save Entry'}
                  </button>
                  <button type="button" onClick={() => setShowAuditForm(false)} className="btn-secondary text-sm">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="card p-5">
            {audit.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No audit entries yet. Add the first one above.</p>
            ) : (
              <div className="space-y-1">
                {audit.map((entry) => (
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
            )}
          </div>
        </div>
      )}

      {/* Advisory Activity */}
      {tab === 'advisory' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Advisory Activity</h2>
            <button onClick={() => setShowActivityForm(!showActivityForm)} className="btn-primary text-sm">
              <PlusCircle size={14} /> Log Activity
            </button>
          </div>

          {showActivityForm && (
            <div className="card p-5 animate-fade-in">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Log Advisory Activity</h3>
              <form onSubmit={activityForm.handleSubmit((d) => addActivity.mutate(d))} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Type</label>
                    <select {...activityForm.register('type', { required: true })} className="input">
                      <option value="Review">Review</option>
                      <option value="Recommendation">Recommendation</option>
                      <option value="Policy">Policy</option>
                      <option value="Note">Note</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select {...activityForm.register('status')} className="input">
                      <option value="complete">Complete</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Title</label>
                  <input {...activityForm.register('title', { required: true })} className="input" placeholder="e.g. Q2 Portfolio Review" />
                </div>
                <div>
                  <label className="label">Date</label>
                  <input {...activityForm.register('date')} type="date" className="input" />
                </div>
                <div>
                  <label className="label">Notes (optional)</label>
                  <input {...activityForm.register('notes')} className="input" placeholder="Any additional context" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={addActivity.isPending} className="btn-primary text-sm">
                    {addActivity.isPending ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Save'}
                  </button>
                  <button type="button" onClick={() => setShowActivityForm(false)} className="btn-secondary text-sm">Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="card p-5">
            {activity.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No advisory activity yet. Log the first session above.</p>
            ) : (
              <div className="space-y-1">
                {activity.map((item) => (
                  <div key={item._id} className="flex items-center gap-4 py-3 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-24 text-xs text-gray-400">
                      {new Date(item.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{item.title}</p>
                      {item.notes && <p className="text-xs text-gray-500 mt-0.5">{item.notes}</p>}
                    </div>
                    <span className="badge-gray text-[10px] flex-shrink-0">{item.type}</span>
                    {item.status === 'complete'
                      ? <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
                      : <Clock size={15} className="text-amber-400 flex-shrink-0" />
                    }
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
