export default function UploadMarksLoading() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-64 bg-muted animate-pulse rounded-md mb-2"></div>
          <div className="h-4 w-48 bg-muted animate-pulse rounded-md"></div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-5 w-5 bg-muted animate-pulse rounded-md"></div>
          <div className="h-4 w-24 bg-muted animate-pulse rounded-md"></div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex space-x-1">
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md"></div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md"></div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded-md"></div>
        </div>

        <div className="rounded-lg border">
          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-5 bg-muted animate-pulse rounded-md"></div>
              <div className="h-6 w-48 bg-muted animate-pulse rounded-md"></div>
            </div>

            <div className="h-4 w-96 bg-muted animate-pulse rounded-md"></div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-muted animate-pulse rounded-md"></div>
                  <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded-md"></div>
                <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded-md"></div>
                <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="h-10 w-32 bg-muted animate-pulse rounded-md"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
