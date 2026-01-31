import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../services/config'; 
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ChatManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false); // تعديل جوهري لعدم تعليق الموقع
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
      setAuthChecked(true); // تأكيد فحص الحالة
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser || !db) return;

    try {
      const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
      const unsubscribeChat = onSnapshot(q, (snapshot) => {
        const fetchedMessages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(fetchedMessages);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      }, (error) => {
        console.error("Firebase Error:", error);
      });
      return () => unsubscribeChat();
    } catch (e) {
      console.error("Chat Setup Error:", e);
    }
  }, [currentUser]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: inputText.trim(),
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        senderName: currentUser.displayName || 'مستخدم',
        timestamp: serverTimestamp(),
      });
      setInputText('');
    } catch (err) {
      alert("فشل الإرسال. راجع إعدادات Firebase");
    }
  };

  // لو لسه بيحمل، بنرجع null بدل ما نعلق الموقع كله
  if (!authChecked) return null;

  if (!currentUser) return (
    <div className="fixed bottom-4 right-4 bg-white p-6 rounded-2xl shadow-xl border text-red-500 font-bold z-[110]">
      ⚠️ سجل دخولك أولاً للدردشة
      <button onClick={onClose} className="block mt-2 text-xs text-gray-500 underline">إغلاق</button>
    </div>
  );

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 z-[100] w-full sm:w-[400px] h-full sm:h-[600px] bg-white border flex flex-col shadow-2xl sm:rounded-2xl overflow-hidden text-black animate-in slide-in-from-bottom-5" dir="rtl">
      <div className="p-4 bg-indigo-700 text-white flex justify-between items-center shrink-0 shadow-md">
        <span className="font-bold">دردشة بازار رمضان</span>
        <button onClick={onClose} className="hover:bg-indigo-800 p-1 rounded-full">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f2f5]">
        {messages.map((msg, i) => (
          <div key={msg.id || i} className={`flex ${msg.senderId === currentUser?.uid ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-[15px] shadow-sm ${msg.senderId === currentUser?.uid ? 'bg-indigo-600 text-white rounded-tl-none' : 'bg-white border text-slate-800 rounded-tr-none'}`}>
              {msg.text}
              <div className="text-[10px] mt-1 opacity-70 text-left">{msg.senderName}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
        <input className="flex-1 border rounded-full px-4 py-2 outline-none text-sm" placeholder="اكتب استفسارك..." value={inputText} onChange={(e) => setInputText(e.target.value)} />
        <button type="submit" className="bg-indigo-600 text-white p-2 rounded-full shadow-md">إرسال</button>
      </form>
    </div>
  );
};

export default ChatManager;
