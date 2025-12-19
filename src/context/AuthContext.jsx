import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/services/api.js';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                try {
                    // Verify token is still valid
                    const response = await authApi.getMe();
                    if (response.success) {
                        setUser(response.data);
                        localStorage.setItem('user', JSON.stringify(response.data));
                    } else {
                        // Token invalid, clear storage
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                    }
                } catch (error) {
                    // Token invalid
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        const response = await authApi.login({ email, password });
        if (response.success) {
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response;
    };

    const register = async (userData) => {
        const response = await authApi.register(userData);
        if (response.success) {
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response;
    };

    const logout = () => {
        authApi.logout();
        setUser(null);
        localStorage.removeItem('user');
    };

    const refreshUser = async () => {
        try {
            const response = await authApi.getMe();
            if (response.success) {
                setUser(response.data);
                localStorage.setItem('user', JSON.stringify(response.data));
            }
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    };

    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated,
                isAdmin,
                login,
                register,
                logout,
                refreshUser,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
