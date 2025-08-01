"use client"

import { useState } from "react"

// Define types for CO and PO
type CourseOutcome = {
  id: string
  code: string
  description: string
}

type ProgramOutcome = {
  id: string
  code: string
  description: string
}

type ProgramSpecificOutcome = {
  id: string
  code: string
  description: string
}

// Initial course outcomes data
const initialCourseOutcomes: Record<string, CourseOutcome[]> = {
  CS101: [
    { id: "CO1", code: "CO1", description: "Understand fundamental concepts of computing" },
    { id: "CO2", code: "CO2", description: "Apply algorithmic thinking to solve problems" },
    { id: "CO3", code: "CO3", description: "Analyze the efficiency of simple algorithms" },
    { id: "CO4", code: "CO4", description: "Implement basic programming constructs" },
    { id: "CO5", code: "CO5", description: "Evaluate the suitability of different programming paradigms" },
  ],
  DS201: [
    { id: "CO1", code: "CO1", description: "Understand various data structures and their applications" },
    { id: "CO2", code: "CO2", description: "Implement and use linear and non-linear data structures" },
    { id: "CO3", code: "CO3", description: "Analyze the time and space complexity of algorithms" },
    { id: "CO4", code: "CO4", description: "Apply appropriate data structures to solve problems" },
    { id: "CO5", code: "CO5", description: "Design efficient algorithms using various data structures" },
  ],
  // Add more courses as needed
}

// Program outcomes (common across all courses)
const initialProgramOutcomes: ProgramOutcome[] = [
  { id: "PO1", code: "PO1", description: "Engineering Knowledge" },
  { id: "PO2", code: "PO2", description: "Problem Analysis" },
  { id: "PO3", code: "PO3", description: "Design/Development of Solutions" },
  { id: "PO4", code: "PO4", description: "Conduct Investigations of Complex Problems" },
  { id: "PO5", code: "PO5", description: "Modern Tool Usage" },
  { id: "PO6", code: "PO6", description: "The Engineer and Society" },
  { id: "PO7", code: "PO7", description: "Environment and Sustainability" },
  { id: "PO8", code: "PO8", description: "Ethics" },
  { id: "PO9", code: "PO9", description: "Individual and Team Work" },
  { id: "PO10", code: "PO10", description: "Communication" },
  { id: "PO11", code: "PO11", description: "Project Management and Finance" },
  { id: "PO12", code: "PO12", description: "Life-long Learning" },
]

// Program specific outcomes
const initialProgramSpecificOutcomes: ProgramSpecificOutcome[] = [
  { id: "PSO1", code: "PSO1", description: "Professional Skills" },
  { id: "PSO2", code: "PSO2", description: "Problem-Solving Skills" },
]

