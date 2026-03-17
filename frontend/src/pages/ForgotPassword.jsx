import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import FlashMessage from '../components/FlashMessage';
import Spinner from '../components/Spinner';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState({ message: '', type: 'error' });
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFlash({ message: '', type: 'error' });
    try {
      await api.post('/forgot-password', { email });
      setSent(true);
      setFlash({ message: 'Password reset link sent! Check your inbox.', type: 'success' });
    } catch (err) {
      setFlash({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-200/50 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#e0e5ec] rounded-3xl p-8 sm:p-10 shadow-neu">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#e0e5ec] flex items-center justify-center shadow-neu">
              <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Forgot password?</h1>
            <p className="text-slate-500 text-sm mt-2">
              {sent
                ? 'Check your email for the reset link.'
                : "No worries, we'll send you reset instructions."}
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

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-[#e0e5ec] shadow-neu-inner rounded-xl px-5 py-3.5 text-slate-800 placeholder-slate-400 text-sm ring-neu-focus transition-all border-none"
                />
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#e0e5ec] disabled:opacity-50 disabled:cursor-not-allowed text-indigo-600 font-bold text-base transition-all shadow-neu hover:shadow-neu-hover active:shadow-neu-pressed flex items-center justify-center gap-2"
                >
                  {loading ? <><Spinner size="sm" /> Sending…</> : 'Send Reset Link'}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#e0e5ec] shadow-neu flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-slate-600 font-medium text-sm">We sent a reset link to</p>
              <p className="text-indigo-600 font-bold text-lg mt-1">{email}</p>
              <p className="text-slate-500 text-xs mt-4">The link will expire in 5 minutes.</p>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-slate-500 font-medium text-sm">
              Remembered it?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-500 font-bold transition-colors ml-1">
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
