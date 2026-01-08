
import React, { useState, useRef, useEffect } from 'react';
import { Category, Product } from '../types';
import { CATEGORIES, COUNTRY_CODES } from '../constants';
import { analyzeImageSafety, identifyProductFromImage, getUserUploadCountToday } from '../services/geminiService';

interface SellProductModalProps {
  onClose: () => void;
  onAdd: (product: Product) => void;
  userEmail: string;
}

const SellProductModal: React.FC<SellProductModalProps> = ({ onClose, onAdd, userEmail }) => {
  const [loading, setLoading] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [limitReached, setLimitReached] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [countryData, setCountryData] = useState(COUNTRY_CODES[0]);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Others' as Category,
    price: '',
    currency: 'E£',
    location: '',
    phoneNumber: '',
    description: '',
    imageUrl: ''
  });

  useEffect(() => {
    const checkLimit = async () => {
      setCheckingLimit(true);
      const count = await getUserUploadCountToday(userEmail);
      if (count >= 2) setLimitReached(true); 
      setCheckingLimit(false);
    };
    checkLimit();
  }, [userEmail]);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 800;
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
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

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
              title: info.title || prev.title,
              category: (CATEGORIES.includes(info.category) ? info.category : 'Others') as Category,
              description: info.description || prev.description
            }));
          }
        } catch (err) {
          setImageError("AI Analysis failed. You can enter details manually.");
        } finally {
          setAnalyzingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Crucial Fix: Only allow digits. Prevents "90.000" being treated as decimal 90.
    const val = e.target.value.replace(/\D/g, '');
    setFormData({...formData, price: val});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (limitReached) return;
    if (!formData.imageUrl) { setImageError('Please upload a photo first.'); return; }
    if (!formData.price) { setImageError('Please enter the price.'); return; }
    
    setLoading(true);
    onAdd({
      id: String(Date.now()),
      ...formData,
      price: Number(formData.price),
      location: countryData.country,
      phoneNumber: `+${countryData.code}${formData.phoneNumber.replace(/^0+/, '')}`,
      createdAt: new Date(),
      sellerName: 'Bazaar Merchant'
    } as any);
  };

  if (checkingLimit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 w-full max-w-2xl h-full sm:h-auto sm:rounded-[40px] shadow-2xl border border-white/5 overflow-hidden animate-in fade-in zoom-in duration-300 my-auto flex flex-col">
        
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50 shrink-0">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Post Your Advertisement</h2>
            <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mt-1">You can edit all AI suggestions below</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 transition-all">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar text-left relative">
          
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`relative h-56 w-full bg-slate-800 border-2 border-dashed ${imageError ? 'border-red-500/40' : 'border-white/5'} rounded-[32px] flex items-center justify-center cursor-pointer hover:border-indigo-500/40 transition-all overflow-hidden group shadow-inner`}
          >
            {analyzingImage ? (
              <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">AI is writing details...</span>
              </div>
            ) : formData.imageUrl ? (
              <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="text-center opacity-40">
                <svg className="w-10 h-10 text-slate-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth={1.5}/></svg>
                <p className="text-[10px] font-black uppercase tracking-widest">Select Product Photo</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Title</label>
                <input required className="w-full px-5 py-3.5 bg-slate-800/50 border border-white/5 rounded-2xl text-white font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                <select className="w-full px-5 py-3.5 bg-slate-800/50 border border-white/5 rounded-2xl text-white font-bold outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as Category})}>
                  {CATEGORIES.filter(c => c !== 'All').map(cat => <option key={cat} value={cat} className="bg-slate-900">{cat}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-indigo-600/5 rounded-3xl border border-indigo-500/10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Price (Full Amount)</label>
                <input required type="text" inputMode="numeric" className="w-full px-5 py-3.5 bg-slate-900 border border-white/10 rounded-2xl text-white text-xl font-black outline-none focus:border-indigo-500" placeholder="e.g. 90000" value={formData.price} onChange={handlePriceChange} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Currency</label>
                <input required className="w-full px-5 py-3.5 bg-slate-900 border border-white/10 rounded-2xl text-white font-black text-sm uppercase outline-none focus:border-indigo-500" placeholder="e.g. E£, SR, $" value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Country</label>
                <button 
                  type="button"
                  onClick={() => setShowCountryPicker(true)}
                  className="w-full px-5 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white text-xs font-black flex items-center justify-between hover:bg-slate-800 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{countryData.flag}</span>
                    <span className="uppercase tracking-widest">{countryData.country}</span>
                  </div>
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="flex gap-2">
                  <div className="px-5 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white text-xs font-black flex items-center shrink-0">+{countryData.code}</div>
                  <input required className="flex-1 px-5 py-4 bg-slate-800/50 border border-white/5 rounded-2xl text-white font-bold outline-none" placeholder="123456789" value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Product Story</label>
              <textarea required className="w-full px-5 py-5 bg-slate-800/50 border border-white/5 rounded-3xl text-white text-sm min-h-[150px] outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none leading-relaxed" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
          </div>

          {imageError && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-black uppercase text-center">{imageError}</div>}

          <button type="submit" disabled={loading} className="w-full py-6 bg-indigo-600 text-white rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50">
            {loading ? 'Publishing...' : 'Publish Advertisement'}
          </button>

          {showCountryPicker && (
            <div className="absolute inset-0 z-[60] bg-slate-900 animate-in slide-in-from-bottom-5 duration-300 flex flex-col">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50 shrink-0">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Select Country</h3>
                <button 
                  type="button"
                  onClick={() => setShowCountryPicker(false)}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-500 transition-all"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                {COUNTRY_CODES.map((country) => (
                  <button
                    key={country.iso}
                    type="button"
                    onClick={() => {
                      setCountryData(country);
                      setShowCountryPicker(false);
                    }}
                    className={`w-full flex items-center justify-between p-6 rounded-[24px] transition-all group border mb-2 ${
                      countryData.iso === country.iso 
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' 
                        : 'bg-slate-800/40 border-transparent text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-5">
                      <span className="text-3xl filter group-hover:scale-110 transition-transform">{country.flag}</span>
                      <div className="text-left">
                        <p className="text-sm font-black uppercase tracking-widest leading-none mb-1">{country.country}</p>
                        <p className={`text-[10px] font-bold ${countryData.iso === country.iso ? 'text-indigo-200' : 'text-slate-600'}`}>International Code: +{country.code}</p>
                      </div>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      countryData.iso === country.iso 
                        ? 'bg-white border-white' 
                        : 'border-slate-700'
                    }`}>
                      {countryData.iso === country.iso && (
                        <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SellProductModal;
