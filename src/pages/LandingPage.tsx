import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShoppingBag, 
  PlusCircle, 
  Repeat, 
  ShieldCheck, 
  MapPin, 
  Leaf, 
  Sparkles, 
  Calendar, 
  ArrowRightLeft, 
  TrendingUp, 
  Users, 
  Compass,
  Star,
  Search
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/marketplace/ProductCard';
import { DoodleCrewFooter } from '../components/ui/doodle-crew-footer-sunny';
import { CATEGORIES, DAVANAGERE_AREAS } from '../lib/utils';
import { api } from '../services/api';
import type { Listing } from '../types';

export const LandingPage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Listing[]>([]);
  const [recentProducts, setRecentProducts] = useState<Listing[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Listing[]>([]);
  const [nearbyProducts, setNearbyProducts] = useState<Listing[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('BIET Campus');
  const [sustainabilityStats, setSustainabilityStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [featured, recentRes, trending, nearby, stats] = await Promise.all([
          api.products.getFeatured().catch(() => []),
          api.products.list({ limit: 6, sort: 'newest' }).catch(() => ({ items: [] })),
          api.products.getTrending().catch(() => []),
          api.products.getNearby(selectedArea).catch(() => []),
          api.sustainability.getMetrics().catch(() => null),
        ]);

        if (mounted) {
          if (featured.length > 0) setFeaturedProducts(featured as Listing[]);
          if (recentRes.items?.length > 0) setRecentProducts(recentRes.items as Listing[]);
          if (trending.length > 0) setTrendingProducts(trending as Listing[]);
          if (nearby.length > 0) setNearbyProducts(nearby as Listing[]);
          if (stats) setSustainabilityStats(stats);
        }
      } catch (err) {
        console.warn('Error loading homepage data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => { mounted = false; };
  }, [selectedArea]);

  return (
    <Layout hideFooter={true}>
      {/* ─── Hero Section ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-cream-50 pt-8 sm:pt-14 pb-16 lg:pb-24 border-b border-cream-200">
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-sage-200/40 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-cream-300/40 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sage-100/80 border border-sage-200 text-sage-900 text-xs font-medium tracking-wide shadow-xs">
                <span className="w-2 h-2 rounded-full bg-sage-500 animate-pulse" />
                <span className="font-semibold">Live in Davanagere</span>
                <span className="text-sage-400">•</span>
                <span className="text-sage-700">“Good things deserve another life.”</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-charcoal-900 tracking-tight leading-[1.12]">
                Give Things a{' '}
                <span className="text-sage-600 underline decoration-sage-300 decoration-wavy decoration-2">
                  Second Life.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-charcoal-600 max-w-2xl leading-relaxed">
                ReLoop connects students, professionals, and households across Davanagere to buy pre-owned, rent temporarily, and exchange freely.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link to="/explore">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-md">
                    Explore Marketplace
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>

                <Link to="/sell">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <PlusCircle className="w-4 h-4 mr-1 text-sage-600" />
                    List an Item for Free
                  </Button>
                </Link>

                <Link to="/showcase">
                  <Button variant="ghost" size="lg" className="w-full sm:w-auto text-charcoal-600">
                    <Sparkles className="w-4 h-4 mr-1 text-amber-500" />
                    Design Lab
                  </Button>
                </Link>
              </div>

              {/* Fast Stats Badges */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-cream-200 text-left">
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-charcoal-900">100%</p>
                  <p className="text-xs text-charcoal-500 font-medium">Local & Peer-to-Peer</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-charcoal-900">₹0</p>
                  <p className="text-xs text-charcoal-500 font-medium">Listing Fees</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-sage-600">
                    {sustainabilityStats ? `${sustainabilityStats.co2_saved_kg} kg` : '185+ kg'}
                  </p>
                  <p className="text-xs text-charcoal-500 font-medium">CO₂ Diverted</p>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="bg-white rounded-3xl p-5 border border-cream-200 shadow-modal transform lg:rotate-1 hover:rotate-0 transition-all duration-300">
                  <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden bg-cream-100 mb-4">
                    <img 
                      src="https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80" 
                      alt="Casio Scientific Calculator"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-semibold text-charcoal-800 shadow-xs">
                      Academic & Books
                    </div>
                    <div className="absolute bottom-3 right-3 bg-sage-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xs">
                      Save ₹700 (48% Off)
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-charcoal-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sage-600" />
                        BIET Campus, Davanagere
                      </span>
                      <span className="font-medium text-sage-700 bg-sage-50 px-2 py-0.5 rounded-md">
                        Like New
                      </span>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-charcoal-900 truncate">
                      Casio FX-991ES Plus 2nd Gen
                    </h3>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-extrabold text-charcoal-900">₹750</span>
                        <span className="text-xs text-charcoal-400 line-through">₹1,450</span>
                      </div>
                      <Link to="/explore">
                        <span className="text-xs font-semibold text-sage-700 hover:text-sage-800 flex items-center gap-0.5">
                          Browse Gear <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Floating pill badge */}
                <div className="absolute -bottom-5 -left-4 sm:-left-8 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-cream-200 shadow-lg flex items-center gap-3 animate-pulse-soft">
                  <div className="w-8 h-8 rounded-xl bg-sage-100 text-sage-700 flex items-center justify-center font-bold">
                    <Repeat className="w-4 h-4" />
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-bold text-charcoal-800">Circular Verification</p>
                    <p className="text-charcoal-500">Safe in-person handovers</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── Product Categories ─────────────────────────────────────────────────── */}
      <section className="py-16 bg-cream-50 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-xs uppercase font-bold tracking-widest text-sage-700 mb-1">
                Browse By Category
              </h2>
              <p className="text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight">
                Everything for college, home & work
              </p>
            </div>
            <Link to="/explore" className="text-xs sm:text-sm font-semibold text-sage-700 hover:text-sage-800 flex items-center gap-1 group">
              View All Categories <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/explore?category=${cat.id}`}
                className="group p-5 rounded-2xl bg-white border border-cream-200 hover:border-sage-300 hover:shadow-card-hover transition-all text-center flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-xl bg-cream-100 text-charcoal-700 group-hover:bg-sage-100 group-hover:text-sage-700 flex items-center justify-center transition-colors mb-3">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-charcoal-800 group-hover:text-sage-800 line-clamp-1 mb-1">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-charcoal-400 font-medium">
                  Browse Items
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Products ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sage-700 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Handpicked for You</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight">
                Featured Verified Listings
              </h2>
            </div>
            <Link to="/explore?sort=popular" className="text-xs sm:text-sm font-semibold text-sage-700 hover:text-sage-800 flex items-center gap-1">
              See All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {(featuredProducts.length > 0 ? featuredProducts.slice(0, 6) : recentProducts.slice(0, 6)).map((product) => (
              <ProductCard key={product.id} listing={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trending Listings ──────────────────────────────────────────────────── */}
      <section className="py-16 bg-cream-50 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sage-700 mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>High Demand Right Now</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight">
                Trending Pre-Owned Deals
              </h2>
            </div>
            <Link to="/explore?sort=views" className="text-xs sm:text-sm font-semibold text-sage-700 hover:text-sage-800 flex items-center gap-1">
              Browse Trending <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(trendingProducts.length > 0 ? trendingProducts.slice(0, 4) : recentProducts.slice(0, 4)).map((product) => (
              <ProductCard key={product.id} listing={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Nearby Neighborhood Listings (Davanagere) ─────────────────────────── */}
      <section className="py-16 bg-white border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sage-700 mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Hyperlocal Discovery</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight">
                Listings Near You in Davanagere
              </h2>
            </div>

            {/* Neighborhood Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {DAVANAGERE_AREAS.slice(0, 4).map((area) => (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                    selectedArea === area
                      ? 'bg-sage-600 text-white border-sage-600 shadow-xs'
                      : 'bg-cream-100 text-charcoal-700 border-cream-300 hover:bg-cream-200'
                  }`}
                >
                  {area}
                </button>
              ))}
              <Link to="/map" className="text-xs font-semibold text-sage-700 underline pl-2 whitespace-nowrap">
                Open Map
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(nearbyProducts.length > 0 ? nearbyProducts : recentProducts.slice(0, 3)).map((product) => (
              <ProductCard key={product.id} listing={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── How ReLoop Works ──────────────────────────────────────────────────── */}
      <section className="py-20 bg-cream-100 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs uppercase font-bold tracking-widest text-sage-700">
            Simple, Transparent, Local
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 mt-2 mb-4 tracking-tight">
            How ReLoop Works
          </h2>
          <p className="text-charcoal-600 max-w-xl mx-auto text-sm sm:text-base mb-12">
            No shipping fees, no spam, no mysterious sellers. Just verified neighbors helping each other reuse.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-card text-left space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center font-extrabold text-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-charcoal-900">List or Discover</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Snap photos of textbooks, bicycles, gadgets, or clothing you no longer use. Or browse items available in your neighborhood.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-card text-left space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cream-200 text-charcoal-800 flex items-center justify-center font-extrabold text-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-charcoal-900">Connect & Decide</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Choose to buy, rent for short periods, or exchange items without spending money. Agree on terms directly through in-app chat.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-card text-left space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sage-200 text-sage-800 flex items-center justify-center font-extrabold text-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-charcoal-900">Meet & Reuse</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">
                Meet at a safe campus gate or public hub in Davanagere. Inspect the item in person and pay via cash or UPI on handover.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Sustainability & Societal Impact ─────────────────────────────────── */}
      <section className="py-20 bg-cream-50 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-100 text-sage-800 text-xs font-semibold">
                <Leaf className="w-3.5 h-3.5" />
                <span>Circular Economy Impact</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 tracking-tight">
                Real environmental impact, verified in your community.
              </h2>
              <p className="text-sm sm:text-base text-charcoal-600 leading-relaxed">
                Every pre-owned textbook, bicycle, and gadget reused through ReLoop directly diverts electronic waste from landfills and prevents carbon-heavy manufacturing cycles.
              </p>
              <Link to="/sustainability">
                <Button variant="primary" size="md">
                  Explore Full Impact Tracker <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-card">
                <p className="text-3xl sm:text-4xl font-extrabold text-sage-600">
                  {sustainabilityStats ? `${sustainabilityStats.co2_saved_kg} kg` : '190 kg'}
                </p>
                <p className="text-xs uppercase font-bold text-charcoal-400 mt-1">CO₂ Emissions Saved</p>
                <p className="text-xs text-charcoal-500 mt-2">Equal to planting 9 trees</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-card">
                <p className="text-3xl sm:text-4xl font-extrabold text-charcoal-900">
                  {sustainabilityStats ? `₹${(sustainabilityStats.money_saved_rupees).toLocaleString('en-IN')}` : '₹38,500'}
                </p>
                <p className="text-xs uppercase font-bold text-charcoal-400 mt-1">Student Savings</p>
                <p className="text-xs text-charcoal-500 mt-2">Kept in the local economy</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-card">
                <p className="text-3xl sm:text-4xl font-extrabold text-charcoal-900">
                  {sustainabilityStats ? `${sustainabilityStats.total_items_reused}` : '14+'}
                </p>
                <p className="text-xs uppercase font-bold text-charcoal-400 mt-1">Items Reused & Exchanged</p>
                <p className="text-xs text-charcoal-500 mt-2">Zero waste to local landfill</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-card">
                <p className="text-3xl sm:text-4xl font-extrabold text-sage-600">
                  {sustainabilityStats ? `${sustainabilityStats.water_saved_liters.toLocaleString('en-IN')} L` : '32,000 L'}
                </p>
                <p className="text-xs uppercase font-bold text-charcoal-400 mt-1">Water Preserved</p>
                <p className="text-xs text-charcoal-500 mt-2">From textile & hardware manufacturing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Community Testimonials ────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-sage-700">
              Community Voices
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 mt-1">
              Loved by Davanagere students & locals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-cream-50 p-6 rounded-3xl border border-cream-200 space-y-4">
              <div className="flex text-amber-400 gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed italic">
                “Needed a scientific calculator and 4th sem VTU CSE notes. Got both from a senior in BIET within 20 minutes for ₹750.”
              </p>
              <div className="pt-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sage-200 text-sage-800 flex items-center justify-center font-bold text-xs">
                  AK
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal-900">Ananya K.</p>
                  <p className="text-[11px] text-charcoal-500">BIET Campus, Davanagere</p>
                </div>
              </div>
            </div>

            <div className="bg-cream-50 p-6 rounded-3xl border border-cream-200 space-y-4">
              <div className="flex text-amber-400 gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed italic">
                “Rented a cycle for a week while my scooter was in servicing. Karthik from MCC B Block was super helpful and flexible.”
              </p>
              <div className="pt-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cream-300 text-charcoal-800 flex items-center justify-center font-bold text-xs">
                  PN
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal-900">Priya Nair</p>
                  <p className="text-[11px] text-charcoal-500">JJM Medical Intern</p>
                </div>
              </div>
            </div>

            <div className="bg-cream-50 p-6 rounded-3xl border border-cream-200 space-y-4">
              <div className="flex text-amber-400 gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
              </div>
              <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed italic">
                “Instead of dumping old hostel furniture, I exchanged my study desk and found an acoustic guitar. Truly circular!”
              </p>
              <div className="pt-2 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sage-300 text-sage-900 flex items-center justify-center font-bold text-xs">
                  KG
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal-900">Karthik Gowda</p>
                  <p className="text-[11px] text-charcoal-500">MCC B Block Resident</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Integrated Hand-Drawn Sketchbook Doodle Crew Footer ─────────────────── */}
      <DoodleCrewFooter
        preset="reloop"
        wordmark="RELOOP"
        brand="ReLoop"
        blurb="Give Things a Second Life. A community marketplace for buying, selling, renting, and exchanging pre-owned items within Davanagere."
        tagline="Good things deserve another life."
        actions={[
          { label: "Explore Marketplace", href: "/explore", icon: "sparkle", variant: "outline" },
          { label: "List an Item Free", href: "/sell", icon: "heart", variant: "solid" },
        ]}
        crew={[
          { kind: "cat", letter: 0, seat: "front", offset: -0.36, name: "Patch", says: "Inspected and ready for reuse!" },
          { kind: "bird", letter: 1, seat: "top", name: "Pip", says: "Save trees, share textbooks!" },
          { kind: "ghost", letter: 3, seat: "behind", name: "Boo", says: "Second hand, top condition." },
          { kind: "kid", letter: 4, seat: "top", offset: 0.05, name: "Juno", says: "Campus sustainability hero!" },
          { kind: "yeti", letter: 5, seat: "front", offset: 0.4, scale: 0.92, flip: true, name: "Bruno", says: "Zero waste rocks Davanagere." },
        ]}
        doodles={["heart", "star", "sparkle", "sandwich", "heart"]}
        doodleCount={12}
        columns={[
          {
            title: "Marketplace",
            links: [
              { label: "Explore Listings", href: "/explore" },
              { label: "Rentals", href: "/explore?type=rent" },
              { label: "Exchanges", href: "/explore?type=exchange" },
              { label: "List an Item", href: "/sell" },
            ],
          },
          {
            title: "Community",
            links: [
              { label: "Campus Map", href: "/map" },
              { label: "Sustainability", href: "/sustainability" },
              { label: "Interactive Showcase", href: "/showcase" },
            ],
          },
          {
            title: "Davanagere",
            links: [
              { label: "BIET Campus Hub", href: "/map" },
              { label: "MCC B Block", href: "/map" },
              { label: "support@reloop.in", href: "mailto:support@reloop.in" },
            ],
          },
        ]}
        copyright={`© ${new Date().getFullYear()} ReLoop · VTU CSE Societal Project · Davanagere, Karnataka`}
      />
    </Layout>
  );
};

export default LandingPage;
