import { useState, useCallback } from 'react'
import { ArrowLeft, Upload, Zap, CheckCircle2, FileSpreadsheet, X } from 'lucide-react'
import { toast } from 'sonner'
import { cashflowApi, bankingApi } from '../../../lib/api'

interface Props { onFinish: () => void; onBack: () => void }

type Method = 'quickbooks' | 'excel' | null

const WORKSPACE_ID = import.meta.env.VITE_UNIFIED_WORKSPACE_ID || ''

export default function StepCashFlowConnect({ onFinish, onBack }: Props) {
  const userId = localStorage.getItem('userId')
  const [method, setMethod] = useState<Method>(null)
  const [accounts, setAccounts] = useState<File | null>(null)
  const [transactions, setTransactions] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)

  const connectQuickbooks = () => {
    const params = new URLSearchParams({
      success_redirect: `${window.location.origin}/onboarding?qb_success=1`,
      failure_redirect: `${window.location.origin}/onboarding?qb_fail=1`,
      workspace_id: WORKSPACE_ID,
      categories: 'accounting',
    })
    window.location.href = `https://app.unified.to/unified/integration/auth?${params}`
  }

  const onDrop = useCallback((setter: (f: File) => void) => (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) setter(file)
  }, [])

  const uploadExcel = async () => {
    if (!accounts || !transactions) {
      toast.error('Please upload both files')
      return
    }
    setUploading(true)
    try {
      const accForm = new FormData()
      accForm.append('userId', userId!)
      accForm.append('data', accounts)
      await cashflowApi.post('/addAcountExcel', accForm, { headers: { 'Content-Type': 'multipart/form-data' } })

      const txForm = new FormData()
      txForm.append('userId', userId!)
      txForm.append('data', transactions)
      await cashflowApi.post('/addTransactionsExcel', txForm, { headers: { 'Content-Type': 'multipart/form-data' } })

      await bankingApi.put(`/api/auth/update-data-from/${userId}`, { data_from: 'uploaded' })
      await cashflowApi.get(`/runPythonScript?userId=${userId}&dataFrom=uploaded`)

      setDone(true)
      toast.success('Data uploaded successfully!')
    } catch {
      toast.error('Upload failed. Please check your files and try again.')
    } finally {
      setUploading(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle2 size={36} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
        <p className="text-gray-500 text-sm text-center max-w-xs mb-8">
          Your data is connected. InvestMint is analyzing your cash flow and generating recommendations.
        </p>
        <button onClick={onFinish} className="btn-primary px-8">
          Go to dashboard
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
          <Zap size={20} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Connect Your Cash Flow Data</h2>
          <p className="text-sm text-gray-500">We need your financial data to generate ETF recommendations</p>
        </div>
      </div>

      {!method ? (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setMethod('quickbooks')}
            className="card-hover p-6 flex flex-col items-center gap-3 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#2CA01C]/10 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
                <rect width="40" height="40" rx="8" fill="#2CA01C" />
                <path d="M20 8a12 12 0 1 1 0 24A12 12 0 0 1 20 8zm-3 7v10l9-5-9-5z" fill="white" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-900">QuickBooks</p>
              <p className="text-xs text-gray-500 mt-0.5">Connect your accounting software for live sync</p>
            </div>
            <span className="badge-green">Recommended</span>
          </button>

          <button
            onClick={() => setMethod('excel')}
            className="card-hover p-6 flex flex-col items-center gap-3 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
              <FileSpreadsheet size={32} className="text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Upload Excel</p>
              <p className="text-xs text-gray-500 mt-0.5">Upload your accounts and transactions manually</p>
            </div>
            <span className="badge-gray">Manual</span>
          </button>
        </div>
      ) : method === 'quickbooks' ? (
        <div className="card p-8 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#2CA01C]/10 flex items-center justify-center">
            <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
              <rect width="40" height="40" rx="8" fill="#2CA01C" />
              <path d="M20 8a12 12 0 1 1 0 24A12 12 0 0 1 20 8zm-3 7v10l9-5-9-5z" fill="white" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Connect QuickBooks</h3>
          <p className="text-sm text-gray-500 text-center max-w-xs">
            You'll be redirected to QuickBooks to authorize InvestMint to read your accounting data. We never modify your data.
          </p>
          <button onClick={connectQuickbooks} className="btn-primary px-8">
            Connect QuickBooks
          </button>
          <button onClick={() => setMethod(null)} className="text-sm text-gray-400 hover:text-gray-600">
            Choose a different method
          </button>
        </div>
      ) : (
        <div className="card p-6 space-y-5">
          <p className="text-sm text-gray-600">
            Upload your accounts and transactions as Excel files (.xlsx). Download our{' '}
            <a href="#" className="text-green-600 font-medium hover:underline">template files</a>{' '}
            to get started.
          </p>

          {/* Accounts file */}
          <div>
            <label className="label">Accounts file (.xlsx) *</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop((f) => setAccounts(f))}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-green-300 transition-colors cursor-pointer"
              onClick={() => document.getElementById('acc-input')?.click()}
            >
              {accounts ? (
                <div className="flex items-center justify-center gap-2">
                  <FileSpreadsheet size={18} className="text-green-500" />
                  <span className="text-sm font-medium text-gray-700">{accounts.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setAccounts(null) }} className="text-gray-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={20} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Drop your accounts file here or <span className="text-green-600">browse</span></p>
                </>
              )}
              <input id="acc-input" type="file" accept=".xlsx,.xls" className="sr-only" onChange={(e) => e.target.files?.[0] && setAccounts(e.target.files[0])} />
            </div>
          </div>

          {/* Transactions file */}
          <div>
            <label className="label">Transactions file (.xlsx) *</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop((f) => setTransactions(f))}
              className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-green-300 transition-colors cursor-pointer"
              onClick={() => document.getElementById('tx-input')?.click()}
            >
              {transactions ? (
                <div className="flex items-center justify-center gap-2">
                  <FileSpreadsheet size={18} className="text-green-500" />
                  <span className="text-sm font-medium text-gray-700">{transactions.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setTransactions(null) }} className="text-gray-400 hover:text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={20} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Drop your transactions file here or <span className="text-green-600">browse</span></p>
                </>
              )}
              <input id="tx-input" type="file" accept=".xlsx,.xls" className="sr-only" onChange={(e) => e.target.files?.[0] && setTransactions(e.target.files[0])} />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={() => setMethod(null)} className="btn-ghost text-sm">
              ← Different method
            </button>
            <button onClick={uploadExcel} disabled={uploading || !accounts || !transactions} className="btn-primary">
              {uploading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Upload size={15} /> Upload & Analyze</>}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-5">
        <button onClick={onBack} className="btn-secondary">
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={onFinish} className="btn-ghost text-sm text-gray-400">
          Skip for now →
        </button>
      </div>
    </div>
  )
}
