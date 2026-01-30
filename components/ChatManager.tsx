import React, { useState, useEffect, useRef } from 'react';
// التعديل الجوهري هنا: غيرنا firebase لـ services
import { db, auth } from '../services/config'; 
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; // مهمة جداً

const ChatManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null); // حالة المستخدم
  const [loading, setLoading] = useState(true); // حالة التحميل
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. مراقبة حالة تسجيل الدخول أولاً
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. جلب الرسائل لما المستخدم يتأكد
  useEffect(() => {
    if (!currentUser) return;

    // تأكدنا إن الاسم هنا "messages" أو "chats" حسب الـ Rules اللي نشرتها
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    
    const unsubscribeChat = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => doc.data()));
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, (error) => {
      console.error("Firebase Error:", error);
    });

    return () => unsubscribeChat();
  }, [currentUser]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, "messages"), {
        text: inputText,
        senderId: currentUser.uid,
        senderEmail: currentUser.email,
        timestamp: serverTimestamp(),
      });
      setInputText('');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // لو لسه بيحمل أو مفيش مستخدم، نعرض رسالة بدل السواد
  if (loading) return <div className="fixed bottom-4 right-4 bg-white p-6 rounded-2xl shadow-xl border">جاري تحميل الدردشة...</div>;
  if (!currentUser) return <div className="fixed bottom-4 right-4 bg-white p-6 rounded-2xl shadow-xl border text-red-500 font-bold">يرجى تسجيل الدخول أولاً</div>;

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 z-[100] w-full sm:w-[400px] h-full sm:h-[600px] bg-white border border-slate-200 flex flex-col shadow-2xl sm:rounded-2xl overflow-hidden text-black animate-in slide-in-from-bottom-5" dir="rtl">
      {/* Header */}
      <div className="p-4 bg-blue-600 text-white flex justify-between items-center shrink-0">
        <span className="font-bold text-lg">دردشة البائع والمشتري</span>
        <button onClick={onClose} className="hover:bg-blue-700 p-1 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <p>لا توجد رسائل بعد.. ابدأ الحديث!</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.senderId === currentUser?.uid ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                msg.senderId === currentUser?.uid ? 'bg-blue-600 text-white rounded-tl-none' : 'bg-white border text-slate-800 rounded-tr-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
        <input 
          className="flex-1 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-blue-500 transition-all"
          placeholder="اكتب رسالتك..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button type="submit" disabled={!inputText.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all">
          إرسال
        </button>
      </form>
    </div>
  );
};

export default ChatManager;
