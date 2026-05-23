import { Menu, Bell } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const ROUTE_META: Record<string, { title: string; sub?: string }> = {
  '/dashboard': { title: 'Dashboard' },
  '/cash-flow': { title: 'Intelligence Layer', sub: 'AI Cash Forecasting & Modeling' },
  '/screener': { title: 'Execution Layer', sub: 'Proprietary Investment Screener' },
  '/vault': { title: 'Governance Layer', sub: 'ClientVault + ALM Strategy' },
  '/advisory': { title: 'Human Layer', sub: 'Advisory — Former Capital Markets Executives' },
  '/intelligence': { title: 'AI Models' },
  '/settings': { title: 'Settings' },
}

interface Props { onMenuClick: () => void }

export default function Header({ onMenuClick }: Props) {
  const location = useLocation()
  const meta = ROUTE_META[location.pathname] || { title: 'InvestMint' }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-baseline gap-2">
        <h1 className="text-sm font-semibold text-gray-900">{meta.title}</h1>
        {meta.sub && (
          <span className="text-xs text-gray-400 hidden sm:block">{meta.sub}</span>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="relative p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full" />
        </button>
      </div>
    </header>
  )
}
