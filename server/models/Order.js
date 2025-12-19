import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    image: String,
});

const orderSchema = new mongoose.Schema({
    // Customer info (for guest checkout)
    customerName: {
        type: String,
        required: [true, 'Customer name is required'],
    },
    customerEmail: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^\S+@\S+\.\S+$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    customerPhone: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: function (v) {
                // Indian mobile number - 10 digits starting with 6-9
                return /^[6-9]\d{9}$/.test(v);
            },
            message: 'Please enter a valid 10-digit mobile number'
        }
    },
    customerAddress: {
        type: String,
        required: [true, 'Delivery address is required'],
    },
    customerPincode: {
        type: String,
        required: [true, 'Pincode is required'],
        validate: {
            validator: function (v) {
                // Indian pincode validation - 6 digits
                return /^[1-9][0-9]{5}$/.test(v);
            },
            message: 'Invalid pincode. Must be 6 digits.'
        }
    },
    // Optional user reference (for logged in users)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    // Order items
    items: [orderItemSchema],
    // Pricing
    subtotal: {
        type: Number,
        required: true,
    },
    deliveryFee: {
        type: Number,
        default: 5.00,
    },
    total: {
        type: Number,
        required: true,
    },
    // Payment info
    paymentId: {
        type: String,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
    },
    // Order status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending',
    },
}, {
    timestamps: true,
});

// Generate order ID
orderSchema.pre('save', async function (next) {
    if (this.isNew) {
        const count = await mongoose.model('Order').countDocuments();
        this.orderNumber = `ORD-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

orderSchema.add({
    orderNumber: {
        type: String,
        unique: true,
    },
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
