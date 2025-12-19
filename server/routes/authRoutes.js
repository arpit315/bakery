import express from 'express';
import {
    register,
    login,
    getMe,
    updateProfile,
    createAdmin,
    sendEmailOTP,
    verifyEmail,
    sendPhoneOTP,
    verifyPhone,
    initiateRegistration,
    completeRegistration,
    resendRegistrationOTP,
    googleAuth,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes - OTP-based registration (recommended)
router.post('/initiate-register', initiateRegistration);
router.post('/complete-register', completeRegistration);
router.post('/resend-register-otp', resendRegistrationOTP);

// Google OAuth
router.post('/google', googleAuth);

// Legacy registration (direct - no OTP)
router.post('/register', register);
router.post('/login', login);
router.post('/create-admin', createAdmin); // For initial setup only

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Email verification routes
router.post('/send-email-otp', protect, sendEmailOTP);
router.post('/verify-email', protect, verifyEmail);

// Phone verification routes
router.post('/send-phone-otp', protect, sendPhoneOTP);
router.post('/verify-phone', protect, verifyPhone);

export default router;

