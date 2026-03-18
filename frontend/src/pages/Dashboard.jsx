import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../utils/api';
import { generateThreatReport } from '../utils/generateReport';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchThreats = async () => {
      try {
        const response = await api.get('/threats/history');
        
        setThreats(response.data || []);
      } catch (error) {
        
      } finally {
        setLoading(false);
      }
    };
    fetchThreats();
  }, []);

  const handleGenerateReport = async () => {
    try {
      setIsGenerating(true);
      await generateThreatReport(user, threats);
    } catch (error) {
      
      alert("Error generating report: " + (error.message || "Unknown error"));
    } finally {
      setIsGenerating(false);
    }
  };

  const totalScanned = threats?.length || 0;
  const totalFrauds = threats?.filter(t => t.isFraud).length || 0;
  const safeItems = totalScanned - totalFrauds;

  const stats = [
    { label: 'Transactions Scanned', value: totalScanned, icon: '🔍', color: 'text-indigo-600' },
    { label: 'Frauds Detected', value: totalFrauds, icon: '🛡️', color: 'text-red-500' },
    { label: 'Safe Items', value: safeItems, icon: '✅', color: 'text-green-500' },
    { label: 'Protected Since', value: 'Today', icon: '📅', color: 'text-violet-600' },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">
          Welcome back, <span className="text-indigo-600">{user?.firstName || 'User'}</span> 👋
        </h1>
        <p className="text-slate-500 font-medium mt-2">Here&apos;s an overview of your fraud protection status.</p>
      </div>

      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-[#e0e5ec] shadow-neu rounded-3xl p-6 flex flex-col gap-2 transition-transform hover:-translate-y-1"
          >
            <span className="text-3xl mb-2">{stat.icon}</span>
            <span className={`text-4xl font-black tracking-tight ${stat.color}`}>{stat.value}</span>
            <span className="text-slate-500 font-bold text-sm tracking-wide uppercase mt-1">{stat.label}</span>
          </div>
        ))}
      </div>

      {}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
           <h2 className="text-2xl font-black text-slate-800 tracking-tight">Recent Scans</h2>
           <div className="flex gap-4">
             <button 
               onClick={handleGenerateReport} 
               disabled={isGenerating || threats.length === 0}
               className="text-sm font-bold text-emerald-600 hover:text-emerald-500 transition-colors bg-[#e0e5ec] shadow-neu hover:shadow-neu-hover active:shadow-neu-pressed px-4 py-2 rounded-xl disabled:opacity-50 flex items-center gap-2"
             >
                {isGenerating ? (
                   <>
                     <div className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin"></div>
                     Generating...
                   </>
                ) : (
                   <>
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                     </svg>
                     Get Threat Report
                   </>
                )}
             </button>
             <Link to="/fraud-check" className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors bg-[#e0e5ec] shadow-neu hover:shadow-neu-hover px-4 py-2 rounded-xl flex items-center h-full">
                + New Scan
             </Link>
           </div>
        </div>

        {loading ? (
           <div className="text-center py-20 bg-[#e0e5ec] shadow-neu-inner rounded-3xl">
             <div className="w-10 h-10 rounded-full border-4 border-[#e0e5ec] border-t-indigo-600 shadow-neu animate-spin mx-auto mb-6"></div>
             <p className="text-slate-500 font-bold">Loading your history...</p>
           </div>
        ) : threats.length === 0 ? (
          <div className="bg-[#e0e5ec] shadow-neu rounded-3xl p-10 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[#e0e5ec] shadow-neu flex items-center justify-center">
              <svg className="w-10 h-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-wide">Your Protection is Active</h2>
            <p className="text-slate-500 font-medium max-w-md mx-auto mb-8 leading-relaxed">
              NoFraud is actively monitoring for suspicious activity. Your dashboard will populate as transactions are scanned.
            </p>
            <Link to="/fraud-check" className="inline-flex bg-[#e0e5ec] shadow-neu hover:shadow-neu-hover active:shadow-neu-pressed text-indigo-600 rounded-xl px-8 py-3.5 font-bold transition-all text-sm">
              Start Analyzing Now
            </Link>
          </div>
        ) : (
          <div className="bg-[#e0e5ec] shadow-neu rounded-3xl overflow-hidden pb-4">
             <div className="overflow-x-auto px-4 pt-4">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b-2 border-slate-300/50">
                         <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Date</th>
                         <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Type</th>
                         <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Content</th>
                         <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Status</th>
                         <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Explanation</th>
                         <th className="p-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-300/30">
                      {threats.map((threat) => (
                         <tr key={threat._id} className="transition-colors hover:bg-slate-50/30">
                            <td className="p-4 text-sm font-medium text-slate-700 whitespace-nowrap">{formatDate(threat.createdAt)}</td>
                            <td className="p-4 text-sm text-slate-600 font-bold uppercase tracking-wider">{threat.inputType}</td>
                            <td className="p-4 text-sm font-medium text-slate-700 max-w-[200px] truncate" title={threat.content}>{threat.content}</td>
                            <td className="p-4 text-sm">
                               {threat.isFraud ? (
                                  <span className="inline-flex items-center shadow-neu-inner px-3 py-1.5 rounded-xl bg-[#e0e5ec] text-red-600 text-xs font-black tracking-wide uppercase">
                                     Fraud
                                  </span>
                               ) : (
                                  <span className="inline-flex items-center shadow-neu-inner px-3 py-1.5 rounded-xl bg-[#e0e5ec] text-green-600 text-xs font-black tracking-wide uppercase">
                                     Safe
                                  </span>
                               )}
                            </td>
                            <td className="p-4 text-sm font-medium text-slate-600 max-w-[300px] truncate" title={threat.explanation}>
                               {threat.explanation}
                            </td>
                            <td className="p-4 text-right">
                               <button 
                                  onClick={() => setSelectedThreat(threat)}
                                  className="px-4 py-2 bg-[#e0e5ec] shadow-neu hover:shadow-neu-hover active:shadow-neu-pressed text-indigo-600 text-xs font-bold rounded-xl transition-all"
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

      {}
      {selectedThreat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md" onClick={() => setSelectedThreat(null)}>
           {}
           <div className="bg-[#e0e5ec] shadow-2xl rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              {}
              <div className="p-6 pb-4 flex justify-between items-center sticky top-0 bg-[#e0e5ec]/95 backdrop-blur z-10 shadow-neu-sm">
                 <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 tracking-wide">
                    <span className="text-2xl">🕵️</span> Threat Analysis Details
                 </h3>
                 <button onClick={() => setSelectedThreat(null)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#e0e5ec] shadow-neu hover:shadow-neu-hover active:shadow-neu-pressed text-slate-500 hover:text-red-500 transition-all">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>
              
              {}
              <div className="p-6 space-y-6">
                 {}
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-[#e0e5ec] shadow-neu-inner rounded-2xl p-5">
                       <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Time Scanned</p>
                       <p className="text-slate-800 font-black tracking-tight">{formatDate(selectedThreat.createdAt)}</p>
                    </div>
                    <div className="bg-[#e0e5ec] shadow-neu-inner rounded-2xl p-5">
                       <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Input Type</p>
                       <p className="text-slate-800 font-black capitalize tracking-tight">{selectedThreat.inputType}</p>
                    </div>
                    <div className="bg-[#e0e5ec] shadow-neu-inner rounded-2xl p-5">
                       <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Status</p>
                       <div>
                         {selectedThreat.isFraud ? (
                            <span className="inline-flex items-center shadow-neu-inner px-3 py-1.5 rounded-xl bg-[#e0e5ec] text-red-600 text-xs font-black tracking-wide uppercase">
                               ⚠️ Fraud Detected
                            </span>
                         ) : (
                            <span className="inline-flex items-center shadow-neu-inner px-3 py-1.5 rounded-xl bg-[#e0e5ec] text-green-600 text-xs font-black tracking-wide uppercase">
                               ✅ Safe
                            </span>
                         )}
                       </div>
                    </div>
                 </div>

                 {}
                 <div>
                    <h4 className="text-sm font-bold text-slate-600 mb-2 ml-1 tracking-wide uppercase">Scanned Content</h4>
                    <div className="bg-[#e0e5ec] shadow-neu-inner rounded-2xl p-5 text-slate-700 font-mono text-sm break-all max-h-40 overflow-y-auto">
                       {selectedThreat.content}
                    </div>
                 </div>

                 {}
                 <div>
                    <h4 className="text-sm font-bold text-slate-600 mb-2 ml-1 tracking-wide uppercase">AI Analysis & Explanation</h4>
                    <div className="bg-[#e0e5ec] shadow-neu-inner rounded-2xl p-5 text-indigo-700 font-medium text-sm leading-relaxed">
                       {selectedThreat.explanation}
                    </div>
                 </div>

                 {}
                 {selectedThreat.isFraud && selectedThreat.nextSteps && selectedThreat.nextSteps.length > 0 && (
                    <div>
                       <h4 className="text-sm font-bold text-red-600 mb-2 ml-1 flex items-center gap-2 tracking-wide uppercase">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                          Necessary Actions
                       </h4>
                       <div className="bg-[#e0e5ec] shadow-neu-inner rounded-2xl p-5">
                          <ul className="space-y-4">
                             {selectedThreat.nextSteps.map((step, i) => (
                                <li key={i} className="flex items-start gap-4 text-sm font-medium text-slate-700">
                                   <span className="shrink-0 w-8 h-8 rounded-xl bg-[#e0e5ec] shadow-neu text-red-600 flex items-center justify-center text-sm font-black">{i+1}</span>
                                   <span className="pt-1">{step}</span>
                                </li>
                             ))}
                          </ul>
                       </div>
                    </div>
                 )}

                 {}
                 <div className="mt-8 pt-8">
                    <h4 className="text-sm font-bold text-violet-600 mb-4 flex items-center gap-2 tracking-wide uppercase">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                       Official Cyber Fraud Helplines (India)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <div className="bg-[#e0e5ec] shadow-neu rounded-2xl p-4 flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#e0e5ec] shadow-neu-inner rounded-xl text-violet-600 flex items-center justify-center"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div>
                          <div><p className="text-xs font-bold text-slate-500 uppercase tracking-widest">National Cyber Helpline</p><p className="font-black text-slate-800 text-lg">1930</p></div>
                       </div>
                       <div className="bg-[#e0e5ec] shadow-neu rounded-2xl p-4 flex items-center gap-4">
                          <div className="w-12 h-12 bg-[#e0e5ec] shadow-neu-inner rounded-xl text-blue-600 flex items-center justify-center"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg></div>
                          <div className="min-w-0"><p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Gov Cyber Crime Portal</p><p className="font-black text-slate-800 text-lg truncate"><a href="https://cybercrime.gov.in/" target="_blank" rel="noreferrer" className="hover:text-blue-600 transition-colors">cybercrime.gov.in</a></p></div>
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
