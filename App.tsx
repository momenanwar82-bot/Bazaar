import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './عناصر/Navbar';
import Footer from './عناصر/Footer';
import ProductCard from './عناصر/ProductCard';
import ChatPage from './عناصر/ChatManager'; // استخدمنا ChatManager كصفحة شات مؤقتاً

// لو عندك صفحة Home منفصلة استوردها، لو الإعلانات في App.tsx مباشرة سيبها
// هفترض إن عندك مكون بيعرض الإعلانات اسمه Home
const Home = ({ products }: { products: any[] }) => (
  <main className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products?.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  </main>
);

function App() {
  // هنا المفروض يكون عندك الـ State بتاعة الإعلانات (products)
  // والـ State بتاعة المستخدم (user) من Firebase
  
  return (
    <Router>
      <div className="min-h-screen bg-[#050505] text-white font-sans">
        <Navbar />
        
        <Routes>
          {/* الصفحة الرئيسية */}
          <Route path="/" element={<Home products={[]} />} /> 
          
          {/* صفحة الشات المباشر */}
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
