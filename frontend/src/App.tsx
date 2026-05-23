import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import OnboardingPage from './pages/onboarding/OnboardingPage'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/dashboard/DashboardPage'
import CashFlowPage from './pages/cash-flow/CashFlowPage'
import IntelligencePage from './pages/intelligence/IntelligencePage'
import ScreenerPage from './pages/screener/ScreenerPage'
import ClientVaultPage from './pages/vault/ClientVaultPage'
import AdvisoryPage from './pages/advisory/AdvisoryPage'
import SettingsPage from './pages/settings/SettingsPage'
import AdvisorClientsPage from './pages/advisor/AdvisorClientsPage'
import AdvisorClientDetailPage from './pages/advisor/AdvisorClientDetailPage'
import AdvisorManagePage from './pages/advisor/AdvisorManagePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <FullScreenLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function ClientOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdvisor, isLoading } = useAuth()
  if (isLoading) return <FullScreenLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (isAdvisor) return <Navigate to="/advisor/clients" replace />
  return <>{children}</>
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdvisor, isLoading, user } = useAuth()
  if (isLoading) return <FullScreenLoader />
  if (isAuthenticated) {
    if (isAdvisor) return <Navigate to="/advisor/clients" replace />
    return <Navigate to={!user?.data_from || user.data_from === 'null' ? '/onboarding' : '/dashboard'} replace />
  }
  return <>{children}</>
}

function FullScreenLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
        <p className="text-sm text-gray-400">Loading InvestMint...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
      <Route path="/signup" element={<AuthRoute><SignupPage /></AuthRoute>} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Onboarding — clients only */}
      <Route path="/onboarding" element={<ClientOnlyRoute><OnboardingPage /></ClientOnlyRoute>} />

      {/* Main app — clients only */}
      <Route path="/" element={<ClientOnlyRoute><AppLayout /></ClientOnlyRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="cash-flow" element={<CashFlowPage />} />
        <Route path="intelligence" element={<IntelligencePage />} />
        <Route path="screener" element={<ScreenerPage />} />
        <Route path="vault" element={<ClientVaultPage />} />
        <Route path="advisory" element={<AdvisoryPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Advisor portal */}
      <Route path="/advisor" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/advisor/clients" replace />} />
        <Route path="clients" element={<AdvisorClientsPage />} />
        <Route path="clients/:clientId" element={<AdvisorClientDetailPage />} />
        <Route path="manage" element={<AdvisorManagePage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
