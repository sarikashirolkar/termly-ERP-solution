export default function Loading() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="h-8 w-48 bg-muted animate-pulse rounded-md mb-6"></div>

      <div className="border rounded-md p-6 space-y-6">
        <div className="h-6 w-36 bg-muted animate-pulse rounded-md"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="h-5 w-20 bg-muted animate-pulse rounded-md"></div>
            <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
          </div>

          <div className="space-y-2">
            <div className="h-5 w-32 bg-muted animate-pulse rounded-md"></div>
            <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="h-10 w-28 bg-muted animate-pulse rounded-md"></div>
        </div>
      </div>
    </div>
  )
}
