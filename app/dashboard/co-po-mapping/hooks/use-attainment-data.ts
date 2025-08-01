"use client"

import { useState, useCallback } from "react"
import type { AttainmentData, AssessmentComponent, COAttainmentThreshold, StudentMark, CourseOutcome } from "../types"
import type React from "react"

export function useAttainmentData() {
  // Initialize with proper structure to avoid undefined errors
  const [attainmentData, setAttainmentData] = useState<AttainmentData>({
    assessmentComponents: [],
    thresholds: [],
    studentMarks: [],
    attainmentLevels: {},
  })

  const [courseOutcomes, setCourseOutcomes] = useState<CourseOutcome[]>([
    { id: "co1", code: "CO1", description: "Understand basic concepts" },
    { id: "co2", code: "CO2", description: "Apply theoretical knowledge" },
    { id: "co3", code: "CO3", description: "Analyze complex problems" },
    { id: "co4", code: "CO4", description: "Design effective solutions" },
    { id: "co5", code: "CO5", description: "Evaluate system performance" },
  ])

  const [attainmentConfig, setAttainmentConfig] = useState({
    courseCode: "21EC63",
    courseName: "VLSI Design & Testing",
    numIAs: 3,
    numAssignments: 2,
    numQuizzes: 2,
    weights: {
      direct: 0.8,
      indirect: 0.2,
    },
    formula: "Direct*0.8 + Indirect*0.2",
  })

  const [attainmentTableData, setAttainmentTableData] = useState<string[][]>([])
  const [isAttainmentTableLoading, setIsAttainmentTableLoading] = useState(false)
  const [activeAttainmentCell, setActiveAttainmentCell] = useState<{ row: number; col: number } | null>(null)
  const [editAttainmentValue, setEditAttainmentValue] = useState("")
  const [showDetailedAttainmentSection, setShowDetailedAttainmentSection] = useState<boolean>(false)

  // CO Attainment data
  const [coAttainment, setCoAttainment] = useState<
    Array<{
      code: string
      direct: number
      indirect: number
      overall: number
    }>
  >([])

  // Function to fetch and parse the CSV data
  const fetchAttainmentTableData = useCallback(async () => {
    setIsAttainmentTableLoading(true)
    try {
      const response = await fetch(
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/VLSI%20Design%26Testing%20attainment_21EC63-TZGygaGsGvUsNL1xXGVFVH2UkZ6Bwt.csv",
      )
      const text = await response.text()

      // Parse CSV
      const rows = text.split("\n")
      const parsedData = rows.map((row) => row.split(","))

      setAttainmentTableData(parsedData)

      // Generate mock CO attainment data
      generateMockCOAttainment()
    } catch (error) {
      console.error("Error fetching CSV data:", error)
      generateMockAttainmentData()
    } finally {
      setIsAttainmentTableLoading(false)
    }
  }, [])

  // Generate mock attainment data based on configuration
  const generateMockAttainmentData = () => {
    const mockData: string[][] = []

    // Header rows
    mockData.push([
      "Course",
      attainmentConfig.courseName,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ])
    mockData.push([
      "Course Code",
      attainmentConfig.courseCode,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ])

    // CO row headers
    const coHeaders = ["CO Number", "CO Statement"]

    // Add IA columns
    for (let i = 1; i <= attainmentConfig.numIAs; i++) {
      coHeaders.push(`IA${i}`)
    }

    // Add Assignment columns
    for (let i = 1; i <= attainmentConfig.numAssignments; i++) {
      coHeaders.push(`Assignment${i}`)
    }

    // Add Quiz columns
    for (let i = 1; i <= attainmentConfig.numQuizzes; i++) {
      coHeaders.push(`Quiz${i}`)
    }

    // Add SEE and attainment columns
    coHeaders.push("SEE", "Direct Attainment", "Indirect Attainment", "Overall Attainment")

    mockData.push(coHeaders)

    // Add CO rows
    for (let i = 1; i <= 5; i++) {
      const coRow = [
        `CO${i}`,
        `Ability to ${i === 1 ? "understand" : i === 2 ? "analyze" : i === 3 ? "design" : i === 4 ? "implement" : "evaluate"} VLSI concepts`,
      ]

      // Add random values for assessments
      for (
        let j = 0;
        j < attainmentConfig.numIAs + attainmentConfig.numAssignments + attainmentConfig.numQuizzes;
        j++
      ) {
        coRow.push((Math.random() * 100).toFixed(2))
      }

      // Add SEE and attainment values
      coRow.push((Math.random() * 100).toFixed(2)) // SEE
      coRow.push((Math.random() * 3).toFixed(2)) // Direct
      coRow.push((Math.random() * 3).toFixed(2)) // Indirect
      coRow.push((Math.random() * 3).toFixed(2)) // Overall

      mockData.push(coRow)
    }

    // Add average row
    const avgRow = ["Average", ""]
    for (
      let j = 0;
      j < attainmentConfig.numIAs + attainmentConfig.numAssignments + attainmentConfig.numQuizzes + 4;
      j++
    ) {
      avgRow.push((Math.random() * 100).toFixed(2))
    }
    mockData.push(avgRow)

    setAttainmentTableData(mockData)

    // Generate mock CO attainment data
    generateMockCOAttainment()
  }

  // Generate mock CO attainment data
  const generateMockCOAttainment = () => {
    const mockCOAttainment = []

    for (let i = 1; i <= 5; i++) {
      const direct = Math.random() * 2 + 1 // Between 1-3
      const indirect = Math.random() * 2 + 1 // Between 1-3
      const overall = direct * attainmentConfig.weights.direct + indirect * attainmentConfig.weights.indirect

      mockCOAttainment.push({
        code: `CO${i}`,
        direct,
        indirect,
        overall,
      })
    }

    setCoAttainment(mockCOAttainment)
  }

  // Function to generate the attainment table
  const generateAttainmentTable = () => {
    setIsAttainmentTableLoading(true)

    // First try to fetch real data
    fetchAttainmentTableData().catch(() => {
      // If fetch fails, generate mock data
      generateMockAttainmentData()
    })
  }

  // Function to handle cell click for editing
  const handleAttainmentCellClick = (rowIndex: number, colIndex: number) => {
    // Don't allow editing of header rows or certain columns
    if (rowIndex < 2) return

    setActiveAttainmentCell({ row: rowIndex, col: colIndex })
    setEditAttainmentValue(attainmentTableData[rowIndex]?.[colIndex] || "")
  }

  // Function to handle key press in cell
  const handleAttainmentKeyDown = (e: React.KeyboardEvent) => {
    if (!activeAttainmentCell) return

    const { row, col } = activeAttainmentCell

    if (e.key === "Enter") {
      // Save the value
      const newData = [...attainmentTableData]
      if (newData[row]) {
        newData[row][col] = editAttainmentValue
        setAttainmentTableData(newData)
      }
      setActiveAttainmentCell(null)
    } else if (e.key === "Escape") {
      // Cancel editing
      setActiveAttainmentCell(null)
    } else if (e.key === "Tab") {
      e.preventDefault()
      // Save current cell and move to next cell
      const newData = [...attainmentTableData]
      if (newData[row]) {
        newData[row][col] = editAttainmentValue
        setAttainmentTableData(newData)
      }

      // Move to next cell (right or down to next row)
      if (col < attainmentTableData[0]?.length - 1) {
        setActiveAttainmentCell({ row, col: col + 1 })
        setEditAttainmentValue(attainmentTableData[row]?.[col + 1] || "")
      } else if (row < attainmentTableData.length - 1) {
        setActiveAttainmentCell({ row: row + 1, col: 0 })
        setEditAttainmentValue(attainmentTableData[row + 1]?.[0] || "")
      }
    }
  }

  // Function to calculate attainment
  const calculateAttainmentValues = () => {
    // Simulate calculation delay
    setTimeout(() => {
      // Generate updated CO attainment data
      const updatedCOAttainment = []

      for (let i = 1; i <= 5; i++) {
        // Extract values from the attainment table
        const rowIndex = i + 2 // CO rows start at index 3
        if (attainmentTableData[rowIndex]) {
          const directIndex = attainmentTableData[rowIndex].length - 3
          const indirectIndex = attainmentTableData[rowIndex].length - 2

          const direct = Number.parseFloat(attainmentTableData[rowIndex][directIndex] || "0")
          const indirect = Number.parseFloat(attainmentTableData[rowIndex][indirectIndex] || "0")
          const overall = direct * attainmentConfig.weights.direct + indirect * attainmentConfig.weights.indirect

          updatedCOAttainment.push({
            code: `CO${i}`,
            direct,
            indirect,
            overall,
          })
        }
      }

      setCoAttainment(updatedCOAttainment)
    }, 1000)
  }

  // Function to export attainment data to CSV
  const exportAttainmentToCSV = () => {
    const csvContent = attainmentTableData.map((row) => row.join(",")).join("\n")
    return csvContent
  }

  // Function to handle CSV import
  const handleImportCSV = (csvText: string) => {
    const rows = csvText.split("\n")
    const parsedData = rows.map((row) => row.split(","))
    setAttainmentTableData(parsedData)

    // Update course code and name from imported data
    if (parsedData[1] && parsedData[1][1]) {
      setAttainmentConfig({
        ...attainmentConfig,
        courseCode: parsedData[1][1],
        courseName: parsedData[0][1],
      })
    }
  }

  // Function to reset attainment data
  const resetAttainmentData = () => {
    setAttainmentTableData([])
    setCoAttainment([])
  }

  // Function to save attainment data
  const saveAttainmentData = () => {
    // In a real application, this would save to a database
    try {
      localStorage.setItem(`attainment_data_${attainmentConfig.courseCode}`, JSON.stringify(attainmentTableData))
      localStorage.setItem(`co_attainment_${attainmentConfig.courseCode}`, JSON.stringify(coAttainment))
      return true
    } catch (error) {
      console.error("Error saving data:", error)
      return false
    }
  }

  // Function to update assessment components
  const updateAssessmentComponents = (components: AssessmentComponent[]) => {
    setAttainmentData((prev) => ({
      ...prev,
      assessmentComponents: components,
    }))
  }

  // Function to update thresholds
  const updateThresholds = (thresholds: COAttainmentThreshold[]) => {
    setAttainmentData((prev) => ({
      ...prev,
      thresholds: thresholds,
    }))
  }

  // Function to update student marks
  const updateStudentMarks = (marks: StudentMark[]) => {
    setAttainmentData((prev) => ({
      ...prev,
      studentMarks: marks,
    }))
  }

  // Function to update attainment levels
  const updateAttainmentLevels = (levels: { [coId: string]: number }) => {
    setAttainmentData((prev) => ({
      ...prev,
      attainmentLevels: levels,
    }))
  }

  return {
    courseOutcomes,
    attainmentData,
    updateAssessmentComponents,
    updateThresholds,
    updateStudentMarks,
    updateAttainmentLevels,
    attainmentConfig,
    setAttainmentConfig,
    attainmentTableData,
    setAttainmentTableData,
    isAttainmentTableLoading,
    activeAttainmentCell,
    editAttainmentValue,
    setEditAttainmentValue,
    showDetailedAttainmentSection,
    setShowDetailedAttainmentSection,
    coAttainment,
    generateAttainmentTable,
    handleAttainmentCellClick,
    handleAttainmentKeyDown,
    calculateAttainmentValues,
    exportAttainmentToCSV,
    handleImportCSV,
    resetAttainmentData,
    saveAttainmentData,
  }
}
