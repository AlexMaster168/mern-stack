import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
