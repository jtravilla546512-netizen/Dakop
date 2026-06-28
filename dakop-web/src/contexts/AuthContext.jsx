import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount, check if there's a saved token and fetch the current user
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (!token) { setLoading(false); return }

    api.get('/me')
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem('auth_token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const res = await api.post('/login', { email, password })
    localStorage.setItem('auth_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  async function register(name, email, password, passwordConfirmation) {
    const res = await api.post('/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    })
    localStorage.setItem('auth_token', res.data.token)
    setUser(res.data.user)
    return res.data.user
  }

  async function logout() {
    await api.post('/logout').catch(() => {})
    localStorage.removeItem('auth_token')
    setUser(null)
  }

  // Merge updated fields (e.g. after editing profile) into the current user
  function updateUser(patch) {
    setUser(u => ({ ...u, ...patch }))
  }

  // Clear local session without calling the API (e.g. after deleting the account)
  function clearSession() {
    localStorage.removeItem('auth_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, clearSession }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — components call useAuth() instead of useContext(AuthContext)
export function useAuth() {
  return useContext(AuthContext)
}
