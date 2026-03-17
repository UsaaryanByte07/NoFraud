import { useState, useRef, useEffect } from 'react';
import { api } from '../utils/api';

const FraudChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am NoFraud. Send me any suspicious text message, email, or URL, and I will analyze it for you.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await api.post('/threats/analyze', { content: userMessage });
      const { isFraud, explanation, inputType, nextSteps } = response.data;
      
      let badge = '';
      if (inputType === 'url') badge = '[URL] ';
      else if (inputType === 'email') badge = '[Email] ';
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
          Paste a suspicious message, link, or email address below.
        </p>
      </div>

      {/* Chat Box */}
      <div className="flex-1 bg-slate-900/60 border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
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
                <span className="ml-2 text-sm italic">Analyzing pattern...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-950/50 border-t border-white/5">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste URL, email, or message here..."
              disabled={isLoading}
              className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              Analyze
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
