
import React, { useState, useEffect } from 'react';
import { Product, Currency } from '../types';
import { getSellerStats } from '../services/geminiService';
import ProductCard from './ProductCard';

interface UserProfileModalProps {
  sellerName: string;
  allProducts: Product[];
  onClose: () => void;
  onProductClick: (product: Product) => void;
  onStartChat: (product: Product) => void;
  currency: Currency; 
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ 
  sellerName, 
  allProducts, 
  onClose,
  onProductClick,
  onStartChat,
  currency 
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

  const isVerified = (stats?.rating || 0) >= 4.5 && (stats?.reviewsCount || 0) >= 50;

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
              star <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-slate-700'
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-slate-400 text-xs sm:text-sm font-bold ml-1 sm:ml-2">({rating.toFixed(1)})</span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 max-h-[90vh]">
        <div className="p-6 sm:p-8 border-b border-slate-800 bg-slate-900/50 relative">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-lg shadow-indigo-900/40 border border-indigo-400/30">
                  {sellerName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-3xl font-black text-white leading-none">{sellerName}</h2>
                    {isVerified && !loading && (
                      <div className="group relative cursor-help">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 fill-current" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="mt-1">
                    {loading ? (
                      <div className="h-4 w-24 bg-slate-800 animate-pulse rounded"></div>
                    ) : (
                      renderStars(stats?.rating || 0)
                    )}
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
                <div className="text-lg sm:text-xl font-bold text-slate-300">
                  {loading ? '...' : stats?.joinedDate}
                </div>
              </div>
              <div className="text-center md:text-left col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-8">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Reviews</div>
                <div className="text-xl sm:text-2xl font-black text-indigo-400">
                  {loading ? '...' : stats?.reviewsCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar bg-slate-950/20 text-left">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-black text-white border-l-4 border-indigo-600 pl-4 uppercase tracking-tight">Seller Inventory</h3>
            <span className="text-slate-500 text-[9px] font-black uppercase tracking-widest">{sellerProducts.length} Items</span>
          </div>

          {sellerProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-8">
              {sellerProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onClick={() => onProductClick(product)}
                  currency={currency} 
                />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">No active listings found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
