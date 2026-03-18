import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import FlashMessage from '../components/FlashMessage';
import Spinner from '../components/Spinner';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState({ message: '', type: 'error' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFlash({ message: '', type: 'error' });
    try {
      const data = await api.post('/login', form);
      login(data.user);
      navigate('/dashboard');
    } catch (err) {
      
      if (err.message?.toLowerCase().includes('verify')) {
        setFlash({ message: err.message, type: 'warning' });
        setTimeout(() => navigate(`/verify-otp?email=${encodeURIComponent(form.email)}`), 1500);
      } else {
        setFlash({ message: err.message, type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full">
      {}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-200/50 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {}
        <div className="bg-[#e0e5ec] rounded-3xl p-8 sm:p-10 shadow-neu">
          {}
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 rounded-2xl bg-[#e0e5ec] flex items-center justify-center shadow-neu group-hover:shadow-neu-hover transition-all">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
                NoFraud
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
            <p className="text-slate-500 text-sm mt-2">Sign in to your account</p>
          </div>

          {}
          {flash.message && (
            <div className="mb-4">
              <FlashMessage
                message={flash.message}
                type={flash.type}
                onClose={() => setFlash({ message: '', type: flash.type })}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Email address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full bg-[#e0e5ec] shadow-neu-inner rounded-xl px-5 py-3.5 text-slate-800 placeholder-slate-400 text-sm ring-neu-focus transition-all border-none"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2 ml-1 pr-1">
                <label className="block text-sm font-bold text-slate-600">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#e0e5ec] shadow-neu-inner rounded-xl px-5 py-3.5 pr-12 text-slate-800 placeholder-slate-400 text-sm ring-neu-focus transition-all border-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#e0e5ec] disabled:opacity-50 disabled:cursor-not-allowed text-indigo-600 font-bold text-base transition-all shadow-neu hover:shadow-neu-hover active:shadow-neu-pressed flex items-center justify-center gap-2"
              >
                {loading ? <><Spinner size="sm" /> Signing in…</> : 'Sign In'}
              </button>
            </div>
          </form>

          {}
          <p className="text-center text-slate-500 font-medium text-sm mt-8">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-indigo-600 hover:text-indigo-500 font-bold transition-colors ml-1">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
