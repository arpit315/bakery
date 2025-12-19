import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendEmail, emailTemplates } from '../utils/email.js';

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Initiate registration - creates pending user and sends OTP
// @route   POST /api/auth/initiate-register
// @access  Public
export const initiateRegistration = async (req, res) => {
    try {
        const { name, email, password, phone, address, pincode } = req.body;

        // Check if user exists and is active
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isActive) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email',
            });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        if (existingUser && !existingUser.isActive) {
            // Update existing pending user with new OTP and data
            existingUser.name = name;
            existingUser.password = password;
            existingUser.phone = phone;
            existingUser.address = address;
            existingUser.pincode = pincode;
            existingUser.registrationOTP = otp;
            existingUser.registrationOTPExpires = otpExpires;
            await existingUser.save();
        } else {
            // Create new pending user
            await User.create({
                name,
                email,
                password,
                phone,
                address,
                pincode,
                isActive: false,
                registrationOTP: otp,
                registrationOTPExpires: otpExpires,
            });
        }

        // Send OTP email
        const otpEmail = emailTemplates.registrationOTP(name, otp);
        await sendEmail({
            to: email,
            ...otpEmail
        });

        res.status(200).json({
            success: true,
            message: 'OTP sent to your email. Please verify to complete registration.',
            data: { email }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Complete registration - verify OTP and activate account
// @route   POST /api/auth/complete-register
// @access  Public
export const completeRegistration = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Email and OTP are required',
            });
        }

        const user = await User.findOne({ email }).select('+registrationOTP +registrationOTPExpires');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'No pending registration found for this email',
            });
        }

        if (user.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Account is already active. Please login.',
            });
        }

        // Check OTP
        if (!user.registrationOTP || user.registrationOTP !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP',
            });
        }

        if (user.registrationOTPExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.',
            });
        }

        // Activate account
        user.isActive = true;
        user.isEmailVerified = true; // Email is verified since they received OTP
        user.registrationOTP = undefined;
        user.registrationOTPExpires = undefined;
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user._id);

        // Send welcome email
        const welcomeEmail = emailTemplates.welcome(user.name);
        await sendEmail({
            to: email,
            ...welcomeEmail
        });

        res.status(201).json({
            success: true,
            message: 'Registration successful! Welcome to Bakery Boutique.',
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

// @desc    Resend registration OTP
// @route   POST /api/auth/resend-register-otp
// @access  Public
export const resendRegistrationOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
            });
        }

        const user = await User.findOne({ email, isActive: false });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'No pending registration found for this email',
            });
        }

        // Generate new OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.registrationOTP = otp;
        user.registrationOTPExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save({ validateBeforeSave: false });

        // Send OTP email
        const otpEmail = emailTemplates.registrationOTP(user.name, otp);
        await sendEmail({
            to: email,
            ...otpEmail
        });

        res.json({
            success: true,
            message: 'New OTP sent to your email',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Register new user (legacy - kept for backward compatibility)
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

        // Create user (directly active for legacy support)
        const user = await User.create({
            name,
            email,
            password,
            phone,
            address,
            pincode,
            isActive: true,
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

        // Check if account is active (completed OTP verification)
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Please complete your registration by verifying OTP sent to your email',
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
