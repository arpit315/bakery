import { useCart } from '@/context/CartContext.jsx';
import { Plus, Heart, Eye, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import StarRating from '@/components/StarRating.jsx';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

  // 3D Tilt Effect
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`,
      transition: 'transform 0.1s ease-out'
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
      transition: 'transform 0.3s ease-out'
    });
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    addToCart(product);
    toast({
      title: "Added to cart! 🛒",
      description: `${product.name} has been added to your cart.`,
    });
    setTimeout(() => setIsAdding(false), 500);
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist! ❤️",
      description: isWishlisted
        ? `${product.name} removed from your wishlist.`
        : `${product.name} saved to your wishlist.`,
    });
  };

  // Category badge color
  const getCategoryColor = (category) => {
    const colors = {
      cakes: 'bg-pink-500',
      pastries: 'bg-amber-500',
      breads: 'bg-yellow-600',
      default: 'bg-primary'
    };
    return colors[category?.toLowerCase()] || colors.default;
  };

  return (
    <>
      <div
        ref={cardRef}
        className="card-product group relative"
        style={tiltStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Image Container */}
        <div className="relative overflow-hidden aspect-[4/3]">
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-all duration-700 ${isHovered ? 'scale-110 blur-[1px]' : 'scale-100'}`}
          />

          {/* Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-chocolate/60 via-chocolate/20 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

          {/* Category Badge */}
          <span className={`absolute top-3 left-3 ${getCategoryColor(product.category)} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
            {product.category}
          </span>

          {/* Action Buttons */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
            {/* Wishlist Button */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleWishlist(); }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'}`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>

            {/* Quick View Button */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowQuickView(true); }}
              className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-gray-700 hover:bg-primary hover:text-white transition-all duration-300 shadow-lg"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Add Button (on hover) */}
          <div className={`absolute bottom-4 left-4 right-4 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <Button
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`w-full rounded-full py-5 font-semibold shadow-lg transition-all duration-300 ${isAdding ? 'bg-green-500' : 'bg-white text-primary hover:bg-primary hover:text-white'}`}
            >
              {isAdding ? (
                <>
                  <ShoppingBag className="w-4 h-4 mr-2 animate-bounce" />
                  Added!
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Quick Add
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-display text-lg md:text-xl font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-300">
                {product.name}
              </h3>
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={product.averageRating} size="sm" />
                  <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {product.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-primary">
                ₹{product.price.toFixed(0)}
              </span>
            </div>
            <Button
              onClick={handleAddToCart}
              size="sm"
              className="rounded-full gap-1 bg-primary hover:bg-primary/90 shadow-soft hover:shadow-hover transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>

        {/* Glow effect on hover */}
        <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} style={{ boxShadow: '0 0 60px -15px hsl(35 80% 55% / 0.3)' }} />
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowQuickView(false)}
        >
          <div
            className="bg-card rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2 gap-0">
              {/* Image */}
              <div className="relative aspect-square md:aspect-auto">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <span className={`absolute top-4 left-4 ${getCategoryColor(product.category)} text-white text-sm font-bold px-3 py-1 rounded-full`}>
                  {product.category}
                </span>
              </div>

              {/* Details */}
              <div className="p-6 md:p-8 flex flex-col">
                <button
                  onClick={() => setShowQuickView(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
                >
                  ✕
                </button>

                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  {product.name}
                </h2>

                <p className="text-muted-foreground mt-3 flex-1">
                  {product.description}
                </p>

                <div className="mt-6">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold text-primary">
                      ₹{product.price.toFixed(0)}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => { handleAddToCart(); setShowQuickView(false); }}
                      className="flex-1 rounded-full py-6 font-semibold bg-primary hover:bg-primary/90"
                    >
                      <ShoppingBag className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                    <button
                      onClick={toggleWishlist}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isWishlisted ? 'bg-red-500 text-white' : 'bg-muted hover:bg-red-500 hover:text-white'}`}
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
