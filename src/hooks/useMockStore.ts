// ─── Shared in-memory + localStorage mock data store ─────────────────────────
import { useState, useEffect, useCallback } from 'react'
import type { Listing, Profile } from '../types'

const STORE_KEY = 'reloop_mock_store'

export interface MockMessage {
  id: string
  conversation_id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  listing_id?: string
  listing_title?: string
}

export interface MockConversation {
  id: string
  listing_id?: string
  listing_title?: string
  participant_ids: string[]
  last_message?: string
  last_message_at?: string
  unread_count?: Record<string, number>
}

export interface MockRentalRequest {
  id: string
  listing_id: string
  listing_title: string
  listing_image?: string
  owner_id: string
  renter_id: string
  renter_name: string
  renter_avatar?: string
  owner_name: string
  start_date: string
  end_date: string
  price_per_day: number
  total_price: number
  message?: string
  status: 'pending' | 'approved' | 'active' | 'completed' | 'rejected'
  created_at: string
}

export interface MockExchangeProposal {
  id: string
  listing_id: string
  listing_title: string
  listing_image?: string
  proposer_id: string
  owner_id: string
  proposer_name: string
  owner_name: string
  offering_description: string
  additional_payment?: number
  message?: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface MockPurchaseRequest {
  id: string
  listing_id: string
  listing_title: string
  listing_image?: string
  buyer_id: string
  seller_id: string
  price: number
  message?: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  created_at: string
  type: 'buy' | 'rent' | 'exchange'
}

export interface MockStore {
  listings: Listing[]
  wishlists: Record<string, string[]> // userId -> listingIds
  messages: MockMessage[]
  conversations: MockConversation[]
  rentalRequests: MockRentalRequest[]
  exchangeProposals: MockExchangeProposal[]
  purchaseRequests: MockPurchaseRequest[]
}

function getDefaultStore(): MockStore {
  return {
    listings: SEED_LISTINGS,
    wishlists: {},
    messages: SEED_MESSAGES,
    conversations: SEED_CONVERSATIONS,
    rentalRequests: SEED_RENTALS,
    exchangeProposals: SEED_EXCHANGES,
    purchaseRequests: SEED_PURCHASES,
  }
}

function readStore(): MockStore {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return getDefaultStore()
    return { ...getDefaultStore(), ...JSON.parse(raw) }
  } catch {
    return getDefaultStore()
  }
}

