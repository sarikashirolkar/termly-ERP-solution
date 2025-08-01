// API Service for making requests to the backend

// Base URL for API requests
const API_BASE_URL = "/api"

// Generic fetch function with error handling
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  // Default headers
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  // Get auth token from localStorage if available
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user")
    if (user) {
      const parsedUser = JSON.parse(user)
      if (parsedUser.token) {
        headers["Authorization"] = `Bearer ${parsedUser.token}`
      }
    }
  }

  const config = {
    ...options,
    headers,
  }

  try {
    const response = await fetch(url, config)

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `API error: ${response.status}`)
    }

    // Parse JSON response
    const data = await response.json()
    return data as T
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

// Authentication services
export const authService = {
  login: async (email: string, password: string) => {
    return fetchAPI<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },

  logout: async () => {
    return fetchAPI("/auth/logout", {
      method: "POST",
    })
  },

  forgotPassword: async (email: string) => {
    return fetchAPI("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    })
  },
}

// Student services
export const studentService = {
  getAll: async () => {
    return fetchAPI<any[]>("/students")
  },

  getById: async (id: string) => {
    return fetchAPI<any>(`/students/${id}`)
  },

  getMarks: async (studentId: string) => {
    return fetchAPI<any[]>(`/students/${studentId}/marks`)
  },

  getAttendance: async (studentId: string) => {
    return fetchAPI<any[]>(`/students/${studentId}/attendance`)
  },

  getAchievements: async (studentId: string) => {
    return fetchAPI<any[]>(`/students/${studentId}/achievements`)
  },
}

// Faculty services
export const facultyService = {
  getAll: async () => {
    return fetchAPI<any[]>("/faculty")
  },

  getById: async (id: string) => {
    return fetchAPI<any>(`/faculty/${id}`)
  },

  getStudents: async (facultyId: string) => {
    return fetchAPI<any[]>(`/faculty/${facultyId}/students`)
  },

  getSubjects: async (facultyId: string) => {
    return fetchAPI<any[]>(`/faculty/${facultyId}/subjects`)
  },

  updateMarks: async (markData: any) => {
    return fetchAPI("/marks/update", {
      method: "POST",
      body: JSON.stringify(markData),
    })
  },

  updateAttendance: async (attendanceData: any) => {
    return fetchAPI("/attendance/update", {
      method: "POST",
      body: JSON.stringify(attendanceData),
    })
  },

  markAttendance: async (attendanceData: any[]) => {
    return fetchAPI("/attendance/mark", {
      method: "POST",
      body: JSON.stringify(attendanceData),
    })
  },

  getAttendanceByClassSection: async (classId: string, sectionId: string, date: string) => {
    return fetchAPI<any[]>(`/attendance?class=${classId}&section=${sectionId}&date=${date}`)
  },
}

// Course services
export const courseService = {
  getAll: async () => {
    return fetchAPI<any[]>("/courses")
  },

  getById: async (id: string) => {
    return fetchAPI<any>(`/courses/${id}`)
  },

  getStudents: async (courseId: string) => {
    return fetchAPI<any[]>(`/courses/${courseId}/students`)
  },

  getMaterials: async (courseId: string) => {
    return fetchAPI<any[]>(`/courses/${courseId}/materials`)
  },

  uploadMaterial: async (courseId: string, materialData: FormData) => {
    return fetchAPI(`/courses/${courseId}/materials`, {
      method: "POST",
      body: materialData,
      headers: {}, // Let the browser set the content type for FormData
    })
  },
}

// Department services
export const departmentService = {
  getAll: async () => {
    return fetchAPI<any[]>("/departments")
  },

  getById: async (id: string) => {
    return fetchAPI<any>(`/departments/${id}`)
  },

  getFaculty: async (departmentId: string) => {
    return fetchAPI<any[]>(`/departments/${departmentId}/faculty`)
  },

  getStudents: async (departmentId: string) => {
    return fetchAPI<any[]>(`/departments/${departmentId}/students`)
  },
}

// Attendance services
export const attendanceService = {
  getStudentAttendance: async (studentId: string) => {
    return fetchAPI<any[]>(`/attendance?studentId=${studentId}`)
  },

  getFacultyAttendance: async (facultyId: string, date?: string) => {
    const dateParam = date ? `&date=${date}` : ""
    return fetchAPI<any[]>(`/attendance?facultyId=${facultyId}${dateParam}`)
  },

  markAttendance: async (attendanceRecord: {
    studentId: string
    courseId: string
    date: string
    status: "Present" | "Absent" | "Late"
    facultyId: string
  }) => {
    return fetchAPI("/attendance/mark", {
      method: "POST",
      body: JSON.stringify(attendanceRecord),
    })
  },

  markBulkAttendance: async (
    records: Array<{
      studentId: string
      courseId: string
      date: string
      status: "Present" | "Absent" | "Late"
      facultyId: string
    }>,
  ) => {
    return fetchAPI("/attendance/mark-bulk", {
      method: "POST",
      body: JSON.stringify({ records }),
    })
  },
}

// Analytics services
export const analyticsService = {
  getAttendanceStats: async (params: any) => {
    return fetchAPI<any>("/analytics/attendance", {
      method: "POST",
      body: JSON.stringify(params),
    })
  },

  getPerformanceStats: async (params: any) => {
    return fetchAPI<any>("/analytics/performance", {
      method: "POST",
      body: JSON.stringify(params),
    })
  },

  getDepartmentStats: async (departmentId: string) => {
    return fetchAPI<any>(`/analytics/department/${departmentId}`)
  },
}

// User preferences service
export const preferencesService = {
  get: async () => {
    return fetchAPI<any>("/preferences")
  },

  update: async (preferences: any) => {
    return fetchAPI("/preferences", {
      method: "POST",
      body: JSON.stringify(preferences),
    })
  },
}

// CO-PO Mapping services
export const copoService = {
  getReports: async (params?: {
    departmentId?: string
    facultyId?: string
    subjectId?: string
    academicYear?: string
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.departmentId) queryParams.append("departmentId", params.departmentId)
    if (params?.facultyId) queryParams.append("facultyId", params.facultyId)
    if (params?.subjectId) queryParams.append("subjectId", params.subjectId)
    if (params?.academicYear) queryParams.append("academicYear", params.academicYear)

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return fetchAPI<any[]>(`/copo/reports${queryString}`)
  },

  getReportById: async (reportId: string) => {
    return fetchAPI<any>(`/copo/reports/${reportId}`)
  },

  generateReport: async (data: {
    subjectId: string
    academicYear: string
    facultyId?: string
  }) => {
    return fetchAPI("/copo/generate", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  downloadReport: async (reportId: string, format: "pdf" | "excel" = "pdf") => {
    return fetchAPI(`/copo/reports/${reportId}/download?format=${format}`, {
      method: "GET",
    })
  },
}

// Export all services
export const apiService = {
  auth: authService,
  students: studentService,
  faculty: facultyService,
  courses: courseService,
  departments: departmentService,
  analytics: analyticsService,
  preferences: preferencesService,
  attendance: attendanceService,
  copo: copoService, // Add the new service here
}
