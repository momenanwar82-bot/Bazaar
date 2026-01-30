import React from 'react';
import { Search, Bell, Heart, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-[#050505] border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2">
        <div className="bg-white p-1.5 rounded-lg">
          <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
            <span className="text-white font-black text-sm">B</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-white font-black tracking-tighter leading-none text-xl uppercase">BAZAAR</span>
          <span className="text-[8px] text-indigo-500 font-bold tracking-[0.3em] leading-none">PRO MARKET</span>
        </div>
      </Link>

      <div className="hidden md:flex flex-1 max-w-md mx-10 relative group">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-indigo-400 transition-colors" />
        <input 
          type="text" 
          placeholder="SEARCH..." 
          className="w-full bg-[#0f0f1e] border border-gray-800 rounded-full py-2.5 pl-12 pr-6 text-xs text-white focus:outline-none focus:border-indigo-500/50 transition-all tracking-widest uppercase"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-gray-900/80 p-2.5 rounded-xl border border-gray-800 hover:border-indigo-500/30 transition-all group cursor-pointer">
          <Bell size={20} className="text-gray-400 group-hover:text-white" />
        </div>
        
        <Link to="/favorites" className="bg-gray-900/80 p-2.5 rounded-xl border border-gray-800 hover:border-red-500/30 transition-all group">
          <Heart size={20} className="text-gray-400 group-hover:text-red-500" />
        </Link>

        <Link to="/chat" className="relative bg-indigo-600/10 p-2.5 rounded-xl border border-indigo-500/20 hover:bg-indigo-600/20 transition-all group">
          <MessageSquare size={20} className="text-indigo-400 group-hover:text-indigo-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
        </Link>

        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-black text-xs tracking-widest uppercase transition-all shadow-lg shadow-indigo-500/20">
          SELL
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
