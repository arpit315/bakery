import { useState } from 'react';
import Layout from '@/components/Layout.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { authApi } from '@/services/api.js';
import {
    User, Mail, Phone, MapPin, CheckCircle2, AlertCircle,
    Loader2, Shield, Edit2, Save, X
} from 'lucide-react';

const Profile = () => {
    const { user, updateUser, refreshUser } = useAuth();
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verifyingEmail, setVerifyingEmail] = useState(false);
    const [verifyingPhone, setVerifyingPhone] = useState(false);
    const [showEmailOTP, setShowEmailOTP] = useState(false);
    const [showPhoneOTP, setShowPhoneOTP] = useState(false);
    const [emailOTP, setEmailOTP] = useState('');
    const [phoneOTP, setPhoneOTP] = useState('');

    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || '',
        pincode: user?.pincode || '',
    });

    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await authApi.updateProfile(formData);
            if (response.success) {
                updateUser(response.data);
                toast({
                    title: "Profile Updated",
                    description: "Your profile has been updated successfully.",
                });
                setEditing(false);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to update profile.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSendEmailOTP = async () => {
        setVerifyingEmail(true);
        try {
            const response = await authApi.sendEmailOTP();
            if (response.success) {
                setShowEmailOTP(true);
                toast({
                    title: "OTP Sent",
                    description: "Check your email for the verification code.",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to send OTP.",
                variant: "destructive",
            });
        } finally {
            setVerifyingEmail(false);
        }
    };

    const handleVerifyEmail = async () => {
        if (emailOTP.length !== 6) {
            toast({
                title: "Error",
                description: "Please enter a 6-digit OTP.",
                variant: "destructive",
            });
            return;
        }

        setVerifyingEmail(true);
        try {
            const response = await authApi.verifyEmail(emailOTP);
            if (response.success) {
                updateUser({ isEmailVerified: true });
                setShowEmailOTP(false);
                setEmailOTP('');
                toast({
                    title: "Email Verified! ✓",
                    description: "Your email has been verified successfully.",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Invalid OTP.",
                variant: "destructive",
            });
        } finally {
            setVerifyingEmail(false);
        }
    };

    const handleSendPhoneOTP = async () => {
        setVerifyingPhone(true);
        try {
            const response = await authApi.sendPhoneOTP();
            if (response.success) {
                setShowPhoneOTP(true);
                toast({
                    title: "OTP Sent",
                    description: "Check your phone for the verification code.",
                });
                // In development, show the OTP in toast
                if (response.devOtp) {
                    toast({
                        title: "Dev Mode OTP",
                        description: `Your OTP is: ${response.devOtp}`,
                    });
                }
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Failed to send OTP.",
                variant: "destructive",
            });
        } finally {
            setVerifyingPhone(false);
        }
    };

    const handleVerifyPhone = async () => {
        if (phoneOTP.length !== 6) {
            toast({
                title: "Error",
                description: "Please enter a 6-digit OTP.",
                variant: "destructive",
            });
            return;
        }

        setVerifyingPhone(true);
        try {
            const response = await authApi.verifyPhone(phoneOTP);
            if (response.success) {
                updateUser({ isPhoneVerified: true });
                setShowPhoneOTP(false);
                setPhoneOTP('');
                toast({
                    title: "Phone Verified! ✓",
                    description: "Your phone has been verified successfully.",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: error.message || "Invalid OTP.",
                variant: "destructive",
            });
        } finally {
            setVerifyingPhone(false);
        }
    };

    const VerificationBadge = ({ verified }) => (
        <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${verified
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
            {verified ? (
                <>
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                </>
            ) : (
                <>
                    <AlertCircle className="w-3 h-3" />
                    Not Verified
                </>
            )}
        </span>
    );

    return (
        <Layout>
            <div className="gradient-hero py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground text-center">
                        My Profile
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="max-w-2xl mx-auto space-y-6">
                    {/* Profile Card */}
                    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card animate-fade-up">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                                <User className="w-5 h-5 text-primary" />
                                Account Information
                            </h2>
                            {!editing ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditing(true)}
                                    className="rounded-full"
                                >
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setEditing(false);
                                            setFormData({
                                                name: user?.name || '',
                                                phone: user?.phone || '',
                                                address: user?.address || '',
                                                pincode: user?.pincode || '',
                                            });
                                        }}
                                        className="rounded-full"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="rounded-full"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-2" />
                                        )}
                                        Save
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-5">
                            {/* Name */}
                            <div>
                                <Label className="flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4" />
                                    Full Name
                                </Label>
                                {editing ? (
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="rounded-xl py-5"
                                    />
                                ) : (
                                    <p className="text-foreground py-2">{user?.name}</p>
                                )}
                            </div>

                            {/* Email (read-only) */}
                            <div>
                                <Label className="flex items-center gap-2 mb-2">
                                    <Mail className="w-4 h-4" />
                                    Email Address
                                    <VerificationBadge verified={user?.isEmailVerified} />
                                </Label>
                                <div className="flex gap-2 items-center">
                                    <p className="text-foreground py-2 flex-1">{user?.email}</p>
                                    {!user?.isEmailVerified && !showEmailOTP && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleSendEmailOTP}
                                            disabled={verifyingEmail}
                                            className="rounded-full"
                                        >
                                            {verifyingEmail ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                'Verify'
                                            )}
                                        </Button>
                                    )}
                                </div>
                                {showEmailOTP && (
                                    <div className="mt-3 p-4 bg-muted rounded-xl space-y-3">
                                        <Label>Enter OTP sent to your email</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={emailOTP}
                                                onChange={(e) => setEmailOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="Enter 6-digit OTP"
                                                className="rounded-xl"
                                                maxLength={6}
                                            />
                                            <Button onClick={handleVerifyEmail} disabled={verifyingEmail}>
                                                {verifyingEmail ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    'Verify'
                                                )}
                                            </Button>
                                        </div>
                                        <button
                                            onClick={handleSendEmailOTP}
                                            className="text-sm text-primary hover:underline"
                                            disabled={verifyingEmail}
                                        >
                                            Resend OTP
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <Label className="flex items-center gap-2 mb-2">
                                    <Phone className="w-4 h-4" />
                                    Phone Number
                                    <VerificationBadge verified={user?.isPhoneVerified} />
                                </Label>
                                {editing ? (
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="rounded-xl py-5"
                                        placeholder="9876543210"
                                    />
                                ) : (
                                    <div className="flex gap-2 items-center">
                                        <p className="text-foreground py-2 flex-1">
                                            {user?.phone || <span className="text-muted-foreground">Not set</span>}
                                        </p>
                                        {user?.phone && !user?.isPhoneVerified && !showPhoneOTP && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleSendPhoneOTP}
                                                disabled={verifyingPhone}
                                                className="rounded-full"
                                            >
                                                {verifyingPhone ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    'Verify'
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                )}
                                {showPhoneOTP && (
                                    <div className="mt-3 p-4 bg-muted rounded-xl space-y-3">
                                        <Label>Enter OTP sent to your phone</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                value={phoneOTP}
                                                onChange={(e) => setPhoneOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                placeholder="Enter 6-digit OTP"
                                                className="rounded-xl"
                                                maxLength={6}
                                            />
                                            <Button onClick={handleVerifyPhone} disabled={verifyingPhone}>
                                                {verifyingPhone ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    'Verify'
                                                )}
                                            </Button>
                                        </div>
                                        <button
                                            onClick={handleSendPhoneOTP}
                                            className="text-sm text-primary hover:underline"
                                            disabled={verifyingPhone}
                                        >
                                            Resend OTP
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Address */}
                            <div>
                                <Label className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-4 h-4" />
                                    Address
                                </Label>
                                {editing ? (
                                    <Textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="rounded-xl min-h-[80px]"
                                        placeholder="Your delivery address"
                                    />
                                ) : (
                                    <p className="text-foreground py-2">
                                        {user?.address || <span className="text-muted-foreground">Not set</span>}
                                    </p>
                                )}
                            </div>

                            {/* Pincode */}
                            <div>
                                <Label className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-4 h-4" />
                                    Pincode
                                </Label>
                                {editing ? (
                                    <Input
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        className="rounded-xl py-5"
                                        placeholder="110001"
                                        maxLength={6}
                                    />
                                ) : (
                                    <p className="text-foreground py-2">
                                        {user?.pincode || <span className="text-muted-foreground">Not set</span>}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Security Info */}
                    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-card animate-fade-up" style={{ animationDelay: '0.1s' }}>
                        <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
                            <Shield className="w-5 h-5 text-primary" />
                            Account Security
                        </h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-muted rounded-xl">
                                <p className="text-sm text-muted-foreground">Account Type</p>
                                <p className="font-medium text-foreground capitalize">{user?.role}</p>
                            </div>
                            <div className="p-4 bg-muted rounded-xl">
                                <p className="text-sm text-muted-foreground">Member Since</p>
                                <p className="font-medium text-foreground">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;
