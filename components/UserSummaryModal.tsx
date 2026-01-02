
import React, { useState } from 'react';
import { Product, Currency } from '../types';

interface UserSummaryModalProps {
  user: { name: string; email: string };
  userProducts: Product[];
  wishlistedProducts: Product[];
  onClose: () => void;
  onLogout: () => void;
  onProductClick: (product: Product) => void;
  currency: Currency;
}

const UserSummaryModal: React.FC<UserSummaryModalProps> = ({ 
  user, 
  userProducts, 
  wishlistedProducts,
  onClose, 
  onLogout, 
  onProductClick,
  currency 
}) => {
  const [activeTab, setActiveTab] = useState<'listings' | 'saved'>('listings');
  const firstName = user.name.split(' ')[0];
  const displayProducts = activeTab === 'listings' ? userProducts : wishlistedProducts;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg">
      <div className="bg-slate-900 w-full max-w-2xl rounded-[40px] shadow-2xl border border-white/5 overflow-hidden animate-in fade-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        {/* Profile Header */}
        <div className="relative h-32 bg-indigo-600 shrink-0 flex items-end justify-center">
          <div className="absolute top-6 right-6">
            <button onClick={onClose} className="p-2.5 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all backdrop-blur-md border border-white/10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="w-24 h-24 bg-slate-900 rounded-[28px] border-[6px] border-slate-900 shadow-2xl flex items-center justify-center text-indigo-500 overflow-hidden translate-y-12">
            <div className="w-full h-full bg-slate-800 flex items-center justify-center text-4xl font-black uppercase">
              {user.name.charAt(0)}
            </div>
          </div>
        </div>
        
        <div className="px-8 mt-14 text-center shrink-0">
          <h2 className="text-2xl font-black text-white leading-tight uppercase tracking-tight">{firstName}</h2>
          <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] mt-1 opacity-60">{user.email}</p>
        </div>

        {/* Tab Selection */}
        <div className="flex px-8 mt-8 gap-2 shrink-0">
          <button 
            onClick={() => setActiveTab('listings')}
            className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              activeTab === 'listings' 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/20' 
                : 'bg-slate-800/40 text-slate-500 border-slate-800 hover:bg-slate-800'
            }`}
          >
            My Ads ({userProducts.length})
          </button>
          <button 
            onClick={() => setActiveTab('saved')}
            className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              activeTab === 'saved' 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/20' 
                : 'bg-slate-800/40 text-slate-500 border-slate-800 hover:bg-slate-800'
            }`}
          >
            Saved Items ({wishlistedProducts.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 pt-6 custom-scrollbar">
          {displayProducts.length > 0 ? (
            <div className="space-y-3">
              {displayProducts.map((p) => (
                <button 
                  key={p.id}
                  onClick={() => onProductClick(p)}
                  className="w-full flex items-center gap-5 p-4 bg-slate-800/40 hover:bg-slate-800 border border-white/5 rounded-[24px] transition-all group"
                >
                  <img src={p.imageUrl} className="w-16 h-16 rounded-2xl object-cover border border-white/5 shadow-md" alt="" />
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-0.5">{p.category}</div>
                    <div className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors truncate uppercase">{p.title}</div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-white font-black text-xs">{currency.symbol}{Math.round(p.price * currency.rate).toLocaleString()}</span>
                      <span className="text-[9px] text-slate-600 font-bold uppercase">{p.location.split(',')[0]}</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl text-slate-600 group-hover:text-indigo-400 transition-colors border border-white/5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M9 5l7 7-7 7"/></svg>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-slate-950/20 rounded-[32px] border border-dashed border-slate-800/50">
              <div className="w-16 h-16 bg-slate-900/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path d="M12 4v16m8-8H4"/></svg>
              </div>
              <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">
                {activeTab === 'listings' ? 'No items posted yet' : 'Your wishlist is empty'}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-8 pt-0 mt-4 shrink-0 grid grid-cols-2 gap-4">
          <button 
            onClick={() => {
              const data = JSON.stringify({ user, products: userProducts, saved: wishlistedProducts }, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `bazaar_account_${user.email.split('@')[0]}.json`;
              a.click();
            }}
            className="py-4 bg-slate-800/50 text-slate-400 rounded-[20px] font-black text-[10px] hover:bg-slate-800 transition-all border border-white/5 uppercase tracking-widest"
          >
            Download Data
          </button>
          <button 
            onClick={onLogout}
            className="py-4 bg-red-500/10 text-red-500 rounded-[20px] font-black text-[10px] hover:bg-red-500/20 transition-all border border-red-500/10 uppercase tracking-widest"
          >
            Logout Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSummaryModal;
