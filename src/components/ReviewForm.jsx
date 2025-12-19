import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import StarRating from '@/components/StarRating.jsx';
import { X, Loader2, Send } from 'lucide-react';
import { reviewApi } from '@/services/api.js';
import { toast } from '@/hooks/use-toast';

/**
 * ReviewForm Component - Modal for submitting reviews
 */
const ReviewForm = ({
    isOpen,
    onClose,
    productId,
    productName,
    orderId,
    onReviewSubmitted,
}) => {
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            toast({
                title: 'Rating required',
                description: 'Please select a star rating',
                variant: 'destructive',
            });
            return;
        }

        if (!productId || !orderId) {
            toast({
                title: 'Missing information',
                description: 'Product or order information is missing. Please try again.',
                variant: 'destructive',
            });
            console.error('Review submission error:', { productId, orderId, rating });
            return;
        }

        try {
            setLoading(true);
            await reviewApi.create({
                productId,
                orderId,
                rating,
                title,
                comment,
            });

            toast({
                title: 'Review submitted! ⭐',
                description: 'Thank you for your feedback!',
            });

            // Reset form
            setRating(0);
            setTitle('');
            setComment('');

            if (onReviewSubmitted) {
                onReviewSubmitted();
            }
            onClose();
        } catch (error) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to submit review',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="bg-card rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-golden p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Write a Review</h2>
                            <p className="text-white/80 text-sm mt-1">{productName}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-3">
                            Your Rating *
                        </label>
                        <div className="flex items-center gap-3">
                            <StarRating
                                rating={rating}
                                onRatingChange={setRating}
                                interactive={true}
                                size="lg"
                            />
                            {rating > 0 && (
                                <span className="text-sm text-muted-foreground">
                                    {rating === 1 && 'Poor'}
                                    {rating === 2 && 'Fair'}
                                    {rating === 3 && 'Good'}
                                    {rating === 4 && 'Very Good'}
                                    {rating === 5 && 'Excellent!'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Review Title
                        </label>
                        <Input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Sum it up in a few words..."
                            maxLength={100}
                            className="rounded-xl"
                        />
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Your Review
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us what you thought about this product..."
                            maxLength={500}
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                        />
                        <span className="text-xs text-muted-foreground">
                            {comment.length}/500
                        </span>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={loading || rating === 0}
                        className="w-full rounded-full py-6 font-semibold bg-gradient-to-r from-primary to-golden hover:opacity-90"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5 mr-2" />
                                Submit Review
                            </>
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ReviewForm;
