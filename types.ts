
export type Category = 'All' | 'Cars' | 'Phones' | 'Laptops & PCs' | 'Home Appliances' | 'Electronics' | 'Real Estate' | 'Furniture' | 'Clothing' | 'Jewelry' | 'Watches' | 'Sports & Fitness' | 'Games' | 'Tools & DIY' | 'Beauty' | 'Others';

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment?: string;
  timestamp: Date;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number; 
  currency: string; // The seller types this manually (e.g., "E£", "SR", "$")
  category: Category;
  imageUrl: string;
  location: string;
  createdAt: Date;
  postDate?: string; 
  sellerName: string;
  sellerEmail?: string; 
  phoneNumber: string;
  rating?: number;
  reviewsCount?: number;
  reviews?: Review[];
}

export interface SellerNotification {
  id: string;
  sellerEmail: string;
  productTitle: string;
  type: 'quality_removal' | 'new_review';
  message: string;
  timestamp: Date;
  isRead: boolean;
}

// ChatMessage represents a single message in a conversation thread
export interface ChatMessage {
  sender: string;
  text: string;
  timestamp: Date;
  status?: 'sent' | 'read';
}

// Chat represents a conversation thread between a buyer and a seller for a specific product
export interface Chat {
  id: string;
  sellerName: string;
  productTitle: string;
  productImage: string;
  lastMessage: string;
  unread: boolean;
  messages: ChatMessage[];
}
