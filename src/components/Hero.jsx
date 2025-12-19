import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

// Floating bakery elements
const FloatingElement = ({ emoji, className, delay = 0 }) => (
  <div
    className={`absolute text-4xl md:text-5xl opacity-20 pointer-events-none ${className}`}
    style={{
      animation: `float 6s ease-in-out infinite`,
      animationDelay: `${delay}s`
    }}
  >
    {emoji}
  </div>
);

// Sparkle effect component
const Sparkle = ({ style }) => (
  <div
    className="absolute w-1 h-1 bg-golden rounded-full"
    style={{
      ...style,
      animation: 'sparkle 2s ease-in-out infinite',
      animationDelay: `${Math.random() * 2}s`
    }}
  />
);

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Generate sparkle positions
  const sparkles = Array.from({ length: 20 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 3}s`
  }));

  return (
    <section className="relative overflow-hidden gradient-hero min-h-[90vh] flex items-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-soft-pink/40 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-golden/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />

        {/* Floating Bakery Elements */}
        <FloatingElement emoji="🥐" className="top-[15%] left-[10%]" delay={0} />
        <FloatingElement emoji="🧁" className="top-[25%] right-[15%]" delay={1} />
        <FloatingElement emoji="🍰" className="bottom-[20%] left-[20%]" delay={2} />
        <FloatingElement emoji="🥖" className="bottom-[30%] right-[10%]" delay={0.5} />
        <FloatingElement emoji="🍪" className="top-[50%] left-[5%]" delay={1.5} />
        <FloatingElement emoji="🎂" className="top-[10%] right-[25%]" delay={2.5} />
        <FloatingElement emoji="🥧" className="bottom-[15%] right-[30%]" delay={3} />

        {/* Sparkles */}
        {sparkles.map((sparkle, i) => (
          <Sparkle key={i} style={sparkle} />
        ))}
      </div>

      <div className="container mx-auto px-4 py-16 md:py-24 lg:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 bg-secondary/80 backdrop-blur-sm text-secondary-foreground px-5 py-2.5 rounded-full mb-6 md:mb-8 shadow-soft transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <Sparkles className="w-4 h-4 text-golden animate-pulse" />
            <span className="text-sm font-medium">Freshly Baked Every Day</span>
            <div className="flex items-center gap-0.5 ml-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-golden text-golden" />
              ))}
            </div>
          </div>

          {/* Headline */}
          <h1
            className={`font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            Freshly Baked{' '}
            <span className="relative inline-block">
              <span className="gradient-text">Happiness</span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none">
                <path d="M1 5.5C47 2.5 153 2.5 199 5.5" stroke="hsl(35 80% 55%)" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>,{' '}
            <br className="hidden sm:block" />
            Delivered to Your Door
          </h1>

          {/* Subtitle */}
          <p
            className={`text-lg md:text-xl text-muted-foreground mt-6 md:mt-8 max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            Indulge in artisan cakes, pastries, and fresh breads crafted with love and the finest ingredients.
            <span className="text-primary font-medium"> Experience the magic of homemade goodness.</span>
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 md:mt-10 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <Link
              to="/menu"
              className="btn-hero flex items-center gap-2 group relative overflow-hidden"
            >
              <span className="relative z-10">Order Now</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-golden opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link
              to="/menu"
              className="btn-hero-outline group"
            >
              <span className="relative">
                View Menu
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </span>
            </Link>
          </div>

          {/* Stats */}
          <div
            className={`flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-12 md:mt-20 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {[
              { value: '50+', label: 'Artisan Recipes', icon: '🍰' },
              { value: '10K+', label: 'Happy Customers', icon: '😊' },
              { value: '4.9★', label: 'Customer Rating', icon: '⭐' },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center group cursor-default"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl group-hover:animate-bounce-subtle">{stat.icon}</span>
                  <div className="text-3xl md:text-4xl font-display font-bold text-primary group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className={`mt-16 md:mt-20 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
              <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[60px] fill-background">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
