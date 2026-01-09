
import { Product, Category, Review } from './types';

export const CATEGORIES: Category[] = [
  'All',
  'Cars',
  'Phones',
  'Laptops & PCs',
  'Home Appliances',
  'Electronics',
  'Real Estate',
  'Furniture',
  'Clothing',
  'Jewelry',
  'Watches',
  'Sports & Fitness',
  'Games',
  'Tools & DIY',
  'Beauty',
  'Others'
];

export const COUNTRY_CODES = [
  { code: '20', country: 'Egypt', flag: '🇪🇬', iso: 'EG' },
  { code: '966', country: 'Saudi Arabia', flag: '🇸🇦', iso: 'SA' },
  { code: '971', country: 'UAE', flag: '🇦🇪', iso: 'AE' },
  { code: '91', country: 'India', flag: '🇮🇳', iso: 'IN' },
  { code: '86', country: 'China', flag: '🇨🇳', iso: 'CN' },
  { code: '55', country: 'Brazil', flag: '🇧🇷', iso: 'BR' },
  { code: '62', country: 'Indonesia', flag: '🇮🇩', iso: 'ID' },
  { code: '92', country: 'Pakistan', flag: '🇵🇰', iso: 'PK' },
  { code: '234', country: 'Nigeria', flag: '🇳🇬', iso: 'NG' },
  { code: '880', country: 'Bangladesh', flag: '🇧🇩', iso: 'BD' },
  { code: '1', country: 'USA', flag: '🇺🇸', iso: 'US' },
  { code: '81', country: 'Japan', flag: '🇯🇵', iso: 'JP' },
  { code: '52', country: 'Mexico', flag: '🇲🇽', iso: 'MX' },
  { code: '7', country: 'Russia', flag: '🇷🇺', iso: 'RU' },
  { code: '34', country: 'Spain', flag: '🇪🇸', iso: 'ES' },
  { code: '212', country: 'Morocco', flag: '🇲🇦', iso: 'MA' },
  { code: '44', country: 'UK', flag: '🇬🇧', iso: 'GB' },
  { code: '49', country: 'Germany', flag: '🇩🇪', iso: 'DE' },
  { code: '33', country: 'France', flag: '🇫🇷', iso: 'FR' },
  { code: '90', country: 'Turkey', flag: '🇹🇷', iso: 'TR' },
  { code: '39', country: 'Italy', flag: '🇮🇹', iso: 'IT' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Tesla Model S Plaid 2024',
    description: 'All-electric Tesla, amazing acceleration, Autopilot system, mint condition.',
    price: 89000,
    currency: 'USD',
    category: 'Cars',
    imageUrl: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
    location: 'New York, USA',
    createdAt: new Date(),
    sellerName: 'James Smith',
    phoneNumber: '+12125550199',
    rating: 4.9,
    reviewsCount: 3
  },
  {
    id: '2',
    title: 'iPhone 15 Pro Max 512GB',
    description: 'iPhone 15 Pro Max, Black Titanium, unlocked for all global networks.',
    price: 1200,
    currency: '€',
    category: 'Phones',
    imageUrl: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800',
    location: 'London, UK',
    createdAt: new Date(),
    sellerName: 'Oliver Williams',
    phoneNumber: '+442071234567',
    rating: 4.8,
    reviewsCount: 2
  }
];
