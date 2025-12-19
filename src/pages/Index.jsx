import { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout.jsx';
import Hero from '@/components/Hero.jsx';
import ProductCard from '@/components/ProductCard.jsx';
import ProductSkeleton from '@/components/ProductSkeleton.jsx';
import CategoryFilter from '@/components/CategoryFilter.jsx';
import { productApi } from '@/services/api.js';
import { ChefHat, Truck, Clock, Award, Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

// Scroll Animation Hook
const useScrollAnimation = () => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
};

// Testimonials Data
const testimonials = [
  {
    name: 'Raj Mohan',
    role: 'Food Blogger',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    text: 'The best croissants I have ever tasted! Buttery, flaky, and absolutely divine. BakeryHub has become my go-to for all special occasions.',
    rating: 5
  },
  {
    name: 'Vikash Kumar',
    role: 'Regular Customer',
    // image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    text: 'Their birthday cakes are phenomenal! Beautiful designs and the taste is even better. My family requests BakeryHub cakes for every celebration.',
    rating: 5
  },
  {
    name: 'Shivam Swaraj',
    role: 'Wedding Planner',

    text: 'I recommend BakeryHub to all my clients. Their wedding cakes are stunning and the flavors are out of this world. True artisans!',
    rating: 5
  }
];

const Index = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [error, setError] = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const featuresAnimation = useScrollAnimation();
  const productsAnimation = useScrollAnimation();
  const testimonialsAnimation = useScrollAnimation();
  const ctaAnimation = useScrollAnimation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productApi.getAll(activeCategory);
        setProducts(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory]);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const categories = ['all', 'cakes', 'pastries', 'breads'];

  const features = [
    { icon: ChefHat, title: 'Artisan Crafted', description: 'Made by expert bakers with years of experience', color: 'from-amber-500 to-orange-500' },
    { icon: Truck, title: 'Fast Delivery', description: 'Fresh to your door within hours of baking', color: 'from-blue-500 to-cyan-500' },
    { icon: Clock, title: 'Baked Daily', description: 'Every item freshly baked each morning', color: 'from-green-500 to-emerald-500' },
    { icon: Award, title: 'Premium Quality', description: 'Only the finest organic ingredients used', color: 'from-purple-500 to-pink-500' },
  ];

  return (
    <Layout>
      <Hero />

      {/* Features Section */}
      <section
        ref={featuresAnimation.ref}
        className={`py-16 md:py-24 bg-gradient-to-b from-background to-muted/30 transition-all duration-1000 ${featuresAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold uppercase tracking-wider text-golden">Why Choose Us</span>
            <h2 className="section-title mt-2">The BakeryHub Difference</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group flex flex-col items-center text-center p-6 md:p-8 bg-card rounded-3xl shadow-soft hover:shadow-hover transition-all duration-500 hover:-translate-y-2 ${featuresAnimation.isVisible ? 'animate-fade-up' : ''}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="font-semibold text-base md:text-lg text-foreground mb-2">{feature.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section
        ref={productsAnimation.ref}
        className={`py-16 md:py-24 transition-all duration-1000 ${productsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold uppercase tracking-wider text-golden flex items-center justify-center gap-2">
              <span className="w-8 h-0.5 bg-golden rounded-full" />
              Our Specialties
              <span className="w-8 h-0.5 bg-golden rounded-full" />
            </span>
            <h2 className="section-title mt-3">Featured Products</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Discover our hand-picked selection of the finest baked goods, crafted with love
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex justify-center mb-12">
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {/* Error State */}
          {error && (
            <div className="text-center py-12 bg-destructive/5 rounded-2xl">
              <p className="text-destructive mb-2 font-medium">{error}</p>
              <p className="text-muted-foreground text-sm">
                Make sure the backend server is running on port 5000
              </p>
            </div>
          )}

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {loading
              ? Array(6).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              : products.slice(0, 6).map((product, index) => (
                <div
                  key={product._id || product.id}
                  className={productsAnimation.isVisible ? 'animate-fade-up' : 'opacity-0'}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ProductCard product={{ ...product, id: product._id || product.id }} />
                </div>
              ))
            }
          </div>

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="text-center py-16 bg-muted/30 rounded-2xl">
              <span className="text-6xl mb-4 block">🍰</span>
              <p className="text-muted-foreground text-lg">No products found. Seed the database first.</p>
            </div>
          )}

          {/* View All Button */}
          {!loading && products.length > 0 && (
            <div className="text-center mt-12">
              <a
                href="/menu"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full border-2 border-primary text-primary font-semibold hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-105"
              >
                View All Products
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        ref={testimonialsAnimation.ref}
        className={`py-16 md:py-24 bg-gradient-to-br from-soft-pink/20 via-background to-golden/10 transition-all duration-1000 ${testimonialsAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold uppercase tracking-wider text-golden">Testimonials</span>
            <h2 className="section-title mt-2">What Our Customers Say</h2>
          </div>

          <div className="max-w-4xl mx-auto relative">
            {/* Testimonial Cards */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0 px-4">
                    <div className="bg-card rounded-3xl p-8 md:p-12 shadow-card relative">
                      <Quote className="absolute top-6 right-6 w-12 h-12 text-primary/10" />

                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-golden flex items-center justify-center text-white font-bold text-xl border-4 border-primary/20">
                          {testimonial.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-display font-semibold text-lg">{testimonial.name}</h4>
                          <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                        </div>
                      </div>

                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-golden text-golden" />
                        ))}
                      </div>

                      <p className="text-muted-foreground text-lg leading-relaxed italic">
                        "{testimonial.text}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-card shadow-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-card shadow-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300 z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${currentTestimonial === index ? 'bg-primary w-8' : 'bg-muted hover:bg-primary/50'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-primary to-chocolate text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 50, suffix: '+', label: 'Artisan Recipes' },
              { value: 10000, suffix: '+', label: 'Happy Customers' },
              { value: 15, suffix: '+', label: 'Years Experience' },
              { value: 99, suffix: '%', label: 'Customer Satisfaction' },
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="text-4xl md:text-5xl font-display font-bold text-golden group-hover:scale-110 transition-transform duration-300">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-primary-foreground/70 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaAnimation.ref}
        className={`py-20 md:py-32 relative overflow-hidden transition-all duration-1000 ${ctaAnimation.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary via-background to-soft-pink/20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-golden/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <span className="inline-block text-6xl mb-6 animate-bounce">🎂</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            Ready to Taste Perfection?
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto text-lg">
            Order now and experience the magic of freshly baked goods delivered straight to your doorstep.
            <span className="text-primary font-medium"> First order gets 10% off!</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/menu"
              className="btn-hero inline-flex items-center gap-2 group"
            >
              Browse Full Menu
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/register"
              className="btn-hero-outline"
            >
              Create Account
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
