export function CompanyDetailsSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-8 w-1/3 rounded bg-muted" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="h-4 w-1/2 rounded bg-muted" />
          <div className="h-24 rounded bg-muted" />
        </div>
        <div className="space-y-4">
          <div className="h-4 w-1/3 rounded bg-muted" />
          <div className="h-24 rounded bg-muted" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="h-4 w-40 rounded bg-muted" />
        <div className="h-40 rounded bg-muted" />
      </div>
    </div>
  );
}
