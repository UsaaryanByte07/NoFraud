import { useState, useRef, useEffect } from 'react';
import { api } from '../utils/api';

const FraudChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am NoFraud. Send me any suspicious text message, email, URL, or upload a suspicious file (.exe, .pdf, scripts, etc.), and I will analyze it for you.',
    },
  ]);
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() && !selectedFile) return;

    // Determine what user is sending
    const userMessage = selectedFile 
      ? `[File Uploaded] ${selectedFile.name}` 
      : input.trim();
      
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      let response;
      if (selectedFile) {
        // Handle File Upload (Requires FormData and custom fetch wrapper since api.js is hardcoded to JSON)
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        // We use native fetch here because the api.js utility enforces 'application/json' 
        // which breaks multipart boundary generation
        const BASE_URL = import.meta.env.VITE_API_URL;
        const res = await fetch(`${BASE_URL}/threats/analyze-file`, {
          method: 'POST',
          body: formData,
          credentials: 'include' // necessary for session cookie
        });
        
        if (!res.ok) throw new Error("File analysis failed");
        response = await res.json();
        
        // Reset file input
        removeFile();
      } else {
        // Handle Normal Text/URL/Email
        response = await api.post('/threats/analyze', { content: userMessage });
      }

      const { isFraud, explanation, inputType, nextSteps, vtStats } = response.data;
      
      let badge = '';
      if (inputType === 'url') badge = '[URL] ';
      else if (inputType === 'email') badge = '[Email] ';
      else if (inputType === 'file') badge = '[File Scan] ';
      else badge = '[Text] ';

      let assistantReply = `${badge}${isFraud ? '⚠️ FRAUD DETECTED' : '✅ SAFE'}\n\n${explanation}`;

      if (isFraud && Array.isArray(nextSteps) && nextSteps.length > 0) {
        assistantReply += '\n\n🛡️ Recommended Actions:\n' + nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n');
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: assistantReply,
          isFraud: isFraud
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error while analyzing that. Please try again later.',
        },
      ]);
      removeFile(); // cleanup on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-4xl">🕵️</span> Fraud Analyzer
        </h1>
        <p className="text-slate-400 mt-2">
          Paste a suspicious message, link, email, or upload a file for deep analysis.
        </p>
      </div>

      {/* Chat Box */}
      <div className="flex-1 bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : msg.isFraud === true 
                    ? 'bg-red-500/10 border border-red-500/30 text-red-200 rounded-bl-none'
                    : msg.isFraud === false
                    ? 'bg-green-500/10 border border-green-500/30 text-green-200 rounded-bl-none'
                    : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-white/5 text-slate-400 rounded-2xl rounded-bl-none p-4 flex gap-2 items-center">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-2 text-sm italic">
                  {selectedFile ? 'Scanning file across 70+ engines...' : 'Analyzing pattern...'}
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Selected File Preview (Overlay) */}
        {selectedFile && (
          <div className="absolute bottom-24 left-4 right-4 bg-slate-800 border border-indigo-500/50 rounded-xl p-3 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-indigo-500/20 text-indigo-400 p-2 rounded-lg">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-white truncate">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={removeFile}
              className="text-slate-400 hover:text-red-400 p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-slate-950/50 border-t border-white/5">
          <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 items-center">
            
            {/* Hidden File Input */}
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isLoading || selectedFile}
            />
            
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || selectedFile}
              className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
              title="Attach File"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedFile ? "File attached. Press analyze..." : "Paste URL, email, or message here..."}
              disabled={isLoading || selectedFile}
              className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
            />
            
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !selectedFile)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 sm:px-6 py-3 font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span className="hidden sm:inline">Analyze</span>
              <svg className="w-5 h-5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FraudChat;
