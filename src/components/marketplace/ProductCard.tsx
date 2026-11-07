import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Repeat, Calendar, ArrowRightLeft, Tag } from 'lucide-react';
import type { Listing } from '../../types';
import { formatPrice, timeAgo } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { useMockStore } from '../../hooks/useMockStore';

interface ProductCardProps {
  listing: Listing;
}

export const ProductCard: React.FC<ProductCardProps> = ({ listing }) => {
  const { wishlist, toggleWishlist } = useMockStore();
  const isWishlisted = wishlist.includes(listing.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(listing.id);
  };

  const getListingTypeBadge = () => {
    switch (listing.listing_type) {
      case 'sell':
        return <Badge variant="green" size="sm">For Sale</Badge>;
      case 'rent':
        return <Badge variant="default" size="sm">Rent</Badge>;
      case 'exchange':
        return <Badge variant="amber" size="sm">Exchange</Badge>;
      default:
        return null;
    }
  };

  const formatCondition = (cond: string) => {
    return cond.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const displayImage = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80';

  return (
    <div className="group relative bg-white rounded-2xl border border-cream-200 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      
      {/* Top Media Container */}
      <Link to={`/listings/${listing.id}`} className="relative block aspect-[4/3] w-full overflow-hidden bg-cream-100">
        <img
          src={displayImage}
          alt={listing.title}
          loading="lazy"
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {getListingTypeBadge()}
          <span className="bg-charcoal-900/70 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider">
            {formatCondition(listing.condition)}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isWishlisted 
              ? 'bg-rose-50 text-rose-500 shadow-sm' 
              : 'bg-white/80 text-charcoal-600 hover:text-rose-500 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Rental / Exchange Bottom Ribbon */}
        {listing.listing_type === 'rent' && (
          <div className="absolute bottom-0 inset-x-0 bg-charcoal-900/75 backdrop-blur-xs text-white text-[11px] font-medium py-1 px-3 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-sage-400" />
              Per Day Rate
            </span>
            <span>Min {listing.min_rental_days || 1} day{(listing.min_rental_days || 1) > 1 ? 's' : ''}</span>
          </div>
        )}

        {listing.listing_type === 'exchange' && (
          <div className="absolute bottom-0 inset-x-0 bg-charcoal-900/75 backdrop-blur-xs text-white text-[11px] font-medium py-1 px-3 flex items-center gap-1.5 truncate">
            <ArrowRightLeft className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">For: {listing.exchange_for || 'Item of equal value'}</span>
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Area */}
          <div className="flex items-center justify-between text-[11px] text-charcoal-500 mb-1.5">
            <span className="font-semibold text-sage-700 uppercase tracking-wider">
              {listing.category?.name || 'Community'}
            </span>
            <span className="flex items-center gap-0.5 text-charcoal-400">
              <MapPin className="w-3 h-3 text-charcoal-400" />
              {listing.area}
            </span>
          </div>

          {/* Title */}
          <Link to={`/listings/${listing.id}`} className="block">
            <h3 className="font-semibold text-charcoal-900 text-sm line-clamp-2 leading-snug group-hover:text-sage-600 transition-colors">
              {listing.title}
            </h3>
          </Link>
        </div>

        {/* Price & Seller Info */}
        <div className="mt-4 pt-3 border-t border-cream-100 flex items-center justify-between">
          <div>
            {listing.listing_type === 'rent' ? (
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-charcoal-900">
                  {formatPrice(listing.price_per_day || listing.price)}
                </span>
                <span className="text-xs text-charcoal-500 font-normal">/ day</span>
              </div>
            ) : listing.listing_type === 'exchange' ? (
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  Exchange
                </span>
                {listing.additional_payment && listing.additional_payment > 0 ? (
                  <span className="text-[11px] text-charcoal-500 font-medium">
                    + {formatPrice(listing.additional_payment)}
                  </span>
                ) : null}
              </div>
            ) : (
              <span className="text-base font-bold text-charcoal-900">
                {formatPrice(listing.price)}
              </span>
            )}
          </div>

          {/* Time Posted */}
          <span className="text-[11px] text-charcoal-400">
            {timeAgo(listing.created_at)}
          </span>
        </div>

      </div>

    </div>
  );
};
