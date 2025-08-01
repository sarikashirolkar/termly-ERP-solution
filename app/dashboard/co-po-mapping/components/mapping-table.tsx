"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CourseOutcome, ProgramOutcome, ProgramSpecificOutcome, MappingCell } from "../types"

interface MappingTableProps {
  courseOutcomes: CourseOutcome[]
  programOutcomes: ProgramOutcome[]
  programSpecificOutcomes: ProgramSpecificOutcome[]
  mappings: MappingCell[]
  onMappingChange: (coId: string, poId: string, value: number) => void
}

export function MappingTable({
  courseOutcomes,
  programOutcomes,
  programSpecificOutcomes,
  mappings,
  onMappingChange,
}: MappingTableProps) {
  const getMappingValue = (coId: string, poId: string): number => {
    const mapping = mappings.find((m) => m.coId === coId && m.poId === poId)
    return mapping ? mapping.value : 0
  }

  const handleMappingChange = (coId: string, poId: string, value: string) => {
    onMappingChange(coId, poId, Number.parseInt(value))
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Course Outcomes</TableHead>
            {programOutcomes.map((po) => (
              <TableHead key={po.id} className="text-center">
                {po.code}
              </TableHead>
            ))}
            {programSpecificOutcomes.map((pso) => (
              <TableHead key={pso.id} className="text-center">
                {pso.code}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {courseOutcomes.map((co) => (
            <TableRow key={co.id}>
              <TableCell className="font-medium">{co.code}</TableCell>
              {programOutcomes.map((po) => (
                <TableCell key={`${co.id}-${po.id}`} className="text-center">
                  <Select
                    value={getMappingValue(co.id, po.id).toString()}
                    onValueChange={(value) => handleMappingChange(co.id, po.id, value)}
                  >
                    <SelectTrigger className="w-16 mx-auto">
                      <SelectValue placeholder="0" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              ))}
              {programSpecificOutcomes.map((pso) => (
                <TableCell key={`${co.id}-${pso.id}`} className="text-center">
                  <Select
                    value={getMappingValue(co.id, pso.id).toString()}
                    onValueChange={(value) => handleMappingChange(co.id, pso.id, value)}
                  >
                    <SelectTrigger className="w-16 mx-auto">
                      <SelectValue placeholder="0" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
