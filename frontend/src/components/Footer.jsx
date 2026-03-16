import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-white/5 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                NoFraud
              </span>
            </div>
            <p className="text-slate-500 text-sm text-center md:text-left max-w-xs">
              Protecting you from fraud with intelligent, real-time detection and prevention.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-12">
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-slate-500 text-sm hover:text-indigo-400 transition-colors">Home</Link></li>
                <li><Link to="/login" className="text-slate-500 text-sm hover:text-indigo-400 transition-colors">Sign In</Link></li>
                <li><Link to="/signup" className="text-slate-500 text-sm hover:text-indigo-400 transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/forgot-password" className="text-slate-500 text-sm hover:text-indigo-400 transition-colors">Forgot Password</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-2 items-center justify-between">
          <p className="text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} NoFraud. All rights reserved.
          </p>
          <p className="text-slate-600 text-xs flex items-center gap-1">
            Built with
            <svg className="w-3.5 h-3.5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            for security
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
