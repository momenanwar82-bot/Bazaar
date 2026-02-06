
import React, { useState, useEffect } from 'react';
import { Product, SellerNotification } from '../types';
import { getSellerStats } from '../services/geminiService';
import ProductCard from './ProductCard';

interface UserSummaryModalProps {
  user: { name: string; email: string };
  userProducts: Product[];
  wishlistedProducts: Product[];
  notifications: SellerNotification[];
  onClose: () => void;
  onLogout: () => void;
  onProductClick: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onClearNotification: (id: string) => void;
  onRefresh: () => Promise<void>;
  initialTab?: 'listings' | 'saved' | 'alerts' | 'chats';
  currentUserEmail?: string;
  remainingAds: number;
  isFullPage?: boolean;
}

const UserSummaryModal: React.FC<UserSummaryModalProps> = ({ 
  user, 
  userProducts, 
  wishlistedProducts,
  notifications,
  onClose, 
  onLogout, 
  onProductClick,
  onDeleteProduct,
  onClearNotification,
  initialTab = 'listings',
  currentUserEmail,
  isFullPage = false
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'saved' | 'alerts' | 'chats'>(initialTab);
  const [stats, setStats] = useState<{ rating: number; reviewsCount: number } | null>(null);

  // Sync activeTab if initialTab changes (e.g., navigating between alerts and chats from navbar)
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getSellerStats(user.name);
      setStats(data);
    };
    fetchData();
  }, [user.name]);

  const renderProductGrid = (products: Product[], isOwnerMode: boolean) => (
    <div className="grid grid-cols-2 gap-4 sm:gap-8 pb-32 animate-in fade-in duration-500">
      {products.map((p) => (
        <ProductCard 
          key={p.id} 
          product={p} 
          onClick={() => onProductClick(p)} 
          currentUserEmail={currentUserEmail}
          onDelete={onDeleteProduct}
          showDeleteButton={isOwnerMode} 
        />
      ))}
    </div>
  );

  const containerClasses = isFullPage 
    ? "w-full max-w-2xl bg-slate-900 rounded-[40px] border border-white/10 shadow-2xl flex flex-col h-full overflow-hidden"
    : "bg-slate-900/40 backdrop-blur-3xl w-full max-w-2xl sm:rounded-[50px] shadow-2xl border border-white/10 overflow-y-auto overflow-x-hidden h-full sm:max-h-[92vh] flex flex-col relative custom-scrollbar text-left";

  return (
    <div className={isFullPage ? "h-full w-full" : "fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-slate-950/95 backdrop-blur-2xl"}>
      <div className={containerClasses}>
        
        {/* Profile Header */}
        <div className="relative p-6 sm:p-10 bg-gradient-to-br from-indigo-900/40 to-slate-950/40 border-b border-white/5 shrink-0">
          <div className="flex justify-between items-center mb-8">
             <button 
               onClick={onLogout} 
               className="flex items-center gap-2.5 px-5 py-2.5 bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-2xl border border-rose-500/20 transition-all active:scale-95"
             >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Logout</span>
             </button>
             <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white border border-white/10 active:scale-90 transition-all">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-[30px] flex items-center justify-center text-white text-3xl font-black border border-white/10 shadow-xl">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 text-left">
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">{user.name}</h2>
              <div className="flex gap-4 items-center">
                <span className="text-amber-400 font-black text-sm">★ {stats?.rating || '0.0'}</span>
                <div className="w-px h-6 bg-white/10"></div>
                <span className="text-white font-black text-sm">{userProducts.length} <span className="text-slate-500 text-[8px] uppercase tracking-widest ml-1">Ads</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation */}
        <div className="sticky top-0 z-[110] px-6 py-4 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 grid grid-cols-4 gap-2">
            {[
              { id: 'listings', label: 'MY ADS' },
              { id: 'saved', label: 'SAVED' },
              { id: 'alerts', label: 'ALERTS' },
              { id: 'chats', label: 'CHATS' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${
                  activeTab === tab.id 
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg' 
                  : 'bg-slate-800/40 text-slate-500 border-white/5 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
        </div>

        <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === 'listings' && (
              userProducts.length > 0 ? renderProductGrid(userProducts, true) : (
                <div className="py-24 text-center opacity-30 text-[9px] font-black uppercase tracking-[0.4em]">No active listings</div>
              )
            )}
            
            {activeTab === 'saved' && (
              wishlistedProducts.length > 0 ? renderProductGrid(wishlistedProducts, false) : (
                <div className="py-24 text-center opacity-30 text-[9px] font-black uppercase tracking-[0.4em]">No saved items</div>
              )
            )}

            {activeTab === 'alerts' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {notifications.length > 0 ? notifications.map(n => (
                  <div key={n.id} className="p-5 bg-white/5 border border-white/5 rounded-3xl flex gap-4 items-start">
                    <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm text-slate-200 font-medium mb-1 leading-relaxed">{n.message}</p>
                      <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest">{new Date(n.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                )) : (
                  <div className="py-24 text-center opacity-30 text-[9px] font-black uppercase tracking-[0.4em]">No notifications</div>
                )}
              </div>
            )}

            {activeTab === 'chats' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="p-10 bg-indigo-600/5 border border-indigo-500/10 rounded-[40px] text-center space-y-4">
                  <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto text-indigo-400">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <h4 className="text-sm font-black text-white uppercase tracking-tight">Messaging Hub</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Your live conversations with merchants will appear here for secure deal-making.</p>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserSummaryModal;
