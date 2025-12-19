import { useState, useRef, useEffect } from 'react';

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const containerRef = useRef(null);
  const buttonRefs = useRef({});

  // Emoji map for categories
  const categoryEmojis = {
    all: '✨',
    cakes: '🎂',
    pastries: '🥐',
    breads: '🥖',
  };

  // Update indicator position when active category changes
  useEffect(() => {
    const activeButton = buttonRefs.current[activeCategory];
    if (activeButton && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [activeCategory]);

  return (
    <div
      ref={containerRef}
      className="relative inline-flex flex-wrap gap-1 p-1.5 bg-muted/50 rounded-full backdrop-blur-sm"
    >
      {/* Sliding Indicator */}
      <div
        className="absolute h-[calc(100%-12px)] bg-gradient-to-r from-primary to-golden rounded-full transition-all duration-300 ease-out shadow-lg"
        style={{
          left: indicatorStyle.left || 0,
          width: indicatorStyle.width || 0,
          top: '6px',
        }}
      />

      {categories.map((category) => (
        <button
          key={category}
          ref={(el) => buttonRefs.current[category] = el}
          onClick={() => onCategoryChange(category)}
          className={`relative z-10 px-4 md:px-6 py-2.5 md:py-3 rounded-full font-medium text-sm md:text-base transition-all duration-300 flex items-center gap-2 ${activeCategory === category
              ? 'text-white'
              : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          <span className={`transition-transform duration-300 ${activeCategory === category ? 'scale-125' : 'scale-100'}`}>
            {categoryEmojis[category] || '📦'}
          </span>
          <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
