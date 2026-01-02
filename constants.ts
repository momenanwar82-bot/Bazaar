
import { Product, Category, Currency, Review } from './types';

export const CATEGORIES: Category[] = [
  'All',
  'Cars',
  'Phones',
  'Clothing',
  'Games',
  'Electronics',
  'Real Estate',
  'Furniture',
  'Others'
];

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', rate: 1, label: 'US Dollar' },
  { code: 'SAR', symbol: 'SR', rate: 3.75, label: 'Saudi Riyal' },
  { code: 'AED', symbol: 'DH', rate: 3.67, label: 'UAE Dirham' },
  { code: 'EGP', symbol: 'E£', rate: 48.50, label: 'Egypt Pound' },
  { code: 'EUR', symbol: '€', rate: 0.92, label: 'Euro' },
];

const createReview = (name: string, rating: number, comment: string): Review => ({
  id: Math.random().toString(36).substr(2, 9),
  userName: name,
  rating,
  comment,
  timestamp: new Date(Date.now() - Math.random() * 1000000000)
});

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Tesla Model S Plaid 2024',
    description: 'All-electric Tesla, amazing acceleration, Autopilot system, mint condition.',
    price: 89000,
    category: 'Cars',
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
    location: 'New York, USA',
    createdAt: new Date(),
    sellerName: 'James Smith',
    phoneNumber: '+12125550199',
    rating: 4.9,
    reviewsCount: 3,
    reviews: [
      createReview("Michael R.", 5, "Unbelievable acceleration! Worth every penny."),
      createReview("Sarah K.", 5, "Car is exactly as described. Clean interior."),
      createReview("John D.", 4, "Great car, though delivery took a bit long.")
    ]
  },
  {
    id: '2',
    title: 'iPhone 15 Pro Max 512GB',
    description: 'iPhone 15 Pro Max, Black Titanium, unlocked for all global networks.',
    price: 1200,
    category: 'Phones',
    imageUrl: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800',
    location: 'London, UK',
    createdAt: new Date(),
    sellerName: 'Oliver Williams',
    phoneNumber: '+442071234567',
    rating: 4.8,
    reviewsCount: 2,
    reviews: [
      createReview("Emma W.", 5, "Perfect condition. Battery health is 100%."),
      createReview("David L.", 4, "Fast shipping. Original box included.")
    ]
  },
  {
    id: 'c1',
    title: 'Vintage Leather Biker Jacket',
    description: 'Premium distressed black leather jacket. Classic asymmetric zip, heavy-duty hardware. Size Large. Perfect for autumn/winter styles.',
    price: 450,
    category: 'Clothing',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800',
    location: 'Berlin, Germany',
    createdAt: new Date(),
    sellerName: 'Vintage Hub',
    phoneNumber: '+4915212345678',
    rating: 4.5,
    reviewsCount: 1,
    reviews: [
      createReview("Lukas G.", 4, "Beautiful leather. Fits true to size.")
    ]
  },
  {
    id: '3',
    title: 'Luxury Apartment Burj Khalifa View',
    description: 'Fully furnished apartment, 3 bedrooms, panoramic view, private pool and gym.',
    price: 1500000,
    category: 'Real Estate',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800',
    location: 'Dubai, UAE',
    createdAt: new Date(),
    sellerName: 'Gulf Properties',
    phoneNumber: '+97141234567',
    rating: 5.0,
    reviewsCount: 1,
    reviews: [
      createReview("Ahmed M.", 5, "Spectacular view. Highly recommended for investors.")
    ]
  }
];
