import React from 'react';
import { ArrowRightLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { useMockStore } from '../../hooks/useMockStore';
import { formatPrice } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';

export const ExchangesPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { exchangeProposals, update } = useMockStore(user?.id || 'guest');

  const handleUpdateStatus = (id: string, status: 'accepted' | 'rejected') => {
    update((s) => ({
      ...s,
      exchangeProposals: s.exchangeProposals.map((ex) => (ex.id === id ? { ...ex, status } : ex)),
    }));
    toast(`Exchange offer ${status === 'accepted' ? 'accepted! Arrange local handover.' : 'declined.'}`, 'info');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        <div className="pb-6 border-b border-cream-200">
          <h1 className="text-2xl font-extrabold text-charcoal-900 tracking-tight">
            Exchange & Barter Proposals
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-0.5">
            Peer-to-peer item swaps. Trade textbooks, musical instruments, cycles, and gadgets without cash.
          </p>
        </div>

        {exchangeProposals.length > 0 ? (
          <div className="space-y-4">
            {exchangeProposals.map((prop) => (
              <div 
                key={prop.id} 
                className="bg-cream-50 p-5 rounded-2xl border border-cream-200 space-y-4 hover:border-amber-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src={prop.listing_image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80'} 
                      alt="item" 
                      className="w-12 h-12 rounded-xl object-cover" 
                    />
                    <div>
                      <h3 className="font-bold text-charcoal-900 text-sm">Target: {prop.listing_title}</h3>
                      <p className="text-xs text-charcoal-500">
                        Proposed by: <span className="font-semibold text-charcoal-800">{prop.proposer_name}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {prop.status === 'pending' && <Badge variant="amber" size="sm">Under Review</Badge>}
                    {prop.status === 'accepted' && <Badge variant="green" size="sm">Offer Accepted</Badge>}
                    {prop.status === 'rejected' && <Badge variant="rose" size="sm">Offer Declined</Badge>}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-cream-200 space-y-2 text-xs">
                  <p className="font-bold text-charcoal-900">
                    Offered Item: <span className="font-normal text-charcoal-700">{prop.offering_description}</span>
                  </p>
                  {prop.additional_payment && prop.additional_payment > 0 ? (
                    <p className="font-bold text-sage-700">
                      Additional Cash Adjustment Included: <span className="font-normal">{formatPrice(prop.additional_payment)}</span>
                    </p>
                  ) : null}
                  {prop.message && (
                    <p className="text-charcoal-500 italic pt-1 border-t border-cream-100">
                      "{prop.message}"
                    </p>
                  )}
                </div>

                {prop.status === 'pending' && (
                  <div className="flex justify-end gap-2 pt-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleUpdateStatus(prop.id, 'rejected')}
                      icon={<XCircle className="w-3.5 h-3.5 text-rose-500" />}
                    >
                      Decline
                    </Button>
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => handleUpdateStatus(prop.id, 'accepted')}
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      Accept Barter
                    </Button>
                  </div>
                )}

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 space-y-3">
            <ArrowRightLeft className="w-12 h-12 text-charcoal-300 mx-auto" />
            <h3 className="font-bold text-charcoal-900 text-base">No barter proposals yet</h3>
            <p className="text-xs text-charcoal-500">
              When users propose item-for-item exchanges on your listings, you will be able to review their offers here.
            </p>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default ExchangesPage;
