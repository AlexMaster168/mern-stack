import { Link as RouterLink, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <RouterLink to="/" className="text-lg font-bold text-indigo-600">
          🎓 EduLink
        </RouterLink>

        <div className="flex items-center gap-4 text-sm">
          <NavLink to="/courses" className={navLinkClass}>
            Курсы
          </NavLink>
          {user ? (
            <>
              <NavLink to="/my-courses" className={navLinkClass}>
                Мои курсы
              </NavLink>
              <NavLink to="/certificates" className={navLinkClass}>
                Сертификаты
              </NavLink>
              {(user.role === 'instructor' || user.role === 'admin') && (
                <NavLink to="/teach" className={navLinkClass}>
                  Преподавание
                </NavLink>
              )}
              <NavLink to="/links" className={navLinkClass}>
                Ссылки
              </NavLink>
              <NavLink to="/workspaces" className={navLinkClass}>
                Команды
              </NavLink>
              <span className="hidden text-slate-500 sm:inline">{user.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg bg-slate-100 px-3 py-1.5 transition hover:bg-slate-200"
              >
                Выйти
              </button>
            </>
          ) : (
            <NavLink to="/login" className={navLinkClass}>
              Войти
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  )
}

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return isActive ? 'font-medium text-indigo-600' : 'text-slate-600 hover:text-slate-900'
}
