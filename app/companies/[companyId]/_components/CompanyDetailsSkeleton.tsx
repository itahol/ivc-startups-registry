export function CompanyDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Header */}
      <div className="h-8 w-1/3 rounded bg-muted" />

      {/* Grid: Contact Info + About/Tech | Funding + People */}
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Left (Contact Info + About/Tech) */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
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

          {/* Tech Verticals */}
          <div className="space-y-3">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-6 w-24 rounded bg-muted" />
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <div className="h-4 w-28 rounded bg-muted" />
            <div className="rounded bg-muted h-40" />
          </div>
        </div>

        {/* Right (Funding + Management + Board) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Funding Rounds */}
          <div className="space-y-3">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="rounded bg-muted h-40" />
          </div>

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
