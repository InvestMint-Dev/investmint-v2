import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  TrendingUp,
  Brain,
  Vault,
  Users,
  Settings,
  X,
  LogOut,
  UserCircle,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../lib/utils'

const CLIENT_NAV_GROUPS = [
  {
    label: null,
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Operating Layers',
    items: [
      { to: '/cash-flow', icon: TrendingUp, label: 'Intelligence', sublabel: 'Cash Forecasting' },
      { to: '/screener', icon: LayoutDashboard, label: 'Execution', sublabel: 'Investment Screener' },
      { to: '/vault', icon: Vault, label: 'Governance', sublabel: 'ClientVault + ALM' },
      { to: '/advisory', icon: Users, label: 'Advisory', sublabel: 'Human Layer' },
    ],
  },
  {
    label: null,
    items: [
      { to: '/intelligence', icon: Brain, label: 'AI Models' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

const ADVISOR_NAV_GROUPS = [
  {
    label: null,
    items: [
      { to: '/advisor/clients', icon: Users, label: 'My Clients' },
      { to: '/advisor/manage', icon: ShieldCheck, label: 'Manage Advisors' },
    ],
  },
  {
    label: null,
    items: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: Props) {
  const location = useLocation()
  const { user, logout, isAdvisor } = useAuth()

  const initials = getInitials(user?.email?.split('@')[0] || 'U')
  const navGroups = isAdvisor ? ADVISOR_NAV_GROUPS : CLIENT_NAV_GROUPS

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-[220px] bg-gray-900 flex flex-col
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="px-4 pt-5 pb-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center shadow-green">
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 15, height: 15 }} className="text-white">
                <path d="M3 17l4-8 4 4 4-6 4 4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 21h18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-[15px] font-bold text-white tracking-tight">
              Invest<span className="text-green-400">Mint</span>
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-500 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Advisor badge */}
        {isAdvisor && (
          <div className="mx-2.5 mt-3 px-2.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-2">
            <UserCircle size={13} className="text-green-400 flex-shrink-0" />
            <span className="text-[11px] font-semibold text-green-400">Advisor Portal</span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 overflow-y-auto space-y-4">
          {navGroups.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="px-2 mb-1.5 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, label, sublabel }: any) => {
                  const active = location.pathname === to || location.pathname.startsWith(to + '/')
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={onClose}
                      className={`
                        flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150
                        ${active
                          ? 'bg-green-500 text-white shadow-green'
                          : 'text-gray-400 hover:bg-white/[0.05] hover:text-white'
                        }
                      `}
                    >
                      <Icon size={16} className="flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="font-medium block leading-tight">{label}</span>
                        {sublabel && (
                          <span className={`text-[10px] leading-tight block ${active ? 'text-green-100' : 'text-gray-600'}`}>
                            {sublabel}
                          </span>
                        )}
                      </div>
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="px-2.5 pb-3 pt-2 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="w-7 h-7 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center text-[10px] font-bold text-green-400 flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-300 truncate">{user?.email}</p>
              <p className="text-[10px] text-gray-600">{isAdvisor ? 'Advisor account' : 'Business account'}</p>
            </div>
            <button onClick={logout} title="Sign out" className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
