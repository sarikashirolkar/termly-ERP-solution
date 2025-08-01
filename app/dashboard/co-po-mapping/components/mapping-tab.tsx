"use client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronDown, FileText, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { MappingLevel, CourseConfig } from "../types"

interface MappingTabProps {
  courseConfig: CourseConfig
  mappings: Record<string, Record<string, Record<string, MappingLevel>>>
  selectedCourse: string
  setSelectedCourse: (course: string) => void
  handleMappingChange: (coId: string, poId: string, level: MappingLevel) => void
  getMappingLevel: (coId: string, poId: string) => MappingLevel
  saveMappingData: () => boolean
  exportMappingToCSV: () => string
  courseOutcomes?: any[]
  programOutcomes?: any[]
  programSpecificOutcomes?: any[]
}

export default function MappingTab({
  courseConfig,
  mappings,
  selectedCourse,
  setSelectedCourse,
  handleMappingChange,
  getMappingLevel,
  saveMappingData,
  exportMappingToCSV,
  courseOutcomes,
  programOutcomes,
  programSpecificOutcomes,
}: MappingTabProps) {
  const { toast } = useToast()

  // Use provided outcomes or fallback to mock data
  const cos = courseOutcomes || [
    { id: "CO1", code: "CO1", description: "Understand fundamental concepts" },
    { id: "CO2", code: "CO2", description: "Apply algorithmic thinking" },
    { id: "CO3", code: "CO3", description: "Analyze algorithm efficiency" },
    { id: "CO4", code: "CO4", description: "Implement programming constructs" },
    { id: "CO5", code: "CO5", description: "Evaluate programming paradigms" },
  ]

  const pos = programOutcomes || [
    { id: "PO1", code: "PO1", description: "Engineering Knowledge" },
    { id: "PO2", code: "PO2", description: "Problem Analysis" },
    { id: "PO3", code: "PO3", description: "Design/Development of Solutions" },
    { id: "PO4", code: "PO4", description: "Conduct Investigations" },
    { id: "PO5", code: "PO5", description: "Modern Tool Usage" },
    { id: "PO6", code: "PO6", description: "The Engineer and Society" },
    { id: "PO7", code: "PO7", description: "Environment and Sustainability" },
    { id: "PO8", code: "PO8", description: "Ethics" },
    { id: "PO9", code: "PO9", description: "Individual and Team Work" },
    { id: "PO10", code: "PO10", description: "Communication" },
    { id: "PO11", code: "PO11", description: "Project Management and Finance" },
    { id: "PO12", code: "PO12", description: "Life-long Learning" },
  ]

  const psos = programSpecificOutcomes || [
    { id: "PSO1", code: "PSO1", description: "Professional Skills" },
    { id: "PSO2", code: "PSO2", description: "Problem-Solving Skills" },
  ]

  const getMappingColor = (level: MappingLevel): string => {
    switch (level) {
      case 1:
        return "bg-[#FFFBE6]" // Light yellow for Low
      case 2:
        return "bg-[#EBF3FF]" // Light blue for Medium
      case 3:
        return "bg-[#EDFCF2]" // Light green for High
      default:
        return "bg-white"
    }
  }

  const handleExportCSV = () => {
    const csvContent = exportMappingToCSV()

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("hidden", "")
    a.setAttribute("href", url)
    a.setAttribute("download", `${selectedCourse}_CO-PO_Mapping.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    toast({
      title: "Export successful",
      description: `CO-PO mapping for ${selectedCourse} has been exported as CSV.`,
    })
  }

  const handleSaveMapping = () => {
    const success = saveMappingData()

    if (success) {
      toast({
        title: "Mapping saved",
        description: `CO-PO mapping for ${selectedCourse} has been saved successfully.`,
        variant: "success",
      })
    } else {
      toast({
        title: "Error saving data",
        description: "There was an error saving your data.",
        variant: "destructive",
      })
    }
  }

  const handleImportCSV = () => {
    toast({
      title: "Import feature",
      description: "CSV import functionality would be implemented here.",
    })
  }

  return (
    <div className="border rounded-lg p-6 bg-white">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">CO-PO Mapping Matrix</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1 h-9 px-3 py-2 text-sm font-medium"
          >
            <FileText className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleImportCSV}
            className="flex items-center gap-1 h-9 px-3 py-2 text-sm font-medium"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Map each Course Outcome to Program Outcomes with appropriate correlation levels: 0 (None), 1 (Low), 2 (Medium),
        3 (High)
      </p>

      <div className="overflow-x-auto">
        <Table className="border w-full">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-medium text-gray-700 py-3 px-4 text-left border">CO / PO</TableHead>
              {pos.map((po) => (
                <TableHead key={po.id} className="font-medium text-gray-700 py-3 px-4 text-center border">
                  {po.code}
                </TableHead>
              ))}
              {psos.map((pso) => (
                <TableHead key={pso.id} className="font-medium text-gray-700 py-3 px-4 text-center border">
                  {pso.code}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {cos.map((co) => (
              <TableRow key={co.id}>
                <TableCell className="font-medium py-3 px-4 border">{co.code}</TableCell>
                {pos.map((po) => {
                  const level = getMappingLevel(co.id, po.id)
                  return (
                    <TableCell key={po.id} className={`p-0 border ${getMappingColor(level)}`}>
                      <div className="flex items-center justify-center cursor-pointer py-3 px-4">
                        <span className="mr-1">{level}</span>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </div>
                    </TableCell>
                  )
                })}
                {psos.map((pso) => {
                  const level = getMappingLevel(co.id, pso.id)
                  return (
                    <TableCell key={pso.id} className={`p-0 border ${getMappingColor(level)}`}>
                      <div className="flex items-center justify-center cursor-pointer py-3 px-4">
                        <span className="mr-1">{level}</span>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </div>
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6">
        <h3 className="text-base font-medium mb-2">Mapping Legend</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border"></div>
            <span className="text-sm">0 - None</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#FFFBE6] border"></div>
            <span className="text-sm">1 - Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#EBF3FF] border"></div>
            <span className="text-sm">2 - Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#EDFCF2] border"></div>
            <span className="text-sm">3 - High</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSaveMapping} className="bg-[#0F172A] hover:bg-[#1E293B] text-white">
          Save Mapping
        </Button>
      </div>
    </div>
  )
}
