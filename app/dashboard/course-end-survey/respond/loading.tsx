import { Skeleton } from "@/components/ui/skeleton"

export default function CourseEndSurveyRespondLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <div className="space-y-4">
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-full" />

          <div className="space-y-6">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-[80%]" />
                  <div className="flex gap-4">
                    {Array(5)
                      .fill(0)
                      .map((_, j) => (
                        <Skeleton key={j} className="h-6 w-6 rounded-full" />
                      ))}
                  </div>
                </div>
              ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Skeleton className="h-10 w-[100px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </div>
      </div>
    </div>
  )
}
