import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { bankingApi } from '../../lib/api'
import { toast } from 'sonner'
import { UserCircle, PlusCircle, Mail, CheckCircle2, Shield, Trash2, Link2 } from 'lucide-react'

interface Advisor {
  _id: string
  email: string
  createdAt: string
}

interface Client {
  _id: string
  email: string
  companyName: string | null
  advisorId?: string
}

const createSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters'),
})
const promoteSchema = z.object({
  email: z.string().email('Enter a valid email'),
})

type CreateFields = z.infer<typeof createSchema>
type PromoteFields = z.infer<typeof promoteSchema>

export default function AdvisorManagePage() {
  const qc = useQueryClient()
  const [mode, setMode] = useState<'create' | 'promote'>('create')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedAdvisor, setSelectedAdvisor] = useState('')

  const { data: advisors, isLoading } = useQuery<Advisor[]>({
    queryKey: ['advisors'],
    queryFn: async () => {
      const res = await bankingApi.get('/api/advisor/all')
      return res.data.data || []
    },
  })

  const { data: allClients } = useQuery<Client[]>({
    queryKey: ['all-clients'],
    queryFn: async () => {
      const res = await bankingApi.get('/api/advisor/clients/all')
      return res.data.data || []
    },
  })

  const createForm = useForm<CreateFields>({ resolver: zodResolver(createSchema) })
  const promoteForm = useForm<PromoteFields>({ resolver: zodResolver(promoteSchema) })

  const createAdvisor = useMutation({
    mutationFn: async (data: CreateFields) => {
      await bankingApi.post('/api/advisor/create', data)
    },
    onSuccess: () => {
      toast.success('Advisor account created')
      qc.invalidateQueries({ queryKey: ['advisors'] })
      createForm.reset()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create account'),
  })

  const promoteAdvisor = useMutation({
    mutationFn: async (data: PromoteFields) => {
      await bankingApi.post('/api/advisor/promote', data)
    },
    onSuccess: () => {
      toast.success('User promoted to advisor')
      qc.invalidateQueries({ queryKey: ['advisors'] })
      promoteForm.reset()
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to promote user'),
  })

  const assignClient = useMutation({
    mutationFn: async ({ clientId, advisorId }: { clientId: string; advisorId: string }) => {
      await bankingApi.put('/api/advisor/assign', { clientId, advisorId })
    },
    onSuccess: () => {
      toast.success('Client assigned')
      qc.invalidateQueries({ queryKey: ['all-clients'] })
      qc.invalidateQueries({ queryKey: ['advisor-clients'] })
      setSelectedClient('')
      setSelectedAdvisor('')
    },
    onError: () => toast.error('Failed to assign client'),
  })

  const deleteAdvisor = useMutation({
    mutationFn: async (advisorId: string) => {
      await bankingApi.delete(`/api/advisor/user/${advisorId}`)
    },
    onSuccess: () => {
      toast.success('Advisor account deleted')
      qc.invalidateQueries({ queryKey: ['advisors'] })
      setConfirmDelete(null)
    },
    onError: () => toast.error('Failed to delete advisor'),
  })

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-green-600 uppercase tracking-widest">Advisor Portal</span>
        </div>
        <h1 className="page-title flex items-center gap-2">
          <Shield size={20} className="text-gray-500" /> Manage Advisors
        </h1>
        <p className="page-subtitle">
          Add new advisor accounts or promote existing users. Advisors can view all assigned clients and log advisory activity.
        </p>
      </div>

      {/* Add advisor */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Add Advisor</h2>

        {/* Toggle */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg w-fit mb-5">
          {(['create', 'promote'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {m === 'create' ? 'New account' : 'Promote existing user'}
            </button>
          ))}
        </div>

        {mode === 'create' ? (
          <form onSubmit={createForm.handleSubmit((d) => createAdvisor.mutate(d))} className="space-y-4">
            <p className="text-sm text-gray-500">
              Creates a brand new advisor account. Share the credentials with the new advisor — they can change their password in Settings.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Email address</label>
                <input
                  {...createForm.register('email')}
                  type="email"
                  placeholder="advisor@investmintapp.com"
                  className={`input ${createForm.formState.errors.email ? 'input-error' : ''}`}
                />
                {createForm.formState.errors.email && (
                  <p className="field-error">{createForm.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="label">Temporary password</label>
                <input
                  {...createForm.register('password')}
                  type="password"
                  placeholder="Min. 8 characters"
                  className={`input ${createForm.formState.errors.password ? 'input-error' : ''}`}
                />
                {createForm.formState.errors.password && (
                  <p className="field-error">{createForm.formState.errors.password.message}</p>
                )}
              </div>
            </div>
            <button type="submit" disabled={createAdvisor.isPending} className="btn-primary">
              {createAdvisor.isPending
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><PlusCircle size={15} /> Create advisor account</>
              }
            </button>
          </form>
        ) : (
          <form onSubmit={promoteForm.handleSubmit((d) => promoteAdvisor.mutate(d))} className="space-y-4">
            <p className="text-sm text-gray-500">
              If someone already has a client account, enter their email to upgrade it to advisor access. They keep their existing password.
            </p>
            <div className="max-w-sm">
              <label className="label">Email address</label>
              <input
                {...promoteForm.register('email')}
                type="email"
                placeholder="existing.user@company.com"
                className={`input ${promoteForm.formState.errors.email ? 'input-error' : ''}`}
              />
              {promoteForm.formState.errors.email && (
                <p className="field-error">{promoteForm.formState.errors.email.message}</p>
              )}
            </div>
            <button type="submit" disabled={promoteAdvisor.isPending} className="btn-primary">
              {promoteAdvisor.isPending
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Mail size={15} /> Promote to advisor</>
              }
            </button>
          </form>
        )}
      </div>

      {/* Assign clients */}
      <div className="card p-6">
        <h2 className="section-title mb-1">Assign Client to Advisor</h2>
        <p className="text-sm text-gray-500 mb-5">
          Select a client and an advisor to link them. The client will appear in that advisor's roster.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="label">Client</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="input"
            >
              <option value="">Select a client…</option>
              {allClients?.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.companyName || c.email}
                  {c.advisorId ? ' (assigned)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Advisor</label>
            <select
              value={selectedAdvisor}
              onChange={(e) => setSelectedAdvisor(e.target.value)}
              className="input"
            >
              <option value="">Select an advisor…</option>
              {advisors?.map((a) => (
                <option key={a._id} value={a._id}>{a.email}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Current assignments preview */}
        {allClients && allClients.some((c) => c.advisorId) && (
          <div className="mb-4 rounded-lg bg-gray-50 border border-gray-100 divide-y divide-gray-100">
            {allClients.filter((c) => c.advisorId).map((c) => {
              const advisor = advisors?.find((a) => a._id === c.advisorId)
              return (
                <div key={c._id} className="flex items-center gap-2 px-3 py-2 text-xs text-gray-600">
                  <span className="font-medium truncate">{c.companyName || c.email}</span>
                  <span className="text-gray-400 flex-shrink-0">→</span>
                  <span className="truncate text-gray-500">{advisor?.email || c.advisorId}</span>
                </div>
              )
            })}
          </div>
        )}

        <button
          onClick={() => assignClient.mutate({ clientId: selectedClient, advisorId: selectedAdvisor })}
          disabled={!selectedClient || !selectedAdvisor || assignClient.isPending}
          className="btn-primary"
        >
          {assignClient.isPending
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <><Link2 size={15} /> Assign client</>
          }
        </button>
      </div>

      {/* Current advisors */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="section-title">Current Advisors</h2>
        </div>
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
          </div>
        ) : advisors?.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">No advisors yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {advisors?.map((advisor) => (
              <div key={advisor._id} className="flex items-center gap-3 px-5 py-3.5 group">
                <div className="w-9 h-9 rounded-full bg-green-500/15 border border-green-500/20 flex items-center justify-center text-sm font-bold text-green-700 flex-shrink-0">
                  {advisor.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{advisor.email}</p>
                  <p className="text-xs text-gray-400">
                    Added {new Date(advisor.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-1 mr-2">
                  <CheckCircle2 size={13} className="text-green-500" />
                  <span className="text-xs text-green-600 font-medium">Advisor</span>
                </div>
                <button
                  onClick={() => setConfirmDelete(advisor._id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                  title="Delete advisor"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-base font-semibold text-gray-900 mb-2">Delete advisor account?</h3>
            <p className="text-sm text-gray-500 mb-5">
              This will permanently delete the advisor account and all associated data. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteAdvisor.mutate(confirmDelete)}
                disabled={deleteAdvisor.isPending}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {deleteAdvisor.isPending ? 'Deleting...' : 'Delete permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
