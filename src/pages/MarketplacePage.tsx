import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  MapPin, 
  Tag, 
  Calendar, 
  ArrowRightLeft, 
  ShoppingBag,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { ProductCard } from '../components/marketplace/ProductCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useMockStore } from '../hooks/useMockStore';
import { CATEGORIES, DAVANAGERE_AREAS, CONDITIONS } from '../lib/utils';
import { getCloudListings } from '../services/dataService';
import { isSupabaseConfigured } from '../lib/supabase';
import type { ListingType, ConditionType, Listing } from '../types';

export const MarketplacePage: React.FC = () => {
  const { listings: localListings } = useMockStore();
  const [cloudListings, setCloudListings] = useState<Listing[]>([]);
  const [loadingCloud, setLoadingCloud] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    setLoadingCloud(true);
    getCloudListings().then((data) => {
      if (data && data.length > 0) setCloudListings(data);
    }).catch((err) => {
      console.warn('Could not load cloud listings:', err);
    }).finally(() => setLoadingCloud(false));
  }, []);

  const listings = cloudListings.length > 0 ? cloudListings : localListings;

  // Local & URL State
  const searchQuery = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedType = (searchParams.get('type') as ListingType | '') || '';
  const selectedCondition = searchParams.get('condition') || '';
  const selectedArea = searchParams.get('area') || '';
  const sortBy = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchQuery);

  // Update query params helper
  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('q', searchTerm.trim());
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSearchParams(new URLSearchParams());
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedType,
    selectedCondition,
    selectedArea,
    searchQuery,
    minPrice,
    maxPrice,
  ].filter(Boolean).length;

  // Filtered & Sorted Listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesArea = item.area.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesArea) return false;
      }

      // Category
      if (selectedCategory && item.category_id !== selectedCategory) {
        return false;
      }

      // Listing Type (sell, rent, exchange)
      if (selectedType && item.listing_type !== selectedType) {
        return false;
      }

      // Condition
      if (selectedCondition && item.condition !== selectedCondition) {
        return false;
      }

      // Area
      if (selectedArea && item.area !== selectedArea) {
        return false;
      }

      // Min Price
      if (minPrice && item.price < Number(minPrice)) {
        return false;
      }

      // Max Price
      if (maxPrice && item.price > Number(maxPrice)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      // Default: newest
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [listings, searchQuery, selectedCategory, selectedType, selectedCondition, selectedArea, minPrice, maxPrice, sortBy]);

  return (
    <Layout>
      <div className="bg-cream-50 min-h-screen py-8 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Banner */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-cream-200">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-sage-700">
                    Davanagere Community Marketplace
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
                  Explore Pre-Owned Treasures
                </h1>
                <p className="text-sm text-charcoal-600 mt-1">
                  Discover quality items, rent gear for your projects, or propose a direct barter.
                </p>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
                <input
                  type="text"
                  placeholder="Search by title, laptop, book, bike..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-cream-300 rounded-2xl pl-10 pr-10 py-2.5 text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-sage-500 shadow-xs"
                />
                <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      updateFilter('q', '');
                    }}
                    className="absolute right-3.5 top-3.5 text-charcoal-400 hover:text-charcoal-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>
            </div>

            {/* Quick Type Filter Tabs */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pt-4 pb-2 scrollbar-none">
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => updateFilter('type', '')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    !selectedType
                      ? 'bg-charcoal-900 text-white shadow-xs'
                      : 'bg-white text-charcoal-700 border border-cream-300 hover:bg-cream-100'
                  }`}
                >
                  All Listings ({listings.length})
                </button>

                <button
                  type="button"
                  onClick={() => updateFilter('type', 'sell')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedType === 'sell'
                      ? 'bg-sage-600 text-white shadow-xs'
                      : 'bg-white text-charcoal-700 border border-cream-300 hover:bg-cream-100'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  For Sale
                </button>

                <button
                  type="button"
                  onClick={() => updateFilter('type', 'rent')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedType === 'rent'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-charcoal-700 border border-cream-300 hover:bg-cream-100'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  For Rent
                </button>

                <button
                  type="button"
                  onClick={() => updateFilter('type', 'exchange')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedType === 'exchange'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-charcoal-700 border border-cream-300 hover:bg-cream-100'
                  }`}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Exchange / Barter
                </button>
              </div>

              {/* Mobile Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-white border border-cream-300 rounded-xl text-xs font-semibold text-charcoal-800 shrink-0 shadow-2xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-sage-600" />
                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </button>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Desktop Filter Sidebar */}
            <aside className="hidden lg:block bg-white p-6 rounded-3xl border border-cream-200 shadow-card space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-cream-200">
                <span className="font-bold text-sm text-charcoal-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-sage-600" />
                  Filter Listings
                </span>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-600">
                  Category
                </label>
                <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => updateFilter('category', '')}
                    className={`w-full flex items-center justify-between text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      !selectedCategory ? 'bg-sage-100 text-sage-900 font-bold' : 'text-charcoal-600 hover:bg-cream-100'
                    }`}
                  >
                    <span>All Categories</span>
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => updateFilter('category', cat.id)}
                      className={`w-full flex items-center justify-between text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                        selectedCategory === cat.id ? 'bg-sage-100 text-sage-900 font-bold' : 'text-charcoal-600 hover:bg-cream-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Area in Davanagere Filter */}
              <div className="space-y-2 pt-2 border-t border-cream-100">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-600">
                  Davanagere Area
                </label>
                <select
                  value={selectedArea}
                  onChange={(e) => updateFilter('area', e.target.value)}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl px-3 py-2 text-xs text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-sage-500 font-medium"
                >
                  <option value="">All Neighborhoods</option>
                  {DAVANAGERE_AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition Filter */}
              <div className="space-y-2 pt-2 border-t border-cream-100">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-600">
                  Item Condition
                </label>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => updateFilter('condition', '')}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium ${
                      !selectedCondition ? 'bg-sage-100 text-sage-900 font-bold' : 'text-charcoal-600 hover:bg-cream-100'
                    }`}
                  >
                    Any Condition
                  </button>
                  {CONDITIONS.map((cond) => (
                    <button
                      key={cond.value}
                      type="button"
                      onClick={() => updateFilter('condition', cond.value)}
                      className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium ${
                        selectedCondition === cond.value ? 'bg-sage-100 text-sage-900 font-bold' : 'text-charcoal-600 hover:bg-cream-100'
                      }`}
                    >
                      {cond.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2 pt-2 border-t border-cream-100">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal-600">
                  Price Range (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl px-2.5 py-1.5 text-xs text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="w-full bg-cream-50 border border-cream-300 rounded-xl px-2.5 py-1.5 text-xs text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  />
                </div>
              </div>

            </aside>

            {/* Product Listings Grid & Sort Controls */}
            <main className="lg:col-span-3 space-y-6">
              
              {/* Results Topbar */}
              <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-cream-200 shadow-2xs">
                <p className="text-xs sm:text-sm font-semibold text-charcoal-700">
                  Showing <span className="text-charcoal-900 font-bold">{filteredListings.length}</span> {filteredListings.length === 1 ? 'item' : 'items'}
                </p>

                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                  <label htmlFor="sortSelect" className="text-xs font-medium text-charcoal-500 hidden sm:inline">
                    Sort by:
                  </label>
                  <select
                    id="sortSelect"
                    value={sortBy}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                    className="bg-cream-50 border border-cream-300 rounded-xl px-3 py-1.5 text-xs font-medium text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-sage-500"
                  >
                    <option value="newest">Newest Listed</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Listing Grid */}
              {filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((item) => (
                    <ProductCard key={item.id} listing={item} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 border border-cream-200 text-center shadow-card">
                  <EmptyState
                    title="No listings match your criteria"
                    description="Try adjusting your search query, clearing specific filters, or be the first in Davanagere to list this item."
                    action={{
                      label: 'Clear Filters',
                      onClick: clearAllFilters,
                    }}
                  />
                  <div className="mt-4">
                    <Link to="/listings/new">
                      <Button variant="primary" size="sm">
                        Post a New Listing
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

            </main>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Filter Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-charcoal-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 space-y-6 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200">
              <span className="font-bold text-base text-charcoal-900">Filter Listings</span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 rounded-xl text-charcoal-400 hover:text-charcoal-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Categories */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase text-charcoal-600">Category</p>
              <select
                value={selectedCategory}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="w-full bg-cream-50 border border-cream-300 rounded-xl p-2.5 text-sm"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Area */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase text-charcoal-600">Davanagere Area</p>
              <select
                value={selectedArea}
                onChange={(e) => updateFilter('area', e.target.value)}
                className="w-full bg-cream-50 border border-cream-300 rounded-xl p-2.5 text-sm"
              >
                <option value="">All Neighborhoods</option>
                {DAVANAGERE_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Condition */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase text-charcoal-600">Condition</p>
              <select
                value={selectedCondition}
                onChange={(e) => updateFilter('condition', e.target.value)}
                className="w-full bg-cream-50 border border-cream-300 rounded-xl p-2.5 text-sm"
              >
                <option value="">Any Condition</option>
                {CONDITIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Price */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase text-charcoal-600">Price Range (₹)</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl p-2 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="w-full bg-cream-50 border border-cream-300 rounded-xl p-2 text-sm"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-cream-200 flex items-center gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  clearAllFilters();
                  setMobileFiltersOpen(false);
                }}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => setMobileFiltersOpen(false)}
              >
                Apply Filters
              </Button>
            </div>

          </div>
        </div>
      )}

    </Layout>
  );
};

export default MarketplacePage;
