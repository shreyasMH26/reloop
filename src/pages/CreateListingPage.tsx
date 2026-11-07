import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  Tag, 
  Calendar, 
  ArrowRightLeft, 
  CheckCircle2, 
  MapPin, 
  Trash2, 
  Loader2, 
  Camera, 
  AlertCircle,
  Eye,
  ShoppingBag
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../contexts/AuthContext';
import { useMockStore } from '../hooks/useMockStore';
import { CATEGORIES, DAVANAGERE_AREAS, CONDITIONS, formatPrice } from '../lib/utils';
import { api } from '../services/api';
import type { ListingType, ConditionType, Listing } from '../types';

export const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { addListing } = useMockStore(user?.id || 'guest');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
  const [listingType, setListingType] = useState<ListingType>('sell');
  const [condition, setCondition] = useState<ConditionType>('good');
  const [area, setArea] = useState(DAVANAGERE_AREAS[0]);
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [pickupPreference, setPickupPreference] = useState('Campus Gate / Public Landmark');
  
  // Rent specific
  const [pricePerDay, setPricePerDay] = useState('');
  const [minRentalDays, setMinRentalDays] = useState('1');

  // Exchange specific
  const [exchangeFor, setExchangeFor] = useState('');
  const [additionalPayment, setAdditionalPayment] = useState('');

  // Image Upload state
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'
  ]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Direct image file upload via FileReader & API upload endpoint
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        toast(`File "${file.name}" exceeds maximum 5MB size limit`, 'error');
        continue;
      }

      try {
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await api.upload.uploadImage(base64Data);
        if (res?.url) {
          setImages((prev) => [...prev, res.url]);
          successCount++;
        }
      } catch (err: any) {
        // Fallback to local object URL
        const objectUrl = URL.createObjectURL(file);
        setImages((prev) => [...prev, objectUrl]);
        successCount++;
      }
    }

    setUploading(false);
    if (successCount > 0) {
      toast(`Successfully added ${successCount} product photo(s)!`, 'success');
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) return;
    try {
      new URL(imageUrl);
      setImages((prev) => [...prev, imageUrl.trim()]);
      setImageUrl('');
      toast('Photo URL added to gallery', 'success');
    } catch {
      toast('Please enter a valid image web URL', 'error');
    }
  };

  const handleRemoveImage = (index: number) => {
    if (images.length <= 1) {
      toast('A listing must contain at least one product photo', 'error');
      return;
    }
    setImages(images.filter((_, idx) => idx !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast('Please provide a title and detailed description', 'error');
      return;
    }

    if (listingType === 'sell' && (!price || Number(price) < 0)) {
      toast('Please specify a valid selling price', 'error');
      return;
    }

    if (listingType === 'rent' && (!pricePerDay || Number(pricePerDay) <= 0)) {
      toast('Please specify a daily rental price', 'error');
      return;
    }

    if (listingType === 'exchange' && !exchangeFor.trim()) {
      toast('Please specify what item you want in exchange', 'error');
      return;
    }

    setSubmitting(true);

    const categoryObj = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
    const numericPrice = Number(price) || (listingType === 'rent' ? Number(pricePerDay) : 0);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      price: numericPrice,
      original_price: originalPrice ? Number(originalPrice) : null,
      listing_type: listingType,
      condition,
      category_id: categoryId,
      area,
      pickup_preference: pickupPreference,
      price_per_day: listingType === 'rent' ? Number(pricePerDay) || numericPrice : undefined,
      min_rental_days: listingType === 'rent' ? Number(minRentalDays) || 1 : undefined,
      exchange_for: listingType === 'exchange' ? exchangeFor.trim() : undefined,
      additional_payment: listingType === 'exchange' ? Number(additionalPayment) || 0 : undefined,
      images,
    };

    try {
      const res = await api.products.create(payload);
      toast('Your listing has been published to the community!', 'success');
      navigate(`/product/${res.product.id}`);
    } catch (err: any) {
      console.warn('[ReLoop] Server create note:', err);
      // Local fallback
      const newId = `listing_${Date.now()}`;
      addListing({
        id: newId,
        ...payload,
        category: categoryObj,
        seller_id: user?.id || 'guest_user',
        seller: {
          id: user?.id || 'guest_user',
          full_name: profile?.full_name || 'Community Member',
          role: 'user',
          rating: 5.0,
          total_listings: 1,
          created_at: new Date().toISOString(),
        },
        views: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      toast('Listing published to local community feed!', 'success');
      navigate(`/product/${newId}`);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCategoryObj = CATEGORIES.find((c) => c.id === categoryId);

  return (
    <Layout>
      <div className="bg-cream-50 min-h-screen py-10 border-b border-cream-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-200 shadow-modal space-y-8">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-sage-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-sage-700">
                    Circular Marketplace
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight">
                  Give an Item a Second Life
                </h1>
                <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
                  List items you no longer use so students and neighbors in Davanagere can reuse them.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPreviewOpen(true)}
                icon={<Eye className="w-4 h-4 text-sage-600" />}
              >
                Preview Card
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. Transaction Type */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
                  Transaction Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setListingType('sell')}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      listingType === 'sell'
                        ? 'border-sage-500 bg-sage-50 text-sage-900 font-bold shadow-xs'
                        : 'border-cream-300 bg-cream-50/50 text-charcoal-600 hover:bg-cream-100'
                    }`}
                  >
                    <Tag className="w-5 h-5 mx-auto mb-1 text-sage-600" />
                    <span className="text-xs block">Sell Item</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setListingType('rent')}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      listingType === 'rent'
                        ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-xs'
                        : 'border-cream-300 bg-cream-50/50 text-charcoal-600 hover:bg-cream-100'
                    }`}
                  >
                    <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <span className="text-xs block">Rent Out</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setListingType('exchange')}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      listingType === 'exchange'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold shadow-xs'
                        : 'border-cream-300 bg-cream-50/50 text-charcoal-600 hover:bg-cream-100'
                    }`}
                  >
                    <ArrowRightLeft className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                    <span className="text-xs block">Direct Barter</span>
                  </button>
                </div>
              </div>

              {/* 2. Title & Category */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Casio FX-991ES Plus Scientific Calculator (Mint Condition)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-cream-50 border border-cream-300 rounded-2xl px-4 py-3 text-sm text-charcoal-900 focus:outline-none focus:border-sage-500 focus:bg-white transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-cream-50 border border-cream-300 rounded-2xl px-4 py-3 text-sm text-charcoal-900 focus:outline-none focus:border-sage-500 focus:bg-white"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                      Condition *
                    </label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as ConditionType)}
                      className="w-full bg-cream-50 border border-cream-300 rounded-2xl px-4 py-3 text-sm text-charcoal-900 focus:outline-none focus:border-sage-500 focus:bg-white"
                    >
                      {CONDITIONS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label} — {c.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Pricing / Rent / Exchange specific details */}
              <div className="p-5 rounded-2xl bg-cream-100/60 border border-cream-200 space-y-4">
                {listingType === 'sell' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                        Selling Price (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="750"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full bg-white border border-cream-300 rounded-2xl px-4 py-2.5 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                        Original New Price (Optional)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="1450"
                        value={originalPrice}
                        onChange={(e) => setOriginalPrice(e.target.value)}
                        className="w-full bg-white border border-cream-300 rounded-2xl px-4 py-2.5 text-sm"
                      />
                    </div>
                  </div>
                )}

                {listingType === 'rent' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                        Rental Rate per Day (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="120"
                        value={pricePerDay}
                        onChange={(e) => setPricePerDay(e.target.value)}
                        className="w-full bg-white border border-cream-300 rounded-2xl px-4 py-2.5 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                        Minimum Rental Days
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={minRentalDays}
                        onChange={(e) => setMinRentalDays(e.target.value)}
                        className="w-full bg-white border border-cream-300 rounded-2xl px-4 py-2.5 text-sm"
                      />
                    </div>
                  </div>
                )}

                {listingType === 'exchange' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                        What item do you want in return? *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Operating System Concepts textbook or Mechanical Engineering drafting kit"
                        value={exchangeFor}
                        onChange={(e) => setExchangeFor(e.target.value)}
                        className="w-full bg-white border border-cream-300 rounded-2xl px-4 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                        Optional Cash Adjustment (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="0 (if you are offering extra cash to balance value)"
                        value={additionalPayment}
                        onChange={(e) => setAdditionalPayment(e.target.value)}
                        className="w-full bg-white border border-cream-300 rounded-2xl px-4 py-2.5 text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Mention age, working condition, whether accessories are included, and when you are free to meet for inspection..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-cream-50 border border-cream-300 rounded-2xl p-4 text-sm text-charcoal-900 focus:outline-none focus:border-sage-500 focus:bg-white"
                />
              </div>

              {/* 5. Location & Pickup Preferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                    Davanagere Area / Campus *
                  </label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full bg-cream-50 border border-cream-300 rounded-2xl px-4 py-3 text-sm text-charcoal-900"
                  >
                    {DAVANAGERE_AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                    Pickup / Handover Preference
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BIET Library Gate / MCC B Block Bus Stop"
                    value={pickupPreference}
                    onChange={(e) => setPickupPreference(e.target.value)}
                    className="w-full bg-cream-50 border border-cream-300 rounded-2xl px-4 py-3 text-sm text-charcoal-900"
                  />
                </div>
              </div>

              {/* 6. Product Photos */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
                  Product Photos ({images.length} selected)
                </label>

                {/* Upload Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    icon={uploading ? <Loader2 className="w-4 h-4 animate-spin text-sage-600" /> : <Camera className="w-4 h-4 text-sage-600" />}
                    className="bg-cream-50 hover:bg-cream-100"
                  >
                    {uploading ? 'Processing photos...' : 'Upload Photos from Device'}
                  </Button>

                  <div className="flex-1 flex gap-2">
                    <input
                      type="url"
                      placeholder="Or paste an image web URL..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-xs"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleAddImageUrl}
                    >
                      Add URL
                    </Button>
                  </div>
                </div>

                {/* Thumbnails Gallery */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-cream-200 group bg-cream-100">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1.5 left-1.5 bg-sage-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          Cover
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-white/90 rounded-full text-charcoal-600 hover:text-rose-600 shadow-sm opacity-90 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewOpen(true)}
                  icon={<Eye className="w-4 h-4" />}
                >
                  Preview Before Publish
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={submitting}
                  icon={submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  className="w-full sm:w-auto shadow-md"
                >
                  {submitting ? 'Publishing to Marketplace...' : 'Publish Listing to Community'}
                </Button>
              </div>

            </form>

          </div>

        </div>
      </div>

      {/* ─── LIVE PREVIEW MODAL ────────────────────────────────────────────────── */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Listing Preview"
      >
        <div className="space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-cream-100 border border-cream-200">
            <img src={images[0]} alt="preview" className="w-full h-full object-cover" />
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge variant="green" size="sm">{listingType.toUpperCase()}</Badge>
              <Badge variant="default" size="sm">{condition}</Badge>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sage-700">
              {selectedCategoryObj?.name || 'Category'}
            </span>
            <h3 className="text-lg font-bold text-charcoal-900 mt-0.5">{title || 'Untitled Item'}</h3>
            <p className="text-xl font-extrabold text-charcoal-900 mt-1">
              {listingType === 'rent'
                ? `${formatPrice(Number(pricePerDay) || 0)} / day`
                : listingType === 'exchange'
                ? `Barter for: ${exchangeFor || 'Item'}`
                : formatPrice(Number(price) || 0)}
            </p>
          </div>

          <div className="bg-cream-50 p-3 rounded-xl text-xs text-charcoal-600 space-y-1">
            <p className="font-semibold text-charcoal-800">Pickup Location: {area}, Davanagere</p>
            <p>Preference: {pickupPreference}</p>
          </div>

          <p className="text-xs text-charcoal-600 line-clamp-3">
            {description || 'No description provided yet.'}
          </p>

          <div className="pt-2">
            <Button variant="primary" fullWidth onClick={() => setPreviewOpen(false)}>
              Looks Great, Continue
            </Button>
          </div>
        </div>
      </Modal>

    </Layout>
  );
};

export default CreateListingPage;
