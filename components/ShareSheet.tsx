
import React, { useState } from 'react';
import { Product } from '../types';

interface ShareSheetProps {
  product: Product;
  onClose: () => void;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
}

const ShareSheet: React.FC<ShareSheetProps> = ({ product, onClose, onShowToast }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;
  const shareText = `Check out this ${product.title} ... 🔥`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      onShowToast("Link copied to clipboard", "success");
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    } catch (err) {
      onShowToast("Failed to copy link", "error");
    }
  };

  const shareToWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank');
    onClose();
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
    onClose();
  };

  const shareToMessenger = () => {
    const url = `fb-messenger://share/?link=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        className="bg-slate-900 w-full max-w-md rounded-t-[40px] sm:rounded-[48px] border-t sm:border border-white/10 shadow-2xl animate-in slide-in-from-bottom-10 duration-500 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 space-y-8">
          {/* Header Preview */}
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
             <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
             </div>
             <div className="flex-1 min-w-0 text-left">
                <p className="text-white font-bold text-sm truncate">{shareText}</p>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest truncate mt-1">{shareUrl.replace('https://', '')}</p>
             </div>
          </div>

          {/* Social Grid */}
          <div className="grid grid-cols-4 gap-4">
            <button onClick={shareToWhatsApp} className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 bg-[#25D366]/10 text-[#25D366] rounded-3xl flex items-center justify-center border border-[#25D366]/20 transition-all group-hover:scale-110 group-active:scale-90">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">WhatsApp</span>
            </button>

            <button onClick={shareToMessenger} className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 bg-[#0084FF]/10 text-[#0084FF] rounded-3xl flex items-center justify-center border border-[#0084FF]/20 transition-all group-hover:scale-110 group-active:scale-90">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.303 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.291 14.193l-3.076-3.273-5.996 3.273L10.71 7.71l3.076 3.273 5.996-3.273-6.491 6.483z"/>
                </svg>
              </div>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Messenger</span>
            </button>

            <button onClick={shareToFacebook} className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 bg-[#1877F2]/10 text-[#1877F2] rounded-3xl flex items-center justify-center border border-[#1877F2]/20 transition-all group-hover:scale-110 group-active:scale-90">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Facebook</span>
            </button>

            <button onClick={handleCopy} className="flex flex-col items-center gap-3 group">
              <div className="w-16 h-16 bg-white/5 text-slate-400 rounded-3xl flex items-center justify-center border border-white/10 transition-all group-hover:scale-110 group-active:scale-90">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{copied ? 'Copied' : 'Copy Link'}</span>
            </button>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-white rounded-[28px] font-black text-[11px] uppercase tracking-[0.2em] transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
      <div className="absolute inset-0 z-[-1]" onClick={onClose}></div>
    </div>
  );
};

export default ShareSheet;
