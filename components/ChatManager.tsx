import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase/config';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';

const ChatManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const user = auth.currentUser;

  // 1. مراقبة الرسايل الحقيقية اللي بتوصل في الـ Database
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => doc.data()));
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
    return () => unsubscribe();
  }, [user]);

  // 2. إرسال رسالة حقيقية (بتروح للـ Database والطرف التاني بيشوفها)
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    await addDoc(collection(db, "messages"), {
      text: inputText,
      senderId: user.uid,
      senderEmail: user.email,
      timestamp: serverTimestamp(),
    });

    setInputText('');
  };

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 z-[100] w-full sm:w-[400px] h-full sm:h-[600px] bg-white border border-slate-200 flex flex-col shadow-2xl sm:rounded-2xl overflow-hidden animate-in slide-in-from-bottom-5 text-black">
      {/* Header - نخليه بسيط وأبيض عشان ميبقاش "أسود" */}
      <div className="p-4 bg-slate-100 border-b flex justify-between items-center">
        <span className="font-bold text-slate-800">دردشة البائع والمشتري</span>
        <button onClick={onClose} className="text-slate-500 hover:text-red-500">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* منطقة الرسائل الحقيقية */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
              msg.senderId === user?.uid ? 'bg-blue-600 text-white' : 'bg-white border text-slate-800 shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* مكان الكتابة */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
        <input 
          className="flex-1 border rounded-lg px-4 py-2 outline-none focus:border-blue-500"
          placeholder="اكتب رسالتك هنا..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          إرسال
        </button>
      </form>
    </div>
  );
};

export default ChatManager;
