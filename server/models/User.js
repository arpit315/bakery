import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^\S+@\S+\.\S+$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    password: {
        type: String,
        required: function () {
            // Password is required only if not using Google OAuth
            return !this.googleId;
        },
        minlength: [6, 'Password must be at least 6 characters'],
        select: false, // Don't include password in queries by default
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true, // Allows multiple null values
    },
    avatar: {
        type: String, // Google profile picture URL
    },
    phone: {
        type: String,
        required: function () {
            // Phone is required only if not using Google OAuth
            return !this.googleId;
        },
        validate: {
            validator: function (v) {
                // Indian mobile number - 10 digits starting with 6-9
                // Skip validation if empty (for Google users)
                return !v || /^[6-9]\d{9}$/.test(v);
            },
            message: 'Please enter a valid 10-digit mobile number'
        }
    },
    address: {
        type: String,
    },
    pincode: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                // Indian pincode validation - 6 digits
                return !v || /^[1-9][0-9]{5}$/.test(v);
            },
            message: 'Invalid pincode. Must be 6 digits.'
        }
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    // Email verification
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    emailOTP: {
        type: String,
        select: false,
    },
    emailOTPExpires: {
        type: Date,
        select: false,
    },
    // Phone verification
    isPhoneVerified: {
        type: Boolean,
        default: false,
    },
    phoneOTP: {
        type: String,
        select: false,
    },
    phoneOTPExpires: {
        type: Date,
        select: false,
    },
    // Account activation (for registration OTP flow)
    isActive: {
        type: Boolean,
        default: false,
    },
    registrationOTP: {
        type: String,
        select: false,
    },
    registrationOTPExpires: {
        type: Date,
        select: false,
    },
}, {
    timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate OTP
userSchema.methods.generateOTP = function () {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const User = mongoose.model('User', userSchema);

export default User;
