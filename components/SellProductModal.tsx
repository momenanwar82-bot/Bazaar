
import React, { useState, useRef } from 'react';
import { Category, Product } from '../types';
import { CATEGORIES } from '../constants';
import { generateProductDescription, analyzeImageSafety, identifyProductFromImage } from '../services/geminiService';

interface SellProductModalProps {
  onClose: () => void;
  onAdd: (product: Product) => void;
}

const SellProductModal: React.FC<SellProductModalProps> = ({ onClose, onAdd }) => {
  const [loading, setLoading] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [imageError, setImageError] = useState('');
  const [magicFill, setMagicFill] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'Cars' as Category,
    price: '',
    location: '',
    phoneNumber: '',
    description: '',
    imageUrl: '' 
  });

  const MIN_DESC_LENGTH = 100;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setImageError('File size exceeds 5MB limit.');
        return;
      }

      setAnalyzingImage(true);
      setImageError('');
      setFormData(prev => ({ ...prev, imageUrl: '' }));
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        // 1. Safety Check
        const safetyResult = await analyzeImageSafety(base64);
        
        if (!safetyResult.isSafe) {
          setImageError(`Action Required: ${safetyResult.reason || 'Image violates safety policy.'}`);
          setFormData(prev => ({ ...prev, imageUrl: '' }));
          setAnalyzingImage(false);
        } else {
          setFormData(prev => ({ ...prev, imageUrl: base64 }));
          
          // 2. Image Recognition (The Magic Part)
          setMagicFill(true);
          const identification = await identifyProductFromImage(base64);
          
          if (identification) {
            setFormData(prev => ({
              ...prev,
              title: identification.title || prev.title,
              category: (CATEGORIES.includes(identification.category as Category) ? identification.category : 'Others') as Category,
              description: identification.description || prev.description
            }));
          }
          
          setMagicFill(false);
          setAnalyzingImage(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSmartDescribe = async () => {
    if (!formData.title) {
      alert('Please enter a product title first or upload an image.');
      return;
    }
    setLoading(true);
    const desc = await generateProductDescription(formData.title, formData.category);
    setFormData(prev => ({ ...prev, description: desc }));
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      alert('A verified safe image is required.');
      return;
    }
    if (formData.description.length < 20) {
      alert('Please provide a meaningful description.');
      return;
    }
    
    const newProduct: Product = {
      id: Date.now().toString(),
      title: formData.title,
      category: formData.category,
      price: Number(formData.price),
      location: formData.location,
      phoneNumber: formData.phoneNumber,
      description: formData.description,
      imageUrl: formData.imageUrl,
      createdAt: new Date(),
      sellerName: 'Global User'
    };
    onAdd(newProduct);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-black text-white">Create Listing</h2>
            <p className="text-xs text-slate-500 mt-1">AI identifies your product & fills details automatically!</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Image Upload Area */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                Product Image
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">AI Visual Analysis</span>
              </label>
              {formData.imageUrl && !analyzingImage && (
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Verified & Identified
                </span>
              )}
            </div>
            
            <div 
              onClick={() => !analyzingImage && fileInputRef.current?.click()}
              className={`relative h-72 w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                imageError ? 'border-red-500 bg-red-500/5' : 
                formData.imageUrl ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-700 hover:border-indigo-400 bg-slate-800/50'
              }`}
            >
              {analyzingImage ? (
                <div className="text-center space-y-4 p-8">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <div>
                    <p className="text-indigo-400 text-sm font-bold animate-pulse">
                      {magicFill ? 'AI is identifying your product...' : 'Verifying safety...'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-2">Hang tight, we're writing your ad details!</p>
                  </div>
                </div>
              ) : formData.imageUrl ? (
                <>
                  <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <span className="bg-white text-slate-900 px-6 py-2 rounded-full font-bold text-sm shadow-xl">Change Image</span>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-3 px-8">
                  <div className={`p-5 rounded-full mx-auto w-fit transition-all duration-500 ${imageError ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-200 font-bold text-lg">Magic Image Upload</p>
                    <p className="text-xs text-slate-500 mt-1">Upload and let AI do the rest!</p>
                  </div>
                  {imageError && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in zoom-in">
                      <p className="text-red-400 text-xs">{imageError}</p>
                    </div>
                  )}
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-300">Category</label>
              <div className="relative">
                <select 
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as Category})}
                >
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-300">Listing Title</label>
              <div className="relative">
                <input 
                  required
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all pl-10"
                  placeholder="e.g., iPhone 15 Pro Max"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-400">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-bold text-slate-300">Description</label>
              <button 
                type="button"
                onClick={handleSmartDescribe}
                disabled={loading || !formData.title}
                className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 rounded-lg hover:bg-indigo-600/30 font-bold transition-all disabled:opacity-30"
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                {loading ? 'AI Thinking...' : 'AI Refine Description'}
              </button>
            </div>
            <textarea 
              required
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-sm"
              placeholder="Auto-filled from image, feel free to edit..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-300">Asking Price ($)</label>
              <input 
                required
                type="number" 
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="0.00"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-bold text-slate-300">Location</label>
              <input 
                required
                type="text" 
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="e.g., Dubai, UAE"
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-slate-300">Contact Number</label>
            <input 
              required
              type="tel" 
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="+971 50 123 4567"
              value={formData.phoneNumber}
              onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={analyzingImage || loading}
              className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-900/20 transition-all disabled:opacity-50 group"
            >
              {analyzingImage ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  AI Processing...
                </span>
              ) : (
                'Publish Global Listing'
              )}
            </button>
            <p className="text-[10px] text-slate-500 text-center mt-4">
              AI verification ensures a safe and high-quality marketplace.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellProductModal;
