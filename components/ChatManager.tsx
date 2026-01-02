
import React, { useState, useEffect, useRef } from 'react';
import { Chat, ChatMessage } from '../types';
import { getLiveChatResponse } from '../services/geminiService';

interface ChatManagerProps {
  chats: Chat[];
  activeChatId: string | null;
  onClose: () => void;
  onSendMessage: (chatId: string, text: string) => void;
  onSelectChat: (chatId: string | null) => void;
  currentUser: string;
}

const ChatManager: React.FC<ChatManagerProps> = ({ 
  chats, 
  activeChatId, 
  onClose, 
  onSendMessage, 
  onSelectChat,
  currentUser 
}) => {
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeChat = chats.find(c => c.id === activeChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, isTyping]);

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChatId || !activeChat) return;

    const messageText = inputText;
    setInputText('');
    
    // Send user message
    onSendMessage(activeChatId, messageText);

    setIsTyping(true);
    
    // Simulate thinking delay
    setTimeout(async () => {
      const aiResponse = await getLiveChatResponse(activeChat.productTitle, messageText, activeChat.messages);
      onSendMessage(activeChatId, aiResponse);
      setIsTyping(false);
    }, 2000);
  };

  const renderCheckmarks = (status?: string) => {
    const isRead = status === 'read';
    return (
      <div className={`flex items-center ml-1 ${isRead ? 'text-indigo-400' : 'text-slate-500'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 -ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 z-[100] w-full sm:w-[420px] h-full sm:h-[650px] bg-slate-950 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 duration-300 border border-slate-800" dir="ltr">
      
      {/* Header */}
      <div className="p-4 bg-slate-900/90 backdrop-blur-md flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          {activeChatId ? (
            <>
              <button 
                onClick={() => onSelectChat(null)} 
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black shadow-lg shadow-indigo-900/20">
                  {activeChat?.sellerName.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-white">{activeChat?.sellerName}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 px-2">
              <span className="text-lg font-black text-white">Messages</span>
            </div>
          )}
        </div>

        <button onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full text-slate-500 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        {!activeChatId ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {chats.length > 0 ? chats.map(chat => (
              <button 
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className="w-full flex items-center gap-4 p-4 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/50 rounded-2xl transition-all text-left group"
              >
                <div className="relative">
                  <img src={chat.productImage} className="w-14 h-14 rounded-2xl object-cover border border-slate-800" alt="" />
                  {chat.unread && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-slate-900"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors">{chat.sellerName}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Recently</span>
                  </div>
                  <div className="text-[11px] text-indigo-400 font-bold truncate mb-1">{chat.productTitle}</div>
                  <p className="text-xs text-slate-500 truncate">{chat.lastMessage}</p>
                </div>
              </button>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4 opacity-40">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                <p className="font-bold text-lg">Your inbox is empty</p>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar flex flex-col">
              {activeChat.messages.map((msg, idx) => {
                const isMe = msg.sender === currentUser;
                return (
                  <div key={idx} className={`flex w-full flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`relative max-w-[85%] px-5 py-3.5 rounded-3xl shadow-sm ${
                      isMe 
                        ? 'bg-slate-800 text-white rounded-br-none border border-slate-700' 
                        : 'bg-indigo-600 text-slate-100 rounded-bl-none shadow-indigo-900/20'
                    }`}>
                      <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                    </div>
                    <div className={`mt-1.5 flex items-center gap-1.5 px-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-[10px] text-slate-600 font-black">{formatTime(msg.timestamp)}</span>
                      {isMe && renderCheckmarks(msg.status || 'read')}
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex flex-col items-start">
                  <div className="bg-slate-800/40 px-5 py-4 rounded-3xl rounded-bl-none border border-slate-700/50 flex gap-1.5 items-center">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                  <span className="mt-1 text-[10px] text-slate-600 font-black ml-2 uppercase tracking-widest">Typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-3">
              <input 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                placeholder="Write a message..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-600 transition-all placeholder-slate-600"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-900/20 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatManager;
