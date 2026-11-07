import React, { useEffect, useState } from 'react';
import { 
  CheckCircle2, 
  Receipt,
  Package,
  Star
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { formatPrice } from '../../lib/utils';
import { api } from '../../services/api';
import { ReviewModal } from '../../components/reviews/ReviewModal';

export const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'purchases' | 'sales'>('all');
  const [data, setData] = useState<{ all: any[]; purchases: any[]; sales: any[] }>({
    all: [],
    purchases: [],
    sales: [],
  });
  const [loading, setLoading] = useState(true);

  // Review modal state
  const [reviewOrder, setReviewOrder] = useState<any | null>(null);

  const loadOrders = async () => {
    try {
      const res = await api.orders.list();
      setData(res);
    } catch (err) {
      console.warn('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const orders = activeTab === 'all' ? data.all : activeTab === 'purchases' ? data.purchases : data.sales;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-200">
          <div>
            <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">
              Order & Transaction History
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
              Verified local community exchanges, completed sales, and handovers in Davanagere.
            </p>
          </div>

          <div className="flex bg-cream-100 p-1 rounded-xl border border-cream-200">
            {(['all', 'purchases', 'sales'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeTab === tab
                    ? 'bg-white text-charcoal-900 shadow-xs'
                    : 'text-charcoal-600 hover:text-charcoal-900'
                }`}
              >
                {tab} ({tab === 'all' ? data.all.length : tab === 'purchases' ? data.purchases.length : data.sales.length})
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((ord) => {
              const isBuyer = ord.buyer_id === user?.id;
              const counterpartName = isBuyer ? ord.seller?.full_name || 'Seller' : ord.buyer?.full_name || 'Buyer';
              const itemTitle = ord.product?.title || 'Marketplace Item';

              return (
                <div 
                  key={ord.id} 
                  className="bg-cream-50 p-5 rounded-2xl border border-cream-200 space-y-4 hover:border-sage-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-sage-100 text-sage-800 flex items-center justify-center font-bold shrink-0">
                        <Receipt className="w-5 h-5 text-sage-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isBuyer ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isBuyer ? 'Purchased' : 'Sold by You'}
                          </span>
                          <h3 className="font-bold text-charcoal-900 text-sm">
                            {itemTitle}
                          </h3>
                        </div>
                        <p className="text-xs text-charcoal-500 mt-1">
                          {isBuyer ? (
                            <>Seller: <span className="font-semibold text-charcoal-800">{counterpartName}</span></>
                          ) : (
                            <>Buyer: <span className="font-semibold text-charcoal-800">{counterpartName}</span></>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="green" size="sm">
                        <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Handover Complete
                      </Badge>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Star className="w-3.5 h-3.5 text-amber-500" />}
                        onClick={() => setReviewOrder(ord)}
                      >
                        Rate Experience
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-cream-200 text-xs">
                    <div>
                      <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Transaction Value</span>
                      <span className="font-extrabold text-charcoal-900 text-sm">{formatPrice(ord.amount)}</span>
                    </div>
                    <div>
                      <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Payment Method</span>
                      <span className="font-semibold text-charcoal-800">{ord.payment_method || 'UPI on Handover'}</span>
                    </div>
                    <div>
                      <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Handover Location</span>
                      <span className="font-semibold text-charcoal-800">{ord.handover_address || 'Agreed Public Point'}</span>
                    </div>
                    <div>
                      <span className="text-charcoal-400 block text-[10px] uppercase font-bold">Date</span>
                      <span className="font-medium text-charcoal-600">{new Date(ord.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 space-y-3 bg-cream-50 rounded-3xl border border-cream-200">
            <Package className="w-12 h-12 text-charcoal-300 mx-auto" />
            <h3 className="font-bold text-charcoal-900 text-base">No completed orders yet</h3>
            <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
              When an item handover is confirmed and completed between neighbors, your transaction records and sustainability receipts appear here.
            </p>
          </div>
        )}

        {/* Review Modal */}
        {reviewOrder && (
          <ReviewModal
            isOpen={Boolean(reviewOrder)}
            onClose={() => setReviewOrder(null)}
            orderId={reviewOrder.id}
            counterpartName={
              reviewOrder.buyer_id === user?.id
                ? reviewOrder.seller?.full_name || 'Seller'
                : reviewOrder.buyer?.full_name || 'Buyer'
            }
            itemTitle={reviewOrder.product?.title || 'Marketplace Item'}
            onSuccess={loadOrders}
          />
        )}

      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;
