
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (e: React.MouseEvent) => void;
  onShowToast?: (message: string, type?: 'success' | 'error') => void;
  currentUserEmail?: string;
  onDelete?: (productId: string) => void;
  showDeleteButton?: boolean; 
  onShare: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onClick, 
  isWishlisted = false, 
  onToggleWishlist,
  currentUserEmail,
  onDelete,
  showDeleteButton = false, 
  onShare
}) => {
  const isOwner = currentUserEmail && product.sellerEmail && currentUserEmail === product.sellerEmail;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm("Are you sure you want to remove this ad?")) {
      onDelete(product.id);
    }
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    let digits = product.phoneNumber.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi, I'm interested in: ${product.title}`);
    window.open(`https://wa.me/${digits}?text=${message}`, '_blank');
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(product);
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-gradient-to-br from-indigo-950 via-indigo-900/40 to-slate-950 rounded-[35px] overflow-hidden border border-indigo-500/10 shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full active:scale-[0.98] relative text-left"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-indigo-950/50 flex items-center justify-center">
        <img 
          src={product.imageUrl} 
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-[1.05]"
          loading="lazy"
        />
        
        {/* Top Right Action Cluster: Rating & Favorite Button */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          {/* Integrated Rating Badge with Total Count */}
          {product.rating !== undefined && product.rating > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
              <svg className="w-3 h-3 text-amber-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black text-white leading-none">{product.rating}</span>
                <span className="text-[8px] font-bold text-white/50 leading-none">({product.reviewsCount || 0})</span>
              </div>
            </div>
          )}

          {/* Favorite Button (Now at the same height on the right) */}
          <button
            onClick={onToggleWishlist}
            className={`p-2.5 rounded-xl backdrop-blur-md transition-all border shadow-lg ${
              isWishlisted ? 'bg-red-500 text-white border-red-400' : 'bg-black/30 text-white/70 border-white/5 hover:bg-black/50'
            }`}
          >
            <svg className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Delete Button (If Owner - Bottom Right of Image) */}
        {showDeleteButton && isOwner && (
          <button
            onClick={handleDelete}
            className="absolute bottom-3 right-3 p-2.5 bg-red-600/90 hover:bg-red-500 text-white rounded-xl backdrop-blur-md transition-all z-10 border border-red-400/50 shadow-lg active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          <span className="inline-block px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-[7px] font-black uppercase tracking-[0.2em]">
            {product.category}
          </span>
        </div>

        <div className="mb-4">
          <h3 className="text-[11px] font-black text-white uppercase tracking-tight line-clamp-1 mb-1">
            {product.title}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-indigo-400 leading-none">
              {product.price.toLocaleString()}
            </span>
            <span className="text-[9px] uppercase font-black text-indigo-400/60 tracking-wider">
              {product.currency}
            </span>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <button 
            onClick={handleShareClick}
            className="w-full py-3 bg-[#14152b] hover:bg-[#1a1c3d] text-indigo-300/60 rounded-2xl text-[8px] font-black border border-white/5 uppercase tracking-[0.2em] transition-all active:scale-95"
          >
            SHARE AD
          </button>
          <button 
            onClick={handleWhatsAppClick}
            className="w-full py-3 bg-[#0f9d58] hover:bg-[#0da85d] text-white rounded-2xl text-[8px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95"
          >
            WHATSAPP
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
