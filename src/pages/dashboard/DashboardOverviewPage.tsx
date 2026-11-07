import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  Calendar, 
  ArrowRightLeft, 
  Heart, 
  PlusCircle, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  Leaf
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useMockStore } from '../../hooks/useMockStore';
import { formatPrice } from '../../lib/utils';

export const DashboardOverviewPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { listings, wishlist, rentalRequests, exchangeProposals } = useMockStore(user?.id || 'guest');

  const myListings = listings.filter((l) => l.seller_id === (user?.id || 'guest_user'));

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-200">
          <div>
            <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">
              Welcome back, {profile?.full_name || 'Community Member'}!
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
              Track your listings, community rentals, and sustainability contributions in Davanagere.
            </p>
          </div>

          <Link to="/listings/new">
            <Button variant="primary" size="sm" icon={<PlusCircle className="w-4 h-4" />}>
              List Another Item
            </Button>
          </Link>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-cream-50 p-5 rounded-2xl border border-cream-200 space-y-1">
            <div className="flex items-center justify-between text-charcoal-400">
              <span className="text-xs font-bold uppercase tracking-wider">My Listings</span>
              <ShoppingBag className="w-4 h-4 text-sage-600" />
            </div>
            <p className="text-2xl font-black text-charcoal-900">{myListings.length}</p>
            <p className="text-[11px] text-charcoal-400">Active in marketplace</p>
          </div>

          <div className="bg-cream-50 p-5 rounded-2xl border border-cream-200 space-y-1">
            <div className="flex items-center justify-between text-charcoal-400">
              <span className="text-xs font-bold uppercase tracking-wider">Rentals</span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-charcoal-900">{rentalRequests.length}</p>
            <p className="text-[11px] text-charcoal-400">Bookings recorded</p>
          </div>

          <div className="bg-cream-50 p-5 rounded-2xl border border-cream-200 space-y-1">
            <div className="flex items-center justify-between text-charcoal-400">
              <span className="text-xs font-bold uppercase tracking-wider">Exchanges</span>
              <ArrowRightLeft className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-charcoal-900">{exchangeProposals.length}</p>
            <p className="text-[11px] text-charcoal-400">Barters proposed</p>
          </div>

          <div className="bg-cream-50 p-5 rounded-2xl border border-cream-200 space-y-1">
            <div className="flex items-center justify-between text-charcoal-400">
              <span className="text-xs font-bold uppercase tracking-wider">Saved Items</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <p className="text-2xl font-black text-charcoal-900">{wishlist.length}</p>
            <p className="text-[11px] text-charcoal-400">In your wishlist</p>
          </div>
        </div>

        {/* Environmental Contribution Highlight */}
        <div className="bg-sage-900 text-white p-6 rounded-3xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 z-10 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sage-300 bg-sage-800 px-3 py-1 rounded-full">
              <Leaf className="w-3.5 h-3.5 text-sage-400" />
              Circular Impact Score
            </div>
            <h3 className="text-xl font-extrabold text-white">
              You have helped keep items in active use!
            </h3>
            <p className="text-xs text-sage-200 max-w-md">
              Every reused item diverts roughly 2.5 kg of lifecycle carbon from municipal disposal in Karnataka.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl text-center shrink-0 border border-white/20">
            <p className="text-2xl font-black text-sage-300">{(myListings.length * 2.5).toFixed(1)} kg</p>
            <p className="text-xs text-white/80 font-medium">Estimated CO₂e Diverted</p>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="space-y-4 pt-2">
          <h2 className="text-base font-bold text-charcoal-900">Quick Dashboard Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link 
              to="/dashboard/listings" 
              className="p-4 rounded-2xl border border-cream-200 hover:border-sage-400 transition-colors group flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-charcoal-900">Manage Listings</p>
                <p className="text-[11px] text-charcoal-400">Edit price or status</p>
              </div>
              <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-sage-600 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link 
              to="/dashboard/rentals" 
              className="p-4 rounded-2xl border border-cream-200 hover:border-blue-400 transition-colors group flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-charcoal-900">Rental Bookings</p>
                <p className="text-[11px] text-charcoal-400">Review pending requests</p>
              </div>
              <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link 
              to="/dashboard/exchanges" 
              className="p-4 rounded-2xl border border-cream-200 hover:border-amber-400 transition-colors group flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-charcoal-900">Exchange Offers</p>
                <p className="text-[11px] text-charcoal-400">Coordinate barter trades</p>
              </div>
              <ArrowRight className="w-4 h-4 text-charcoal-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default DashboardOverviewPage;
