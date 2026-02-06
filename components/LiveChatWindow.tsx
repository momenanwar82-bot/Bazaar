
import React, { useState, useEffect, useRef } from 'react';
import { Message, sendMessage, listenForNewMessages } from '../services/chatService';

interface LiveChatWindowProps {
  chatId: string;
  currentUser: { email: string; name: string };
  productTitle: string;
  sellerName: string;
  onClose: () => void;
}

const LiveChatWindow: React.FC<LiveChatWindowProps> = ({ 
  chatId, 
  currentUser, 
  productTitle, 
  sellerName, 
  onClose 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    const unsubscribe = listenForNewMessages(chatId, (newMsg) => {
      setMessages(prev => {
        if (prev.find(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
    });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    sendMessage(chatId, currentUser.email, currentUser.name, inputText);
    setInputText('');
  };

  const formatTime = (timestamp: number) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="w-full max-w-[440px] h-[85vh] sm:h-[680px] bg-[#0B0D17] rounded-[32px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] border border-white/5 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500 ease-out" 
        dir="ltr"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Slimmer Professional Header */}
        <div className="px-5 py-3.5 bg-indigo-600 flex items-center justify-between shrink-0 shadow-md relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center text-white font-black text-base border border-white/20">
                {sellerName.charAt(0)}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-indigo-600"></div>
            </div>
            <div className="text-left">
              <h3 className="text-[12px] font-bold text-white uppercase tracking-tight leading-none mb-0.5">{sellerName}</h3>
              <p className="text-[8px] text-indigo-100/60 font-bold uppercase tracking-[0.1em] truncate max-w-[180px]">{productTitle}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-black/10 rounded-full text-white transition-all active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages Container with Balanced Spacing */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-950/40">
          <div className="h-4 shrink-0"></div> 
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center space-y-4">
              <div className="p-5 bg-indigo-500/10 rounded-full border border-indigo-500/10">
                <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Start the conversation</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUser.email;
              return (
                <div key={msg.id} className={`flex w-full flex-col animate-in slide-in-from-bottom-4 fade-in duration-500 ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[82%] px-4 py-3 rounded-[18px] text-[13px] leading-relaxed shadow-lg transition-all ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-[#1A1C2E] text-slate-200 rounded-bl-none border border-white/5'
                  }`}>
                    {msg.text}
                  </div>
                  <div className={`mt-1 flex items-center gap-2 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">
                      {formatTime(msg.timestamp)}
                    </span>
                    {isMe && (
                      <div className="flex opacity-40">
                         <svg className="w-3 h-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                         </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Input with 12px corners and round button */}
        <div className="p-5 bg-[#0B0D17] border-t border-white/5">
          <form onSubmit={handleSend} className="flex gap-3 items-center">
            <input 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Write a message..."
              className="flex-1 h-[52px] bg-[#1A1C2E] border border-white/10 rounded-[12px] px-5 text-xs text-white outline-none focus:ring-2 focus:ring-indigo-600/30 transition-all placeholder:text-slate-600 shadow-inner"
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="w-[52px] h-[52px] shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center disabled:opacity-20 transition-all shadow-xl active:scale-90 border border-indigo-400/20"
            >
              <svg className="w-5 h-5 text-white transform rotate-45 -translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          <p className="mt-3 text-center text-[7px] text-slate-600 font-bold uppercase tracking-[0.4em]">End-to-End Encrypted</p>
        </div>
      </div>
    </div>
  );
};

export default LiveChatWindow;
