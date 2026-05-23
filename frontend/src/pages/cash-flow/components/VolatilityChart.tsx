import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import type { Report } from '../../../types'
import { formatCurrency } from '../../../lib/utils'

interface Props {
  report?: Report
  variant?: 'default' | 'trend'
}

function generateMock() {
  return Array.from({ length: 60 }, (_, i) => ({
    date: `Day ${i + 1}`,
    BANK: Math.sin(i * 0.3) * 15000 + Math.random() * 8000 - 4000,
    EXPENSE: -(Math.random() * 5000 + 1000),
    REVENUE: Math.random() * 8000 + 2000,
  }))
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card p-3 text-xs shadow-md">
      <p className="text-gray-500 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.fill }} />
          <span className="text-gray-600">{p.dataKey}:</span>
          <span className={`font-semibold ${p.value >= 0 ? 'text-green-700' : 'text-red-600'}`}>
            {formatCurrency(p.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function VolatilityChart({ report, variant = 'default' }: Props) {
  let chartData: any[] = []
  let keys: string[] = []

  if (report && Object.keys(report.data).length > 0) {
    const entries = Object.entries(report.data)
    const length = entries[0]?.[1]?.length ?? 0
    keys = entries.map(([k]) => k)
    chartData = Array.from({ length }, (_, i) => {
      const point: Record<string, any> = { date: `Day ${i + 1}` }
      entries.forEach(([key, vals]) => { point[key] = vals[i] ?? 0 })
      return point
    })
  } else {
    const mock = generateMock()
    chartData = mock
    keys = ['BANK', 'EXPENSE', 'REVENUE']
  }

  const COLORS: Record<string, string> = {
    BANK: '#0d9b5c',
    EXPENSE: '#ef4444',
    REVENUE: '#3aad7a',
    TOTAL: '#3aad7a',
    VOLATILITY: '#0d9b5c',
  }
  const defaultColor = '#8d9e95'

  const displayKeys = variant === 'trend' ? keys.slice(0, 2) : keys.slice(0, 4)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#dce3df" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8d9e95' }} tickLine={false} axisLine={false} interval={Math.floor(chartData.length / 6)} />
        <YAxis tick={{ fontSize: 10, fill: '#8d9e95' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#dce3df" />
        {displayKeys.map((key) => (
          <Bar key={key} dataKey={key} fill={COLORS[key] ?? defaultColor} radius={[2, 2, 0, 0]} maxBarSize={10} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
