// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};

// ============ PRODUCT API ============
export const productApi = {
    // Get all products
    getAll: async (category) => {
        const query = category && category !== 'all' ? `?category=${category}` : '';
        return apiCall(`/products${query}`);
    },

    // Get single product
    getById: async (id) => {
        return apiCall(`/products/${id}`);
    },

    // Create product (admin)
    create: async (productData) => {
        return apiCall('/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
    },

    // Update product (admin)
    update: async (id, productData) => {
        return apiCall(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
        });
    },

    // Delete product (admin)
    delete: async (id) => {
        return apiCall(`/products/${id}`, {
            method: 'DELETE',
        });
    },

    // Seed initial products
    seed: async () => {
        return apiCall('/products/seed', {
            method: 'POST',
        });
    },
};

// ============ ORDER API ============
export const orderApi = {
    // Create order
    create: async (orderData) => {
        return apiCall('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    },

    // Get user's orders (guest lookup by phone)
    getUserOrders: async (phone) => {
        const query = phone ? `?phone=${encodeURIComponent(phone)}` : '';
        return apiCall(`/orders${query}`);
    },

    // Get logged-in user's orders
    getMyOrders: async () => {
        return apiCall('/orders/my-orders');
    },

    // Get all orders (admin)
    getAll: async (page = 1, status) => {
        let query = `?page=${page}`;
        if (status) query += `&status=${status}`;
        return apiCall(`/orders/all${query}`);
    },

    // Get order by ID
    getById: async (id) => {
        return apiCall(`/orders/${id}`);
    },

    // Update order status (admin)
    updateStatus: async (id, status) => {
        return apiCall(`/orders/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    },

    // Get order stats (admin)
    getStats: async () => {
        return apiCall('/orders/stats');
    },
};

// ============ PAYMENT API ============
export const paymentApi = {
    // Get Stripe config
    getConfig: async () => {
        return apiCall('/payment/config');
    },

    // Create payment intent
    createIntent: async (amount) => {
        return apiCall('/payment/create-intent', {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    },

    // Confirm payment
    confirm: async (paymentIntentId) => {
        return apiCall('/payment/confirm', {
            method: 'POST',
            body: JSON.stringify({ paymentIntentId }),
        });
    },
};

// ============ AUTH API ============
export const authApi = {
    // Initiate registration (sends OTP)
    initiateRegister: async (userData) => {
        return apiCall('/auth/initiate-register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    // Complete registration (verify OTP)
    completeRegister: async (email, otp) => {
        const response = await apiCall('/auth/complete-register', {
            method: 'POST',
            body: JSON.stringify({ email, otp }),
        });
        if (response.data?.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response;
    },

    // Resend registration OTP
    resendRegisterOTP: async (email) => {
        return apiCall('/auth/resend-register-otp', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    // Register (legacy - direct registration without OTP)
    register: async (userData) => {
        const response = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        if (response.data?.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response;
    },

    // Google OAuth
    googleAuth: async (credential) => {
        const response = await apiCall('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ credential }),
        });
        if (response.data?.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response;
    },

    // Forgot password - request OTP
    forgotPassword: async (email) => {
        return apiCall('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        });
    },

    // Reset password with OTP
    resetPassword: async (email, otp, newPassword) => {
        return apiCall('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email, otp, newPassword }),
        });
    },

    // Login
    login: async (credentials) => {
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        if (response.data?.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response;
    },

    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Get current user
    getMe: async () => {
        return apiCall('/auth/me');
    },

    // Update profile
    updateProfile: async (profileData) => {
        return apiCall('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData),
        });
    },

    // Send email OTP
    sendEmailOTP: async () => {
        return apiCall('/auth/send-email-otp', {
            method: 'POST',
        });
    },

    // Verify email with OTP
    verifyEmail: async (otp) => {
        return apiCall('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ otp }),
        });
    },

    // Send phone OTP
    sendPhoneOTP: async () => {
        return apiCall('/auth/send-phone-otp', {
            method: 'POST',
        });
    },

    // Verify phone with OTP
    verifyPhone: async (otp) => {
        return apiCall('/auth/verify-phone', {
            method: 'POST',
            body: JSON.stringify({ otp }),
        });
    },

    // Create admin (initial setup)
    createAdmin: async (adminData) => {
        return apiCall('/auth/create-admin', {
            method: 'POST',
            body: JSON.stringify(adminData),
        });
    },
};

// ============ REVIEW API ============
export const reviewApi = {
    // Create a review
    create: async (reviewData) => {
        return apiCall('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData),
        });
    },

    // Get reviews for a product
    getByProduct: async (productId, page = 1) => {
        return apiCall(`/reviews/product/${productId}?page=${page}`);
    },

    // Check if a product in an order is reviewed
    checkReviewed: async (orderId, productId) => {
        return apiCall(`/reviews/check/${orderId}/${productId}`);
    },

    // Get all reviews for an order
    getOrderReviews: async (orderId) => {
        return apiCall(`/reviews/order/${orderId}`);
    },

    // Delete a review
    delete: async (reviewId) => {
        return apiCall(`/reviews/${reviewId}`, {
            method: 'DELETE',
        });
    },
};

export default {
    products: productApi,
    orders: orderApi,
    payment: paymentApi,
    auth: authApi,
    reviews: reviewApi,
};
