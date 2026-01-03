
import React, { useState, useEffect } from 'react';
import { Product, Currency } from '../types';
import { negotiatePrice, getProductReviews, addProductReview } from '../services/geminiService';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  onViewProfile: (sellerName: string) => void;
  currency: Currency;
  currentUserEmail?: string;
  currentUserName?: string;
  onDeleteProduct?: (productId: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'error') => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  product, 
  onClose, 
  isWishlisted = false, 
  onToggleWishlist,
  onViewProfile,
  currency,
  currentUserEmail,
  currentUserName,
  onDeleteProduct,
  onShowToast
}) => {
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [negotiationResult, setNegotiationResult] = useState<{status: string, message: string} | null>(null);
  const [isNegotiating, setIsNegotiating] = useState(false);
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [authError, setAuthError] = useState('');

  const convertedPrice = Math.round(product.price * currency.rate);
  const isOwner = currentUserEmail === product.sellerEmail;
  const isVerifiedSeller = (product.rating || 0) >= 4.5 && (product.reviewsCount || 0) >= 50;

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
    if (digits.startsWith('0')) {
      digits = '20' + digits.substring(1);
    }
    const message = encodeURIComponent(`Hi, I'm interested in your product: ${product.title}`);
    window.open(`https://wa.me/${digits}?text=${message}`, '_blank');
  };

  const handleShare = async () => {
    const shareData = {
      title: `Bazaar: ${product.title}`,
      text: `Check out this ${product.title} on Bazaar Marketplace! Price: ${currency.symbol}${convertedPrice}`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        onShowToast?.("Link copied to clipboard!", "success");
      } catch (err) {
        onShowToast?.("Failed to copy link.", "error");
      }
    }
  };

  const handleDeleteClick = () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this listing? It will be removed from your profile and the Bazaar database permanently.");
    if (confirmDelete && onDeleteProduct) {
      onDeleteProduct(product.id);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserEmail) {
      setAuthError('You must login to add a review');
      setTimeout(() => setAuthError(''), 3000);
      return;
    }
    if (isOwner) return;

    setIsSubmittingReview(true);
    const result = await addProductReview(product.id, reviewRating, currentUserName || 'Bazzarian', reviewComment);
    
    if (result) {
      const updatedReviews = await getProductReviews(product.id);
      setReviews(updatedReviews);
      setShowReviewForm(false);
      setReviewComment('');
    }
    setIsSubmittingReview(false);
  };

  const renderStarRating = (rating: number, size: string = "w-3 h-3") => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} className={`${size} ${s <= Math.round(rating) ? 'text-amber-400 fill-current' : 'text-slate-700'}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md">
      <div className="bg-slate-900 w-full max-w-4xl h-full sm:h-[92vh] sm:rounded-[40px] shadow-2xl border border-white/5 overflow-y-auto overflow-x-hidden custom-scrollbar scroll-smooth flex flex-col relative" dir="ltr">
        
        <div className="sticky top-0 z-30 w-full bg-slate-900 shadow-2xl">
          <div className="relative aspect-[16/10] sm:aspect-[21/9] overflow-hidden">
            <img src={product.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20 scale-150" />
            <img src={product.imageUrl} alt={product.title} className="relative w-full h-full object-contain p-4 transition-transform duration-700 hover:scale-105" />
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-slate-900 to-transparent"></div>
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-40">
              <button onClick={onClose} className="p-3 rounded-full bg-slate-950/40 backdrop-blur-xl text-white border border-white/10 hover:bg-slate-800 transition-all shadow-xl active:scale-90">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <button onClick={onToggleWishlist} className={`p-3 rounded-full backdrop-blur-xl transition-all border shadow-xl active:scale-90 ${isWishlisted ? 'bg-red-600 text-white border-red-400' : 'bg-slate-950/40 text-white border-white/10'}`}>
                <svg className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </button>
            </div>
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-40">
              <div className="bg-slate-950/60 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-2.5 shadow-2xl">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <span className="text-white font-black text-sm ml-1.5">{product.rating || 'New'}</span>
                </div>
                <div className="w-px h-3.5 bg-white/20"></div>
                <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest">{reviews.length} Feedbacks</span>
              </div>
              <div className="bg-indigo-600/90 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black text-white border border-white/10 shadow-2xl uppercase tracking-[0.2em]">
                {product.category}
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 bg-slate-900 p-6 sm:p-10 space-y-10 text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/5 pb-10">
            <div className="flex-1">
               <h2 className="text-3xl sm:text-5xl font-black text-white leading-none uppercase tracking-tighter mb-4">{product.title}</h2>
               <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-indigo-400">{currency.symbol}{convertedPrice.toLocaleString()}</span>
                  <div className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-black border border-emerald-500/20 uppercase tracking-widest">Available Now</div>
               </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-950/40 p-4 rounded-3xl border border-white/5">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg">
                {product.sellerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-black text-sm uppercase">{product.sellerName}</span>
                  {isVerifiedSeller && (
                    <svg className="w-3.5 h-3.5 text-blue-400 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  )}
                </div>
                <button onClick={() => onViewProfile(product.sellerName)} className="text-[10px] text-indigo-400 font-black uppercase tracking-widest hover:underline mt-0.5">View Merchant Profile</button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Story & Specifications</h4>
             <div className="bg-slate-950/40 p-8 rounded-[40px] border border-white/5 shadow-inner">
                <p className="text-slate-300 leading-relaxed text-base whitespace-pre-line">{product.description}</p>
             </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
               <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Client Reviews</h4>
               {!isOwner && currentUserEmail && (
                  <button onClick={() => setShowReviewForm(true)} className="px-4 py-2 bg-indigo-600/10 text-indigo-400 text-[10px] font-black rounded-xl border border-indigo-500/20 uppercase tracking-widest hover:bg-indigo-600/20 transition-all">Add Review</button>
               )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loadingReviews ? (
                <div className="col-span-full h-32 bg-slate-800/20 animate-pulse rounded-3xl"></div>
              ) : reviews.length > 0 ? reviews.map(r => (
                <div key={r.id} className="p-6 bg-slate-950/30 rounded-3xl border border-white/5 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black text-white uppercase">{r.userName}</span>
                    {renderStarRating(r.rating)}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed italic mb-4">"{r.comment}"</p>
                  <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest">{r.timestamp.toLocaleDateString()}</span>
                </div>
              )) : (
                <div className="col-span-full py-16 text-center text-slate-700 font-black uppercase text-[10px] tracking-[0.4em]">No reviews yet</div>
              )}
            </div>
          </div>

          <div className="pt-10 pb-20 border-t border-white/5">
             <div className="flex flex-col sm:flex-row gap-4">
                {isOwner ? (
                  <button onClick={handleDeleteClick} className="flex-1 py-6 bg-red-600/10 text-red-500 rounded-[28px] font-black text-xs border border-red-500/20 hover:bg-red-500/20 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    REMOVE THIS LISTING
                  </button>
                ) : (
                  <>
                    <button onClick={() => setShowNegotiation(true)} className="flex-1 py-6 bg-slate-800 text-white rounded-[28px] font-black text-[11px] border border-slate-700 hover:bg-slate-700 transition-all uppercase tracking-widest shadow-xl">NEGOTIATE PRICE</button>
                    <div className="flex-1 flex gap-3">
                        <button onClick={handleWhatsAppClick} className="flex-[2] py-6 bg-emerald-600 text-white rounded-[28px] font-black text-[11px] hover:bg-emerald-700 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(16,185,129,0.3)]">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.484 8.412-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.309 1.656zm6.29-4.143c1.565.933 3.176 1.423 4.842 1.425 5.463 0 9.908-4.447 9.91-9.91.001-2.646-1.027-5.133-2.897-7.004-1.87-1.871-4.358-2.9-7.006-2.901-5.465 0-9.91 4.444-9.912 9.908-.001 1.748.459 3.456 1.321 4.956l-1.02 3.723 3.822-1.001zm11.766-7.341c-.26-.13-1.534-.757-1.772-.843-.238-.087-.412-.13-.584.13-.172.26-.665.843-.815 1.017-.15.173-.3.194-.56.065-.26-.13-1.097-.404-2.09-1.288-.771-.688-1.292-1.538-1.443-1.798-.15-.26-.016-.4.114-.53.117-.118.26-.304.39-.455.13-.152.174-.26.26-.433.087-.173.044-.325-.022-.455-.065-.13-.584-1.408-.8-1.928-.211-.507-.425-.437-.584-.445-.15-.007-.323-.008-.497-.008-.174 0-.455.065-.693.325-.238.26-.91.888-.91 2.166 0 1.278.93 2.515 1.06 2.688.13.174 1.828 2.79 4.429 3.912.619.267 1.1.427 1.477.547.622.197 1.187.17 1.634.103.498-.074 1.534-.627 1.751-1.234.217-.607.217-1.127.152-1.234-.065-.108-.239-.174-.499-.304z"/></svg>
                            WHATSAPP
                        </button>
                        <button onClick={handleShare} className="flex-1 py-6 bg-indigo-600/10 text-indigo-400 rounded-[28px] font-black border border-indigo-500/20 hover:bg-indigo-600/20 transition-all flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        </button>
                    </div>
                  </>
                )}
             </div>
          </div>
        </div>

        {showNegotiation && (
          <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-slate-900 p-8 rounded-[40px] border border-white/5 shadow-2xl animate-in zoom-in">
              <h3 className="text-xl font-black text-white text-center mb-6 uppercase tracking-widest">SUBMIT AN OFFER</h3>
              {!negotiationResult ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!offerPrice) return;
                  setIsNegotiating(true);
                  const offerInUSD = Number(offerPrice) / currency.rate;
                  negotiatePrice(product.title, product.price, offerInUSD).then(res => {
                    setNegotiationResult(res);
                    setIsNegotiating(false);
                  });
                }} className="space-y-5">
                  <div className="text-center text-slate-500 text-[10px] font-black uppercase tracking-widest">ASKING PRICE: {currency.symbol}{convertedPrice.toLocaleString()}</div>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-indigo-500">{currency.symbol}</span>
                    <input type="number" placeholder="0" className="w-full pl-16 pr-6 py-6 bg-slate-800 border border-white/5 rounded-3xl text-white text-3xl font-black text-center outline-none focus:border-indigo-500 transition-all" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} />
                  </div>
                  <button disabled={isNegotiating} className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black shadow-lg shadow-indigo-900/40 active:scale-95 transition-all uppercase tracking-widest">
                    {isNegotiating ? 'COMMUNICATING...' : 'SEND OFFER'}
                  </button>
                  <button type="button" onClick={() => setShowNegotiation(false)} className="w-full text-slate-500 text-[10px] font-black uppercase tracking-widest mt-2 hover:text-white transition-colors">CANCEL</button>
                </form>
              ) : (
                <div className="text-center space-y-6 animate-in zoom-in">
                  <div className={`p-8 rounded-[32px] ${negotiationResult.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    <p className="text-sm font-bold italic leading-relaxed">"{negotiationResult.message}"</p>
                  </div>
                  <button onClick={() => {setShowNegotiation(false); setNegotiationResult(null);}} className="w-full py-5 bg-slate-800 text-white rounded-[24px] font-black uppercase tracking-widest">DISMISS</button>
                </div>
              )}
            </div>
          </div>
        )}

        {showReviewForm && (
          <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-slate-900 p-8 rounded-[40px] border border-white/5 shadow-2xl animate-in zoom-in">
              <h3 className="text-xl font-black text-white text-center mb-8 uppercase tracking-widest">LEAVE FEEDBACK</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div className="flex justify-center gap-4">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button" onClick={() => setReviewRating(star)} className={`text-4xl transition-all ${star <= reviewRating ? 'text-amber-400 scale-125 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]' : 'text-slate-800'}`}>★</button>
                  ))}
                </div>
                <textarea 
                  required
                  placeholder="Share your thoughts on this product..."
                  className="w-full p-6 bg-slate-800 border border-white/5 rounded-[32px] text-white text-sm min-h-[160px] outline-none focus:border-indigo-500 transition-all resize-none leading-relaxed"
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                />
                {authError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                    <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">{authError}</p>
                  </div>
                )}
                <button disabled={isSubmittingReview} type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black uppercase shadow-lg shadow-indigo-900/40 transition-all active:scale-95 flex items-center justify-center gap-3">
                  {isSubmittingReview ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'POST REVIEW'}
                </button>
                <button type="button" onClick={() => setShowReviewForm(false)} className="w-full text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">ABORT</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailModal;
