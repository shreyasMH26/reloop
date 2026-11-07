import { useState, useEffect, useCallback, useRef } from 'react';
import type { Listing, ListingFilters, PaginatedListings } from '../types';
import { CATEGORIES, DAVANAGERE_AREAS } from './utils';

// ─── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_SELLERS = [
  { id: 'u1', full_name: 'Priya Sharma', avatar_url: '', role: 'user' as const, rating: 4.8, total_listings: 12, created_at: '2024-01-15T10:00:00Z' },
  { id: 'u2', full_name: 'Rahul Verma', avatar_url: '', role: 'user' as const, rating: 4.5, total_listings: 7, created_at: '2024-03-22T10:00:00Z' },
  { id: 'u3', full_name: 'Deepa Nair', avatar_url: '', role: 'user' as const, rating: 4.9, total_listings: 24, created_at: '2023-11-05T10:00:00Z' },
  { id: 'u4', full_name: 'Kiran Kumar', avatar_url: '', role: 'user' as const, rating: 4.2, total_listings: 3, created_at: '2024-06-01T10:00:00Z' },
];

const MOCK_LISTINGS: Listing[] = [
  {
    id: 'l1', title: 'MacBook Pro 14" M2 — Barely Used', description: 'Selling my MacBook Pro 14" M2 chip, 16GB RAM, 512GB SSD. Bought last year, used for 3 months. Comes with original box and charger. No scratches, perfect condition. Reason for selling: upgraded to M3.',
    price: 95000, listing_type: 'sell', condition: 'like_new', category_id: '1', category: CATEGORIES[0],
    area: 'P.J. Extension', images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80'],
    seller_id: 'u1', seller: MOCK_SELLERS[0], views: 234, is_active: true, created_at: '2026-11-04T10:00:00Z', updated_at: '2026-11-04T10:00:00Z',
  },
  {
    id: 'l2', title: 'Vintage Teak Wood Dining Table', description: 'Beautiful solid teak wood dining table, seats 6. Some minor scratches on the surface but structurally very sound. Perfect for a rustic or traditional home interior.',
    price: 18000, listing_type: 'sell', condition: 'good', category_id: '2', category: CATEGORIES[1],
    area: 'Vidyanagar', images: ['https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80'],
    seller_id: 'u2', seller: MOCK_SELLERS[1], views: 89, is_active: true, created_at: '2026-11-02T10:00:00Z', updated_at: '2026-11-02T10:00:00Z',
  },
  {
    id: 'l3', title: 'Canon EOS 200D DSLR + 18-55mm Lens', description: 'Canon EOS 200D with kit lens. Shutter count under 5000. Great for beginners and hobbyists. Comes with 2 batteries, charger, 32GB SD card, and bag.',
    price: 350, price_per_day: 350, min_rental_days: 2, listing_type: 'rent', condition: 'good', category_id: '1', category: CATEGORIES[0],
    area: 'MCC B Block', images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80'],
    seller_id: 'u3', seller: MOCK_SELLERS[2], views: 412, is_active: true, created_at: '2026-11-01T10:00:00Z', updated_at: '2026-11-01T10:00:00Z',
  },
  {
    id: 'l4', title: 'Trek Mountain Bike (21-speed)', description: 'Trek Marlin 5 mountain bike, 21 speed, 29" wheels. Serviced recently. Light rust on chain but otherwise excellent. Great for city commutes or trail riding.',
    price: 12000, listing_type: 'exchange', condition: 'fair', category_id: '6', category: CATEGORIES[5],
    area: 'Shamanur Road', images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80'],
    seller_id: 'u4', seller: MOCK_SELLERS[3], views: 67, is_active: true, exchange_for: 'Road bike or acoustic guitar', additional_payment: 2000,
    created_at: '2026-10-30T10:00:00Z', updated_at: '2026-10-30T10:00:00Z',
  },
  {
    id: 'l5', title: 'Sony WH-1000XM5 Noise Cancelling Headphones', description: 'Sony XM5, purchased 6 months ago. Still under warranty. Comes with case and all original accessories. Sound quality is superb. Selling because I prefer earbuds now.',
    price: 22000, listing_type: 'sell', condition: 'like_new', category_id: '1', category: CATEGORIES[0],
    area: 'Nittuvalli', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
    seller_id: 'u1', seller: MOCK_SELLERS[0], views: 178, is_active: true, created_at: '2026-10-28T10:00:00Z', updated_at: '2026-10-28T10:00:00Z',
  },
  {
    id: 'l6', title: 'Complete Engineering Textbooks Set (VTU)', description: 'Full set of VTU engineering textbooks for CSE, 3rd & 4th semester. Slightly highlighted but all readable. Saving you ₹3000+.',
    price: 800, listing_type: 'sell', condition: 'good', category_id: '4', category: CATEGORIES[3],
    area: 'MCC A Block', images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80'],
    seller_id: 'u3', seller: MOCK_SELLERS[2], views: 56, is_active: true, created_at: '2026-10-25T10:00:00Z', updated_at: '2026-10-25T10:00:00Z',
  },
  {
    id: 'l7', title: 'Folding Party Tent — 10x10 ft', description: 'Heavy-duty folding canopy tent, 10x10 ft. Weatherproof. Perfect for events, weddings, stalls. Renting per day. Must pick up and return.',
    price: 500, price_per_day: 500, min_rental_days: 1, listing_type: 'rent', condition: 'good', category_id: '10', category: CATEGORIES[9],
    area: 'Mandipet', images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80'],
    seller_id: 'u2', seller: MOCK_SELLERS[1], views: 93, is_active: true, created_at: '2026-10-20T10:00:00Z', updated_at: '2026-10-20T10:00:00Z',
  },
  {
    id: 'l8', title: 'Infant Walker + Baby Swing Combo', description: 'Barely used baby walker and swing. Baby outgrew them in 3 months. Both in excellent condition. Available for exchange — looking for a stroller.',
    price: 3500, listing_type: 'exchange', condition: 'like_new', category_id: '8', category: CATEGORIES[7],
    area: 'Anjaneya Layout', images: ['https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&q=80'],
    seller_id: 'u4', seller: MOCK_SELLERS[3], views: 44, is_active: true, exchange_for: 'Baby stroller or pram',
    created_at: '2026-10-18T10:00:00Z', updated_at: '2026-10-18T10:00:00Z',
  },
  {
    id: 'l9', title: 'Acoustic Guitar — Fender CD-60S', description: 'Fender CD-60S acoustic guitar. Solid spruce top. Perfect for beginners. Minor cosmetic marks near sound hole. Includes strap, picks, and tuner.',
    price: 7500, listing_type: 'sell', condition: 'good', category_id: '9', category: CATEGORIES[8],
    area: 'Lokikere Road', images: ['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80'],
    seller_id: 'u3', seller: MOCK_SELLERS[2], views: 112, is_active: true, created_at: '2026-10-15T10:00:00Z', updated_at: '2026-10-15T10:00:00Z',
  },
  {
    id: 'l10', title: 'Standing Desk + Ergonomic Chair', description: 'Height-adjustable standing desk (140x70cm) with memory presets. Ergonomic mesh office chair. Bought for home office. Moving abroad, must sell together.',
    price: 25000, listing_type: 'sell', condition: 'good', category_id: '2', category: CATEGORIES[1],
    area: 'Vidyanagar', images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80'],
    seller_id: 'u1', seller: MOCK_SELLERS[0], views: 201, is_active: true, created_at: '2026-10-12T10:00:00Z', updated_at: '2026-10-12T10:00:00Z',
  },
  {
    id: 'l11', title: 'Projector — Epson EB-X51 (3800 lumens)', description: 'Business projector, great for home cinema or presentations. HDMI, VGA ports. Used 20 times total. Comes with carry case and remote.',
    price: 600, price_per_day: 600, min_rental_days: 1, listing_type: 'rent', condition: 'like_new', category_id: '1', category: CATEGORIES[0],
    area: 'P.J. Extension', images: ['https://images.unsplash.com/photo-1626379953822-baec19c3accd?w=800&q=80'],
    seller_id: 'u2', seller: MOCK_SELLERS[1], views: 77, is_active: true, created_at: '2026-10-10T10:00:00Z', updated_at: '2026-10-10T10:00:00Z',
  },
  {
    id: 'l12', title: 'Nike Running Shoes — Size 10 (US)', description: 'Nike Air Zoom Pegasus 39. Worn for 5 runs, almost new. Original box available. Looking to exchange for Nike React or Adidas Ultraboost same size.',
    price: 5500, listing_type: 'exchange', condition: 'like_new', category_id: '3', category: CATEGORIES[2],
    area: 'Shimoga Road', images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80'],
    seller_id: 'u4', seller: MOCK_SELLERS[3], views: 98, is_active: true, exchange_for: 'Nike React or Adidas Ultraboost (Size 10)',
    created_at: '2026-10-08T10:00:00Z', updated_at: '2026-10-08T10:00:00Z',
  },
];

