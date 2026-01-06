
import React, { useState, useRef, useEffect } from 'react';
import { Category, Product, CurrencyCode } from '../types';
import { CATEGORIES, COUNTRY_CODES, CURRENCIES } from '../constants';
import { generateProductDescription, analyzeImageSafety, identifyProductFromImage, getUserUploadCountToday } from '../services/geminiService';
import AdBanner from './AdBanner';

interface SellProductModalProps {
  onClose: () => void;
  onAdd: (product: Product) => void;
  userEmail: string;
}

// Map ISO country codes to their respective currency codes
const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  'EG': 'EGP',
  'SA': 'SAR',
  'AE': 'AED',
  'US': 'USD',
  'ES': 'EUR',
  'MA': 'AED', // Simplified mapping for other countries
  'DZ': 'AED',
  'IQ': 'SAR',
  'CN': 'USD',
  'IN': 'USD',
  'ID': 'USD',
  'PK': 'USD'
};

const SellProductModal: React.FC<SellProductModalProps> = ({ onClose, onAdd, userEmail }) => {
  const [loading, setLoading] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [limitReached, setLimitReached] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [countryData, setCountryData] = useState(COUNTRY_CODES[0]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Others' as Category,
    price: '',
    location: '',
    phoneNumber: '',
    description: '',
    imageUrl: ''
  });

  // Detect local currency based on selected country
  const localCurrency = CURRENCIES.find(c => c.code === COUNTRY_TO_CURRENCY[countryData.iso]) || CURRENCIES[0];

  const wordCount = formData.description.trim() === '' ? 0 : formData.description.trim().split(/\s+/).length;

  useEffect(() => {
    if (!limitReached) return;
    const calculateTimeLeft = () => {
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    setTimeLeft(calculateTimeLeft());
    return () => clearInterval(timer);
  }, [limitReached]);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 700;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
        } else {
          if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
        }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    });
  };

  useEffect(() => {
    const checkLimit = async () => {
      setCheckingLimit(true);
      const count = await getUserUploadCountToday(userEmail);
      if (count >= 2) setLimitReached(true); 
      setCheckingLimit(false);
    };
    checkLimit();
  }, [userEmail]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnalyzingImage(true);
      setImageError('');
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const compressed = await compressImage(base64);
          const safety = await analyzeImageSafety(compressed);
          if (!safety.isSafe) {
            setImageError('Image rejected for safety reasons.');
            setAnalyzingImage(false);
            return;
          }
          setFormData(prev => ({ ...prev, imageUrl: base64 }));
          const info = await identifyProductFromImage(compressed);
          if (info) {
            setFormData(prev => ({
              ...prev,
              title: String(info.title || prev.title),
              category: (CATEGORIES.includes(info.category) ? info.category : 'Others') as Category,
              description: String(info.description || prev.description)
            }));
          }
        } catch (err) {
          setImageError("AI could not analyze this image.");
        } finally {
          setAnalyzingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (limitReached) return;
    if (!formData.imageUrl) { setImageError('Upload photo first.'); return; }
    if (wordCount < 10) { setImageError('Description too short (min 10 words).'); return; }

    // Convert price to USD before saving if necessary, or keep as is if app expects base currency
    // For this marketplace, we assume the input is converted to USD based on the detected local rate
    const priceInUSD = Number(formData.price) / localCurrency.rate;

    onAdd({
      id: String(Date.now()),
      ...formData,
      price: priceInUSD,
      location: countryData.country,
      phoneNumber: `${countryData.code}${formData.phoneNumber.replace(/^0+/, '')}`,
      createdAt: new Date(),
      sellerName: 'Bazaar Merchant'
    } as any);
  };

  if (checkingLimit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 w-full max-w-2xl rounded-[40px] shadow-2xl border border-white/5 overflow-hidden animate-in fade-in zoom-in duration-300 my-auto">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Post Your Ad</h2>
            <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
               Vision AI Active
            </p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 transition-all">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {limitReached ? (
          <div className="p-10 sm:p-20 text-center space-y-10">
            <div className="space-y-4">
              <div className="text-6xl animate-bounce">⏳</div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Daily Limit Reached</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] max-w-xs mx-auto leading-relaxed">
                You have reached your 2-ad limit for today. Next slot opens in:
              </p>
              <div className="inline-block px-10 py-5 bg-indigo-600/10 border border-indigo-500/20 rounded-[30px] shadow-2xl">
                <span className="text-4xl font-black text-indigo-400 font-mono tracking-widest">{timeLeft}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-white/5">
              <AdBanner className="!h-[140px] !rounded-[35px] !bg-indigo-950/20" />
            </div>
            <button onClick={onClose} className="w-full py-5 bg-slate-800 text-white rounded-[24px] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-slate-700 transition-all shadow-xl">Back to Market</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar text-left">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative h-64 w-full bg-slate-800 border-2 border-dashed ${imageError ? 'border-red-500/40' : 'border-white/5'} rounded-[32px] flex items-center justify-center cursor-pointer hover:border-indigo-500/40 transition-all overflow-hidden group shadow-inner`}
            >
              {analyzingImage ? (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Analyzing Visuals...</span>
                </div>
              ) : formData.imageUrl ? (
                <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="text-center opacity-40 group-hover:opacity-100 transition-opacity">
                  <svg className="w-12 h-12 text-slate-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth={1.5}/></svg>
                  <p className="text-[10px] font-black uppercase tracking-widest">Select Product Photo</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Title</label>
                  <input required className="w-full px-5 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                  <select className="w-full px-5 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}>
                    {CATEGORIES.filter(c => c !== 'All').map(cat => <option key={cat} value={cat} className="bg-slate-900">{cat}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                    Price ({localCurrency.code})
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 font-bold">{localCurrency.symbol}</span>
                    <input required type="number" className="w-full pl-10 pr-5 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white font-bold outline-none" placeholder="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone & Country</label>
                  <div className="flex gap-2">
                    <select 
                      className="px-2 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white text-[10px] font-black outline-none flex items-center justify-center min-w-[100px]"
                      value={countryData.iso}
                      onChange={(e) => setCountryData(COUNTRY_CODES.find(c => c.iso === e.target.value) || COUNTRY_CODES[0])}
                    >
                      {COUNTRY_CODES.map(c => (
                        <option key={c.iso} value={c.iso} className="bg-slate-900">{c.flag} +{c.code}</option>
                      ))}
                    </select>
                    <input required className="flex-1 px-5 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white font-bold outline-none" placeholder="Mobile Number" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Description (Min 10 Words)</label>
                <textarea required className="w-full px-5 py-5 bg-slate-800/50 border border-white/5 rounded-3xl text-white text-sm min-h-[150px] outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>

            {imageError && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase text-center">{imageError}</div>}

            <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all active:scale-95">Publish Ad</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SellProductModal;
