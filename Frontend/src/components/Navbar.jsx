import { NavLink } from 'react-router-dom'
import './Navbar.css'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Chat', path: '/chat' },
  { label: 'About', path: '/about' },
]

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="brand">KuraLew</div>
      <nav className="nav-menu" aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link--active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
