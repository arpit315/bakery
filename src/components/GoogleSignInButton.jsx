import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { toast } from '@/hooks/use-toast';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '48054030738-5m1ebk92k0cida2pp4ggqvk2n89acjkf.apps.googleusercontent.com';

const GoogleSignInButton = ({ onSuccess, buttonText = 'signin_with' }) => {
    const buttonRef = useRef(null);
    const navigate = useNavigate();
    const { loginWithGoogle } = useAuth();

    useEffect(() => {
        // Wait for Google Identity Services to load
        const initializeGoogle = () => {
            if (window.google && buttonRef.current) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse,
                    auto_select: false,
                });

                window.google.accounts.id.renderButton(buttonRef.current, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    text: buttonText,
                    width: '100%',
                    logo_alignment: 'center',
                });
            }
        };

        // Check if Google API is loaded
        if (window.google) {
            initializeGoogle();
        } else {
            // Wait for script to load
            const checkGoogle = setInterval(() => {
                if (window.google) {
                    clearInterval(checkGoogle);
                    initializeGoogle();
                }
            }, 100);

            return () => clearInterval(checkGoogle);
        }
    }, []);

    const handleCredentialResponse = async (response) => {
        try {
            const result = await loginWithGoogle(response.credential);

            if (result.success) {
                toast({
                    title: result.message || "Welcome! 🎉",
                    description: "You're now signed in with Google.",
                });

                if (onSuccess) {
                    onSuccess(result);
                } else {
                    navigate('/');
                }
            } else {
                toast({
                    title: "Sign-in Failed",
                    description: result.message || "Could not sign in with Google.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            toast({
                title: "Sign-in Failed",
                description: "An error occurred during Google sign-in.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="w-full">
            <div ref={buttonRef} className="w-full flex justify-center" />
        </div>
    );
};

export default GoogleSignInButton;
