
import React, { useState } from 'react';
import { Product, Currency, Review } from '../types';
import { negotiatePrice, getSellerStats } from '../services/geminiService';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  onStartChat: (product: Product) => void;
  onViewProfile: (sellerName: string) => void;
  onRate?: (productId: string, rating: number) => void;
  currency: Currency;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  product, 
  onClose, 
  isWishlisted = false, 
  onToggleWishlist,
  onStartChat,
  onViewProfile,
  onRate,
  currency
}) => {
  const [showSellerStats, setShowSellerStats] = useState(false);
  const [sellerStats, setSellerStats] = useState<any>(null);
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');
  const [negotiationResult, setNegotiationResult] = useState<{status: string, message: string} | null>(null);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  
  const convertedPrice = Math.round(product.price * currency.rate);
  const cleanPhone = product.phoneNumber.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hello, I'm interested in: ${product.title}`)}`;

  const handleNegotiate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerPrice) return;
    setIsNegotiating(true);
    const offerInUSD = Number(offerPrice) / currency.rate;
    const result = await negotiatePrice(product.title, product.price, offerInUSD);
    setNegotiationResult(result);
    setIsNegotiating(false);
  };

  const handleRate = (rating: number) => {
    setUserRating(rating);
    if (onRate) onRate(product.id, rating);
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      <div className="bg-slate-900 w-full max-w-5xl rounded-[40px] shadow-2xl border border-slate-800 overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300 max-h-[92vh] relative" dir="ltr">
        
        {/* Sidebar Ad Placeholder */}
        <div className="hidden lg:flex w-24 bg-slate-950 border-r border-slate-800 flex-col items-center justify-center p-4 opacity-50">
           <span className="text-[9px] text-slate-700 font-bold mb-2 tracking-widest uppercase [writing-mode:vertical-lr]">ADVERTISEMENT</span>
        </div>

        {/* Image Section */}
        <div className="w-full md:w-5/12 bg-slate-950 flex flex-col relative border-r border-slate-800 group">
          <div className="relative aspect-square overflow-hidden">
            <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            
            {/* Exit Button */}
            <button 
              onClick={onClose} 
              className="absolute top-6 left-6 p-3 rounded-full bg-slate-950/60 backdrop-blur-xl text-white border border-white/10 hover:bg-slate-800 transition-all z-20 shadow-xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Rating Overlay - Back to Star */}
            {product.rating && (
              <div className="absolute bottom-6 left-6 bg-slate-950/60 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-2.5 shadow-2xl transition-all group-hover:bg-slate-950/80">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <span className="text-white font-black text-sm ml-1.5">{product.rating}</span>
                </div>
                <div className="w-px h-3.5 bg-white/20"></div>
                <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">{product.reviewsCount} REVIEWS</span>
              </div>
            )}

            <button onClick={onToggleWishlist} className={`absolute top-6 right-6 p-3 rounded-full backdrop-blur-xl transition-all border z-20 ${isWishlisted ? 'bg-red-600 text-white border-red-400' : 'bg-slate-950/60 text-white border-white/10'}`}>
              <svg className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
          </div>
          
          <div className="p-6 grid grid-cols-2 gap-4 bg-slate-900/50 backdrop-blur-md border-t border-slate-800">
            <button onClick={() => setShowNegotiation(true)} className="flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-xl hover:bg-indigo-700 transition-all">NEGOTIATE</button>
            <button onClick={() => onStartChat(product)} className="flex items-center justify-center gap-2 py-3 bg-slate-800 text-slate-300 rounded-2xl font-black text-xs border border-slate-700 hover:bg-slate-700 transition-all">DIRECT CHAT</button>
          </div>
        </div>

        {/* Info Section */}
        <div className="w-full md:w-7/12 p-8 flex flex-col overflow-y-auto custom-scrollbar bg-slate-900 text-left">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-indigo-900/30 text-indigo-400 rounded-lg text-[10px] font-black border border-indigo-800/50 uppercase">{product.category}</span>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">LISTED RECENTLY</span>
              </div>
              <h2 className="text-3xl font-black text-white leading-tight tracking-tight uppercase">{product.title}</h2>
            </div>
          </div>

          {/* Product Summary Box */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-slate-950 p-4 rounded-[24px] border border-slate-800/60 text-center flex flex-col justify-center items-center shadow-inner">
              <div className="text-[9px] text-slate-500 font-black uppercase mb-1 tracking-wider">ASKING PRICE</div>
              <div className="text-xl font-black text-indigo-400">{currency.symbol}{convertedPrice.toLocaleString()}</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-[24px] border border-slate-800/60 text-center flex flex-col justify-center items-center shadow-inner">
              <div className="text-[9px] text-slate-500 font-black uppercase mb-1 tracking-wider">LOCATION</div>
              <div className="text-xs font-black text-slate-200 truncate w-full">{product.location.split(',')[0]}</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-[24px] border border-slate-800/60 text-center flex flex-col justify-center items-center shadow-inner">
              <div className="text-[9px] text-slate-500 font-black uppercase mb-1 tracking-wider">SECURITY</div>
              <div className="text-emerald-400 text-[10px] font-black flex items-center gap-1.5 uppercase">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>VERIFIED
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="text-[10px] font-black text-slate-500 mb-3 uppercase tracking-[0.2em]">Detailed Overview</h4>
            <div className="bg-slate-800/10 p-5 rounded-3xl border border-slate-800/50">
              <p className="text-slate-400 leading-relaxed text-sm">{product.description}</p>
            </div>
          </div>

          {/* Integrated Star Rating System - Back to Stars */}
          <div className="mb-8 p-5 bg-amber-400/5 rounded-3xl border border-amber-500/10">
            <h4 className="text-[10px] font-black text-amber-500 mb-3 uppercase tracking-widest">Rate this Product</h4>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRate(star)}
                  className={`transition-all ${star <= (hoverRating || userRating) ? 'text-amber-400 scale-110' : 'text-slate-700'}`}
                >
                  <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </button>
              ))}
            </div>
          </div>

          {/* Buyer Reviews Section */}
          <div className="mb-8">
            <h4 className="text-[10px] font-black text-slate-500 mb-4 uppercase tracking-[0.2em]">Recent Buyer Feedback</h4>
            <div className="space-y-4">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xs font-black text-slate-400 uppercase border border-slate-700">
                      {rev.userName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black text-white">{rev.userName}</span>
                        <span className="text-[9px] text-slate-600 font-bold uppercase">{timeAgo(rev.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map(s => (
                            <svg key={s} className={`w-3 h-3 ${s <= rev.rating ? 'text-amber-500 fill-current' : 'text-slate-800'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed italic">"{rev.comment}"</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 border-2 border-dashed border-slate-800 rounded-3xl">
                  <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">No feedback yet. Be the first!</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
             {/* Quick Message Box */}
             <div className="bg-slate-950 rounded-[28px] border border-slate-800 p-5">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Quick question to seller..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:ring-1 focus:ring-indigo-600 transition-all"
                  />
                  <button onClick={() => onStartChat(product)} className="bg-indigo-600 text-white px-4 rounded-xl font-black text-xs hover:bg-indigo-700 transition-all">Send</button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <a href={`tel:${product.phoneNumber}`} className="flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-[10px] border border-slate-800 hover:bg-slate-800 transition-all uppercase tracking-widest">Call Seller</a>
                  <a href={whatsappUrl} target="_blank" className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600/10 text-emerald-500 rounded-xl font-bold text-[10px] border border-emerald-500/20 hover:bg-emerald-600/20 transition-all uppercase tracking-widest">WhatsApp</a>
                </div>
             </div>
          </div>
        </div>

        {/* Negotiation Overlay */}
        {showNegotiation && (
          <div className="absolute inset-0 z-[60] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-slate-900 p-8 rounded-[32px] border border-slate-700 shadow-2xl">
              <h3 className="text-xl font-black text-white text-center mb-6 uppercase tracking-widest">Make an Offer</h3>
              {!negotiationResult ? (
                <form onSubmit={handleNegotiate} className="space-y-5">
                  <div className="text-center text-slate-500 text-xs font-bold uppercase tracking-widest">Asking: {currency.symbol}{convertedPrice.toLocaleString()}</div>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-600">{currency.symbol}</span>
                    <input 
                      type="number" 
                      placeholder="0"
                      className="w-full pl-12 pr-6 py-5 bg-slate-800 border border-slate-700 rounded-2xl text-white text-3xl font-black text-center outline-none focus:border-indigo-500 transition-all"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                    />
                  </div>
                  <button disabled={isNegotiating} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-900/20 active:scale-95 transition-all">
                    {isNegotiating ? 'NEGOTIATING...' : 'SEND OFFER'}
                  </button>
                  <button type="button" onClick={() => setShowNegotiation(false)} className="w-full text-slate-500 text-[10px] font-black uppercase tracking-widest">Back to Listing</button>
                </form>
              ) : (
                <div className="text-center space-y-6 animate-in zoom-in">
                  <div className={`p-4 rounded-2xl ${negotiationResult.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    <p className="text-sm font-bold italic leading-relaxed">"{negotiationResult.message}"</p>
                  </div>
                  <button onClick={() => {setShowNegotiation(false); setNegotiationResult(null);}} className="w-full py-4 bg-slate-800 text-white rounded-xl font-black">CLOSE</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailModal;
