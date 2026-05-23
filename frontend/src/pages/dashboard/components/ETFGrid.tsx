import { Star, TrendingUp, TrendingDown } from 'lucide-react'
import type { ETFRecommendation } from '../../../types'
import { formatPercent } from '../../../lib/utils'

interface Props { etfs: ETFRecommendation[] }

const MOCK_ETFS: ETFRecommendation[] = [
  { ticker: 'ZAG', name: 'BMO Aggregate Bond Index ETF', yield: 3.8, returns1y: 4.2, returns3y: 3.1, volatility: 4.5, expenseRatio: 0.09, currency: 'CAD', category: 'Fixed Income', recommended: true },
  { ticker: 'VSB', name: 'Vanguard Short-Term Bond', yield: 4.1, returns1y: 3.8, returns3y: 2.9, volatility: 3.2, expenseRatio: 0.11, currency: 'CAD', category: 'Fixed Income', recommended: true },
  { ticker: 'XIC', name: 'iShares Core S&P/TSX ETF', yield: 2.5, returns1y: 11.2, returns3y: 9.8, volatility: 12.4, expenseRatio: 0.06, currency: 'CAD', category: 'Canadian Equity', recommended: true },
  { ticker: 'VFV', name: 'Vanguard S&P 500 Index ETF', yield: 1.4, returns1y: 22.1, returns3y: 18.3, volatility: 15.2, expenseRatio: 0.09, currency: 'CAD', category: 'US Equity', recommended: false },
  { ticker: 'CASH', name: 'Purpose Cash Management ETF', yield: 5.1, returns1y: 5.1, returns3y: 3.8, volatility: 0.5, expenseRatio: 0.15, currency: 'CAD', category: 'Cash', recommended: true },
  { ticker: 'XEF', name: 'iShares Core MSCI EAFE ETF', yield: 2.8, returns1y: 8.4, returns3y: 6.2, volatility: 13.1, expenseRatio: 0.22, currency: 'CAD', category: 'International', recommended: false },
]

function ETFCard({ etf }: { etf: ETFRecommendation }) {
  const up1y = etf.returns1y >= 0
  return (
    <div className={`card-hover p-5 relative ${etf.recommended ? 'ring-1 ring-green-200' : ''}`}>
      {etf.recommended && (
        <div className="absolute top-3 right-3">
          <span className="badge-green text-[10px]">
            <Star size={9} fill="currentColor" /> Recommended
          </span>
        </div>
      )}

      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-gray-900">{etf.ticker}</span>
          <span className="badge-gray">{etf.currency}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 pr-20 leading-snug">{etf.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div>
          <span className="text-gray-400">Yield</span>
          <p className="font-semibold text-gray-800 mt-0.5">{etf.yield.toFixed(2)}%</p>
        </div>
        <div>
          <span className="text-gray-400">1Y Return</span>
          <p className={`font-semibold mt-0.5 flex items-center gap-0.5 ${up1y ? 'text-green-600' : 'text-red-500'}`}>
            {up1y ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {formatPercent(etf.returns1y)}
          </p>
        </div>
        <div>
          <span className="text-gray-400">3Y Return</span>
          <p className={`font-semibold mt-0.5 ${etf.returns3y >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {formatPercent(etf.returns3y)}
          </p>
        </div>
        <div>
          <span className="text-gray-400">Volatility</span>
          <p className="font-semibold text-gray-800 mt-0.5">{etf.volatility.toFixed(1)}%</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">MER {etf.expenseRatio.toFixed(2)}%</span>
        <span className="badge-gray text-[10px]">{etf.category}</span>
      </div>
    </div>
  )
}

export default function ETFGrid({ etfs }: Props) {
  const data = etfs.length > 0 ? etfs : MOCK_ETFS
  const sorted = [...data].sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sorted.map((etf) => (
        <ETFCard key={etf.ticker} etf={etf} />
      ))}
    </div>
  )
}
