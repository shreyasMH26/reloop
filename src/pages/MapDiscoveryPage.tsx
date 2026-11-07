import React, { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  MapPin,
  Filter,
  Heart,
  ExternalLink,
  ChevronRight,
  Info,
  Tag,
  RefreshCw,
  Clock,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import type { Listing, ListingType } from '../types'

// ─── Davanagere Area Coords ───────────────────────────────────────────────────
const DAVANAGERE_AREA_COORDS: Record<string, { lat: number; lng: number }> = {
  'Davanagere City': { lat: 14.4663, lng: 75.9238 },
  'P.J.Extension': { lat: 14.4751, lng: 75.9183 },
  Vidyanagara: { lat: 14.458, lng: 75.9345 },
  'Avaragere Road': { lat: 14.4523, lng: 75.9192 },
  Lokikere: { lat: 14.4809, lng: 75.9411 },
  'Shamanur Road': { lat: 14.4612, lng: 75.9076 },
  'Bathi Road': { lat: 14.4713, lng: 75.9307 },
  'Nittuvalli Road': { lat: 14.4441, lng: 75.9289 },
  'Kondajji Area': { lat: 14.4871, lng: 75.9158 },
  'Anagodu Road': { lat: 14.4578, lng: 75.9512 },
}

const DEFAULT_CENTER: [number, number] = [14.4663, 75.9238]
const DEFAULT_ZOOM = 13

// ─── Custom Sage Green Marker ─────────────────────────────────────────────────
function createSageMarker(active = false) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 32px; height: 32px;
      background: ${active ? '#2a5e45' : '#3d7f60'};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: background 0.2s;
    "></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -34],
  })
}

// ─── Mock listings (approximated to area centroids) ───────────────────────────
const MOCK_LISTINGS: (Listing & { coords: { lat: number; lng: number } })[] = [
  {
    id: '1',
    title: 'Vintage Wooden Study Table',
    description: 'Solid teak study table in great condition. Scratches polished out.',
    price: 2500,
    listing_type: 'sell',
    condition: 'good',
    category_id: 'furniture',
    area: 'P.J.Extension',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400'],
    seller_id: 'u1',
    seller: { id: 'u1', full_name: 'Ravi Kumar', role: 'user', created_at: '' },
    views: 34,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    coords: DAVANAGERE_AREA_COORDS['P.J.Extension'],
  },
  {
    id: '2',
    title: 'Canon EOS 1500D DSLR Camera',
    description: 'Lightly used DSLR with 18-55mm kit lens. Perfect for beginners.',
    price: 18000,
    listing_type: 'sell',
    condition: 'like_new',
    category_id: 'electronics',
    area: 'Vidyanagara',
    images: ['https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400'],
    seller_id: 'u2',
    seller: { id: 'u2', full_name: 'Priya Sharma', role: 'user', created_at: '' },
    views: 112,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    coords: DAVANAGERE_AREA_COORDS['Vidyanagara'],
  },
  {
    id: '3',
    title: 'Pressure Cooker 5L — Rent for Events',
    description: 'Prestige stainless steel 5L. Available for 1-day rentals.',
    price: 0,
    price_per_day: 100,
    min_rental_days: 1,
    listing_type: 'rent',
    condition: 'good',
    category_id: 'kitchen',
    area: 'Shamanur Road',
    images: ['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400'],
    seller_id: 'u3',
    seller: { id: 'u3', full_name: 'Suma Patil', role: 'user', created_at: '' },
    views: 22,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    coords: DAVANAGERE_AREA_COORDS['Shamanur Road'],
  },
  {
    id: '4',
    title: 'Children\'s Bicycle — Exchange',
    description: 'Hero 20" kids bike. Looking to exchange for a larger 24" bicycle.',
    price: 0,
    listing_type: 'exchange',
    condition: 'good',
    category_id: 'sports',
    area: 'Lokikere',
    images: ['https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=400'],
    seller_id: 'u4',
    seller: { id: 'u4', full_name: 'Arjun Reddy', role: 'user', created_at: '' },
    views: 18,
    is_active: true,
    exchange_for: '24" bicycle, any brand',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    coords: DAVANAGERE_AREA_COORDS['Lokikere'],
  },
  {
    id: '5',
    title: 'Iron Dumbbell Set 20kg',
    description: 'Complete dumbbell set, rarely used. Perfect for home gym setup.',
    price: 1200,
    listing_type: 'sell',
    condition: 'like_new',
    category_id: 'sports',
    area: 'Bathi Road',
    images: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400'],
    seller_id: 'u5',
    seller: { id: 'u5', full_name: 'Deepak Nair', role: 'user', created_at: '' },
    views: 56,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    coords: DAVANAGERE_AREA_COORDS['Bathi Road'],
  },
]

