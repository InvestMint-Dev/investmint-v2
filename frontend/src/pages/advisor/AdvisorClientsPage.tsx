import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { bankingApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { AdvisorClient } from '../../types'
import { Users, AlertTriangle, ChevronRight, Clock, CheckCircle2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

function statusBadge(data_from: string) {
  if (data_from === 'UNF') return <span className="badge-green text-[10px]">QuickBooks</span>
  if (data_from === 'uploaded') return <span className="badge-blue text-[10px]">Excel</span>
  return <span className="badge-gray text-[10px]">Not connected</span>
}

export default function AdvisorClientsPage() {
  const { userId } = useAuth()
  const qc = useQueryClient()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const { data: clients, isLoading } = useQuery<AdvisorClient[]>({
    queryKey: ['advisor-clients', userId],
    queryFn: async () => {
      const res = await bankingApi.get(`/api/advisor/${userId}/clients`)
      return res.data.data || []
    },
    enabled: !!userId,
  })

  const deleteUser = useMutation({
    mutationFn: async (clientId: string) => {
      await bankingApi.delete(`/api/advisor/user/${clientId}`)
    },
    onSuccess: () => {
      toast.success('Client and all associated data deleted')
      qc.invalidateQueries({ queryKey: ['advisor-clients'] })
      setConfirmDelete(null)
    },
    onError: () => toast.error('Failed to delete client'),
  })

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Advisor Portal</span>
        </div>
        <h1 className="page-title flex items-center gap-2">
          <Users size={20} className="text-gray-500" /> My Clients
        </h1>
        <p className="page-subtitle">
          All companies assigned to you. Click a client to view their full cash position, screener results, and governance documents.
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <span className="stat-label">Total Clients</span>
          <span className="stat-value">{isLoading ? '—' : clients?.length ?? 0}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active Alerts</span>
          <span className="stat-value text-amber-500">
            {isLoading ? '—' : clients?.reduce((s, c) => s + c.activeAlerts, 0) ?? 0}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Connected</span>
          <span className="stat-value text-green-600">
            {isLoading ? '—' : clients?.filter((c) => c.data_from !== 'null').length ?? 0}
          </span>
        </div>
      </div>

      {/* Client roster */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="section-title">Client Roster</h2>
        </div>

        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : clients?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Users size={20} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">No clients assigned</p>
            <p className="text-xs text-gray-400 max-w-xs">
              Clients are assigned to advisors by an admin. Once assigned, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {clients?.map((client) => (
              <div key={client._id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
                <Link to={`/advisor/clients/${client._id}`} className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-green-500/15 border border-green-500/20 flex items-center justify-center text-sm font-bold text-green-700 flex-shrink-0">
                    {(client.companyName || client.email).charAt(0).toUpperCase()}
                  </div>

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {client.companyName || <span className="text-gray-400 italic">No company name</span>}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{client.email}</p>
                  </div>

                  {/* Data source */}
                  <div className="flex-shrink-0">
                    {statusBadge(client.data_from)}
                  </div>

                  {/* Alerts */}
                  <div className="flex items-center gap-1 w-20 flex-shrink-0">
                    {client.activeAlerts > 0 ? (
                      <>
                        <AlertTriangle size={13} className="text-amber-400" />
                        <span className="text-xs text-amber-500 font-medium">{client.activeAlerts} alert{client.activeAlerts !== 1 ? 's' : ''}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={13} className="text-green-500" />
                        <span className="text-xs text-green-600">All clear</span>
                      </>
                    )}
                  </div>

                  {/* Last activity */}
                  <div className="flex items-center gap-1 w-28 flex-shrink-0">
                    <Clock size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {client.lastActivity
                        ? new Date(client.lastActivity).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'No activity'}
                    </span>
                  </div>

                  <ChevronRight size={15} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0 transition-colors" />
                </Link>

                {/* Delete */}
                <button
                  onClick={() => setConfirmDelete(client._id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                  title="Delete client"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {clients && clients.length > 0 && (
        <p className="text-xs text-gray-400 text-center">
          {clients.length} client{clients.length !== 1 ? 's' : ''} assigned to you.
          Contact an admin to add or reassign clients.
        </p>
      )}

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delete client?</h3>
            <p className="text-sm text-gray-500 mb-5">
              This will permanently delete the user account and all associated data — company info, screener results, alerts, audit entries, and advisory activity. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteUser.mutate(confirmDelete)}
                disabled={deleteUser.isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {deleteUser.isPending ? 'Deleting...' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
