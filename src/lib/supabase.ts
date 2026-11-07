import { createClient } from '@supabase/supabase-js'

// ===== Environment Variable Validation =====
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!supabaseUrl || supabaseUrl === 'undefined') {
  console.warn(
    '[ReLoop] VITE_SUPABASE_URL is not set. ' +
    'Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
    'Supabase calls will fail until this is configured.'
  )
}

if (!supabaseAnonKey || supabaseAnonKey === 'undefined') {
  console.warn(
    '[ReLoop] VITE_SUPABASE_ANON_KEY is not set. ' +
    'Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. ' +
    'Supabase calls will fail until this is configured.'
  )
}

// Use placeholder values so the client initializes without throwing;
// actual requests will return errors that callers handle gracefully.
const resolvedUrl = supabaseUrl || 'https://placeholder.supabase.co'
const resolvedKey = supabaseAnonKey || 'placeholder-anon-key'

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'undefined' && 
  supabaseAnonKey !== 'undefined' && 
  !supabaseUrl.includes('placeholder')
)

// ===== Supabase Client =====
export const supabase = createClient(resolvedUrl, resolvedKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'reloop-auth',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// ===== Database Type Placeholder =====
// Replace with generated types from `supabase gen types typescript`
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string
          avatar_url: string | null
          bio: string | null
          phone: string | null
          location: string | null
          area: string | null
          rating: number
          total_ratings: number
          total_listings: number
          total_transactions: number
          role: 'user' | 'admin'
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          location?: string | null
          area?: string | null
          rating?: number
          total_ratings?: number
          total_listings?: number
          total_transactions?: number
          role?: 'user' | 'admin'
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          avatar_url?: string | null
          bio?: string | null
          phone?: string | null
          location?: string | null
          area?: string | null
          rating?: number
          total_ratings?: number
          total_listings?: number
          total_transactions?: number
          role?: 'user' | 'admin'
          is_verified?: boolean
          updated_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          category_id: string
          condition: string
          listing_type: string
          status: string
          seller_id: string
          primary_image: string | null
          location: string
          area: string
          lat: number | null
          lng: number | null
          rental_price_per_day: number | null
          min_rental_days: number | null
          max_rental_days: number | null
          exchange_for: string | null
          additional_payment: number | null
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          price: number
          category_id: string
          condition: string
          listing_type: string
          status?: string
          seller_id: string
          primary_image?: string | null
          location: string
          area: string
          lat?: number | null
          lng?: number | null
          rental_price_per_day?: number | null
          min_rental_days?: number | null
          max_rental_days?: number | null
          exchange_for?: string | null
          additional_payment?: number | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          price?: number
          category_id?: string
          condition?: string
          listing_type?: string
          status?: string
          seller_id?: string
          primary_image?: string | null
          location?: string
          area?: string
          lat?: number | null
          lng?: number | null
          rental_price_per_day?: number | null
          min_rental_days?: number | null
          max_rental_days?: number | null
          exchange_for?: string | null
          additional_payment?: number | null
          view_count?: number
          updated_at?: string
        }
      }
      listing_images: {
        Row: {
          id: string
          listing_id: string
          url: string
          public_id: string
          is_primary: boolean
          order_index: number
        }
        Insert: {
          id?: string
          listing_id: string
          url: string
          public_id: string
          is_primary?: boolean
          order_index?: number
        }
        Update: {
          id?: string
          listing_id?: string
          url?: string
          public_id?: string
          is_primary?: boolean
          order_index?: number
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string
          description: string | null
          listing_count: number | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon: string
          description?: string | null
          listing_count?: number | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string
          description?: string | null
          listing_count?: number | null
        }
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          listing_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          listing_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          listing_id?: string
        }
      }
      conversations: {
        Row: {
          id: string
          listing_id: string | null
          participant_1_id: string
          participant_2_id: string
          last_message: string | null
          last_message_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id?: string | null
          participant_1_id: string
          participant_2_id: string
          last_message?: string | null
          last_message_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string | null
          participant_1_id?: string
          participant_2_id?: string
          last_message?: string | null
          last_message_at?: string | null
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
        }
      }
      rental_requests: {
        Row: {
          id: string
          listing_id: string
          renter_id: string
          owner_id: string
          start_date: string
          end_date: string
          total_days: number
          total_price: number
          status: string
          message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          renter_id: string
          owner_id: string
          start_date: string
          end_date: string
          total_days: number
          total_price: number
          status?: string
          message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          renter_id?: string
          owner_id?: string
          start_date?: string
          end_date?: string
          total_days?: number
          total_price?: number
          status?: string
          message?: string | null
          updated_at?: string
        }
      }
      exchange_proposals: {
        Row: {
          id: string
          listing_id: string
          proposer_id: string
          owner_id: string
          offered_listing_id: string | null
          offer_description: string
          additional_payment: number | null
          status: string
          message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          proposer_id: string
          owner_id: string
          offered_listing_id?: string | null
          offer_description: string
          additional_payment?: number | null
          status?: string
          message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          proposer_id?: string
          owner_id?: string
          offered_listing_id?: string | null
          offer_description?: string
          additional_payment?: number | null
          status?: string
          message?: string | null
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          link: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          link?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          link?: string | null
          is_read?: boolean
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          listing_id: string
          reason: string
          description: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          listing_id: string
          reason: string
          description?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          listing_id?: string
          reason?: string
          description?: string | null
          status?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export default supabase
