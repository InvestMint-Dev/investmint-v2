import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const bankingApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// cashflowApi is now an alias for bankingApi — single server
export const cashflowApi = bankingApi

// Attach token from localStorage on each request
bankingApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect to login on 401 — but not when we're already on an auth page
bankingApi.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/signup')) {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
