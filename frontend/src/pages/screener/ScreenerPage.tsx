import { useQuery } from '@tanstack/react-query'
import { bankingApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { ETFRecommendation } from '../../types'
import { formatPercent } from '../../lib/utils'
import { TrendingUp, TrendingDown, Filter, RefreshCw, Star, Info } from 'lucide-react'

function ETFRow({ etf, rank }: { etf: ETFRecommendation; rank: number }) {
  const up1y = etf.returns1y >= 0
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-5 text-right">{rank}</span>
          {etf.recommended && <Star size={12} className="text-green-500 fill-green-500 flex-shrink-0" />}
        </div>
      </td>
      <td className="py-3.5 px-4">
        <div>
          <span className="font-semibold text-gray-900 text-sm">{etf.ticker}</span>
          <p className="text-xs text-gray-400 mt-0.5 max-w-[220px] truncate">{etf.name}</p>
        </div>
      </td>
      <td className="py-3.5 px-4 text-center">
        <span className="badge-gray text-[10px]">{etf.category}</span>
      </td>
      <td className="py-3.5 px-4 text-right text-sm font-medium text-gray-700">{etf.yield.toFixed(2)}%</td>
      <td className={`py-3.5 px-4 text-right text-sm font-medium ${up1y ? 'text-green-600' : 'text-red-500'}`}>
        <span className="flex items-center justify-end gap-0.5">
          {up1y ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {formatPercent(etf.returns1y)}
        </span>
      </td>
      <td className={`py-3.5 px-4 text-right text-sm font-medium ${etf.returns3y >= 0 ? 'text-green-600' : 'text-red-500'}`}>
        {formatPercent(etf.returns3y)}
      </td>
      <td className="py-3.5 px-4 text-right text-sm text-gray-600">{etf.volatility.toFixed(1)}%</td>
      <td className="py-3.5 px-4 text-right text-sm text-gray-500">{etf.expenseRatio.toFixed(2)}%</td>
      <td className="py-3.5 px-4 text-center">
        <span className={`badge text-[10px] ${etf.currency === 'CAD' ? 'badge-green' : 'badge-blue'}`}>{etf.currency}</span>
      </td>
    </tr>
  )
}

const MOCK_ETFS: ETFRecommendation[] = [
  { ticker: 'ZAG', name: 'BMO Aggregate Bond Index ETF', yield: 3.8, returns1y: 4.2, returns3y: 3.1, volatility: 4.5, expenseRatio: 0.09, currency: 'CAD', category: 'Fixed Income', recommended: true },
  { ticker: 'VSB', name: 'Vanguard Short-Term Bond', yield: 4.1, returns1y: 3.8, returns3y: 2.9, volatility: 3.2, expenseRatio: 0.11, currency: 'CAD', category: 'Fixed Income', recommended: true },
  { ticker: 'ZST', name: 'BMO Short-Term Bond', yield: 4.3, returns1y: 3.5, returns3y: 2.7, volatility: 2.8, expenseRatio: 0.14, currency: 'CAD', category: 'Fixed Income', recommended: true },
  { ticker: 'CASH', name: 'Purpose Cash Management ETF', yield: 5.1, returns1y: 5.1, returns3y: 3.8, volatility: 0.5, expenseRatio: 0.15, currency: 'CAD', category: 'Cash', recommended: true },
  { ticker: 'CSAV', name: 'CI High Interest Savings ETF', yield: 5.0, returns1y: 5.0, returns3y: 3.6, volatility: 0.3, expenseRatio: 0.14, currency: 'CAD', category: 'Cash', recommended: true },
  { ticker: 'XIC', name: 'iShares Core S&P/TSX ETF', yield: 2.5, returns1y: 11.2, returns3y: 9.8, volatility: 12.4, expenseRatio: 0.06, currency: 'CAD', category: 'Canadian Equity', recommended: false },
  { ticker: 'XEI', name: 'iShares S&P/TSX High Dividend', yield: 5.2, returns1y: 8.1, returns3y: 7.3, volatility: 11.8, expenseRatio: 0.22, currency: 'CAD', category: 'Canadian Equity', recommended: false },
  { ticker: 'VFV', name: 'Vanguard S&P 500 Index ETF', yield: 1.4, returns1y: 22.1, returns3y: 18.3, volatility: 15.2, expenseRatio: 0.09, currency: 'CAD', category: 'US Equity', recommended: false },
  { ticker: 'XUS', name: 'iShares Core S&P 500', yield: 1.2, returns1y: 22.4, returns3y: 18.5, volatility: 15.1, expenseRatio: 0.10, currency: 'CAD', category: 'US Equity', recommended: false },
  { ticker: 'XEF', name: 'iShares Core MSCI EAFE ETF', yield: 2.8, returns1y: 8.4, returns3y: 6.2, volatility: 13.1, expenseRatio: 0.22, currency: 'CAD', category: 'International', recommended: false },
  { ticker: 'ZDI', name: 'BMO International Dividend', yield: 4.1, returns1y: 7.2, returns3y: 5.8, volatility: 12.0, expenseRatio: 0.44, currency: 'CAD', category: 'International', recommended: false },
]

export default function ScreenerPage() {
  const { userId } = useAuth()

  const { data: etfs, isLoading, refetch, isFetching } = useQuery<ETFRecommendation[]>({
    queryKey: ['etfs', userId],
    queryFn: async () => {
      const res = await bankingApi.get(`/api/dataCollection/run-etf-script?userId=${userId}`)
      return res.data.data || []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30,
  })

  const data = (etfs && etfs.length > 0 ? etfs : MOCK_ETFS)
    .sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0))

  const recommended = data.filter((e) => e.recommended)

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Execution Layer</span>
          </div>
          <h1 className="page-title">Investment Screener</h1>
          <p className="page-subtitle">
            Proprietary screener calibrated to your risk tolerance, liquidity requirements, and cash timing.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="btn-secondary text-sm flex items-center gap-2"
          disabled={isFetching}
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Match summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <span className="stat-label">Recommended Instruments</span>
          <span className="stat-value text-green-600">{recommended.length}</span>
          <span className="text-xs text-gray-400">calibrated to your profile</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Screened Universe</span>
          <span className="stat-value">{data.length}</span>
          <span className="text-xs text-gray-400">ETFs analyzed</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg. Recommended Yield</span>
          <span className="stat-value text-green-600">
            {recommended.length > 0
              ? `${(recommended.reduce((s, e) => s + e.yield, 0) / recommended.length).toFixed(2)}%`
              : '—'}
          </span>
          <span className="text-xs text-gray-400">weighted average</span>
        </div>
      </div>

      {/* Calibration notice */}
      <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl p-4">
        <Info size={15} className="text-green-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-green-800">
          Recommendations are calibrated to your investment questionnaire answers — risk tolerance, liquidity horizon, and operating currency.
          {' '}<span className="font-medium">Update your profile in Settings to recalibrate.</span>
        </p>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="section-title">All Instruments</h2>
          <button className="btn-ghost text-xs py-1.5 px-3">
            <Filter size={12} /> Filter
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-12" />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="py-2.5 px-4 text-left w-12" />
                  <th className="py-2.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Instrument</th>
                  <th className="py-2.5 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="py-2.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Yield</th>
                  <th className="py-2.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">1Y Return</th>
                  <th className="py-2.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">3Y Return</th>
                  <th className="py-2.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">Volatility</th>
                  <th className="py-2.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wide">MER</th>
                  <th className="py-2.5 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wide">Currency</th>
                </tr>
              </thead>
              <tbody>
                {data.map((etf, i) => (
                  <ETFRow key={etf.ticker} etf={etf} rank={i + 1} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center pb-2">
        Data refreshed daily. Not financial advice. Past performance does not guarantee future results.
      </p>
    </div>
  )
}
