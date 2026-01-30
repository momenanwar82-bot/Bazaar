import React from 'react';
import { Product } from '../types';
import { MessageSquare, Share2, Heart, Trash2, Star } from 'lucide-react';

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
  onStartChat: () => void; // إضافة خاصية بدء الدردشة
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onClick, 
  isWishlisted = false, 
  onToggleWishlist,
  currentUserEmail,
  onDelete,
  showDeleteButton = false, 
  onShare,
  onStartChat
}) => {
  const isOwner = currentUserEmail && product.sellerEmail && currentUserEmail === product.sellerEmail;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm("Are you sure you want to remove this ad?")) {
      onDelete(product.id);
    }
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStartChat();
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(product);
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-gradient-to-br from-[#0a0a0c] to-[#121218] rounded-[32px] overflow-hidden border border-white/5 shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full active:scale-[0.98] relative text-left"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-900 flex items-center justify-center">
        <img 
          src={product.imageUrl} 
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-90 group-hover:brightness-100"
          loading="lazy"
        />
        
        {/* Top Actions */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          {product.rating !== undefined && product.rating > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
              <Star size={10} className="text-amber-400 fill-current" />
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-black text-white leading-none">{product.rating}</span>
                <span className="text-[8px] font-bold text-white/40 leading-none">({product.reviewsCount || 0})</span>
              </div>
            </div>
          )}

          <button
            onClick={onToggleWishlist}
            className={`p-2.5 rounded-xl backdrop-blur-md transition-all border shadow-lg ${
              isWishlisted ? 'bg-rose-500 text-white border-rose-400' : 'bg-black/40 text-white/70 border-white/10 hover:bg-black/60'
            }`}
          >
            <Heart size={14} className={isWishlisted ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Delete for Owner */}
        {showDeleteButton && isOwner && (
          <button
            onClick={handleDelete}
            className="absolute bottom-3 right-3 p-2.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl backdrop-blur-md transition-all z-10 border border-rose-400/30 shadow-lg"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="mb-2">
          <span className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest">
            {product.category}
          </span>
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-tight line-clamp-1 mb-1 opacity-90">
            {product.title}
          </h3>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white leading-none">
              {product.price.toLocaleString()}
            </span>
            <span className="text-[10px] uppercase font-black text-indigo-500 tracking-widest">
              {product.currency}
            </span>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <button 
            onClick={handleShareClick}
            className="w-full py-3.5 bg-white/5 hover:bg-white/10 text-white/70 rounded-2xl text-[9px] font-black border border-white/5 uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
          >
            <Share2 size={12} />
            SHARE
          </button>
          
          {!isOwner && (
            <button 
              onClick={handleChatClick}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              <MessageSquare size={12} />
              LIVE CHAT
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
