
import React from 'react';
import { Product, Currency } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (e: React.MouseEvent) => void;
  currency: Currency;
  onShowToast?: (message: string, type?: 'success' | 'error') => void;
  currentUserEmail?: string;
  onDelete?: (productId: string) => void;
  showDeleteButton?: boolean; 
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onClick, 
  isWishlisted = false, 
  onToggleWishlist,
  currency,
  onShowToast,
  currentUserEmail,
  onDelete,
  showDeleteButton = false, 
}) => {
  const convertedPrice = Math.round(product.price * currency.rate);
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
    if (digits.startsWith('0')) digits = '20' + digits.substring(1);
    const message = encodeURIComponent(`Hi, I'm interested in: ${product.title}`);
    window.open(`https://wa.me/${digits}?text=${message}`, '_blank');
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = "https://bazaar-gules-three.vercel.app";
    const shareData = {
      title: `Bazaar: ${product.title}`,
      text: `🔥 Check out this ${product.title} on Bazaar Marketplace!\n💰 Price: ${currency.symbol}${convertedPrice.toLocaleString()}`,
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') console.error("Share failed");
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        onShowToast?.("Ad link copied!", "success");
      } catch (err) {
        onShowToast?.("Copy failed.", "error");
      }
    }
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
        
        {/* Wishlist Button - Moved closer to edge, smaller */}
        <button
          onClick={onToggleWishlist}
          className={`absolute top-3 left-3 p-2 rounded-xl backdrop-blur-md transition-all z-10 border shadow-lg ${
            isWishlisted ? 'bg-red-500 text-white border-red-400' : 'bg-black/30 text-white/70 border-white/5 hover:bg-black/50'
          }`}
        >
          <svg className={`h-3.5 w-3.5 ${isWishlisted ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Delete Button - Moved closer to edge, smaller */}
        {showDeleteButton && isOwner && (
          <button
            onClick={handleDelete}
            className="absolute top-3 right-3 p-2 bg-red-600/90 hover:bg-red-500 text-white rounded-xl backdrop-blur-md transition-all z-10 border border-red-400/50 shadow-lg active:scale-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        {/* Category badge moved here from top of image */}
        <div className="mb-3">
          <span className="inline-block px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-[7px] font-black uppercase tracking-[0.2em]">
            {product.category}
          </span>
        </div>

        <div className="mb-4">
          <h3 className="text-[12px] font-black text-white uppercase tracking-tight line-clamp-1 mb-1">
            {product.title}
          </h3>
          <span className="text-xl font-black text-indigo-400">
            {currency.symbol}{convertedPrice.toLocaleString()}
          </span>
        </div>

        <div className="mt-auto flex flex-col gap-2.5">
          <button 
            onClick={handleShareClick}
            className="w-full py-3.5 bg-indigo-600/10 hover:bg-indigo-600/30 text-indigo-400 rounded-2xl text-[9px] font-black flex items-center justify-center gap-2 transition-all border border-indigo-500/30 uppercase tracking-[0.2em]"
          >
            SHARE AD
          </button>
          <button 
            onClick={handleWhatsAppClick}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-[9px] font-black flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 border border-white/10 uppercase tracking-[0.2em]"
          >
            WHATSAPP
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
