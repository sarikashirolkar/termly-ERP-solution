"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Save, Trash2, Download, Upload, Plus, Edit, RotateCcw, X } from 'lucide-react'
import { apiService } from "@/lib/supabase-service-new"

// Enhanced color palette with classic and good-looking colors for different subjects
const subjectColorPalette = [
  "#2563eb", // Classic Blue
  "#dc2626", // Classic Red
  "#16a34a", // Classic Green
  "#ca8a04", // Classic Gold
  "#9333ea", // Classic Purple
  "#c2410c", // Classic Orange
  "#0891b2", // Classic Cyan
  "#be123c", // Classic Rose
  "#4338ca", // Classic Indigo
  "#059669", // Classic Emerald
  "#7c2d12", // Classic Brown
  "#1e40af", // Deep Blue
  "#b91c1c", // Deep Red
  "#15803d", // Deep Green
  "#a16207", // Deep Amber
  "#7c3aed", // Deep Violet
  "#ea580c", // Deep Orange
  "#0e7490", // Deep Cyan
  "#be185d", // Deep Pink
  "#3730a3", // Deep Indigo
  "#047857", // Deep Teal
  "#92400e", // Deep Orange-Brown
  "#1d4ed8", // Bright Blue
  "#dc2626", // Bright Red
  "#22c55e", // Bright Green
]

// Function to get consistent color for a subject with better distribution
const getSubjectColor = (subjectCode: string): string => {
  // Create a more sophisticated hash from the subject code
  let hash = 0
  for (let i = 0; i < subjectCode.length; i++) {
    const char = subjectCode.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }

  // Use absolute value and modulo to get a consistent index
  const colorIndex = Math.abs(hash) % subjectColorPalette.length
  return subjectColorPalette[colorIndex]
}

// Define types for our timetable data
interface Subject {
  id: string
  code: string
  name: string
  color: string
  componentType: "theory" | "lab"
  facultyIds: string[]
  facultyNames: string[]
  facultyShortNames: string[]
  hasTheory: boolean
  hasLab: boolean
  shortName: string
  batches?: string[] // Add batches for lab subjects
  batchFaculty?: { [batchName: string]: { ids: string[]; names: string[]; shortNames: string[] } } // Add batch-specific faculty
  numberOfBatches?: number
}

interface TimeSlot {
  id: string
  start: string
  end: string
  isBreak?: boolean
  breakType?: "coffee" | "lunch"
}

interface ClassEntry {
  id: string
  subjectId: string
  subjectCode: string
  subjectName: string
  shortName: string
  componentType: "theory" | "lab"
  facultyNames: string[]
  facultyShortNames: string[]
  lab?: string
  batch?: string
  color: string
  hasTheory: boolean
  hasLab: boolean
}

interface TimetableCell {
  id: string
  day: string
  timeSlotId: string
  classEntries: ClassEntry[]
  isBreak?: boolean
  breakType?: "coffee" | "lunch"
}

interface TimetableData {
  id: string
  academicYear: string
  semester: string
  section: string
  roomNumber: string
  timeSlots: TimeSlot[]
  days: string[]
  cells: TimetableCell[]
}

