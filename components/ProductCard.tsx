import React from 'react';
import { MessageCircle, Share2, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }: { product: any }) => {
  const navigate = useNavigate();

  const handleChat = () => {
    // Navigate to chat with the seller ID and item title
    navigate(`/chat?with=${product.userId}&item=${encodeURIComponent(product.title)}`);
  };

  return (
    <div className="bg-[#0f0f1e] rounded-[2rem] overflow-hidden border border-gray-800/50 hover:border-indigo-500/40 transition-all duration-300 group shadow-xl">
      {/* Product Image Section */}
      <div className="relative h-72 overflow-hidden">
        <img 
          src={product.imageUrl || "/api/placeholder/400/400"} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute top-5 right-5 bg-black/40 backdrop-blur-md p-2.5 rounded-full cursor-pointer hover:bg-red-500 transition-all">
          <Heart size={20} className="text-white" />
        </div>
      </div>

      {/* Product Details Section */}
      <div className="p-6 text-left">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white font-bold text-xl truncate flex-1 uppercase tracking-tight">
            {product.title}
          </h3>
          <span className="bg-indigo-600/20 text-indigo-400 text-[10px] font-extrabold px-3 py-1 rounded-lg uppercase tracking-wider ml-2">
            {product.category}
          </span>
        </div>
        
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-3xl font-black text-white">{product.price}</span>
          <span className="text-sm text-indigo-500 font-bold uppercase">EGP</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <button className="w-full bg-[#1a1a2e] hover:bg-[#252545] text-gray-400 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all text-[11px] font-bold tracking-[0.2em] uppercase border border-gray-800">
            <Share2 size={16} />
            Share Ad
          </button>
          
          <button 
            onClick={handleChat}
            className="w-full bg-[#4e46e5] hover:bg-[#4338ca] text-white py-4 rounded-2xl flex items-center justify-center gap-2 transition-all text-sm font-black uppercase tracking-widest shadow-lg shadow-indigo-500/25 hover:-translate-y-0.5"
          >
            <MessageCircle size={20} />
            Chat Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
