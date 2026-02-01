import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import { db, auth } from './services/firebase';
import { onAuthStateChanged } from "firebase/auth";

import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import ProductCard from './components/ProductCard';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';

// 🔥 Lazy load للشات
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

  // التعامل مع فتح الشات لكل إعلان
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
              <p className="text-slate-400">لا توجد منتجات حالياً</p>
            )}
          </div>
        )