export default function CreateTimetablePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [academicYear, setAcademicYear] = useState<string>("")
  const [semester, setSemester] = useState<string>("")
  const [section, setSection] = useState<string>("")
  const [roomNumber, setRoomNumber] = useState<string>("")
  const [availableSections, setAvailableSections] = useState<string[]>([])
  const [timetableGenerated, setTimetableGenerated] = useState<boolean>(false)
  const [timetableData, setTimetableData] = useState<TimetableData | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedCell, setSelectedCell] = useState<TimetableCell | null>(null)
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState<boolean>(false)
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedLab, setSelectedLab] = useState<string>("")
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editingClassIndex, setEditingClassIndex] = useState<number>(-1)
  const [savedTimetables, setSavedTimetables] = useState<TimetableData[]>([])
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState<boolean>(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false)
  const [timetableToDelete, setTimetableToDelete] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isAddingMultiple, setIsAddingMultiple] = useState<boolean>(false)
  const [selectedBatch, setSelectedBatch] = useState<string>("")
  const [availableBatches, setAvailableBatches] = useState<string[]>([])
  const [batchSpecificFaculty, setBatchSpecificFaculty] = useState<{ names: string[]; shortNames: string[] }>({
    names: [],
    shortNames: [],
  })
  const [sectionStudentCount, setSectionStudentCount] = useState<number>(60)

  // Academic year options
  const getAcademicYearOptions = () => {
    const currentYear = new Date().getFullYear()
    const options = []

    for (let i = 0; i < 3; i++) {
      const year = currentYear - i
      const nextYear = year + 1
      options.push(`${year}-${nextYear.toString().slice(-2)}(odd)`)
      options.push(`${year}-${nextYear.toString().slice(-2)}(even)`)
    }

    return options
  }

  // Get semester options based on academic year
  const getSemesterOptions = (academicYear: string) => {
    if (academicYear.includes("odd")) {
      return [1, 3, 5, 7]
    } else if (academicYear.includes("even")) {
      return [2, 4, 6, 8]
    }
    return [1, 2, 3, 4, 5, 6, 7, 8]
  }

  // Time slots
  const timeSlots: TimeSlot[] = [
    { id: "slot1", start: "8:30", end: "9:30" },
    { id: "slot2", start: "9:30", end: "10:30" },
    { id: "slot3", start: "10:30", end: "10:50", isBreak: true, breakType: "coffee" },
    { id: "slot4", start: "10:50", end: "11:50" },
    { id: "slot5", start: "11:50", end: "12:50" },
    { id: "slot6", start: "12:50", end: "1:30", isBreak: true, breakType: "lunch" },
    { id: "slot7", start: "1:30", end: "2:25" },
    { id: "slot8", start: "2:25", end: "3:20" },
    { id: "slot9", start: "3:20", end: "4:10" },
  ]

  // Days of the week
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Generate short names for subjects and handle clashes
  const generateShortNames = (subjectsList: any[]) => {
    const shortNameMap = new Map<string, string[]>()
    const finalShortNames = new Map<string, string>()

    // First pass: generate initial short names (first letter of each word)
    subjectsList.forEach((subject) => {
      const words = subject.name.split(" ").filter((word) => word.length > 0)
      const initialShortName = words.map((word) => word.charAt(0).toUpperCase()).join("")

      if (!shortNameMap.has(initialShortName)) {
        shortNameMap.set(initialShortName, [])
      }
      shortNameMap.get(initialShortName)!.push(subject.id)
    })

    // Second pass: resolve clashes by using second letters
    shortNameMap.forEach((subjectIds, shortName) => {
      if (subjectIds.length === 1) {
        finalShortNames.set(subjectIds[0], shortName)
      } else {
        const baseSubjectIds = subjectIds.map((id) => id.split("-")[0])
        const uniqueBaseSubjects = [...new Set(baseSubjectIds)]

        if (uniqueBaseSubjects.length === 1) {
          subjectIds.forEach((subjectId) => {
            finalShortNames.set(subjectId, shortName)
          })
        } else {
          subjectIds.forEach((subjectId) => {
            const subject = subjectsList.find((s) => s.id === subjectId)
            if (subject) {
              const words = subject.name.split(" ").filter((word: string) => word.length > 0)
              let resolvedShortName = shortName

              for (let i = 0; i < words.length; i++) {
                if (words[i].length > 1) {
                  const newShortName = words
                    .map((word: string, index: number) => {
                      if (index === i && word.length > 1) {
                        return word.charAt(0).toUpperCase() + word.charAt(1).toLowerCase()
                      }
                      return word.charAt(0).toUpperCase()
                    })
                    .join("")

                  const isUnique = !subjectIds.some((otherId) => {
                    if (otherId === subjectId) return false
                    return finalShortNames.get(otherId) === newShortName
                  })

                  if (isUnique) {
                    resolvedShortName = newShortName
                    break
                  }
                }
              }

              finalShortNames.set(subjectId, resolvedShortName)
            }
          })
        }
      }
    })

    return finalShortNames
  }

  // Generate short names for faculty and handle clashes
  const generateFacultyShortNames = (facultyNames: string[]) => {
    const shortNameMap = new Map<string, string[]>()
    const finalShortNames = new Map<string, string>()

    facultyNames.forEach((facultyName, index) => {
      const words = facultyName.split(" ").filter((word) => word.length > 0)
      const initialShortName = words.map((word) => word.charAt(0).toUpperCase()).join("")

      if (!shortNameMap.has(initialShortName)) {
        shortNameMap.set(initialShortName, [])
      }
      shortNameMap.get(initialShortName)!.push(index.toString())
    })

    shortNameMap.forEach((facultyIndices, shortName) => {
      if (facultyIndices.length === 1) {
        const facultyName = facultyNames[Number.parseInt(facultyIndices[0])]
        finalShortNames.set(facultyName, shortName)
      } else {
        facultyIndices.forEach((facultyIndex) => {
          const facultyName = facultyNames[Number.parseInt(facultyIndex)]
          const words = facultyName.split(" ").filter((word: string) => word.length > 0)
          let resolvedShortName = shortName

          for (let i = 0; i < words.length; i++) {
            if (words[i].length > 1) {
              const newShortName = words
                .map((word: string, index: number) => {
                  if (index === i && word.length > 1) {
                    return word.charAt(0).toUpperCase() + word.charAt(1).toLowerCase()
                  }
                  return word.charAt(0).toUpperCase()
                })
                .join("")

              const isUnique = !facultyIndices.some((otherIndex) => {
                if (otherIndex === facultyIndex) return false
                const otherFacultyName = facultyNames[Number.parseInt(otherIndex)]
                return finalShortNames.get(otherFacultyName) === newShortName
              })

              if (isUnique) {
                resolvedShortName = newShortName
                break
              }
            }
          }

          finalShortNames.set(facultyName, resolvedShortName)
        })
      }
    })

    return facultyNames.map((name) => finalShortNames.get(name) || name.charAt(0).toUpperCase())
  }

  // Utility function to ensure classEntries exists and is an array
  const ensureClassEntries = (cell: any): TimetableCell => {
    if (!cell.classEntries) {
      if (cell.classEntry) {
        // Migrate old format
        return {
          ...cell,
          classEntries: [cell.classEntry],
        }
      } else {
        // Initialize empty array
        return {
          ...cell,
          classEntries: [],
        }
      }
    }
    return cell
  }

  // Generate batches dynamically based on section and actual number of batches
  const generateBatchesForSection = (sectionLetter: string, numberOfBatches: number): string[] => {
    const batches = []
    for (let i = 1; i <= numberOfBatches; i++) {
      batches.push(`${sectionLetter}${i}`)
    }
    return batches
  }

  // Get section-specific student count
  const getSectionStudentCount = async (section: string, semester: string): Promise<number> => {
    try {
      // This would ideally fetch from your student database
      // For now, return a default based on section naming convention
      const defaultCounts: { [key: string]: number } = {
        A: 60,
        B: 55,
        C: 50,
        D: 45,
      }

      const sectionLetter = section.charAt(0).toUpperCase()
      return defaultCounts[sectionLetter] || 60
    } catch (error) {
      console.error("Error getting section student count:", error)
      return 60 // Default fallback
    }
  }

  // Load subjects and saved timetables on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        await loadSavedTimetables()
        const currentAcademicYear = getAcademicYearOptions()[0]
        setAcademicYear(currentAcademicYear)
      } catch (error) {
        console.error("Error in fetchInitialData:", error)
        toast({
          title: "Error",
          description: "Failed to initialize timetable data.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [toast])

  // Load available sections when semester changes
  useEffect(() => {
    if (academicYear && semester) {
      loadAvailableSections()
    }
  }, [academicYear, semester])

  // Load subjects when semester and section change
  useEffect(() => {
    if (academicYear && semester && section) {
      loadSubjectsForSection()
    }
  }, [academicYear, semester, section])

  // Update available batches when selected subject changes
  useEffect(() => {
    if (selectedSubject) {
      const subject = subjects.find((s) => s.id === selectedSubject)
      if (subject && subject.componentType === "lab") {
        console.log(`Setting batches for subject ${subject.code}:`, subject.batches) // Debug log
        if (subject.batches && subject.batches.length > 0) {
          setAvailableBatches(subject.batches)
        } else {
          // Fallback: generate batches based on section and number of batches
          const sectionLetter = section.charAt(0).toUpperCase()
          const numberOfBatches = subject.numberOfBatches || 1
          const fallbackBatches = generateBatchesForSection(sectionLetter, numberOfBatches)
          console.log(`Using fallback batches:`, fallbackBatches) // Debug log
          setAvailableBatches(fallbackBatches)
        }
      } else {
        setAvailableBatches([])
      }
    } else {
      setAvailableBatches([])
    }
  }, [selectedSubject, subjects, section])

  // NEW: Update batch-specific faculty when batch is selected
  useEffect(() => {
    if (selectedSubject && selectedBatch) {
      const subject = subjects.find((s) => s.id === selectedSubject)
      if (subject && subject.componentType === "lab" && subject.batchFaculty && subject.batchFaculty[selectedBatch]) {
        setBatchSpecificFaculty({
          names: subject.batchFaculty[selectedBatch].names,
          shortNames: subject.batchFaculty[selectedBatch].shortNames,
        })
      } else {
        setBatchSpecificFaculty({ names: [], shortNames: [] })
      }
    } else {
      setBatchSpecificFaculty({ names: [], shortNames: [] })
    }
  }, [selectedSubject, selectedBatch, subjects])

  // Load available sections from assign-subjects data
  const loadAvailableSections = async () => {
    try {
      const { data: subjectsData, error } = await apiService.subjects.getSubjectsWithAssignments()

      if (error) {
        console.error("Error loading subjects with assignments:", error)
        return
      }

      const sectionsSet = new Set<string>()

      subjectsData?.forEach((subject) => {
        if (subject.semester.toString() === semester && subject.section_assignments) {
          Object.keys(subject.section_assignments).forEach((sectionKey) => {
            const assignments = subject.section_assignments![sectionKey]
            if (assignments.theory.length > 0 || assignments.lab.length > 0) {
              sectionsSet.add(sectionKey)
            }
          })
        }
      })

      const sections = Array.from(sectionsSet).sort()
      setAvailableSections(sections)

      if (section && !sections.includes(section)) {
        setSection("")
      }
    } catch (error) {
      console.error("Error loading available sections:", error)
      toast({
        title: "Error",
        description: "Failed to load available sections.",
        variant: "destructive",
      })
    }
  }

  // Load subjects for the selected section with faculty assignments
  const loadSubjectsForSection = async () => {
    try {
      const { data: subjectsData, error } = await apiService.subjects.getSubjectsWithAssignments()

      if (error) {
        console.error("Error loading subjects:", error)
        return
      }

      const rawSubjects: any[] = []

      for (const subject of subjectsData || []) {
        if (subject.semester.toString() === semester && subject.section_assignments?.[section]) {
          const assignments = subject.section_assignments[section]

          if (assignments.theory.length > 0) {
            rawSubjects.push({
              id: `${subject.id}-theory`,
              code: subject.code,
              name: subject.name,
              componentType: "theory",
              color: getSubjectColor(subject.code), // Use subject code for consistent coloring
              facultyIds: [],
              facultyNames: assignments.theory,
              hasTheory: subject.has_theory,
              hasLab: subject.has_lab,
            })
          }

          if (assignments.lab.length > 0) {
            // FIXED: Get the actual number of batches from the subject
            const actualNumberOfBatches = subject.number_of_batches || 1
            console.log(`Subject ${subject.code} has ${actualNumberOfBatches} batches configured`) // Debug log

            // Generate batches using the section letter and actual number of batches
            const sectionLetter = section.charAt(0).toUpperCase()
            const labBatches = []
            for (let i = 1; i <= actualNumberOfBatches; i++) {
              labBatches.push(`${sectionLetter}${i}`)
            }

            console.log(`Generated batches for ${subject.code}:`, labBatches) // Debug log

            // NEW: Fetch batch-specific faculty assignments
            const batchFaculty: { [batchName: string]: { ids: string[]; names: string[]; shortNames: string[] } } = {}

            // Get courses for this subject to find batch-specific faculty
            try {
              const { data: coursesData } = await apiService.courses.getCoursesBySubjectAndComponent(subject.id, "lab")

              if (coursesData) {
                // Group faculty by batch
                const batchFacultyMap = new Map<string, Set<string>>()

                coursesData.forEach((course: any) => {
                  if (course.batch && course.faculty_id) {
                    if (!batchFacultyMap.has(course.batch)) {
                      batchFacultyMap.set(course.batch, new Set())
                    }
                    batchFacultyMap.get(course.batch)!.add(course.faculty_id)
                  }
                })

                // Convert to the required format
                for (const batch of labBatches) {
                  const facultyIds = Array.from(batchFacultyMap.get(batch) || [])

                  // Get faculty names for these IDs
                  if (facultyIds.length > 0) {
                    const { data: facultyData } = await apiService.faculty.getAll()
                    const batchFacultyNames =
                      facultyData?.filter((f) => facultyIds.includes(f.id)).map((f) => f.name) || []

                    batchFaculty[batch] = {
                      ids: facultyIds,
                      names: batchFacultyNames,
                      shortNames: generateFacultyShortNames(batchFacultyNames),
                    }
                  } else {
                    // Fallback to all lab faculty if no specific assignment found
                    batchFaculty[batch] = {
                      ids: [],
                      names: assignments.lab,
                      shortNames: generateFacultyShortNames(assignments.lab),
                    }
                  }
                }
              }
            } catch (error) {
              console.error("Error fetching batch-specific faculty:", error)
              // Fallback: assign all lab faculty to all batches
              labBatches.forEach((batch) => {
                batchFaculty[batch] = {
                  ids: [],
                  names: assignments.lab,
                  shortNames: generateFacultyShortNames(assignments.lab),
                }
              })
            }

            rawSubjects.push({
              id: `${subject.id}-lab`,
              code: subject.code,
              name: subject.name,
              componentType: "lab",
              color: getSubjectColor(subject.code), // Use subject code for consistent coloring
              facultyIds: [],
              facultyNames: assignments.lab, // Keep all lab faculty for backward compatibility
              hasTheory: subject.has_theory,
              hasLab: subject.has_lab,
              batches: labBatches,
              batchFaculty: batchFaculty, // NEW: Add batch-specific faculty
              numberOfBatches: actualNumberOfBatches, // Add this for reference
            })
          }
        }
      }

      const shortNameMap = generateShortNames(rawSubjects)

      const transformedSubjects: Subject[] = rawSubjects.map((subject) => {
        const facultyShortNames = generateFacultyShortNames(subject.facultyNames)
        return {
          ...subject,
          shortName: shortNameMap.get(subject.id) || subject.name.charAt(0).toUpperCase(),
          facultyShortNames,
        }
      })

      setSubjects(transformedSubjects)
    } catch (error) {
      console.error("Error loading subjects for section:", error)
      toast({
        title: "Error",
        description: "Failed to load subjects for the selected section.",
        variant: "destructive",
      })
    }
  }

  // Load saved timetables from database
  const loadSavedTimetables = async () => {
    try {
      const { data: timetablesData, error } = await apiService.timetables.getAllTimetables()
      if (error) {
        console.error("Error loading saved timetables:", error)
        return
      }

      const transformedTimetables = (timetablesData || []).map((dbTimetable) => {
        const migratedCells = (dbTimetable.data?.cells || []).map((cell: any) => ensureClassEntries(cell))

        return {
          id: dbTimetable.id,
          academicYear: dbTimetable.academic_year,
          semester: dbTimetable.semester.toString(),
          section: dbTimetable.section,
          roomNumber: dbTimetable.data?.roomNumber || "",
          timeSlots,
          days,
          cells: migratedCells,
        }
      })

      setSavedTimetables(transformedTimetables)
    } catch (error) {
      console.error("Error loading saved timetables:", error)
    }
  }

  // Generate empty timetable cells
  const generateEmptyTimetable = (): TimetableData => {
    const cells: TimetableCell[] = []

    days.forEach((day) => {
      timeSlots.forEach((timeSlot) => {
        const cellId = `${day}-${timeSlot.id}`
        cells.push({
          id: cellId,
          day,
          timeSlotId: timeSlot.id,
          classEntries: [],
          isBreak: timeSlot.isBreak,
          breakType: timeSlot.breakType,
        })
      })
    })

    return {
      id: `timetable-${Date.now()}`,
      academicYear,
      semester,
      section,
      roomNumber,
      timeSlots,
      days,
      cells,
    }
  }

  // Handle timetable generation
  const handleGenerateTimetable = async () => {
    if (!academicYear || !semester || !section || !roomNumber) {
      toast({
        title: "Missing information",
        description: "Please select academic year, semester, section, and enter room number.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data: existingTimetable, error: loadError } = await apiService.timetables.loadTimetable(
        academicYear,
        Number(semester),
        section,
      )

      let newTimetable: TimetableData

      if (existingTimetable && !loadError) {
        const migratedCells = (existingTimetable.data?.cells || []).map((cell: any) => ensureClassEntries(cell))

        newTimetable = {
          id: existingTimetable.id,
          academicYear: existingTimetable.academic_year,
          semester: existingTimetable.semester.toString(),
          section: existingTimetable.section,
          roomNumber: existingTimetable.data?.roomNumber || roomNumber,
          timeSlots,
          days,
          cells: migratedCells,
        }

        toast({
          title: "Existing timetable loaded",
          description: `Loaded existing timetable for Semester ${semester}, Section ${section}.`,
        })
      } else {
        newTimetable = generateEmptyTimetable()

        toast({
          title: "New timetable generated",
          description: `New timetable for Semester ${semester}, Section ${section} has been generated.`,
        })
      }

      setTimetableData(newTimetable)
      setTimetableGenerated(true)
    } catch (error) {
      console.error("Error generating/loading timetable:", error)
      toast({
        title: "Error",
        description: "Failed to generate or load timetable.",
        variant: "destructive",
      })
    }
  }

  // Handle cell click
  const handleCellClick = (cell: TimetableCell, classIndex?: number, addAnother?: boolean) => {
    if (cell.isBreak) return

    console.log("Cell clicked:", { cell, classIndex, addAnother }) // Debug log

    setSelectedCell(cell)

    const classEntries = cell.classEntries || []

    // Reset form first
    setSelectedSubject("")
    setSelectedLab("")
    setSelectedBatch("")
    setAvailableBatches([])
    setBatchSpecificFaculty({ names: [], shortNames: [] }) // NEW: Reset batch-specific faculty

    if (addAnother) {
      // Check if we can add another class - only allow if existing classes are labs
      const hasTheoryClasses = classEntries.some((entry) => entry.componentType === "theory")
      if (hasTheoryClasses) {
        toast({
          title: "Cannot add multiple classes",
          description: "Theory classes cannot be merged with other classes in the same time slot.",
          variant: "destructive",
        })
        return
      }

      setIsEditing(false)
      setEditingClassIndex(-1)
      setIsAddingMultiple(true)
    } else if (typeof classIndex === "number" && classIndex >= 0 && classIndex < classEntries.length) {
      // Edit specific class - FIXED: Direct assignment approach
      const classToEdit = classEntries[classIndex]
      console.log("Editing specific class:", classToEdit) // Debug log

      setIsEditing(true)
      setEditingClassIndex(classIndex)
      setIsAddingMultiple(false)

      // Use setTimeout to ensure state updates after dialog opens
      setTimeout(() => {
        setSelectedSubject(classToEdit.subjectId)
        setSelectedLab(classToEdit.lab || "")
        setSelectedBatch(classToEdit.batch || "")

        // Set available batches for this subject
        const subject = subjects.find((s) => s.id === classToEdit.subjectId)
        if (subject && subject.componentType === "lab" && subject.batches) {
          setAvailableBatches(subject.batches)
        }
      }, 100)
    } else if (classEntries.length === 1) {
      // Edit single class - FIXED: Direct assignment approach
      const singleClass = classEntries[0]
      console.log("Editing single class:", singleClass) // Debug log

      setIsEditing(true)
      setEditingClassIndex(0)
      setIsAddingMultiple(false)

      // Use setTimeout to ensure state updates after dialog opens
      setTimeout(() => {
        setSelectedSubject(singleClass.subjectId)
        setSelectedLab(singleClass.lab || "")
        setSelectedBatch(singleClass.batch || "")

        // Set available batches for this subject
        const subject = subjects.find((s) => s.id === singleClass.subjectId)
        if (subject && subject.componentType === "lab" && subject.batches) {
          setAvailableBatches(subject.batches)
        }
      }, 100)
    } else {
      // Add new class
      setIsEditing(false)
      setEditingClassIndex(-1)
      setIsAddingMultiple(false)
    }

    setIsSubjectDialogOpen(true)
  }

  // Handle subject assignment
  const handleAssignSubject = () => {
    if (!selectedCell) return

    if (!selectedSubject) {
      if (isEditing && editingClassIndex >= 0) {
        const updatedCells =
          timetableData?.cells.map((cell) => {
            if (cell.id === selectedCell.id) {
              const newEntries = (cell.classEntries || []).filter((_, index) => index !== editingClassIndex)
              return { ...cell, classEntries: newEntries }
            }
            return cell
          }) || []

        setTimetableData((prev) => (prev ? { ...prev, cells: updatedCells } : null))
      }
      setIsSubjectDialogOpen(false)
      return
    }

    const subject = subjects.find((s) => s.id === selectedSubject)
    if (!subject) return

    // Validation for lab subjects
    if (subject.componentType === "lab") {
      if (!selectedLab.trim()) {
        toast({
          title: "Lab required",
          description: "Please enter the lab information for lab subjects.",
          variant: "destructive",
        })
        return
      }
      if (!selectedBatch) {
        toast({
          title: "Batch required",
          description: "Please select a batch for lab subjects.",
          variant: "destructive",
        })
        return
      }
    }

    // ENHANCED: Check merging restrictions more strictly
    const currentEntries = selectedCell.classEntries || []
    if (!isEditing && currentEntries.length > 0) {
      const hasTheoryClasses = currentEntries.some((entry) => entry.componentType === "theory")
      const isAddingTheory = subject.componentType === "theory"

      if (hasTheoryClasses || isAddingTheory) {
        toast({
          title: "Cannot merge classes",
          description: "Theory classes cannot be merged with other classes. Only lab classes can be merged together.",
          variant: "destructive",
        })
        return
      }
    }

    // ENHANCED: Also check when editing - theory classes should remain single
    if (isEditing && subject.componentType === "theory" && currentEntries.length > 1) {
      toast({
        title: "Cannot change to theory",
        description: "Cannot change to theory class when multiple classes exist in this slot.",
        variant: "destructive",
      })
      return
    }

    // NEW: Use batch-specific faculty for lab subjects
    let facultyNames = subject.facultyNames
    let facultyShortNames = subject.facultyShortNames

    if (subject.componentType === "lab" && selectedBatch && batchSpecificFaculty.names.length > 0) {
      facultyNames = batchSpecificFaculty.names
      facultyShortNames = batchSpecificFaculty.shortNames
    }

    const classEntry: ClassEntry = {
      id: `class-${Date.now()}`,
      subjectId: subject.id,
      subjectCode: subject.code,
      subjectName: subject.name,
      shortName: subject.shortName,
      componentType: subject.componentType,
      facultyNames: facultyNames,
      facultyShortNames: facultyShortNames,
      lab: subject.componentType === "lab" ? selectedLab : undefined,
      batch: subject.componentType === "lab" ? selectedBatch : undefined,
      color: getSubjectColor(subject.code), // Use subject code for consistent coloring
      hasTheory: subject.hasTheory,
      hasLab: subject.hasLab,
    }

    const updatedCells =
      timetableData?.cells.map((cell) => {
        if (cell.id === selectedCell.id) {
          const currentEntries = cell.classEntries || []
          if (isEditing && editingClassIndex >= 0) {
            const newEntries = [...currentEntries]
            newEntries[editingClassIndex] = classEntry
            return { ...cell, classEntries: newEntries }
          } else {
            return { ...cell, classEntries: [...currentEntries, classEntry] }
          }
        }
        return cell
      }) || []

    setTimetableData((prev) => (prev ? { ...prev, cells: updatedCells } : null))
    setIsSubjectDialogOpen(false)

    const actionText = isEditing ? "updated" : isAddingMultiple ? "added" : "assigned"
    toast({
      title: `Class ${actionText}`,
      description: `${subject.code} - ${subject.name} (${subject.componentType}) has been ${actionText} to ${selectedCell.day} at ${getTimeSlotText(selectedCell.timeSlotId)}.`,
    })
  }

  // Handle drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination || !timetableData) return

    const { source, destination } = result

    // Parse draggable ID to get source info
    const dragId = result.draggableId
    const [sourceCellId, sourceClassIndex] = dragId.split("-class-")

    // Parse destination droppable ID
    const destCellId = destination.droppableId.replace("-container", "")

    const sourceCell = timetableData.cells.find((cell) => cell.id === sourceCellId)
    const destCell = timetableData.cells.find((cell) => cell.id === destCellId)

    if (!sourceCell || !destCell || destCell.isBreak) return

    const classToMove = (sourceCell.classEntries || [])[Number.parseInt(sourceClassIndex)]
    if (!classToMove) return

    // ENHANCED: Check drag restrictions
    const destEntries = destCell.classEntries || []
    const hasTheoryInDest = destEntries.some((entry) => entry.componentType === "theory")
    const isMovingTheory = classToMove.componentType === "theory"

    if (hasTheoryInDest || (isMovingTheory && destEntries.length > 0)) {
      toast({
        title: "Cannot move class",
        description: "Theory classes cannot be merged with other classes.",
        variant: "destructive",
      })
      return
    }

    // Create updated cells array
    const updatedCells = timetableData.cells.map((cell) => {
      if (cell.id === sourceCellId) {
        // Remove class from source cell
        const newEntries = (cell.classEntries || []).filter((_, index) => index !== Number.parseInt(sourceClassIndex))
        return { ...cell, classEntries: newEntries }
      }
      if (cell.id === destCellId) {
        // Add class to destination cell
        const currentEntries = cell.classEntries || []
        return { ...cell, classEntries: [...currentEntries, classToMove] }
      }
      return cell
    })

    setTimetableData({ ...timetableData, cells: updatedCells })

    toast({
      title: "Class moved",
      description: `${classToMove.subjectCode} has been moved from ${sourceCell.day} to ${destCell.day}.`,
    })
  }

  // Get time slot text
  const getTimeSlotText = (timeSlotId: string): string => {
    const timeSlot = timeSlots.find((slot) => slot.id === timeSlotId)
    return timeSlot ? `${timeSlot.start} - ${timeSlot.end}` : ""
  }

  // Save timetable to database
  const handleSaveTimetable = async () => {
    if (!timetableData) return

    setIsSaving(true)

    try {
      const { data, error } = await apiService.timetables.saveTimetable({
        academic_year: timetableData.academicYear,
        semester: Number(timetableData.semester),
        section: timetableData.section,
        data: {
          cells: timetableData.cells,
          timeSlots: timetableData.timeSlots,
          days: timetableData.days,
          roomNumber: timetableData.roomNumber,
        },
      })

      if (error) {
        throw error
      }

      if (data) {
        setTimetableData((prev) => (prev ? { ...prev, id: data.id } : null))
      }

      await loadSavedTimetables()

      toast({
        title: "Timetable saved",
        description: `Timetable for Semester ${timetableData.semester}, Section ${timetableData.section} has been saved to database.`,
      })
    } catch (error) {
      console.error("Error saving timetable:", error)
      toast({
        title: "Save failed",
        description: "There was an error saving the timetable to database.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Load timetable
  const handleLoadTimetable = (timetableId: string) => {
    const timetable = savedTimetables.find((t) => t.id === timetableId)
    if (!timetable) return

    setAcademicYear(timetable.academicYear)
    setSemester(timetable.semester)
    setSection(timetable.section)
    setRoomNumber(timetable.roomNumber)
    setTimetableData(timetable)
    setTimetableGenerated(true)
    setIsLoadDialogOpen(false)

    toast({
      title: "Timetable loaded",
      description: `Timetable for Semester ${timetable.semester}, Section ${timetable.section} has been loaded.`,
    })
  }

  // Delete timetable
  const handleDeleteTimetable = async () => {
    if (!timetableToDelete) return

    try {
      const { error } = await apiService.timetables.deleteTimetable(timetableToDelete)

      if (error) {
        throw error
      }

      const updatedTimetables = savedTimetables.filter((t) => t.id !== timetableToDelete)
      setSavedTimetables(updatedTimetables)

      setIsDeleteDialogOpen(false)
      setTimetableToDelete(null)

      toast({
        title: "Timetable deleted",
        description: "The selected timetable has been deleted from database.",
      })
    } catch (error) {
      console.error("Error deleting timetable:", error)
      toast({
        title: "Delete failed",
        description: "There was an error deleting the timetable from database.",
        variant: "destructive",
      })
    }
  }

  // Export timetable as JSON
  const handleExportTimetable = () => {
    if (!timetableData) return

    const dataStr = JSON.stringify(timetableData, null, 2)
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

    const exportFileDefaultName = `timetable-semester-${timetableData.semester}-section-${timetableData.section}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()

    toast({
      title: "Timetable exported",
      description: "The timetable has been exported as a JSON file.",
    })
  }

  // Clear timetable
  const handleClearTimetable = () => {
    if (!timetableData) return

    const emptyTimetable = generateEmptyTimetable()
    setTimetableData(emptyTimetable)

    toast({
      title: "Timetable cleared",
      description: "All classes have been removed from the timetable.",
    })
  }

  // Get selected subject details
  const getSelectedSubjectDetails = () => {
    if (!selectedSubject) return null
    return subjects.find((s) => s.id === selectedSubject)
  }

  // Remove individual class
  const handleRemoveClass = (cellId: string, classIndex: number) => {
    if (!timetableData) return

    const updatedCells = timetableData.cells.map((cell) => {
      if (cell.id === cellId) {
        const newEntries = (cell.classEntries || []).filter((_, index) => index !== classIndex)
        return { ...cell, classEntries: newEntries }
      }
      return cell
    })

    setTimetableData({ ...timetableData, cells: updatedCells })

    toast({
      title: "Class removed",
      description: "The class has been removed from this time slot.",
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Timetable</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Timetable</h1>
        <p className="text-muted-foreground">
          Generate and manage class timetables for different semesters and sections.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timetable Configuration</CardTitle>
          <CardDescription>
            Select the academic year, semester, section, and room number to generate a timetable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="academic-year">Academic Year</Label>
              <Select
                value={academicYear}
                onValueChange={(value) => {
                  setAcademicYear(value)
                  setSemester("")
                  setSection("")
                  setAvailableSections([])
                }}
              >
                <SelectTrigger id="academic-year">
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {getAcademicYearOptions().map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Select
                value={semester}
                onValueChange={(value) => {
                  setSemester(value)
                  setSection("")
                  setAvailableSections([])
                }}
                disabled={!academicYear}
              >
                <SelectTrigger id="semester">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {getSemesterOptions(academicYear).map((sem) => (
                    <SelectItem key={sem} value={sem.toString()}>
                      Semester {sem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Select value={section} onValueChange={setSection} disabled={!semester || availableSections.length === 0}>
                <SelectTrigger id="section">
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {availableSections.map((sec) => (
                    <SelectItem key={sec} value={sec}>
                      Section {sec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="room-number">Room No.</Label>
              <Input
                id="room-number"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Enter room number"
                disabled={!section}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleGenerateTimetable}>
              <Calendar className="mr-2 h-4 w-4" />
              Generate Timetable
            </Button>

            <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Load Saved Timetable
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Load Saved Timetable</DialogTitle>
                  <DialogDescription>Select a previously saved timetable to load.</DialogDescription>
                </DialogHeader>
                <div className="max-h-[400px] overflow-y-auto">
                  {savedTimetables.length > 0 ? (
                    <div className="space-y-2">
                      {savedTimetables.map((timetable) => (
                        <div
                          key={timetable.id}
                          className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleLoadTimetable(timetable.id)}
                        >
                          <div>
                            <p className="font-medium">
                              Semester {timetable.semester} - Section {timetable.section}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {timetable.academicYear} • Room: {timetable.roomNumber}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation()
                                setTimetableToDelete(timetable.id)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">No saved timetables found.</p>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsLoadDialogOpen(false)}>
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {timetableGenerated && (
              <>
                <Button variant="outline" onClick={handleSaveTimetable} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Saving..." : "Save Timetable"}
                </Button>

                <Button variant="outline" onClick={handleExportTimetable}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Timetable
                </Button>

                <Button variant="outline" onClick={handleClearTimetable}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Clear Timetable
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {timetableGenerated && timetableData && (
        <Card>
          <CardHeader>
            <CardTitle>
              Semester {timetableData.semester} - Section {timetableData.section} Timetable
            </CardTitle>
            <CardDescription>
              {timetableData.academicYear} • Room: {timetableData.roomNumber} • Click on a cell to assign a subject or
              drag and drop to move classes. Only lab classes can be merged in the same time slot.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <DragDropContext onDragEnd={handleDragEnd}>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-muted/50 font-medium text-left min-w-[80px]">Time</th>
                      {timetableData.timeSlots.map((slot) => (
                        <th key={slot.id} className="border p-2 bg-muted/50 font-medium text-center min-w-[120px]">
                          {slot.isBreak ? (
                            <div className="flex flex-col items-center">
                              <span>
                                {slot.start} - {slot.end}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {slot.breakType === "coffee" ? "COFFEE BREAK" : "LUNCH BREAK"}
                              </span>
                            </div>
                          ) : (
                            `${slot.start} - ${slot.end}`
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timetableData.days.map((day) => (
                      <tr key={day}>
                        <td className="border p-2 bg-muted/30 font-medium">{day}</td>
                        {timetableData.timeSlots.map((slot) => {
                          const cell = timetableData.cells.find((c) => c.day === day && c.timeSlotId === slot.id)

                          if (!cell) return null

                          if (cell.isBreak) {
                            return (
                              <td key={cell.id} className="border p-2 bg-gray-100 dark:bg-gray-800 text-center">
                                <div className="flex flex-col items-center justify-center h-full">
                                  {cell.breakType === "coffee" ? (
                                    <>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="mx-auto mb-1 text-muted-foreground"
                                      >
                                        <path d="M17 8h1a4 4 0 1 1 0 8h-1"></path>
                                        <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path>
                                        <line x1="6" x2="6" y1="2" y2="4"></line>
                                        <line x1="10" x2="10" y1="2" y2="4"></line>
                                        <line x1="14" x2="14" y1="2" y2="4"></line>
                                      </svg>
                                      <span className="text-xs text-muted-foreground">
                                        COFFEE
                                        <br />
                                        BREAK
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="mx-auto mb-1 text-muted-foreground"
                                      >
                                        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                                        <path d="M7 2v20"></path>
                                        <path d="M21 15V2"></path>
                                        <path d="M18 15a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path>
                                        <path d="M18 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"></path>
                                      </svg>
                                      <span className="text-xs text-muted-foreground">
                                        LUNCH
                                        <br />
                                        BREAK
                                      </span>
                                    </>
                                  )}
                                </div>
                              </td>
                            )
                          }

                          const classEntries = cell.classEntries || []

                          return (
                            <Droppable droppableId={`${cell.id}-container`} key={cell.id}>
                              {(provided, snapshot) => (
                                <td
                                  ref={provided.innerRef}
                                  {...provided.droppableProps}
                                  className={`border p-0 relative min-h-[100px] cursor-pointer hover:bg-muted/20 group ${
                                    snapshot.isDraggingOver ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300" : ""
                                  }`}
                                  onClick={() => handleCellClick(cell)}
                                >
                                  {classEntries.length > 0 ? (
                                    <div className="relative">
                                      <div className="flex h-[100px] m-1 gap-0.5">
                                        {classEntries.map((classEntry, index) => {
                                          const classWidth = `${100 / classEntries.length}%`
                                          const isCompact = classEntries.length >= 3
                                          const isVeryCompact = classEntries.length >= 4

                                          return (
                                            <Draggable
                                              key={`${classEntry.id}-${index}`}
                                              draggableId={`${cell.id}-class-${index}`}
                                              index={index}
                                            >
                                              {(provided, snapshot) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  {...provided.dragHandleProps}
                                                  className={`text-white rounded-md flex flex-col justify-between relative overflow-hidden ${
                                                    snapshot.isDragging ? "rotate-3 shadow-lg z-50" : ""
                                                  }`}
                                                  style={{
                                                    backgroundColor: classEntry.color, // Use the assigned color
                                                    width: classWidth,
                                                    minWidth: isVeryCompact ? "50px" : isCompact ? "60px" : "80px",
                                                    ...provided.draggableProps.style,
                                                  }}
                                                >
                                                  {/* Vertical divider */}
                                                  {index < classEntries.length - 1 && (
                                                    <div className="absolute right-0 top-1 bottom-1 w-px bg-white/40"></div>
                                                  )}

                                                  <div
                                                    className={`flex flex-col ${isVeryCompact ? "p-1" : isCompact ? "p-1.5" : "p-2"}`}
                                                  >
                                                    {/* Course short name with batch for labs */}
                                                    <span
                                                      className={`font-bold leading-tight ${
                                                        isVeryCompact
                                                          ? "text-[10px]"
                                                          : isCompact
                                                            ? "text-xs"
                                                            : classEntries.length > 2
                                                              ? "text-sm"
                                                              : "text-lg"
                                                      }`}
                                                    >
                                                      {classEntry.componentType === "lab" && classEntry.batch
                                                        ? `${classEntry.batch} ${classEntry.shortName}`
                                                        : classEntry.shortName}
                                                    </span>

                                                    {/* Faculty short names */}
                                                    <span
                                                      className={`${
                                                        isVeryCompact
                                                          ? "text-[7px]"
                                                          : isCompact
                                                            ? "text-[8px]"
                                                            : "text-xs"
                                                      } opacity-90 leading-tight`}
                                                    >
                                                      (
                                                      {(classEntry.facultyShortNames &&
                                                      classEntry.facultyShortNames.length > 0
                                                        ? classEntry.facultyShortNames
                                                        : generateFacultyShortNames(classEntry.facultyNames || [])
                                                      ).join("/")}
                                                      )
                                                    </span>

                                                    {/* Lab location if it's a lab subject */}
                                                    {classEntry.lab && !isCompact && (
                                                      <span className="text-xs mt-1 opacity-90 leading-tight truncate">
                                                        {classEntry.lab}
                                                      </span>
                                                    )}
                                                  </div>

                                                  {/* Individual class controls */}
                                                  <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      className="h-5 w-5 bg-white/20 hover:bg-white/30 text-white"
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleCellClick(cell, index)
                                                      }}
                                                    >
                                                      <Edit className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      className="h-5 w-5 bg-red-500/80 hover:bg-red-500 text-white"
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleRemoveClass(cell.id, index)
                                                      }}
                                                    >
                                                      <X className="h-3 w-3" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              )}
                                            </Draggable>
                                          )
                                        })}
                                      </div>

                                      {/* Add another class button for lab subjects only */}
                                      {classEntries.every((entry) => entry.componentType === "lab") && (
                                        <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 bg-green-500/80 hover:bg-green-500 text-white"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleCellClick(cell, undefined, true)
                                            }}
                                          >
                                            <Plus className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="h-[100px] flex items-center justify-center text-muted-foreground">
                                      <Plus className="h-6 w-6" />
                                    </div>
                                  )}
                                  {provided.placeholder}
                                </td>
                              )}
                            </Droppable>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DragDropContext>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject Assignment Dialog */}
      <Dialog open={isSubjectDialogOpen} onOpenChange={setIsSubjectDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Class</DialogTitle>
            <DialogDescription>Assign a subject and details to this time slot.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={selectedSubject}
                onValueChange={(value) => {
                  setSelectedSubject(value)
                  setSelectedLab("")
                  setSelectedBatch("")
                  setBatchSpecificFaculty({ names: [], shortNames: [] }) // NEW: Reset batch-specific faculty
                }}
              >
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name} ({subject.componentType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* MODIFIED: Show faculty only for theory subjects or when batch is selected for lab subjects */}
            {selectedSubject && (
              <div className="space-y-2">
                <Label>Assigned Faculty</Label>
                <div className="p-3 bg-muted rounded-md">
                  {(() => {
                    const subject = getSelectedSubjectDetails()
                    if (!subject) return <span className="text-muted-foreground">No subject selected</span>

                    // For theory subjects, show faculty immediately
                    if (subject.componentType === "theory") {
                      return (
                        <span className="text-sm">
                          {subject.facultyNames.length > 0 ? subject.facultyNames.join(", ") : "No faculty assigned"}
                        </span>
                      )
                    }

                    // For lab subjects, show faculty only after batch is selected
                    if (subject.componentType === "lab") {
                      if (!selectedBatch) {
                        return <span className="text-muted-foreground">Please select a batch first</span>
                      }

                      if (batchSpecificFaculty.names.length > 0) {
                        return <span className="text-sm">{batchSpecificFaculty.names.join(", ")}</span>
                      }

                      return <span className="text-muted-foreground">No faculty assigned for this batch</span>
                    }

                    return <span className="text-muted-foreground">Unknown subject type</span>
                  })()}
                </div>
              </div>
            )}

            {/* Lab input - only show for lab subjects */}
            {selectedSubject && getSelectedSubjectDetails()?.componentType === "lab" && (
              <div className="space-y-2">
                <Label htmlFor="lab">Lab</Label>
                <Input
                  id="lab"
                  value={selectedLab}
                  onChange={(e) => setSelectedLab(e.target.value)}
                  placeholder="Enter lab information"
                />
              </div>
            )}

            {/* Batch selection - only show for lab subjects */}
            {selectedSubject && getSelectedSubjectDetails()?.componentType === "lab" && (
              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
                <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                  <SelectTrigger id="batch">
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBatches.map((batch) => (
                      <SelectItem key={batch} value={batch}>
                        Batch {batch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubjectDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignSubject}>{isEditing ? "Update" : "Assign"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Timetable</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this timetable? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTimetable}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
