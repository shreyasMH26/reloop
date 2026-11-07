// ─── Core Types ───────────────────────────────────────────────────────────────

export type ListingType = 'sell' | 'rent' | 'exchange';
export type ConditionType = 'new' | 'like_new' | 'good' | 'fair' | 'poor';
export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  area?: string;
  bio?: string;
  role: UserRole;
  rating?: number;
  total_listings?: number;
  is_verified?: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  listing_type: ListingType;
  condition: ConditionType;
  category_id: string;
  category?: Category;
  area: string;
  images: string[];
  seller_id: string;
  seller?: Profile;
  views: number;
  is_active: boolean;
  // Rent-specific
  price_per_day?: number;
  min_rental_days?: number;
  // Exchange-specific
  exchange_for?: string;
  additional_payment?: number;
  created_at: string;
  updated_at: string;
}

export interface ListingFilters {
  search?: string;
  category?: string;
  listing_type?: ListingType | 'all';
  condition?: ConditionType[] | ConditionType | string;
  min_price?: number;
  max_price?: number;
  area?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  seller_id?: string;
}

export interface PaginatedListings {
  data: Listing[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface Message {
  id: string;
  listing_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface RentalRequest {
  listing_id: string;
  start_date: string;
  end_date: string;
  message?: string;
}

export interface ExchangeProposal {
  listing_id: string;
  offering_description: string;
  additional_payment?: number;
  message?: string;
}

export interface ReportReason {
  value: string;
  label: string;
}

export interface SustainabilityStats {
  total_reused_items: number;
  total_exchanges: number;
  total_rentals: number;
  estimated_items_diverted: number;
  total_users: number;
  total_listings: number;
  co2_saved_estimate_kg: number;
}
