import { useState, useRef, useEffect } from 'react';
import { api } from '../utils/api';

const FraudChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am NoFraud. Send me any suspicious text message, email, URL, or upload a suspicious file (.exe, .pdf) or media (.jpg, .mp4), and I will analyze it for malware or deepfakes.',
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
      else if (inputType === 'image' || inputType === 'video') badge = '[Media Deepfake Scan] ';
      else if (inputType === 'file') badge = '[File Malware Scan] ';
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
      const errorMessage = error.response?.data?.message || 'Sorry, I encountered an error while analyzing that. Please try again later.';
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Analysis Failed:\n\n${errorMessage}`,
          isFraud: null
        },
      ]);
      removeFile(); // cleanup on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-6 pl-2">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <div className="w-14 h-14 bg-[#e0e5ec] shadow-neu rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🕵️</span>
          </div>
          Fraud Analyzer
        </h1>
        <p className="text-slate-500 font-medium mt-3 leading-relaxed max-w-2xl">
          Paste a suspicious message, link, email, or upload a file/media (.jpg, .mp4, .pdf) for deep analysis.
        </p>
      </div>

      {/* Chat Box */}
      <div className="flex-1 bg-[#e0e5ec] shadow-neu rounded-3xl overflow-hidden flex flex-col relative">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-5 whitespace-pre-wrap leading-relaxed shadow-neu ${
                  msg.role === 'user'
                    ? 'bg-[#e0e5ec] text-indigo-700 font-bold rounded-br-none'
                    : msg.isFraud === true 
                    ? 'bg-[#e0e5ec] shadow-neu-inner text-red-600 font-bold rounded-bl-none border-l-4 border-red-500'
                    : msg.isFraud === false
                    ? 'bg-[#e0e5ec] shadow-neu-inner text-green-700 font-bold rounded-bl-none border-l-4 border-green-500'
                    : 'bg-[#e0e5ec] shadow-neu-inner text-slate-700 font-medium rounded-bl-none border-l-4 border-indigo-500'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#e0e5ec] shadow-neu-inner text-slate-500 font-medium rounded-3xl rounded-bl-none p-5 flex gap-2 items-center border-l-4 border-indigo-400">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-3 text-sm italic tracking-wide">
                  {selectedFile 
                    ? (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/')) 
                        ? 'Analyzing media for AI manipulation...' 
                        : 'Scanning file across 70+ engines...' 
                    : 'Analyzing pattern...'}
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Selected File Preview (Overlay) */}
        {selectedFile && (
          <div className="absolute bottom-32 left-8 right-8 bg-[#e0e5ec] shadow-neu rounded-2xl p-4 flex items-center justify-between border-l-4 border-indigo-500 z-10 transition-all">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="bg-[#e0e5ec] shadow-neu-inner text-indigo-600 p-3 rounded-xl">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/') ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  )}
                </svg>
              </div>
              <div className="truncate">
                <p className="text-sm font-black text-slate-800 truncate">{selectedFile.name}</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{(selectedFile.size / 1024).toFixed(1)} KB {(selectedFile.type || 'Unknown Type')}</p>
              </div>
            </div>
            <button 
              type="button" 
              onClick={removeFile}
              className="w-10 h-10 flex shrink-0 items-center justify-center bg-[#e0e5ec] shadow-neu hover:shadow-neu-hover active:shadow-neu-pressed rounded-xl text-slate-500 hover:text-red-600 transition-all ml-4"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 sm:p-6 pb-6">
          <form onSubmit={handleSubmit} className="flex gap-3 sm:gap-4 items-center">
            
            {/* Hidden File Input */}
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.exe,.txt"
              disabled={isLoading || selectedFile}
            />
            
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || selectedFile}
              className="w-14 h-14 flex items-center justify-center shrink-0 bg-[#e0e5ec] shadow-neu hover:shadow-neu-hover active:shadow-neu-pressed text-indigo-600 rounded-2xl transition-all disabled:opacity-50"
              title="Attach Document or Media"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedFile ? "File attached. Press analyze..." : "Paste URL, email, message, Images, Videos, or Documents here..."}
              disabled={isLoading || selectedFile}
              className="flex-1 bg-[#e0e5ec] shadow-neu-inner rounded-2xl px-6 py-4 text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none ring-neu-focus transition-all disabled:opacity-50 border-none"
            />
            
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !selectedFile)}
              className="h-14 bg-[#e0e5ec] shadow-neu hover:shadow-neu-hover active:shadow-neu-pressed text-indigo-600 rounded-2xl px-6 sm:px-8 font-black transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <span className="hidden sm:inline tracking-wide uppercase">Analyze</span>
              <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          {/* Supported Types Hint */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mt-6 px-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#e0e5ec] shadow-neu-inner flex items-center justify-center text-emerald-600">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span>Malware: PDF, DOCX, ZIP, EXE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#e0e5ec] shadow-neu-inner flex items-center justify-center text-purple-600">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span>Deepfake: JPG, MP4 (max 10MB)</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default FraudChat;
