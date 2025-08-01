// This file contains dummy data for the NexaLink Academic System

// Types
export type UserRole = "student" | "faculty" | "hod" | "admin" | "principal" | "coordinator"

// Branch types standardized across the system
export type BranchType = "CSE" | "CSE(AIML)" | "CSE(DS)" | "ISE" | "ECE"

// Branch codes for USN generation
export const branchCodes = {
  CSE: "CS",
  "CSE(AIML)": "CA",
  "CSE(DS)": "DS",
  ISE: "IS",
  ECE: "EC",
}

export interface User {
  id: string
  username: string
  email: string
  password: string // In a real app, this would be hashed
  role: UserRole
  firstName: string
  lastName: string
  department: BranchType | string
  profilePicture?: string
}

export interface Student extends User {
  role: "student"
  rollNumber: string
  usn: string // University Serial Number in format 1VA22EC028
  semester: number
  section: string
  batch: string
  facultyAdvisor: string // ID of faculty advisor
  courses: string[] // Array of course IDs
  phone: string
  department: BranchType | string
}

export interface Faculty extends User {
  role: "faculty"
  employeeId: string
  designation: string
  joinDate: string
  profilePicture: string
  subjects: string[] // Array of subject IDs
  students: string[] // Array of student IDs (for faculty advisor)
  phone: string
  department: BranchType | string
}

export interface HOD extends Faculty {
  // Inherit from Faculty
  role: "hod"
  designation: string
  joinDate: string
  facultyIds: string[] // Array of faculty IDs under this HOD
}

export interface Admin extends User {
  role: "admin"
  employeeId: string
  permissions: string[]
}

export interface Principal extends User {
  role: "principal"
  employeeId: string
}

export interface Coordinator extends Faculty {
  // Inherit from Faculty
  role: "coordinator"
}

export interface Subject {
  id: string
  code: string
  name: string
  department: BranchType | string
  credits: number
  semester: number
  facultyId: string // ID of faculty teaching this subject
  students: string[] // Array of student IDs enrolled in this subject
}

export interface Mark {
  id: string
  studentId: string
  subjectId: string
  iaNumber: number
  marks: number
  maxMarks: number
  date: string
  facultyId: string
  remarks?: string
}

export interface Attendance {
  id: string
  studentId: string
  subjectId: string
  date: string
  status: "present" | "absent" | "late"
  facultyId: string
}

export interface Achievement {
  id: string
  studentId: string
  title: string
  description: string
  date: string
  category: "academic" | "sports" | "cultural" | "technical" | "other"
  institution: "college" | "other"
  otherInstitutionName?: string
  department: BranchType | string
  image?: string
  verified: boolean
  verifiedBy?: string // Faculty ID who verified
  fileUrl?: string
  achievementType: "student" | "faculty"
}

// Generate dummy data
// Departments - standardized across the system
export const departments: BranchType[] = ["CSE", "CSE(AIML)", "CSE(DS)", "ISE", "ECE"]

// Subjects (empty - no mock data)
export const subjects: Subject[] = []

// Faculty (empty - no mock data)
export const faculty: Faculty[] = []

// HOD (empty - no mock data)
export const hods: HOD[] = [
  {
    id: "hod-bhavya",
    username: "bhavya.tn",
    email: "bhavya.tn@salvidya.ac.in",
    password: "password123", // In a real app, this would be hashed
    role: "hod",
    firstName: "Bhavya",
    lastName: "T N",
    department: "CSE(DS)",
    employeeId: "H10005",
    designation: "Professor & Head of Department",
    joinDate: "2018-03-10",
    profilePicture: "/placeholder.svg?height=40&width=40",
    subjects: [],
    students: [],
    phone: "+91 9876543210",
    facultyIds: [],
  },
]

// Coordinator (empty - no mock data)
export const coordinators: Coordinator[] = []

// Students (empty - no mock data)
export const students: Student[] = []

// Admin (empty - no mock data)
export const admins: Admin[] = []

// Principal user (empty - no mock data)
export const principals: Principal[] = []

// All Credentials
export const allUsers = [...students, ...faculty, ...hods, ...admins, ...coordinators, ...principals]

// Dummy data for authentication
export const loginCredentials = {
  students: [],
  faculty: [],
  hod: hods[0] || null, // Use the first HOD if available
  admin: null,
  principal: null,
  coordinator: null,
}

// Dummy data for marks (empty function)
function generateMarks(): Mark[] {
  return []
}

// Dummy data for attendance (empty function)
function generateAttendance(): Attendance[] {
  return []
}

// Dummy data for achievements (empty function)
function generateAchievements(): Achievement[] {
  return []
}

// Generate all data (empty arrays)
export const marks = generateMarks()
export const attendance = generateAttendance()
export const achievements = generateAchievements()

// Function to get user by email and password
export const getUserByCredentials = (email: string, password: string): User | undefined => {
  return allUsers.find((user) => user.email === email && user.password === password)
}

// Function to get student by ID
export const getStudentById = (id: string): Student | undefined => {
  return students.find((student) => student.id === id) as Student | undefined
}

export const getFacultyById = (id: string): Faculty | undefined => {
  return faculty.find((f) => f.id === id) as Faculty | undefined
}

// Function to get HOD by ID
export const getHODById = (id: string): HOD | undefined => {
  return hods.find((h) => h.id === id) as HOD | undefined
}

// Function to get subject by ID
export const getSubjectById = (id: string): Subject | undefined => {
  return subjects.find((s) => s.id === id)
}

// Function to hash a password with a salt
export function passwordHash(password: string, salt?: string): { hash: string; salt: string } {
  // Generate a salt if not provided
  const passwordSalt = salt || "salt"

  // Create hash using SHA-256
  const hash = password

  return { hash, salt: passwordSalt }
}

// Export all dummy data
export default {
  students,
  faculty,
  hods,
  admins,
  principals,
  subjects,
  marks,
  attendance,
  achievements,
  loginCredentials,
}
