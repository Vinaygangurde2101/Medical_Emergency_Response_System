import React, { useState } from 'react';
import { MessageSquare, X, Send, Bot, Zap, HeartPulse, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendAIChat } from '../services/api';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: '🚨 MERS Emergency AI Assistant online. Ask for instant CPR steps, severe bleeding control, burn care, or choking protocols.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const mockPredefs = ["CPR Steps", "Stop Bleeding", "Burn Care", "Choking Protocol"];

  const handleSend = async (text = input) => {
    if (!text || !text.trim() || loading) return;
    const userMessage = text.trim();
    
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await sendAIChat(userMessage);
      setMessages(prev => [...prev, { role: 'bot', text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: '⚠️ Emergency guidance unavailable. For life-threatening situations, call **108 / 112** immediately.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group border-2 border-white/80 ring-4 ring-red-500/20 animate-bounce"
        title="Emergency AI Assistant"
      >
        <HeartPulse size={26} className="group-hover:rotate-12 transition-transform" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 right-4 sm:right-6 w-[92vw] max-w-[420px] bg-white rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] z-50 overflow-hidden border border-slate-200/80 flex flex-col h-[520px] font-sans"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-rose-600 p-5 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
                  <Zap size={20} />
                </div>
                <div>
                  <h3 className="font-black text-base tracking-tight leading-tight">MERS Emergency AI Assistant</h3>
                  <p className="text-[10px] text-red-100 uppercase tracking-widest font-extrabold mt-0.5">24/7 First-Aid Guidance</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/70 text-xs custom-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl whitespace-pre-wrap leading-relaxed font-medium shadow-sm
                    ${m.role === 'user' 
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-tr-none shadow-red-600/20' 
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80'}
                  `}>
                    {m.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white p-4 rounded-2xl text-slate-400 font-bold flex items-center gap-2 border border-slate-200/80 shadow-sm text-xs">
                    <Loader2 size={16} className="animate-spin text-red-600" />
                    Calculating emergency guidance...
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {mockPredefs.map(p => (
                  <button 
                    key={p} 
                    onClick={() => handleSend(p)}
                    className="text-[10px] font-extrabold bg-red-50 text-red-700 px-3 py-1.5 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  type="text" 
                  placeholder="Ask emergency question..." 
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={loading}
                  className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-3.5 rounded-2xl shadow-lg shadow-red-600/25 hover:from-red-700 hover:to-rose-700 transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">
                First Aid Advice • Dial 108 For Ambulance Hotline
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
