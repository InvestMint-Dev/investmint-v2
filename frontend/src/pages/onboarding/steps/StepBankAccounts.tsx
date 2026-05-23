import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ArrowRight, Landmark, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { bankingApi } from '../../../lib/api'

const bankAccountSchema = z.object({
  bank: z.string().min(1, 'Required'),
  accountNumber: z.string().min(4, 'Required'),
  bankerName: z.string().min(1, 'Required'),
  currency: z.enum(['CAD', 'USD']),
  currentInterestRate: z.string().min(1, 'Required'),
})

const schema = z.object({
  authPersonnel: z.array(z.object({
    firstName: z.string().min(1, 'Required'),
    lastName: z.string().min(1, 'Required'),
    phoneNumber: z.string().min(10, 'Required'),
  })).min(1, 'Add at least one authorized person'),
  companyBankAccounts: z.array(bankAccountSchema).min(1, 'Add at least one account'),
})
type Fields = z.infer<typeof schema>

interface Props { onNext: () => void; onBack: () => void }

export default function StepBankAccounts({ onNext, onBack }: Props) {
  const userId = localStorage.getItem('userId')

  const { register, control, handleSubmit, formState: { isSubmitting } } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: {
      authPersonnel: [{ firstName: '', lastName: '', phoneNumber: '' }],
      companyBankAccounts: [{ bank: '', accountNumber: '', bankerName: '', currency: 'CAD', currentInterestRate: '' }],
    },
  })

  const personnel = useFieldArray({ control, name: 'authPersonnel' })
  const accounts = useFieldArray({ control, name: 'companyBankAccounts' })

  const onSubmit = async (data: Fields) => {
    try {
      await bankingApi.patch(`/api/companyInformation/${userId}`, data)
      onNext()
    } catch {
      toast.error('Failed to save account info')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
          <Landmark size={20} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Bank Accounts & Personnel</h2>
          <p className="text-sm text-gray-500">Who's authorized and where your funds are held</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Authorized personnel */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Authorized Personnel</h3>
            <button type="button" onClick={() => personnel.append({ firstName: '', lastName: '', phoneNumber: '' })} className="btn-ghost text-xs py-1 px-2">
              <Plus size={13} /> Add person
            </button>
          </div>
          <div className="space-y-4">
            {personnel.fields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-3 gap-3 items-start">
                <div>
                  <label className="label">First name</label>
                  <input {...register(`authPersonnel.${i}.firstName`)} className="input" placeholder="Jane" />
                </div>
                <div>
                  <label className="label">Last name</label>
                  <input {...register(`authPersonnel.${i}.lastName`)} className="input" placeholder="Doe" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="label">Phone</label>
                    <input {...register(`authPersonnel.${i}.phoneNumber`)} className="input" placeholder="+1 416..." />
                  </div>
                  {personnel.fields.length > 1 && (
                    <button type="button" onClick={() => personnel.remove(i)} className="mt-7 p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bank accounts */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Bank Accounts</h3>
            <button type="button" onClick={() => accounts.append({ bank: '', accountNumber: '', bankerName: '', currency: 'CAD', currentInterestRate: '' })} className="btn-ghost text-xs py-1 px-2">
              <Plus size={13} /> Add account
            </button>
          </div>
          <div className="space-y-6">
            {accounts.fields.map((field, i) => (
              <div key={field.id} className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Bank name</label>
                  <input {...register(`companyBankAccounts.${i}.bank`)} className="input" placeholder="TD Bank" />
                </div>
                <div>
                  <label className="label">Account number (last 4)</label>
                  <input {...register(`companyBankAccounts.${i}.accountNumber`)} className="input" placeholder="****1234" />
                </div>
                <div>
                  <label className="label">Banker name</label>
                  <input {...register(`companyBankAccounts.${i}.bankerName`)} className="input" placeholder="John Smith" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Currency</label>
                    <select {...register(`companyBankAccounts.${i}.currency`)} className="input">
                      <option value="CAD">CAD</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Interest rate</label>
                    <input {...register(`companyBankAccounts.${i}.currentInterestRate`)} className="input" placeholder="2.5%" />
                  </div>
                </div>
                {accounts.fields.length > 1 && (
                  <div className="col-span-2 flex justify-end">
                    <button type="button" onClick={() => accounts.remove(i)} className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
                      <Trash2 size={12} /> Remove account
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button type="button" onClick={onBack} className="btn-secondary">
            <ArrowLeft size={16} /> Back
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Continue <ArrowRight size={16} /></>}
          </button>
        </div>
      </form>
    </div>
  )
}
