import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import GoogleSignInButton from '@/components/GoogleSignInButton.jsx';
import {
    Mail, Lock, Loader2, Eye, EyeOff, User, Phone, MapPin,
    CheckCircle2, AlertCircle, ArrowLeft, RefreshCw
} from 'lucide-react';

// InputWithError component defined OUTSIDE Register to prevent focus loss
const InputWithError = ({ icon: Icon, label, error, disabled, ...props }) => (
    <div>
        <Label htmlFor={props.id} className="flex items-center gap-2 mb-2">
            <Icon className="w-4 h-4" />
            {label}
        </Label>
        <Input
            {...props}
            className={`rounded-xl py-5 ${error ? 'border-destructive' : ''}`}
            disabled={disabled}
        />
        {error && (
            <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {error}
            </p>
        )}
    </div>
);

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

        // Move to next input
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

const Register = () => {
    const navigate = useNavigate();
    const { initiateRegister, completeRegister, resendRegisterOTP } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [step, setStep] = useState(1); // 1 = form, 2 = OTP verification
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [resendCountdown, setResendCountdown] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        address: '',
        pincode: '',
    });
    const [errors, setErrors] = useState({});

    // Resend countdown timer
    useEffect(() => {
        if (resendCountdown > 0) {
            const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCountdown]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Enter a valid 10-digit mobile number (starting with 6-9)';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (formData.pincode && !/^[1-9][0-9]{5}$/.test(formData.pincode)) {
            newErrors.pincode = 'Invalid pincode. Must be 6 digits.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleInitiateRegister = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast({
                title: "Validation Error",
                description: "Please fix the errors in the form.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await initiateRegister({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                address: formData.address,
                pincode: formData.pincode,
            });

            if (response.success) {
                setEmail(formData.email);
                setStep(2);
                setResendCountdown(60);
                toast({
                    title: "OTP Sent! 📧",
                    description: "Please check your email for the verification code.",
                });
            }
        } catch (error) {
            toast({
                title: "Registration Failed",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();

        if (otp.length !== 6) {
            toast({
                title: "Invalid OTP",
                description: "Please enter the 6-digit OTP sent to your email.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await completeRegister(email, otp);

            if (response.success) {
                toast({
                    title: "Welcome to Bakery Boutique! 🎉",
                    description: "Your account has been created successfully.",
                });
                navigate('/');
            }
        } catch (error) {
            toast({
                title: "Verification Failed",
                description: error.message || "Invalid OTP. Please try again.",
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
            const response = await resendRegisterOTP(email);

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
                title: "Failed to Resend",
                description: error.message || "Could not resend OTP. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setStep(1);
        setOtp('');
    };

    return (
        <Layout>
            <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
                <div className="w-full max-w-lg">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                            <span className="text-3xl">{step === 1 ? '🎂' : '📧'}</span>
                        </div>
                        <h1 className="font-display text-3xl font-bold text-foreground">
                            {step === 1 ? 'Create Account' : 'Verify Email'}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            {step === 1
                                ? 'Join our bakery family for delicious treats!'
                                : `Enter the OTP sent to ${email}`}
                        </p>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
                        <div className={`w-12 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                        <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
                    </div>

                    {/* Register Form */}
                    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card animate-fade-up">
                        {step === 1 ? (
                            <form onSubmit={handleInitiateRegister} className="space-y-5">
                                {/* Google Sign-In */}
                                <GoogleSignInButton buttonText="signup_with" />

                                {/* Divider */}
                                <div className="relative my-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-muted" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="bg-card px-4 text-muted-foreground">
                                            or continue with email
                                        </span>
                                    </div>
                                </div>

                                {/* Name */}
                                <InputWithError
                                    icon={User}
                                    label="Full Name"
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder=""
                                    error={errors.name}
                                    autoComplete="name"
                                    disabled={loading}
                                />

                                {/* Email */}
                                <InputWithError
                                    icon={Mail}
                                    label="Email Address"
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="you@example.com"
                                    error={errors.email}
                                    autoComplete="email"
                                    disabled={loading}
                                />

                                {/* Phone */}
                                <InputWithError
                                    icon={Phone}
                                    label="Phone Number (10 digits)"
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    maxLength={10}
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder=""
                                    error={errors.phone}
                                    autoComplete="tel"
                                    disabled={loading}
                                />

                                {/* Password */}
                                <div>
                                    <Label htmlFor="password" className="flex items-center gap-2 mb-2">
                                        <Lock className="w-4 h-4" />
                                        Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder=""
                                            className={`rounded-xl py-5 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                                            disabled={loading}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div>
                                    <Label htmlFor="confirmPassword" className="flex items-center gap-2 mb-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Confirm Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            placeholder=""
                                            className={`rounded-xl py-5 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                                            disabled={loading}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.confirmPassword}
                                        </p>
                                    )}
                                </div>

                                {/* Address (Optional) */}
                                <div>
                                    <Label htmlFor="address" className="flex items-center gap-2 mb-2">
                                        <MapPin className="w-4 h-4" />
                                        Address <span className="text-muted-foreground text-xs">(optional)</span>
                                    </Label>
                                    <Textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder=""
                                        className="rounded-xl min-h-[80px]"
                                        disabled={loading}
                                    />
                                </div>

                                {/* Pincode (Optional) */}
                                <div>
                                    <Label htmlFor="pincode" className="flex items-center gap-2 mb-2">
                                        <MapPin className="w-4 h-4" />
                                        Pincode <span className="text-muted-foreground text-xs">(optional - 6 digits)</span>
                                    </Label>
                                    <Input
                                        id="pincode"
                                        name="pincode"
                                        type="text"
                                        maxLength={6}
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        placeholder=""
                                        className={`rounded-xl py-5 ${errors.pincode ? 'border-destructive' : ''}`}
                                        disabled={loading}
                                    />
                                    {errors.pincode && (
                                        <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" />
                                            {errors.pincode}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-full py-6 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-soft"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            Sending OTP...
                                        </>
                                    ) : (
                                        'Continue →'
                                    )}
                                </Button>
                            </form>
                        ) : (
                            /* OTP Verification Step */
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div className="text-center">
                                    <p className="text-muted-foreground mb-6">
                                        We've sent a 6-digit verification code to your email.
                                        Please enter it below.
                                    </p>

                                    <OTPInput
                                        value={otp}
                                        onChange={setOtp}
                                        disabled={loading}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading || otp.length !== 6}
                                    className="w-full rounded-full py-6 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-soft"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            Verifying...
                                        </>
                                    ) : (
                                        'Verify & Create Account'
                                    )}
                                </Button>

                                <div className="flex items-center justify-between text-sm">
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to form
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={resendCountdown > 0 || loading}
                                        className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors disabled:text-muted-foreground disabled:cursor-not-allowed"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                        {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="mt-6 text-center">
                            <p className="text-muted-foreground">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="text-primary hover:underline font-medium"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Register;
