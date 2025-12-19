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
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
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
