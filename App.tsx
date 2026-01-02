
import React, { useState, useMemo, useEffect } from 'react';
import { Category, Product, Chat, ChatMessage, Currency, Review } from './types';
import { INITIAL_PRODUCTS, CURRENCIES } from './constants';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategoryBar';
import ProductCard from './components/ProductCard';
import SellProductModal from './components/SellProductModal';
import ProductDetailModal from './components/ProductDetailModal';
import LoginModal from './components/LoginModal';
import ChatManager from './components/ChatManager';
import UserProfileModal from './components/UserProfileModal';
import UserSummaryModal from './components/UserSummaryModal';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [viewingProfileSeller, setViewingProfileSeller] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]);
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isChatManagerOpen, setIsChatManagerOpen] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('bazaar_user_v2');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      const savedWishlist = localStorage.getItem(`bazaar_wishlist_${parsedUser.email}`);
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    }
    
    const globalWishlist = localStorage.getItem('bazaar_wishlist');
    if (globalWishlist && !user) setWishlist(JSON.parse(globalWishlist));

    const savedChats = localStorage.getItem('bazaar_chats');
    if (savedChats) {
      const parsed = JSON.parse(savedChats);
      const hydrated = parsed.map((c: Chat) => ({
        ...c,
        messages: c.messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
      }));
      setChats(hydrated);
    }
    const savedProducts = localStorage.getItem('bazaar_products');
    if (savedProducts) {
      const parsed = JSON.parse(savedProducts).map((p: any) => ({
        ...p, 
        createdAt: new Date(p.createdAt),
        reviews: (p.reviews || []).map((r: any) => ({ ...r, timestamp: new Date(r.timestamp) }))
      }));
      setProducts(parsed);
    }
    
    const savedCurrencyCode = localStorage.getItem('bazaar_currency');
    if (savedCurrencyCode) {
      const found = CURRENCIES.find(c => c.code === savedCurrencyCode);
      if (found) setSelectedCurrency(found);
    }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(`bazaar_wishlist_${user.email}`, JSON.stringify(wishlist));
    } else {
      localStorage.setItem('bazaar_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  useEffect(() => {
    localStorage.setItem('bazaar_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('bazaar_products', JSON.stringify(products));
  }, [products]);

  const handleCurrencyChange = (curr: Currency) => {
    setSelectedCurrency(curr);
    localStorage.setItem('bazaar_currency', curr.code);
  };

  const handleLogin = (email: string, name: string) => {
    const newUser = { email, name };
    setUser(newUser);
    localStorage.setItem('bazaar_user_v2', JSON.stringify(newUser));
    const savedWishlist = localStorage.getItem(`bazaar_wishlist_${email}`);
    setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('bazaar_user_v2');
    setChats([]);
    setActiveChatId(null);
    setWishlist([]);
    setIsChatManagerOpen(false);
    setIsSummaryModalOpen(false);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const handleRateProduct = (productId: string, newRatingValue: number) => {
    const reviewerName = user?.name || "Guest Buyer";
    const newReview: Review = {
      id: Date.now().toString(),
      userName: reviewerName,
      rating: newRatingValue,
      comment: "Highly rated via quick review.",
      timestamp: new Date()
    };

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const currentReviews = p.reviews || [];
        const nextReviews = [newReview, ...currentReviews];
        const nextCount = nextReviews.length;
        const totalRating = nextReviews.reduce((sum, r) => sum + r.rating, 0);
        const nextRating = Number((totalRating / nextCount).toFixed(1));
        
        const updatedProduct = { ...p, rating: nextRating, reviewsCount: nextCount, reviews: nextReviews };
        if (selectedProduct?.id === productId) {
          setSelectedProduct(updatedProduct);
        }
        return updatedProduct;
      }
      return p;
    }));
  };

  const startChat = (product: Product) => {
    if (!user) return;
    const existingChat = chats.find(c => c.productId === product.id);
    if (existingChat) {
      setActiveChatId(existingChat.id);
    } else {
      const newChat: Chat = {
        id: Date.now().toString(),
        productId: product.id,
        productTitle: product.title,
        productImage: product.imageUrl,
        sellerName: product.sellerName,
        lastMessage: 'Hi! Regarding this item, I\'m available to answer your questions.',
        messages: [{
          id: '1',
          sender: product.sellerName,
          text: `Hi! Regarding "${product.title}", I'm available to answer your questions.`,
          timestamp: new Date(),
          status: 'read'
        }],
        unread: false
      };
      setChats([newChat, ...chats]);
      setActiveChatId(newChat.id);
    }
    setIsChatManagerOpen(true);
    setSelectedProduct(null);
  };

  const userProducts = useMemo(() => {
    if (!user) return [];
    return products.filter(p => p.sellerEmail === user.email);
  }, [products, user]);

  const wishlistedProducts = useMemo(() => {
    return products.filter(p => wishlist.includes(p.id));
  }, [products, wishlist]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = query === '' || 
                            p.title.toLowerCase().includes(query) || 
                            p.description.toLowerCase().includes(query) ||
                            p.category.toLowerCase().includes(query) ||
                            p.location.toLowerCase().includes(query);
      const matchesWishlist = !showFavoritesOnly || wishlist.includes(p.id);
      return matchesCategory && matchesSearch && matchesWishlist;
    });
  }, [products, selectedCategory, searchQuery, showFavoritesOnly, wishlist]);

  const handleAddProduct = (newProduct: Product) => {
    if (!user) return;
    const productWithSeller = { 
      ...newProduct, 
      sellerName: user.name,
      sellerEmail: user.email,
      rating: 0, 
      reviewsCount: 0, 
      reviews: [] 
    };
    setProducts([productWithSeller, ...products]);
    setIsSellModalOpen(false);
  };

  const handleSendMessage = (chatId: string, text: string) => {
    if (!user) return;
    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: text.includes("Hi! Regarding") || text.includes("Hello, how can I help you?") ? c.sellerName : user.name,
          text,
          timestamp: new Date(),
          status: 'read'
        };
        const finalSender = chats.find(chat => chat.id === chatId)?.sellerName === newMessage.sender ? c.sellerName : user.name;
        newMessage.sender = finalSender;

        return {
          ...c,
          messages: [...c.messages, newMessage],
          lastMessage: text
        };
      }
      return c;
    }));
  };

  if (isInitialLoad) return null;

  // Force login if no user is found
  if (!user) {
    return <LoginModal onClose={() => {}} onLogin={handleLogin} hideCloseButton={true} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col transition-colors duration-300">
      <Navbar 
        onSearch={setSearchQuery} 
        onOpenSellModal={() => setIsSellModalOpen(true)}
        user={user}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        wishlistCount={wishlist.length}
        showFavoritesOnly={showFavoritesOnly}
        onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
        onOpenChat={() => setIsChatManagerOpen(true)}
        unreadChats={chats.filter(c => c.unread).length}
        onViewMyProfile={() => setIsSummaryModalOpen(true)}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={handleCurrencyChange}
      />
      
      <CategoryBar 
        selectedCategory={selectedCategory} 
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setShowFavoritesOnly(false);
        }} 
      />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight">
            {showFavoritesOnly ? 'Favorites' : selectedCategory === 'All' ? 'Global Marketplace' : `${selectedCategory}`}
          </h1>
          <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest">
            {searchQuery ? `Searching for "${searchQuery}"` : 'Curated premium listings for global traders'}
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => setSelectedProduct(product)}
                isWishlisted={wishlist.includes(product.id)}
                onToggleWishlist={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                onRate={handleRateProduct}
                currency={selectedCurrency}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/30 rounded-[40px] border border-slate-800/50 border-dashed">
            <p className="text-slate-600 font-black uppercase tracking-[0.3em]">No results found</p>
          </div>
        )}
      </main>

      {isChatManagerOpen && (
        <ChatManager 
          chats={chats}
          activeChatId={activeChatId}
          currentUser={user.name}
          onClose={() => setIsChatManagerOpen(false)}
          onSelectChat={setActiveChatId}
          onSendMessage={handleSendMessage}
        />
      )}

      {isSellModalOpen && <SellProductModal onClose={() => setIsSellModalOpen(false)} onAdd={handleAddProduct} />}
      {isSummaryModalOpen && (
        <UserSummaryModal 
          user={user} 
          userProducts={userProducts} 
          wishlistedProducts={wishlistedProducts}
          onClose={() => setIsSummaryModalOpen(false)} 
          onLogout={handleLogout}
          onProductClick={(p) => { setSelectedProduct(p); setIsSummaryModalOpen(false); }}
          currency={selectedCurrency}
        />
      )}
      
      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          isWishlisted={wishlist.includes(selectedProduct.id)}
          onToggleWishlist={() => toggleWishlist(selectedProduct.id)}
          onStartChat={startChat}
          onViewProfile={(seller) => { setViewingProfileSeller(seller); setSelectedProduct(null); }}
          onRate={handleRateProduct}
          currency={selectedCurrency}
        />
      )}

      {viewingProfileSeller && (
        <UserProfileModal 
          sellerName={viewingProfileSeller}
          allProducts={products}
          onClose={() => setViewingProfileSeller(null)}
          onProductClick={(p) => { setSelectedProduct(p); setViewingProfileSeller(null); }}
          onStartChat={(p) => { startChat(p); setViewingProfileSeller(null); }}
        />
      )}

      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-center">
        <div className="text-[10px] text-slate-700 font-black uppercase tracking-[0.5em] mb-4">Bazaar Global Premium</div>
        <p className="text-[9px] text-slate-800 max-w-md mx-auto leading-relaxed">Verified trade platform. AI Moderated. Multi-currency support enabled.</p>
      </footer>
    </div>
  );
};

export default App;
