import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import type { Report } from '../../../types'
import { formatCurrency } from '../../../lib/utils'

interface Props { report?: Report }

function generateMockForecast() {
  const now = Date.now()
  const day = 86400000
  return Array.from({ length: 90 }, (_, i) => {
    const d = new Date(now + i * day)
    const base = 50000
    return {
      date: d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }),
      BANK: Math.round(base + Math.sin(i * 0.15) * 12000 + i * 200 + Math.random() * 3000),
    }
  })
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card p-3 text-xs shadow-md">
      <p className="text-gray-500 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.stroke }} />
          <span className="font-semibold text-gray-900">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function ForecastChart({ report }: Props) {
  let chartData: any[] = []
  let keys: string[] = []

  if (report && Object.keys(report.data).length > 0) {
    const entries = Object.entries(report.data)
    const length = entries[0]?.[1]?.length ?? 0
    keys = entries.map(([k]) => k).slice(0, 3)
    chartData = Array.from({ length }, (_, i) => {
      const point: Record<string, any> = { date: `Day ${i + 1}` }
      entries.forEach(([key, vals]) => { point[key] = vals[i] ?? 0 })
      return point
    })
  } else {
    chartData = generateMockForecast()
    keys = ['BANK']
  }

  const STROKE_COLORS = ['#0d9b5c', '#3aad7a', '#6fc09a']

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
        <defs>
          {keys.map((key, i) => (
            <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={STROKE_COLORS[i]} stopOpacity={0.15} />
              <stop offset="95%" stopColor={STROKE_COLORS[i]} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#dce3df" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8d9e95' }} tickLine={false} axisLine={false} interval={Math.floor(chartData.length / 7)} />
        <YAxis tick={{ fontSize: 10, fill: '#8d9e95' }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        {keys.map((key, i) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={STROKE_COLORS[i]}
            strokeWidth={2}
            fill={`url(#grad-${key})`}
            dot={false}
            activeDot={{ r: 4, fill: STROKE_COLORS[i] }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  )
}
