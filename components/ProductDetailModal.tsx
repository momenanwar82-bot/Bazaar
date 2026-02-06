
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { getProductReviews, addProductReview } from '../services/geminiService';
import AdBanner from './AdBanner';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  onViewProfile: (sellerName: string) => void;
  currentUserEmail?: string;
  currentUserName?: string;
  onDeleteProduct?: (productId: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'error') => void;
  onShare: (product: Product) => void;
  onStartChat: () => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  product, 
  onClose, 
  isWishlisted = false, 
  onToggleWishlist,
  onViewProfile,
  currentUserEmail,
  currentUserName,
  onShowToast,
  onShare,
  onStartChat
}) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const isOwner = currentUserEmail === product.sellerEmail;

  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      const data = await getProductReviews(product.id);
      setReviews(data);
      setLoadingReviews(false);
    };
    fetchReviews();
  }, [product.id]);

  const handleWhatsAppClick = () => {
    let digits = product.phoneNumber.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi, I'm interested in your product: ${product.title}`);
    window.open(`https://wa.me/${digits}?text=${message}`, '_blank');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserEmail) {
      onShowToast?.("يرجى تسجيل الدخول لترك تقييم.", "error");
      return;
    }
    setIsSubmittingReview(true);
    const result = await addProductReview(product.id, reviewRating, currentUserName || 'Verified Buyer', reviewComment);
    if (result) {
      onShowToast?.("Review posted!", "success");
      setShowReviewForm(false);
      setReviewComment('');
      const updated = await getProductReviews(product.id);
      setReviews(updated);
    }
    setIsSubmittingReview(false);
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-slate-950/95 backdrop-blur-md">
      <div className="bg-slate-900 w-full max-w-4xl h-full sm:h-[92vh] sm:rounded-[40px] shadow-2xl border border-white/5 overflow-y-auto overflow-x-hidden custom-scrollbar scroll-smooth flex flex-col relative text-left">
        
        {/* Header Image Section */}
        <div className="sticky top-0 z-30 w-full bg-slate-900 shadow-2xl">
          <div className="relative aspect-[16/10] sm:aspect-[21/9] overflow-hidden">
            <img src={product.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20 scale-150" />
            <img src={product.imageUrl} alt={product.title} className="relative w-full h-full object-contain p-4 transition-transform duration-700 hover:scale-105" />
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-40">
              <button onClick={onClose} className="p-3 rounded-full bg-slate-950/40 backdrop-blur-xl text-white border border-white/10 hover:bg-slate-800 transition-all shadow-xl active:scale-90">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <button onClick={onToggleWishlist} className={`p-3 rounded-full backdrop-blur-xl transition-all border shadow-xl active:scale-90 ${isWishlisted ? 'bg-red-600 text-white border-red-400' : 'bg-slate-950/40 text-white border-white/10'}`}>
                <svg className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="relative z-10 bg-slate-900 p-6 sm:p-10 space-y-10 pb-32">
          {/* Product Title & Price */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-10">
            <div className="flex-1">
               <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight uppercase tracking-tighter mb-4">{product.title}</h2>
               <div className="flex items-baseline gap-1.5">
                  <span className="text-5xl font-black text-indigo-400 leading-none">{product.price.toLocaleString()}</span>
                  <span className="text-sm font-black text-indigo-400/60 uppercase tracking-widest">{product.currency}</span>
               </div>
            </div>
            
            <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-3xl border border-white/5">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black">
                {product.sellerName.charAt(0)}
              </div>
              <div>
                <span className="text-white font-black text-sm uppercase block">{product.sellerName}</span>
                <button onClick={() => onViewProfile(product.sellerName)} className="text-[10px] text-indigo-400 font-black uppercase tracking-widest hover:underline">View Merchant</button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Description</h4>
             <div className="bg-slate-950/40 p-8 rounded-[40px] border border-white/5">
                <p className="text-slate-300 leading-relaxed text-base whitespace-pre-line">{product.description}</p>
             </div>
          </div>

          {/* Action Buttons */}
          {!isOwner && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button 
                  onClick={onStartChat}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl transition-all flex items-center justify-center gap-2"
               >
                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                 Secure Live Chat
               </button>
               <button 
                  onClick={handleWhatsAppClick}
                  className="w-full py-5 bg-[#0f9d58] hover:bg-[#0da85d] text-white rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl transition-all flex items-center justify-center gap-2"
               >
                 WhatsApp Seller
               </button>
            </div>
          )}

          <div className="pt-10 border-t border-white/5">
            <AdBanner className="!h-[120px] !rounded-[30px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
