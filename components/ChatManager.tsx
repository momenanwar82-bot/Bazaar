import React, { useState, useEffect, useRef } from 'react';
// التعديل الجوهري: التأكد من المسار الصحيح
import { db, auth } from '../services/config'; 
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const ChatManager: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. مراقبة حالة تسجيل الدخول
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // 2. جلب الرسائل (مع إضافة معالجة الخطأ بشكل أفضل)
  useEffect(() => {
    if (!currentUser) return;

    // ملاحظة: تأكد أن اسم الكولكشن في Firestore هو "messages"
    const q = query(collection(db, "messages"), orderBy("timestamp", "asc"));
    
    const unsubscribeChat = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(fetchedMessages);
      // تحريك التمرير لأسفل عند وصول رسالة جديدة
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (error) => {
      console.error("Firebase Error:", error);
    });

    return () => unsubscribeChat();
  }, [currentUser]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    const messageData = {
      text: inputText.trim(),
      senderId: currentUser.uid,
      senderEmail: currentUser.email,
      senderName: currentUser.displayName || 'مستخدم', // إضافة الاسم ليعرف البائع مع من يتحدث
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "messages"), messageData);
      setInputText('');
    } catch (err) {
      alert("عذراً، فشل إرسال الرسالة. تأكد من إعدادات Firebase Rules");
    }
  };

  if (loading) return (
    <div className="fixed bottom-4 right-4 bg-white p-6 rounded-2xl shadow-xl border flex items-center gap-3">
      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-black">جاري تحميل الدردشة...</span>
    </div>
  );

  if (!currentUser) return (
    <div className="fixed bottom-4 right-4 bg-white p-6 rounded-2xl shadow-xl border text-red-500 font-bold animate-bounce">
      ⚠️ يرجى تسجيل الدخول أولاً للدردشة
    </div>
  );

  return (
    <div className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 z-[100] w-full sm:w-[400px] h-full sm:h-[600px] bg-white border border-slate-200 flex flex-col shadow-2xl sm:rounded-2xl overflow-hidden text-black animate-in slide-in-from-bottom-5" dir="rtl">
      {/* Header - يمكنك تغيير bg-blue-600 لأي لون رمضاني */}
      <div className="p-4 bg-indigo-700 text-white flex justify-between items-center shrink-0 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="font-bold">دردشة بازار رمضان</span>
        </div>
        <button onClick={onClose} className="hover:bg-indigo-800 p-1 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f0f2f5]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <svg className="w-12 h-12 opacity-20" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /></svg>
            <p className="text-sm">لا توجد رسائل.. استفسر عن المنتج الآن!</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.senderId === currentUser?.uid ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-[15px] shadow-sm ${
                msg.senderId === currentUser?.uid 
                  ? 'bg-indigo-600 text-white rounded-tl-none' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tr-none'
              }`}>
                {msg.text}
                <div className={`text-[10px] mt-1 opacity-70 ${msg.senderId === currentUser?.uid ? 'text-left' : 'text-right'}`}>
                  {msg.senderName}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2 items-center">
        <input 
          className="flex-1 border border-slate-200 rounded-full px-5 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
          placeholder="اكتب استفسارك هنا..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={!inputText.trim()} 
          className="bg-indigo-600 text-white p-2.5 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale transition-all shadow-md"
        >
          <svg className="w-5 h-5 rotate-180" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
        </button>
      </form>
    </div>
  );
};

export default ChatManager;
