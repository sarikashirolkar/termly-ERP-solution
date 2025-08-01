//
// lib/manual-add-service.ts
//
// Lightweight, client-side helper that calls your existing
// `/api/users/manual-add` route for creating Users / Students / Faculty.
//
type ApiResponse = { success: boolean; message?: string; error?: string }

/* ---------- shared helpers ---------- */
const randomPassword = (len = 10) =>
  Array.from({ length: len }, () =>
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 62)),
  ).join("")

const splitName = (full: string) => {
  const [first, ...rest] = full.trim().split(/\s+/)
  return { first_name: first, last_name: rest.join(" ") }
}

const usernameFromEmail = (email: string) => `${email.split("@")[0]}_${Date.now()}`

async function postJSON<T = ApiResponse>(url: string, body: unknown): Promise<T & ApiResponse> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
}

export const ManualAddService = {
  /**
   * Add a **student** by calling the existing API route `/api/users/manual-add`
   */
  async addStudent({
    name,
    email,
    usn,
    phone = "",
    department,
    semester,
    section,
    status,
    password,
    batch, // Ensure batch is received
  }: {
    name: string
    email: string
    password?: string
    usn: string
    phone?: string
    department: string // short_name
    semester: string | number
    section: string
    status: string
    batch?: string | number // Make batch optional here, as it has a default
  }) {
    const { first_name, last_name } = splitName(name)

    const payload = {
      type: "student",
      user: {
        email,
        password: password ?? "student123",
        username: usernameFromEmail(email),
        first_name,
        last_name,
        phone,
      },
      student: {
        usn,
        roll_number: usn, // NOT-NULL in DB
        department,
        semester: Number(semester),
        section,
        status,
        batch: batch ?? new Date().getFullYear(), // Default to current year if not provided
      },
    }

    return postJSON("/api/users/manual-add", payload)
  },

  /**
   * Add a **faculty** member.
   */
  async addFaculty({
    name,
    email,
    password,
    employee_id,
    phone = "",
    department,
    designation = "Faculty",
  }: {
    name: string
    email: string
    password?: string
    employee_id: string
    phone?: string
    department: string
    designation?: string
  }) {
    const { first_name, last_name } = splitName(name)
    const payload = {
      type: "faculty",
      user: {
        email,
        password: password ?? randomPassword(),
        username: usernameFromEmail(email),
        first_name,
        last_name,
        phone,
        department, // ensure department travels with user
      },
      faculty: {
        employee_id, // <-- NEW : fixes NOT-NULL violation
        department,
        designation,
        is_active: true,
      },
    }

    return postJSON("/api/users/manual-add", payload)
  },

  /**
   * Add a **Head of Department**.
   */
  async addHOD({
    name,
    email,
    password,
    employee_id,
    phone = "",
    department,
    designation = "HOD",
    qualification = "",
  }: {
    name: string
    email: string
    password?: string
    employee_id: string
    phone?: string
    department: string // short_name
    designation?: string // defaults to "HOD"
    qualification?: string
  }) {
    const { first_name, last_name } = splitName(name)

    const payload = {
      type: "hod", // the API route will treat this as a faculty record with is_hod=true
      user: {
        email,
        password: password ?? "hod123", // default password for HODs
        username: usernameFromEmail(email),
        first_name,
        last_name,
        phone,
        department,
      },
      faculty: {
        employee_id, // NOT-NULL in "faculty" table
        department,
        designation,
        qualification,
        is_active: true,
        is_hod: true, // key difference vs. regular faculty
        is_coordinator: false,
      },
    }

    return postJSON("/api/users/manual-add", payload)
  },
}
