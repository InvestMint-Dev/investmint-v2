import axios from 'axios'

const BANKING_URL = import.meta.env.VITE_BANKING_API_URL || 'http://localhost:8000'
const CASHFLOW_URL = import.meta.env.VITE_CASHFLOW_API_URL || 'http://localhost:4000'

export const bankingApi = axios.create({
  baseURL: BANKING_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

export const cashflowApi = axios.create({
  baseURL: CASHFLOW_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token from localStorage on each request
bankingApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

cashflowApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401 — but not when we're already on an auth page
const handle401 = (error: any) => {
  if (error.response?.status === 401 && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    window.location.href = '/login'
  }
  return Promise.reject(error)
}

bankingApi.interceptors.response.use((r) => r, handle401)
cashflowApi.interceptors.response.use((r) => r, handle401)
