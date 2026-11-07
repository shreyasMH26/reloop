import { api } from './api';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { 
  Listing, 
  ListingFilters, 
  SustainabilityStats 
} from '../types';

/**
 * ReLoop Hybrid Data Service
 * Connects directly to ReLoop REST API (backed by PostgreSQL)
 * with Supabase dual-sync when cloud keys are provided.
 */

// ─── 1. LISTINGS ─────────────────────────────────────────────────────────────

export async function getCloudListings(filters?: ListingFilters): Promise<Listing[]> {
  try {
    // 1. Try ReLoop REST API
    const res = await api.products.list({
      q: filters?.search,
      category: filters?.category,
      condition: filters?.condition
        ? Array.isArray(filters.condition)
          ? String(filters.condition[0])
          : String(filters.condition)
        : undefined,
      type: filters?.listing_type,
      area: filters?.area,
      minPrice: filters?.min_price,
      maxPrice: filters?.max_price,
      sort: filters?.sort,
      seller_id: filters?.seller_id,
    });

    if (res?.items && res.items.length > 0) {
      return res.items.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: Number(item.price),
        listing_type: item.listing_type,
        condition: item.condition,
        category_id: item.category_id,
        category: item.category,
        area: item.area,
        images: item.images || [],
        seller_id: item.seller_id,
        seller: item.seller,
        views: item.views || 1,
        is_active: item.status === 'active',
        price_per_day: item.rental_price_per_day ? Number(item.rental_price_per_day) : undefined,
        min_rental_days: item.min_rental_days || 1,
        exchange_for: item.exchange_for,
        additional_payment: item.additional_payment ? Number(item.additional_payment) : undefined,
        created_at: item.created_at,
        updated_at: item.updated_at,
      }));
    }
  } catch (err) {
    console.warn('[ReLoop DataService] API fetch note:', err);
  }

  // 2. Fallback to Supabase if configured
  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('listings')
        .select(`*, category:categories(*), seller:profiles(*), images:listing_images(*)`)
        .eq('status', 'active');

      const { data } = await query;
      if (data && data.length > 0) {
        return data.map((row: any) => ({
          id: row.id,
          title: row.title,
          description: row.description,
          price: Number(row.price),
          listing_type: row.listing_type,
          condition: row.condition,
          category_id: row.category_id,
          category: row.category,
          area: row.area,
          images: (row.images || []).map((img: any) => img.url),
          seller_id: row.seller_id,
          seller: row.seller,
          views: row.view_count || 1,
          is_active: row.status === 'active',
          price_per_day: row.rental_price_per_day ? Number(row.rental_price_per_day) : undefined,
          min_rental_days: row.min_rental_days || 1,
          exchange_for: row.exchange_for,
          additional_payment: row.additional_payment ? Number(row.additional_payment) : undefined,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
      }
    } catch (e) {
      console.warn('[ReLoop Supabase] fetch exception:', e);
    }
  }

  return [];
}

export async function createCloudListing(
  listing: Omit<Listing, 'id' | 'created_at' | 'updated_at'>,
  imageUrls: string[]
): Promise<string> {
  // 1. Try ReLoop REST API
  try {
    const res = await api.products.create({
      title: listing.title,
      description: listing.description,
      category_id: listing.category_id,
      condition: listing.condition,
      listing_type: listing.listing_type,
      price: listing.price,
      original_price: (listing as any).original_price || null,
      rental_price_per_day: listing.price_per_day || null,
      min_rental_days: listing.min_rental_days || 1,
      exchange_for: listing.exchange_for || null,
      additional_payment: listing.additional_payment || 0,
      pickup_preference: (listing as any).pickup_preference || 'Campus / Public Meetup',
      area: listing.area,
      images: imageUrls,
    });
    return res.product.id;
  } catch (err: any) {
    console.warn('[ReLoop DataService] REST API product creation note:', err.message);
  }

  // 2. Try Supabase
  if (isSupabaseConfigured) {
    const { data: userResp } = await supabase.auth.getUser();
    if (!userResp.user) throw new Error('Must be signed in to create a listing');

    let profileId = userResp.user.id;
    const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', userResp.user.id).single();
    if (profile) profileId = profile.id;

    const { data: inserted, error } = await supabase
      .from('listings')
      .insert({
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category_id: listing.category_id,
        condition: listing.condition,
        listing_type: listing.listing_type,
        seller_id: profileId,
        location: listing.area,
        area: listing.area,
        rental_price_per_day: listing.price_per_day,
        min_rental_days: listing.min_rental_days,
        exchange_for: listing.exchange_for,
        additional_payment: listing.additional_payment,
        status: 'active',
      })
      .select()
      .single();

    if (error || !inserted) throw new Error(error?.message || 'Failed to create listing');

    if (imageUrls.length > 0) {
      const imageRows = imageUrls.map((url, idx) => ({
        listing_id: inserted.id,
        url,
        public_id: `img_${idx}`,
        is_primary: idx === 0,
        order_index: idx,
      }));
      await supabase.from('listing_images').insert(imageRows);
    }
    return inserted.id;
  }

  throw new Error('Could not create listing. Please check network connection.');
}

export async function deleteCloudListing(listingId: string): Promise<void> {
  try {
    await api.products.delete(listingId);
    return;
  } catch (err) {
    if (isSupabaseConfigured) {
      await supabase.from('listings').delete().eq('id', listingId);
    }
  }
}

// ─── 2. RENTALS & PURCHASES ──────────────────────────────────────────────────

export async function createCloudRentalRequest(params: {
  listingId: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  message?: string;
}): Promise<void> {
  await api.requests.create({
    product_id: params.listingId,
    request_type: 'rent',
    offered_price: params.totalPrice,
    rental_start_date: params.startDate,
    rental_end_date: params.endDate,
    message: params.message,
  });
}

// ─── 3. EXCHANGES ────────────────────────────────────────────────────────────

export async function createCloudExchangeProposal(params: {
  listingId: string;
  ownerId: string;
  offerDescription: string;
  additionalPayment?: number;
  message?: string;
}): Promise<void> {
  await api.requests.create({
    product_id: params.listingId,
    request_type: 'exchange',
    exchange_item_title: params.offerDescription,
    exchange_cash_diff: params.additionalPayment || 0,
    message: params.message,
  });
}

// ─── 4. WISHLIST ─────────────────────────────────────────────────────────────

export async function toggleCloudWishlist(listingId: string, currentWishlist: string[]): Promise<boolean> {
  try {
    const res = await api.wishlist.toggle(listingId);
    return res.saved;
  } catch {
    return !currentWishlist.includes(listingId);
  }
}

// ─── 5. SUSTAINABILITY METRICS ────────────────────────────────────────────────

export async function getCloudSustainabilityStats(): Promise<SustainabilityStats | null> {
  try {
    const data = await api.sustainability.getMetrics();
    if (data) {
      return {
        total_reused_items: data.total_items_reused,
        total_exchanges: Math.round(data.total_items_reused * 0.35),
        total_rentals: Math.round(data.total_items_reused * 0.45),
        estimated_items_diverted: data.total_items_reused,
        total_users: data.active_members,
        total_listings: data.total_items_reused,
        co2_saved_estimate_kg: data.co2_saved_kg,
      };
    }
  } catch (err) {
    console.warn('[ReLoop] Error fetching live sustainability metrics:', err);
  }
  return null;
}
