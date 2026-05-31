import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import { Loader } from './Loader'

export function ProtectedRoute() {
  const { user, loading } = useAuth()

  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" replace />

  return <Outlet />
}
