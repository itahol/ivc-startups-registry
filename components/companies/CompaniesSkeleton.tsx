import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// Skeleton shown while the CompaniesClient (client component) loads & fetches data.
// Mirrors spacing & grid to avoid layout shift.
export function CompaniesSkeleton() {
  return (
    <div>
      {/* Filters Row (static skeleton state) */}
      <div
        className={`
          mb-8 flex flex-col gap-4
          md:flex-row md:items-center md:justify-between
        `}
      >
        <div className="flex flex-wrap items-center gap-2 min-h-8">
          {/* Static non-interactive placeholder; real FiltersDrawer mounts in client component after hydration */}
          <Button variant="outline" disabled aria-disabled="true" className="pointer-events-none opacity-70">
            Filters
          </Button>
        </div>
      </div>

      <div
        className={`
          grid grid-cols-1 gap-8
          sm:grid-cols-2
          lg:grid-cols-3
          2xl:grid-cols-4
        `}
        aria-hidden="true"
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

      <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2" aria-hidden="true">
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
