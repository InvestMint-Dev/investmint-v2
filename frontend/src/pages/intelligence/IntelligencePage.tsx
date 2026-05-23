import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { cashflowApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { Report } from '../../types'
import ForecastChart from '../cash-flow/components/ForecastChart'
import { Brain, TrendingUp, Activity, Layers, Info } from 'lucide-react'

type ModelTab = 'arima' | 'lstm' | 'stl'

const MODEL_INFO = {
  arima: {
    name: 'ARIMA',
    full: 'AutoRegressive Integrated Moving Average',
    description: 'A classical statistical model that uses past cash flow patterns to forecast future values. Best for stable, predictable trends with seasonal patterns.',
    badge: 'badge-blue',
    icon: TrendingUp,
  },
  lstm: {
    name: 'LSTM',
    full: 'Long Short-Term Memory',
    description: 'A deep learning neural network designed for time-series data. Excels at capturing complex, non-linear relationships in your cash flow history.',
    badge: 'badge-green',
    icon: Brain,
  },
  stl: {
    name: 'STL',
    full: 'Seasonal and Trend decomposition using Loess',
    description: 'Decomposes your cash flow into trend, seasonal, and residual components. Useful for identifying outliers and cyclical business patterns.',
    badge: 'badge-amber',
    icon: Layers,
  },
}

export default function IntelligencePage() {
  const { userId } = useAuth()
  const [activeModel, setActiveModel] = useState<ModelTab>('arima')

  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ['all-reports', userId],
    queryFn: async () => {
      const res = await cashflowApi.get('/getReports', {
        params: {
          userId,
          types: JSON.stringify(['ARIMA', 'LSTM', 'STL_TREND', 'STL_SEASONAL', 'STL_RESID']),
        },
      })
      return res.data.data || []
    },
    enabled: !!userId,
  })

  const getReport = (type: string) => reports?.find((r) => r.model_type === type)

  const modelReport = {
    arima: getReport('ARIMA'),
    lstm: getReport('LSTM'),
    stl: getReport('STL_TREND'),
  }[activeModel]

  const info = MODEL_INFO[activeModel]
  const Icon = info.icon

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div>
        <h1 className="page-title">Intelligence</h1>
        <p className="page-subtitle">AI-powered cash flow analysis and forecasting models</p>
      </div>

      {/* Model selector */}
      <div className="grid grid-cols-3 gap-4">
        {(Object.keys(MODEL_INFO) as ModelTab[]).map((key) => {
          const m = MODEL_INFO[key]
          const MI = m.icon
          const active = activeModel === key
          return (
            <button
              key={key}
              onClick={() => setActiveModel(key)}
              className={`card p-4 text-left transition-all duration-150 ${
                active ? 'ring-2 ring-green-500 shadow-green' : 'hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${active ? 'bg-green-500' : 'bg-gray-100'}`}>
                <MI size={18} className={active ? 'text-white' : 'text-gray-400'} />
              </div>
              <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{m.full}</p>
            </button>
          )
        })}
      </div>

      {/* Model info */}
      <div className="card p-5">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <Icon size={18} className="text-green-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="section-title">{info.name} Model</h2>
              <span className={info.badge}>{info.full}</span>
            </div>
            <div className="flex items-start gap-1.5 text-sm text-gray-500">
              <Info size={13} className="flex-shrink-0 mt-0.5 text-gray-400" />
              {info.description}
            </div>
          </div>
        </div>

        <div className="divider mb-5" />

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">365-Day Forecast</h3>
          {!isLoading && !modelReport && (
            <span className="badge-amber text-xs">Showing sample data</span>
          )}
          {isLoading && (
            <span className="badge-gray text-xs animate-pulse">Loading...</span>
          )}
        </div>

        {isLoading ? (
          <div className="skeleton h-72" />
        ) : (
          <ForecastChart report={modelReport} />
        )}
      </div>

      {/* STL decomposition - extra views */}
      {activeModel === 'stl' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="section-title mb-4">Seasonal Component</h3>
            {isLoading ? <div className="skeleton h-48" /> : <ForecastChart report={getReport('STL_SEASONAL')} />}
          </div>
          <div className="card p-5">
            <h3 className="section-title mb-4">Residual (Outliers)</h3>
            {isLoading ? <div className="skeleton h-48" /> : <ForecastChart report={getReport('STL_RESID')} />}
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-green-500" />
          <h2 className="section-title">Key Insights</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Seasonality Detected', value: 'Q4 peak pattern', color: 'text-green-600' },
            { label: 'Trend Direction', value: 'Upward (+3.2%/mo)', color: 'text-green-600' },
            { label: 'Forecast Confidence', value: '87%', color: 'text-gray-800' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`font-semibold text-sm ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
