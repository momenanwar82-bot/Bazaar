
import React from 'react';

interface LegalModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const ModalWrapper: React.FC<LegalModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
    <div className="bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300 max-h-[85vh]">
      <div className="flex justify-between items-center p-6 border-b border-slate-800">
        <h2 className="text-2xl font-black text-white">{title}</h2>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-8 overflow-y-auto custom-scrollbar text-slate-300 leading-relaxed text-left">
        {children}
      </div>
    </div>
  </div>
);

export const TermsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <ModalWrapper title="Terms & Conditions" onClose={onClose}>
    <div className="space-y-4">
      <p className="font-bold text-white">Welcome to Bazaar. By using our site, you agree to the following terms:</p>
      <ul className="list-disc pl-5 space-y-3">
        <li><strong className="text-slate-100">Content Responsibility:</strong> Sellers are solely responsible for the accuracy of listing data and images.</li>
        <li><strong className="text-slate-100">Prohibited Items:</strong> It is strictly forbidden to list illegal items or those violating global trade laws.</li>
        <li><strong className="text-slate-100">Mediation:</strong> Bazaar is an advertising platform only and does not handle payments or deliveries.</li>
        <li><strong className="text-slate-100">Account Accuracy:</strong> Users must provide valid contact information for verification.</li>
        <li><strong className="text-slate-100">Moderation:</strong> We reserve the right to remove any listing that violates safety policies without notice.</li>
      </ul>
    </div>
  </ModalWrapper>
);

export const PrivacyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <ModalWrapper title="Privacy Policy" onClose={onClose}>
    <div className="space-y-4">
      <p className="text-white font-bold">Bazaar values your privacy and data protection:</p>
      <ul className="list-disc pl-5 space-y-3">
        <li><strong className="text-slate-100">Data Collection:</strong> We collect phone numbers, names, and location to facilitate connections between buyers and sellers.</li>
        <li><strong className="text-slate-100">Security:</strong> We use encryption technologies to protect your info from unauthorized access.</li>
        <li><strong className="text-slate-100">Data Sharing:</strong> We do not sell or rent your personal data to third parties for marketing purposes.</li>
        <li><strong className="text-slate-100">Cookies:</strong> We use cookies to enhance user experience and remember search preferences.</li>
      </ul>
    </div>
  </ModalWrapper>
);

export const ContactModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <ModalWrapper title="Contact Us" onClose={onClose}>
    <div className="space-y-6 text-center">
      <p className="text-lg text-slate-200">We love to hear your suggestions or answer any questions:</p>
      
      <div className="grid grid-cols-1 gap-4">
        <a 
          href="mailto:support@bazaar-global.com"
          className="flex flex-col items-center p-6 bg-slate-800/50 rounded-2xl hover:bg-slate-800 transition-colors border border-slate-700 group"
        >
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-bold text-white">Email Support</span>
          <span className="text-indigo-400 mt-1">support@bazaar-global.com</span>
        </a>
      </div>
    </div>
  </ModalWrapper>
);
