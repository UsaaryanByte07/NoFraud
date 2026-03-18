import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import FlashMessage from '../components/FlashMessage';
import Spinner from '../components/Spinner';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState({ message: '', type: 'error' });
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setFlash({ message: 'Invalid or missing reset link. Please request a new one.', type: 'error' });
    }
  }, [token, email]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setFlash({ message: 'Passwords do not match.', type: 'error' });
      return;
    }
    setLoading(true);
    setFlash({ message: '', type: 'error' });
    try {
      await api.post('/reset-password', {
        email,
        token,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });
      setSuccess(true);
      setFlash({ message: 'Password reset successfully!', type: 'success' });
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setFlash({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-200/50 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#e0e5ec] rounded-3xl p-8 sm:p-10 shadow-neu">
          {}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#e0e5ec] flex items-center justify-center shadow-neu">
              <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Set new password</h1>
            <p className="text-slate-500 text-sm mt-2">
              {email && <span>Resetting password for <span className="text-indigo-600 font-bold">{email}</span></span>}
            </p>
          </div>

          {flash.message && (
            <div className="mb-4">
              <FlashMessage
                message={flash.message}
                type={flash.type}
                onClose={() => setFlash({ message: '', type: flash.type })}
              />
            </div>
          )}

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {}
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">New password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
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
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Confirm new password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className={`w-full bg-[#e0e5ec] shadow-neu-inner rounded-xl px-5 py-3.5 text-slate-800 placeholder-slate-400 text-sm transition-all border-none ${
                    form.confirmPassword && form.confirmPassword !== form.password
                      ? 'ring-2 ring-red-500/50'
                      : 'ring-neu-focus'
                  }`}
                />
                {form.confirmPassword && form.confirmPassword !== form.password && (
                  <p className="text-red-500 font-medium text-xs mt-2 ml-1">Passwords don&apos;t match</p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#e0e5ec] disabled:opacity-50 disabled:cursor-not-allowed text-indigo-600 font-bold text-base transition-all shadow-neu hover:shadow-neu-hover active:shadow-neu-pressed flex items-center justify-center gap-2"
                >
                  {loading ? <><Spinner size="sm" /> Resetting…</> : 'Reset Password'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#e0e5ec] shadow-neu flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-600 font-medium text-sm">Redirecting to Sign In…</p>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center gap-4">
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-bold text-sm transition-colors">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
