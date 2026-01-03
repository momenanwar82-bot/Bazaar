
import React, { useState } from 'react';
import { Currency, SellerNotification } from '../types';
import NotificationDropdown from './NotificationDropdown';

interface NavbarProps {
  onSearch: (query: string) => void;
  onOpenSellModal: () => void;
  user: { email: string; name: string } | null;
  onOpenLogin: () => void;
  onOpenSignUp: () => void;
  onLogout: () => void;
  wishlistCount: number;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  onOpenNotifications: () => void;
  unreadCount: number;
  notifications: SellerNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onViewMyProfile: () => void;
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  remainingAds: number;
  searchSuggestions?: string[];
}

const Navbar: React.FC<NavbarProps> = ({ 
  onSearch, 
  onOpenSellModal, 
  user, 
  onOpenLogin, 
  onOpenSignUp,
  wishlistCount,
  showFavoritesOnly,
  onToggleFavorites,
  onOpenNotifications,
  unreadCount,
  notifications,
  onMarkAsRead,
  onClearAll,
  onViewMyProfile,
  searchSuggestions = []
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (val: string) => {
    setInputValue(val);
    onSearch(val);
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setInputValue(suggestion);
    onSearch(suggestion);
  };

  return (
    <nav className="sticky top-0 z-40 bg-black border-b border-white/5 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center h-20 gap-2">
          <div className="flex-shrink-0 flex items-center gap-2 group cursor-pointer" onClick={() => window.location.reload()}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-xl flex items-center justify-center shadow-2xl border border-white/10 transition-transform duration-500 group-hover:rotate-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] sm:text-sm font-black text-white tracking-widest uppercase leading-none">Bazaar</span>
              <span className="text-[6px] sm:text-[7px] font-black text-indigo-400 tracking-[0.4em] uppercase opacity-80 mt-0.5">Global Pro</span>
            </div>
          </div>

          {isSearchVisible && (
            <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-start pt-4 px-4 sm:px-8 animate-in slide-in-from-top duration-300">
              <div className="relative w-full">
                <input
                  autoFocus
                  type="text"
                  placeholder="WHAT ARE YOU LOOKING FOR?..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white font-black text-[10px] tracking-widest uppercase outline-none focus:ring-2 focus:ring-indigo-500/30"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button 
                  onClick={() => { setIsSearchVisible(false); onSearch(''); setInputValue(''); }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-full text-slate-500 transition-all"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              {searchSuggestions.length > 0 && (
                <div className="w-full mt-2 bg-slate-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                  {searchSuggestions.map((suggestion, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full px-6 py-4 text-left text-[10px] font-black text-slate-300 uppercase tracking-widest hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setIsSearchVisible(true)}
              className="p-2.5 bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all active:scale-90 shadow-lg"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            <div className="flex flex-col gap-1.5 py-1">
               <div className="relative flex items-center justify-center">
                  <button
                    onClick={() => setShowNotifMenu(!showNotifMenu)}
                    className="p-2 bg-slate-900 border border-white/5 rounded-xl text-slate-400 hover:text-white transition-all active:scale-90 shadow-lg"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-black animate-pulse shadow-sm shadow-red-500/50"></span>}
                  </button>
                  {showNotifMenu && (
                    <NotificationDropdown 
                      notifications={notifications}
                      onMarkAsRead={(id) => onMarkAsRead(id)}
                      onClearAll={() => { onClearAll(); setShowNotifMenu(false); }}
                      onViewAll={() => { onOpenNotifications(); setShowNotifMenu(false); }}
                      onClose={() => setShowNotifMenu(false)}
                    />
                  )}
               </div>

               <button
                  onClick={onToggleFavorites}
                  className={`p-2 bg-slate-900 border border-white/5 rounded-xl transition-all active:scale-90 shadow-lg flex items-center justify-center ${
                    showFavoritesOnly ? 'text-red-500 border-red-500/20 bg-red-500/5' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <svg className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
            </div>

            {user ? (
              <button 
                onClick={onViewMyProfile} 
                className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-black font-black text-xs uppercase border border-white/20 active:scale-90 transition-all shadow-xl"
              >
                {user.name.charAt(0)}
              </button>
            ) : (
              <button onClick={onOpenLogin} className="px-4 py-3 bg-white text-black font-black text-[9px] uppercase tracking-widest rounded-xl hover:scale-105 transition-all">Login</button>
            )}
            
            <button 
              onClick={onOpenSellModal} 
              className="px-6 sm:px-10 py-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] transition-all shadow-[0_10px_30px_rgba(79,70,229,0.4)] active:scale-95 border border-white/10 flex items-center justify-center min-w-[100px]"
            >
              SELL
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
