export function PersonDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-8 w-1/3 rounded bg-muted" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="rounded bg-muted h-40" />
          </div>

          <div className="space-y-3">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="rounded bg-muted h-60" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="rounded bg-muted h-40" />
          </div>

          <div className="space-y-3">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="rounded bg-muted h-60" />
          </div>
        </div>
      </div>
    </div>
  );
}
