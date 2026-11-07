import React from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, User } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useMockStore } from '../../hooks/useMockStore';
import { formatPrice } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';

export const RentalsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { rentalRequests, update } = useMockStore(user?.id || 'guest');

  const handleUpdateStatus = (id: string, status: 'approved' | 'rejected' | 'completed') => {
    update((s) => ({
      ...s,
      rentalRequests: s.rentalRequests.map((r) => (r.id === id ? { ...r, status } : r)),
    }));
    toast(`Rental request marked as ${status}!`, 'success');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        <div className="pb-6 border-b border-cream-200">
          <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">
            Rental Management
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
            Coordinate equipment and item rentals across Davanagere. Prevents redundant purchases.
          </p>
        </div>

        {rentalRequests.length > 0 ? (
          <div className="space-y-4">
            {rentalRequests.map((req) => (
              <div 
                key={req.id} 
                className="bg-cream-50 p-5 rounded-2xl border border-cream-200 space-y-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={req.listing_image || 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&q=80'} 
                      alt="item" 
                      className="w-12 h-12 rounded-xl object-cover" 
                    />
                    <div>
                      <h3 className="font-bold text-charcoal-900 text-sm">{req.listing_title}</h3>
                      <p className="text-xs text-charcoal-500">
                        Renter: <span className="font-semibold text-charcoal-800">{req.renter_name}</span> • Owner: <span className="font-semibold text-charcoal-800">{req.owner_name}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === 'pending' && <Badge variant="amber" size="sm">Pending Approval</Badge>}
                    {req.status === 'approved' && <Badge variant="green" size="sm">Booking Confirmed</Badge>}
                    {req.status === 'completed' && <Badge variant="default" size="sm">Completed</Badge>}
                    {req.status === 'rejected' && <Badge variant="rose" size="sm">Declined</Badge>}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-cream-200 text-xs">
                  <div>
                    <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Start Date</span>
                    <span className="font-semibold text-charcoal-800">{req.start_date}</span>
                  </div>
                  <div>
                    <span className="text-charcoal-400 block text-[10px] uppercase font-bold">End Date</span>
                    <span className="font-semibold text-charcoal-800">{req.end_date}</span>
                  </div>
                  <div>
                    <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Daily Rate</span>
                    <span className="font-semibold text-charcoal-800">{formatPrice(req.price_per_day)}/day</span>
                  </div>
                  <div>
                    <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Total Cost</span>
                    <span className="font-bold text-sage-700">{formatPrice(req.total_price)}</span>
                  </div>
                </div>

                {req.message && (
                  <p className="text-xs text-charcoal-600 bg-white/60 p-2.5 rounded-xl italic">
                    "{req.message}"
                  </p>
                )}

                {req.status === 'pending' && (
                  <div className="flex justify-end gap-2 pt-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleUpdateStatus(req.id, 'rejected')}
                      icon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
                    >
                      Decline
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleUpdateStatus(req.id, 'approved')}
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Approve Booking
                    </Button>
                  </div>
                )}

                {req.status === 'approved' && (
                  <div className="flex justify-end pt-1">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleUpdateStatus(req.id, 'completed')}
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Mark Returned & Complete
                    </Button>
                  </div>
                )}

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-3">
            <Calendar className="w-12 h-12 text-charcoal-300 mx-auto" />
            <h3 className="font-bold text-charcoal-900 text-base">No rental bookings yet</h3>
            <p className="text-xs text-charcoal-500">
              When someone requests to rent your equipment or when you request an item, details will appear here.
            </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default RentalsPage;
