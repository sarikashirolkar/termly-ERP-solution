import { Skeleton } from "@/components/ui/skeleton"

export default function AssignProcteesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-6">
        <Skeleton className="h-[400px] w-full" />
      </div>
    </div>
  )
}
