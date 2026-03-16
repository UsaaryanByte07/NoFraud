import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../utils/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThreats = async () => {
      try {
        const response = await api.get('/threats/history');
        // api.get already returns res.data, which is { success: true, data: [...] }
        setThreats(response.data || []);
      } catch (error) {
        console.error("Error fetching threats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchThreats();
  }, []);

  const totalScanned = threats?.length || 0;
  const totalFrauds = threats?.filter(t => t.isFraud).length || 0;
  const safeItems = totalScanned - totalFrauds;

  const stats = [
    { label: 'Transactions Scanned', value: totalScanned, icon: '🔍', color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30' },
    { label: 'Frauds Detected', value: totalFrauds, icon: '🛡️', color: 'from-red-500/20 to-red-600/10 border-red-500/30' },
    { label: 'Safe Items', value: safeItems, icon: '✅', color: 'from-green-500/20 to-green-600/10 border-green-500/30' },
    { label: 'Protected Since', value: 'Today', icon: '📅', color: 'from-violet-500/20 to-violet-600/10 border-violet-500/30' },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

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

      {/* Threat log */}
      <div>
        <div className="flex items-center justify-between mb-6">
           <h2 className="text-xl font-bold text-white">Recent Scans</h2>
           <Link to="/fraud-check" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              + New Scan
           </Link>
        </div>

        {loading ? (
           <div className="text-center py-12">
             <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4"></div>
             <p className="text-slate-400">Loading your history...</p>
           </div>
        ) : threats.length === 0 ? (
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Your Protection is Active</h2>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
              NoFraud is actively monitoring for suspicious activity. Your dashboard will populate as transactions are scanned.
            </p>
            <Link to="/fraud-check" className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-2.5 font-medium transition-colors">
              Start Analyzing Now
            </Link>
          </div>
        ) : (
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-white/10 bg-slate-800/50">
                         <th className="p-4 text-sm font-medium text-slate-400">Date</th>
                         <th className="p-4 text-sm font-medium text-slate-400">Type</th>
                         <th className="p-4 text-sm font-medium text-slate-400">Content</th>
                         <th className="p-4 text-sm font-medium text-slate-400">Status</th>
                         <th className="p-4 text-sm font-medium text-slate-400">Explanation</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                      {threats.map((threat) => (
                         <tr key={threat._id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 text-sm text-slate-300 whitespace-nowrap">{formatDate(threat.createdAt)}</td>
                            <td className="p-4 text-sm text-slate-300 uppercase tracking-wider text-xs font-bold">{threat.inputType}</td>
                            <td className="p-4 text-sm text-slate-300 max-w-[200px] truncate" title={threat.content}>{threat.content}</td>
                            <td className="p-4 text-sm">
                               {threat.isFraud ? (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                                     Fraud
                                  </span>
                               ) : (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                                     Safe
                                  </span>
                               )}
                            </td>
                            <td className="p-4 text-sm text-slate-400 max-w-[300px] truncate" title={threat.explanation}>
                               {threat.explanation}
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
