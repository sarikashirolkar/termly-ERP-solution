import bcrypt from "bcryptjs"
import { supabase } from "./supabase"
import { parse } from "csv-parse/sync" // Ensure this import is present

export interface ImportResult {
  success: boolean
  totalRecords: number
  successfulImports: number
  failedImports: number
  errors: string[]
  importedUsers?: any[]
}

export interface StudentCSVRow {
  name: string
  email: string
  password: string
  usn: string
  phone: string
  department: string
  semester: string
  section: string
  batch: string
  father_name?: string
  father_phone?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  country?: string
  blood_group?: string
  admission_date?: string // Added for completeness
}

export interface FacultyCSVRow {
  name: string
  email: string
  password: string
  phone: string
  department: string
  designation: string
  employee_id: string
  join_date: string
  specialization?: string
  qualification?: string
  experience_years?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  country?: string
}

export interface HODCSVRow {
  name: string
  email: string
  password: string
  phone: string
  department: string
  employee_id: string
  join_date: string
  designation: string
  qualification?: string
  experience_years?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  country?: string
}

export interface CoordinatorCSVRow {
  name: string
  email: string
  password: string
  phone: string
  department: string
  employee_id: string
  join_date: string
  designation: string
  qualification?: string
  experience_years?: string
  address?: string
  city?: string
  state?: string
  pincode?: string
  country?: string
}

export interface CourseCSVRow {
  course_code: string
  name: string
  department: string
  credits: string
  semester: string
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  return { hash, salt }
}

export function parseCSV(csvContent: string): string[][] {
  // Using csv-parse/sync for more robust CSV parsing
  return parse(csvContent, {
    columns: false, // Do not auto-detect columns, we'll handle headers manually
    skip_empty_lines: true,
    trim: true,
  })
}

export function validateStudentRow(
  row: string[],
  headers: string[],
): { isValid: boolean; errors: string[]; data?: StudentCSVRow } {
  const errors: string[] = []
  const data: any = {}

  // Map CSV columns to data object
  headers.forEach((header, index) => {
    data[header.toLowerCase().replace(/\s+/g, "_")] = row[index] || ""
  })

  // Validate required fields
  if (!data.name || data.name.trim() === "") {
    errors.push("Name is required")
  }

  if (!data.email || data.email.trim() === "") {
    errors.push("Email is required")
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Invalid email format")
  }

  if (!data.password || data.password.trim() === "") {
    errors.push("Password is required")
  }

  if (!data.usn || data.usn.trim() === "") {
    errors.push("USN is required")
  }

  if (!data.department || data.department.trim() === "") {
    errors.push("Department is required")
  }

  if (!data.semester || isNaN(Number.parseInt(data.semester))) {
    errors.push("Valid semester (number) is required")
  }

  if (!data.section || data.section.trim() === "") {
    errors.push("Section is required")
  }

  if (!data.batch || data.batch.trim() === "") {
    errors.push("Batch is required")
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? (data as StudentCSVRow) : undefined,
  }
}

export function validateFacultyRow(
  row: string[],
  headers: string[],
): { isValid: boolean; errors: string[]; data?: FacultyCSVRow } {
  const errors: string[] = []
  const data: any = {}

  // Map CSV columns to data object
  headers.forEach((header, index) => {
    data[header.toLowerCase().replace(/\s+/g, "_")] = row[index] || ""
  })

  // Validate required fields
  if (!data.name || data.name.trim() === "") {
    errors.push("Name is required")
  }

  if (!data.email || data.email.trim() === "") {
    errors.push("Email is required")
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Invalid email format")
  }

  if (!data.password || data.password.trim() === "") {
    errors.push("Password is required")
  }

  if (!data.employee_id || data.employee_id.trim() === "") {
    errors.push("Employee ID is required")
  }

  if (!data.department || data.department.trim() === "") {
    errors.push("Department is required")
  }

  if (!data.designation || data.designation.trim() === "") {
    errors.push("Designation is required")
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? (data as FacultyCSVRow) : undefined,
  }
}

