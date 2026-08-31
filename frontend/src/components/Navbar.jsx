import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { buttonClass } from './ui/buttonClass';
import NotificationBell from './NotificationBell';

const navLink = 'text-sm font-medium text-white/70 transition-colors hover:text-white';
const mobileNavLink = 'block py-2 text-sm font-medium text-white/70 hover:text-white';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="bg-ink">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-display text-2xl tracking-wider text-white" onClick={closeMenu}>
          CAR CONNECT
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-5 sm:flex">
          {user ? (
            <>
              {user.role === 'customer' && (
                <>
                  <Link to="/vehicles" className={navLink}>
                    My Vehicles
                  </Link>
                  <Link to="/my-reports" className={navLink}>
                    My Reports
                  </Link>
                  <Link to="/appointments" className={navLink}>
                    Appointments
                  </Link>
                  <Link to="/report-fault" className={buttonClass('primary', 'text-xs px-3 py-1.5')}>
                    Report a Problem
                  </Link>
                  <NotificationBell />
                </>
              )}
              {user.role === 'mechanic' && (
                <>
                  <Link to="/mechanic" className={navLink}>
                    Dashboard
                  </Link>
                  <Link to="/availability" className={navLink}>
                    Availability
                  </Link>
                </>
              )}
              <span className="font-mono text-xs text-white/50">
                {user.name} · {user.role}
              </span>
              <button onClick={handleLogout} className={navLink}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={navLink}>
                Log in
              </Link>
              <Link to="/register" className={buttonClass('primary', 'text-xs px-3 py-1.5')}>
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile: bell (customer) + menu toggle */}
        <div className="flex items-center gap-1 sm:hidden">
          {user?.role === 'customer' && <NotificationBell />}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="p-2 text-xl text-white"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="border-t border-white/10 px-4 py-3 sm:hidden">
          {user ? (
            <>
              {user.role === 'customer' && (
                <>
                  <Link to="/vehicles" className={mobileNavLink} onClick={closeMenu}>
                    My Vehicles
                  </Link>
                  <Link to="/my-reports" className={mobileNavLink} onClick={closeMenu}>
                    My Reports
                  </Link>
                  <Link to="/appointments" className={mobileNavLink} onClick={closeMenu}>
                    Appointments
                  </Link>
                  <Link
                    to="/report-fault"
                    className={buttonClass('primary', 'mt-2 w-full text-xs')}
                    onClick={closeMenu}
                  >
                    Report a Problem
                  </Link>
                </>
              )}
              {user.role === 'mechanic' && (
                <>
                  <Link to="/mechanic" className={mobileNavLink} onClick={closeMenu}>
                    Dashboard
                  </Link>
                  <Link to="/availability" className={mobileNavLink} onClick={closeMenu}>
                    Availability
                  </Link>
                </>
              )}
              <p className="mt-3 font-mono text-xs text-white/50">
                {user.name} · {user.role}
              </p>
              <button onClick={handleLogout} className={`${mobileNavLink} text-left`}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={mobileNavLink} onClick={closeMenu}>
                Log in
              </Link>
              <Link to="/register" className={buttonClass('primary', 'mt-2 w-full text-xs')} onClick={closeMenu}>
                Sign up
              </Link>
            </>
          )}
        </div>
      )}

      <div className="hazard-stripe" />
    </header>
  );
}
