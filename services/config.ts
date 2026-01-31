import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { db, auth } from './services/config';
import { onAuthStateChanged } from "firebase/auth";
import Navbar from './components/Navbar';
// ... باقي الـ imports العادية (Footer, ProductCard, إلخ)

// 🔥 1. الشات Lazy Load: مش هيتحمل غير لما العميل يطلبه
const ChatManager = lazy(() => import('./components/ChatManager'));

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [activeAdId, setActiveAdId] = useState<string | null>(null);

  // مراقبة الدخول مع حماية من الشاشة السوداء
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 2000);
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      clearTimeout(timer);
      setUser(u ? { email: u.email, name: u.displayName } : null);
      setIsInitialLoad(false);
    });
    return () => { unsubscribe(); clearTimeout(timer); };
  }, []);

  // دالة لفتح الشات (اختياري) أو واتساب (افتراضي)
  const handleContactSeller = (adId: string, phone: string) => {
    const useWhatsApp = true; // النصيحة الذهبية: خلي واتساب هو الأساس
    if (useWhatsApp) {
      window.open(`https://wa.me/${phone}?text=انا مهتم بمنتجك`, '_blank');
    } else {
      setActiveAdId(adId);
      setShowChat(true);
    }
  };

  if (isInitialLoad) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar user={user} />
      
      <main className="p-4">
        {/* عرض المنتجات */}
        {/* عند الضغط على منتج، نمرر الـ handleContactSeller */}
      </main>

      {/* 🔥 2. استخدام Suspense لعرض الشات بدون تهنيج الموقع */}
      {showChat && activeAdId && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center">جاري فتح المحادثة...</div>}>
          <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/80">
            <ChatManager adId={activeAdId} onClose={() => setShowChat(false)} />
          </div>
        </Suspense>
      )}

      <Footer />
    </div>
  );
};

export default App;