function writeStore(store: MockStore) {
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

// ─── Seed data ────────────────────────────────────────────────────────────────

export const SEED_LISTINGS: Listing[] = [
  {
    id: 'l1',
    title: 'Nikon D3500 DSLR Camera',
    description: 'Excellent condition DSLR with 18-55mm kit lens.',
    price: 22000,
    listing_type: 'sell',
    condition: 'like_new',
    category_id: '1',
    area: 'Vidyanagar',
    images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80'],
    seller_id: 'user_seed_1',
    views: 142,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'l2',
    title: 'Vintage Wooden Study Desk',
    description: 'Solid teak wood desk, minor scratches. Great for WFH.',
    price: 4500,
    listing_type: 'sell',
    condition: 'good',
    category_id: '2',
    area: 'P.J. Extension',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80'],
    seller_id: 'user_seed_1',
    views: 87,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'l3',
    title: 'Canon EOS Rebel T7',
    description: 'Available for short-term rentals. Perfect for events.',
    price: 500,
    price_per_day: 500,
    min_rental_days: 1,
    listing_type: 'rent',
    condition: 'good',
    category_id: '1',
    area: 'MCC B Block',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80'],
    seller_id: 'user_seed_2',
    views: 55,
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
]

const SEED_CONVERSATIONS: MockConversation[] = [
  {
    id: 'conv1',
    listing_id: 'l1',
    listing_title: 'Nikon D3500 DSLR Camera',
    participant_ids: ['user_seed_1', 'user_seed_2'],
    last_message: 'Is it still available?',
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    unread_count: { user_seed_1: 1 },
  },
]

const SEED_MESSAGES: MockMessage[] = [
  {
    id: 'm1',
    conversation_id: 'conv1',
    sender_id: 'user_seed_2',
    receiver_id: 'user_seed_1',
    content: 'Hi, is the Nikon D3500 still available?',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    listing_id: 'l1',
    listing_title: 'Nikon D3500 DSLR Camera',
  },
  {
    id: 'm2',
    conversation_id: 'conv1',
    sender_id: 'user_seed_1',
    receiver_id: 'user_seed_2',
    content: 'Yes, still available! When would you like to meet?',
    created_at: new Date(Date.now() - 3700000).toISOString(),
  },
  {
    id: 'm3',
    conversation_id: 'conv1',
    sender_id: 'user_seed_2',
    receiver_id: 'user_seed_1',
    content: 'Is it still available?',
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
]

const SEED_RENTALS: MockRentalRequest[] = [
  {
    id: 'r1',
    listing_id: 'l3',
    listing_title: 'Canon EOS Rebel T7',
    listing_image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80',
    owner_id: 'user_seed_2',
    renter_id: 'user_seed_1',
    renter_name: 'Demo User',
    owner_name: 'Jane Doe',
    start_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    price_per_day: 500,
    total_price: 1500,
    message: 'Need for a college event',
    status: 'pending',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
]

const SEED_EXCHANGES: MockExchangeProposal[] = [
  {
    id: 'e1',
    listing_id: 'l1',
    listing_title: 'Nikon D3500 DSLR Camera',
    listing_image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80',
    proposer_id: 'user_seed_2',
    owner_id: 'user_seed_1',
    proposer_name: 'Jane Doe',
    owner_name: 'Demo User',
    offering_description: 'Sony A6000 mirrorless camera with 16-50mm lens',
    additional_payment: 5000,
    message: 'My Sony is in excellent condition. Would love to swap!',
    status: 'pending',
    created_at: new Date(Date.now() - 43200000).toISOString(),
  },
]

const SEED_PURCHASES: MockPurchaseRequest[] = [
  {
    id: 'p1',
    listing_id: 'l2',
    listing_title: 'Vintage Wooden Study Desk',
    listing_image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    buyer_id: 'user_seed_2',
    seller_id: 'user_seed_1',
    price: 4500,
    message: 'Very interested! Can we negotiate a bit?',
    status: 'pending',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    type: 'buy',
  },
]

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useMockStore(userId: string = 'guest') {
  const [store, setStore] = useState<MockStore>(readStore)

  const update = useCallback((updater: (s: MockStore) => MockStore) => {
    setStore((prev) => {
      const next = updater(prev)
      writeStore(next)
      return next
    })
  }, [])

  // Sync across tabs
  useEffect(() => {
    const handler = () => setStore(readStore())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const wishlist = store.wishlists[userId] || []

  const toggleWishlist = useCallback((listingId: string) => {
    update((s) => {
      const current = s.wishlists[userId] || []
      const exists = current.includes(listingId)
      const nextList = exists
        ? current.filter((id) => id !== listingId)
        : [...current, listingId]
      return {
        ...s,
        wishlists: {
          ...s.wishlists,
          [userId]: nextList,
        },
      }
    })
  }, [update, userId])

  const addListing = useCallback((listing: Listing) => {
    update((s) => ({
      ...s,
      listings: [listing, ...s.listings],
    }))
  }, [update])

  const updateListing = useCallback((id: string, partial: Partial<Listing>) => {
    update((s) => ({
      ...s,
      listings: s.listings.map((l) => (l.id === id ? { ...l, ...partial } : l)),
    }))
  }, [update])

  const deleteListing = useCallback((id: string) => {
    update((s) => ({
      ...s,
      listings: s.listings.filter((l) => l.id !== id),
    }))
  }, [update])

  const addRentalRequest = useCallback((req: Omit<MockRentalRequest, 'id' | 'created_at'>) => {
    const newReq: MockRentalRequest = {
      ...req,
      id: `r_${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    update((s) => ({
      ...s,
      rentalRequests: [newReq, ...s.rentalRequests],
    }))
    return newReq
  }, [update])

  const addExchangeProposal = useCallback((prop: Omit<MockExchangeProposal, 'id' | 'created_at'>) => {
    const newProp: MockExchangeProposal = {
      ...prop,
      id: `ex_${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    update((s) => ({
      ...s,
      exchangeProposals: [newProp, ...s.exchangeProposals],
    }))
    return newProp
  }, [update])

  return {
    store,
    update,
    listings: store.listings,
    rentalRequests: store.rentalRequests,
    exchangeProposals: store.exchangeProposals,
    messages: store.messages,
    conversations: store.conversations,
    purchaseRequests: store.purchaseRequests,
    wishlist,
    toggleWishlist,
    addListing,
    updateListing,
    deleteListing,
    addRentalRequest,
    addExchangeProposal,
  }
}
