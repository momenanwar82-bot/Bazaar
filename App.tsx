// 1. مراقبة حالة تسجيل الدخول (تعديل بسيط لضمان الفتح)
  useEffect(() => {
    // مؤقت أمان: لو مفيش رد في خلال 3 ثواني، افتح الموقع برضه
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      clearTimeout(timer); // لو الرد جه بسرعة، الغي المؤقت
      if (firebaseUser) {
        setUser({ email: firebaseUser.email || '', name: firebaseUser.displayName || 'User' });
      } else {
        setUser(null);
      }
      setIsInitialLoad(false);
    }, (error) => {
      console.error("Auth Error:", error);
      setIsInitialLoad(false);
    });
    
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

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
    showToast("Successfully logged out");
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
        wishlistCount={wishlist.length} showFavoritesOnly={showFavoritesOnly} onToggleFavorites={() => {setShowFavoritesOnly(!showFavoritesOnly); setShowChat(false);}}
        onOpenNotifications={() => { setSummaryInitialTab('alerts'); setIsSummaryModalOpen(true); }}
        unreadCount={notifications.filter(n => !n.isRead).length} notifications={notifications}
        onMarkAsRead={markNotificationAsRead} onClearAll={() => {}}
        onViewMyProfile={() => { setSummaryInitialTab('listings'); setIsSummaryModalOpen(true); }}
        remainingAds={remainingAds}
        onOpenChat={() => setShowChat(true)}
      />
      
      {!showChat && <CategoryBar selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />}

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative text-left">
        {showChat ? (
          <ChatManager onClose={() => {setShowChat(false); setActiveChatSeller(null);}} />
        ) : (
          <>
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
                      onShowToast={showToast} currentUserEmail={user.email} 
                      onDelete={handleDeleteProduct} showDeleteButton={false} 
                      onShare={() => setSharingProduct(product)}
                      onStartChat={() => { setActiveChatSeller(product.sellerEmail); setShowChat(true); }}
                    />
                    {(index + 1) % 2 === 0 && <div className="col-span-2 my-4"><AdBanner /></div>}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center opacity-20">
                 <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">No listings found</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* تصحيح منطق فتح النوافذ المنبثقة */}
      <Footer 
        onOpenPrivacy={() => setShowPrivacy(true)} 
        onOpenTerms={() => setShowTerms(true)} 
        onOpenContact={() => setShowContact(true)} 
        onOpenSell={() => setIsSellModalOpen(true)} 
      />

      {isSellModalOpen && <SellProductModal onClose={() => setIsSellModalOpen(false)} onAdd={async (p) => { await saveProductToDB({...p, sellerName: user.name, sellerEmail: user.email}); setIsSellModalOpen(false); updateRemainingAds(); }} userEmail={user.email} />}
      
      {selectedProduct && <ProductDetailModal 
        product={selectedProduct} onClose={() => setSelectedProduct(null)} 
        isWishlisted={wishlist.includes(selectedProduct.id)} onToggleWishlist={() => toggleWishlist(selectedProduct.id)} 
        onViewProfile={(sellerName) => setViewingSellerName(sellerName)} currentUserEmail={user.email} currentUserName={user.name} 
        onDeleteProduct={handleDeleteProduct} onShowToast={showToast} 
        onShare={() => setSharingProduct(selectedProduct)}
        onStartChat={() => { setActiveChatSeller(selectedProduct.sellerEmail); setShowChat(true); setSelectedProduct(null); }}
      />}

      {sharingProduct && <ShareSheet product={sharingProduct} onClose={() => setSharingProduct(null)} onShowToast={showToast} />}

      {viewingSellerName && (
        <UserProfileModal 
          sellerName={viewingSellerName} allProducts={products} onClose={() => setViewingSellerName(null)}
          onProductClick={(p) => setSelectedProduct(p)} onStartChat={(email) => { setActiveChatSeller(email); setShowChat(true); setViewingSellerName(null); }} 
          currentUserName={user.name} onShowToast={showToast}
        />
      )}

      {isSummaryModalOpen && (
        <UserSummaryModal 
          user={user} userProducts={products.filter(p => p.sellerEmail === user.email)} 
          wishlistedProducts={products.filter(p => wishlist.includes(p.id))} 
          notifications={notifications} onClose={() => setIsSummaryModalOpen(false)} 
          onLogout={handleLogout} onProductClick={(p) => setSelectedProduct(p)} 
          onDeleteProduct={handleDeleteProduct} 
          onClearNotification={markNotificationAsRead} onRefresh={async () => {}}
          initialTab={summaryInitialTab} currentUserEmail={user.email} remainingAds={remainingAds}
        />
      )}
      
      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
      
      {toast && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-2xl border backdrop-blur-xl font-black text-[10px] uppercase tracking-widest ${
          toast.type === 'success' ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30' : 'bg-red-600/20 text-red-400 border-red-500/30'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default App;
