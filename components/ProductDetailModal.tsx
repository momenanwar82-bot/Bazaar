
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
  onShare
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

  const handleQuickRate = (rating: number) => {
    if (isOwner) {
      onShowToast?.("لا يمكنك تقييم منتجك الخاص كبائع.", "error");
      return;
    }
    setReviewRating(rating);
    setShowReviewForm(true);
    // Scroll to form automatically
    document.getElementById('review-form-anchor')?.scrollIntoView({ behavior: 'smooth' });
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
      onShowToast?.("تم إرسال تقييمك بنجاح!", "success");
      setShowReviewForm(false);
      setReviewComment('');
      const updated = await getProductReviews(product.id);
      setReviews(updated);
    } else {
      onShowToast?.("فشل إرسال التقييم.", "error");
    }
    setIsSubmittingReview(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md">
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
              
              <div className="flex gap-3">
                <button onClick={onToggleWishlist} className={`p-3 rounded-full backdrop-blur-xl transition-all border shadow-xl active:scale-90 ${isWishlisted ? 'bg-red-600 text-white border-red-400' : 'bg-slate-950/40 text-white border-white/10'}`}>
                  <svg className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 bg-slate-900 p-6 sm:p-10 space-y-10">
          {/* Product Title & Price */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-10">
              <div className="flex-1">
                 <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight uppercase tracking-tighter mb-4">{product.title}</h2>
                 
                 <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-5xl font-black text-indigo-400 leading-none">{product.price.toLocaleString()}</span>
                      <span className="text-sm font-black text-indigo-400/60 uppercase tracking-widest">{product.currency}</span>
                    </div>
                    <div className="px-5 py-2.5 bg-emerald-500/5 border border-emerald-500/30 rounded-2xl flex items-center justify-center">
                      <span className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em] leading-none">AVAILABLE</span>
                    </div>
                 </div>
              </div>
              
              <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-3xl border border-white/5">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black">
                  {product.sellerName.charAt(0)}
                </div>
                <div>
                  <span className="text-white font-black text-sm uppercase block">{product.sellerName}</span>
                  <button onClick={() => onViewProfile(product.sellerName)} className="text-[10px] text-indigo-400 font-black uppercase tracking-widest hover:underline">View Merchant Profile</button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Description</h4>
             <div className="bg-slate-950/40 p-8 rounded-[40px] border border-white/5">
                <p className="text-slate-300 leading-relaxed text-base whitespace-pre-line">{product.description}</p>
             </div>
          </div>

          {/* New Interactive 5-Star Rating Section */}
          <div className="space-y-8 bg-slate-950/20 p-8 rounded-[40px] border border-white/5">
            <div className="flex flex-col items-center text-center gap-4">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Rate This Product</h4>
               
               <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      disabled={isOwner}
                      onMouseEnter={() => !isOwner && setHoverRating(star)}
                      onMouseLeave={() => !isOwner && setHoverRating(0)}
                      onClick={() => handleQuickRate(star)}
                      className={`transition-all duration-300 transform ${isOwner ? 'opacity-30 cursor-not-allowed' : 'hover:scale-125 active:scale-90'}`}
                    >
                      <svg 
                        className={`w-12 h-12 ${
                          star <= (hoverRating || reviewRating) ? 'text-amber-400 fill-current' : 'text-slate-700'
                        } transition-colors duration-200`} 
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </button>
                  ))}
               </div>

               <p className="text-[11px] font-black uppercase tracking-widest">
                  {isOwner 
                    ? <span className="text-red-500/60">Sellers cannot rate their own items</span> 
                    : <span className="text-indigo-400">Click a star to share your experience</span>
                  }
               </p>
            </div>

            {/* Existing Review List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 pt-6 border-t border-white/5">
              <div id="review-form-anchor"></div>
              {showReviewForm && !isOwner && (
                <form onSubmit={handleReviewSubmit} className="mb-8 p-6 bg-indigo-600/5 rounded-3xl border border-indigo-500/20 space-y-4 animate-in slide-in-from-top-5 duration-500">
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Selected Rating: {reviewRating} Stars</span>
                   </div>
                   <textarea
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe your experience with this item..."
                    className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20 h-24 resize-none"
                   />
                   <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
                   >
                    {isSubmittingReview ? 'Submitting...' : 'Post Detailed Review'}
                   </button>
                </form>
              )}

              {loadingReviews ? (
                <div className="text-center py-10 opacity-30 text-[9px] font-black uppercase tracking-[0.3em]">Loading reviews...</div>
              ) : reviews.length > 0 ? (
                reviews.map((r, i) => (
                  <div key={i} className="bg-white/5 p-6 rounded-[30px] border border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-[10px] font-black">
                          {r.userName.charAt(0)}
                        </div>
                        <span className="text-[11px] font-black text-white uppercase">{r.userName}</span>
                      </div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <svg key={s} className={`w-3 h-3 ${s <= r.rating ? 'text-amber-400 fill-current' : 'text-slate-800'}`} viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{r.comment}</p>
                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">{new Date(r.timestamp).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">No reviews yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-10 pb-20 border-t border-white/5 flex flex-col gap-4">
              <div className="flex flex-col gap-4 bg-slate-950/30 p-4 rounded-[40px] border border-white/5">
                <button 
                  onClick={() => onShare(product)} 
                  className="w-full py-5 bg-[#14152b] hover:bg-[#1a1c3d] text-indigo-300/60 rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl transition-all active:scale-[0.98] border border-white/5"
                >
                  SHARE AD
                </button>
                <button 
                  onClick={handleWhatsAppClick} 
                  className="w-full py-5 bg-[#0f9d58] hover:bg-[#0da85d] text-white rounded-[28px] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  WHATSAPP
                </button>
              </div>
              <AdBanner className="mt-6 !h-[120px] !rounded-[30px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
