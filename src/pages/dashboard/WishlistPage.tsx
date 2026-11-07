import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { ProductCard } from '../../components/marketplace/ProductCard';
import { useAuth } from '../../contexts/AuthContext';
import { useMockStore } from '../../hooks/useMockStore';
import { api } from '../../services/api';
import type { Listing } from '../../types';

export const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const { listings, wishlist: localWishlist } = useMockStore(user?.id || 'guest');
  const [serverSaved, setServerSaved] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      try {
        const items = await api.wishlist.list();
        if (items && items.length > 0) {
          setServerSaved(items as Listing[]);
        }
      } catch (err) {
        console.warn('Could not load server wishlist:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWishlist();
  }, []);

  const localSavedListings = listings.filter((item) => localWishlist.includes(item.id));
  const savedListings = serverSaved.length > 0 ? serverSaved : localSavedListings;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        <div className="pb-6 border-b border-cream-200">
          <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">
            Saved Wishlist ({savedListings.length})
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
            Keep track of items you are considering buying, renting, or swapping in Davanagere.
          </p>
        </div>

        {savedListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedListings.map((item) => (
              <ProductCard key={item.id} listing={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-400 flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-charcoal-900 text-base">Your wishlist is currently empty</h3>
              <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1">
                Tap the heart icon on any marketplace item to save it here for later.
              </p>
            </div>
            <Link to="/marketplace">
              <Button variant="primary" size="sm">
                Explore Marketplace
              </Button>
            </Link>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default WishlistPage;
