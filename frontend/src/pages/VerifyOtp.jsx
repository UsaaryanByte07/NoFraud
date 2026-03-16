import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../utils/api';
import FlashMessage from '../components/FlashMessage';
import Spinner from '../components/Spinner';

const OTP_LENGTH = 6;

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState({ message: '', type: 'error' });
  const inputRefs = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // digits only
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
    const newOtp = [...otp];
    pasted.forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex((v) => !v);
    inputRefs.current[nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length < OTP_LENGTH) {
      setFlash({ message: 'Please enter the complete 6-digit OTP.', type: 'error' });
      return;
    }
    setLoading(true);
    setFlash({ message: '', type: 'error' });
    try {
      await api.post('/verify-otp', { email, otp: otpString });
      setFlash({ message: 'Email verified! Redirecting to login…', type: 'success' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setFlash({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-16">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl shadow-black/40">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Verify your email</h1>
            <p className="text-slate-400 text-sm mt-1.5">
              We sent a 6-digit code to{' '}
              <span className="text-indigo-400 font-medium">{email || 'your email'}</span>
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

          <form onSubmit={handleSubmit}>
            {/* OTP inputs */}
            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-11 h-13 text-center text-xl font-bold bg-slate-800/60 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500 transition-all caret-indigo-400"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2"
            >
              {loading ? <><Spinner size="sm" /> Verifying…</> : 'Verify Email'}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-slate-500 text-sm">
              Didn&apos;t receive the code?{' '}
              <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                Resend
              </Link>
            </p>
            <Link to="/login" className="text-slate-600 hover:text-slate-400 text-sm transition-colors">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
