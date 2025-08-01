export default function FormsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-32 bg-muted animate-pulse rounded"></div>
        <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
      </div>

      <div className="grid gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 border rounded-lg space-y-4">
            <div className="h-6 w-3/4 bg-muted animate-pulse rounded"></div>
            <div className="h-4 w-1/2 bg-muted animate-pulse rounded"></div>
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
              <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
