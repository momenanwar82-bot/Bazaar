
import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Category, Product, SellerNotification } from './types';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import ProductCard from './components/ProductCard';
import SellProductModal from './components/SellProductModal';
import ProductDetailModal from './components/ProductDetailModal';
import LoginModal from './components/LoginModal';
import UserSummaryModal from './components/UserSummaryModal';
import UserProfileModal from './components/UserProfileModal'; 
import LiveChatWindow from './components/LiveChatWindow';
import ChatPage from './components/ChatPage';
import ShareSheet from './components/ShareSheet';
import AdBanner from './components/AdBanner';
import { PrivacyModal, TermsModal, ContactModal } from './components/LegalModals';
import { 
  db, 
  auth,
  saveProductToDB, 
  deleteProductFromDB, 
  markNotificationAsRead,
  logoutUser,
  getUserUploadCountToday
} from './services/geminiService';
import { generateChatId } from './services/chatService';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { collection, onSnapshot, query, orderBy, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const MainContent: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<SellerNotification[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginInitialMode, setLoginInitialMode] = useState<'login' | 'signup'>('login');
  const [viewingSellerName, setViewingSellerName] = useState<string | null>(null); 
  const [activeChat, setActiveChat] = useState<{id: string, productTitle: string, sellerName: string} | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [sharingProduct, setSharingProduct] = useState<Product | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [remainingAds, setRemainingAds] = useState(0);

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showContact, setShowContact] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({ email: firebaseUser.email || '', name: firebaseUser.displayName || 'User' });
        setIsLoginModalOpen(false);
      } else {
        setUser(null);
      }
      setIsInitialLoad(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProducts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
        } as Product;
      });
      setProducts(fetchedProducts);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    updateRemainingAds();
    const q = query(collection(db, "notifications"), where("sellerEmail", "==", user.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date()
        };
      }) as SellerNotification[];
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
    setIsSummaryModalOpen(false);
    showToast("Logged out");
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setLoginInitialMode(mode);
    setIsLoginModalOpen(true);
  };

  const handleAddProduct = async (newProduct: Product) => {
    if (!user) return;
    try {
      await saveProductToDB({ ...newProduct, sellerName: user.name, sellerEmail: user.email, rating: 0, reviewsCount: 0 });
      await updateRemainingAds();
      showToast("Published!");
      setIsSellModalOpen(false);
    } catch (err) {
      showToast("Failed", "error");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!user) return;
    try {
      await deleteProductFromDB(productId);
      await updateRemainingAds();
      showToast("Deleted");
      if (selectedProduct?.id === productId) setSelectedProduct(null);
    } catch (err) {
      showToast("Failed", "error");
    }
  };

  const startChat = (product: Product) => {
    if (!user) {
      openAuth('login');
      return;
    }
    const chatId = generateChatId(product.id, user.email);
    setActiveChat({ id: chatId, productTitle: product.title, sellerName: product.sellerName });
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
    <div className="min-h-screen bg-[#030712] flex items-center justify-center">
      <div className="loader-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#030712] text-slate-50 flex flex-col">
      <Navbar 
        user={user}
        onOpenLogin={() => openAuth('login')}
        onOpenSellModal={() => user ? setIsSellModalOpen(true) : openAuth('login')}
        onViewMyProfile={() => setIsSummaryModalOpen(true)}
        unreadCount={notifications.filter(n => !n.isRead).length}
      />
      
      <Routes>
        <Route path="/" element={
          <>
            <CategoryBar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />
            <main className="flex-grow max-w-7xl mx-auto px-4 py-8 w-full relative">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-[#4f46e5] rounded-full"></div>
                  Global Market
                </h1>
                <div className="flex gap-4 opacity-30">
                   <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M15 19l-7-7 7-7" strokeWidth={3}/></svg>
                     Swipe to browse
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 5l7 7-7 7" strokeWidth={3}/></svg>
                   </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
                {filteredProducts.map((product, index) => (
                  <React.Fragment key={product.id}>
                    <ProductCard 
                      product={product} 
                      onClick={() => setSelectedProduct(product)}
                      isWishlisted={wishlist.includes(product.id)} 
                      onToggleWishlist={(e) => { 
                        e.stopPropagation(); 
                        setWishlist(prev => prev.includes(product.id) ? prev.filter(id => id !== product.id) : [...prev, product.id]) 
                      }}
                      onShare={() => setSharingProduct(product)}
                      onChat={startChat}
                    />
                    {(index + 1) % 2 === 0 && <div className="sm:col-span-2 my-4"><AdBanner /></div>}
                  </React.Fragment>
                ))}
              </div>
            </main>
          </>
        } />
        
        <Route path="/chat" element={<ChatPage user={user!} userProducts={products} wishlistedProducts={[]} notifications={notifications} onClose={() => window.history.back()} onLogout={handleLogout} onProductClick={() => {}} onDeleteProduct={() => {}} onClearNotification={() => {}} remainingAds={0} currentUserEmail={user?.email || ''} onRefresh={async () => {}} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Bottom Nav Bar from Screenshot */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-16 bg-[#111827]/80 backdrop-blur-xl rounded-full border border-white/5 shadow-2xl z-[100] flex items-center justify-between px-6">
        <button className="text-slate-500"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg></button>
        <div className="flex bg-[#1f2937] rounded-full p-1 gap-1">
          <button className="px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest text-slate-400">Chat</button>
          <button className="px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-[#374151] text-white">Preview</button>
        </div>
        <button className="text-slate-500"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg></button>
      </div>

      {/* Modals */}
      {isLoginModalOpen && (
        <LoginModal 
          onClose={() => setIsLoginModalOpen(false)} 
          onLogin={(email, name) => { setUser({email, name}); setIsLoginModalOpen(false); }} 
          initialMode={loginInitialMode}
        />
      )}
      {isSellModalOpen && user && <SellProductModal onClose={() => setIsSellModalOpen(false)} onAdd={handleAddProduct} userEmail={user.email} />}
      {selectedProduct && <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} isWishlisted={wishlist.includes(selectedProduct.id)} onToggleWishlist={() => setWishlist(prev => prev.includes(selectedProduct.id) ? prev.filter(id => id !== selectedProduct.id) : [...prev, selectedProduct.id])} onViewProfile={(sellerName) => setViewingSellerName(sellerName)} currentUserEmail={user?.email} currentUserName={user?.name} onDeleteProduct={handleDeleteProduct} onShowToast={showToast} onShare={() => setSharingProduct(selectedProduct)} onStartChat={() => startChat(selectedProduct)} />}
      {activeChat && user && <LiveChatWindow chatId={activeChat.id} currentUser={user} productTitle={activeChat.productTitle} sellerName={activeChat.sellerName} onClose={() => setActiveChat(null)} />}
      {sharingProduct && <ShareSheet product={sharingProduct} onClose={() => setSharingProduct(null)} onShowToast={showToast} />}
      {isSummaryModalOpen && user && <UserSummaryModal user={user} userProducts={products.filter(p => p.sellerEmail === user.email)} wishlistedProducts={products.filter(p => wishlist.includes(p.id))} notifications={notifications} onClose={() => setIsSummaryModalOpen(false)} onLogout={handleLogout} onProductClick={(p) => setSelectedProduct(p)} onDeleteProduct={handleDeleteProduct} onClearNotification={markNotificationAsRead} onRefresh={async () => {}} initialTab={'listings'} currentUserEmail={user.email} remainingAds={remainingAds} />}
      
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}

      {toast && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] px-8 py-3 rounded-full shadow-2xl border backdrop-blur-xl font-black text-[9px] uppercase tracking-widest ${toast.type === 'success' ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30' : 'bg-red-600/20 text-red-400 border-red-500/30'} animate-in slide-in-from-bottom-5 duration-500`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MainContent />
    </BrowserRouter>
  );
};

export default App;
