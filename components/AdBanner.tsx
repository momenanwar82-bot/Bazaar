
import React from 'react';

interface AdBannerProps {
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ className = "" }) => {
  return (
    <div className={`relative h-[160px] rounded-[40px] border border-dashed border-white/10 flex flex-col items-center justify-center p-8 text-center bg-[#0b1121]/40 ${className}`}>
      
      {/* Top markers */}
      <div className="absolute top-4 left-0 right-0 flex justify-center gap-10">
        <div className="w-1.5 h-1.5 bg-[#4f46e5] rounded-full opacity-50"></div>
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Global Ad Network</span>
        <div className="w-1.5 h-1.5 bg-[#4f46e5] rounded-full opacity-50"></div>
      </div>
      
      <div className="space-y-2 mt-4">
        <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tighter">
          Boost Your Sales with <span className="text-[#4f46e5]">Bazaar Premium</span>
        </h2>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          Verified listings reach 10x more potential buyers
        </p>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-6 left-6 w-4 h-4 border-t border-l border-white/10 rounded-tl-xl"></div>
      <div className="absolute bottom-6 right-6 w-4 h-4 border-b border-r border-white/10 rounded-br-xl"></div>
    </div>
  );
};

export default AdBanner;
