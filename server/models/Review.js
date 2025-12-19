import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    // The product being reviewed
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required'],
    },
    // The order that contains this product (ensures verified purchase)
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: [true, 'Order is required'],
    },
    // Optional user reference (for logged-in users)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    // Customer name (from order, for display)
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
    },
    // Rating 1-5
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
    },
    // Review title
    title: {
        type: String,
        maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    // Review comment
    comment: {
        type: String,
        maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    // Verified purchase badge
    verified: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Prevent duplicate reviews (one per product per order)
reviewSchema.index({ product: 1, order: 1 }, { unique: true });

// Static method to calculate average rating for a product
reviewSchema.statics.calcAverageRating = async function (productId) {
    const stats = await this.aggregate([
        { $match: { product: productId } },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' },
                reviewCount: { $sum: 1 },
            },
        },
    ]);

    const Product = mongoose.model('Product');

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(productId, {
            averageRating: Math.round(stats[0].averageRating * 10) / 10,
            reviewCount: stats[0].reviewCount,
        });
    } else {
        await Product.findByIdAndUpdate(productId, {
            averageRating: 0,
            reviewCount: 0,
        });
    }
};

// Update product rating after save
reviewSchema.post('save', function () {
    this.constructor.calcAverageRating(this.product);
});

// Update product rating after delete
reviewSchema.post('findOneAndDelete', function (doc) {
    if (doc) {
        doc.constructor.calcAverageRating(doc.product);
    }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