// ─── Listings hook ─────────────────────────────────────────────────────────────
const PER_PAGE = 9;

export function useListings(filters: ListingFilters) {
  const [data, setData] = useState<PaginatedListings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const fetch = useCallback(() => {
    setLoading(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        let results = [...MOCK_LISTINGS];

        // Search
        if (filters.search?.trim()) {
          const q = filters.search.toLowerCase();
          results = results.filter(
            (l) =>
              l.title.toLowerCase().includes(q) ||
              l.description.toLowerCase().includes(q) ||
              l.category?.name.toLowerCase().includes(q),
          );
        }

        // Category
        if (filters.category) {
          results = results.filter((l) => l.category?.slug === filters.category);
        }

        // Listing type
        if (filters.listing_type && filters.listing_type !== 'all') {
          results = results.filter((l) => l.listing_type === filters.listing_type);
        }

        // Condition
        if (filters.condition?.length) {
          results = results.filter((l) => filters.condition!.includes(l.condition));
        }

        // Price range
        if (filters.min_price != null) {
          results = results.filter((l) => l.price >= filters.min_price!);
        }
        if (filters.max_price != null) {
          results = results.filter((l) => l.price <= filters.max_price!);
        }

        // Area
        if (filters.area) {
          results = results.filter((l) => l.area === filters.area);
        }

        // Sort
        if (filters.sort === 'price_asc') results.sort((a, b) => a.price - b.price);
        else if (filters.sort === 'price_desc') results.sort((a, b) => b.price - a.price);
        else results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        const total = results.length;
        const page = filters.page ?? 1;
        const sliced = results.slice((page - 1) * PER_PAGE, page * PER_PAGE);

        setData({
          data: sliced,
          total,
          page,
          per_page: PER_PAGE,
          total_pages: Math.max(1, Math.ceil(total / PER_PAGE)),
        });
        setError(null);
      } catch (e) {
        setError('Failed to load listings');
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [
    filters.search,
    filters.category,
    filters.listing_type,
    JSON.stringify(filters.condition),
    filters.min_price,
    filters.max_price,
    filters.area,
    filters.sort,
    filters.page,
  ]);

  useEffect(() => {
    fetch();
    return () => clearTimeout(timerRef.current);
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

// ─── Single listing hook ───────────────────────────────────────────────────────
export function useListing(id: string) {
  const [data, setData] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const listing = MOCK_LISTINGS.find((l) => l.id === id) ?? null;
      setData(listing);
      setError(listing ? null : 'Listing not found');
      setLoading(false);
    }, 400);
  }, [id]);

  return { data, loading, error };
}

// ─── Similar listings ──────────────────────────────────────────────────────────
export function useSimilarListings(listing: Listing | null) {
  if (!listing) return [];
  return MOCK_LISTINGS.filter(
    (l) => l.id !== listing.id && l.category_id === listing.category_id,
  ).slice(0, 4);
}

// ─── Wishlist (localStorage-based) ────────────────────────────────────────────
const WL_KEY = 'reloop_wishlist';

export function getWishlist(): string[] {
  try {
    return JSON.parse(localStorage.getItem(WL_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function toggleWishlist(listingId: string): boolean {
  const wl = getWishlist();
  const idx = wl.indexOf(listingId);
  if (idx >= 0) {
    wl.splice(idx, 1);
  } else {
    wl.push(listingId);
  }
  localStorage.setItem(WL_KEY, JSON.stringify(wl));
  return idx < 0; // true = added
}

export function isWishlisted(listingId: string): boolean {
  return getWishlist().includes(listingId);
}
