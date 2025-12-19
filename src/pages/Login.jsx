import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
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

                            {/* Social Login */}
                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-muted hover:border-primary hover:bg-muted/50 transition-all duration-300">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span className="text-sm font-medium">Google</span>
                                </button>
                                <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-muted hover:border-primary hover:bg-muted/50 transition-all duration-300">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                                    </svg>
                                    <span className="text-sm font-medium">GitHub</span>
                                </button>
                            </div>

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
