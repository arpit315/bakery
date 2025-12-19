import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import GoogleSignInButton from '@/components/GoogleSignInButton.jsx';
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const from = location.state?.from?.pathname || '/';

    const handleInputChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            toast({
                title: "Error",
                description: "Please fill in all fields.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await login(formData.email, formData.password);

            if (response.success) {
                toast({
                    title: "Welcome back! 🎉",
                    description: `Hello, ${response.data.name}!`,
                });
                navigate(from, { replace: true });
            }
        } catch (error) {
            toast({
                title: "Login Failed",
                description: error.message || "Invalid email or password.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="min-h-[85vh] flex">
                {/* Left Side - Decorative */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary via-primary/90 to-golden overflow-hidden">
                    {/* Decorative Circles */}
                    <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-golden/20 rounded-full blur-3xl" />

                    {/* Floating Elements */}
                    <div className="absolute top-1/4 left-1/4 text-6xl opacity-30 animate-float">🧁</div>
                    <div className="absolute top-1/2 right-1/4 text-5xl opacity-30 animate-float" style={{ animationDelay: '1s' }}>🥐</div>
                    <div className="absolute bottom-1/4 left-1/3 text-7xl opacity-30 animate-float" style={{ animationDelay: '2s' }}>🎂</div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col justify-center p-12 text-white">
                        <h2 className="font-display text-4xl font-bold mb-6">
                            Welcome to<br />BakeryHub 🍰
                        </h2>
                        <p className="text-white/80 text-lg mb-8 max-w-md">
                            Sign in to access your favorites, track orders, and enjoy exclusive member offers!
                        </p>

                        <div className="space-y-4">
                            {[
                                { icon: '🎁', text: 'Exclusive member discounts' },
                                { icon: '📦', text: 'Track your orders easily' },
                                { icon: '⭐', text: 'Save your favorites' },
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-3 text-white/90">
                                    <span className="text-2xl">{item.icon}</span>
                                    <span>{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 bg-gradient-to-br from-background to-muted/30">
                    <div className="w-full max-w-md">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-golden/20 rounded-2xl mb-6 relative">
                                <span className="text-4xl">🧁</span>
                                <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-golden animate-pulse" />
                            </div>
                            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                                Welcome Back
                            </h1>
                            <p className="text-muted-foreground mt-2">
                                Sign in to your account to continue
                            </p>
                        </div>

                        {/* Login Form */}
                        <div className="bg-card rounded-3xl p-6 md:p-8 shadow-card animate-fade-up">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        Email Address
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder=""
                                            className="rounded-xl py-6 pl-4 pr-4 border-2 border-muted focus:border-primary transition-all duration-300"
                                            disabled={loading}
                                            autoComplete="email"
                                        />
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-golden/20 opacity-0 group-focus-within:opacity-100 -z-10 blur-xl transition-opacity duration-300" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-muted-foreground" />
                                        Password
                                    </Label>
                                    <div className="relative group">
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            placeholder=""
                                            className="rounded-xl py-6 pl-4 pr-12 border-2 border-muted focus:border-primary transition-all duration-300"
                                            disabled={loading}
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-golden/20 opacity-0 group-focus-within:opacity-100 -z-10 blur-xl transition-opacity duration-300" />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="rounded border-muted" />
                                        <span className="text-muted-foreground">Remember me</span>
                                    </label>
                                    <Link to="#" className="text-primary hover:underline font-medium">
                                        Forgot password?
                                    </Link>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full rounded-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-golden hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            {/* Divider */}
                            <div className="relative my-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-4 text-muted-foreground">Or continue with</span>
                                </div>
                            </div>

                            {/* Google Sign-In */}
                            <GoogleSignInButton buttonText="signin_with" />

                            <div className="mt-8 text-center">
                                <p className="text-muted-foreground">
                                    Don't have an account?{' '}
                                    <Link
                                        to="/register"
                                        className="text-primary hover:underline font-semibold"
                                    >
                                        Sign up free
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Login;
