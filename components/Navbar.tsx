
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  user: { email: string; name: string } | null;
  onOpenLogin: () => void;
  onOpenSellModal: () => void;
  onViewMyProfile: () => void;
  unreadCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onOpenLogin, 
  onOpenSellModal,
  onViewMyProfile,
  unreadCount
}) => {
  const location = useLocation();

  return (
    <nav className="bg-[#030712] border-b border-white/5 pt-4 pb-2">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        
        {/* Row 1: Logo & User Actions */}
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center">
              <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tighter uppercase leading-none">Bazaar</span>
              <span className="text-[7px] font-black text-indigo-500 tracking-[0.4em] uppercase opacity-70 mt-1">Elite Market</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <button 
                onClick={onViewMyProfile} 
                className="w-10 h-10 bg-[#1f2937] rounded-xl flex items-center justify-center text-white font-bold text-xs"
              >
                {user.name.charAt(0).toUpperCase()}
              </button>
            ) : (
              <button onClick={onOpenLogin} className="w-10 h-10 bg-[#1f2937] rounded-xl flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            )}
            
            <button 
              onClick={onOpenSellModal} 
              className="px-6 py-2.5 bg-[#4f46e5] text-white rounded-xl font-bold text-[11px] uppercase tracking-wider"
            >
              Sell Item
            </button>
          </div>
        </div>

        {/* Row 2: Navigation Links */}
        <div className="flex justify-around items-center pt-2">
          <NavItem icon={<SearchIcon />} label="Search" active={location.pathname === '/search'} />
          <NavItem icon={<AlertIcon />} label="Alerts" count={unreadCount} />
          <NavItem icon={<HeartIcon />} label="Saved" />
          <NavItem icon={<SyncIcon />} label="Sync" />
          <Link to="/chat">
            <NavItem icon={<ChatIcon />} label="Chat" active={location.pathname === '/chat'} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

const NavItem = ({ icon, label, active, count }: { icon: React.ReactNode, label: string, active?: boolean, count?: number }) => (
  <div className={`flex flex-col items-center gap-1.5 cursor-pointer ${active ? 'text-white' : 'text-slate-500 hover:text-white transition-colors'}`}>
    <div className="relative">
      {icon}
      {count && count > 0 && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full"></span>
      )}
    </div>
    <span className="text-[10px] font-medium uppercase tracking-widest">{label}</span>
  </div>
);

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const SyncIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

export default Navbar;
