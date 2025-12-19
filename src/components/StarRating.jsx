import { useState } from 'react';
import { Star } from 'lucide-react';

/**
 * StarRating Component
 * 
 * @param {number} rating - Current rating value (0-5)
 * @param {function} onRatingChange - Callback when rating changes (only in interactive mode)
 * @param {boolean} interactive - If true, stars are clickable
 * @param {string} size - 'sm', 'md', or 'lg'
 * @param {boolean} showValue - If true, shows the numeric rating value
 */
const StarRating = ({
    rating = 0,
    onRatingChange,
    interactive = false,
    size = 'md',
    showValue = false,
}) => {
    const [hoverRating, setHoverRating] = useState(0);

    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    const handleClick = (value) => {
        if (interactive && onRatingChange) {
            onRatingChange(value);
        }
    };

    const displayRating = hoverRating || rating;

    return (
        <div className="flex items-center gap-1">
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= displayRating;
                    const isHalf = !isFilled && star - 0.5 <= displayRating;

                    return (
                        <button
                            key={star}
                            type="button"
                            onClick={() => handleClick(star)}
                            onMouseEnter={() => interactive && setHoverRating(star)}
                            onMouseLeave={() => interactive && setHoverRating(0)}
                            disabled={!interactive}
                            className={`
                ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                transition-transform duration-200
                disabled:opacity-100
              `}
                        >
                            <Star
                                className={`
                  ${sizes[size]}
                  ${isFilled ? 'fill-golden text-golden' : isHalf ? 'fill-golden/50 text-golden' : 'fill-transparent text-muted-foreground/40'}
                  transition-colors duration-200
                `}
                            />
                        </button>
                    );
                })}
            </div>
            {showValue && rating > 0 && (
                <span className="text-sm font-medium text-muted-foreground ml-1">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default StarRating;
