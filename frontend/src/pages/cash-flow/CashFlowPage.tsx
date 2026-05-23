import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cashflowApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { Report, Account } from '../../types'
import VolatilityChart from './components/VolatilityChart'
import ForecastChart from './components/ForecastChart'
import AccountsTable from './components/AccountsTable'
import { formatCurrency } from '../../lib/utils'
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'

type Tab = 'overview' | 'forecast' | 'accounts'

export default function CashFlowPage() {
  const { userId } = useAuth()
  const [tab, setTab] = useState<Tab>('overview')

  const { data: reports, isLoading: reportsLoading } = useQuery<Report[]>({
    queryKey: ['reports', userId],
    queryFn: async () => {
      const res = await cashflowApi.get('/getReports', {
        params: { userId, types: JSON.stringify(['VOLATILITY', 'STL_TREND', 'ARIMA', 'FORECAST']) },
      })
      return res.data.data || []
    },
    enabled: !!userId,
  })

  const { data: accounts, isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ['accounts', userId],
    queryFn: async () => {
      const res = await cashflowApi.get('/getAccounts', { params: { userId } })
      return res.data.data || []
    },
    enabled: !!userId,
  })

  const volatility = reports?.find((r) => r.model_type === 'VOLATILITY')
  const forecast = reports?.find((r) => r.model_type === 'ARIMA') || reports?.find((r) => r.model_type === 'FORECAST')

  const bankAccounts = accounts?.filter((a) => a.account_type === 'BANK') ?? []
  const totalBalance = bankAccounts.reduce((sum, a) => sum + (a.account_balance ?? 0), 0)

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'forecast', label: 'Forecast' },
    { key: 'accounts', label: 'Accounts' },
  ]

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Intelligence Layer</span>
        </div>
        <h1 className="page-title">Cash Forecasting & Modeling</h1>
        <p className="page-subtitle">Quantify the idle cash opportunity — how much, for how long, against what constraints.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Total Cash</span>
            <Wallet size={16} className="text-gray-400" />
          </div>
          {accountsLoading ? (
            <div className="skeleton h-8 w-32" />
          ) : (
            <span className="stat-value">{formatCurrency(totalBalance)}</span>
          )}
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Bank Accounts</span>
            <TrendingUp size={16} className="text-gray-400" />
          </div>
          <span className="stat-value">{accountsLoading ? '—' : bankAccounts.length}</span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Avg Monthly Inflow</span>
            <ArrowUpRight size={16} className="text-green-500" />
          </div>
          <span className="stat-value text-green-600">
            {reportsLoading ? '—' : volatility ? formatCurrency(Object.values(volatility.data)[0]?.filter((v) => v > 0).reduce((a, b) => a + b, 0) / 30 || 0) : '—'}
          </span>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <span className="stat-label">Avg Monthly Outflow</span>
            <ArrowDownRight size={16} className="text-red-500" />
          </div>
          <span className="stat-value text-red-600">
            {reportsLoading ? '—' : '—'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150 ${
                tab === key
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {tab === 'overview' && (
          <div className="space-y-5">
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title">Cash Flow Volatility</h2>
                <span className="text-xs text-gray-400">Daily change in balance</span>
              </div>
              {reportsLoading ? (
                <div className="skeleton h-64" />
              ) : (
                <VolatilityChart report={volatility} />
              )}
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title">Trend Decomposition (STL)</h2>
                <span className="badge-blue text-xs">AI Model</span>
              </div>
              {reportsLoading ? (
                <div className="skeleton h-48" />
              ) : (
                <VolatilityChart report={reports?.find((r) => r.model_type === 'STL_TREND')} variant="trend" />
              )}
            </div>
          </div>
        )}

        {tab === 'forecast' && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">365-Day Cash Flow Forecast</h2>
              <span className="badge-green text-xs">ARIMA / LSTM</span>
            </div>
            {reportsLoading ? (
              <div className="skeleton h-72" />
            ) : (
              <ForecastChart report={forecast} />
            )}
            <p className="text-xs text-gray-400 mt-3">
              Forecast generated using ARIMA and LSTM models. Predictions are indicative and not guaranteed.
            </p>
          </div>
        )}

        {tab === 'accounts' && (
          <div className="card p-5">
            <h2 className="section-title mb-4">All Accounts</h2>
            {accountsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-12" />)}
              </div>
            ) : (
              <AccountsTable accounts={accounts ?? []} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
