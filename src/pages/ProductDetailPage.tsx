import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  ArrowRightLeft, 
  MessageSquare, 
  Share2, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowLeft,
  Star,
  Clock,
  User,
  ShoppingBag,
  ExternalLink,
  Info
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { useMockStore } from '../hooks/useMockStore';
import { useAuth } from '../contexts/AuthContext';
import { formatPrice, timeAgo, CATEGORIES } from '../lib/utils';
import { ProductCard } from '../components/marketplace/ProductCard';
import { api } from '../services/api';
import type { Listing } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    listings, 
    wishlist, 
    toggleWishlist, 
    addRentalRequest, 
    addExchangeProposal 
  } = useMockStore(user?.id || 'guest');

  // Find listing from store or fetched from API
  const localListing = listings.find((item) => item.id === id);
  const [fetchedListing, setFetchedListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(!localListing);
  const [isSaved, setIsSaved] = useState(false);

  // States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [rentalModalOpen, setRentalModalOpen] = useState(false);
  const [exchangeModalOpen, setExchangeModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Purchase Form state
  const [offeredPrice, setOfferedPrice] = useState('');
  const [purchaseMessage, setPurchaseMessage] = useState('');

  // Rental Form state
  const [rentalStartDate, setRentalStartDate] = useState('');
  const [rentalEndDate, setRentalEndDate] = useState('');
  const [rentalMessage, setRentalMessage] = useState('');

  // Exchange Form state
  const [exchangeOffering, setExchangeOffering] = useState('');
  const [exchangeCashAdjustment, setExchangeCashAdjustment] = useState('');
  const [exchangeMessage, setExchangeMessage] = useState('');

  // Contact Form state
  const [chatMessage, setChatMessage] = useState('');

  // Report Form state
  const [reportReason, setReportReason] = useState('misleading');
  const [reportNotes, setReportNotes] = useState('');

  // Fetch listing details from API
  useEffect(() => {
    let mounted = true;
    if (id) {
      api.products.getById(id)
        .then((data) => {
          if (mounted && data) {
            setFetchedListing(data);
            if (data.is_saved !== undefined) {
              setIsSaved(data.is_saved);
            }
          }
        })
        .catch((err) => {
          console.warn('[ReLoop] Note fetching product from server:', err);
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    }
    return () => { mounted = false; };
  }, [id]);

  const listing = fetchedListing || localListing;

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-28 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-sage-200 border-t-sage-600 animate-spin mx-auto" />
          <p className="text-sm text-charcoal-500 font-medium">Loading item details...</p>
        </div>
      </Layout>
    );
  }

  if (!listing) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-2xl font-bold text-charcoal-900">Listing Not Found</h2>
          <p className="text-charcoal-600">The product you are looking for may have been sold, exchanged, or removed.</p>
          <Link to="/explore">
            <Button variant="primary">Back to Marketplace</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const isWishlisted = isSaved || wishlist.includes(listing.id);
  const similarListings = listings
    .filter((l) => l.category_id === listing.category_id && l.id !== listing.id)
    .slice(0, 3);

  // Wishlist toggle handler
  const handleWishlistToggle = async () => {
    if (!user) {
      toast('Please log in to save items to your wishlist', 'info');
      navigate('/login');
      return;
    }
    try {
      const res = await api.wishlist.toggle(listing.id);
      setIsSaved(res.saved);
      toggleWishlist(listing.id);
      toast(res.saved ? 'Added to your saved wishlist!' : 'Removed from wishlist', 'success');
    } catch {
      toggleWishlist(listing.id);
    }
  };

  // Purchase Submit
  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('Please log in to place a purchase request', 'info');
      navigate('/login');
      return;
    }

    try {
      const numericOffer = Number(offeredPrice) || listing.price;
      await api.requests.create({
        product_id: listing.id,
        request_type: 'buy',
        offered_price: numericOffer,
        message: purchaseMessage.trim() || 'I would like to purchase this item.',
      });
      toast('Purchase request submitted to seller! You can coordinate handover in your dashboard.', 'success');
      setPurchaseModalOpen(false);
      navigate('/dashboard/requests');
    } catch (err: any) {
      toast(err.message || 'Failed to submit purchase request', 'error');
    }
  };

  // Rental calculation
  const calculateRentalTotal = () => {
    if (!rentalStartDate || !rentalEndDate) return 0;
    const start = new Date(rentalStartDate).getTime();
    const end = new Date(rentalEndDate).getTime();
    const diffDays = Math.ceil((end - start) / (1000 * 3600 * 24));
    const minDays = listing.min_rental_days || 1;
    const days = Math.max(diffDays, minDays);
    const dailyPrice = listing.price_per_day || listing.price;
    return days * dailyPrice;
  };

  const handleRentalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('Please log in to request a rental', 'info');
      navigate('/login');
      return;
    }
    if (!rentalStartDate || !rentalEndDate) {
      toast('Please select both start and end rental dates', 'error');
      return;
    }
    const start = new Date(rentalStartDate).getTime();
    const end = new Date(rentalEndDate).getTime();
    if (end < start) {
      toast('End date cannot be earlier than start date', 'error');
      return;
    }

    const diffDays = Math.max(1, Math.ceil((end - start) / (1000 * 3600 * 24)));
    const minDays = listing.min_rental_days || 1;
    if (diffDays < minDays) {
      toast(`Minimum rental duration for this item is ${minDays} day(s)`, 'error');
      return;
    }

    try {
      await api.requests.create({
        product_id: listing.id,
        request_type: 'rent',
        offered_price: calculateRentalTotal(),
        rental_start_date: rentalStartDate,
        rental_end_date: rentalEndDate,
        message: rentalMessage,
      });
      toast('Rental booking request submitted to owner!', 'success');
      setRentalModalOpen(false);
      navigate('/dashboard/requests');
    } catch (err: any) {
      toast(err.message || 'Failed to submit rental request', 'error');
    }
  };

  const handleExchangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('Please log in to propose an exchange', 'info');
      navigate('/login');
      return;
    }
    if (!exchangeOffering.trim()) {
      toast('Please describe what item you are offering to swap', 'error');
      return;
    }

    try {
      await api.requests.create({
        product_id: listing.id,
        request_type: 'exchange',
        exchange_item_title: exchangeOffering.trim(),
        exchange_cash_diff: Number(exchangeCashAdjustment) || 0,
        message: exchangeMessage,
      });
      toast('Exchange proposal sent to owner!', 'success');
      setExchangeModalOpen(false);
      navigate('/dashboard/requests');
    } catch (err: any) {
      toast(err.message || 'Failed to submit exchange proposal', 'error');
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('Please log in to message the seller', 'info');
      navigate('/login');
      return;
    }
    if (!chatMessage.trim()) return;

    try {
      await api.conversations.sendMessage(listing.seller_id, chatMessage.trim(), listing.id);
      toast(`Message sent to ${listing.seller?.full_name || 'seller'}!`, 'success');
      setChatMessage('');
      setContactModalOpen(false);
      navigate('/dashboard/messages');
    } catch (err: any) {
      toast(err.message || 'Failed to send message', 'error');
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.reports.create({
        reported_type: 'product',
        reported_id: listing.id,
        reason: reportReason,
        details: reportNotes,
      });
      toast('Listing report received by ReLoop moderators for review.', 'info');
      setReportModalOpen(false);
    } catch {
      toast('Report logged.', 'info');
      setReportModalOpen(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast('Listing link copied to clipboard!', 'info');
    }
  };

  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'];

  return (
    <Layout>
      <div className="bg-cream-50 min-h-screen py-8 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-xs font-medium text-charcoal-500">
            <Link to="/" className="hover:text-sage-700">Home</Link>
            <span>/</span>
            <Link to="/explore" className="hover:text-sage-700">Marketplace</Link>
            <span>/</span>
            <Link to={`/explore?category=${listing.category_id}`} className="hover:text-sage-700">
              {listing.category?.name || 'Category'}
            </Link>
            <span>/</span>
            <span className="text-charcoal-900 truncate max-w-xs">{listing.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Image Gallery */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Main Image */}
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-cream-200 shadow-modal">
                <img
                  src={images[activeImageIndex]}
                  alt={listing.title}
                  className="w-full h-full object-cover object-center"
                />

                {/* Badge Overlay */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {listing.listing_type === 'sell' && (
                    <Badge variant="green" size="md">For Sale</Badge>
                  )}
                  {listing.listing_type === 'rent' && (
                    <Badge variant="default" size="md">Rental Equipment</Badge>
                  )}
                  {listing.listing_type === 'exchange' && (
                    <Badge variant="amber" size="md">Direct Barter</Badge>
                  )}
                  <span className="bg-charcoal-900/80 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
                    {listing.condition.replace('_', ' ')}
                  </span>
                </div>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  aria-label="Wishlist"
                  className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md shadow-md transition-all ${
                    isWishlisted 
                      ? 'bg-rose-50 text-rose-500' 
                      : 'bg-white/90 text-charcoal-600 hover:text-rose-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>

              {/* Thumbnails list */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                        activeImageIndex === idx 
                          ? 'border-sage-500 ring-2 ring-sage-300' 
                          : 'border-cream-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Approximate Location Notice */}
              <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-sage-800 font-bold text-sm">
                  <MapPin className="w-4 h-4 text-sage-600" />
                  <span>Approximate Pickup Area: {listing.area}, Davanagere</span>
                </div>
                <p className="text-xs text-charcoal-500 leading-relaxed">
                  To protect resident safety and privacy, precise home addresses are never published. 
                  Coordinate directly with the owner to arrange inspection in a safe, public neighborhood landmark.
                </p>
              </div>

            </div>

            {/* Right Column: Listing Details & Actions */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-modal space-y-6">
                
                {/* Title & Metadata */}
                <div className="space-y-2 pb-4 border-b border-cream-200">
                  <div className="flex items-center justify-between text-xs text-charcoal-400">
                    <span className="flex items-center gap-1 font-semibold text-sage-700 uppercase tracking-wider">
                      {listing.category?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Listed {timeAgo(listing.created_at)}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight leading-snug">
                    {listing.title}
                  </h1>

                  <div className="flex items-baseline gap-2 pt-2">
                    {listing.listing_type === 'rent' ? (
                      <div>
                        <span className="text-3xl font-black text-charcoal-900">
                          {formatPrice(listing.price_per_day || listing.price)}
                        </span>
                        <span className="text-sm text-charcoal-500 font-medium"> / day</span>
                        <p className="text-xs text-blue-700 font-semibold mt-0.5">
                          Minimum booking: {listing.min_rental_days || 1} day{(listing.min_rental_days || 1) > 1 ? 's' : ''}
                        </p>
                      </div>
                    ) : listing.listing_type === 'exchange' ? (
                      <div className="space-y-1">
                        <span className="text-xs uppercase font-extrabold px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg">
                          Direct Barter Item
                        </span>
                        <p className="text-sm font-semibold text-charcoal-800 pt-1">
                          Looking for: <span className="text-charcoal-900 font-bold">{listing.exchange_for || 'Item of equivalent value'}</span>
                        </p>
                        {listing.additional_payment && listing.additional_payment > 0 ? (
                          <p className="text-xs text-charcoal-500">
                            + Owner can include {formatPrice(listing.additional_payment)} adjustment
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-charcoal-900">
                          {formatPrice(listing.price)}
                        </span>
                        {(listing as any).original_price && (
                          <span className="text-sm text-charcoal-400 line-through">
                            {formatPrice((listing as any).original_price)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-3">
                  {listing.listing_type === 'sell' && (
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="primary" 
                        fullWidth 
                        size="lg"
                        onClick={() => {
                          setOfferedPrice(String(listing.price));
                          setPurchaseModalOpen(true);
                        }}
                        icon={<ShoppingBag className="w-5 h-5" />}
                        className="shadow-md font-bold"
                      >
                        Place Purchase Request / Reserve
                      </Button>
                      <Button 
                        variant="outline" 
                        fullWidth 
                        size="md"
                        onClick={() => setContactModalOpen(true)}
                        icon={<MessageSquare className="w-4 h-4 text-sage-600" />}
                      >
                        Contact Seller
                      </Button>
                    </div>
                  )}

                  {listing.listing_type === 'rent' && (
                    <Button 
                      variant="primary" 
                      fullWidth 
                      size="lg"
                      onClick={() => setRentalModalOpen(true)}
                      icon={<Calendar className="w-5 h-5" />}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Request Rental Booking
                    </Button>
                  )}

                  {listing.listing_type === 'exchange' && (
                    <Button 
                      variant="primary" 
                      fullWidth 
                      size="lg"
                      onClick={() => setExchangeModalOpen(true)}
                      icon={<ArrowRightLeft className="w-5 h-5" />}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Propose Item Exchange
                    </Button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleShare}
                      icon={<Share2 className="w-4 h-4" />}
                    >
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => setReportModalOpen(true)}
                      icon={<AlertTriangle className="w-4 h-4 text-charcoal-400" />}
                    >
                      Report
                    </Button>
                  </div>
                </div>

                {/* Seller Profile Card */}
                <div className="pt-6 border-t border-cream-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-sage-200 text-sage-800 flex items-center justify-center font-bold text-base shrink-0">
                      {listing.seller?.avatar_url ? (
                        <img src={listing.seller.avatar_url} alt="seller" className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        listing.seller?.full_name ? listing.seller.full_name[0].toUpperCase() : 'U'
                      )}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-charcoal-900 text-sm truncate">
                          {listing.seller?.full_name || 'Community Neighbor'}
                        </h4>
                        {listing.seller?.is_verified && (
                          <ShieldCheck className="w-4 h-4 text-sage-600 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-charcoal-500 mt-0.5">
                        <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {listing.seller?.rating ? listing.seller.rating.toFixed(1) : '5.0'}
                        </span>
                        <span>•</span>
                        <span>{listing.area}, Davanagere</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="pt-6 border-t border-cream-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-400">
                    Product Description
                  </h4>
                  <p className="text-sm text-charcoal-700 leading-relaxed whitespace-pre-line">
                    {listing.description}
                  </p>
                </div>

                {/* Safety Tips */}
                <div className="bg-sage-50/70 p-4 rounded-2xl border border-sage-200/80 space-y-1.5 text-xs text-sage-900">
                  <div className="flex items-center gap-1.5 font-bold text-sage-800">
                    <ShieldCheck className="w-4 h-4 text-sage-600" />
                    <span>ReLoop Campus & Community Safety</span>
                  </div>
                  <p className="text-sage-700 leading-relaxed">
                    Meet in a public campus or neighborhood location. Inspect before paying. Never wire advance funds.
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* Similar Items */}
          {similarListings.length > 0 && (
            <div className="pt-10 border-t border-cream-200 space-y-6">
              <h3 className="text-xl font-bold text-charcoal-900">
                Similar Items in {listing.category?.name || 'Category'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarListings.map((item) => (
                  <ProductCard key={item.id} listing={item} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ─── MODAL 0: Purchase Request ────────────────────────────────────────── */}
      <Modal
        isOpen={purchaseModalOpen}
        onClose={() => setPurchaseModalOpen(false)}
        title="Purchase Request & Handover"
      >
        <form onSubmit={handlePurchaseSubmit} className="space-y-4">
          <div className="bg-sage-50 border border-sage-200 p-3.5 rounded-2xl text-xs text-sage-900 space-y-1">
            <p className="font-bold">{listing.title}</p>
            <p>Listed Price: <span className="font-bold">{formatPrice(listing.price)}</span> • Seller: {listing.seller?.full_name}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1">
              Your Offer Amount (₹)
            </label>
            <input
              type="number"
              required
              min={0}
              value={offeredPrice}
              onChange={(e) => setOfferedPrice(e.target.value)}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1">
              Message to Seller & Preferred Meetup Spot
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Can we meet near BIET library gate or MCC B Block bus stop? Cash or UPI ready."
              value={purchaseMessage}
              onChange={(e) => setPurchaseMessage(e.target.value)}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl p-3 text-xs"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" fullWidth onClick={() => setPurchaseModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              Submit Purchase Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 1: Rental Request ────────────────────────────────────────── */}
      <Modal
        isOpen={rentalModalOpen}
        onClose={() => setRentalModalOpen(false)}
        title="Request Rental Booking"
      >
        <form onSubmit={handleRentalSubmit} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl text-xs text-blue-900 space-y-1">
            <p className="font-bold">{listing.title}</p>
            <p>Rate: {formatPrice(listing.price_per_day || listing.price)}/day • Min duration: {listing.min_rental_days || 1} day(s)</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={rentalStartDate}
                onChange={(e) => setRentalStartDate(e.target.value)}
                className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                required
                value={rentalEndDate}
                onChange={(e) => setRentalEndDate(e.target.value)}
                className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          {rentalStartDate && rentalEndDate && (
            <div className="bg-cream-100 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
              <span className="text-charcoal-600">Calculated Rental Cost:</span>
              <span className="text-sm font-bold text-charcoal-900">{formatPrice(calculateRentalTotal())}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1">
              Note to Owner (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Tell the owner about your project and preferred pickup time..."
              value={rentalMessage}
              onChange={(e) => setRentalMessage(e.target.value)}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl p-3 text-xs"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" fullWidth onClick={() => setRentalModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" fullWidth className="bg-blue-600 hover:bg-blue-700 text-white">
              Send Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 2: Propose Exchange ──────────────────────────────────────── */}
      <Modal
        isOpen={exchangeModalOpen}
        onClose={() => setExchangeModalOpen(false)}
        title="Propose Item Exchange"
      >
        <form onSubmit={handleExchangeSubmit} className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-900 space-y-1">
            <p className="font-bold">Barter for: {listing.title}</p>
            <p>Owner seeks: <span className="font-semibold">{listing.exchange_for || 'Item of equal utility'}</span></p>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1">
              What are you offering to swap?
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sony WH-CH510 Bluetooth Headphones in mint condition"
              value={exchangeOffering}
              onChange={(e) => setExchangeOffering(e.target.value)}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1">
              Cash Difference (Optional)
            </label>
            <input
              type="number"
              placeholder="₹ Amount you offer to balance the barter value"
              value={exchangeCashAdjustment}
              onChange={(e) => setExchangeCashAdjustment(e.target.value)}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1">
              Proposal Note
            </label>
            <textarea
              rows={3}
              placeholder="Describe why this exchange benefits both parties..."
              value={exchangeMessage}
              onChange={(e) => setExchangeMessage(e.target.value)}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl p-3 text-xs"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" fullWidth onClick={() => setExchangeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" fullWidth className="bg-amber-600 hover:bg-amber-700 text-white">
              Send Exchange Proposal
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 3: Contact Seller ────────────────────────────────────────── */}
      <Modal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        title={`Message ${listing.seller?.full_name || 'Seller'}`}
      >
        <form onSubmit={handleContactSubmit} className="space-y-4">
          <div className="bg-cream-100 p-3 rounded-2xl text-xs text-charcoal-700">
            <p className="font-semibold text-charcoal-900">{listing.title}</p>
            <p className="text-[11px] text-charcoal-500">Pick-up Area: {listing.area}, Davanagere</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1">
              Your Message
            </label>
            <textarea
              rows={4}
              required
              placeholder="Hi! Is this still available? I'm nearby and would like to inspect it..."
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl p-3 text-xs"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" fullWidth onClick={() => setContactModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" fullWidth>
              Send Direct Message
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── MODAL 4: Report Listing ────────────────────────────────────────── */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Listing"
      >
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1">
              Reason for reporting
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl p-2.5 text-xs"
            >
              <option value="misleading">Misleading or inaccurate description</option>
              <option value="prohibited">Prohibited or illegal item</option>
              <option value="spam">Spam or commercial advertisement</option>
              <option value="offensive">Offensive or abusive content</option>
              <option value="other">Other reason</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1">
              Additional context (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Provide any details to assist moderation..."
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              className="w-full bg-cream-50 border border-cream-300 rounded-xl p-3 text-xs"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" fullWidth onClick={() => setReportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" fullWidth className="text-rose-600 border-rose-200 hover:bg-rose-50">
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>

    </Layout>
  );
};

export default ProductDetailPage;
