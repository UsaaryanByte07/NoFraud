import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../utils/api';

const Navbar = () => {
  const { user, isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.post('/logout', {});
    } catch {
      
    } finally {
      logout();
      setLoggingOut(false);
      navigate('/login');
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#e0e5ec] shadow-neu mb-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-20">
          {}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#e0e5ec] flex items-center justify-center shadow-neu group-hover:shadow-neu-hover transition-all">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
              NoFraud
            </span>
          </Link>

          {}
          <div className="hidden md:flex items-center gap-6">
            {isLoggedIn ? (
              <>
                <Link to="/fraud-check" className="text-slate-600 hover:text-indigo-600 font-semibold transition-colors">Analyzer</Link>
                <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 font-semibold transition-colors">Dashboard</Link>
                <span className="text-slate-500 text-sm ml-2 border-l-2 border-slate-300 pl-6 h-6 flex items-center">
                  Welcome, <span className="text-slate-800 font-bold ml-1">{user?.firstName || 'User'}</span>
                </span>
                <button onClick={handleLogout} disabled={loggingOut} className="px-5 py-2.5 ml-2 rounded-xl bg-[#e0e5ec] text-slate-700 font-bold shadow-neu hover:shadow-neu-hover active:shadow-neu-pressed transition-all text-sm disabled:opacity-50">
                  {loggingOut ? 'Signing out…' : 'Sign Out'}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-bold transition-colors">Sign In</Link>
                <Link to="/signup" className="px-6 py-2.5 rounded-xl bg-[#e0e5ec] text-indigo-600 font-bold shadow-neu hover:shadow-neu-hover active:shadow-neu-pressed transition-all">Get Started</Link>
              </>
            )}
          </div>

          {}
          <button
            className="md:hidden text-slate-600 hover:text-indigo-600 transition-colors p-2 rounded-xl shadow-neu active:shadow-neu-pressed bg-[#e0e5ec]"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {}
        {menuOpen && (
          <div className="md:hidden py-6 border-t border-slate-300/50 space-y-4">
            {isLoggedIn ? (
              <>
                <p className="text-slate-500 text-sm px-2 mb-4">
                  Welcome, <span className="text-slate-800 font-bold">{user?.firstName}</span>
                </p>
                <Link to="/fraud-check" onClick={() => setMenuOpen(false)} className="w-full block text-left px-5 py-3.5 rounded-xl shadow-neu active:shadow-neu-pressed text-slate-700 font-bold transition-all">Analyzer</Link>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="w-full block text-left px-5 py-3.5 rounded-xl shadow-neu active:shadow-neu-pressed text-slate-700 font-bold transition-all">Dashboard</Link>
                <div className="pt-4">
                  <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="w-full text-left px-5 py-3.5 rounded-xl shadow-neu active:shadow-neu-pressed text-red-600 font-bold transition-all">Sign Out</button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="w-full block text-left px-5 py-3.5 rounded-xl shadow-neu active:shadow-neu-pressed text-slate-700 font-bold transition-all">Sign In</Link>
                <Link to="/signup" onClick={() => setMenuOpen(false)} className="w-full block text-left px-5 py-3.5 rounded-xl shadow-neu active:shadow-neu-pressed text-indigo-600 font-bold transition-all mt-4">Get Started</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
