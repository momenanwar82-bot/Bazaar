
import React from 'react';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (e: React.MouseEvent) => void;
  currentUserEmail?: string;
  onDelete?: (productId: string) => void;
  showDeleteButton?: boolean; 
  onShare: (product: Product) => void;
  onChat?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onClick, 
  isWishlisted = false, 
  onToggleWishlist,
  onShare,
}) => {
  const navigate = useNavigate();

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/chat');
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(product);
  };

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    let digits = product.phoneNumber.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi, I'm interested in: ${product.title}`);
    window.open(`https://wa.me/${digits}?text=${message}`, '_blank');
  };

  return (
    <div 
      onClick={onClick}
      className="bg-[#0b1121] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl flex flex-col h-full active:scale-[0.98] transition-transform duration-300"
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.title}
          className="w-full h-full object-cover"
        />
        
        {/* Wishlist Button */}
        <button
          onClick={onToggleWishlist}
          className="absolute top-4 left-4 p-2.5 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 text-white"
        >
          <svg className={`h-4 w-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-2">
          <span className="inline-block px-3 py-1 bg-[#1f2937] text-indigo-400 rounded-lg text-[9px] font-black uppercase tracking-widest">
            {product.category}
          </span>
        </div>

        <div className="mb-4">
          <h3 className="text-sm font-black text-white uppercase tracking-tight line-clamp-1 mb-1">
            {product.title}
          </h3>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-white">
              {product.price.toLocaleString()}
            </span>
            <span className="text-xl font-black text-white">
              {product.currency || '$'}
            </span>
          </div>
        </div>

        <div className="mt-auto space-y-3">
          <button 
            onClick={onClick}
            className="w-full py-4 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Contact Now
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={handleWhatsAppClick}
              className="flex-1 py-3 bg-[#065f46]/20 text-[#10b981] rounded-2xl text-[8px] font-black uppercase tracking-widest border border-[#10b981]/20 transition-all active:scale-95"
            >
              WhatsApp
            </button>
            <button 
              onClick={handleShareClick}
              className="flex-1 py-3 bg-white/5 text-slate-400 rounded-2xl text-[8px] font-black uppercase tracking-widest border border-white/5 transition-all active:scale-95"
            >
              Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
