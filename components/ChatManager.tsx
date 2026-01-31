import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../services/config';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
}

interface ChatManagerProps {
  adId: string; // معرف الإعلان عشان الشات يبقى خاص بكل منتج
  onClose: () => void;
}

const ChatManager: React.FC<ChatManagerProps> = ({ adId, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const user = auth.currentUser;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. جلب الرسائل بتصفية من المنبع (Firestore)
  useEffect(() => {
    if (!user || !adId) return;

    // مسار احترافي: كل إعلان له "غرفة" رسايل خاصة بيه
    const q = query(
      collection(db, "ads", adId, "messages"), 
      orderBy("timestamp", "asc"),
      limit(50) // أمان عشان الموقع ميهنجش
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
    }, (error) => {
      console.error("Chat Error:", error);
    });

    return () => unsubscribe(); // تنظيف الذاكرة ومنع الشاشة السوداء
  }, [adId, user]);

  // 2. سكرول ذكي وسلس
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !adId) return;

    try {
      await addDoc(collection(db, "ads", adId, "messages"), {
        text: newMessage,
        senderId: user.uid,
        senderName: user.displayName || 'مستخدم',
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (err) {
      console.error("Send Error:", err);
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-800 flex justify-between items-center">
        <h3 className="text-white font-bold">دردشة المنتج</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.senderId === user?.uid ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
              <p className="text-xs opacity-50 mb-1">{msg.senderName}</p>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 bg-slate-800 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="اكتب رسالتك..."
          className="flex-grow bg-slate-900 text-white p-2 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-500 transition-colors">
          ارسل
        </button>
      </form>
    </div>
  );
};

export default ChatManager;
