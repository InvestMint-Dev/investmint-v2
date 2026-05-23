import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useQuery, useMutation } from '@tanstack/react-query'
import { bankingApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { CompanyInformation } from '../../types'
import { Building2, Lock, User, LogOut } from 'lucide-react'

type Section = 'profile' | 'company' | 'security'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
type PasswordFields = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const { userId, user, logout } = useAuth()
  const [section, setSection] = useState<Section>('profile')

  const { data: company } = useQuery<CompanyInformation>({
    queryKey: ['company', userId],
    queryFn: async () => {
      const res = await bankingApi.get(`/api/companyInformation/${userId}`)
      return res.data.data
    },
    enabled: !!userId,
  })

  const pwForm = useForm<PasswordFields>({ resolver: zodResolver(passwordSchema) })

  const changePassword = useMutation({
    mutationFn: async (data: PasswordFields) => {
      await bankingApi.post(`/api/auth/change-password`, {
        userId,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
    },
    onSuccess: () => {
      toast.success('Password updated')
      pwForm.reset()
    },
    onError: () => toast.error('Could not update password'),
  })

  const SECTIONS = [
    { key: 'profile' as const, label: 'Profile', icon: User },
    { key: 'company' as const, label: 'Company', icon: Building2 },
    { key: 'security' as const, label: 'Security', icon: Lock },
  ]

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and preferences</p>
      </div>

      <div className="flex gap-1 border-b border-gray-200">
        {SECTIONS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSection(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              section === key
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {section === 'profile' && (
        <div className="card p-6 space-y-5 animate-fade-in">
          <h2 className="section-title">Profile</h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-green-500/15 border-2 border-green-200 flex items-center justify-center text-lg font-bold text-green-700">
              {user?.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.email}</p>
              <p className="text-sm text-gray-500">Business account</p>
            </div>
          </div>
          <div className="divider" />
          <div>
            <label className="label">Email address</label>
            <input value={user?.email || ''} readOnly className="input bg-gray-50 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Contact support to change your email</p>
          </div>
          <div>
            <label className="label">Data source</label>
            <div className="flex items-center gap-2">
              <span className={`badge ${user?.data_from === 'UNF' ? 'badge-green' : user?.data_from === 'uploaded' ? 'badge-blue' : 'badge-gray'}`}>
                {user?.data_from === 'UNF' ? 'QuickBooks' : user?.data_from === 'uploaded' ? 'Excel Upload' : 'Not connected'}
              </span>
            </div>
          </div>
          <div className="divider" />
          <button onClick={logout} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}

      {section === 'company' && (
        <div className="card p-6 space-y-5 animate-fade-in">
          <h2 className="section-title">Company Information</h2>
          {company ? (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Company Name', value: company.companyName },
                { label: 'Business Email', value: company.email },
                { label: 'Phone', value: company.phoneNumber },
                { label: 'City', value: company.city },
                { label: 'Province', value: company.province },
                { label: 'Country', value: company.country },
              ].map(({ label, value }) => (
                <div key={label}>
                  <label className="label">{label}</label>
                  <input value={value || ''} readOnly className="input bg-gray-50" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-10" />)}
            </div>
          )}
          <p className="text-xs text-gray-400">To update company info, complete the setup flow or contact support.</p>
        </div>
      )}

      {section === 'security' && (
        <div className="card p-6 space-y-5 animate-fade-in">
          <h2 className="section-title">Change Password</h2>
          <form onSubmit={pwForm.handleSubmit((d) => changePassword.mutate(d))} className="space-y-4">
            <div>
              <label className="label">Current password</label>
              <input {...pwForm.register('currentPassword')} type="password" className={`input ${pwForm.formState.errors.currentPassword ? 'input-error' : ''}`} />
              {pwForm.formState.errors.currentPassword && <p className="field-error">{pwForm.formState.errors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="label">New password</label>
              <input {...pwForm.register('newPassword')} type="password" className={`input ${pwForm.formState.errors.newPassword ? 'input-error' : ''}`} />
              {pwForm.formState.errors.newPassword && <p className="field-error">{pwForm.formState.errors.newPassword.message}</p>}
            </div>
            <div>
              <label className="label">Confirm new password</label>
              <input {...pwForm.register('confirmPassword')} type="password" className={`input ${pwForm.formState.errors.confirmPassword ? 'input-error' : ''}`} />
              {pwForm.formState.errors.confirmPassword && <p className="field-error">{pwForm.formState.errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={changePassword.isPending} className="btn-primary">
              {changePassword.isPending ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Update password'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
