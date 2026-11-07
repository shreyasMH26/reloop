import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  Calendar, 
  ArrowRightLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  AlertCircle,
  Inbox,
  Send
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { formatPrice } from '../../lib/utils';
import { api } from '../../services/api';

export const RequestsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [incoming, setIncoming] = useState<any[]>([]);
  const [outgoing, setOutgoing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRequests() {
    setLoading(true);
    try {
      const [inc, out] = await Promise.all([
        api.requests.getIncoming().catch(() => []),
        api.requests.getOutgoing().catch(() => []),
      ]);
      setIncoming(inc);
      setOutgoing(out);
    } catch (err: any) {
      console.warn('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const handleUpdateStatus = async (id: string, status: 'accepted' | 'rejected' | 'completed' | 'cancelled') => {
    try {
      await api.requests.updateStatus(id, status);
      toast(`Request marked as ${status}!`, 'success');
      loadRequests();
    } catch (err: any) {
      toast(err.message || 'Failed to update request', 'error');
    }
  };

  const requestsToShow = activeTab === 'incoming' ? incoming : outgoing;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-200">
          <div>
            <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">
              Purchase & Handover Requests
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
              Manage incoming buy, rent, and barter proposals from the Davanagere community.
            </p>
          </div>

          <div className="flex bg-cream-100 p-1 rounded-xl border border-cream-200">
            <button
              onClick={() => setActiveTab('incoming')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'incoming'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <Inbox className="w-3.5 h-3.5 text-sage-600" />
              Incoming ({incoming.length})
            </button>
            <button
              onClick={() => setActiveTab('outgoing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'outgoing'
                  ? 'bg-white text-charcoal-900 shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <Send className="w-3.5 h-3.5 text-sage-600" />
              Outgoing ({outgoing.length})
            </button>
          </div>
        </div>

        {/* List */}
        {requestsToShow.length > 0 ? (
          <div className="space-y-4">
            {requestsToShow.map((req) => (
              <div 
                key={req.id} 
                className="bg-cream-50 p-5 rounded-2xl border border-cream-200 space-y-4 hover:border-sage-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={req.product?.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&q=80'} 
                      alt="item" 
                      className="w-14 h-14 rounded-xl object-cover border border-cream-200 shrink-0" 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sage-100 text-sage-800">
                          {req.request_type}
                        </span>
                        <h3 className="font-bold text-charcoal-900 text-sm line-clamp-1">
                          {req.product?.title || 'Marketplace Item'}
                        </h3>
                      </div>
                      <p className="text-xs text-charcoal-500 mt-1">
                        {activeTab === 'incoming' ? (
                          <>Buyer: <span className="font-semibold text-charcoal-800">{req.buyer?.full_name || 'Neighbor'}</span> ({req.buyer?.area || 'Davanagere'})</>
                        ) : (
                          <>Seller: <span className="font-semibold text-charcoal-800">{req.seller?.full_name || 'Neighbor'}</span> ({req.seller?.area || 'Davanagere'})</>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {req.status === 'pending' && <Badge variant="amber" size="sm">Pending</Badge>}
                    {req.status === 'accepted' && <Badge variant="green" size="sm">Accepted / Ready for Meetup</Badge>}
                    {req.status === 'completed' && <Badge variant="default" size="sm">Completed</Badge>}
                    {req.status === 'rejected' && <Badge variant="rose" size="sm">Declined</Badge>}
                    {req.status === 'cancelled' && <Badge variant="default" size="sm">Cancelled</Badge>}
                  </div>
                </div>

                {/* Specifics Box */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-cream-200 text-xs">
                  <div>
                    <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Offer Amount</span>
                    <span className="font-extrabold text-charcoal-900 text-sm">{formatPrice(req.offered_price || 0)}</span>
                  </div>
                  {req.request_type === 'rent' && (
                    <>
                      <div>
                        <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Start Date</span>
                        <span className="font-semibold text-charcoal-800">{req.rental_start_date || 'TBD'}</span>
                      </div>
                      <div>
                        <span className="text-charcoal-400 block text-[10px] uppercase font-bold">End Date</span>
                        <span className="font-semibold text-charcoal-800">{req.rental_end_date || 'TBD'}</span>
                      </div>
                    </>
                  )}
                  {req.request_type === 'exchange' && (
                    <div className="col-span-2">
                      <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Item Offered in Trade</span>
                      <span className="font-semibold text-charcoal-800">{req.exchange_item_title || 'Barter proposal'}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Requested On</span>
                    <span className="font-medium text-charcoal-600">{new Date(req.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {req.message && (
                  <p className="text-xs text-charcoal-700 bg-white/80 p-3 rounded-xl italic border border-cream-100">
                    "{req.message}"
                  </p>
                )}

                {/* Actions for Seller (Incoming) */}
                {activeTab === 'incoming' && req.status === 'pending' && (
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
                      onClick={() => handleUpdateStatus(req.id, 'accepted')}
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                    >
                      Accept & Meet
                    </Button>
                  </div>
                )}

                {activeTab === 'incoming' && req.status === 'accepted' && (
                  <div className="flex justify-end pt-1">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => handleUpdateStatus(req.id, 'completed')}
                      icon={<CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />}
                    >
                      Mark Handover Completed
                    </Button>
                  </div>
                )}

                {/* Actions for Buyer (Outgoing) */}
                {activeTab === 'outgoing' && req.status === 'pending' && (
                  <div className="flex justify-end pt-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleUpdateStatus(req.id, 'cancelled')}
                    >
                      Cancel Request
                    </Button>
                  </div>
                )}

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-3 bg-cream-50 rounded-3xl border border-cream-200">
            <Inbox className="w-12 h-12 text-charcoal-300 mx-auto" />
            <h3 className="font-bold text-charcoal-900 text-base">
              {activeTab === 'incoming' ? 'No incoming requests yet' : 'No outgoing requests placed'}
            </h3>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
              {activeTab === 'incoming'
                ? 'When neighbors or students in Davanagere place an offer on your listings, it will appear here.'
                : 'Browse the marketplace and submit purchase, rental, or exchange requests on pre-owned items.'}
            </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default RequestsPage;
