import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { PortfolioPerformance } from '../../../types'
import { formatCurrency } from '../../../lib/utils'

interface Props { data: PortfolioPerformance[] }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card p-3 text-xs shadow-md">
      <p className="text-gray-500 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-semibold text-gray-900">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

// Generate mock data if empty
function generateMockData(): PortfolioPerformance[] {
  const now = Date.now()
  const day = 86400000
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now - (29 - i) * day)
    const base = 250000
    const noise = Math.sin(i * 0.4) * 8000 + i * 1200 + Math.random() * 4000
    return {
      date: d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }),
      value: Math.round(base + noise),
      benchmark: Math.round(base + i * 900 + Math.sin(i * 0.3) * 3000),
    }
  })
}

export default function PortfolioChart({ data }: Props) {
  const chartData = data.length > 0 ? data : generateMockData()

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
        <defs>
          <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0d9b5c" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#0d9b5c" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="benchmarkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8d9e95" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#8d9e95" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#dce3df" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#8d9e95' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11, fill: '#8d9e95' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#64756c', paddingTop: 8 }} />
        <Area type="monotone" dataKey="value" name="Portfolio" stroke="#0d9b5c" strokeWidth={2} fill="url(#portfolioGrad)" dot={false} activeDot={{ r: 4, fill: '#0d9b5c' }} />
        <Area type="monotone" dataKey="benchmark" name="Benchmark" stroke="#8d9e95" strokeWidth={1.5} fill="url(#benchmarkGrad)" dot={false} strokeDasharray="4 2" activeDot={{ r: 3, fill: '#8d9e95' }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
