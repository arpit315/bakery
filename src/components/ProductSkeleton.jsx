const ProductSkeleton = () => {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-soft">
      {/* Image Skeleton with shimmer */}
      <div className="aspect-[4/3] w-full bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />

      {/* Content Skeleton */}
      <div className="p-4 md:p-5 space-y-3">
        {/* Category Badge */}
        <div className="h-5 w-20 rounded-full bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />

        {/* Title */}
        <div className="h-6 w-3/4 rounded-lg bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" style={{ animationDelay: '0.1s' }} />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded-lg bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" style={{ animationDelay: '0.2s' }} />
          <div className="h-4 w-2/3 rounded-lg bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" style={{ animationDelay: '0.3s' }} />
        </div>

        {/* Price & Button */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-8 w-20 rounded-lg bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" style={{ animationDelay: '0.4s' }} />
          <div className="h-10 w-24 rounded-full bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
