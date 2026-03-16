import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const stats = [
    { label: 'Transactions Scanned', value: '0', icon: '🔍', color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30' },
    { label: 'Frauds Detected', value: '0', icon: '🛡️', color: 'from-red-500/20 to-red-600/10 border-red-500/30' },
    { label: 'Alerts Sent', value: '0', icon: '🔔', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30' },
    { label: 'Protected Since', value: 'Today', icon: '📅', color: 'from-green-500/20 to-green-600/10 border-green-500/30' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Welcome header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">{user?.firstName || 'User'}</span> 👋
        </h1>
        <p className="text-slate-400 mt-2">Here&apos;s an overview of your fraud protection status.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.color} border rounded-2xl p-5 flex flex-col gap-2`}
          >
            <span className="text-2xl">{stat.icon}</span>
            <span className="text-2xl font-bold text-white">{stat.value}</span>
            <span className="text-slate-400 text-sm">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Empty state / call to action */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Your Protection is Active</h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          NoFraud is actively monitoring for suspicious activity. Your dashboard will populate as transactions are scanned.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
