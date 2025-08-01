import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function Loading() {
  return (
    <div className="grid gap-6 p-6 md:p-8">
      <h1 className="text-3xl font-bold">Department CO-PO Mapping</h1>

      <Card>
        <CardHeader>
          <CardTitle>Department Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-1 h-6 w-48" />
            </div>
            <div>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-1 h-6 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-1 h-6 w-40" />
            </div>
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-1 h-6 w-40" />
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-1 h-16 w-full" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Program Outcomes (POs)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">PO Number</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {[1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-64" />
            </CardTitle>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="grid gap-4">
            <h3 className="text-lg font-semibold">
              <Skeleton className="h-5 w-48" />
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">CO Number</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2].map((j) => (
                  <TableRow key={j}>
                    <TableCell className="font-medium">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <h3 className="text-lg font-semibold mt-4">
              <Skeleton className="h-5 w-48" />
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">CO / PO</TableHead>
                  {[1, 2, 3].map((k) => (
                    <TableHead key={k} className="text-center">
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[1, 2].map((j) => (
                  <TableRow key={j}>
                    <TableCell className="font-medium">
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    {[1, 2, 3].map((k) => (
                      <TableCell key={k} className="text-center">
                        <Skeleton className="h-6 w-16 mx-auto" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
