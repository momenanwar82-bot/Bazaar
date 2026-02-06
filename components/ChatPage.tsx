
import React from 'react';
import UserSummaryModal from './UserSummaryModal';
import { Product, SellerNotification } from '../types';

interface ChatPageProps {
  user: { name: string; email: string };
  userProducts: Product[];
  wishlistedProducts: Product[];
  notifications: SellerNotification[];
  onClose: () => void;
  onLogout: () => void;
  onProductClick: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onClearNotification: (id: string) => void;
  remainingAds: number;
  currentUserEmail: string;
  onRefresh: () => Promise<void>;
}

const ChatPage: React.FC<ChatPageProps> = (props) => {
  return (
    <div className="flex-1 bg-slate-950 flex flex-col items-center p-4 sm:p-8 overflow-y-auto">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10 space-y-3">
           <div className="w-20 h-20 bg-indigo-600/10 rounded-[32px] flex items-center justify-center mx-auto text-indigo-500 border border-indigo-500/20 shadow-[0_0_50px_rgba(79,70,229,0.15)]">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
           </div>
           <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Bazaar Inbox</h2>
           <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] opacity-60">Professional Secure Channel</p>
        </div>

        <UserSummaryModal 
           {...props} 
           initialTab="chats" 
           onClose={() => window.history.back()}
           isFullPage={true}
        />
      </div>
    </div>
  );
};

export default ChatPage;
