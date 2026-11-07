import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, PlusCircle, Trash2, ExternalLink, Tag, Calendar, ArrowRightLeft } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useMockStore } from '../../hooks/useMockStore';
import { formatPrice, timeAgo } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import type { Listing } from '../../types';

export const MyListingsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { listings: localListings, deleteListing } = useMockStore(user?.id || 'guest');
  const [serverListings, setServerListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadMyListings() {
    if (!user) return;
    try {
      const res = await api.products.list({ seller_id: user.id });
      if (res?.items) {
        setServerListings(res.items as Listing[]);
      }
    } catch (err) {
      console.warn('Could not load server listings:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyListings();
  }, [user]);

  const userLocalListings = localListings.filter((l) => l.seller_id === (user?.id || 'guest_user'));
  const myListings = serverListings.length > 0 ? serverListings : userLocalListings;

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await api.products.delete(id);
        deleteListing(id);
        toast('Listing removed from marketplace', 'info');
        loadMyListings();
      } catch {
        deleteListing(id);
        toast('Listing removed from marketplace', 'info');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-200">
          <div>
            <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">
              My Active Listings
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
              Manage your products listed for sale, rent, or exchange in Davanagere.
            </p>
          </div>

          <Link to="/listings/new">
            <Button variant="primary" size="sm" icon={<PlusCircle className="w-4 h-4" />}>
              Create New Listing
            </Button>
          </Link>
        </div>

        {myListings.length > 0 ? (
          <div className="space-y-3">
            {myListings.map((item) => (
              <div 
                key={item.id} 
                className="bg-cream-50 p-4 rounded-2xl border border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-sage-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.images[0] || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'}
                    alt={item.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {item.listing_type === 'sell' && <Badge variant="green" size="sm">For Sale</Badge>}
                      {item.listing_type === 'rent' && <Badge variant="default" size="sm">Rental</Badge>}
                      {item.listing_type === 'exchange' && <Badge variant="amber" size="sm">Barter</Badge>}
                      <span className="text-[11px] text-charcoal-400">
                        {item.area} · Listed {timeAgo(item.created_at)}
                      </span>
                    </div>

                    <Link to={`/listings/${item.id}`} className="font-bold text-charcoal-900 text-sm hover:text-sage-600">
                      {item.title}
                    </Link>

                    <p className="text-xs font-extrabold text-charcoal-800 mt-0.5">
                      {item.listing_type === 'rent' ? `${formatPrice(item.price_per_day || item.price)}/day` : formatPrice(item.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link to={`/listings/${item.id}`}>
                    <Button variant="outline" size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                      View
                    </Button>
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-2 rounded-xl text-charcoal-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-cream-100 text-charcoal-400 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8 text-charcoal-400" />
            </div>
            <div>
              <h3 className="font-bold text-charcoal-900 text-base">No listings created yet</h3>
              <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1">
                Have pre-owned electronics, textbooks, musical instruments, or tools? Post them to give them another life.
              </p>
            </div>
            <Link to="/listings/new">
              <Button variant="primary" size="sm">
                Create First Listing
              </Button>
            </Link>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default MyListingsPage;