// ─── Type Badge ───────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: ListingType }) {
  const styles = {
    sell: 'bg-blue-100 text-blue-700',
    rent: 'bg-amber-100 text-amber-700',
    exchange: 'bg-purple-100 text-purple-700',
  }
  const labels = { sell: 'For Sale', rent: 'For Rent', exchange: 'Exchange' }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${styles[type]}`}
    >
      {labels[type]}
    </span>
  )
}

// ─── Map Resizer (forces re-render after panel open/close) ───────────────────
function MapResizer({ panelOpen }: { panelOpen: boolean }) {
  const map = useMap()
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 310)
  }, [panelOpen, map])
  return null
}

// ─── Main Component ───────────────────────────────────────────────────────────
const LISTING_TYPES: Array<{ label: string; value: ListingType | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'For Sale', value: 'sell' },
  { label: 'For Rent', value: 'rent' },
  { label: 'Exchange', value: 'exchange' },
]

export default function MapDiscoveryPage() {
  const [selectedListing, setSelectedListing] = useState<(typeof MOCK_LISTINGS)[0] | null>(null)
  const [filterType, setFilterType] = useState<ListingType | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [wishlist, setWishlist] = useState<Set<string>>(new Set())
  const [mapReady, setMapReady] = useState(false)

  const filteredListings = MOCK_LISTINGS.filter((l) => {
    if (filterType !== 'all' && l.listing_type !== filterType) return false
    if (filterCategory !== 'all' && l.category_id !== filterCategory) return false
    return true
  })

  const handleWishlist = useCallback((id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const priceDisplay = (listing: (typeof MOCK_LISTINGS)[0]) => {
    if (listing.listing_type === 'rent') return `₹${listing.price_per_day}/day`
    if (listing.listing_type === 'exchange') return 'Exchange'
    return `₹${listing.price.toLocaleString('en-IN')}`
  }

  return (
    <div className="relative flex" style={{ height: 'calc(100vh - 64px)' }}>
      {/* ── Filter Bar ── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg px-3 py-2 border border-cream-200">
        <Filter size={15} className="text-charcoal-400 flex-shrink-0" />
        <div className="flex gap-1">
          {LISTING_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilterType(t.value)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                filterType === t.value
                  ? 'bg-sage-500 text-white shadow'
                  : 'text-charcoal-500 hover:bg-cream-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Privacy Notice ── */}
      <div className="absolute bottom-6 left-4 z-[1000] bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow text-xs text-charcoal-500 flex items-center gap-1.5 border border-cream-200 max-w-xs">
        <Info size={13} className="text-sage-500 flex-shrink-0" />
        📍 Approximate locations shown. Exact addresses are never displayed.
      </div>

      {/* ── Map ── */}
      <div className={`flex-1 transition-all duration-300 ${selectedListing ? 'mr-[380px]' : ''}`}>
        {!mapReady && (
          <div className="absolute inset-0 z-[999] flex items-center justify-center bg-cream-50">
            <LoadingSpinner size="lg" label="Loading map…" />
          </div>
        )}
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ width: '100%', height: '100%' }}
          whenReady={() => setMapReady(true)}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapResizer panelOpen={!!selectedListing} />

          {filteredListings.length === 0 && (
            <Marker position={DEFAULT_CENTER} icon={createSageMarker()}>
              <Popup>
                <div className="text-center py-2 px-1">
                  <p className="font-semibold text-charcoal-900 text-sm">No listings yet</p>
                  <p className="text-charcoal-500 text-xs mt-1">
                    Be the first to list in this area!
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {filteredListings.map((listing) => (
            <Marker
              key={listing.id}
              position={[listing.coords.lat, listing.coords.lng]}
              icon={createSageMarker(selectedListing?.id === listing.id)}
              eventHandlers={{ click: () => setSelectedListing(listing) }}
            >
              <Popup>
                <div className="w-52">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-28 object-cover rounded-lg mb-2"
                  />
                  <p className="font-semibold text-charcoal-900 text-sm leading-tight">
                    {listing.title}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-sage-600 font-bold text-sm">{priceDisplay(listing)}</span>
                    <TypeBadge type={listing.listing_type} />
                  </div>
                  <button
                    onClick={() => setSelectedListing(listing)}
                    className="mt-2 w-full py-1.5 text-xs font-semibold bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ── Side Panel ── */}
      <AnimatePresence>
        {selectedListing && (
          <motion.aside
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="absolute right-0 top-0 bottom-0 w-[380px] bg-white border-l border-cream-200 shadow-2xl z-[900] flex flex-col overflow-hidden"
          >
            {/* Close */}
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 transition-colors"
            >
              <X size={18} className="text-charcoal-600" />
            </button>

            {/* Image */}
            <div className="relative h-52 flex-shrink-0 overflow-hidden">
              <img
                src={selectedListing.images[0]}
                alt={selectedListing.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <TypeBadge type={selectedListing.listing_type} />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              <h2 className="text-lg font-bold text-charcoal-900 leading-snug">
                {selectedListing.title}
              </h2>

              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl font-bold text-sage-600">
                  {priceDisplay(selectedListing)}
                </span>
                {selectedListing.listing_type === 'rent' && selectedListing.min_rental_days && (
                  <span className="text-xs text-charcoal-400">
                    · min {selectedListing.min_rental_days} day
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 mt-2 text-sm text-charcoal-500">
                <MapPin size={13} className="text-sage-500" />
                {selectedListing.area}
              </div>

              {selectedListing.listing_type === 'exchange' && selectedListing.exchange_for && (
                <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                  <p className="text-xs font-semibold text-purple-700 mb-0.5 flex items-center gap-1">
                    <RefreshCw size={12} /> Looking to exchange for:
                  </p>
                  <p className="text-sm text-charcoal-700">{selectedListing.exchange_for}</p>
                </div>
              )}

              <p className="mt-3 text-sm text-charcoal-600 leading-relaxed">
                {selectedListing.description}
              </p>

              {/* Seller */}
              <div className="mt-5 p-4 bg-cream-50 rounded-xl border border-cream-200">
                <p className="text-xs font-semibold text-charcoal-400 uppercase tracking-wide mb-2">
                  Seller
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-sage-100 flex items-center justify-center text-sage-700 font-bold text-sm">
                    {selectedListing.seller?.full_name[0] ?? '?'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal-900">
                      {selectedListing.seller?.full_name}
                    </p>
                    <p className="text-xs text-charcoal-400">Member</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-cream-200 flex gap-2">
              <Button
                variant="outline"
                size="md"
                className="flex-shrink-0"
                onClick={() => handleWishlist(selectedListing.id)}
                icon={
                  <Heart
                    size={16}
                    className={wishlist.has(selectedListing.id) ? 'fill-rose-500 text-rose-500' : ''}
                  />
                }
              >
                {wishlist.has(selectedListing.id) ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                rightIcon={<ChevronRight size={16} />}
                onClick={() =>
                  (window.location.href = `/listings/${selectedListing.id}`)
                }
              >
                View Full Details
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
