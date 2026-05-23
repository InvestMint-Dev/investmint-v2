import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { bankingApi } from '../../../lib/api'

const schema = z.object({
  companyName: z.string().min(1, 'Required'),
  email: z.string().email('Enter a valid email'),
  phoneNumber: z.string().min(10, 'Enter a valid phone number'),
  streetAddress: z.string().min(1, 'Required'),
  city: z.string().min(1, 'Required'),
  province: z.string().min(1, 'Required'),
  postalCode: z.string().min(1, 'Required'),
  country: z.string().min(1, 'Required'),
})
type Fields = z.infer<typeof schema>

interface Props { onNext: () => void }

export default function StepCompanyInfo({ onNext }: Props) {
  const userId = localStorage.getItem('userId')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Fields>({
    resolver: zodResolver(schema),
    defaultValues: { country: 'Canada' },
  })

  const onSubmit = async (data: Fields) => {
    try {
      await bankingApi.post(`/api/companyInformation/${userId}`, data)
      onNext()
    } catch {
      toast.error('Failed to save company info')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
          <Building2 size={20} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Company Information</h2>
          <p className="text-sm text-gray-500">Tell us about your business</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Company name</label>
            <input {...register('companyName')} className={`input ${errors.companyName ? 'input-error' : ''}`} placeholder="Acme Corp" />
            {errors.companyName && <p className="field-error">{errors.companyName.message}</p>}
          </div>

          <div>
            <label className="label">Business email</label>
            <input {...register('email')} type="email" className={`input ${errors.email ? 'input-error' : ''}`} placeholder="billing@acme.com" />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Phone number</label>
            <input {...register('phoneNumber')} className={`input ${errors.phoneNumber ? 'input-error' : ''}`} placeholder="+1 (416) 555-0123" />
            {errors.phoneNumber && <p className="field-error">{errors.phoneNumber.message}</p>}
          </div>

          <div className="col-span-2">
            <label className="label">Street address</label>
            <input {...register('streetAddress')} className={`input ${errors.streetAddress ? 'input-error' : ''}`} placeholder="123 King St W" />
            {errors.streetAddress && <p className="field-error">{errors.streetAddress.message}</p>}
          </div>

          <div>
            <label className="label">City</label>
            <input {...register('city')} className={`input ${errors.city ? 'input-error' : ''}`} placeholder="Toronto" />
            {errors.city && <p className="field-error">{errors.city.message}</p>}
          </div>

          <div>
            <label className="label">Province / State</label>
            <input {...register('province')} className={`input ${errors.province ? 'input-error' : ''}`} placeholder="ON" />
            {errors.province && <p className="field-error">{errors.province.message}</p>}
          </div>

          <div>
            <label className="label">Postal code</label>
            <input {...register('postalCode')} className={`input ${errors.postalCode ? 'input-error' : ''}`} placeholder="M5H 2N2" />
            {errors.postalCode && <p className="field-error">{errors.postalCode.message}</p>}
          </div>

          <div>
            <label className="label">Country</label>
            <select {...register('country')} className="input">
              <option value="Canada">Canada</option>
              <option value="United States">United States</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <>Continue <ArrowRight size={16} /></>}
          </button>
        </div>
      </form>
    </div>
  )
}