export function validateCourseRow(
  row: string[],
  headers: string[],
): { isValid: boolean; errors: string[]; data?: CourseCSVRow } {
  const errors: string[] = []
  const data: any = {}

  // Create a mapping object for the row data
  headers.forEach((header, index) => {
    const cleanHeader = header.toLowerCase().replace(/\s+/g, "_")
    data[cleanHeader] = row[index] ? row[index].trim() : ""
  })

  // Check for course_code in various possible header formats
  const courseCode = data.course_code || data.coursecode || data["course code"] || data.code || ""
  const courseName = data.name || data.course_name || data.coursename || data["course name"] || ""
  const department = data.department || data.dept || ""
  const credits = data.credits || data.credit || ""
  const semester = data.semester || data.sem || ""

  if (!courseCode || courseCode.trim() === "") {
    errors.push("Course Code is required")
  }
  if (!courseName || courseName.trim() === "") {
    errors.push("Name is required")
  }
  if (!department || department.trim() === "") {
    errors.push("Department is required")
  }
  if (!credits || isNaN(Number.parseInt(credits))) {
    errors.push("Valid Credits (number) is required")
  }
  if (!semester || isNaN(Number.parseInt(semester))) {
    errors.push("Valid Semester (number) is required")
  }

  // Return the normalized data
  const normalizedData = {
    course_code: courseCode,
    name: courseName,
    department: department,
    credits: credits,
    semester: semester,
  }

  return {
    isValid: errors.length === 0,
    errors,
    data: errors.length === 0 ? (normalizedData as CourseCSVRow) : undefined,
  }
}

export class CSVImportService {
  static departmentMap: Map<string, string> | null = null // Map: long_name.toLowerCase() -> short_name
  static shortNameMap: Map<string, string> | null = null // Map: short_name.toLowerCase() -> long_name
  static departmentMapsInitialized = false

