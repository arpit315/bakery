import { useState, useEffect } from 'react';
import StarRating from '@/components/StarRating.jsx';
import { reviewApi } from '@/services/api.js';
import { Loader2, CheckCircle, User } from 'lucide-react';

/**
 * ReviewList Component - Display reviews for a product
 */
const ReviewList = ({ productId, limit = 5 }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!productId) return;

            try {
                setLoading(true);
                const response = await reviewApi.getByProduct(productId);
                setReviews(response.data || []);
                setError(null);
            } catch (err) {
                setError(err.message);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [productId]);

    if (loading) {
        return (
            <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">
                Could not load reviews
            </p>
        );
    }

    if (reviews.length === 0) {
        return (
            <p className="text-sm text-muted-foreground text-center py-4">
                No reviews yet. Be the first to review!
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.slice(0, limit).map((review) => (
                <div
                    key={review._id}
                    className="bg-muted/50 rounded-xl p-4 animate-fade-up"
                >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-golden flex items-center justify-center text-white font-bold">
                                {review.customerName?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-foreground">
                                        {review.customerName}
                                    </span>
                                    {review.verified && (
                                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                                            <CheckCircle className="w-3 h-3" />
                                            Verified
                                        </span>
                                    )}
                                </div>
                                <StarRating rating={review.rating} size="sm" />
                            </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            })}
                        </span>
                    </div>

                    {/* Content */}
                    {review.title && (
                        <h4 className="font-semibold text-foreground mt-3">
                            {review.title}
                        </h4>
                    )}
                    {review.comment && (
                        <p className="text-sm text-muted-foreground mt-2">
                            {review.comment}
                        </p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
