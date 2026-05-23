import { AlertTriangle, X } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bankingApi } from '../../../lib/api'
import type { RebalancingAlert } from '../../../types'
import { useAuth } from '../../../context/AuthContext'

interface Props { alerts: RebalancingAlert[] }

const SEVERITY_STYLES = {
  high:   'bg-red-50 border-red-200 text-red-700',
  medium: 'bg-amber-50 border-amber-200 text-amber-700',
  low:    'bg-blue-50 border-blue-200 text-blue-700',
}

export default function RebalancingAlerts({ alerts }: Props) {
  const { userId } = useAuth()
  const qc = useQueryClient()
  const active = alerts.filter((a) => !a.dismissed)

  const dismiss = useMutation({
    mutationFn: (id: string) => bankingApi.post(`/api/rebalancingAlerts/${id}/dismiss`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts', userId] }),
    onError: () => toast.error('Could not dismiss alert'),
  })

  if (active.length === 0) return null

  return (
    <div className="space-y-2">
      {active.map((alert) => (
        <div
          key={alert._id}
          className={`flex items-start gap-3 p-4 rounded-xl border ${SEVERITY_STYLES[alert.severity]}`}
        >
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{alert.asset}</p>
            <p className="text-xs mt-0.5 opacity-80">{alert.message}</p>
          </div>
          <button
            onClick={() => dismiss.mutate(alert._id)}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
