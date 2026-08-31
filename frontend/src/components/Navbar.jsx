import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-slate-900">
          Car Connect
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <span className="text-slate-600">
                {user.name} <span className="text-slate-400">({user.role})</span>
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-slate-100 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-200"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-medium text-slate-700 hover:text-slate-900">
                Log in
              </Link>
              <Link
                to="/register"
                className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white hover:bg-slate-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
