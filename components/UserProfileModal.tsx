
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { getSellerStats } from '../services/geminiService';
import ProductCard from './ProductCard';

interface UserProfileModalProps {
  sellerName: string;
  allProducts: Product[];
  onClose: () => void;
  onProductClick: (product: Product) => void;
  onStartChat: (product: Product) => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  sellerName, 
  allProducts, 
  onClose,
  onProductClick
}) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    rating: number, 
    reviewsCount: number, 
    activeAds: number, 
    joinedDate: string 
  } | null>(null);

  const sellerProducts = allProducts.filter(p => p.sellerName === sellerName);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const data = await getSellerStats(sellerName);
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, [sellerName]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 max-h-[90vh]">
        <div className="p-6 sm:p-8 border-b border-slate-800 bg-slate-900/50 relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-lg shadow-indigo-900/40 border border-indigo-400/30">
                  {sellerName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl sm:text-3xl font-black text-white leading-none">{sellerName}</h2>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-amber-400 text-sm font-black">★ {stats?.rating || '0.0'}</span>
                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Verified Seller</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
              <div className="text-center md:text-left">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Active Ads</div>
                <div className="text-xl sm:text-2xl font-black text-white">{sellerProducts.length}</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Joined Date</div>
                <div className="text-lg sm:text-xl font-bold text-slate-300">{loading ? '...' : stats?.joinedDate}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar bg-slate-950/20 text-left">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-black text-white border-l-4 border-indigo-600 pl-4 uppercase tracking-tight">Seller Inventory</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-8">
            {sellerProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onClick={() => onProductClick(product)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
