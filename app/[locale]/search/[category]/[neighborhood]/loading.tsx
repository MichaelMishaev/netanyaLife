import { BusinessCardSkeleton, PageHeaderSkeleton } from '@/components/ui/Skeleton'

export default function SearchResultsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeaderSkeleton />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <BusinessCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
