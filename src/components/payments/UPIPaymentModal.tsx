import React, { useState } from 'react';
import { 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  X, 
  Smartphone, 
  AlertCircle 
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatPrice } from '../../lib/utils';
import { buildUpiDeepLink, getUpiQrCodeUrl, getVpaForUser } from '../../lib/upi';
import { useToast } from '../ui/Toast';

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId?: string;
  itemTitle: string;
  amount: number;
  sellerName: string;
  sellerId?: string;
  sellerVpa?: string;
  onPaymentConfirmed?: () => void;
}

export const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({
  isOpen,
  onClose,
  orderId = 'ord-quick',
  itemTitle,
  amount,
  sellerName,
  sellerId,
  sellerVpa,
  onPaymentConfirmed,
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const vpa = sellerVpa || getVpaForUser(sellerId);
  const upiLink = buildUpiDeepLink({
    vpa,
    payeeName: sellerName,
    amount,
    note: `ReLoop Handover - ${itemTitle.slice(0, 20)}`,
    transactionRef: orderId,
  });

  const qrCodeUrl = getUpiQrCodeUrl(upiLink, 280);

  const handleCopyVpa = async () => {
    try {
      await navigator.clipboard.writeText(vpa);
      setCopied(true);
      toast('UPI ID copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Failed to copy UPI ID', 'error');
    }
  };

  const handleConfirmHandover = () => {
    setConfirmed(true);
    toast('Handover payment recorded! Thank you for supporting the circular economy.', 'success');
    setTimeout(() => {
      if (onPaymentConfirmed) onPaymentConfirmed();
      onClose();
      setConfirmed(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-modal border border-cream-200 p-6 sm:p-7 text-center overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Handover Payment
          </div>
          <h3 className="text-xl font-black text-charcoal-900 tracking-tight">
            Pay {sellerName}
          </h3>
          <p className="text-xs text-charcoal-500 line-clamp-1">
            For "{itemTitle}"
          </p>
        </div>

        {/* Amount Card */}
        <div className="bg-cream-50 border border-cream-200 p-4 rounded-2xl mb-4 text-center">
          <span className="text-[10px] uppercase font-bold text-charcoal-400 block tracking-wider">
            Total Amount Due on Handover
          </span>
          <span className="text-3xl font-black text-charcoal-900">
            {formatPrice(amount)}
          </span>
        </div>

        {/* QR Code Frame */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="p-3 bg-white border-2 border-dashed border-sage-300 rounded-2xl shadow-xs inline-block">
            <img
              src={qrCodeUrl}
              alt={`UPI QR code to pay ${sellerName}`}
              className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-xl"
            />
          </div>
          <p className="text-[11px] text-charcoal-500 mt-2 font-medium">
            Scan using any UPI app (GPay, PhonePe, Paytm, BHIM)
          </p>
        </div>

        {/* VPA Copy Bar */}
        <div className="mt-3 flex items-center justify-between gap-2 p-2.5 bg-cream-100/80 rounded-xl border border-cream-200 text-xs">
          <div className="text-left overflow-hidden">
            <span className="text-[9px] uppercase font-bold text-charcoal-400 block">Seller UPI ID</span>
            <span className="font-mono font-bold text-charcoal-800 text-xs truncate block">{vpa}</span>
          </div>
          <button
            type="button"
            onClick={handleCopyVpa}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-cream-300 hover:bg-cream-50 text-charcoal-700 font-semibold transition-all shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Mobile Direct UPI Intent Link */}
        <div className="mt-3">
          <a
            href={upiLink}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs bg-sage-50 text-sage-800 border border-sage-200 hover:bg-sage-100 transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            <span>Open in Installed UPI App</span>
            <ExternalLink className="w-3 h-3 text-sage-500 ml-1" />
          </a>
        </div>

        {/* Safety Notice */}
        <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-left flex items-start gap-2 text-[11px] text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Campus Safety:</strong> Inspect the item thoroughly in person before completing your payment.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2.5 mt-5">
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            fullWidth
            loading={confirmed}
            onClick={handleConfirmHandover}
          >
            Confirm Handover
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UPIPaymentModal;
