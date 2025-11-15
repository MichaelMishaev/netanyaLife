import { Skeleton, ReviewCardSkeleton } from '@/components/ui/Skeleton'

export default function BusinessDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button */}
      <Skeleton className="mb-6 h-6 w-24" />

      {/* Business header */}
      <div className="mb-8">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="mb-2 h-10 w-3/4" />
            <Skeleton className="mb-4 h-6 w-1/2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Rating */}
        <Skeleton className="mb-4 h-6 w-48" />
      </div>

      {/* Business details */}
      <div className="mb-8 space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-6 w-3/4" />
      </div>

      {/* CTA buttons */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>

      {/* Reviews section */}
      <div>
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ReviewCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
