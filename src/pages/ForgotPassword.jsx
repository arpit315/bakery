import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout.jsx';
import { authApi } from '@/services/api.js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import {
    Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft, RefreshCw, CheckCircle2, KeyRound
} from 'lucide-react';

// OTP Input Component
const OTPInput = ({ value, onChange, disabled }) => {
    const inputRefs = useRef([]);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);

    useEffect(() => {
        if (value) {
            setOtp(value.split('').slice(0, 6).concat(Array(6).fill('')).slice(0, 6));
        }
    }, []);

    const handleChange = (index, e) => {
        const val = e.target.value;
        if (!/^\d*$/.test(val)) return;

        const newOtp = [...otp];
        newOtp[index] = val.slice(-1);
        setOtp(newOtp);
        onChange(newOtp.join(''));

        if (val && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pastedData) {
            const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
            setOtp(newOtp);
            onChange(newOtp.join(''));
            inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
        }
    };

    return (
        <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
                <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={disabled}
                    className="w-12 h-14 text-center text-2xl font-bold rounded-xl"
                />
            ))}
        </div>
    );
};

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1 = email, 2 = OTP + new password, 3 = success
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);

    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCountdown]);

    const handleRequestOTP = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast({
                title: "Error",
                description: "Please enter your email address.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await authApi.forgotPassword(email);

            if (response.success) {
                setStep(2);
                setResendCountdown(60);
                toast({
                    title: "OTP Sent! 📧",
                    description: "Check your email for the password reset code.",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (otp.length !== 6) {
            toast({
                title: "Error",
                description: "Please enter the 6-digit OTP.",
                variant: "destructive",
            });
            return;
        }

        if (newPassword.length < 6) {
            toast({
                title: "Error",
                description: "Password must be at least 6 characters.",
                variant: "destructive",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await authApi.resetPassword(email, otp, newPassword);

            if (response.success) {
                setStep(3);
                toast({
                    title: "Password Reset! 🎉",
                    description: "Your password has been changed successfully.",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Invalid OTP or request.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (resendCountdown > 0) return;

        setLoading(true);

        try {
            const response = await authApi.forgotPassword(email);
            if (response.success) {
                setResendCountdown(60);
                setOtp('');
                toast({
                    title: "OTP Resent! 📧",
                    description: "A new OTP has been sent to your email.",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                            <span className="text-3xl">
                                {step === 3 ? '✅' : '🔑'}
                            </span>
                        </div>
                        <h1 className="font-display text-3xl font-bold text-foreground">
                            {step === 1 && 'Forgot Password?'}
                            {step === 2 && 'Reset Password'}
                            {step === 3 && 'Password Reset!'}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {step === 1 && "Enter your email and we'll send you a reset code."}
                            {step === 2 && `Enter the OTP sent to ${email}`}
                            {step === 3 && "Your password has been changed successfully."}
                        </p>
                    </div>

                    {/* Step Indicator */}
                    {step < 3 && (
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                            <div className={`w-12 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                        </div>
                    )}

                    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card animate-fade-up">
                        {step === 1 && (
                            <form onSubmit={handleRequestOTP} className="space-y-5">
                                <div>
                                    <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                                        <Mail className="w-4 h-4" />
                                        Email Address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="rounded-xl py-5"
                                        disabled={loading}
                                        autoComplete="email"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-full py-6 text-lg font-semibold"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            Sending OTP...
                                        </>
                                    ) : (
                                        'Send Reset Code'
                                    )}
                                </Button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div className="text-center mb-4">
                                    <p className="text-muted-foreground text-sm mb-4">
                                        Enter the 6-digit code from your email
                                    </p>
                                    <OTPInput value={otp} onChange={setOtp} disabled={loading} />
                                </div>

                                <div>
                                    <Label htmlFor="newPassword" className="flex items-center gap-2 mb-2">
                                        <KeyRound className="w-4 h-4" />
                                        New Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="rounded-xl py-5 pr-10"
                                            disabled={loading}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="confirmPassword" className="flex items-center gap-2 mb-2">
                                        <Lock className="w-4 h-4" />
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="rounded-xl py-5"
                                        disabled={loading}
                                        autoComplete="new-password"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading || otp.length !== 6}
                                    className="w-full rounded-full py-6 text-lg font-semibold"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            Resetting...
                                        </>
                                    ) : (
                                        'Reset Password'
                                    )}
                                </Button>

                                <div className="flex items-center justify-between text-sm mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Change email
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={resendCountdown > 0 || loading}
                                        className="flex items-center gap-1 text-primary disabled:text-muted-foreground"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                        {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {step === 3 && (
                            <div className="text-center space-y-6">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                                </div>
                                <p className="text-muted-foreground">
                                    You can now login with your new password.
                                </p>
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="w-full rounded-full py-6 text-lg font-semibold"
                                >
                                    Go to Login
                                </Button>
                            </div>
                        )}

                        {step < 3 && (
                            <div className="mt-6 text-center">
                                <Link
                                    to="/login"
                                    className="text-primary hover:underline font-medium flex items-center justify-center gap-1"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back to Login
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ForgotPassword;
