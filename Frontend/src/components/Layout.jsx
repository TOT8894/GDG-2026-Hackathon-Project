import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-content">
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>Built for GDG 2026 Hackathon · React + Vite</p>
      </footer>
    </div>
  )
}
