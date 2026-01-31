import React, { useState, useMemo, useEffect } from 'react';
import { Category, Product, SellerNotification } from './types';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import ProductCard from './components/ProductCard';
import SellProductModal from './components/SellProductModal';
import ProductDetailModal from './components/ProductDetailModal';
import LoginModal from './components/LoginModal';
import UserSummaryModal from './components/UserSummaryModal';
import UserProfileModal from './components/UserProfileModal'; 
import Footer from './components/Footer';
import AdBanner from './components/AdBanner';
import ShareSheet from './components/ShareSheet';
import ChatManager from './components/ChatManager'; 
import { PrivacyModal, TermsModal, ContactModal } from './components/LegalModals';

// استيراد Firebase
import { db, auth } from './services/config';
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";

import { 
  saveProductToDB, 
  deleteProductFromDB, 
  markNotificationAsRead,
  logoutUser,
  getUserUploadCountToday
} from './services/geminiService';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<SellerNotification[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [viewingSellerName, setViewingSellerName] = useState<string | null>(null); 
  const [summaryInitialTab, setSummaryInitialTab] = useState<'listings' | 'saved' | 'alerts'>('listings');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sharingProduct, setSharingProduct] = useState<Product | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [dbEmpty, setDbEmpty] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [remainingAds, setRemainingAds] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [activeChatSeller, setActiveChatSeller] = useState<string | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 3000);
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      clearTimeout(timer);
      if (firebaseUser) {
        setUser({ email: firebaseUser.email || '', name: firebaseUser.displayName || 'User' });
      } else {
        setUser(null);
      }
      setIsInitialLoad(false);
    }, () => setIsInitialLoad(false));
    return () => { unsubscribe(); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
      })) as Product[];
      setProducts(fetchedProducts);
      setDbEmpty(fetchedProducts.length === 0);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    updateRemainingAds();
    const q = query(collection(db, "notifications"), where("sellerEmail", "==", user.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date()
      })) as SellerNotification[];
      setNotifications(fetched.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
    });
    return () => unsubscribe();
  }, [user]);

  const updateRemainingAds = async () => {
    if (!user) return;
    const count = await getUserUploadCountToday(user.email);
    setRemainingAds(Math.max(0, 2 - count));
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setShowChat(false);
    setIsSummaryModalOpen(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!user) return;
    try {
      await deleteProductFromDB(productId);
      await updateRemainingAds();
      showToast("Ad removed successfully");
    } catch (err) {
      showToast("Delete failed.", "error");
    }
  };

  const toggleWishlist = (productId: string) => {
    const exists = wishlist.includes(productId);
    setWishlist(prev => exists ? prev.filter(id => id !== productId) : [...prev, productId]);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = searchQuery === '' || p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFav = !showFavoritesOnly || wishlist.includes(p.id);
      return matchesCategory && matchesSearch && matchesFav;
    });
  }, [products, selectedCategory, searchQuery, showFavoritesOnly, wishlist]);

  if (isInitialLoad) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <LoginModal onClose={() => {}} onLogin={(e, n) => setUser({email: e, name: n})} hideCloseButton={true} initialMode="login" />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Navbar 
        onSearch={setSearchQuery} onOpenSellModal={() => setIsSellModalOpen(true)} user={user}
        onOpenLogin={() => {}} onOpenSignUp={() => {}} onLogout={handleLogout}
        wishlistCount={wishlist.length} showFavoritesOnly={showFavoritesOnly} onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
        onOpenNotifications={() => { setSummaryInitialTab('alerts'); setIsSummaryModalOpen(true); }}
        unreadCount={notifications.filter(n => !n.isRead).length} notifications={notifications}
        onMarkAsRead={markNotificationAsRead} onClearAll={() => {}}
        onViewMyProfile={() => { setSummaryInitialTab('listings'); setIsSummaryModalOpen(true); }}
        remainingAds={remainingAds} onOpenChat={() => setShowChat(true)}
      />
      {!showChat && <CategoryBar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />}
      <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full">
        {showChat ? <ChatManager onClose={() => setShowChat(false)} /> : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map(p => <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p)} isWishlisted={wishlist.includes(p.id)} onToggleWishlist={(e) => {e.stopPropagation(); toggleWishlist(p.id)}} onShowToast={showToast} currentUserEmail={user.email} onDelete={handleDeleteProduct} showDeleteButton={false} onShare={() => setSharingProduct(p)} onStartChat={() => setShowChat(true)} />)}
          </div>
        )}
      </main>
      <Footer onOpenPrivacy={() => setShowPrivacy(true)} onOpenTerms={() => setShowTerms(true)} onOpenContact={() => setShowContact(true)} onOpenSell={() => setIsSellModalOpen(true)} />
      {isSellModalOpen && <SellProductModal onClose={() => setIsSellModalOpen(false)} onAdd={async (p) => { await saveProductToDB({...p, sellerName: user.name, sellerEmail: user.email}); setIsSellModalOpen(false); updateRemainingAds(); }} userEmail={user.email} />}
      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} isWishlisted={wishlist.includes(selectedProduct.id)} onToggleWishlist={() => toggleWishlist(selectedProduct.id)} onViewProfile={setViewingSellerName} currentUserEmail={user.email} currentUserName={user.name} onDeleteProduct={handleDeleteProduct} onShowToast={showToast} onShare={() => setSharingProduct(selectedProduct)} onStartChat={() => {setShowChat(true); setSelectedProduct(null);}} />}
      {sharingProduct && <ShareSheet product={sharingProduct} onClose={() => setSharingProduct(null)} onShowToast={showToast} />}
      {isSummaryModalOpen && <UserSummaryModal user={user} userProducts={products.filter(p => p.sellerEmail === user.email)} wishlistedProducts={products.filter(p => wishlist.includes(p.id))} notifications={notifications} onClose={() => setIsSummaryModalOpen(false)} onLogout={handleLogout} onProductClick={setSelectedProduct} onDeleteProduct={handleDeleteProduct} onClearNotification={markNotificationAsRead} onRefresh={async () => {}} initialTab={summaryInitialTab} currentUserEmail={user.email} remainingAds={remainingAds} />}
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
      {toast && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-2xl">{toast.message}</div>}
    </div>
  );
};

export default App;
