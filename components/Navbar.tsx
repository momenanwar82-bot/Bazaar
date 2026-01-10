
import React, { useState } from 'react';
import { SellerNotification } from '../types';
import NotificationDropdown from './NotificationDropdown';
import MobileSyncModal from './MobileSyncModal';

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
  remainingAds: number;
  searchSuggestions?: string[];
}

const Navbar: React.FC<NavbarProps> = ({ 
  onSearch, 
  onOpenSellModal, 
  user, 
  onOpenLogin, 
  wishlistCount,
  showFavoritesOnly,
  onToggleFavorites,
  onOpenNotifications,
  unreadCount,
  notifications,
  onMarkAsRead,
  onClearAll,
  onViewMyProfile
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showSyncModal, setShowSyncModal] = useState(false);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    onSearch(val);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-black/60 backdrop-blur-[10px] border-b border-white/10 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
          
          {/* Row 1: Logo & Primary Actions */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
              <div className="w-10 h-10 bg-white rounded-[18px] flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tighter uppercase leading-none">Bazaar</span>
                <span className="text-[7px] font-black text-indigo-500 tracking-[0.4em] uppercase opacity-80 mt-1">PRO MARKET</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <button 
                  onClick={onViewMyProfile} 
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white font-black text-xs border border-white/10 transition-all active:scale-90"
                >
                  {user.name.charAt(0)}
                </button>
              ) : (
                <button onClick={onOpenLogin} className="px-4 py-2 bg-white text-black font-black text-[9px] uppercase tracking-widest rounded-xl">Login</button>
              )}
              
              <button 
                onClick={onOpenSellModal} 
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 border border-indigo-400/20"
              >
                SELL
              </button>
            </div>
          </div>

          {/* Row 2: Combined Search & Controls (Glassy Professional Layout) */}
          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-indigo-400 group-focus-within:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="SEARCH..."
                className="w-full bg-white/5 border border-white/10 rounded-[22px] py-3.5 pl-11 pr-4 text-white font-black text-[9px] tracking-widest uppercase outline-none focus:bg-white/10 focus:ring-2 focus:ring-indigo-600/30 transition-all placeholder:text-slate-500"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
              />
            </div>

            {/* Controls Cluster - Glass Capsule */}
            <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-[22px] shadow-lg shrink-0 backdrop-blur-sm">
              <div className="relative">
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="p-2.5 hover:bg-white/10 rounded-[18px] text-slate-400 hover:text-white transition-all active:scale-90"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-black shadow-[0_0_8px_rgba(99,102,241,1)]"></span>
                  )}
                </button>
                {showNotifMenu && (
                  <NotificationDropdown 
                    notifications={notifications}
                    onMarkAsRead={onMarkAsRead}
                    onClearAll={onClearAll}
                    onViewAll={onOpenNotifications}
                    onClose={() => setShowNotifMenu(false)}
                  />
                )}
              </div>

              <button
                onClick={onToggleFavorites}
                className={`p-2.5 rounded-[18px] transition-all active:scale-90 flex items-center gap-1.5 ${
                  showFavoritesOnly ? 'bg-rose-600/20 text-rose-500' : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <svg className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && <span className="text-[9px] font-black">{wishlistCount}</span>}
              </button>

              <button 
                onClick={() => setShowSyncModal(true)}
                className="p-2.5 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 rounded-[18px] transition-all active:scale-90"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 00-2 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {showSyncModal && <MobileSyncModal onClose={() => setShowSyncModal(false)} />}
    </>
  );
};

export default Navbar;
