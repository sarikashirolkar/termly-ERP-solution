import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function LoadingFormResponse() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-8 w-64" />
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-4 w-full" />
          <div className="flex flex-wrap gap-4 mt-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full mb-6" />

          <div className="space-y-8">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="pb-6 border-b last:border-0 last:pb-0">
                  <div className="flex items-start gap-2 mb-2">
                    <Skeleton className="h-5 w-5" />
                    <div className="w-full">
                      <Skeleton className="h-5 w-full max-w-md mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>

                  {i % 2 === 0 ? (
                    <div className="flex space-x-4 pt-2">
                      {Array(5)
                        .fill(0)
                        .map((_, j) => (
                          <div key={j} className="flex flex-col items-center space-y-1">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-3 w-3" />
                          </div>
                        ))}
                    </div>
                  ) : (
                    <Skeleton className="h-24 w-full mt-2" />
                  )}
                </div>
              ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </CardFooter>
      </Card>
    </div>
  )
}
