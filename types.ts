
export type Category = 'All' | 'Cars' | 'Phones' | 'Clothing' | 'Games' | 'Electronics' | 'Real Estate' | 'Furniture' | 'Others';

export type CurrencyCode = 'USD' | 'SAR' | 'AED' | 'EGP' | 'EUR';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  rate: number; // Rate relative to USD
  label: string;
}

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
  price: number; // Always stored in USD
  category: Category;
  imageUrl: string;
  location: string;
  createdAt: Date;
  sellerName: string;
  sellerEmail?: string; // Links product to a specific registered account
  phoneNumber: string;
  rating?: number;
  reviewsCount?: number;
  reviews?: Review[];
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'read';
}

export interface Chat {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  sellerName: string;
  lastMessage: string;
  messages: ChatMessage[];
  unread: boolean;
}
