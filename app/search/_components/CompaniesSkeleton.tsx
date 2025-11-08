import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// Skeleton shown while the companies grid streams in via Suspense.
export function CompaniesSkeleton() {
  return (
    <div aria-hidden="true">
      <div
        className={`
          grid grid-cols-1 gap-8
          sm:grid-cols-2
          lg:grid-cols-3
          2xl:grid-cols-4
        `}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="space-y-4 p-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </Card>
        ))}
      </div>

      <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
        <Button disabled variant="outline">
          Previous
        </Button>
        <Button aria-current="page" variant="default" disabled>
          1
        </Button>
        <Button disabled variant="outline">
          Next
        </Button>
      </nav>
    </div>
  );
}
