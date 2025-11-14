import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function PeopleSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="space-y-4 p-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            <Skeleton className="h-4 w-24" />
          </Card>
        ))}
      </div>

      <nav
        aria-label="Pagination"
        className="mt-12 flex items-center justify-center gap-2"
      >
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
