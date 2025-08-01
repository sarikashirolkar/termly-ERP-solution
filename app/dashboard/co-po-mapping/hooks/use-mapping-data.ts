"use client"

import { useState, useEffect } from "react"
import type { MappingLevel } from "../types"

// Initial mapping data
const initialMappings: Record<string, Record<string, Record<string, MappingLevel>>> = {
  CS101: {
    CO1: {
      PO1: 3,
      PO2: 2,
      PO3: 1,
      PO4: 0,
      PO5: 1,
      PO6: 0,
      PO7: 0,
      PO8: 0,
      PO9: 1,
      PO10: 2,
      PO11: 0,
      PO12: 1,
      PSO1: 2,
      PSO2: 1,
    },
    CO2: {
      PO1: 2,
      PO2: 3,
      PO3: 2,
      PO4: 1,
      PO5: 2,
      PO6: 0,
      PO7: 0,
      PO8: 0,
      PO9: 1,
      PO10: 1,
      PO11: 0,
      PO12: 1,
      PSO1: 1,
      PSO2: 3,
    },
    // Add more CO mappings as needed
  },
  // Add more course mappings as needed
}

export function useMappingData() {
  const [mappings, setMappings] =
    useState<Record<string, Record<string, Record<string, MappingLevel>>>>(initialMappings)
  const [selectedCourse, setSelectedCourse] = useState<string>("CS101")

  // Load saved mapping data from localStorage when course changes
  useEffect(() => {
    try {
      const savedMapping = localStorage.getItem(`copo_mapping_${selectedCourse}`)
      if (savedMapping) {
        setMappings((prev) => ({
          ...prev,
          [selectedCourse]: JSON.parse(savedMapping),
        }))
      }
    } catch (error) {
      console.error("Error loading saved mapping data:", error)
    }
  }, [selectedCourse])

  const handleMappingChange = (coId: string, poId: string, level: MappingLevel) => {
    setMappings((prevMappings) => {
      const courseMappings = { ...prevMappings }

      // Initialize course mappings if they don't exist
      if (!courseMappings[selectedCourse]) {
        courseMappings[selectedCourse] = {}
      }

      // Initialize CO mappings if they don't exist
      if (!courseMappings[selectedCourse][coId]) {
        courseMappings[selectedCourse][coId] = {}
      }

      // Set the mapping level
      courseMappings[selectedCourse][coId][poId] = level

      return courseMappings
    })
  }

  const getMappingLevel = (coId: string, poId: string): MappingLevel => {
    if (!mappings[selectedCourse] || !mappings[selectedCourse][coId]) {
      return 0
    }
    return mappings[selectedCourse][coId][poId] || 0
  }

  const saveMappingData = () => {
    try {
      localStorage.setItem(`copo_mapping_${selectedCourse}`, JSON.stringify(mappings[selectedCourse]))
      return true
    } catch (error) {
      console.error("Error saving mapping data:", error)
      return false
    }
  }

  const exportMappingToCSV = (courseOutcomes?: any[], programOutcomes?: any[], programSpecificOutcomes?: any[]) => {
    let csv = "CO/PO,"

    // Use provided outcomes or default to PO1-PO12 and PSO1-PSO2
    const pos = programOutcomes || Array.from({ length: 12 }, (_, i) => ({ id: `PO${i + 1}`, code: `PO${i + 1}` }))

    const psos =
      programSpecificOutcomes || Array.from({ length: 2 }, (_, i) => ({ id: `PSO${i + 1}`, code: `PSO${i + 1}` }))

    // Add PO headers
    pos.forEach((po) => {
      csv += `${po.code},`
    })

    // Add PSO headers
    psos.forEach((pso) => {
      csv += `${pso.code},`
    })

    csv += "\n"

    // Use provided course outcomes or get from mappings
    const cos =
      courseOutcomes ||
      (mappings[selectedCourse] ? Object.keys(mappings[selectedCourse]).map((coId) => ({ id: coId, code: coId })) : [])

    // Add CO rows
    cos.forEach((co) => {
      csv += `${co.code},`

      // Add PO values
      pos.forEach((po) => {
        csv += `${getMappingLevel(co.id, po.id)},`
      })

      // Add PSO values
      psos.forEach((pso) => {
        csv += `${getMappingLevel(co.id, pso.id)},`
      })

      csv += "\n"
    })

    return csv
  }

  return {
    mappings,
    selectedCourse,
    setSelectedCourse,
    handleMappingChange,
    getMappingLevel,
    saveMappingData,
    exportMappingToCSV,
  }
}
