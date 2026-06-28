import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const navigate          = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/dakop.png" alt="Dakop" className="h-8 w-auto" />
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/settings"
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 mr-1 max-w-[120px] sm:max-w-none truncate transition-colors"
                  title="Account settings"
                >
                  <span aria-hidden>⚙️</span>
                  <span className="truncate">Hi, {user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </nav>

        </div>
      </div>
    </header>
  )
}
