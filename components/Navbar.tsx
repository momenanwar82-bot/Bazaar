
import React from 'react';
import { Currency } from '../types';
import { CURRENCIES } from '../constants';

interface NavbarProps {
  onSearch: (query: string) => void;
  onOpenSellModal: () => void;
  user: { email: string; name: string } | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  wishlistCount: number;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  onOpenChat: () => void;
  unreadChats: number;
  onViewMyProfile: () => void;
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  onSearch, 
  onOpenSellModal, 
  user, 
  onOpenLogin, 
  onLogout,
  wishlistCount,
  showFavoritesOnly,
  onToggleFavorites,
  onOpenChat,
  unreadChats,
  onViewMyProfile,
  selectedCurrency,
  onCurrencyChange
}) => {
  return (
    <nav className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl shadow-2xl border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo & Brand - Reduced Size */}
          <div className="flex-shrink-0 flex items-center gap-2 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center shadow-xl border border-white/10 group-hover:scale-105 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black text-white tracking-tighter uppercase leading-none">Bazaar</span>
              <span className="text-[8px] font-black text-indigo-400 tracking-[0.2em] uppercase opacity-80">بازار</span>
            </div>
          </div>

          {/* Search Bar (Hidden on mobile) */}
          <div className="flex-1 max-w-sm lg:max-w-md mx-4 hidden md:block">
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white placeholder-slate-600 text-xs transition-all"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Favorites Button - Re-added */}
            <button
              onClick={onToggleFavorites}
              className={`relative p-2.5 rounded-xl border transition-all shadow-lg ${
                showFavoritesOnly 
                  ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                  : 'bg-slate-900/50 border-white/5 text-slate-400 hover:text-white'
              }`}
              title="View Wishlist"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${showFavoritesOnly ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-slate-950 font-black text-white">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Messages */}
            <button
              onClick={onOpenChat}
              className="relative p-2.5 bg-slate-900/50 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              {unreadChats > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-500 text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-slate-950 font-black text-white">
                  {unreadChats}
                </span>
              )}
            </button>

            {user ? (
              <button 
                onClick={onViewMyProfile}
                className="flex items-center gap-2 p-1 bg-slate-900/50 border border-white/5 rounded-xl hover:border-indigo-500/50 transition-all group"
              >
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                  <span className="font-black text-[11px] uppercase">{user.name.charAt(0)}</span>
                </div>
              </button>
            ) : (
              <button 
                onClick={onOpenLogin} 
                className="px-4 py-2 text-indigo-400 font-black hover:bg-indigo-500/10 rounded-xl transition-all text-[10px] uppercase tracking-widest border border-indigo-500/20"
              >
                Login
              </button>
            )}
            
            <button
              onClick={onOpenSellModal}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 border border-white/10"
            >
              Sell
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
