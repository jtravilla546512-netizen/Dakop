import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate     = useNavigate()
  const [form, setForm]   = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.password_confirmation)
      navigate('/')
    } catch (err) {
      setErrors(err.response?.data?.errors ?? { general: ['Something went wrong.'] })
    } finally {
      setLoading(false)
    }
  }

  function field(name, label, type = 'text', placeholder = '') {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          type={type}
          required
          value={form[name]}
          onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
          placeholder={placeholder}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors[name] && (
          <p className="text-xs text-red-600 mt-1">{errors[name][0]}</p>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              D
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Create account</h1>
          <p className="text-sm text-gray-500 text-center mb-6">Join to report checkpoints</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {field('name',                  'Full name',        'text',     'Juan dela Cruz')}
            {field('email',                 'Email',            'email',    'you@example.com')}
            {field('password',              'Password',         'password', '8+ characters')}
            {field('password_confirmation', 'Confirm password', 'password', 'Repeat password')}

            {errors.general && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {errors.general[0]}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
