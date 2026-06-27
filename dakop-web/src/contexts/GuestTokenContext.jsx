import { createContext, useContext } from 'react'

// Create a guest token once per browser. Used to prevent duplicate confirmation votes.
function getOrCreateGuestToken() {
  let token = localStorage.getItem('guest_token')
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem('guest_token', token)
  }
  return token
}

const GuestTokenContext = createContext(getOrCreateGuestToken())

export function GuestTokenProvider({ children }) {
  return (
    <GuestTokenContext.Provider value={getOrCreateGuestToken()}>
      {children}
    </GuestTokenContext.Provider>
  )
}

export function useGuestToken() {
  return useContext(GuestTokenContext)
}
