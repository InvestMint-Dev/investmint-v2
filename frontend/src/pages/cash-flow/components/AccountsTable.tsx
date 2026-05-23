import type { Account } from '../../../types'
import { formatCurrency } from '../../../lib/utils'
import { TrendingUp, CreditCard, Landmark, DollarSign } from 'lucide-react'

interface Props { accounts: Account[] }

const TYPE_ICONS: Record<string, React.ElementType> = {
  BANK: Landmark,
  CREDIT_CARD: CreditCard,
  REVENUE: TrendingUp,
  EXPENSE: DollarSign,
}

const TYPE_BADGE: Record<string, string> = {
  BANK: 'badge-green',
  CREDIT_CARD: 'badge-red',
  ACCOUNTS_PAYABLE: 'badge-amber',
  ACCOUNTS_RECEIVABLE: 'badge-blue',
  REVENUE: 'badge-green',
  EXPENSE: 'badge-red',
  FIXED_ASSET: 'badge-gray',
  LIABILITY: 'badge-amber',
  EQUITY: 'badge-blue',
  OTHER: 'badge-gray',
}

const MOCK_ACCOUNTS: Account[] = [
  { user_id: '1', account_name: 'Main Operating Account', account_type: 'BANK', account_balance: 245830, account_id: 'acc1', currency: 'CAD' },
  { user_id: '1', account_name: 'US Operations', account_type: 'BANK', account_balance: 82400, account_id: 'acc2', currency: 'USD' },
  { user_id: '1', account_name: 'Corporate Visa', account_type: 'CREDIT_CARD', account_balance: -12500, account_id: 'acc3', currency: 'CAD' },
  { user_id: '1', account_name: 'Product Revenue', account_type: 'REVENUE', account_balance: 1240000, account_id: 'acc4', currency: 'CAD' },
  { user_id: '1', account_name: 'Operating Expenses', account_type: 'EXPENSE', account_balance: -820000, account_id: 'acc5', currency: 'CAD' },
]

export default function AccountsTable({ accounts }: Props) {
  const data = accounts.length > 0 ? accounts : MOCK_ACCOUNTS
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Account</th>
            <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Type</th>
            <th className="text-right py-2.5 px-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Balance</th>
            <th className="text-right py-2.5 px-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Currency</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((acc) => {
            const Icon = TYPE_ICONS[acc.account_type ?? 'BANK'] ?? Landmark
            const balance = acc.account_balance ?? 0
            return (
              <tr key={acc.account_id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                      <Icon size={14} className="text-gray-400" />
                    </div>
                    <span className="font-medium text-gray-800">{acc.account_name}</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className={TYPE_BADGE[acc.account_type ?? 'OTHER'] || 'badge-gray'}>
                    {acc.account_type}
                  </span>
                </td>
                <td className={`py-3 px-3 text-right font-semibold ${balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(balance), acc.currency ?? 'CAD')}
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="badge-gray">{acc.currency}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
