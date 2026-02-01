import React, { useState } from 'react';
import NotificationDropdown from './NotificationDropdown';
import MobileSyncModal from './MobileSyncModal';
import { MessageSquare, Search, Bell, Heart, Smartphone, User, ShoppingBag } from 'lucide-react';
import { SellerNotification } from '../types';

interface NavbarProps {
  onSearch: (query: string) => void;
  onOpenSellModal: () => void;
  user: { email: string; name: string } | null;
  onOpenLogin: () => void;
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
  onOpenChat: () => void; // السطر المهم للشات
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
  onViewMyProfile,
  onOpenChat
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
      <nav className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
          
          {/* Row 1: Logo & Primary Actions */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.reload()}>
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:rotate-[360deg]">
                <ShoppingBag size={22} className="text-black" />
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
                  className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center text-white font-black text-xs border border-white/10 transition-all active:scale-90"
                >
                  <User size={18} />
                </button>
              ) : (
                <button onClick={onOpenLogin} className="px-5 py-2.5 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-indigo-500 hover:text-white transition-colors">Login</button>
              )}
              
              <button 
                onClick={onOpenSellModal} 
                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-500/20 active:scale-95 border border-indigo-400/20"
              >
                SELL
              </button>
            </div>
          </div>

          {/* Row 2: Search & Controls */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={18} className="text-indigo-400 group-focus-within:text-white transition-colors" />
              </div>
              <input
                type="text"
                placeholder="SEARCH FOR ANYTHING..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white font-bold text-[10px] tracking-widest uppercase outline-none focus:bg-white/10 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
              {/* زر الشات */}
              <button 
                onClick={onOpenChat}
                className="relative p-3 hover:bg-white/10 rounded-xl text-indigo-400 hover:text-white transition-all active:scale-90"
              >
                <MessageSquare size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,1)]"></span>
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="p-3 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full border border-black shadow-[0_0_8px_rgba(244,63,94,1)]"></span>
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

              {/* Wishlist */}
              <button
                onClick={onToggleFavorites}
                className={`p-3 rounded-xl transition-all flex items-center gap-1.5 ${
                  showFavoritesOnly ? 'bg-rose-500/20 text-rose-500' : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Heart size={18} className={showFavoritesOnly ? 'fill-current' : ''} />
                {wishlistCount > 0 && <span className="text-[10px] font-black">{wishlistCount}</span>}
              </button>

              {/* Mobile Sync */}
              <button 
                onClick={() => setShowSyncModal(true)}
                className="p-3 hover:bg-indigo-600/20 text-indigo-400 hover:text-indigo-300 rounded-xl transition-all"
              >
                <Smartphone size={18} />
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
