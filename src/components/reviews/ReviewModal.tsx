import React, { useState } from 'react';
import { Star, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { api } from '../../services/api';
import { useToast } from '../ui/Toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  counterpartName: string;
  itemTitle: string;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  orderId,
  counterpartName,
  itemTitle,
  onSuccess,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast('Please write a brief comment about your experience.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await api.reviews.create({
        order_id: orderId,
        rating,
        comment: comment.trim(),
      });
      setSubmitted(true);
      toast('Thank you for contributing to community trust!', 'success');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setSubmitted(false);
        setComment('');
      }, 1500);
    } catch (err: any) {
      toast(err.message || 'Failed to submit review', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-modal border border-cream-200 p-6 sm:p-8 text-center overflow-hidden">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 rounded-xl text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 space-y-3">
            <div className="w-16 h-16 rounded-full bg-sage-100 text-sage-600 mx-auto flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-charcoal-900">Review Published!</h3>
            <p className="text-sm text-charcoal-600">
              Your honest feedback helps make Davanagere's circular economy safe and dependable.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-100 text-sage-800 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Handover Review
              </div>
              <h3 className="text-xl font-extrabold text-charcoal-900">
                Rate your experience
              </h3>
              <p className="text-xs text-charcoal-500">
                With <span className="font-semibold text-charcoal-700">{counterpartName}</span> for{' '}
                <span className="font-semibold text-charcoal-700">"{itemTitle}"</span>
              </p>
            </div>

            {/* Star Rating Select */}
            <div className="flex justify-center items-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-cream-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>

            {/* Comment Area */}
            <div>
              <label className="block text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-1.5">
                Your Feedback
              </label>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Was the item in good condition? Punctual meetup? Friendly communication?"
                className="w-full px-4 py-3 rounded-2xl border border-cream-300 bg-cream-50/50 text-charcoal-900 text-sm outline-none focus:ring-2 focus:ring-sage-500 transition-all resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={loading}
              >
                Submit Review
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
