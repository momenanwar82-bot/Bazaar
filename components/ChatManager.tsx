import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase/config'; // تأكد من مسار ملف الفايربيز عندك
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, where } from 'firebase/firestore';
import { getLiveChatResponse } from '../services/geminiService';

// --- واجهة البيانات ---
interface Message {
  text: string;
  sender: string;
  timestamp: any;
}

const ChatManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = auth.currentUser;

  // 1. جلب الرسائل مباشرة من Firestore
  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, "chats"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push(doc.data() as Message);
      });
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 2. إرسال رسالة
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const userMsg = inputText;
    setInputText('');

    await addDoc(collection(db, "chats"), {
      text: userMsg,
      sender: user.email,
      timestamp: serverTimestamp(),
    });

    setIsTyping(true);
    
    // رد AI تجريبي عشان الشات ميبقاش فاضي
    setTimeout(async () => {
      const aiResponse = await getLiveChatResponse("Bazaar Customer", userMsg, []);
      await addDoc(collection(db, "chats"), {
        text: aiResponse,
        sender: "Bazaar AI",
        timestamp: serverTimestamp(),
      });
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 z-[100] w-full sm:w-[400px] h-full sm:h-[600px] bg-[#0f172a] border border-slate-800 flex flex-col shadow-2xl sm:rounded-2xl overflow-hidden animate-in slide-in-from-bottom-5">
      
      {/* Header - نغير لونه عشان ميبقاش أسود تماماً */}
      <div className="p-4 bg-indigo-600 text-white flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-bold">Bazaar Live Support</span>
        </div>
        <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-6">
            <p className="text-sm italic">No messages yet. Say hi to start! 👋</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === user?.email ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.sender === user?.email ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'
              }`}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isTyping && <div className="text-xs text-indigo-400 animate-pulse font-bold">Bazaar AI is typing...</div>}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-slate-900 border-t border-slate-800 flex gap-2">
        <input 
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-indigo-500 transition-all text-sm"
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-500 transition-all shadow-lg active:scale-90">
          <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
        </button>
      </form>
    </div>
  );
};

export default ChatManager;