export function useOutcomesData() {
  const [courseOutcomes, setCourseOutcomes] = useState<Record<string, CourseOutcome[]>>(initialCourseOutcomes)
  const [programOutcomes, setProgramOutcomes] = useState<ProgramOutcome[]>(initialProgramOutcomes)
  const [programSpecificOutcomes, setProgramSpecificOutcomes] =
    useState<ProgramSpecificOutcome[]>(initialProgramSpecificOutcomes)
  const [selectedCourse, setSelectedCourse] = useState<string>("CS101")
  const [numCOs, setNumCOs] = useState<number>(5)
  const [numPOs, setNumPOs] = useState<number>(12)
  const [numPSOs, setNumPSOs] = useState<number>(2)

  // State for individual editing
  const [editingCO, setEditingCO] = useState<string | null>(null)
  const [editingPO, setEditingPO] = useState<string | null>(null)
  const [editingPSO, setEditingPSO] = useState<string | null>(null)
  const [tempEditValue, setTempEditValue] = useState<string>("")

  const handleCourseOutcomeChange = (index: number, field: keyof CourseOutcome, value: string) => {
    setCourseOutcomes((prev) => {
      const newCourseOutcomes = { ...prev }
      const updatedCOs = [...newCourseOutcomes[selectedCourse]]
      updatedCOs[index] = { ...updatedCOs[index], [field]: value }
      newCourseOutcomes[selectedCourse] = updatedCOs
      return newCourseOutcomes
    })
  }

  const handleProgramOutcomeChange = (index: number, field: keyof ProgramOutcome, value: string) => {
    setProgramOutcomes((prev) => {
      const updatedPOs = [...prev]
      updatedPOs[index] = { ...updatedPOs[index], [field]: value }
      return updatedPOs
    })
  }

  const handleProgramSpecificOutcomeChange = (index: number, field: keyof ProgramSpecificOutcome, value: string) => {
    setProgramSpecificOutcomes((prev) => {
      const updatedPSOs = [...prev]
      updatedPSOs[index] = { ...updatedPSOs[index], [field]: value }
      return updatedPSOs
    })
  }

  // Handlers for individual editing
  const startEditingCO = (coId: string, field: keyof CourseOutcome) => {
    const co = courseOutcomes[selectedCourse].find((co) => co.id === coId)
    if (co) {
      setEditingCO(`${coId}-${field}`)
      setTempEditValue(co[field])
    }
  }

  const startEditingPO = (poId: string, field: keyof ProgramOutcome) => {
    const po = programOutcomes.find((po) => po.id === poId)
    if (po) {
      setEditingPO(`${poId}-${field}`)
      setTempEditValue(po[field])
    }
  }

  const startEditingPSO = (psoId: string, field: keyof ProgramSpecificOutcome) => {
    const pso = programSpecificOutcomes.find((pso) => pso.id === psoId)
    if (pso) {
      setEditingPSO(`${psoId}-${field}`)
      setTempEditValue(pso[field])
    }
  }

  const saveEditCO = (coId: string, field: keyof CourseOutcome) => {
    const index = courseOutcomes[selectedCourse].findIndex((co) => co.id === coId)
    if (index !== -1) {
      handleCourseOutcomeChange(index, field, tempEditValue)
      setEditingCO(null)
      setTempEditValue("")
      return true
    }
    return false
  }

  const saveEditPO = (poId: string, field: keyof ProgramOutcome) => {
    const index = programOutcomes.findIndex((po) => po.id === poId)
    if (index !== -1) {
      handleProgramOutcomeChange(index, field, tempEditValue)
      setEditingPO(null)
      setTempEditValue("")
      return true
    }
    return false
  }

  const saveEditPSO = (psoId: string, field: keyof ProgramSpecificOutcome) => {
    const index = programSpecificOutcomes.findIndex((pso) => pso.id === psoId)
    if (index !== -1) {
      handleProgramSpecificOutcomeChange(index, field, tempEditValue)
      setEditingPSO(null)
      setTempEditValue("")
      return true
    }
    return false
  }

  const cancelEdit = () => {
    setEditingCO(null)
    setEditingPO(null)
    setEditingPSO(null)
    setTempEditValue("")
  }

  // Add new functions for adding outcomes
  const addCourseOutcome = (course: string) => {
    setCourseOutcomes((prev) => {
      const newCourseOutcomes = { ...prev }
      const currentCOs = [...(newCourseOutcomes[course] || [])]
      const nextNumber = currentCOs.length + 1
      const newCO: CourseOutcome = {
        id: `CO${nextNumber}`,
        code: `CO${nextNumber}`,
        description: `New course outcome ${nextNumber}`,
      }
      newCourseOutcomes[course] = [...currentCOs, newCO]

      // Update numCOs if this is the selected course
      if (course === selectedCourse) {
        setNumCOs(nextNumber)
      }

      return newCourseOutcomes
    })
  }

  const addProgramOutcome = () => {
    setProgramOutcomes((prev) => {
      const nextNumber = prev.length + 1
      const newPO: ProgramOutcome = {
        id: `PO${nextNumber}`,
        code: `PO${nextNumber}`,
        description: `New program outcome ${nextNumber}`,
      }
      setNumPOs(nextNumber)
      return [...prev, newPO]
    })
  }

  const addProgramSpecificOutcome = () => {
    setProgramSpecificOutcomes((prev) => {
      const nextNumber = prev.length + 1
      const newPSO: ProgramSpecificOutcome = {
        id: `PSO${nextNumber}`,
        code: `PSO${nextNumber}`,
        description: `New program specific outcome ${nextNumber}`,
      }
      setNumPSOs(nextNumber)
      return [...prev, newPSO]
    })
  }

  // Add functions for deleting outcomes
  const deleteCourseOutcome = (course: string, coId: string) => {
    setCourseOutcomes((prev) => {
      const newCourseOutcomes = { ...prev }
      const currentCOs = [...(newCourseOutcomes[course] || [])]
      const filteredCOs = currentCOs.filter((co) => co.id !== coId)

      // Renumber the remaining COs if needed
      const updatedCOs = filteredCOs.map((co, index) => ({
        ...co,
        id: `CO${index + 1}`,
        code: `CO${index + 1}`,
      }))

      newCourseOutcomes[course] = updatedCOs

      // Update numCOs if this is the selected course
      if (course === selectedCourse) {
        setNumCOs(updatedCOs.length)
      }

      return newCourseOutcomes
    })
  }

  const deleteProgramOutcome = (poId: string) => {
    setProgramOutcomes((prev) => {
      const filteredPOs = prev.filter((po) => po.id !== poId)

      // Renumber the remaining POs if needed
      const updatedPOs = filteredPOs.map((po, index) => ({
        ...po,
        id: `PO${index + 1}`,
        code: `PO${index + 1}`,
      }))

      setNumPOs(updatedPOs.length)
      return updatedPOs
    })
  }

  const deleteProgramSpecificOutcome = (psoId: string) => {
    setProgramSpecificOutcomes((prev) => {
      const filteredPSOs = prev.filter((pso) => pso.id !== psoId)

      // Renumber the remaining PSOs if needed
      const updatedPSOs = filteredPSOs.map((pso, index) => ({
        ...pso,
        id: `PSO${index + 1}`,
        code: `PSO${index + 1}`,
      }))

      setNumPSOs(updatedPSOs.length)
      return updatedPSOs
    })
  }

  return {
    courseOutcomes,
    programOutcomes,
    programSpecificOutcomes,
    selectedCourse,
    setSelectedCourse,
    numCOs,
    setNumCOs,
    numPOs,
    setNumPOs,
    numPSOs,
    setNumPSOs,
    editingCO,
    editingPO,
    editingPSO,
    tempEditValue,
    setTempEditValue,
    handleCourseOutcomeChange,
    handleProgramOutcomeChange,
    handleProgramSpecificOutcomeChange,
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
  }
}
