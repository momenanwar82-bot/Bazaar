
import React, { useState, useMemo, useEffect } from 'react';
import { Category, Product, Currency, SellerNotification } from './types';
import { INITIAL_PRODUCTS, CURRENCIES } from './constants';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import ProductCard from './components/ProductCard';
import SellProductModal from './components/SellProductModal';
import ProductDetailModal from './components/ProductDetailModal';
import LoginModal from './components/LoginModal';
import UserSummaryModal from './components/UserSummaryModal';
import Footer from './components/Footer';
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
import { 
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  where
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<SellerNotification[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryInitialTab, setSummaryInitialTab] = useState<'listings' | 'saved' | 'alerts'>('listings');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [dbEmpty, setDbEmpty] = useState(false);
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
          title: String(data.title || ''),
          description: String(data.description || ''),
          price: Number(data.price || 0),
          category: data.category as Category,
          imageUrl: String(data.imageUrl || ''),
          location: String(data.location || ''),
          sellerName: String(data.sellerName || ''),
          sellerEmail: String(data.sellerEmail || ''),
          phoneNumber: String(data.phoneNumber || ''),
          rating: Number(data.rating || 0),
          reviewsCount: Number(data.reviewsCount || 0),
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
        } as Product;
      });
      
      if (fetchedProducts.length === 0) {
        setProducts([]);
        setDbEmpty(true);
      } else {
        setProducts(fetchedProducts);
        setDbEmpty(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const displayProducts = useMemo(() => {
    if (products.length === 0 && dbEmpty) return []; 
    return products;
  }, [products, dbEmpty]);

  useEffect(() => {
    if (!user) return;
    updateRemainingAds();
    const q = query(collection(db, "notifications"), where("sellerEmail", "==", user.email));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          sellerEmail: String(data.sellerEmail || ''),
          productTitle: String(data.productTitle || ''),
          type: data.type as any,
          message: String(data.message || ''),
          isRead: Boolean(data.isRead),
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
    showToast("Successfully logged out");
  };

  const handleAddProduct = async (newProduct: Product) => {
    if (!user) return;
    try {
      const cleanDataForDB = {
        title: String(newProduct.title),
        description: String(newProduct.description),
        price: Number(newProduct.price),
        category: String(newProduct.category),
        imageUrl: String(newProduct.imageUrl),
        location: String(newProduct.location),
        phoneNumber: String(newProduct.phoneNumber),
        sellerName: String(user.name),
        sellerEmail: String(user.email),
        rating: 0,
        reviewsCount: 0
      };

      await saveProductToDB(cleanDataForDB);
      await updateRemainingAds();
      showToast("Listing published successfully!");
      setIsSellModalOpen(false);
    } catch (err) {
      console.error("Publish error:", err);
      showToast("Failed to publish ad", "error");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!user) return;
    try {
      await deleteProductFromDB(productId);
      await updateRemainingAds();
      showToast("Ad removed successfully");
      if (selectedProduct?.id === productId) setSelectedProduct(null);
    } catch (err) {
      showToast("Delete failed.", "error");
    }
  };

  const toggleWishlist = (productId: string) => {
    const exists = wishlist.includes(productId);
    setWishlist(prev => exists ? prev.filter(id => id !== productId) : [...prev, productId]);
    showToast(exists ? "Removed from saved" : "Added to saved");
  };

  const filteredProducts = useMemo(() => {
    return displayProducts.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = searchQuery === '' || p.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFav = !showFavoritesOnly || wishlist.includes(p.id);
      return matchesCategory && matchesSearch && matchesFav;
    });
  }, [displayProducts, selectedCategory, searchQuery, showFavoritesOnly, wishlist]);

  if (isInitialLoad) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <LoginModal onClose={() => {}} onLogin={(e, n) => setUser({email: e, name: n})} hideCloseButton={true} initialMode="login" />
      </div>
    );
  }

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
        selectedCurrency={selectedCurrency} onCurrencyChange={setSelectedCurrency} remainingAds={remainingAds}
      />
      
      <CategoryBar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative text-left">
        <h1 className="text-xl sm:text-2xl font-black text-white uppercase mb-6 tracking-tight flex items-center gap-3">
          <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
          {showFavoritesOnly ? 'My Favorites' : selectedCategory === 'All' ? 'Marketplace' : selectedCategory}
        </h1>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-8">
            {filteredProducts.map((product, index) => (
              <React.Fragment key={product.id}>
                <ProductCard 
                  product={product} onClick={() => setSelectedProduct(product)}
                  isWishlisted={wishlist.includes(product.id)} onToggleWishlist={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                  currency={selectedCurrency} onShowToast={showToast} currentUserEmail={user.email} 
                  onDelete={handleDeleteProduct} showDeleteButton={false} 
                />
                {(index + 1) % 2 === 0 && (
                  <div className="col-span-2 my-4">
                    <AdBanner />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center">
             <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 opacity-20">
                <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
             </div>
             <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">No listings found in this category</p>
          </div>
        )}

        {toast && (
          <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-500 font-black text-[10px] uppercase tracking-widest ${
            toast.type === 'success' ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30' : 'bg-red-600/20 text-red-400 border-red-500/30'
          }`}>
            {toast.message}
          </div>
        )}
      </main>

      <Footer onOpenPrivacy={() => setShowPrivacy(true)} onOpenTerms={() => setShowTerms(true)} onOpenContact={() => setShowContact(true)} onOpenSell={() => setIsSellModalOpen(true)} />

      {isSellModalOpen && <SellProductModal onClose={() => setIsSellModalOpen(false)} onAdd={handleAddProduct} userEmail={user.email} />}
      {selectedProduct && <ProductDetailModal 
        product={selectedProduct} onClose={() => setSelectedProduct(null)} 
        isWishlisted={wishlist.includes(selectedProduct.id)} onToggleWishlist={() => toggleWishlist(selectedProduct.id)} 
        onViewProfile={() => {}} currency={selectedCurrency} currentUserEmail={user.email} currentUserName={user.name} 
        onDeleteProduct={handleDeleteProduct} onShowToast={showToast} 
      />}
      {isSummaryModalOpen && (
        <UserSummaryModal 
          user={user} userProducts={products.filter(p => p.sellerEmail === user.email)} 
          wishlistedProducts={products.filter(p => wishlist.includes(p.id))} 
          notifications={notifications} onClose={() => setIsSummaryModalOpen(false)} 
          onLogout={handleLogout} onProductClick={(p) => setSelectedProduct(p)} 
          currency={selectedCurrency} onDeleteProduct={handleDeleteProduct} 
          onClearNotification={markNotificationAsRead} onRefresh={async () => {}}
          initialTab={summaryInitialTab} currentUserEmail={user.email} remainingAds={remainingAds}
        />
      )}
      
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </div>
  );
};

export default App;
