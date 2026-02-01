import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { db, auth } from './services/firebase'; // firebase.ts منفصل
import { onAuthStateChanged } from "firebase/auth";

import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import ProductCard from './components/ProductCard';
import SellProductModal from './components/SellProductModal';
import ProductDetailModal from './components/ProductDetailModal';
import LoginModal from './components/LoginModal';
import UserSummaryModal from './components/UserSummaryModal';
import Footer from './components/Footer';
import ShareSheet from './components/ShareSheet';
import { PrivacyModal, TermsModal, ContactModal } from './components/LegalModals';

// Lazy load للشات
const ChatManager = lazy(() => import('./components/ChatManager'));

interface Product {
  id: string;
  title: string;
  category: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [activeChatAdId, setActiveChatAdId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  // مراقبة الدخول
  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 2000);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      clearTimeout(timer);
      if (firebaseUser) setUser({ email: firebaseUser.email || '', name: firebaseUser.displayName || 'User' });
      else setUser(null);
      setIsInitialLoad(false);
    });
    return () => { unsubscribe(); clearTimeout(timer); };
  }, []);

  // Spinner أولي
  if (isInitialLoad) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // لو المستخدم غير مسجل دخول
  if (!user) return <LoginModal onClose={() => {}} onLogin={(e, n) => setUser({email: e, name: n})} hideCloseButton initialMode="login" />;

  // فتح الشات لكل إعلان
  const handleStartChat = (adId: string) => {
    setActiveChatAdId(adId);
    setShowChat(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <Navbar user={user} onOpenChat={() => setShowChat(true)} />
      {!showChat && <CategoryBar selectedCategory="All" onSelectCategory={() => {}} />}

      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        {!showChat ? (
          <div className="grid grid-cols-2 gap-4">
            {products.length > 0 ? (
              products.map(p => (
                <ProductCard 
                  key={p.id} 
                  product={p} 
                  onStartChat={() => handleStartChat(p.id)} 
                />
              ))
            ) : (
              <p className="text-slate-400 col-span-2 text-center">لا توجد منتجات حالياً</p>
            )}
          </div>
        ) : (
          <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center">جاري فتح المحادثة...</div>}>
            <div className="fixed inset-0 z-50 p-4 flex items-center justify-center bg-black/80">
              <ChatManager adId={activeChatAdId || 'demo'} onClose={() => setShowChat(false)} />
            </div>
          </Suspense>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;
