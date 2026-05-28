export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-32 bg-muted rounded-lg mb-2" />
          <div className="h-4 w-56 bg-muted/60 rounded-md" />
        </div>
        <div className="h-9 w-28 bg-muted rounded-lg" />
      </div>

      {/* Metrics row skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-5 rounded-xl border border-border bg-card h-24" />
        ))}
      </div>

      {/* Middle row skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-border bg-card h-56" />
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card h-56" />
      </div>

      {/* Bottom row skeleton */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-xl border border-border bg-card h-64" />
        <div className="p-6 rounded-xl border border-border bg-card h-64" />
      </div>
    </div>
  );
}
