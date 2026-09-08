export default function PromoCardSkeleton() {
  return (
    <div className="promo-card">
      {/* Image Skeleton */}
      <div className="aspect-video bg-muted animate-pulse" />

      {/* Content Skeleton */}
      <div className="p-5 space-y-4">
        <div className="h-6 bg-muted rounded-lg animate-pulse w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
        </div>
        <div className="pt-4 border-t border-border flex justify-between">
          <div className="h-4 bg-muted rounded animate-pulse w-32" />
          <div className="h-4 bg-muted rounded animate-pulse w-24" />
        </div>
      </div>
    </div>
  );
}
