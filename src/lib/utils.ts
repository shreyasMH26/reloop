import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Category, ConditionType, ListingType } from '../types';

// ─── Tailwind merge helper ─────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Price formatter (Indian locale, ₹) ───────────────────────────────────────
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Date helpers ──────────────────────────────────────────────────────────────
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months === 1 ? '' : 's'} ago`;
}

// ─── Categories ───────────────────────────────────────────────────────────────
export const CATEGORIES: Category[] = [
  { id: '1', name: 'Electronics', slug: 'electronics', icon: '💻' },
  { id: '2', name: 'Furniture', slug: 'furniture', icon: '🪑' },
  { id: '3', name: 'Clothing', slug: 'clothing', icon: '👗' },
  { id: '4', name: 'Books', slug: 'books', icon: '📚' },
  { id: '5', name: 'Sports', slug: 'sports', icon: '⚽' },
  { id: '6', name: 'Vehicles', slug: 'vehicles', icon: '🚲' },
  { id: '7', name: 'Home & Garden', slug: 'home-garden', icon: '🏡' },
  { id: '8', name: 'Toys & Games', slug: 'toys-games', icon: '🎮' },
  { id: '9', name: 'Music', slug: 'music', icon: '🎵' },
  { id: '10', name: 'Other', slug: 'other', icon: '📦' },
];

// ─── Conditions ───────────────────────────────────────────────────────────────
export const CONDITIONS: { value: ConditionType; label: string; description: string }[] = [
  { value: 'new', label: 'New', description: 'Brand new, never used' },
  { value: 'like_new', label: 'Like New', description: 'Used once or twice, perfect condition' },
  { value: 'good', label: 'Good', description: 'Some use, minor wear' },
  { value: 'fair', label: 'Fair', description: 'Visible wear, fully functional' },
  { value: 'poor', label: 'Poor', description: 'Heavy wear, needs repair' },
];

// ─── Listing types ─────────────────────────────────────────────────────────────
export const LISTING_TYPES: { value: ListingType | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: 'bg-gray-100 text-gray-700' },
  { value: 'sell', label: 'For Sale', color: 'bg-sage-100 text-sage-700' },
  { value: 'rent', label: 'For Rent', color: 'bg-blue-100 text-blue-700' },
  { value: 'exchange', label: 'Exchange', color: 'bg-amber-100 text-amber-700' },
];

// ─── Davanagere areas ──────────────────────────────────────────────────────────
export const DAVANAGERE_AREAS: string[] = [
  'P.J. Extension',
  'Vidyanagar',
  'MCC B Block',
  'MCC A Block',
  'Anjaneya Layout',
  'Nittuvalli',
  'Shamanur Road',
  'Old PB Road',
  'Lokikere Road',
  'Mandipet',
  'Kondajji',
  'Basha Nagar',
  'Davanagere North',
  'Davanagere South',
  'Harihara Road',
  'Shimoga Road',
];

// ─── Condition color helper ────────────────────────────────────────────────────
export function conditionColor(condition: ConditionType): string {
  const map: Record<ConditionType, string> = {
    new: 'bg-emerald-100 text-emerald-700',
    like_new: 'bg-green-100 text-green-700',
    good: 'bg-yellow-100 text-yellow-700',
    fair: 'bg-orange-100 text-orange-700',
    poor: 'bg-red-100 text-red-700',
  };
  return map[condition] ?? 'bg-gray-100 text-gray-600';
}

export function listingTypeColor(type: ListingType): string {
  const map: Record<ListingType, string> = {
    sell: 'bg-[#3d7f60]/10 text-[#3d7f60]',
    rent: 'bg-blue-100 text-blue-700',
    exchange: 'bg-amber-100 text-amber-700',
  };
  return map[type] ?? 'bg-gray-100 text-gray-600';
}

export function listingTypeLabel(type: ListingType): string {
  return { sell: 'For Sale', rent: 'For Rent', exchange: 'Exchange' }[type];
}

export function conditionLabel(c: ConditionType): string {
  return CONDITIONS.find((x) => x.value === c)?.label ?? c;
}
