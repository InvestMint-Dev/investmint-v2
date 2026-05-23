import {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react'
import type { ReactNode } from 'react'
import { bankingApi } from '../lib/api'
import type { User } from '../types'

interface AuthContextValue {
  user: User | null
  userId: string | null
  isAuthenticated: boolean
  isAdvisor: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ data_from: string; role: string }>
  signup: (email: string, password: string) => Promise<{ userId: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const userId = localStorage.getItem('userId')

  useEffect(() => {
    if (userId) {
      bankingApi
        .get(`/api/auth/${userId}`)
        .then((res) => setUser(res.data.data))
        .catch(() => {
          localStorage.removeItem('userId')
          localStorage.removeItem('token')
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [userId])

  const login = async (email: string, password: string) => {
    const res = await bankingApi.post('/api/auth/login', { email, password })
    const { userId: id, data_from, token, role } = res.data
    localStorage.setItem('userId', id)
    if (token) localStorage.setItem('token', token)
    const userRes = await bankingApi.get(`/api/auth/${id}`)
    setUser(userRes.data.data)
    return { data_from, role }
  }

  const signup = async (email: string, password: string) => {
    const res = await bankingApi.post('/api/auth/signup', { email, password })
    const { userId: id, token } = res.data
    localStorage.setItem('userId', id)
    if (token) localStorage.setItem('token', token)
    const userRes = await bankingApi.get(`/api/auth/${id}`)
    setUser(userRes.data.data)
    return { userId: id }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('userId')
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const refreshUser = async () => {
    const id = localStorage.getItem('userId')
    if (!id) return
    const res = await bankingApi.get(`/api/auth/${id}`)
    setUser(res.data.data)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        isAuthenticated: !!user,
        isAdvisor: user?.role === 'advisor',
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
