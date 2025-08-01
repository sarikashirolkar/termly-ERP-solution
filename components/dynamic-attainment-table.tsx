"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, FileUp, Plus, Minus, Settings, Save } from "lucide-react"
import { AttainmentTableCell } from "./attainment-table-cell"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface DynamicAttainmentTableProps {
  numIAs: number
  numAssignments: number
  numQuizzes: number
  courseCode: string
  courseName: string
}

// Define types for table structure
interface TableSection {
  id: string
  title: string
  color: string
  columns: TableColumn[]
}

interface TableColumn {
  id: string
  title: string
  subColumns?: TableSubColumn[]
}

interface TableSubColumn {
  id: string
  title: string
  maxMarks: string
  targetMaxMarks: string
  co: string
}

export function DynamicAttainmentTable({
  numIAs = 3,
  numAssignments = 2,
  numQuizzes = 2,
  courseCode = "21EC63",
  courseName = "VLSI Design & Testing",
}: DynamicAttainmentTableProps) {
  const [tableData, setTableData] = useState<string[][]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null)
  const [showStudentDetails, setShowStudentDetails] = useState(false)
  const [showTableSettings, setShowTableSettings] = useState(false)
  const [studentData, setStudentData] = useState<Array<{ usn: string; name: string; marks: string[] }>>([])

  // State for table structure
  const [tableSections, setTableSections] = useState<TableSection[]>([])
  const [maxMarksData, setMaxMarksData] = useState<{ [key: string]: string }>({})
  const [targetMaxMarksData, setTargetMaxMarksData] = useState<{ [key: string]: string }>({})
  const [coData, setCoData] = useState<{ [key: string]: string }>({})

  const tableRef = useRef<HTMLTableElement>(null)
  const { toast } = useToast()

  // Initialize table structure
  useEffect(() => {
    initializeTableStructure()
    initializeStudentData()
  }, [])

  const initializeTableStructure = () => {
    const sections: TableSection[] = [
      {
        id: "internal1",
        title: "I INTERNALS",
        color: "orange",
        columns: [
          {
            id: "internal1-q1",
            title: "1",
            subColumns: [
              { id: "internal1-q1-a", title: "a", maxMarks: "10", targetMaxMarks: "6.00", co: "CO1" },
              { id: "internal1-q1-b", title: "b", maxMarks: "5", targetMaxMarks: "3.00", co: "CO1" },
              { id: "internal1-q1-c", title: "c", maxMarks: "5", targetMaxMarks: "3.00", co: "CO1" },
            ],
          },
          {
            id: "internal1-q2",
            title: "2",
            subColumns: [
              { id: "internal1-q2-a", title: "a", maxMarks: "10", targetMaxMarks: "6.00", co: "CO1" },
              { id: "internal1-q2-b", title: "b", maxMarks: "5", targetMaxMarks: "3.00", co: "CO1" },
              { id: "internal1-q2-c", title: "c", maxMarks: "5", targetMaxMarks: "3.00", co: "CO1" },
            ],
          },
        ],
      },
      {
        id: "internal2",
        title: "II INTERNALS",
        color: "blue",
        columns: [
          {
            id: "internal2-q1",
            title: "1",
            subColumns: [
              { id: "internal2-q1-a", title: "a", maxMarks: "7", targetMaxMarks: "4.20", co: "CO2" },
              { id: "internal2-q1-b", title: "b", maxMarks: "6", targetMaxMarks: "3.60", co: "CO2" },
              { id: "internal2-q1-c", title: "c", maxMarks: "4", targetMaxMarks: "2.40", co: "CO2" },
              { id: "internal2-q1-d", title: "d", maxMarks: "3", targetMaxMarks: "1.80", co: "CO2" },
            ],
          },
          {
            id: "internal2-q2",
            title: "2",
            subColumns: [
              { id: "internal2-q2-a", title: "a", maxMarks: "7", targetMaxMarks: "4.20", co: "CO2" },
              { id: "internal2-q2-b", title: "b", maxMarks: "6", targetMaxMarks: "3.60", co: "CO2" },
              { id: "internal2-q2-c", title: "c", maxMarks: "4", targetMaxMarks: "2.40", co: "CO2" },
              { id: "internal2-q2-d", title: "d", maxMarks: "3", targetMaxMarks: "1.80", co: "CO1" },
            ],
          },
        ],
      },
      {
        id: "internal3",
        title: "III INTERNALS",
        color: "green",
        columns: [
          {
            id: "internal3-q1",
            title: "1",
            subColumns: [
              { id: "internal3-q1-a", title: "a", maxMarks: "7", targetMaxMarks: "4.20", co: "CO4" },
              { id: "internal3-q1-b", title: "b", maxMarks: "5", targetMaxMarks: "3.00", co: "CO5" },
              { id: "internal3-q1-c", title: "c", maxMarks: "4", targetMaxMarks: "2.40", co: "CO5" },
              { id: "internal3-q1-d", title: "d", maxMarks: "4", targetMaxMarks: "2.40", co: "CO4" },
            ],
          },
          {
            id: "internal3-q2",
            title: "2",
            subColumns: [
              { id: "internal3-q2-a", title: "a", maxMarks: "6", targetMaxMarks: "3.60", co: "CO4" },
              { id: "internal3-q2-b", title: "b", maxMarks: "5", targetMaxMarks: "3.00", co: "CO5" },
              { id: "internal3-q2-c", title: "c", maxMarks: "5", targetMaxMarks: "3.00", co: "CO5" },
              { id: "internal3-q2-d", title: "d", maxMarks: "4", targetMaxMarks: "2.40", co: "CO5" },
            ],
          },
        ],
      },
      {
        id: "iacomp2",
        title: "IA- comp 2",
        color: "yellow",
        columns: [
          {
            id: "assign1",
            title: "Assign 1",
            subColumns: [{ id: "assign1-main", title: "", maxMarks: "10", targetMaxMarks: "6.00", co: "CO1,2" }],
          },
          {
            id: "assign2",
            title: "Assign 2",
            subColumns: [{ id: "assign2-main", title: "", maxMarks: "10", targetMaxMarks: "6.00", co: "CO3,4,5" }],
          },
          {
            id: "quiz",
            title: "Quiz",
            subColumns: [{ id: "quiz-main", title: "", maxMarks: "20", targetMaxMarks: "12.00", co: "All COs" }],
          },
        ],
      },
      {
        id: "see",
        title: "SEE",
        color: "red",
        columns: [
          {
            id: "see-main",
            title: "",
            subColumns: [{ id: "see-main-col", title: "", maxMarks: "50", targetMaxMarks: "30.00", co: "" }],
          },
        ],
      },
    ]

    setTableSections(sections)

    // Initialize maxMarks and targetMaxMarks data
    const maxMarks: { [key: string]: string } = {}
    const targetMaxMarks: { [key: string]: string } = {}
    const cos: { [key: string]: string } = {}

    sections.forEach((section) => {
      section.columns.forEach((column) => {
        column.subColumns?.forEach((subColumn) => {
          maxMarks[subColumn.id] = subColumn.maxMarks
          targetMaxMarks[subColumn.id] = subColumn.targetMaxMarks
          cos[subColumn.id] = subColumn.co
        })
      })
    })

    setMaxMarksData(maxMarks)
    setTargetMaxMarksData(targetMaxMarks)
    setCoData(cos)
  }

  const initializeStudentData = () => {
    // Initialize student data
    const initialStudentData = [
      {
        usn: "1VA21EC001",
        name: "ADITYA RANJAN",
        marks: Array(50).fill(""),
      },
      {
        usn: "1VA21EC002",
        name: "AKASH BOLEGAON",
        marks: Array(50).fill(""),
      },
      {
        usn: "1VA21EC003",
        name: "AKASH NAIR A",
        marks: Array(50).fill(""),
      },
      {
        usn: "1VA21EC004",
        name: "AKASH SANGANNA HARSOORKER",
        marks: Array(50).fill(""),
      },
      {
        usn: "1VA21EC005",
        name: "AMAR MUTTAPPA KARADIGUDDA",
        marks: Array(50).fill(""),
      },
      {
        usn: "1VA21EC006",
        name: "AMBIKA",
        marks: Array(50).fill(""),
      },
      {
        usn: "1VA21EC007",
        name: "ANANYA L",
        marks: Array(50).fill(""),
      },
      {
        usn: "1VA21EC008",
        name: "ANIKA SHREYA PRASAD",
        marks: Array(50).fill(""),
      },
      {
        usn: "1VA21EC009",
        name: "ANKITHA R",
        marks: Array(50).fill(""),
      },
      {
        usn: "1VA21EC010",
        name: "BHARAT RAJ P",
        marks: Array(50).fill(""),
      },
      {
        usn: "1VA21EC011",
        name: "BHARATH N",
        marks: Array(50).fill(""),
      },
      {
        usn: "1VA21EC012",
        name: "BHARGAV S R",
        marks: Array(50).fill(""),
      },
      {
        usn: "1VA21EC013",
        name: "BHUMIKA JAGADESH",
        marks: Array(50).fill(""),
      },
      {
        usn: "1VA21EC014",
        name: "BHUVAN M H",
        marks: Array(50).fill(""),
      },
      {
        usn: "1VA21EC015",
        name: "BINDU SHREE R",
        marks: Array(50).fill(""),
      },
    ]

    setStudentData(initialStudentData)
    setIsLoading(false)
  }

  // Functions to modify table structure
  const addSection = () => {
    const newSectionId = `section-${Date.now()}`
    const newSection: TableSection = {
      id: newSectionId,
      title: "New Section",
      color: "gray",
      columns: [
        {
          id: `${newSectionId}-col1`,
          title: "New Column",
          subColumns: [
            {
              id: `${newSectionId}-col1-sub1`,
              title: "a",
              maxMarks: "10",
              targetMaxMarks: "6.00",
              co: "CO1",
            },
          ],
        },
      ],
    }

    setTableSections([...tableSections, newSection])

    // Update maxMarks and targetMaxMarks
    const newMaxMarks = { ...maxMarksData }
    const newTargetMaxMarks = { ...targetMaxMarksData }
    const newCos = { ...coData }

    newSection.columns.forEach((column) => {
      column.subColumns?.forEach((subColumn) => {
        newMaxMarks[subColumn.id] = subColumn.maxMarks
        newTargetMaxMarks[subColumn.id] = subColumn.targetMaxMarks
        newCos[subColumn.id] = subColumn.co
      })
    })

    setMaxMarksData(newMaxMarks)
    setTargetMaxMarksData(newTargetMaxMarks)
    setCoData(newCos)

    toast({
      title: "Section added",
      description: "A new section has been added to the table.",
    })
  }

  const removeSection = (sectionId: string) => {
    const updatedSections = tableSections.filter((section) => section.id !== sectionId)
    setTableSections(updatedSections)

    // Remove related maxMarks and targetMaxMarks
    const newMaxMarks = { ...maxMarksData }
    const newTargetMaxMarks = { ...targetMaxMarksData }
    const newCos = { ...coData }

    const sectionToRemove = tableSections.find((section) => section.id === sectionId)
    if (sectionToRemove) {
      sectionToRemove.columns.forEach((column) => {
        column.subColumns?.forEach((subColumn) => {
          delete newMaxMarks[subColumn.id]
          delete newTargetMaxMarks[subColumn.id]
          delete newCos[subColumn.id]
        })
      })
    }

    setMaxMarksData(newMaxMarks)
    setTargetMaxMarksData(newTargetMaxMarks)
    setCoData(newCos)

    toast({
      title: "Section removed",
      description: "The section has been removed from the table.",
    })
  }

  const addColumn = (sectionId: string) => {
    const updatedSections = tableSections.map((section) => {
      if (section.id === sectionId) {
        const newColumnId = `${sectionId}-col-${Date.now()}`
        const newColumn: TableColumn = {
          id: newColumnId,
          title: "New Column",
          subColumns: [
            {
              id: `${newColumnId}-sub1`,
              title: "a",
              maxMarks: "10",
              targetMaxMarks: "6.00",
              co: "CO1",
            },
          ],
        }

        // Update maxMarks and targetMaxMarks
        const newMaxMarks = { ...maxMarksData }
        const newTargetMaxMarks = { ...targetMaxMarksData }
        const newCos = { ...coData }

        newColumn.subColumns?.forEach((subColumn) => {
          newMaxMarks[subColumn.id] = subColumn.maxMarks
          newTargetMaxMarks[subColumn.id] = subColumn.targetMaxMarks
          newCos[subColumn.id] = subColumn.co
        })

        setMaxMarksData(newMaxMarks)
        setTargetMaxMarksData(newTargetMaxMarks)
        setCoData(newCos)

        return {
          ...section,
          columns: [...section.columns, newColumn],
        }
      }
      return section
    })

    setTableSections(updatedSections)

    toast({
      title: "Column added",
      description: "A new column has been added to the section.",
    })
  }

  const removeColumn = (sectionId: string, columnId: string) => {
    const updatedSections = tableSections.map((section) => {
      if (section.id === sectionId) {
        const updatedColumns = section.columns.filter((column) => column.id !== columnId)

        // Remove related maxMarks and targetMaxMarks
        const newMaxMarks = { ...maxMarksData }
        const newTargetMaxMarks = { ...targetMaxMarksData }
        const newCos = { ...coData }

        const columnToRemove = section.columns.find((column) => column.id === columnId)
        if (columnToRemove) {
          columnToRemove.subColumns?.forEach((subColumn) => {
            delete newMaxMarks[subColumn.id]
            delete newTargetMaxMarks[subColumn.id]
            delete newCos[subColumn.id]
          })
        }

        setMaxMarksData(newMaxMarks)
        setTargetMaxMarksData(newTargetMaxMarks)
        setCoData(newCos)

        return {
          ...section,
          columns: updatedColumns,
        }
      }
      return section
    })

    setTableSections(updatedSections)

    toast({
      title: "Column removed",
      description: "The column has been removed from the section.",
    })
  }

  const addSubColumn = (sectionId: string, columnId: string) => {
    const updatedSections = tableSections.map((section) => {
      if (section.id === sectionId) {
        const updatedColumns = section.columns.map((column) => {
          if (column.id === columnId) {
            const newSubColumnId = `${columnId}-sub-${Date.now()}`
            const newSubColumn: TableSubColumn = {
              id: newSubColumnId,
              title: String.fromCharCode(97 + (column.subColumns?.length || 0)), // a, b, c, ...
              maxMarks: "10",
              targetMaxMarks: "6.00",
              co: "CO1",
            }

            // Update maxMarks and targetMaxMarks
            const newMaxMarks = { ...maxMarksData }
            const newTargetMaxMarks = { ...targetMaxMarksData }
            const newCos = { ...coData }

            newMaxMarks[newSubColumnId] = newSubColumn.maxMarks
            newTargetMaxMarks[newSubColumnId] = newSubColumn.targetMaxMarks
            newCos[newSubColumnId] = newSubColumn.co

            setMaxMarksData(newMaxMarks)
            setTargetMaxMarksData(newTargetMaxMarks)
            setCoData(newCos)

            return {
              ...column,
              subColumns: [...(column.subColumns || []), newSubColumn],
            }
          }
          return column
        })

        return {
          ...section,
          columns: updatedColumns,
        }
      }
      return section
    })

    setTableSections(updatedSections)

    toast({
      title: "Sub-column added",
      description: "A new sub-column has been added to the column.",
    })
  }

  const removeSubColumn = (sectionId: string, columnId: string, subColumnId: string) => {
    const updatedSections = tableSections.map((section) => {
      if (section.id === sectionId) {
        const updatedColumns = section.columns.map((column) => {
          if (column.id === columnId) {
            const updatedSubColumns = column.subColumns?.filter((subColumn) => subColumn.id !== subColumnId)

            // Remove related maxMarks and targetMaxMarks
            const newMaxMarks = { ...maxMarksData }
            const newTargetMaxMarks = { ...targetMaxMarksData }
            const newCos = { ...coData }

            delete newMaxMarks[subColumnId]
            delete newTargetMaxMarks[subColumnId]
            delete newCos[subColumnId]

            setMaxMarksData(newMaxMarks)
            setTargetMaxMarksData(newTargetMaxMarks)
            setCoData(newCos)

            return {
              ...column,
              subColumns: updatedSubColumns,
            }
          }
          return column
        })

        return {
          ...section,
          columns: updatedColumns,
        }
      }
      return section
    })

    setTableSections(updatedSections)

    toast({
      title: "Sub-column removed",
      description: "The sub-column has been removed from the column.",
    })
  }

  // Update section title
  const updateSectionTitle = (sectionId: string, newTitle: string) => {
    const updatedSections = tableSections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          title: newTitle,
        }
      }
      return section
    })

    setTableSections(updatedSections)
  }

  // Update column title
  const updateColumnTitle = (sectionId: string, columnId: string, newTitle: string) => {
    const updatedSections = tableSections.map((section) => {
      if (section.id === sectionId) {
        const updatedColumns = section.columns.map((column) => {
          if (column.id === columnId) {
            return {
              ...column,
              title: newTitle,
            }
          }
          return column
        })

        return {
          ...section,
          columns: updatedColumns,
        }
      }
      return section
    })

    setTableSections(updatedSections)
  }

  // Update sub-column title
  const updateSubColumnTitle = (sectionId: string, columnId: string, subColumnId: string, newTitle: string) => {
    const updatedSections = tableSections.map((section) => {
      if (section.id === sectionId) {
        const updatedColumns = section.columns.map((column) => {
          if (column.id === columnId) {
            const updatedSubColumns = column.subColumns?.map((subColumn) => {
              if (subColumn.id === subColumnId) {
                return {
                  ...subColumn,
                  title: newTitle,
                }
              }
              return subColumn
            })

            return {
              ...column,
              subColumns: updatedSubColumns,
            }
          }
          return column
        })

        return {
          ...section,
          columns: updatedColumns,
        }
      }
      return section
    })

    setTableSections(updatedSections)
  }

  // Update max marks
  const updateMaxMarks = (subColumnId: string, value: string) => {
    setMaxMarksData({
      ...maxMarksData,
      [subColumnId]: value,
    })
  }

  // Update target max marks
  const updateTargetMaxMarks = (subColumnId: string, value: string) => {
    setTargetMaxMarksData({
      ...targetMaxMarksData,
      [subColumnId]: value,
    })
  }

  // Update CO
  const updateCO = (subColumnId: string, value: string) => {
    setCoData({
      ...coData,
      [subColumnId]: value,
    })
  }

  // Handle cell value change
  const handleCellChange = (value: string, rowIndex: number, colIndex: number) => {
    // Create a deep copy of the studentData array
    const newStudentData = [...studentData]

    // Calculate the actual mark index (subtract 3 because first 3 columns are not marks)
    const markIndex = colIndex - 3

    // Update the marks array for the specific student
    if (markIndex >= 0 && markIndex < 50) {
      newStudentData[rowIndex].marks[markIndex] = value
      // Update the studentData state
      setStudentData(newStudentData)
    }
  }

  // Handle cell navigation
  const handleCellNavigate = (rowIndex: number, colIndex: number, direction: "up" | "down" | "left" | "right") => {
    let newRow = rowIndex
    let newCol = colIndex

    // Calculate total columns based on table structure
    let totalColumns = 3 // Start with the fixed columns (S.No, USN, Name)
    tableSections.forEach((section) => {
      section.columns.forEach((column) => {
        totalColumns += column.subColumns?.length || 0
      })
    })

    switch (direction) {
      case "up":
        newRow = Math.max(0, rowIndex - 1)
        break
      case "down":
        newRow = Math.min(studentData.length - 1, rowIndex + 1)
        break
      case "left":
        newCol = Math.max(3, colIndex - 1) // Don't go left of the first editable column
        break
      case "right":
        newCol = Math.min(totalColumns - 1, colIndex + 1) // Don't go right of the last column
        break
    }

    // Set the active cell for focus
    setActiveCell({ row: newRow, col: newCol })

    // Find and click the cell to activate editing
    setTimeout(() => {
      const cellElement = document.querySelector(`td[data-row="${newRow}"][data-col="${newCol}"] div`)
      if (cellElement) {
        ;(cellElement as HTMLElement).click()
      }
    }, 10)
  }

  // Set active cell and focus it
  useEffect(() => {
    if (activeCell) {
      const activeElement = document.querySelector(`td[data-row="${activeCell.row}"][data-col="${activeCell.col}"]`)
      if (activeElement) {
        ;(activeElement as HTMLElement).click()
      }
    }
  }, [activeCell])

  // Export table data to CSV
  const exportToCSV = () => {
    // Create header rows with proper alignment
    const headerRows: string[][] = []

    // First row: Section titles with proper column spans
    const sectionRow: string[] = ["", "", ""]
    tableSections.forEach((section) => {
      const colSpan = section.columns.reduce((total, column) => total + (column.subColumns?.length || 0), 0)
      // Add the section title in the first cell of its span
      sectionRow.push(section.title)
      // Fill the rest of the span with empty cells
      for (let i = 1; i < colSpan; i++) {
        sectionRow.push("")
      }
    })
    headerRows.push(sectionRow)

    // Second row: Question numbers with proper alignment
    const questionRow: string[] = ["", "", "Question"]
    tableSections.forEach((section) => {
      section.columns.forEach((column) => {
        const colSpan = column.subColumns?.length || 0
        // Add the question number in the first cell of its span
        questionRow.push(column.title)
        // Fill the rest of the span with empty cells
        for (let i = 1; i < colSpan; i++) {
          questionRow.push("")
        }
      })
    })
    headerRows.push(questionRow)

    // Third row: Sub-question labels
    const subQuestionRow: string[] = ["", "", "Sub Quest"]
    tableSections.forEach((section) => {
      section.columns.forEach((column) => {
        column.subColumns?.forEach((subColumn) => {
          subQuestionRow.push(subColumn.title)
        })
      })
    })
    headerRows.push(subQuestionRow)

    // Fourth row: Max marks
    const maxMarksRow: string[] = ["", "", "Max Marks"]
    tableSections.forEach((section) => {
      section.columns.forEach((column) => {
        column.subColumns?.forEach((subColumn) => {
          maxMarksRow.push(maxMarksData[subColumn.id] || "")
        })
      })
    })
    headerRows.push(maxMarksRow)

    // Fifth row: Target max marks
    const targetMaxMarksRow: string[] = ["", "", "Target Marks"]
    tableSections.forEach((section) => {
      section.columns.forEach((column) => {
        column.subColumns?.forEach((subColumn) => {
          targetMaxMarksRow.push(targetMaxMarksData[subColumn.id] || "")
        })
      })
    })
    headerRows.push(targetMaxMarksRow)

    // Sixth row: Course outcomes
    const coRow: string[] = ["", "", "Course Outcomes"]
    tableSections.forEach((section) => {
      section.columns.forEach((column) => {
        column.subColumns?.forEach((subColumn) => {
          coRow.push(coData[subColumn.id] || "")
        })
      })
    })
    headerRows.push(coRow)

    // Seventh row: Student data header
    const studentHeaderRow: string[] = ["S No", "USN", "Name"]
    // Add empty cells for all assessment columns to maintain alignment
    tableSections.forEach((section) => {
      section.columns.forEach((column) => {
        column.subColumns?.forEach(() => {
          studentHeaderRow.push("")
        })
      })
    })
    headerRows.push(studentHeaderRow)

    // Student data rows with proper alignment
    const dataRows: string[][] = studentData.map((student, index) => {
      // Start with student info
      const row: string[] = [(index + 1).toString(), student.usn, student.name]

      // Add marks data with proper alignment
      let markIndex = 0
      tableSections.forEach((section) => {
        section.columns.forEach((column) => {
          column.subColumns?.forEach(() => {
            // Add the mark or an empty string to maintain alignment
            row.push(student.marks[markIndex] || "")
            markIndex++
          })
        })
      })

      return row
    })

    // Combine all rows
    const allRows = [...headerRows, ...dataRows]

    // Convert to CSV with proper quoting to handle commas in data
    const csvContent = allRows
      .map((row) =>
        row
          .map((cell) => {
            // Quote cells that contain commas, quotes, or newlines
            if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
              // Escape quotes by doubling them
              return `"${cell.replace(/"/g, '""')}"`
            }
            return cell
          })
          .join(","),
      )
      .join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("hidden", "")
    a.setAttribute("href", url)
    a.setAttribute("download", `${courseCode}_attainment.csv`)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    toast({
      title: "Export successful",
      description: `Attainment data for ${courseCode} has been exported as CSV with proper formatting.`,
    })
  }

  // Import CSV file
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string

        // Parse CSV with proper handling of quoted fields
        const parseCSV = (csvText: string) => {
          const rows: string[][] = []
          let currentRow: string[] = []
          let currentCell = ""
          let insideQuotes = false

          for (let i = 0; i < csvText.length; i++) {
            const char = csvText[i]
            const nextChar = csvText[i + 1]

            if (char === '"') {
              if (insideQuotes && nextChar === '"') {
                // Double quotes inside quoted field
                currentCell += '"'
                i++ // Skip the next quote
              } else {
                // Toggle quote state
                insideQuotes = !insideQuotes
              }
            } else if (char === "," && !insideQuotes) {
              // End of cell
              currentRow.push(currentCell)
              currentCell = ""
            } else if ((char === "\r" || char === "\n") && !insideQuotes) {
              // End of row
              if (currentCell !== "" || currentRow.length > 0) {
                currentRow.push(currentCell)
                rows.push(currentRow)
                currentRow = []
                currentCell = ""
              }
              // Skip the \n if we just processed \r\n
              if (char === "\r" && nextChar === "\n") {
                i++
              }
            } else {
              // Regular character
              currentCell += char
            }
          }

          // Add the last cell and row if there's any data
          if (currentCell !== "" || currentRow.length > 0) {
            currentRow.push(currentCell)
            rows.push(currentRow)
          }

          return rows
        }

        const parsedData = parseCSV(text)

        // Process the parsed data
        if (parsedData.length >= 7) {
          // Ensure we have at least the header rows
          // Extract section information (row 0)
          const sectionInfo = parsedData[0]

          // Extract question information (row 1)
          const questionInfo = parsedData[1]

          // Extract sub-question information (row 2)
          const subQuestionInfo = parsedData[2]

          // Extract max marks (row 3)
          const maxMarksInfo = parsedData[3]

          // Extract target marks (row 4)
          const targetMarksInfo = parsedData[4]

          // Extract course outcomes (row 5)
          const courseOutcomesInfo = parsedData[5]

          // Process student data (rows 7+)
          const newStudentData = []
          for (let i = 7; i < parsedData.length; i++) {
            const row = parsedData[i]
            if (row.length >= 3) {
              // Ensure we have at least S.No, USN, and Name
              const studentMarks = row.slice(3).map((mark) => mark.trim())
              newStudentData.push({
                usn: row[1],
                name: row[2],
                marks: studentMarks,
              })
            }
          }

          // Update the student data state
          if (newStudentData.length > 0) {
            setStudentData(newStudentData)
          }

          // Reconstruct table structure from the CSV
          // This is a simplified approach - in a real implementation, you would need
          // to carefully map the CSV structure back to your table structure

          toast({
            title: "Import successful",
            description: `Imported ${newStudentData.length} student records successfully.`,
          })
        } else {
          toast({
            title: "Import failed",
            description: "The CSV file does not have the expected format.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error parsing CSV:", error)
        toast({
          title: "Import failed",
          description: "There was an error importing the CSV file.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  // Count total columns
  const getTotalSubColumns = (): number => {
    let total = 0
    tableSections.forEach((section) => {
      section.columns.forEach((column) => {
        total += column.subColumns?.length || 0
      })
    })
    return total
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p>Loading attainment data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Attainment Table</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowTableSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Table Settings
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" size="sm">
              <FileUp className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowStudentDetails(true)}>
            View Student Details
          </Button>
        </div>
      </div>

      {/* Table Settings Dialog */}
      <Dialog open={showTableSettings} onOpenChange={setShowTableSettings}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle>Table Structure Settings</DialogTitle>
            <DialogDescription>
              Customize the structure of your attainment table by adding or removing sections, columns, and sub-columns.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <Tabs defaultValue="structure" className="w-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="structure">Table Structure</TabsTrigger>
                <TabsTrigger value="values">Edit Values</TabsTrigger>
              </TabsList>

              <TabsContent value="structure" className="space-y-4 p-4">
                <div className="flex justify-end">
                  <Button onClick={addSection} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>

                {tableSections.map((section, sectionIndex) => (
                  <div key={section.id} className="border rounded-md p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full bg-${section.color}-500`}></div>
                        <div className="flex items-center gap-2">
                          <Input
                            value={section.title}
                            onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                            className="font-semibold"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => addColumn(section.id)} size="sm" variant="outline">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Column
                        </Button>
                        {tableSections.length > 1 && (
                          <Button onClick={() => removeSection(section.id)} size="sm" variant="destructive">
                            <Minus className="h-4 w-4 mr-1" />
                            Remove Section
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {section.columns.map((column) => (
                        <div key={column.id} className="border rounded-md p-3 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Input
                                value={column.title}
                                onChange={(e) => updateColumnTitle(section.id, column.id, e.target.value)}
                                className="font-medium"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Button onClick={() => addSubColumn(section.id, column.id)} size="sm" variant="outline">
                                <Plus className="h-3 w-3 mr-1" />
                                Add Sub-Column
                              </Button>
                              {section.columns.length > 1 && (
                                <Button
                                  onClick={() => removeColumn(section.id, column.id)}
                                  size="sm"
                                  variant="destructive"
                                >
                                  <Minus className="h-3 w-3 mr-1" />
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            {column.subColumns?.map((subColumn) => (
                              <div key={subColumn.id} className="flex items-center justify-between border-b pb-2">
                                <div className="flex items-center gap-2">
                                  <Input
                                    value={subColumn.title}
                                    onChange={(e) =>
                                      updateSubColumnTitle(section.id, column.id, subColumn.id, e.target.value)
                                    }
                                    className="w-16"
                                  />
                                </div>
                                {(column.subColumns?.length || 0) > 1 && (
                                  <Button
                                    onClick={() => removeSubColumn(section.id, column.id, subColumn.id)}
                                    size="sm"
                                    variant="ghost"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="values" className="space-y-4 p-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm dark:text-slate-200">
                    <thead>
                      <tr>
                        <th className="border p-2 bg-gray-50">Section</th>
                        <th className="border p-2 bg-gray-50">Column</th>
                        <th className="border p-2 bg-gray-50">Sub-Column</th>
                        <th className="border p-2 bg-gray-50">Max Marks</th>
                        <th className="border p-2 bg-gray-50">Target Max Marks</th>
                        <th className="border p-2 bg-gray-50">Course Outcome</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableSections.map((section) =>
                        section.columns.map((column) =>
                          column.subColumns?.map((subColumn) => (
                            <tr key={subColumn.id}>
                              <td className="border p-2">{section.title}</td>
                              <td className="border p-2">{column.title}</td>
                              <td className="border p-2">{subColumn.title}</td>
                              <td className="border p-2">
                                <Input
                                  value={maxMarksData[subColumn.id] || ""}
                                  onChange={(e) => updateMaxMarks(subColumn.id, e.target.value)}
                                  className="w-full"
                                />
                              </td>
                              <td className="border p-2">
                                <Input
                                  value={targetMaxMarksData[subColumn.id] || ""}
                                  onChange={(e) => updateTargetMaxMarks(subColumn.id, e.target.value)}
                                  className="w-full"
                                />
                              </td>
                              <td className="border p-2">
                                <Input
                                  value={coData[subColumn.id] || ""}
                                  onChange={(e) => updateCO(subColumn.id, e.target.value)}
                                  className="w-full"
                                />
                              </td>
                            </tr>
                          )),
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowTableSettings(false)}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Student Details Dialog */}
      <Dialog open={showStudentDetails} onOpenChange={setShowStudentDetails}>
        <DialogContent className="max-w-[95vw] max-h-[90vh] dark:bg-slate-900 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle>Student-wise Marks Details</DialogTitle>
            <DialogDescription>Detailed marks for each student across all assessments</DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto max-h-[calc(90vh-120px)]">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-white">
                <tr>
                  <th colSpan={4} className="border p-2 bg-gray-50">
                    Course Information
                  </th>
                  <th colSpan={4} className="border p-2 bg-gray-50"></th>
                </tr>
                <tr>
                  <th className="border p-2 bg-gray-50">Course Name</th>
                  <th className="border p-2">{courseName}</th>
                  <th className="border p-2 bg-gray-50">Course Code</th>
                  <th className="border p-2">{courseCode}</th>
                  <th className="border p-2 bg-gray-50">Semester</th>
                  <th className="border p-2">6</th>
                  <th className="border p-2 bg-gray-50">Faculty</th>
                  <th className="border p-2">Nayana K</th>
                  <th className="border p-2 bg-gray-50">Academic Year</th>
                  <th className="border p-2">2023-2024</th>
                </tr>
                <tr>
                  <th className="border p-2 bg-gray-50">Target value</th>
                  <th className="border p-2">60</th>
                  <th colSpan={8} className="border p-2"></th>
                </tr>
              </thead>
            </table>

            {/* Main Attainment Table */}
            <div className="mt-4">
              <table className="w-full border-collapse text-sm dark:text-slate-200">
                <colgroup>
                  <col className="w-10" />
                  <col className="w-28" />
                  <col className="w-48" />
                  {tableSections.map((section) =>
                    section.columns.map((column) =>
                      column.subColumns?.map((subColumn) => (
                        <col key={subColumn.id} className={`bg-${section.color}-50`} />
                      )),
                    ),
                  )}
                </colgroup>
                <thead>
                  {/* Section Headers */}
                  <tr>
                    <th className="border p-2" rowSpan={6}></th>
                    <th className="border p-2"></th>
                    <th className="border p-2"></th>
                    {tableSections.map((section) => {
                      const colSpan = section.columns.reduce(
                        (total, column) => total + (column.subColumns?.length || 0),
                        0,
                      )
                      let sectionHeaderClass = `border p-2 bg-${section.color}-100 dark:bg-${section.color}-900/50 text-center dark:border-slate-700 font-semibold`

                      if (section.id === "internal1") {
                        sectionHeaderClass = `border p-2 bg-${section.color}-100 dark:bg-[#8B3E2F]/20 dark:text-[#ff9d80] text-center dark:border-slate-700 font-semibold`
                      } else if (section.id === "internal2") {
                        sectionHeaderClass = `border p-2 bg-${section.color}-100 dark:bg-[#2a4798]/20 dark:text-[#a0b4ff] text-center dark:border-slate-700 font-semibold`
                      } else if (section.id === "internal3") {
                        sectionHeaderClass = `border p-2 bg-${section.color}-100 dark:bg-[#2a6e4d]/20 dark:text-[#8edbaf] text-center dark:border-slate-700 font-semibold`
                      } else if (section.id === "iacomp2") {
                        sectionHeaderClass = `border p-2 bg-${section.color}-100 dark:bg-[#8B7D2F]/20 dark:text-[#ffd980] text-center dark:border-slate-700 font-semibold`
                      } else if (section.id === "see") {
                        sectionHeaderClass = `border p-2 bg-${section.color}-100 dark:bg-[#8B2F2F]/20 dark:text-[#ff8080] text-center dark:border-slate-700 font-semibold`
                      }

                      return (
                        <th key={section.id} colSpan={colSpan} className={sectionHeaderClass}>
                          {section.title}
                        </th>
                      )
                    })}
                  </tr>

                  {/* Column Headers */}
                  <tr>
                    <th className="border p-2"></th>
                    <th className="border p-2">Question No.</th>
                    {tableSections.map((section) =>
                      section.columns.map((column) => {
                        const colSpan = column.subColumns?.length || 0
                        return (
                          <th
                            key={column.id}
                            colSpan={colSpan}
                            className={`border p-2 bg-${section.color}-50 dark:bg-${section.color}-900/40 text-center dark:border-slate-700 font-medium`}
                          >
                            {column.title}
                          </th>
                        )
                      }),
                    )}
                  </tr>

                  {/* Sub-Column Headers */}
                  <tr>
                    <th className="border p-2"></th>
                    <th className="border p-2">Sub Questions</th>
                    {tableSections.map((section) =>
                      section.columns.map((column) =>
                        column.subColumns?.map((subColumn) => (
                          <th
                            key={subColumn.id}
                            className={`border p-2 bg-${section.color}-50 dark:bg-${section.color}-900/40 text-center dark:border-slate-700 font-medium`}
                          >
                            {subColumn.title}
                          </th>
                        )),
                      ),
                    )}
                  </tr>

                  {/* Max Marks */}
                  <tr>
                    <th className="border p-2"></th>
                    <th className="border p-2">Max Marks</th>
                    {tableSections.map((section) =>
                      section.columns.map((column) =>
                        column.subColumns?.map((subColumn) => (
                          <th
                            key={subColumn.id}
                            className={`border p-2 bg-${section.color}-50 dark:bg-${section.color}-900/20 text-center dark:border-slate-700`}
                          >
                            <AttainmentTableCell
                              value={maxMarksData[subColumn.id] || ""}
                              rowIndex={-1}
                              colIndex={-1}
                              onChange={(value) => updateMaxMarks(subColumn.id, value)}
                              onNavigate={() => {}}
                              className="bg-transparent"
                            />
                          </th>
                        )),
                      ),
                    )}
                  </tr>

                  {/* Target Max Marks */}
                  <tr>
                    <th className="border p-2"></th>
                    <th className="border p-2">Target Max Marks</th>
                    {tableSections.map((section) =>
                      section.columns.map((column) =>
                        column.subColumns?.map((subColumn) => (
                          <th
                            key={subColumn.id}
                            className={`border p-2 bg-${section.color}-50 dark:bg-${section.color}-900/20 text-center dark:border-slate-700`}
                          >
                            <AttainmentTableCell
                              value={targetMaxMarksData[subColumn.id] || ""}
                              rowIndex={-1}
                              colIndex={-1}
                              onChange={(value) => updateTargetMaxMarks(subColumn.id, value)}
                              onNavigate={() => {}}
                              className="bg-transparent"
                            />
                          </th>
                        )),
                      ),
                    )}
                  </tr>

                  {/* Course Outcomes */}
                  <tr>
                    <th className="border p-2"></th>
                    <th className="border p-2">Course Outcomes</th>
                    {tableSections.map((section) =>
                      section.columns.map((column) =>
                        column.subColumns?.map((subColumn) => (
                          <th
                            key={subColumn.id}
                            className={`border p-2 bg-${section.color}-50 dark:bg-${section.color}-900/20 text-center dark:border-slate-700`}
                          >
                            <AttainmentTableCell
                              value={coData[subColumn.id] || ""}
                              rowIndex={-1}
                              colIndex={-1}
                              onChange={(value) => updateCO(subColumn.id, value)}
                              onNavigate={() => {}}
                              className="bg-transparent"
                            />
                          </th>
                        )),
                      ),
                    )}
                  </tr>

                  {/* Column Headers for Student Data */}
                  <tr className="bg-gray-50">
                    <th className="border p-2 text-center font-medium">S No</th>
                    <th className="border p-2 text-center font-medium">USN</th>
                    <th className="border p-2 text-center font-medium">Name</th>
                    <th colSpan={getTotalSubColumns()} className="border p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {studentData.map((student, studentIndex) => (
                    <tr key={studentIndex}>
                      <td className="border p-2 text-center">{studentIndex + 1}</td>
                      <td className="border p-2">{student.usn}</td>
                      <td className="border p-2">{student.name}</td>

                      {/* Render marks cells */}
                      {(() => {
                        let markIndex = 0
                        return tableSections.map((section) =>
                          section.columns.map((column) =>
                            column.subColumns?.map((subColumn) => {
                              const currentMarkIndex = markIndex++
                              return (
                                <td
                                  key={`${studentIndex}-${subColumn.id}`}
                                  data-row={studentIndex}
                                  data-col={currentMarkIndex + 3}
                                  className={`border p-1 text-center bg-${section.color}-50/30 dark:bg-${section.color}-900/20 dark:border-slate-700`}
                                >
                                  <AttainmentTableCell
                                    value={
                                      student.marks[currentMarkIndex] ? student.marks[currentMarkIndex].toString() : ""
                                    }
                                    rowIndex={studentIndex}
                                    colIndex={currentMarkIndex + 3}
                                    onChange={handleCellChange}
                                    onNavigate={handleCellNavigate}
                                    className="bg-transparent hover:bg-gray-100/50 dark:hover:bg-slate-700/50"
                                  />
                                </td>
                              )
                            }),
                          ),
                        )
                      })()}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">Sai Vidya Institute of Technology</h2>
          <p className="text-sm">Department of Electronics and Communication Engineering</p>
          <div className="mt-2 font-semibold">Course Attainment Sheet</div>
        </div>

        {/* Course Information Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-md p-3 border border-blue-100 dark:border-blue-900">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Course Name</div>
            <div className="font-medium mt-1">{courseName}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-md p-3 border border-blue-100 dark:border-blue-900">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Course Code</div>
            <div className="font-medium mt-1">{courseCode}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-md p-3 border border-blue-100 dark:border-blue-900">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Semester</div>
            <div className="font-medium mt-1">6</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-md p-3 border border-blue-100 dark:border-blue-900">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Faculty</div>
            <div className="font-medium mt-1">Nayana K</div>
          </div>
        </div>

        {/* Table Structure */}
        <div className="overflow-x-auto border rounded-md dark:border-[#2d3655]">
          <table ref={tableRef} className="w-full border-collapse text-sm dark:text-slate-200 dark:bg-[#1a2035]">
            <colgroup>
              <col className="w-10" />
              <col className="w-28" />
              <col className="w-48" />
              {tableSections.map((section) =>
                section.columns.map((column) =>
                  column.subColumns?.map((subColumn) => (
                    <col key={subColumn.id} className={`bg-${section.color}-50`} />
                  )),
                ),
              )}
            </colgroup>
            <thead>
              {/* Section Headers */}
              <tr>
                <th className="border p-2" rowSpan={6}></th>
                <th className="border p-2"></th>
                <th className="border p-2"></th>
                {tableSections.map((section) => {
                  const colSpan = section.columns.reduce((total, column) => total + (column.subColumns?.length || 0), 0)
                  let sectionHeaderClass = `border p-2 bg-${section.color}-100 dark:bg-${section.color}-900/50 text-center dark:border-slate-700 font-semibold`

                  if (section.id === "internal1") {
                    sectionHeaderClass = `border p-2 bg-${section.color}-100 dark:bg-[#8B3E2F]/20 dark:text-[#ff9d80] text-center dark:border-slate-700 font-semibold`
                  } else if (section.id === "internal2") {
                    sectionHeaderClass = `border p-2 bg-${section.color}-100 dark:bg-[#2a4798]/20 dark:text-[#a0b4ff] text-center dark:border-slate-700 font-semibold`
                  } else if (section.id === "internal3") {
                    sectionHeaderClass = `border p-2 bg-${section.color}-100 dark:bg-[#2a6e4d]/20 dark:text-[#8edbaf] text-center dark:border-slate-700 font-semibold`
                  } else if (section.id === "iacomp2") {
                    sectionHeaderClass = `border p-2 bg-${section.color}-100 dark:bg-[#8B7D2F]/20 dark:text-[#ffd980] text-center dark:border-slate-700 font-semibold`
                  } else if (section.id === "see") {
                    sectionHeaderClass = `border p-2 bg-${section.color}-100 dark:bg-[#8B2F2F]/20 dark:text-[#ff8080] text-center dark:border-slate-700 font-semibold`
                  }

                  return (
                    <th key={section.id} colSpan={colSpan} className={sectionHeaderClass}>
                      {section.title}
                    </th>
                  )
                })}
              </tr>

              {/* Column Headers */}
              <tr>
                <th className="border p-2"></th>
                <th className="border p-2">Question No.</th>
                {tableSections.map((section) =>
                  section.columns.map((column) => {
                    const colSpan = column.subColumns?.length || 0
                    return (
                      <th
                        key={column.id}
                        colSpan={colSpan}
                        className={`border p-2 bg-${section.color}-50 dark:bg-${section.color}-900/40 text-center dark:border-slate-700 font-medium`}
                      >
                        {column.title}
                      </th>
                    )
                  }),
                )}
              </tr>

              {/* Sub-Column Headers */}
              <tr>
                <th className="border p-2"></th>
                <th className="border p-2">Sub Questions</th>
                {tableSections.map((section) =>
                  section.columns.map((column) =>
                    column.subColumns?.map((subColumn) => (
                      <th
                        key={subColumn.id}
                        className={`border p-2 bg-${section.color}-50 dark:bg-${section.color}-900/40 text-center dark:border-slate-700 font-medium`}
                      >
                        {subColumn.title}
                      </th>
                    )),
                  ),
                )}
              </tr>

              {/* Max Marks */}
              <tr>
                <th className="border p-2"></th>
                <th className="border p-2">Max Marks</th>
                {tableSections.map((section) =>
                  section.columns.map((column) =>
                    column.subColumns?.map((subColumn) => (
                      <th
                        key={subColumn.id}
                        className={`border p-2 bg-${section.color}-50 dark:bg-${section.color}-900/20 text-center dark:border-slate-700`}
                      >
                        <AttainmentTableCell
                          value={maxMarksData[subColumn.id] || ""}
                          rowIndex={-1}
                          colIndex={-1}
                          onChange={(value) => updateMaxMarks(subColumn.id, value)}
                          onNavigate={() => {}}
                          className="bg-transparent"
                        />
                      </th>
                    )),
                  ),
                )}
              </tr>

              {/* Target Max Marks */}
              <tr>
                <th className="border p-2"></th>
                <th className="border p-2">Target Max Marks</th>
                {tableSections.map((section) =>
                  section.columns.map((column) =>
                    column.subColumns?.map((subColumn) => (
                      <th
                        key={subColumn.id}
                        className={`border p-2 bg-${section.color}-50 dark:bg-${section.color}-900/20 text-center dark:border-slate-700`}
                      >
                        <AttainmentTableCell
                          value={targetMaxMarksData[subColumn.id] || ""}
                          rowIndex={-1}
                          colIndex={-1}
                          onChange={(value) => updateTargetMaxMarks(subColumn.id, value)}
                          onNavigate={() => {}}
                          className="bg-transparent"
                        />
                      </th>
                    )),
                  ),
                )}
              </tr>

              {/* Course Outcomes */}
              <tr>
                <th className="border p-2"></th>
                <th className="border p-2">Course Outcomes</th>
                {tableSections.map((section) =>
                  section.columns.map((column) =>
                    column.subColumns?.map((subColumn) => (
                      <th
                        key={subColumn.id}
                        className={`border p-2 bg-${section.color}-50 dark:bg-${section.color}-900/20 text-center dark:border-slate-700`}
                      >
                        <AttainmentTableCell
                          value={coData[subColumn.id] || ""}
                          rowIndex={-1}
                          colIndex={-1}
                          onChange={(value) => updateCO(subColumn.id, value)}
                          onNavigate={() => {}}
                          className="bg-transparent"
                        />
                      </th>
                    )),
                  ),
                )}
              </tr>

              {/* Column Headers for Student Data */}
              <tr className="bg-gray-50">
                <th className="border p-2 text-center font-medium">S No</th>
                <th className="border p-2 text-center font-medium">USN</th>
                <th className="border p-2 text-center font-medium">Name</th>
                <th colSpan={getTotalSubColumns()} className="border p-2"></th>
              </tr>
            </thead>
            <tbody>
              {studentData.map((student, studentIndex) => (
                <tr key={studentIndex}>
                  <td
                    className="border p-2 text-center dark:bg-slate-800 dark:border-slate-700"
                    data-row={studentIndex}
                    data-col={0}
                  >
                    <AttainmentTableCell
                      value={(studentIndex + 1).toString()}
                      rowIndex={studentIndex}
                      colIndex={0}
                      onChange={(value) => {
                        // This is just for UI consistency, S No shouldn't actually change
                        toast({
                          title: "Note",
                          description: "Serial numbers are automatically assigned and cannot be changed.",
                        })
                      }}
                      onNavigate={handleCellNavigate}
                      className="bg-transparent hover:bg-slate-700/50"
                    />
                  </td>
                  <td
                    className="border p-2 dark:bg-slate-800 dark:border-slate-700"
                    data-row={studentIndex}
                    data-col={1}
                  >
                    <AttainmentTableCell
                      value={student.usn}
                      rowIndex={studentIndex}
                      colIndex={1}
                      onChange={(value) => {
                        const newStudentData = [...studentData]
                        newStudentData[studentIndex].usn = value
                        setStudentData(newStudentData)
                      }}
                      onNavigate={handleCellNavigate}
                      className="bg-transparent hover:bg-slate-700/50"
                    />
                  </td>
                  <td
                    className="border p-2 dark:bg-slate-800 dark:border-slate-700"
                    data-row={studentIndex}
                    data-col={2}
                  >
                    <AttainmentTableCell
                      value={student.name}
                      rowIndex={studentIndex}
                      colIndex={2}
                      onChange={(value) => {
                        const newStudentData = [...studentData]
                        newStudentData[studentIndex].name = value
                        setStudentData(newStudentData)
                      }}
                      onNavigate={handleCellNavigate}
                      className="bg-transparent hover:bg-slate-700/50"
                    />
                  </td>

                  {/* Render marks cells */}
                  {(() => {
                    let markIndex = 0
                    return tableSections.map((section) =>
                      section.columns.map((column) =>
                        column.subColumns?.map((subColumn) => {
                          const currentMarkIndex = markIndex++
                          return (
                            <td
                              key={`${studentIndex}-${subColumn.id}`}
                              data-row={studentIndex}
                              data-col={currentMarkIndex + 3}
                              className={`border p-1 text-center bg-${section.color}-50/30 dark:bg-${section.color}-900/20 dark:border-slate-700`}
                            >
                              <AttainmentTableCell
                                value={
                                  student.marks[currentMarkIndex] ? student.marks[currentMarkIndex].toString() : ""
                                }
                                rowIndex={studentIndex}
                                colIndex={currentMarkIndex + 3}
                                onChange={handleCellChange}
                                onNavigate={handleCellNavigate}
                                className="bg-transparent hover:bg-gray-100/50 dark:hover:bg-slate-700/50"
                              />
                            </td>
                          )
                        }),
                      ),
                    )
                  })()}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="text-sm text-muted-foreground mt-2">
          <p>Click on any cell to edit. Press Enter to save, Esc to cancel, or use arrow keys to navigate.</p>
        </div>

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={() => setShowTableSettings(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Customize Table
          </Button>
          <Button
            onClick={() => {
              toast({
                title: "Changes saved",
                description: "All attainment data has been saved successfully.",
              })
            }}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Attainment Data
          </Button>
        </div>
      </div>
    </div>
  )
}
