
import React, { useState } from 'react';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (email: string, name: string) => void;
  hideCloseButton?: boolean;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin, hideCloseButton = false }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى إدخال اسم المستخدم');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    onLogin(email, name);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-3xl overflow-y-auto">
      <div className="bg-slate-900 w-full max-w-md rounded-[48px] shadow-2xl border border-white/5 overflow-hidden animate-in fade-in zoom-in duration-700 my-auto">
        {/* Decorative Header */}
        <div className="h-44 bg-gradient-to-br from-indigo-600 to-indigo-800 flex flex-col items-center justify-center relative overflow-hidden">
          {!hideCloseButton && (
            <div className="absolute top-6 right-6">
              <button onClick={onClose} className="p-2.5 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all backdrop-blur-md border border-white/10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          {/* Logo in Login */}
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl mb-4 transition-transform hover:scale-110 duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-11 w-11 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-white font-black text-xl uppercase tracking-[0.25em]">Bazaar Global</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-10 pt-12 space-y-10">
          <div className="text-center">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-3">Create Account</h3>
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">Join the premium community</p>
          </div>

          <div className="space-y-6">
            {/* Username Input */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Username / اسم المستخدم</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"/></svg>
                </span>
                <input 
                  required
                  type="text" 
                  className={`w-full pl-14 pr-6 py-5 rounded-3xl bg-slate-800/50 border ${error.includes('اسم') ? 'border-red-500' : 'border-white/5'} focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-bold text-white text-base placeholder-slate-700`}
                  placeholder="Enter your name"
                  value={name}
                  onChange={e => { setName(e.target.value); setError(''); }}
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email / البريد الإلكتروني</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-600 group-focus-within:text-indigo-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"/></svg>
                </span>
                <input 
                  required
                  type="email" 
                  className={`w-full pl-14 pr-6 py-5 rounded-3xl bg-slate-800/50 border ${error.includes('بريد') ? 'border-red-500' : 'border-white/5'} focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all font-bold text-white text-base placeholder-slate-700`}
                  placeholder="example@bazaar.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
              <p className="text-red-400 text-[10px] text-center font-black uppercase tracking-widest animate-pulse">{error}</p>
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit"
              className="w-full py-5.5 bg-indigo-600 text-white rounded-[28px] font-black text-sm uppercase tracking-[0.2em] hover:bg-indigo-700 shadow-2xl shadow-indigo-900/40 transition-all active:scale-[0.97] border border-white/10"
            >
              Start Trading
            </button>
          </div>

          <div className="text-center space-y-4">
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
              By entering Bazaar, you agree to our <br/>
              <span className="text-indigo-400 cursor-pointer hover:underline">Terms & Security Policy</span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
