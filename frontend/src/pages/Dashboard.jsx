import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../utils/api';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedThreat, setSelectedThreat] = useState(null);

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
                         <th className="p-4 text-sm font-medium text-slate-400 text-right">Action</th>
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
                            <td className="p-4 text-right">
                               <button 
                                  onClick={() => setSelectedThreat(threat)}
                                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium rounded-lg border border-white/5 transition-colors"
                               >
                                  Details
                               </button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}
      </div>

      {/* Threat Details Modal */}
      {selectedThreat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedThreat(null)}>
           {/* Modal Container */}
           <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-slate-900/95 backdrop-blur z-10">
                 <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <span className="text-2xl">🕵️</span> Threat Analysis Details
                 </h3>
                 <button onClick={() => setSelectedThreat(null)} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              
              {/* Body */}
              <div className="p-6 space-y-6">
                 {/* Meta Info grid */}
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                       <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Time Scanned</p>
                       <p className="text-slate-200 font-medium text-sm">{formatDate(selectedThreat.createdAt)}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                       <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Input Type</p>
                       <p className="text-slate-200 font-medium capitalize text-sm">{selectedThreat.inputType}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                       <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">Status</p>
                       <div>
                         {selectedThreat.isFraud ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                               ⚠️ Fraud Detected
                            </span>
                         ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                               ✅ Safe
                            </span>
                         )}
                       </div>
                    </div>
                 </div>

                 {/* Content Box */}
                 <div>
                    <h4 className="text-sm font-semibold text-white mb-2 ml-1">Scanned Content</h4>
                    <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4 text-slate-300 font-mono text-sm break-all max-h-40 overflow-y-auto">
                       {selectedThreat.content}
                    </div>
                 </div>

                 {/* Explanation Box */}
                 <div>
                    <h4 className="text-sm font-semibold text-white mb-2 ml-1">AI Analysis & Explanation</h4>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-indigo-200 text-sm leading-relaxed">
                       {selectedThreat.explanation}
                    </div>
                 </div>

                 {/* Recommended Actions (Only show if Fraud and exists) */}
                 {selectedThreat.isFraud && selectedThreat.nextSteps && selectedThreat.nextSteps.length > 0 && (
                    <div>
                       <h4 className="text-sm font-semibold text-white mb-2 ml-1 flex items-center gap-2">
                          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          Necessary Actions
                       </h4>
                       <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                          <ul className="space-y-3">
                             {selectedThreat.nextSteps.map((step, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                   <span className="shrink-0 w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs font-bold mt-0.5">{i+1}</span>
                                   <span className="pt-0.5">{step}</span>
                                </li>
                             ))}
                          </ul>
                       </div>
                    </div>
                 )}

                 {/* Official Helplines */}
                 <div className="mt-8 pt-6 border-t border-white/10">
                    <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                       <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                       Official Cyber Fraud Helplines (India)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                       <div className="bg-slate-800/80 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                          <div className="bg-violet-500/20 p-2 rounded-lg text-violet-400"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div>
                          <div><p className="text-xs text-slate-400">National Cyber Helpline</p><p className="font-medium text-slate-200">1930</p></div>
                       </div>
                       <div className="bg-slate-800/80 rounded-xl p-3 border border-white/5 flex items-center gap-3">
                          <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg></div>
                          <div><p className="text-xs text-slate-400">Gov Cyber Crime Portal</p><p className="font-medium text-slate-200 truncate"><a href="https://cybercrime.gov.in/" target="_blank" rel="noreferrer" className="hover:text-blue-400">cybercrime.gov.in</a></p></div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
