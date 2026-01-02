
import React, { useState } from 'react';
import { Product, Currency } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (e: React.MouseEvent) => void;
  onRate?: (productId: string, rating: number) => void;
  currency: Currency;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onClick, 
  isWishlisted = false, 
  onToggleWishlist,
  onRate,
  currency
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const convertedPrice = Math.round(product.price * currency.rate);

  const handleStarClick = (e: React.MouseEvent, rating: number) => {
    e.stopPropagation(); // Prevent opening the product modal
    if (onRate) {
      onRate(product.id, rating);
    }
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-slate-900 rounded-[32px] overflow-hidden border border-slate-800/50 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 cursor-pointer flex flex-col h-full active:scale-[0.98] relative"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
        />
        
        {/* Category Badge */}
        <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-xl px-3 py-1.5 rounded-xl text-[10px] font-black text-white border border-white/5 z-10 uppercase tracking-widest">
          {product.category}
        </div>

        {/* Aggregate Rating Badge (Bottom Right) - Now back to Star */}
        {product.rating && product.rating > 0 && (
          <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-xl px-2.5 py-1.5 rounded-xl text-xs font-black text-amber-400 border border-white/5 z-10 flex items-center gap-1.5 shadow-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
               <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {product.rating}
          </div>
        )}

        {/* Interactive Star Rating Bar - Back to Stars */}
        <div 
          className="absolute bottom-4 left-4 right-16 flex items-center justify-center gap-3 bg-white/5 backdrop-blur-2xl px-4 py-2.5 rounded-2xl border border-white/10 z-20 shadow-2xl transition-all group-hover:bg-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={(e) => handleStarClick(e, star)}
                className="transition-all hover:scale-125 focus:outline-none"
              >
                <svg 
                  className={`w-4.5 h-4.5 transition-colors ${star <= (hoverRating || (product.rating || 0)) ? 'text-amber-400 fill-current' : 'text-white/20'}`} 
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>

        {/* Wishlist Button (The Heart drawing / Like button) - Stays as Heart */}
        <button
          onClick={onToggleWishlist}
          className={`absolute top-4 left-4 p-2.5 rounded-2xl backdrop-blur-xl transition-all z-10 border shadow-lg ${
            isWishlisted ? 'bg-red-600 text-white border-red-400 scale-110' : 'bg-slate-950/40 text-white/70 border-white/5 hover:text-white hover:bg-slate-950'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4.5 w-4.5 ${isWishlisted ? 'fill-current' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="p-6 flex flex-col flex-grow bg-slate-900">
        <h3 className="text-lg font-black text-white mb-2 line-clamp-1 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
          {product.title}
        </h3>
        <p className="text-slate-500 text-[11px] line-clamp-2 mb-4 flex-grow leading-relaxed font-medium">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-800/50">
          <div className="flex flex-col">
            <span className="text-xl font-black text-indigo-400 tracking-tighter">
              {currency.symbol}{convertedPrice.toLocaleString()}
            </span>
            <div className="text-[9px] text-slate-600 mt-1 font-black uppercase tracking-widest flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>
              {product.location.split(',')[0]}
            </div>
          </div>
          
          <div className="bg-slate-800/50 p-3 rounded-[18px] border border-slate-700/50 group-hover:bg-indigo-600 transition-all group-hover:border-indigo-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
