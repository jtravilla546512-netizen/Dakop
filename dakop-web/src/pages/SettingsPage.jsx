import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../contexts/AuthContext'

// Small reusable status banner
function Banner({ type, children }) {
  if (!children) return null
  const styles = type === 'error'
    ? 'text-red-600 bg-red-50 border-red-200'
    : 'text-green-700 bg-green-50 border-green-200'
  return (
    <p className={`text-sm border rounded-lg px-3 py-2 ${styles}`}>{children}</p>
  )
}

const inputClass =
  'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function SettingsPage() {
  const { user, updateUser, logout, clearSession } = useAuth()
  const navigate = useNavigate()

  // Redirect guests away
  useEffect(() => {
    if (user === null) {
      const token = localStorage.getItem('auth_token')
      if (!token) navigate('/login')
    }
  }, [user, navigate])

  // ── Profile section ──────────────────────────────────────────────────────
  const [profile, setProfile] = useState({ name: '', email: '' })
  const [profileMsg, setProfileMsg] = useState(null)
  const [profileErr, setProfileErr] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (user) setProfile({ name: user.name ?? '', email: user.email ?? '' })
  }, [user])

  async function saveProfile(e) {
    e.preventDefault()
    setProfileMsg(null); setProfileErr(null); setSavingProfile(true)
    try {
      const res = await api.put('/profile', profile)
      updateUser(res.data)
      setProfileMsg('Profile updated.')
    } catch (err) {
      setProfileErr(err.response?.data?.message ?? 'Could not update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  // ── Password section ─────────────────────────────────────────────────────
  const [pw, setPw] = useState({ current_password: '', password: '', password_confirmation: '' })
  const [pwMsg, setPwMsg] = useState(null)
  const [pwErr, setPwErr] = useState(null)
  const [savingPw, setSavingPw] = useState(false)

  async function savePassword(e) {
    e.preventDefault()
    setPwMsg(null); setPwErr(null); setSavingPw(true)
    try {
      await api.put('/password', pw)
      setPw({ current_password: '', password: '', password_confirmation: '' })
      setPwMsg('Password changed.')
    } catch (err) {
      setPwErr(
        err.response?.data?.errors?.current_password?.[0] ??
        err.response?.data?.errors?.password?.[0] ??
        err.response?.data?.message ??
        'Could not change password.'
      )
    } finally {
      setSavingPw(false)
    }
  }

  // ── Delete account ───────────────────────────────────────────────────────
  const [showDelete, setShowDelete] = useState(false)
  const [deletePw, setDeletePw] = useState('')
  const [deleteErr, setDeleteErr] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function deleteAccount(e) {
    e.preventDefault()
    setDeleteErr(null); setDeleting(true)
    try {
      await api.delete('/profile', { data: { password: deletePw } })
      clearSession()
      navigate('/')
    } catch (err) {
      setDeleteErr(err.response?.data?.message ?? 'Could not delete account.')
    } finally {
      setDeleting(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Account settings</h1>
          <button onClick={() => navigate('/')} className="text-sm text-blue-600 hover:underline">
            ← Back to map
          </button>
        </div>

        {/* Profile */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
          <form onSubmit={saveProfile} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display name</label>
              <input
                type="text" required value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" required value={profile.email}
                onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                className={inputClass}
              />
            </div>
            <Banner type="error">{profileErr}</Banner>
            <Banner type="success">{profileMsg}</Banner>
            <button
              type="submit" disabled={savingProfile}
              className="self-start px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {savingProfile ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </section>

        {/* Password */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Change password</h2>
          <form onSubmit={savePassword} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
              <input
                type="password" required autoComplete="current-password" value={pw.current_password}
                onChange={e => setPw(p => ({ ...p, current_password: e.target.value }))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
              <input
                type="password" required autoComplete="new-password" value={pw.password}
                onChange={e => setPw(p => ({ ...p, password: e.target.value }))}
                className={inputClass}
                placeholder="8+ chars, letters and numbers"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
              <input
                type="password" required autoComplete="new-password" value={pw.password_confirmation}
                onChange={e => setPw(p => ({ ...p, password_confirmation: e.target.value }))}
                className={inputClass}
              />
            </div>
            <Banner type="error">{pwErr}</Banner>
            <Banner type="success">{pwMsg}</Banner>
            <button
              type="submit" disabled={savingPw}
              className="self-start px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {savingPw ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </section>

        {/* Danger zone */}
        <section className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-red-700 mb-1">Delete account</h2>
          <p className="text-sm text-gray-500 mb-4">
            This permanently removes your account. Your past reports stay visible but are no longer linked to you.
          </p>

          {!showDelete ? (
            <button
              onClick={() => setShowDelete(true)}
              className="px-5 py-2.5 rounded-xl border border-red-300 text-red-700 font-semibold text-sm hover:bg-red-50 transition-colors"
            >
              Delete my account
            </button>
          ) : (
            <form onSubmit={deleteAccount} className="flex flex-col gap-3">
              <label className="block text-sm font-medium text-gray-700">
                Enter your password to confirm
              </label>
              <input
                type="password" required value={deletePw}
                onChange={e => setDeletePw(e.target.value)}
                className={inputClass}
              />
              <Banner type="error">{deleteErr}</Banner>
              <div className="flex gap-2">
                <button
                  type="submit" disabled={deleting}
                  className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-60 transition-colors"
                >
                  {deleting ? 'Deleting…' : 'Permanently delete'}
                </button>
                <button
                  type="button" onClick={() => { setShowDelete(false); setDeletePw(''); setDeleteErr(null) }}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Log out */}
        <button
          onClick={() => { logout(); navigate('/') }}
          className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          Log out
        </button>
      </div>
    </div>
  )
}
