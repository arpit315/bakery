import { useState, useEffect } from 'react';
import Layout from '@/components/Layout.jsx';
import ProductCard from '@/components/ProductCard.jsx';
import ProductSkeleton from '@/components/ProductSkeleton.jsx';
import { productApi } from '@/services/api.js';
import { Grid3X3, LayoutList, SlidersHorizontal, ChevronDown } from 'lucide-react';

const Menu = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('default');
  const [showSortMenu, setShowSortMenu] = useState(false);

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

  const categories = [
    { id: 'all', label: 'All Items', emoji: '✨' },
    { id: 'cakes', label: 'Cakes', emoji: '🎂' },
    { id: 'pastries', label: 'Pastries', emoji: '🥐' },
    { id: 'breads', label: 'Breads', emoji: '🥖' },
  ];

  const sortOptions = [
    { id: 'default', label: 'Default' },
    { id: 'price-low', label: 'Price: Low to High' },
    { id: 'price-high', label: 'Price: High to Low' },
    { id: 'name', label: 'Name: A-Z' },
  ];

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <Layout>
      {/* Hero Header */}
      <div className="relative gradient-hero py-16 md:py-24 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-float">🍰</div>
        <div className="absolute bottom-10 right-10 text-5xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>🥐</div>
        <div className="absolute top-1/2 right-1/4 text-4xl opacity-10 animate-float" style={{ animationDelay: '2s' }}>🧁</div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 bg-secondary/80 backdrop-blur-sm text-secondary-foreground px-4 py-2 rounded-full mb-4 text-sm font-medium">
              <span className="animate-pulse">🍪</span>
              Fresh From Our Ovens
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground animate-fade-up">
              Our Menu
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Explore our complete selection of artisan baked goods, crafted with passion
            </p>
          </div>
        </div>
      </div>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-12">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`relative px-5 py-2.5 rounded-full font-medium transition-all duration-300 overflow-hidden group ${activeCategory === category.id
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                    }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <span className={`transition-transform duration-300 ${activeCategory === category.id ? 'animate-bounce' : 'group-hover:scale-125'}`}>
                      {category.emoji}
                    </span>
                    {category.label}
                  </span>
                  {activeCategory === category.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-golden opacity-100" />
                  )}
                </button>
              ))}
            </div>

            {/* View & Sort Controls */}
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-muted rounded-full p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-full transition-all duration-300 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/10'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-all duration-300 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted-foreground/10'}`}
                >
                  <LayoutList className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full hover:bg-muted/80 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">Sort</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} />
                </button>

                {showSortMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-card rounded-xl shadow-lg border border-border py-2 z-20 animate-scale-in origin-top-right">
                    {sortOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => { setSortBy(option.id); setShowSortMenu(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${sortBy === option.id ? 'text-primary font-medium' : ''}`}
                      >
                        {option.label}
                        {sortBy === option.id && <span className="float-right">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Count */}
          {!loading && !error && (
            <p className="text-muted-foreground text-sm mb-6">
              Showing <span className="font-semibold text-foreground">{sortedProducts.length}</span> items
              {activeCategory !== 'all' && <span> in <span className="font-semibold text-primary">{activeCategory}</span></span>}
            </p>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16 bg-destructive/5 rounded-3xl">
              <span className="text-5xl mb-4 block">😢</span>
              <p className="text-destructive mb-2 font-medium text-lg">{error}</p>
              <p className="text-muted-foreground text-sm">
                Make sure the backend server is running on port 5000
              </p>
            </div>
          )}

          {/* Products Grid/List */}
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8'
            : 'flex flex-col gap-4'
          }>
            {loading
              ? Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)
              : sortedProducts.map((product, index) => (
                <div
                  key={product._id || product.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {viewMode === 'grid' ? (
                    <ProductCard product={{ ...product, id: product._id || product.id }} />
                  ) : (
                    // List View Card
                    <div className="bg-card rounded-2xl p-4 shadow-soft hover:shadow-hover transition-all duration-300 flex gap-4 group">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-32 h-32 rounded-xl object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="flex-1">
                        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {product.category}
                        </span>
                        <h3 className="font-display text-xl font-semibold mt-1 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xl font-bold text-primary">
                            ${product.price.toFixed(2)}
                          </span>
                          <button className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            }
          </div>

          {/* Empty State */}
          {!loading && !error && sortedProducts.length === 0 && (
            <div className="text-center py-20 bg-muted/30 rounded-3xl">
              <span className="text-6xl mb-4 block">🔍</span>
              <h3 className="font-display text-xl font-semibold mb-2">No Products Found</h3>
              <p className="text-muted-foreground">
                Try selecting a different category or check back later.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Menu;
