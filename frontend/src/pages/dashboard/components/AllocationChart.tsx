import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { ETFRecommendation } from '../../../types'

interface Props { etfs: ETFRecommendation[] }

const COLORS = ['#0d9b5c', '#3aad7a', '#6fc09a', '#a3d4b7', '#c8e6d4', '#344d3a']

const MOCK = [
  { name: 'Fixed Income', value: 40 },
  { name: 'Canadian Equity', value: 25 },
  { name: 'US Equity', value: 20 },
  { name: 'International', value: 10 },
  { name: 'Cash', value: 5 },
]

export default function AllocationChart({ etfs }: Props) {
  const data = etfs.length > 0
    ? Object.entries(
        etfs.reduce<Record<string, number>>((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + 1
          return acc
        }, {}),
      ).map(([name, value]) => ({ name, value }))
    : MOCK

  return (
    <div className="flex flex-col gap-3">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: any) => [`${v}%`]}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #dce3df' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-1.5">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-gray-600">{item.name}</span>
            </div>
            <span className="font-semibold text-gray-800">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
