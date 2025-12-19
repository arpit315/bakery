import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendEmail, emailTemplates } from '../utils/email.js';

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
    try {
        const { name, email, password, phone, address, pincode } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            phone,
            address,
            pincode,
        });

        const token = generateToken(user._id);

        // Send welcome email
        const welcomeEmail = emailTemplates.welcome(name);
        await sendEmail({
            to: email,
            ...welcomeEmail
        });

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                pincode: user.pincode,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified,
                token,
            },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                pincode: user.pincode,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified,
                token,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
    try {
        const { name, phone, address, pincode } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, phone, address, pincode },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Send email verification OTP
// @route   POST /api/auth/send-email-otp
// @access  Private
export const sendEmailOTP = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified',
            });
        }

        // Generate OTP
        const otp = user.generateOTP();

        // Save OTP to user (expires in 10 minutes)
        user.emailOTP = otp;
        user.emailOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save({ validateBeforeSave: false });

        // Send email
        const otpEmail = emailTemplates.emailOTP(user.name, otp);
        const emailResult = await sendEmail({
            to: user.email,
            ...otpEmail
        });

        res.json({
            success: true,
            message: 'OTP sent to your email',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Private
export const verifyEmail = async (req, res) => {
    try {
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide OTP',
            });
        }

        const user = await User.findById(req.user._id).select('+emailOTP +emailOTPExpires');

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified',
            });
        }

        // Check if OTP is valid and not expired
        if (!user.emailOTP || user.emailOTP !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
            });
        }

        if (user.emailOTPExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.',
            });
        }

        // Mark email as verified
        user.isEmailVerified = true;
        user.emailOTP = undefined;
        user.emailOTPExpires = undefined;
        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            message: 'Email verified successfully',
            data: {
                isEmailVerified: true,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Send phone verification OTP
// @route   POST /api/auth/send-phone-otp
// @access  Private
export const sendPhoneOTP = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user.phone) {
            return res.status(400).json({
                success: false,
                message: 'Please add a phone number first',
            });
        }

        if (user.isPhoneVerified) {
            return res.status(400).json({
                success: false,
                message: 'Phone is already verified',
            });
        }

        // Generate OTP
        const otp = user.generateOTP();

        // Save OTP to user (expires in 10 minutes)
        user.phoneOTP = otp;
        user.phoneOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save({ validateBeforeSave: false });

        // In production, integrate with SMS service (Twilio, MSG91, etc.)
        // For now, we'll log it to console
        console.log(`📱 Phone OTP for ${user.phone}: ${otp}`);

        res.json({
            success: true,
            message: 'OTP sent to your phone',
            // For development only - remove in production
            ...(process.env.NODE_ENV === 'development' && { devOtp: otp }),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Verify phone with OTP
// @route   POST /api/auth/verify-phone
// @access  Private
export const verifyPhone = async (req, res) => {
    try {
        const { otp } = req.body;

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide OTP',
            });
        }

        const user = await User.findById(req.user._id).select('+phoneOTP +phoneOTPExpires');

        if (user.isPhoneVerified) {
            return res.status(400).json({
                success: false,
                message: 'Phone is already verified',
            });
        }

        // Check if OTP is valid and not expired
        if (!user.phoneOTP || user.phoneOTP !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
            });
        }

        if (user.phoneOTPExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.',
            });
        }

        // Mark phone as verified
        user.isPhoneVerified = true;
        user.phoneOTP = undefined;
        user.phoneOTPExpires = undefined;
        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            message: 'Phone verified successfully',
            data: {
                isPhoneVerified: true,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create admin user (for initial setup)
// @route   POST /api/auth/create-admin
// @access  Public (should be removed in production)
export const createAdmin = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: 'admin' });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: 'Admin user already exists',
            });
        }

        const admin = await User.create({
            name,
            email,
            password,
            phone: phone || '9999999999', // Default admin phone
            role: 'admin',
            isEmailVerified: true, // Admin is auto-verified
            isPhoneVerified: true, // Admin is auto-verified
        });

        const token = generateToken(admin._id);

        res.status(201).json({
            success: true,
            message: 'Admin user created successfully',
            data: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                token,
            },
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};
