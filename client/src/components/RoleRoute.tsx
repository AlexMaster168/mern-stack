import { Navigate, Outlet } from 'react-router-dom'
import type { UserRole } from '../types'
import { useAuth } from '../features/auth/AuthContext'
import { Loader } from './Loader'

export function RoleRoute({ roles }: { roles: UserRole[] }) {
  const { user, loading } = useAuth()

  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to="/courses" replace />

  return <Outlet />
}
