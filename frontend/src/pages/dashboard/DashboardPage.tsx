import { useQuery } from '@tanstack/react-query'
import { bankingApi } from '../../lib/api'
import { formatCurrency, formatPercent } from '../../lib/utils'
import { useAuth } from '../../context/AuthContext'
import PortfolioChart from './components/PortfolioChart'
import ETFGrid from './components/ETFGrid'
import RebalancingAlerts from './components/RebalancingAlerts'
import AllocationChart from './components/AllocationChart'
import type { PortfolioPerformance, RebalancingAlert, ETFRecommendation } from '../../types'
import { TrendingUp, TrendingDown, DollarSign, Activity, Brain, BarChart2, Shield, Users, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function StatCard({
  label, value, change, positive, icon: Icon,
}: {
  label: string
  value: string
  change?: string
  positive?: boolean
  icon: React.ElementType
}) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <span className="stat-label">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
          <Icon size={16} className="text-gray-400" />
        </div>
      </div>
      <span className="stat-value">{value}</span>
      {change && (
        <span className={positive ? 'stat-up' : 'stat-down'}>
          {positive ? <TrendingUp size={11} className="inline mr-0.5" /> : <TrendingDown size={11} className="inline mr-0.5" />}
          {change} vs last month
        </span>
      )}
    </div>
  )
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />
}

export default function DashboardPage() {
  const { userId } = useAuth()

  const { data: performance, isLoading: perfLoading } = useQuery<PortfolioPerformance[]>({
    queryKey: ['performance', userId],
    queryFn: async () => {
      const res = await bankingApi.get(`/api/recommendations/performance/${userId}`)
      return res.data.data || []
    },
    enabled: !!userId,
  })

  const { data: alerts, isLoading: alertsLoading } = useQuery<RebalancingAlert[]>({
    queryKey: ['alerts', userId],
    queryFn: async () => {
      const res = await bankingApi.get(`/api/rebalancingAlerts/${userId}`)
      return res.data.data || []
    },
    enabled: !!userId,
  })

  const { data: etfs, isLoading: etfsLoading } = useQuery<ETFRecommendation[]>({
    queryKey: ['etfs', userId],
    queryFn: async () => {
      const res = await bankingApi.get(`/api/dataCollection/run-etf-script?userId=${userId}`)
      return res.data.data || []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30,
  })

  const latestValue = performance?.at(-1)?.value ?? 0
  const firstValue = performance?.[0]?.value ?? 0
  const totalReturn = firstValue > 0 ? ((latestValue - firstValue) / firstValue) * 100 : 0
  const activeAlerts = alerts?.filter((a) => !a.dismissed).length ?? 0

  const LAYERS = [
    { to: '/cash-flow', icon: Brain, label: 'Intelligence', sub: 'Cash Forecasting', color: 'text-blue-500 bg-blue-50' },
    { to: '/screener', icon: BarChart2, label: 'Execution', sub: 'Investment Screener', color: 'text-green-600 bg-green-50' },
    { to: '/vault', icon: Shield, label: 'Governance', sub: 'ClientVault + ALM', color: 'text-purple-500 bg-purple-50' },
    { to: '/advisory', icon: Users, label: 'Advisory', sub: 'Human Layer', color: 'text-amber-600 bg-amber-50' },
  ]

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">

      {/* 4-layer quick nav */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {LAYERS.map(({ to, icon: Icon, label, sub, color }) => (
          <Link
            key={to}
            to={to}
            className="card-hover p-4 flex items-center gap-3"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon size={17} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 leading-tight">{label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>
            </div>
            <ChevronRight size={13} className="text-gray-300 flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {perfLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[108px] rounded-xl" />)
        ) : (
          <>
            <StatCard
              label="Portfolio Value"
              value={formatCurrency(latestValue)}
              change={`${Math.abs(totalReturn).toFixed(1)}%`}
              positive={totalReturn >= 0}
              icon={DollarSign}
            />
            <StatCard
              label="Total Return"
              value={formatPercent(totalReturn)}
              change={formatPercent(totalReturn / 12)}
              positive={totalReturn >= 0}
              icon={TrendingUp}
            />
            <StatCard
              label="Active Alerts"
              value={String(activeAlerts)}
              icon={Activity}
            />
            <StatCard
              label="ETF Holdings"
              value={String(etfs?.filter((e) => e.recommended).length ?? '—')}
              icon={Activity}
            />
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Portfolio Performance</h2>
            <span className="badge-green text-xs">Live</span>
          </div>
          {perfLoading ? (
            <Skeleton className="h-56" />
          ) : (
            <PortfolioChart data={performance ?? []} />
          )}
        </div>

        <div className="card p-5">
          <h2 className="section-title mb-4">Allocation</h2>
          {etfsLoading ? (
            <Skeleton className="h-56" />
          ) : (
            <AllocationChart etfs={etfs ?? []} />
          )}
        </div>
      </div>

      {/* ETF Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">ETF Recommendations</h2>
          <span className="text-xs text-gray-400">Updated daily</span>
        </div>
        {etfsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
          </div>
        ) : (
          <ETFGrid etfs={etfs ?? []} />
        )}
      </div>

      {/* Rebalancing alerts */}
      {!alertsLoading && activeAlerts > 0 && (
        <div>
          <h2 className="section-title mb-3">Rebalancing Alerts</h2>
          <RebalancingAlerts alerts={alerts ?? []} />
        </div>
      )}
    </div>
  )
}
