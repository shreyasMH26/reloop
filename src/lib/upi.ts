/**
 * ReLoop UPI Payment & QR Code Utilities
 * Standardized Unified Payments Interface (UPI) deep linking & QR generation.
 */

export interface UpiPaymentDetails {
  vpa: string; // Virtual Payment Address e.g. ananya@okaxis
  payeeName: string; // Seller/Lender name
  amount: number; // In Rupees e.g. 700
  note?: string; // Transaction note e.g. ReLoop Handover ord-1
  transactionRef?: string; // Order / Request reference ID
}

/**
 * Builds a compliant UPI intent deep link
 * Format: upi://pay?pa={vpa}&pn={payeeName}&am={amount}&cu=INR&tn={note}
 */
export function buildUpiDeepLink({
  vpa,
  payeeName,
  amount,
  note = 'ReLoop Community Exchange',
  transactionRef,
}: UpiPaymentDetails): string {
  const cleanVpa = vpa.trim();
  const cleanName = encodeURIComponent(payeeName.trim());
  const cleanNote = encodeURIComponent(note.trim());
  const refParam = transactionRef ? `&tr=${encodeURIComponent(transactionRef)}` : '';

  return `upi://pay?pa=${cleanVpa}&pn=${cleanName}&am=${amount.toFixed(2)}&cu=INR&tn=${cleanNote}${refParam}`;
}

/**
 * Generates an SVG/PNG QR Code URL for the UPI payment link
 * Uses standard encoded QR data representation
 */
export function getUpiQrCodeUrl(upiLink: string, size = 260): string {
  const encoded = encodeURIComponent(upiLink);
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encoded}`;
}

/**
 * Default Davanagere demo campus VPAs for seamless testing
 */
export const DEFAULT_CAMPUS_VPAS: Record<string, string> = {
  'usr-ananya': 'ananya.sharma@okaxis',
  'usr-karthik': 'karthik.gowda@ybl',
  'usr-ail8yqp': 'rohit.biet@paytm',
  'usr-priya': 'priya.nair@okhdfcbank',
  'usr-admin': 'reloop.campus@upi',
};

export function getVpaForUser(userId?: string, fallback = 'reloop.campus@upi'): string {
  if (!userId) return fallback;
  return DEFAULT_CAMPUS_VPAS[userId] || `${userId.replace(/[^a-zA-Z0-9]/g, '')}@upi`;
}