  static async initializeDepartmentMaps() {
    if (CSVImportService.departmentMapsInitialized) {
      return // Already initialized
    }

    try {
      const response = await fetch("/api/departments")
      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Failed to fetch departments: ${response.status} ${response.statusText}. Response: ${errorText}`)
        throw new Error(
          `Failed to fetch departments: ${response.statusText}. Raw response: ${errorText.substring(0, 100)}...`,
        )
      }

      const result = await response.json()
      console.log("Departments API response:", result)

      let departments: any[] = []

      if (Array.isArray(result)) {
        departments = result
      } else if (result.departments && Array.isArray(result.departments)) {
        departments = result.departments
      } else {
        console.warn("Unexpected departments response structure:", result)
        departments = []
      }

      if (!Array.isArray(departments)) {
        console.error("Departments is not an array:", departments)
        departments = []
      }

      console.log("Processing departments:", departments)

      CSVImportService.departmentMap = new Map()
      CSVImportService.shortNameMap = new Map()

      departments.forEach((dept: any) => {
        if (dept && dept.name && dept.short_name) {
          // Store both lowercase versions for case-insensitive matching
          CSVImportService.departmentMap!.set(dept.name.toLowerCase().trim(), dept.short_name.toUpperCase())
          CSVImportService.shortNameMap!.set(dept.short_name.toLowerCase().trim(), dept.name)

          // Also store common variations
          const nameWords = dept.name.toLowerCase().split(" ")
          const commonAbbreviations = [
            nameWords
              .map((word) => word.charAt(0))
              .join(""), // First letters
            dept.name
              .toLowerCase()
              .replace(/\s+/g, ""), // No spaces
          ]

          commonAbbreviations.forEach((abbrev) => {
            if (abbrev && abbrev !== dept.short_name.toLowerCase()) {
              CSVImportService.departmentMap!.set(abbrev, dept.short_name.toUpperCase())
            }
          })
        }
      })

      console.log("Department maps initialized:", {
        longToShort: Array.from(CSVImportService.departmentMap!.entries()),
        shortToLong: Array.from(CSVImportService.shortNameMap!.entries()),
      })
      CSVImportService.departmentMapsInitialized = true
    } catch (error) {
      console.error("Error initializing department maps:", error)
      CSVImportService.departmentMap = new Map()
      CSVImportService.shortNameMap = new Map()
      CSVImportService.departmentMapsInitialized = false // Mark as not initialized on error
      throw error // Re-throw to propagate the error
    }
  }

  static async getDepartmentShortName(departmentInput: string): Promise<string | undefined> {
    await CSVImportService.initializeDepartmentMaps() // Ensure maps are initialized
    const lowerCaseInput = departmentInput.toLowerCase().trim()

    // First check if input is already a short_name (exact match)
    if (CSVImportService.shortNameMap!.has(lowerCaseInput)) {
      return lowerCaseInput.toUpperCase() // Return in uppercase for consistency
    }

    // Then check if input is a long_name (exact match)
    const shortName = CSVImportService.departmentMap!.get(lowerCaseInput)
    if (shortName) {
      return shortName.toUpperCase() // Return in uppercase for consistency
    }

    // If no exact match, try partial matching for long names
    for (const [longName, shortNameValue] of CSVImportService.departmentMap!.entries()) {
      if (longName.includes(lowerCaseInput) || lowerCaseInput.includes(longName)) {
        return shortNameValue.toUpperCase()
      }
    }

    // If no match found, return undefined
    return undefined
  }

  static async generateTemplate(role: string) {
    const baseHeaders = ["name", "email", "password", "phone", "department"]

    const headers = [...baseHeaders]

    if (role === "students") {
      headers.push(
        "usn",
        "semester",
        "section",
        "batch",
        "address",
        "city",
        "state",
        "pincode",
        "country",
        "blood_group",
        "father_name",
        "father_phone",
        "admission_date", // Added to template
      )
    } else if (role === "faculty" || role === "hods" || role === "coordinators") {
      headers.push(
        "designation",
        "employee_id",
        "join_date",
        "address",
        "city",
        "state",
        "pincode",
        "country",
        "specialization",
        "qualification",
        "experience_years",
      )
    } else if (role === "courses") {
      return ["course_code", "name", "department", "credits", "semester"].join(",") + "\n"
    }

    return headers.join(",") + "\n"
  }

  static async processStudentImport(csvContent: string): Promise<ImportResult> {
    try {
      const rows = parseCSV(csvContent)
      if (rows.length < 2) {
        // At least header and one data row
        return {
          success: false,
          totalRecords: 0,
          successfulImports: 0,
          failedImports: 0,
          errors: ["CSV file is empty or contains only headers"],
        }
      }

      const headers = rows[0].map((h) => h.toLowerCase().replace(/\s+/g, "_"))
      const dataRows = rows.slice(1)
      const errors: string[] = []
      const importedUsers: any[] = []
      let successfulImports = 0
      let failedImports = 0

      for (let index = 0; index < dataRows.length; index++) {
        const row = dataRows[index]
        const validation = validateStudentRow(row, headers)

        if (validation.isValid && validation.data) {
          try {
            const departmentShortName = await CSVImportService.getDepartmentShortName(validation.data.department)
            if (!departmentShortName) {
              throw new Error(
                `Department '${validation.data.department}' not found. Please ensure the department exists and is correctly spelled.`,
              )
            }

            const { hash } = await hashPassword(validation.data.password)
            const [firstName, ...lastNameParts] = validation.data.name.split(" ")

            const userInsertData = {
              email: validation.data.email,
              password_hash: hash,
              username: validation.data.email.split("@")[0], // Use email prefix as username
              role: "student",
              first_name: firstName,
              last_name: lastNameParts.join(" ") || "", // Changed from null to empty string
              department: departmentShortName, // Use the mapped short name
              phone: validation.data.phone || null,
              address: validation.data.address || null,
              city: validation.data.city || null,
              state: validation.data.state || null,
              pincode: validation.data.pincode || null,
              country: validation.data.country || null,
              is_active: true,
              is_verified: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              login_count: 0,
            }
            console.log(`Inserting user data for row ${index + 2}:`, userInsertData)

            // Insert into users table first
            const { data: userData, error: userError } = await supabase
              .from("users")
              .insert(userInsertData)
              .select("id")
              .single()

            if (userError) {
              if (userError.code === "23505") {
                throw new Error(`Email '${validation.data.email}' already exists.`)
              }
              throw new Error(`Supabase user insert error: ${userError.message}`)
            }

            const studentInsertData = {
              user_id: userData.id,
              usn: validation.data.usn,
              roll_number: validation.data.usn, // Assuming roll number is same as USN for simplicity
              semester: Number.parseInt(validation.data.semester),
              section: validation.data.section as any,
              batch: validation.data.batch || new Date().getFullYear().toString(),
              admission_date: validation.data.admission_date || new Date().toISOString().split("T")[0],
              admission_number: validation.data.usn, // Assuming admission number is same as USN
              father_name: validation.data.father_name || null,
              parent_name: validation.data.father_name || null, // Assuming parent_name is same as father_name
              blood_group: validation.data.blood_group || null,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
            console.log(`Inserting student data for row ${index + 2}:`, studentInsertData)

            // Insert into students table using the user_id from the newly created user
            const { data: studentData, error: studentError } = await supabase
              .from("students")
              .insert(studentInsertData)
              .select()
              .single()

            if (studentError) {
              await supabase.from("users").delete().eq("id", userData.id) // Rollback user creation
              if (studentError.code === "23505") {
                throw new Error(`USN '${validation.data.usn}' already exists.`)
              }
              throw new Error(`Supabase student insert error: ${studentError.message}`)
            }

            importedUsers.push({ user: userData, student: studentData })
            successfulImports++
          } catch (error) {
            failedImports++
            errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : "Unknown error"}`)
          }
        } else {
          failedImports++
          errors.push(`Row ${index + 2}: ${validation.errors.join(", ")}`)
        }
      }

      return {
        success: successfulImports > 0,
        totalRecords: dataRows.length,
        successfulImports,
        failedImports,
        errors,
        importedUsers,
      }
    } catch (error) {
      return {
        success: false,
        totalRecords: 0,
        successfulImports: 0,
        failedImports: 0,
        errors: [`Failed to process CSV: ${error instanceof Error ? error.message : "Unknown error"}`],
      }
    }
  }

  static async processFacultyImport(csvContent: string): Promise<ImportResult> {
    try {
      const rows = parseCSV(csvContent)
      if (rows.length < 2) {
        return {
          success: false,
          totalRecords: 0,
          successfulImports: 0,
          failedImports: 0,
          errors: ["CSV file is empty or contains only headers"],
        }
      }

      const headers = rows[0].map((h) => h.toLowerCase().replace(/\s+/g, "_"))
      const dataRows = rows.slice(1)
      const errors: string[] = []
      const importedUsers: any[] = []
      let successfulImports = 0
      let failedImports = 0

      for (let index = 0; index < dataRows.length; index++) {
        const row = dataRows[index]
        const validation = validateFacultyRow(row, headers)

        if (validation.isValid && validation.data) {
          try {
            const departmentShortName = await CSVImportService.getDepartmentShortName(validation.data.department)
            if (!departmentShortName) {
              throw new Error(
                `Department '${validation.data.department}' not found. Please ensure the department exists and is correctly spelled.`,
              )
            }

            const { hash } = await hashPassword(validation.data.password)
            const [firstName, ...lastNameParts] = validation.data.name.split(" ")

            const userInsertData = {
              email: validation.data.email,
              password_hash: hash,
              username: validation.data.email.split("@")[0], // Use email prefix as username
              role: "faculty",
              first_name: firstName,
              last_name: lastNameParts.join(" ") || "", // Changed from null to empty string
              department: departmentShortName, // Use the mapped short name
              phone: validation.data.phone || null,
              address: validation.data.address || null,
              city: validation.data.city || null,
              state: validation.data.state || null,
              pincode: validation.data.pincode || null,
              country: validation.data.country || null,
              is_active: true,
              is_verified: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              login_count: 0,
            }
            console.log(`Inserting user data for row ${index + 2}:`, userInsertData)

            // Insert into users table first
            const { data: userData, error: userError } = await supabase
              .from("users")
              .insert(userInsertData)
              .select("id")
              .single()

            if (userError) {
              if (userError.code === "23505") {
                throw new Error(`Email '${validation.data.email}' already exists.`)
              }
              throw new Error(`Supabase user insert error: ${userError.message}`)
            }

            const facultyInsertData = {
              user_id: userData.id,
              employee_id: validation.data.employee_id,
              designation: validation.data.designation,
              qualification: validation.data.qualification || null,
              experience_years: validation.data.experience_years
                ? Number.parseInt(validation.data.experience_years)
                : null,
              specialization: validation.data.specialization || null,
              join_date: validation.data.join_date || new Date().toISOString().split("T")[0],
              is_hod: false,
              is_coordinator: false,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
            console.log(`Inserting faculty data for row ${index + 2}:`, facultyInsertData)

            // Insert into faculty table using the user_id
            const { data: facultyData, error: facultyError } = await supabase
              .from("faculty")
              .insert(facultyInsertData)
              .select()
              .single()

            if (facultyError) {
              await supabase.from("users").delete().eq("id", userData.id) // Rollback user creation
              if (facultyError.code === "23505") {
                throw new Error(`Employee ID '${validation.data.employee_id}' already exists.`)
              }
              throw new Error(`Supabase faculty insert error: ${facultyError.message}`)
            }

            importedUsers.push({ user: userData, faculty: facultyData })
            successfulImports++
          } catch (error) {
            failedImports++
            errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : "Unknown error"}`)
          }
        } else {
          failedImports++
          errors.push(`Row ${index + 2}: ${validation.errors.join(", ")}`)
        }
      }

      return {
        success: successfulImports > 0,
        totalRecords: dataRows.length,
        successfulImports,
        failedImports,
        errors,
        importedUsers,
      }
    } catch (error) {
      return {
        success: false,
        totalRecords: 0,
        successfulImports: 0,
        failedImports: 0,
        errors: [`Failed to process CSV: ${error instanceof Error ? error.message : "Unknown error"}`],
      }
    }
  }

  static async processHODImport(csvContent: string): Promise<ImportResult> {
    try {
      const rows = parseCSV(csvContent)
      if (rows.length < 2) {
        return {
          success: false,
          totalRecords: 0,
          successfulImports: 0,
          failedImports: 0,
          errors: ["CSV file is empty or contains only headers"],
        }
      }

      const headers = rows[0].map((h) => h.toLowerCase().replace(/\s+/g, "_"))
      const dataRows = rows.slice(1)
      const errors: string[] = []
      const importedUsers: any[] = []
      let successfulImports = 0
      let failedImports = 0

      for (let index = 0; index < dataRows.length; index++) {
        const row = dataRows[index]
        const validation = validateFacultyRow(row, headers) // HODs have similar structure to faculty

        if (validation.isValid && validation.data) {
          try {
            const departmentShortName = await CSVImportService.getDepartmentShortName(validation.data.department)
            if (!departmentShortName) {
              throw new Error(
                `Department '${validation.data.department}' not found. Please ensure the department exists and is correctly spelled.`,
              )
            }

            const { hash } = await hashPassword(validation.data.password)
            const [firstName, ...lastNameParts] = validation.data.name.split(" ")

            const userInsertData = {
              email: validation.data.email,
              password_hash: hash,
              username: validation.data.email.split("@")[0], // Use email prefix as username
              role: "hod", // Role is HOD
              first_name: firstName,
              last_name: lastNameParts.join(" ") || "", // Changed from null to empty string
              department: departmentShortName, // Use the mapped short name
              phone: validation.data.phone || null,
              address: validation.data.address || null,
              city: validation.data.city || null,
              state: validation.data.state || null,
              pincode: validation.data.pincode || null,
              country: validation.data.country || null,
              is_active: true,
              is_verified: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              login_count: 0,
            }
            console.log(`Inserting user data for row ${index + 2}:`, userInsertData)

            // Insert into users table first
            const { data: userData, error: userError } = await supabase
              .from("users")
              .insert(userInsertData)
              .select("id")
              .single()

            if (userError) {
              if (userError.code === "23505") {
                throw new Error(`Email '${validation.data.email}' already exists.`)
              }
              throw new Error(`Supabase user insert error: ${userError.message}`)
            }

            const facultyInsertData = {
              user_id: userData.id,
              employee_id: validation.data.employee_id,
              designation: validation.data.designation,
              qualification: validation.data.qualification || null,
              experience_years: validation.data.experience_years
                ? Number.parseInt(validation.data.experience_years)
                : null,
              specialization: validation.data.specialization || null,
              join_date: validation.data.join_date || new Date().toISOString().split("T")[0],
              is_hod: true, // Set to true for HOD
              is_coordinator: false,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
            console.log(`Inserting faculty data for row ${index + 2}:`, facultyInsertData)

            // Insert into faculty table with is_hod set to true
            const { data: facultyData, error: facultyError } = await supabase
              .from("faculty")
              .insert(facultyInsertData)
              .select()
              .single()

            if (facultyError) {
              await supabase.from("users").delete().eq("id", userData.id) // Rollback user creation
              if (facultyError.code === "23505") {
                throw new Error(`Employee ID '${validation.data.employee_id}' already exists.`)
              }
              throw new Error(`Supabase HOD faculty insert error: ${facultyError.message}`)
            }

            importedUsers.push({ user: userData, faculty: facultyData })
            successfulImports++
          } catch (error) {
            failedImports++
            errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : "Unknown error"}`)
          }
        } else {
          failedImports++
          errors.push(`Row ${index + 2}: ${validation.errors.join(", ")}`)
        }
      }

      return {
        success: successfulImports > 0,
        totalRecords: dataRows.length,
        successfulImports,
        failedImports,
        errors,
        importedUsers,
      }
    } catch (error) {
      return {
        success: false,
        totalRecords: 0,
        successfulImports: 0,
        failedImports: 0,
        errors: [`Failed to process CSV: ${error instanceof Error ? error.message : "Unknown error"}`],
      }
    }
  }

  static async processCoordinatorImport(csvContent: string): Promise<ImportResult> {
    try {
      const rows = parseCSV(csvContent)
      if (rows.length < 2) {
        return {
          success: false,
          totalRecords: 0,
          successfulImports: 0,
          failedImports: 0,
          errors: ["CSV file is empty or contains only headers"],
        }
      }

      const headers = rows[0].map((h) => h.toLowerCase().replace(/\s+/g, "_"))
      const dataRows = rows.slice(1)
      const errors: string[] = []
      const importedUsers: any[] = []
      let successfulImports = 0
      let failedImports = 0

      for (let index = 0; index < dataRows.length; index++) {
        const row = dataRows[index]
        const validation = validateFacultyRow(row, headers) // Coordinators have similar structure to faculty

        if (validation.isValid && validation.data) {
          try {
            const departmentShortName = await CSVImportService.getDepartmentShortName(validation.data.department)
            if (!departmentShortName) {
              throw new Error(
                `Department '${validation.data.department}' not found. Please ensure the department exists and is correctly spelled.`,
              )
            }

            const { hash } = await hashPassword(validation.data.password)
            const [firstName, ...lastNameParts] = validation.data.name.split(" ")

            const userInsertData = {
              email: validation.data.email,
              password_hash: hash,
              username: validation.data.email.split("@")[0], // Use email prefix as username
              role: "coordinator", // Role is coordinator
              first_name: firstName,
              last_name: lastNameParts.join(" ") || "", // Changed from null to empty string
              department: departmentShortName, // Use the mapped short name
              phone: validation.data.phone || null,
              address: validation.data.address || null,
              city: validation.data.city || null,
              state: validation.data.state || null,
              pincode: validation.data.pincode || null,
              country: validation.data.country || null,
              is_active: true,
              is_verified: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              login_count: 0,
            }
            console.log(`Inserting user data for row ${index + 2}:`, userInsertData)

            // Insert into users table first
            const { data: userData, error: userError } = await supabase
              .from("users")
              .insert(userInsertData)
              .select("id")
              .single()

            if (userError) {
              if (userError.code === "23505") {
                throw new Error(`Email '${validation.data.email}' already exists.`)
              }
              throw new Error(`Supabase user insert error: ${userError.message}`)
            }

            const facultyInsertData = {
              user_id: userData.id,
              employee_id: validation.data.employee_id,
              designation: validation.data.designation,
              qualification: validation.data.qualification || null,
              experience_years: validation.data.experience_years
                ? Number.parseInt(validation.data.experience_years)
                : null,
              specialization: validation.data.specialization || null,
              join_date: validation.data.join_date || new Date().toISOString().split("T")[0],
              is_hod: false,
              is_coordinator: true, // Set to true for coordinator
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
            console.log(`Inserting faculty data for row ${index + 2}:`, facultyInsertData)

            // Insert into faculty table with is_coordinator set to true
            const { data: facultyData, error: facultyError } = await supabase
              .from("faculty")
              .insert(facultyInsertData)
              .select()
              .single()

            if (facultyError) {
              await supabase.from("users").delete().eq("id", userData.id) // Rollback user creation
              if (facultyError.code === "23505") {
                throw new Error(`Employee ID '${validation.data.employee_id}' already exists.`)
              }
              throw new Error(`Supabase coordinator faculty insert error: ${facultyError.message}`)
            }

            importedUsers.push({ user: userData, faculty: facultyData })
            successfulImports++
          } catch (error) {
            failedImports++
            errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : "Unknown error"}`)
          }
        } else {
          failedImports++
          errors.push(`Row ${index + 2}: ${validation.errors.join(", ")}`)
        }
      }

      return {
        success: successfulImports > 0,
        totalRecords: dataRows.length,
        successfulImports,
        failedImports: failedImports,
        errors,
        importedUsers,
      }
    } catch (error) {
      return {
        success: false,
        totalRecords: 0,
        successfulImports: 0,
        failedImports: 0,
        errors: [`Failed to process CSV: ${error instanceof Error ? error.message : "Unknown error"}`],
      }
    }
  }

  static async processCourseImport(csvContent: string): Promise<ImportResult> {
    try {
      const rows = parseCSV(csvContent)
      if (rows.length < 2) {
        return {
          success: false,
          totalRecords: 0,
          successfulImports: 0,
          failedImports: 0,
          errors: ["CSV file is empty or contains only headers"],
        }
      }

      const headers = rows[0]
      const dataRows = rows.slice(1)
      const errors: string[] = []
      const importedCourses: any[] = []
      let successfulImports = 0
      let failedImports = 0

      console.log("CSV Headers:", headers)
      console.log("First data row:", dataRows[0])

      for (let index = 0; index < dataRows.length; index++) {
        const row = dataRows[index]
        const validation = validateCourseRow(row, headers)

        console.log(`Row ${index + 2} validation:`, validation)

        if (validation.isValid && validation.data) {
          try {
            const departmentShortName = await CSVImportService.getDepartmentShortName(validation.data.department)
            if (!departmentShortName) {
              throw new Error(
                `Department '${validation.data.department}' not found. Please ensure the department exists and is correctly spelled.`,
              )
            }

            const subjectInsertData = {
              code: validation.data.course_code,
              name: validation.data.name,
              department: departmentShortName, // Use the mapped short name
              credits: Number.parseInt(validation.data.credits),
              semester: Number.parseInt(validation.data.semester),
            }
            console.log(`Inserting subject data for row ${index + 2}:`, subjectInsertData)

            const { data: subjectData, error: subjectError } = await supabase
              .from("subjects")
              .insert(subjectInsertData)
              .select()
              .single()

            if (subjectError) {
              if (subjectError.code === "23505") {
                throw new Error(`Course Code '${validation.data.course_code}' already exists.`)
              }
              throw new Error(`Supabase subject insert error: ${subjectError.message}`)
            }

            importedCourses.push(subjectData)
            successfulImports++
          } catch (error) {
            failedImports++
            errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : "Unknown error"}`)
          }
        } else {
          failedImports++
          errors.push(`Row ${index + 2}: ${validation.errors.join(", ")}`)
        }
      }

      return {
        success: successfulImports > 0,
        totalRecords: dataRows.length,
        successfulImports,
        failedImports,
        errors,
        importedUsers: importedCourses,
      }
    } catch (error) {
      return {
        success: false,
        totalRecords: 0,
        successfulImports: 0,
        failedImports: 0,
        errors: [`Failed to process CSV: ${error instanceof Error ? error.message : "Unknown error"}`],
      }
    }
  }
}
