
import React, { useState, useEffect, useRef } from 'react';
import { Product, Currency, SellerNotification } from '../types';
import { getSellerStats } from '../services/geminiService';
import ProductCard from './ProductCard';
import AdBanner from './AdBanner';

interface UserSummaryModalProps {
  user: { name: string; email: string };
  userProducts: Product[];
  wishlistedProducts: Product[];
  notifications: SellerNotification[];
  onClose: () => void;
  onLogout: () => void;
  onProductClick: (product: Product) => void;
  currency: Currency;
  onDeleteProduct: (productId: string) => void;
  onClearNotification: (id: string) => void;
  onRefresh: () => Promise<void>;
  initialTab?: 'listings' | 'saved' | 'alerts';
  currentUserEmail?: string;
  remainingAds: number;
}

const UserSummaryModal: React.FC<UserSummaryModalProps> = ({ 
  user, 
  userProducts, 
  wishlistedProducts,
  onClose, 
  onLogout, 
  onProductClick,
  currency,
  onDeleteProduct,
  initialTab = 'listings',
  currentUserEmail
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'saved' | 'alerts'>(initialTab);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [stats, setStats] = useState<{ rating: number; reviewsCount: number } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTab(initialTab);
    const fetchData = async () => {
      const data = await getSellerStats(user.name);
      setStats(data);
    };
    fetchData();
  }, [initialTab, user.name]);

  const handleDeleteWithAnimation = (productId: string) => {
    setDeletingId(productId);
    onDeleteProduct(productId);
    setTimeout(() => setDeletingId(null), 500);
  };

  const renderProductGrid = (products: Product[], isOwnerMode: boolean) => (
    <div className="grid grid-cols-2 gap-4 sm:gap-8 pb-32">
      {products.map((p) => (
        <div 
          key={p.id} 
          className={`relative transition-all duration-500 ease-in-out ${deletingId === p.id ? 'opacity-0 scale-90 -translate-y-4' : 'opacity-100 scale-100'}`}
        >
          <ProductCard 
            product={p} 
            onClick={() => onProductClick(p)} 
            currency={currency}
            currentUserEmail={currentUserEmail}
            onDelete={handleDeleteWithAnimation}
            showDeleteButton={isOwnerMode} 
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-slate-950/95 backdrop-blur-2xl">
      <div 
        ref={scrollContainerRef}
        className="bg-slate-900/40 backdrop-blur-3xl w-full max-w-2xl sm:rounded-[50px] shadow-2xl border border-white/10 overflow-y-auto overflow-x-hidden h-full sm:max-h-[92vh] flex flex-col relative custom-scrollbar scroll-smooth"
      >
        {/* Compact Header */}
        <div className="relative p-6 sm:p-10 bg-gradient-to-br from-indigo-900/40 to-slate-950/40 border-b border-white/5 shrink-0">
          <div className="flex justify-between items-start mb-8">
             <button onClick={onLogout} className="p-3 bg-red-600/10 rounded-2xl text-red-500 border border-red-500/20 active:scale-90 transition-all">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
             </button>
             <button onClick={onClose} className="p-3 bg-white/5 rounded-full text-white border border-white/10 active:scale-90 transition-all">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-600 rounded-[30px] flex items-center justify-center text-white text-3xl sm:text-4xl font-black uppercase shadow-2xl border border-white/10">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 text-left">
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter mb-1">{user.name}</h2>
              <div className="flex gap-4 items-center">
                <div className="flex flex-col">
                  <span className="text-indigo-400 font-black text-sm">{stats?.rating || '0.0'}</span>
                  <span className="text-[7px] text-slate-500 uppercase tracking-widest font-black">Rating</span>
                </div>
                <div className="w-px h-6 bg-white/10"></div>
                <div className="flex flex-col">
                  <span className="text-white font-black text-sm">{userProducts.length}</span>
                  <span className="text-[7px] text-slate-500 uppercase tracking-widest font-black">Ads</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Tab Bar */}
        <div className="sticky top-0 z-[110] px-6 py-4 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 flex gap-3">
            <button 
              onClick={() => setActiveTab('listings')} 
              className={`flex-1 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                activeTab === 'listings' ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-900/40' : 'bg-slate-800/40 text-slate-500 border-white/5'
              }`}
            >
              MY ADS ({userProducts.length})
            </button>
            <button 
              onClick={() => setActiveTab('saved')} 
              className={`flex-1 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                activeTab === 'saved' ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-900/40' : 'bg-slate-800/40 text-slate-500 border-white/5'
              }`}
            >
              SAVED ({wishlistedProducts.length})
            </button>
        </div>

        <div className="p-4 sm:p-8 space-y-6">
            <AdBanner className="!h-[120px] !rounded-[35px]" />

            <div className="mt-4">
              {activeTab === 'listings' ? (
                  userProducts.length > 0 ? renderProductGrid(userProducts, true) : (
                      <div className="py-24 text-center opacity-30 text-[9px] font-black uppercase tracking-[0.4em]">No active listings</div>
                  )
              ) : (
                  wishlistedProducts.length > 0 ? renderProductGrid(wishlistedProducts, false) : (
                      <div className="py-24 text-center opacity-30 text-[9px] font-black uppercase tracking-[0.4em]">Collection is empty</div>
                  )
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserSummaryModal;
