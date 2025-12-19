import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Youtube, Send, Heart, CreditCard, Shield, Truck } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Please enter your email",
        variant: "destructive"
      });
      return;
    }

    setIsSubscribing(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Subscribed! 🎉",
        description: "Thank you for joining our newsletter. Sweet updates coming your way!"
      });
      setEmail('');
      setIsSubscribing(false);
    }, 1000);
  };

  const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-500' },
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:bg-blue-600' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:bg-sky-500' },
    { icon: Youtube, href: '#', label: 'Youtube', color: 'hover:bg-red-600' },
  ];

  const trustBadges = [
    { icon: CreditCard, label: 'Secure Payment' },
    { icon: Shield, label: '100% Safe' },
    { icon: Truck, label: 'Fast Delivery' },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-primary to-chocolate text-primary-foreground overflow-hidden">
      {/* Wave Divider */}
      <div className="absolute top-0 left-0 right-0 transform -translate-y-[99%]">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[60px]">
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-primary"
          />
        </svg>
      </div>

      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-golden/20 to-soft-pink/20 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <span className="text-golden text-sm font-semibold uppercase tracking-wider">Newsletter</span>
            <h3 className="font-display text-2xl md:text-3xl font-bold mt-2 mb-3">
              Get Sweet Updates! 🧁
            </h3>
            <p className="text-primary-foreground/80 mb-6">
              Subscribe to receive exclusive offers, new product alerts, and baking tips.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-golden focus:ring-2 focus:ring-golden/30 transition-all duration-300"
                />
              </div>
              <button
                type="submit"
                disabled={isSubscribing}
                className="px-8 py-3.5 rounded-full bg-golden text-chocolate font-semibold hover:bg-golden/90 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubscribing ? (
                  <div className="w-5 h-5 border-2 border-chocolate border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Subscribe
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <span className="text-2xl font-display font-bold group-hover:text-golden transition-colors">BakeryHub</span>
              <span className="text-2xl group-hover:animate-bounce">🍰</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
              Crafting delicious moments with artisan baked goods since 2025. Every bite tells a story of passion and quality.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className={`w-10 h-10 rounded-full bg-white/10 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:text-white ${social.color}`}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-golden rounded-full" />
              Quick Links
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { name: 'Home', path: '/' },
                { name: 'Menu', path: '/menu' },
                { name: 'Cart', path: '/cart' },
                { name: 'My Orders', path: '/orders' },
                { name: 'Profile', path: '/profile' },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-primary-foreground/70 hover:text-golden hover:translate-x-1 transition-all duration-300 inline-flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-golden/50" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-golden rounded-full" />
              Contact Us
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-primary-foreground/70 group">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-golden/20 transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="pt-1">Muzaffarpur, Patna, Bihar</span>
              </li>
              <li className="flex items-start gap-3 text-primary-foreground/70 group">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-golden/20 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="pt-1">+91 7003652693</span>
              </li>
              <li className="flex items-start gap-3 text-primary-foreground/70 group">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-golden/20 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="pt-1">sumangupta12@gmail.com</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-golden rounded-full" />
              Opening Hours
            </h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li className="flex justify-between py-2 border-b border-white/10">
                <span>Mon - Fri</span>
                <span className="text-golden font-medium">7:00 AM - 8:00 PM</span>
              </li>
              <li className="flex justify-between py-2 border-b border-white/10">
                <span>Saturday</span>
                <span className="text-golden font-medium">8:00 AM - 9:00 PM</span>
              </li>
              <li className="flex justify-between py-2">
                <span>Sunday</span>
                <span className="text-golden font-medium">8:00 AM - 6:00 PM</span>
              </li>
            </ul>

            {/* Trust Badges */}
            <div className="flex gap-4 mt-6">
              {trustBadges.map((badge, index) => (
                <div key={index} className="flex flex-col items-center gap-1 text-center">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <badge.icon className="w-5 h-5 text-golden" />
                  </div>
                  <span className="text-xs text-primary-foreground/60">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-foreground/60 flex items-center gap-1">
              © 2024 BakeryHub. Made with <Heart className="w-4 h-4 text-red-400 fill-red-400 animate-pulse" /> for baking lovers
            </p>
            <div className="flex items-center gap-6 text-sm text-primary-foreground/60">
              <Link to="#" className="hover:text-golden transition-colors">Privacy Policy</Link>
              <Link to="#" className="hover:text-golden transition-colors">Terms of Service</Link>
              <Link to="#" className="hover:text-golden transition-colors">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-golden/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-48 h-48 bg-soft-pink/5 rounded-full blur-3xl pointer-events-none" />
    </footer>
  );
};

export default Footer;
