export function CompanyDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Header */}
      <div className="h-8 w-1/3 rounded bg-muted" />

      {/* Grid: About + Tech Verticals */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left (About) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="h-10 rounded bg-muted" />
              <div className="h-10 rounded bg-muted" />
              <div className="h-10 rounded bg-muted" />
              <div className="h-10 rounded bg-muted" />
              <div className="h-10 rounded bg-muted" />
            </div>
            <div className="h-20 rounded bg-muted" />
            <div className="h-12 rounded bg-muted" />
          </div>

          <div className="space-y-3">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-6 w-24 rounded bg-muted" />
              ))}
            </div>
          </div>
        </div>

        {/* Right (Management + Board) */}
        <div className="space-y-6">
          {/* Management */}
          <div className="space-y-3">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="rounded bg-muted h-40" />
          </div>

          {/* Board */}
          <div className="space-y-3">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="rounded bg-muted h-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
