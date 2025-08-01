"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileImportExport } from "./file-import-export"
import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"
import { Download, Printer, RotateCcw, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DynamicAttainmentTable } from "@/components/dynamic-attainment-table"
import type { CourseOutcome, ProgramOutcome, ProgramSpecificOutcome } from "../types"
import { Check, Edit, Trash2, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface AttainmentTabProps {
  courseConfig: any
  courseOutcomes: any
  programOutcomes: ProgramOutcome[]
  programSpecificOutcomes: ProgramSpecificOutcome[]
  selectedCourse: string
  editingCO: string | null
  editingPO: string | null
  editingPSO: string | null
  tempEditValue: string
  setTempEditValue: (value: string) => void
  startEditingCO: (coId: string, field: keyof CourseOutcome) => void
  startEditingPO: (poId: string, field: keyof ProgramOutcome) => void
  startEditingPSO: (psoId: string, field: keyof ProgramSpecificOutcome) => void
  saveEditCO: (coId: string, field: keyof CourseOutcome) => boolean
  saveEditPO: (poId: string, field: keyof ProgramOutcome) => boolean
  saveEditPSO: (psoId: string, field: keyof ProgramSpecificOutcome) => boolean
  cancelEdit: () => void
  addCourseOutcome?: (course: string) => void
  addProgramOutcome?: () => void
  addProgramSpecificOutcome?: () => void
  deleteCourseOutcome?: (course: string, coId: string) => void
  deleteProgramOutcome?: (poId: string) => void
  deleteProgramSpecificOutcome?: (psoId: string) => void
}

export default function AttainmentTab({
  courseConfig,
  courseOutcomes,
  programOutcomes,
  programSpecificOutcomes,
  selectedCourse,
  editingCO,
  editingPO,
  editingPSO,
  tempEditValue,
  setTempEditValue,
  startEditingCO,
  startEditingPO,
  startEditingPSO,
  saveEditCO,
  saveEditPO,
  saveEditPSO,
  cancelEdit,
  addCourseOutcome,
  addProgramOutcome,
  addProgramSpecificOutcome,
  deleteCourseOutcome,
  deleteProgramOutcome,
  deleteProgramSpecificOutcome,
}: AttainmentTabProps) {
  const [activeTab, setActiveTab] = useState("config")
  const [showAttainmentSheet, setShowAttainmentSheet] = useState(false)
  const [selectedCourseAttainment, setSelectedCourseAttainment] = useState("")
  const [selectedSemester, setSelectedSemester] = useState("")
  const [selectedFaculty, setSelectedFaculty] = useState("")
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("")
  const [targetValue, setTargetValue] = useState("60")
  const [attainmentData, setAttainmentData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [activeSection, setActiveSection] = useState("main")
  const [showDeleteCODialog, setShowDeleteCODialog] = useState(false)
  const [showDeletePODialog, setShowDeletePODialog] = useState(false)
  const [showDeletePSODialog, setShowDeletePSODialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState("")
  const { toast } = useToast()
  const reportRef = useRef<HTMLDivElement>(null)
  const [showAddCODialog, setShowPODialog] = useState(false)
  const [showAddPODialog, setShowAddPODialog] = useState(false)
  const [showAddPSODialog, setShowAddPSODialog] = useState(false)
  const [newOutcomeCode, setNewOutcomeCode] = useState("")
  const [newOutcomeDescription, setNewOutcomeDescription] = useState("")
  const [cieWeight, setCieWeight] = useState(0.5)
  const [ueWeight, setUeWeight] = useState(0.4)
  const [cesWeight, setCesWeight] = useState(0.1)

  // Mock course outcomes for demo data
  const [mockCourseOutcomes, setMockCourseOutcomes] = useState([
    {
      id: "CO1",
      code: "CO1",
      description: "Demonstrate understanding of MOS transistor theory and CMOS fabrication flow.",
    },
    {
      id: "CO2",
      code: "CO2",
      description:
        "Construct schematic, stick and layout diagram for Boolean expressions with the knowledge of physical design aspects.",
    },
    {
      id: "CO3",
      code: "CO3",
      description: "Illustrate memory elements along with timing considerations.",
    },
    {
      id: "CO4",
      code: "CO4",
      description: "Interpret testing and testability issues in combinational logic design.",
    },
    {
      id: "CO5",
      code: "CO5",
      description: "Analyze testing and testability issues in sequential logic design.",
    },
  ])

  // Initialize with real course outcomes if available
  useEffect(() => {
    if (courseOutcomes[selectedCourse]?.length > 0) {
      setMockCourseOutcomes(courseOutcomes[selectedCourse])
    }
  }, [courseOutcomes, selectedCourse])

  // Mock data for dropdowns
  const courses = [
    { id: "21EC63", name: "VLSI Design & Testing" },
    { id: "21CS42", name: "Design and Analysis of Algorithms" },
    { id: "21EC52", name: "Digital Signal Processing" },
  ]

  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"]
  const faculties = ["Nayana K", "Dr. Ramesh S", "Prof. Lakshmi N", "Dr. Suresh Kumar"]
  const academicYears = ["2023-2024", "2022-2023", "2021-2022"]

  // Function to generate mock attainment data
  const generateAttainmentData = () => {
    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      const mockData = {
        courseDetails: {
          name:
            selectedCourseAttainment === "21EC63"
              ? "VLSI Design & Testing"
              : selectedCourseAttainment === "21CS42"
                ? "Design and Analysis of Algorithms"
                : "Digital Signal Processing",
          code: selectedCourseAttainment,
          semester: selectedSemester,
          faculty: selectedFaculty,
          academicYear: selectedAcademicYear,
          targetValue: Number.parseInt(targetValue),
        },
        assessments: [
          { name: "I INTERNALS", questions: [1, 2], subQuestions: ["a", "b", "c"] },
          { name: "II INTERNALS", questions: [1, 2], subQuestions: ["a", "b", "c", "d"] },
          { name: "III INTERNALS", questions: [1, 2], subQuestions: ["a", "b", "c", "d"] },
          { name: "IA- comp 2", questions: ["Assign 1", "Assign 2", "Quiz"] },
          { name: "SEE", questions: [] },
        ],
        maxMarks: {
          "I INTERNALS": { 1: { a: 10, b: 5, c: 5 }, 2: { a: 10, b: 5, c: 5 } },
          "II INTERNALS": { 1: { a: 7, b: 6, c: 4, d: 3 }, 2: { a: 7, b: 6, c: 4, d: 3 } },
          "III INTERNALS": { 1: { a: 7, b: 5, c: 4, d: 4 }, 2: { a: 6, b: 5, c: 5, d: 4 } },
          "IA- comp 2": { "Assign 1": 10, "Assign 2": 10, Quiz: 20 },
          SEE: 50,
        },
        targetMaxMarks: {
          "I INTERNALS": { 1: { a: 6.0, b: 3.0, c: 3.0 }, 2: { a: 6.0, b: 3.0, c: 3.0 } },
          "II INTERNALS": { 1: { a: 4.2, b: 3.6, c: 2.4, d: 1.8 }, 2: { a: 4.2, b: 3.6, c: 2.4, d: 1.8 } },
          "III INTERNALS": { 1: { a: 4.2, b: 3.0, c: 2.4, d: 2.4 }, 2: { a: 3.6, b: 3.0, c: 3.0, d: 2.4 } },
          "IA- comp 2": { "Assign 1": 6.0, "Assign 2": 6.0, Quiz: 12.0 },
          SEE: 30.0,
        },
        coMapping: {
          "I INTERNALS": { 1: { a: "CO1", b: "CO1", c: "CO1" }, 2: { a: "CO1", b: "CO1", c: "CO1" } },
          "II INTERNALS": {
            1: { a: "CO2", b: "CO2", c: "CO2", d: "CO2" },
            2: { a: "CO2", b: "CO2", c: "CO2", d: "CO1" },
          },
          "III INTERNALS": {
            1: { a: "CO4", b: "CO5", c: "CO5", d: "CO4" },
            2: { a: "CO4", b: "CO5", c: "CO5", d: "CO5" },
          },
          "IA- comp 2": { "Assign 1": "CO1,2", "Assign 2": "CO3,4,5", Quiz: "All COs" },
        },
        students: generateMockStudents(30),
        attainmentPercentages: generateMockAttainmentPercentages(),
        attainmentLevels: {
          criteria: [
            { percentage: 60, level: 3 },
            { percentage: 50, level: 2 },
            { percentage: 40, level: 1 },
          ],
          weightage: {
            CIE: 50,
            UE: 40,
            CES: 10,
          },
        },
        courseEndSurvey: {
          questions: 5,
          studentsResponded: 88,
          responses: 440,
          totalResponseValue: 1191,
        },
        coAttainment: [
          { co: "CO1", cie: 82.39, cieLevel: 3, ue: 33.07, ueLevel: 0.83, ces: 2.71, attainment: 2.1 },
          { co: "CO2", cie: 76.44, cieLevel: 3, ue: 33.07, ueLevel: 0.83, ces: 2.71, attainment: 2.1 },
          { co: "CO3", cie: 99.81, cieLevel: 3, ue: 33.07, ueLevel: 0.83, ces: 2.71, attainment: 2.1 },
          { co: "CO4", cie: 80.45, cieLevel: 3, ue: 33.07, ueLevel: 0.83, ces: 2.71, attainment: 2.1 },
          { co: "CO5", cie: 95.87, cieLevel: 3, ue: 33.07, ueLevel: 0.83, ces: 2.71, attainment: 2.1 },
        ],
        poAttainment: {
          CO1: { PO1: 3, PO2: 0, PO3: 0, PO4: 0, PO5: 0, PO6: 0, PO7: 0, PO8: 0, PO9: 0, PO10: 0, PO11: 0, PO12: 0 },
          CO2: { PO1: 0, PO2: 0, PO3: 3, PO4: 0, PO5: 3, PO6: 0, PO7: 0, PO8: 0, PO9: 0, PO10: 0, PO11: 0, PO12: 3 },
          CO3: { PO1: 0, PO2: 0, PO3: 3, PO4: 0, PO5: 0, PO6: 0, PO7: 0, PO8: 0, PO9: 0, PO10: 0, PO11: 0, PO12: 0 },
          CO4: { PO1: 0, PO2: 3, PO3: 0, PO4: 0, PO5: 0, PO6: 0, PO7: 0, PO8: 0, PO9: 0, PO10: 0, PO11: 0, PO12: 0 },
          CO5: { PO1: 0, PO2: 0, PO3: 0, PO4: 0, PO5: 3, PO6: 0, PO7: 0, PO8: 0, PO9: 0, PO10: 0, PO11: 0, PO12: 0 },
          Avg: {
            PO1: 3.0,
            PO2: 3.0,
            PO3: 3.0,
            PO4: 0,
            PO5: 3.0,
            PO6: 0,
            PO7: 0,
            PO8: 0,
            PO9: 0,
            PO10: 0,
            PO11: 0,
            PO12: 3.0,
          },
          Attainment: {
            PO1: 2.1,
            PO2: 2.1,
            PO3: 2.1,
            PO4: 0,
            PO5: 2.1,
            PO6: 0,
            PO7: 0,
            PO8: 0,
            PO9: 0,
            PO10: 0,
            PO11: 0,
            PO12: 2.1,
          },
        },
        psoAttainment: {
          CO1: { PSO1: 2, PSO2: 2 },
          CO2: { PSO1: 3, PSO2: 2 },
          CO3: { PSO1: 3, PSO2: 2 },
          CO4: { PSO1: 2, PSO2: 3 },
          CO5: { PSO1: 2, PSO2: 3 },
          Avg: { PSO1: 2.4, PSO2: 2.4 },
          Attainment: { PSO1: 1.68, PSO2: 1.68 },
        },
        courseOutcomes: mockCourseOutcomes,
      }

      setAttainmentData(mockData)
      setShowAttainmentSheet(true)
      setIsLoading(false)
    }, 1500)
  }

  // Helper function to generate mock students
  const generateMockStudents = (count: number) => {
    const students = []
    for (let i = 1; i <= count; i++) {
      const usn = `1VA21EC${String(i).padStart(3, "0")}`
      const names = [
        "ADITYA RANJAN",
        "AKASH BOLEGAON",
        "AKASH NAIR A",
        "AKASH SANGANNA HARSOORKER",
        "AMAR MUTTAPPA KARADIGUDDA",
        "AMBIKA",
        "ANANYA L",
        "ANIKA SHREYA PRASAD",
        "ANKITHA R",
        "BHARAT RAJ P",
        "BHARATH N",
        "BHARGAV S R",
        "BHUMIKA JAGADESH",
        "BHUVAN M H",
        "CHANDANA S",
        "DARSHAN B S",
        "DEEKSHA S",
        "DEEPAK KUMAR",
        "DHRUVA KUMAR",
        "DIVYA SHREE",
        "GAGAN M",
        "GANESH R",
        "HARSHA K",
        "HEMANTH KUMAR",
        "INCHARA S",
        "JEEVAN KUMAR",
        "KARTHIK R",
        "KAVYA S",
        "KEERTHI R",
        "KUSHAL M",
      ]

      // Generate random marks for each assessment
      const marks: any = {}

      // Generate marks for internals
      for (let internal = 1; internal <= 3; internal++) {
        marks[`INTERNAL${internal}`] = {}
        for (let q = 1; q <= 2; q++) {
          marks[`INTERNAL${internal}`][q] = {}
          const subQCount = internal === 1 ? 3 : 4
          for (let sq = 0; sq < subQCount; sq++) {
            const subQ = String.fromCharCode(97 + sq) // a, b, c, d
            marks[`INTERNAL${internal}`][q][subQ] = Math.floor(Math.random() * 11) // 0-10
          }
        }
      }

      // Generate marks for assignments and quiz
      marks["IA"] = {
        Assign1: Math.floor(Math.random() * 11), // 0-10
        Assign2: Math.floor(Math.random() * 11), // 0-10
        Quiz: Math.floor(Math.random() * 21), // 0-20
      }

      // Generate SEE marks
      marks["SEE"] = Math.floor(Math.random() * 51) // 0-50

      students.push({
        slNo: i,
        usn,
        name: names[i % names.length],
        marks,
      })
    }
    return students
  }

  // Helper function to generate mock attainment percentages
  const generateMockAttainmentPercentages = () => {
    const percentages: any = {}
    const assessments = ["I INTERNALS", "II INTERNALS", "III INTERNALS", "IA- comp 2", "SEE"]

    assessments.forEach((assessment) => {
      if (assessment === "IA- comp 2") {
        percentages[assessment] = {
          "Assign 1": (Math.random() * 20 + 80).toFixed(2),
          "Assign 2": (Math.random() * 20 + 80).toFixed(2),
          Quiz: (Math.random() * 20 + 80).toFixed(2),
        }
      } else if (assessment === "SEE") {
        percentages[assessment] = (Math.random() * 20 + 80).toFixed(2)
      } else {
        percentages[assessment] = {}
        for (let q = 1; q <= 2; q++) {
          percentages[assessment][q] = {}
          const subQCount = assessment === "I INTERNALS" ? 3 : 4
          for (let sq = 0; sq < subQCount; sq++) {
            const subQ = String.fromCharCode(97 + sq) // a, b, c, d
            percentages[assessment][q][subQ] = (Math.random() * 20 + 80).toFixed(2)
          }
        }
      }
    })

    return percentages
  }

  // Chart data for CO attainment
  const chartData = {
    labels: attainmentData?.coAttainment.map((co: any) => co.co) || [],
    datasets: [
      {
        label: "CO Attainment",
        data: attainmentData?.coAttainment.map((co: any) => co.attainment) || [],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        borderColor: "rgba(53, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        display: true,
      },
      title: {
        display: true,
        text: "Attainment",
        font: {
          size: 14,
        },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 3,
        ticks: {
          stepSize: 0.5,
        },
        grid: {
          display: true,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  }

  // Function to handle cell value changes
  const handleCellValueChange = (value: string, rowIndex: number, colIndex: number, tableId: string) => {
    // In a real application, this would update the data in state
    toast({
      title: "Cell updated",
      description: `Changed value to ${value} at row ${rowIndex}, column ${colIndex} in table ${tableId}`,
    })
  }

  // Function to export as PDF
  const exportAsPDF = () => {
    toast({
      title: "Exporting as PDF",
      description: "The attainment report is being exported as PDF.",
    })
  }

  // Function to print report
  const printReport = () => {
    if (reportRef.current) {
      const printContents = reportRef.current.innerHTML
      const originalContents = document.body.innerHTML

      document.body.innerHTML = printContents
      window.print()
      document.body.innerHTML = originalContents

      // Reapply event handlers and React state
      window.location.reload()
    }
  }

  // Function to save changes
  const saveChanges = () => {
    toast({
      title: "Changes saved",
      description: "All changes to the attainment report have been saved.",
    })
  }

  const attainmentConfig = {
    numIAs: 3,
    numAssignments: 2,
    numQuizzes: 1,
  }

  // Custom handlers for mock course outcomes
  const handleAddMockCO = () => {
    const newId = `CO${mockCourseOutcomes.length + 1}`
    const newCO = {
      id: newId,
      code: newId,
      description: `New course outcome ${mockCourseOutcomes.length + 1}`,
    }
    setMockCourseOutcomes([...mockCourseOutcomes, newCO])
    toast({
      title: "Added",
      description: "New Course Outcome added successfully.",
    })
  }

  const handleDeleteMockCO = (coId: string) => {
    setMockCourseOutcomes(mockCourseOutcomes.filter((co) => co.id !== coId))
    toast({
      title: "Deleted",
      description: `Course Outcome ${coId} deleted successfully.`,
    })
    setShowDeleteCODialog(false)
  }

  const handleEditMockCO = (coId: string, field: "code" | "description", value: string) => {
    const updatedOutcomes = mockCourseOutcomes.map((co) => {
      if (co.id === coId) {
        return { ...co, [field]: value }
      }
      return co
    })
    setMockCourseOutcomes(updatedOutcomes)
    return true
  }

  // Outcomes tab functions
  const handleSaveEditCO = (coId: string, field: keyof CourseOutcome) => {
    // Use custom handler for mock data
    if (field === "code" || field === "description") {
      const success = handleEditMockCO(coId, field, tempEditValue)
      if (success) {
        toast({
          title: "Updated",
          description: `Course Outcome ${field} updated successfully.`,
        })
      }
      return success
    }

    // Fall back to prop handler
    const success = saveEditCO(coId, field)
    if (success) {
      toast({
        title: "Updated",
        description: `Course Outcome ${field} updated successfully.`,
      })
    }
    return success
  }

  const handleSaveEditPO = (poId: string, field: keyof ProgramOutcome) => {
    const success = saveEditPO(poId, field)
    if (success) {
      toast({
        title: "Updated",
        description: `Program Outcome ${field} updated successfully.`,
      })
    }
    return success
  }

  const handleSaveEditPSO = (psoId: string, field: keyof ProgramSpecificOutcome) => {
    const success = saveEditPSO(psoId, field)
    if (success) {
      toast({
        title: "Updated",
        description: `Program Specific Outcome ${field} updated successfully.`,
      })
    }
    return success
  }

  const handleAddCO = () => {
    setNewOutcomeCode(`CO${mockCourseOutcomes.length + 1}`)
    setNewOutcomeDescription("")
    setShowPODialog(true)
  }

  const handleAddPO = () => {
    setNewOutcomeCode(`PO${programOutcomes.length + 1}`)
    setNewOutcomeDescription("")
    setShowAddPODialog(true)
  }

  const handleAddPSO = () => {
    setNewOutcomeCode(`PSO${programSpecificOutcomes.length + 1}`)
    setNewOutcomeDescription("")
    setShowAddPSODialog(true)
  }

  const confirmDeleteCO = (coId: string) => {
    setItemToDelete(coId)
    setShowDeleteCODialog(true)
  }

  const confirmDeletePO = (poId: string) => {
    setItemToDelete(poId)
    setShowDeletePODialog(true)
  }

  const confirmDeletePSO = (psoId: string) => {
    setItemToDelete(psoId)
    setShowDeletePSODialog(true)
  }

  const handleDeleteCO = () => {
    // Use custom handler for mock data
    handleDeleteMockCO(itemToDelete)
  }

  const handleDeletePO = () => {
    if (deleteProgramOutcome && itemToDelete) {
      deleteProgramOutcome(itemToDelete)
      toast({
        title: "Deleted",
        description: `Program Outcome ${itemToDelete} deleted successfully.`,
      })
      setShowDeletePODialog(false)
    }
  }

  const handleDeletePSO = () => {
    if (deleteProgramSpecificOutcome && itemToDelete) {
      deleteProgramSpecificOutcome(itemToDelete)
      toast({
        title: "Deleted",
        description: `Program Specific Outcome ${itemToDelete} deleted successfully.`,
      })
      setShowDeletePSODialog(false)
    }
  }

  const handleAddCOSubmit = () => {
    const newId = newOutcomeCode
    const newCO = {
      id: newId,
      code: newOutcomeCode,
      description: newOutcomeDescription,
    }
    setMockCourseOutcomes([...mockCourseOutcomes, newCO])
    setShowPODialog(false)
    toast({
      title: "Added",
      description: "New Course Outcome added successfully.",
    })
  }

  const handleAddPOSubmit = () => {
    if (addProgramOutcome) {
      // In a real implementation, this would pass the new values to the addProgramOutcome function
      addProgramOutcome()
      setShowAddPODialog(false)
      toast({
        title: "Added",
        description: "New Program Outcome added successfully.",
      })
    }
  }

  const handleAddPSOSubmit = () => {
    if (addProgramSpecificOutcome) {
      // In a real implementation, this would pass the new values to the addProgramSpecificOutcome function
      addProgramSpecificOutcome()
      setShowAddPSODialog(false)
      toast({
        title: "Added",
        description: "New Program Specific Outcome added successfully.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Attainment</h2>
        <div className="flex gap-2">
          {showAttainmentSheet ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowAttainmentSheet(false)}>
                Configure
              </Button>
              <Button variant="outline" size="sm" onClick={saveChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : null}
          <FileImportExport
            onImport={(data) => {
              console.log("Imported data:", data)
              toast({
                title: "Data imported",
                description: "Attainment data has been imported successfully.",
              })
            }}
            onExport={() => ""}
            exportFileName="Attainment_Data.csv"
          />
        </div>
      </div>

      {!showAttainmentSheet ? (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="course">Course</Label>
                  <Select value={selectedCourseAttainment} onValueChange={setSelectedCourseAttainment}>
                    <SelectTrigger id="course">
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.id} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="semester">Semester</Label>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger id="semester">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((semester) => (
                        <SelectItem key={semester} value={semester}>
                          {semester}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="faculty">Faculty</Label>
                  <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                    <SelectTrigger id="faculty">
                      <SelectValue placeholder="Select faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculties.map((faculty) => (
                        <SelectItem key={faculty} value={faculty}>
                          {faculty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="academicYear">Academic Year</Label>
                  <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                    <SelectTrigger id="academicYear">
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Label htmlFor="targetValue">Target Value (%)</Label>
              <Input
                id="targetValue"
                type="number"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                min="0"
                max="100"
                className="w-full md:w-1/3"
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={generateAttainmentData} disabled={isLoading}>
                {isLoading ? "Generating..." : "Generate Attainment Sheet"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Attainment Sheet */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Tabs defaultValue="main" value={activeSection} onValueChange={setActiveSection} className="w-full">
                <div className="bg-muted/20 px-4 py-2 flex justify-between items-center border-b">
                  <TabsList>
                    <TabsTrigger value="main">Main Report</TabsTrigger>
                    <TabsTrigger value="detailed">Detailed Marks</TabsTrigger>
                    <TabsTrigger value="co">CO Attainment</TabsTrigger>
                    <TabsTrigger value="mapping">CO-PO Mapping</TabsTrigger>
                    <TabsTrigger value="labels">CO-PO Labels</TabsTrigger>
                  </TabsList>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => generateAttainmentData()}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportAsPDF}>
                      <Download className="h-4 w-4 mr-2" />
                      Export PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={printReport}>
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </div>

                <TabsContent value="main" className="m-0">
                  <div
                    className="p-6 bg-slate-50 dark:bg-slate-900/30 rounded-lg shadow-sm dark:border-slate-700"
                    ref={reportRef}
                  >
                    <div className="flex justify-center mb-6">
                      <div className="text-center bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 w-full max-w-3xl">
                        <h2 className="text-2xl font-bold text-primary">Sai Vidya Institute of Technology</h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Accredited by NBA, New Delhi (CSE, ECE, ISE, MECH & CIVIL), NAAC - "A+" Grade
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Department of Electronics and Communication Engineering
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Rajanukunte, Bengaluru -64</p>
                        <p className="font-semibold mt-2 text-primary/80">Attainment Sheet</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="bg-white dark:bg-slate-800 rounded-md p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-xs text-primary/70 font-medium">Course Name</div>
                        <div className="font-medium mt-1">{attainmentData?.courseDetails.name}</div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-md p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-xs text-primary/70 font-medium">Target value</div>
                        <div className="font-medium mt-1">{attainmentData?.courseDetails.targetValue}</div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-md p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-xs text-primary/70 font-medium">Course Code</div>
                        <div className="font-medium mt-1">{attainmentData?.courseDetails.code}</div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-md p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-xs text-primary/70 font-medium">Semester</div>
                        <div className="font-medium mt-1">{attainmentData?.courseDetails.semester}</div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-md p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-xs text-primary/70 font-medium">Faculty</div>
                        <div className="font-medium mt-1">{attainmentData?.courseDetails.faculty}</div>
                      </div>
                      <div className="bg-white dark:bg-slate-800 rounded-md p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-xs text-primary/70 font-medium">Academic Year</div>
                        <div className="font-medium mt-1">{attainmentData?.courseDetails.academicYear}</div>
                      </div>
                    </div>

                    {/* Course Outcomes */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 text-primary/90 border-l-4 border-primary pl-2">
                        Course Outcomes
                      </h3>
                      <div className="bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <table className="w-full border-collapse">
                          <tbody>
                            {attainmentData?.courseOutcomes.map((co: any, index: number) => (
                              <tr key={co.id} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                                <td className="p-3 border-b font-medium">{co.id}:</td>
                                <td className="p-3 border-b">{co.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* CO Attainment */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                      <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold mb-3 text-primary/90 border-l-4 border-primary pl-2">
                          CO Attainment
                        </h3>
                        <div className="bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="p-2 text-left border-b w-[15%]">Course Outcome</th>
                                <th className="p-2 text-center border-b w-[12%]">CIE/IA</th>
                                <th className="p-2 text-center border-b w-[10%]">Level</th>
                                <th className="p-2 text-center border-b w-[12%]">UE/SEE</th>
                                <th className="p-2 text-center border-b w-[10%]">Level</th>
                                <th className="p-2 text-center border-b w-[10%]">CES</th>
                                <th className="p-2 text-center border-b w-[12%]">Attainment</th>
                              </tr>
                            </thead>
                            <tbody>
                              {attainmentData?.coAttainment.map((co: any, index: number) => (
                                <tr key={co.co} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                                  <td className="p-2 border-b font-medium">{co.co}</td>
                                  <td className="p-2 border-b text-center">{co.cie}</td>
                                  <td className="p-2 border-b text-center">{co.cieLevel}</td>
                                  <td className="p-2 border-b text-center">{co.ue}</td>
                                  <td className="p-2 border-b text-center">{co.ueLevel}</td>
                                  <td className="p-2 border-b text-center">{co.ces}</td>
                                  <td className="p-2 border-b text-center font-medium">{co.attainment}</td>
                                </tr>
                              ))}
                              <tr className="bg-muted/30">
                                <td className="p-3 border-b font-medium">Average Grade</td>
                                <td className="p-3 border-b text-center" colSpan={6}>
                                  {attainmentData?.coAttainment[0].cieLevel}
                                </td>
                              </tr>
                              <tr className="bg-muted/30">
                                <td className="p-3 border-b font-medium">Average CO Attainment is</td>
                                <td className="p-3 border-b text-center" colSpan={6}>
                                  {attainmentData?.coAttainment[0].attainment}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Attainment Chart</h3>
                        <div className="bg-card rounded-md border shadow-sm p-4 h-64">
                          <Bar data={chartData} options={chartOptions} />
                        </div>
                      </div>
                    </div>

                    {/* Attainment Level and Weightage */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-primary/90 border-l-4 border-primary pl-2">
                          Attainment Level
                        </h3>
                        <div className="bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="p-3 text-left border-b">%</th>
                                <th className="p-3 text-left border-b"></th>
                                <th className="p-3 text-left border-b">Target</th>
                                <th className="p-3 text-left border-b">Level</th>
                              </tr>
                            </thead>
                            <tbody>
                              {attainmentData?.attainmentLevels.criteria.map((criterion: any, index: number) => (
                                <tr key={criterion.level} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                                  <td className="p-3 border-b">{criterion.percentage}.00</td>
                                  <td className="p-3 border-b">of the students scored</td>
                                  <td className="p-3 border-b">{attainmentData.courseDetails.targetValue}.00 marks</td>
                                  <td className="p-3 border-b">{criterion.level}.00</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-primary/90 border-l-4 border-primary pl-2">
                          Weightage
                        </h3>
                        <div className="bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                          <table className="w-full border-collapse">
                            <tbody>
                              {Object.entries(attainmentData?.attainmentLevels.weightage || {}).map(
                                ([key, value], index) => (
                                  <tr key={key} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                                    <td className="p-3 border-b font-medium">{key}</td>
                                    <td className="p-3 border-b">{value}.00</td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-primary/90 border-l-4 border-primary pl-2">
                          Course End Survey
                        </h3>
                        <div className="bg-white dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                          <table className="w-full border-collapse">
                            <tbody>
                              <tr className="bg-muted/20">
                                <td className="p-3 border-b font-medium">No. of Questions</td>
                                <td className="p-3 border-b">{attainmentData?.courseEndSurvey.questions}</td>
                              </tr>
                              <tr>
                                <td className="p-3 border-b font-medium">No. of Students Responded</td>
                                <td className="p-3 border-b">{attainmentData?.courseEndSurvey.studentsResponded}.00</td>
                              </tr>
                              <tr className="bg-muted/20">
                                <td className="p-3 border-b font-medium">No. of Responses</td>
                                <td className="p-3 border-b">{attainmentData?.courseEndSurvey.responses}.00</td>
                              </tr>
                              <tr>
                                <td className="p-3 border-b font-medium">Total Response Value</td>
                                <td className="p-3 border-b">
                                  {attainmentData?.courseEndSurvey.totalResponseValue}.00
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Signature Fields */}
                    <div className="grid grid-cols-3 gap-4 mt-8">
                      <div className="text-center bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="font-semibold text-primary/80">COURSE COORDINATOR</p>
                        <div className="h-16 border-b border-dashed mt-8 border-primary/30"></div>
                      </div>
                      <div className="text-center bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="font-semibold text-primary/80">MODULE COORDINATOR</p>
                        <div className="h-16 border-b border-dashed mt-8 border-primary/30"></div>
                      </div>
                      <div className="text-center bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="font-semibold text-primary/80">HOD/Program Coordinator</p>
                        <div className="h-16 border-b border-dashed mt-8 border-primary/30"></div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="detailed" className="m-0">
                  <div className="p-6 dark:bg-slate-900/50">
                    <h3 className="text-lg font-semibold mb-4 dark:text-white">Detailed Marks Sheet</h3>
                    <div className="bg-card dark:bg-slate-800/50 rounded-md border dark:border-slate-700 p-4 shadow-sm">
                      <DynamicAttainmentTable
                        numIAs={attainmentConfig.numIAs}
                        numAssignments={attainmentConfig.numAssignments}
                        numQuizzes={attainmentConfig.numQuizzes}
                        courseCode={attainmentData?.courseDetails.code || ""}
                        courseName={attainmentData?.courseDetails.name || ""}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="co" className="m-0">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">CO Attainment Details</h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                      <div className="lg:col-span-2">
                        <div className="bg-card rounded-md border shadow-sm overflow-hidden">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="p-2 text-left border-b w-[15%]">Course Outcome</th>
                                <th className="p-2 text-center border-b w-[12%]">CIE/IA</th>
                                <th className="p-2 text-center border-b w-[12%]">Level</th>
                                <th className="p-2 text-center border-b w-[12%]">UE/SEE</th>
                                <th className="p-2 text-center border-b w-[12%]">Level</th>
                                <th className="p-2 text-center border-b w-[12%]">CES</th>
                                <th className="p-2 text-center border-b w-[12%]">Attainment</th>
                              </tr>
                            </thead>
                            <tbody>
                              {attainmentData?.coAttainment.map((co: any, index: number) => (
                                <tr key={co.co} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                                  <td className="p-2 border-b font-medium">{co.co}</td>
                                  <td className="p-2 border-b text-center">
                                    <Input
                                      type="number"
                                      value={co.cie}
                                      onChange={(e) => {
                                        // Update the value in state
                                        const newAttainmentData = { ...attainmentData }
                                        newAttainmentData.coAttainment[index].cie = Number(e.target.value)
                                        setAttainmentData(newAttainmentData)
                                      }}
                                      className="w-20 h-8 text-center"
                                      step="0.01"
                                    />
                                  </td>
                                  <td className="p-2 border-b text-center">
                                    <Input
                                      type="number"
                                      value={co.cieLevel}
                                      onChange={(e) => {
                                        const newAttainmentData = { ...attainmentData }
                                        newAttainmentData.coAttainment[index].cieLevel = Number(e.target.value)
                                        setAttainmentData(newAttainmentData)
                                      }}
                                      className="w-20 h-8 text-center"
                                      min="0"
                                      max="3"
                                      step="0.01"
                                    />
                                  </td>
                                  <td className="p-2 border-b text-center">
                                    <Input
                                      type="number"
                                      value={co.ue}
                                      onChange={(e) => {
                                        const newAttainmentData = { ...attainmentData }
                                        newAttainmentData.coAttainment[index].ue = Number(e.target.value)
                                        setAttainmentData(newAttainmentData)
                                      }}
                                      className="w-20 h-8 text-center"
                                      step="0.01"
                                    />
                                  </td>
                                  <td className="p-2 border-b text-center">
                                    <Input
                                      type="number"
                                      value={co.ueLevel}
                                      onChange={(e) => {
                                        const newAttainmentData = { ...attainmentData }
                                        newAttainmentData.coAttainment[index].ueLevel = Number(e.target.value)
                                        setAttainmentData(newAttainmentData)
                                      }}
                                      className="w-20 h-8 text-center"
                                      min="0"
                                      max="3"
                                      step="0.01"
                                    />
                                  </td>
                                  <td className="p-2 border-b text-center">
                                    <Input
                                      type="number"
                                      value={co.ces}
                                      onChange={(e) => {
                                        const newAttainmentData = { ...attainmentData }
                                        newAttainmentData.coAttainment[index].ces = Number(e.target.value)
                                        setAttainmentData(newAttainmentData)
                                      }}
                                      className="w-20 h-8 text-center"
                                      min="0"
                                      max="3"
                                      step="0.01"
                                    />
                                  </td>
                                  <td className="p-2 border-b text-center font-medium">
                                    <Input
                                      type="number"
                                      value={co.attainment}
                                      onChange={(e) => {
                                        const newAttainmentData = { ...attainmentData }
                                        newAttainmentData.coAttainment[index].attainment = Number(e.target.value)
                                        setAttainmentData(newAttainmentData)
                                      }}
                                      className="w-20 h-8 text-center"
                                      min="0"
                                      max="3"
                                      step="0.01"
                                    />
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-muted/30">
                                <td className="p-3 border-b font-medium">Average Grade</td>
                                <td className="p-3 border-b text-center" colSpan={6}>
                                  {attainmentData?.coAttainment[0].cieLevel}
                                </td>
                              </tr>
                              <tr className="bg-muted/30">
                                <td className="p-3 border-b font-medium">Average CO Attainment is</td>
                                <td className="p-3 border-b text-center" colSpan={6}>
                                  {attainmentData?.coAttainment[0].attainment}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div>
                        <div className="bg-card rounded-md border shadow-sm p-4 h-64">
                          <Bar data={chartData} options={chartOptions} />
                        </div>

                        <div className="mt-6">
                          <h4 className="font-medium mb-3">Attainment Formula Configuration</h4>
                          <div className="bg-card border rounded-md p-4 shadow-sm">
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="space-y-2">
                                <Label htmlFor="cieWeight" className="text-sm font-medium">
                                  CIE Weight
                                </Label>
                                <Input
                                  id="cieWeight"
                                  type="number"
                                  value={cieWeight}
                                  onChange={(e) => setCieWeight(Number(e.target.value))}
                                  className="text-center"
                                  step="0.1"
                                  min="0"
                                  max="1"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="ueWeight" className="text-sm font-medium">
                                  UE Weight
                                </Label>
                                <Input
                                  id="ueWeight"
                                  type="number"
                                  value={ueWeight}
                                  onChange={(e) => setUeWeight(Number(e.target.value))}
                                  className="text-center"
                                  step="0.1"
                                  min="0"
                                  max="1"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="cesWeight" className="text-sm font-medium">
                                  CES Weight
                                </Label>
                                <Input
                                  id="cesWeight"
                                  type="number"
                                  value={cesWeight}
                                  onChange={(e) => setCesWeight(Number(e.target.value))}
                                  className="text-center"
                                  step="0.1"
                                  min="0"
                                  max="1"
                                />
                              </div>
                            </div>

                            <div className="bg-muted/20 p-3 rounded-md mb-3">
                              <p className="text-center font-medium">
                                Attainment = (CIE × {cieWeight}) + (UE × {ueWeight}) + (CES × {cesWeight})
                              </p>
                            </div>

                            <div
                              className={`text-center p-2 rounded-md ${Math.abs(cieWeight + ueWeight + cesWeight - 1.0) < 0.01 ? "bg-green-100 dark:bg-green-900/20" : "bg-amber-100 dark:bg-amber-900/20"}`}
                            >
                              <div className="flex items-center justify-center gap-2">
                                <span className="font-medium">
                                  Total: {(cieWeight + ueWeight + cesWeight).toFixed(1)}
                                </span>
                                {Math.abs(cieWeight + ueWeight + cesWeight - 1.0) < 0.01 ? (
                                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                                ) : (
                                  <span className="text-amber-600 dark:text-amber-400">(should equal 1.0)</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button
                          className="mt-4 w-full"
                          onClick={() => {
                            // Recalculate attainment based on formula
                            const newAttainmentData = { ...attainmentData }
                            newAttainmentData.coAttainment.forEach((co, index) => {
                              co.attainment = Number(
                                (co.cieLevel * cieWeight + co.ueLevel * ueWeight + co.ces * cesWeight).toFixed(2),
                              )
                            })
                            setAttainmentData(newAttainmentData)

                            toast({
                              title: "Attainment recalculated",
                              description: "CO attainment values have been recalculated based on the formula.",
                            })
                          }}
                        >
                          Recalculate Attainment
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mapping" className="m-0">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">CO-PO Mapping Matrix</h3>

                    <div className="flex justify-between items-center mb-4">
                      <p className="text-sm text-muted-foreground">
                        Map each Course Outcome to Program Outcomes with appropriate correlation levels: 0 (None), 1
                        (Low), 2 (Medium), 3 (High)
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "CSV Exported",
                              description: "CO-PO mapping data has been exported as CSV.",
                            })
                          }}
                        >
                          Export CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "CSV Imported",
                              description: "CO-PO mapping data has been imported successfully.",
                            })
                          }}
                        >
                          Import CSV
                        </Button>
                      </div>
                    </div>

                    <div className="bg-card rounded-md border shadow-sm overflow-x-auto">
                      <table className="w-full border-collapse" style={{ minWidth: "800px" }}>
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="p-2 text-left border-b">CO / PO</th>
                            {Array.from({ length: 12 }, (_, i) => (
                              <th key={`po-${i + 1}`} className="p-2 text-center border-b">
                                PO{i + 1}
                              </th>
                            ))}
                            <th className="p-2 text-center border-b">PSO1</th>
                            <th className="p-2 text-center border-b">PSO2</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attainmentData?.courseOutcomes.map((co: any, index: number) => (
                            <tr key={co.id} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                              <td className="p-2 border-b font-medium">{co.id}</td>
                              {Array.from({ length: 12 }, (_, i) => {
                                // Get mapping value from PO attainment data if available
                                const mappingValue = attainmentData?.poAttainment?.[co.id]?.[`PO${i + 1}`] || 0
                                return (
                                  <td key={`${co.id}-po${i + 1}`} className="p-2 border-b text-center">
                                    <Select
                                      value={String(mappingValue)}
                                      onValueChange={(value) => {
                                        const newAttainmentData = { ...attainmentData }
                                        if (!newAttainmentData.poAttainment[co.id]) {
                                          newAttainmentData.poAttainment[co.id] = {}
                                        }
                                        newAttainmentData.poAttainment[co.id][`PO${i + 1}`] = Number(value)
                                        setAttainmentData(newAttainmentData)

                                        toast({
                                          title: "Mapping updated",
                                          description: `${co.id} to PO${i + 1} mapping set to ${value}`,
                                        })
                                      }}
                                    >
                                      <SelectTrigger
                                        className={`w-12 h-8 ${
                                          mappingValue === 0
                                            ? "bg-white dark:bg-gray-950"
                                            : mappingValue === 1
                                              ? "bg-yellow-100 dark:bg-yellow-900/30"
                                              : mappingValue === 2
                                                ? "bg-blue-100 dark:bg-blue-900/30"
                                                : "bg-green-100 dark:bg-green-900/30"
                                        }`}
                                      >
                                        <SelectValue placeholder="0" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="0">0</SelectItem>
                                        <SelectItem value="1">1</SelectItem>
                                        <SelectItem value="2">2</SelectItem>
                                        <SelectItem value="3">3</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </td>
                                )
                              })}
                              {/* PSO1 */}
                              <td className="p-2 border-b text-center">
                                <Select
                                  value={String(attainmentData?.psoAttainment?.[co.id]?.PSO1 || 0)}
                                  onValueChange={(value) => {
                                    const newAttainmentData = { ...attainmentData }
                                    if (!newAttainmentData.psoAttainment[co.id]) {
                                      newAttainmentData.psoAttainment[co.id] = {}
                                    }
                                    newAttainmentData.psoAttainment[co.id].PSO1 = Number(value)
                                    setAttainmentData(newAttainmentData)

                                    toast({
                                      title: "Mapping updated",
                                      description: `${co.id} to PSO1 mapping set to ${value}`,
                                    })
                                  }}
                                >
                                  <SelectTrigger
                                    className={`w-12 h-8 ${
                                      (attainmentData?.psoAttainment?.[co.id]?.PSO1 || 0) === 0
                                        ? "bg-white dark:bg-gray-950"
                                        : (attainmentData?.psoAttainment?.[co.id]?.PSO1 || 0) === 1
                                          ? "bg-yellow-100 dark:bg-yellow-900/30"
                                          : (attainmentData?.psoAttainment?.[co.id]?.PSO1 || 0) === 2
                                            ? "bg-blue-100 dark:bg-blue-900/30"
                                            : "bg-green-100 dark:bg-green-900/30"
                                    }`}
                                  >
                                    <SelectValue placeholder="0" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">0</SelectItem>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                              {/* PSO2 */}
                              <td className="p-2 border-b text-center">
                                <Select
                                  value={String(attainmentData?.psoAttainment?.[co.id]?.PSO2 || 0)}
                                  onValueChange={(value) => {
                                    const newAttainmentData = { ...attainmentData }
                                    if (!newAttainmentData.psoAttainment[co.id]) {
                                      newAttainmentData.psoAttainment[co.id] = {}
                                    }
                                    newAttainmentData.psoAttainment[co.id].PSO2 = Number(value)
                                    setAttainmentData(newAttainmentData)

                                    toast({
                                      title: "Mapping updated",
                                      description: `${co.id} to PSO2 mapping set to ${value}`,
                                    })
                                  }}
                                >
                                  <SelectTrigger
                                    className={`w-12 h-8 ${
                                      (attainmentData?.psoAttainment?.[co.id]?.PSO2 || 0) === 0
                                        ? "bg-white dark:bg-gray-950"
                                        : (attainmentData?.psoAttainment?.[co.id]?.PSO2 || 0) === 1
                                          ? "bg-yellow-100 dark:bg-yellow-900/30"
                                          : (attainmentData?.psoAttainment?.[co.id]?.PSO2 || 0) === 2
                                            ? "bg-blue-100 dark:bg-blue-900/30"
                                            : "bg-green-100 dark:bg-green-900/30"
                                    }`}
                                  >
                                    <SelectValue placeholder="0" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="0">0</SelectItem>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                  </SelectContent>
                                </Select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Mapping Legend</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 border"></div>
                          <span className="text-sm">0 - None</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/30 border"></div>
                          <span className="text-sm">1 - Low</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 border"></div>
                          <span className="text-sm">2 - Medium</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 border"></div>
                          <span className="text-sm">3 - High</span>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <Button
                          onClick={() => {
                            toast({
                              title: "Mapping saved",
                              description: "CO-PO mapping has been saved successfully.",
                              variant: "success",
                            })
                          }}
                        >
                          Save Mapping
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="labels" className="m-0">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Course, Program, and Program Specific Outcomes</h3>

                    <Tabs defaultValue="co" className="w-full">
                      <TabsList className="mb-4">
                        <TabsTrigger value="co">Course Outcomes</TabsTrigger>
                        <TabsTrigger value="po">Program Outcomes</TabsTrigger>
                        <TabsTrigger value="pso">Program Specific Outcomes</TabsTrigger>
                      </TabsList>

                      <TabsContent value="co" className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Course Outcomes (COs)</h4>
                          <Button variant="outline" size="sm" onClick={handleAddCO}>
                            Add Course Outcome
                          </Button>
                        </div>

                        <div className="bg-card rounded-md border shadow-sm">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="p-3 text-left border-b">Code</th>
                                <th className="p-3 text-left border-b">Description</th>
                                <th className="p-3 text-center border-b">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mockCourseOutcomes.map((co, index) => (
                                <tr key={co.id} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                                  <td className="p-3 border-b">
                                    {editingCO === `${co.id}-code` ? (
                                      <div className="flex items-center gap-2">
                                        <Input
                                          value={tempEditValue}
                                          onChange={(e) => setTempEditValue(e.target.value)}
                                          className="w-24 h-8"
                                          autoFocus
                                        />
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleSaveEditCO(co.id, "code")}
                                          className="h-8 w-8"
                                        >
                                          <Check className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={cancelEdit} className="h-8 w-8">
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <span>{co.code}</span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => startEditingCO(co.id, "code")}
                                          className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:opacity-100"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-3 border-b">
                                    {editingCO === `${co.id}-description` ? (
                                      <div className="flex items-center gap-2">
                                        <Input
                                          value={tempEditValue}
                                          onChange={(e) => setTempEditValue(e.target.value)}
                                          className="w-full h-8"
                                          autoFocus
                                        />
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleSaveEditCO(co.id, "description")}
                                          className="h-8 w-8"
                                        >
                                          <Check className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={cancelEdit} className="h-8 w-8">
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <span>{co.description}</span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => startEditingCO(co.id, "description")}
                                          className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:opacity-100"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-3 border-b text-center">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-500 hover:text-red-600"
                                      onClick={() => confirmDeleteCO(co.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </TabsContent>

                      <TabsContent value="po" className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Program Outcomes (POs)</h4>
                          <Button variant="outline" size="sm" onClick={handleAddPO}>
                            Add Program Outcome
                          </Button>
                        </div>

                        <div className="bg-card rounded-md border shadow-sm">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="p-3 text-left border-b">Code</th>
                                <th className="p-3 text-left border-b">Description</th>
                                <th className="p-3 text-center border-b">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {programOutcomes.map((po: any, index: number) => (
                                <tr key={po.id} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                                  <td className="p-3 border-b">
                                    {editingPO === `${po.id}-code` ? (
                                      <div className="flex items-center gap-2">
                                        <Input
                                          value={tempEditValue}
                                          onChange={(e) => setTempEditValue(e.target.value)}
                                          className="w-24 h-8"
                                          autoFocus
                                        />
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            saveEditPO(po.id, "code")
                                            toast({
                                              title: "Updated",
                                              description: "Program Outcome code updated successfully.",
                                            })
                                          }}
                                          className="h-8 w-8"
                                        >
                                          <Check className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={cancelEdit} className="h-8 w-8">
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <span>{po.code}</span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => startEditingPO(po.id, "code")}
                                          className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:opacity-100"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-3 border-b">
                                    {editingPO === `${po.id}-description` ? (
                                      <div className="flex items-center gap-2">
                                        <Input
                                          value={tempEditValue}
                                          onChange={(e) => setTempEditValue(e.target.value)}
                                          className="w-full h-8"
                                          autoFocus
                                        />
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            saveEditPO(po.id, "description")
                                            toast({
                                              title: "Updated",
                                              description: "Program Outcome description updated successfully.",
                                            })
                                          }}
                                          className="h-8 w-8"
                                        >
                                          <Check className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={cancelEdit} className="h-8 w-8">
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <span>{po.description}</span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => startEditingPO(po.id, "description")}
                                          className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:opacity-100"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-3 border-b text-center">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-500 hover:text-red-600"
                                      onClick={() => confirmDeletePO(po.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </TabsContent>

                      <TabsContent value="pso" className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">Program Specific Outcomes (PSOs)</h4>
                          <Button variant="outline" size="sm" onClick={handleAddPSO}>
                            Add Program Specific Outcome
                          </Button>
                        </div>

                        <div className="bg-card rounded-md border shadow-sm">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="p-3 text-left border-b">Code</th>
                                <th className="p-3 text-left border-b">Description</th>
                                <th className="p-3 text-center border-b">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {programSpecificOutcomes.map((pso: any, index: number) => (
                                <tr key={pso.id} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                                  <td className="p-3 border-b">
                                    {editingPSO === `${pso.id}-code` ? (
                                      <div className="flex items-center gap-2">
                                        <Input
                                          value={tempEditValue}
                                          onChange={(e) => setTempEditValue(e.target.value)}
                                          className="w-24 h-8"
                                          autoFocus
                                        />
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            saveEditPSO(pso.id, "code")
                                            toast({
                                              title: "Updated",
                                              description: "Program Specific Outcome code updated successfully.",
                                            })
                                          }}
                                          className="h-8 w-8"
                                        >
                                          <Check className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={cancelEdit} className="h-8 w-8">
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <span>{pso.code}</span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => startEditingPSO(pso.id, "code")}
                                          className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:opacity-100"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-3 border-b">
                                    {editingPSO === `${pso.id}-description` ? (
                                      <div className="flex items-center gap-2">
                                        <Input
                                          value={tempEditValue}
                                          onChange={(e) => setTempEditValue(e.target.value)}
                                          className="w-full h-8"
                                          autoFocus
                                        />
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            saveEditPSO(pso.id, "description")
                                            toast({
                                              title: "Updated",
                                              description: "Program Specific Outcome description updated successfully.",
                                            })
                                          }}
                                          className="h-8 w-8"
                                        >
                                          <Check className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={cancelEdit} className="h-8 w-8">
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <span>{pso.description}</span>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => startEditingPSO(pso.id, "description")}
                                          className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:opacity-100"
                                        >
                                          <Edit className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-3 border-b text-center">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-500 hover:text-red-600"
                                      onClick={() => confirmDeletePSO(pso.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAttainmentSheet(false)}>
              Back to Configuration
            </Button>
            <Button variant="outline" onClick={exportAsPDF}>
              Export as PDF
            </Button>
            <Button onClick={printReport}>Print Report</Button>
          </div>
        </div>
      )}
      {/* Add Course Outcome Dialog */}
      <Dialog open={showAddCODialog} onOpenChange={setShowPODialog}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle>Add New Course Outcome</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newCOCode">Code</Label>
              <Input
                id="newCOCode"
                value={newOutcomeCode}
                onChange={(e) => setNewOutcomeCode(e.target.value)}
                placeholder="CO1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newCODescription">Description</Label>
              <Input
                id="newCODescription"
                value={newOutcomeDescription}
                onChange={(e) => setNewOutcomeDescription(e.target.value)}
                placeholder="Enter course outcome description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPODialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCOSubmit}>Add Course Outcome</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Program Outcome Dialog */}
      <Dialog open={showAddPODialog} onOpenChange={setShowAddPODialog}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle>Add New Program Outcome</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPOCode">Code</Label>
              <Input
                id="newPOCode"
                value={newOutcomeCode}
                onChange={(e) => setNewOutcomeCode(e.target.value)}
                placeholder="PO1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPODescription">Description</Label>
              <Input
                id="newPODescription"
                value={newOutcomeDescription}
                onChange={(e) => setNewOutcomeDescription(e.target.value)}
                placeholder="Enter program outcome description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPODialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPOSubmit}>Add Program Outcome</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Program Specific Outcome Dialog */}
      <Dialog open={showAddPSODialog} onOpenChange={setShowAddPSODialog}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle>Add New Program Specific Outcome</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPSOCode">Code</Label>
              <Input
                id="newPSOCode"
                value={newOutcomeCode}
                onChange={(e) => setNewOutcomeCode(e.target.value)}
                placeholder="PSO1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPSODescription">Description</Label>
              <Input
                id="newPSODescription"
                value={newOutcomeDescription}
                onChange={(e) => setNewOutcomeDescription(e.target.value)}
                placeholder="Enter program specific outcome description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPSODialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPSOSubmit}>Add Program Specific Outcome</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Course Outcome Dialog */}
      <Dialog open={showDeleteCODialog} onOpenChange={setShowDeleteCODialog}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle>Delete Course Outcome</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this course outcome? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteCODialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeleteCO} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Program Outcome Dialog */}
      <Dialog open={showDeletePODialog} onOpenChange={setShowDeletePODialog}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle>Delete Program Outcome</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this program outcome? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeletePODialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeletePO} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Program Specific Outcome Dialog */}
      <Dialog open={showDeletePSODialog} onOpenChange={setShowDeletePSODialog}>
        <DialogContent className="dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle>Delete Program Specific Outcome</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this program specific outcome? This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeletePSODialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeletePSO} className="bg-red-500 hover:bg-red-600 text-white">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
