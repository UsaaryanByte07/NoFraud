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

  
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; 
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
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 w-full">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-200/50 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-[#e0e5ec] rounded-3xl p-8 sm:p-10 shadow-neu">
          {}
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#e0e5ec] flex items-center justify-center shadow-neu">
              <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Verify your email</h1>
            <p className="text-slate-500 text-sm mt-2">
              We sent a 6-digit code to{' '}
              <span className="text-indigo-600 font-bold">{email || 'your email'}</span>
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
            <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
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
                  className="w-12 h-14 text-center text-xl font-bold bg-[#e0e5ec] shadow-neu-inner rounded-xl text-indigo-600 focus:outline-none ring-neu-focus transition-all border-none"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#e0e5ec] disabled:opacity-50 disabled:cursor-not-allowed text-indigo-600 font-bold text-base transition-all shadow-neu hover:shadow-neu-hover active:shadow-neu-pressed flex items-center justify-center gap-2"
            >
              {loading ? <><Spinner size="sm" /> Verifying…</> : 'Verify Email'}
            </button>
          </form>

          <div className="mt-8 flex flex-col items-center gap-4">
            <p className="text-slate-500 font-medium text-sm">
              Didn&apos;t receive the code?{' '}
              <Link to="/signup" className="text-indigo-600 hover:text-indigo-500 font-bold transition-colors ml-1">
                Resend
              </Link>
            </p>
            <Link to="/login" className="text-slate-500 hover:text-slate-700 font-bold text-sm transition-colors">
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
