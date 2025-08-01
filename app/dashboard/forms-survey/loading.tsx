import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function LoadingFormsSurvey() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-10 w-72" />

        <div className="space-y-4 mt-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="w-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-48 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="grid grid-cols-2 gap-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-24" />
                </CardFooter>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}
