import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"

// Helper to get default password based on role
function getDefaultPassword(type: string): string {
  const defaultPasswords: { [key: string]: string } = {
    student: "student123",
    faculty: "faculty123",
    hod: "hod123",
    coordinator: "coordinator123",
  }
  return defaultPasswords[type] || "user123"
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    // Destructure the new payload structure
    const { type, user, student, faculty } = body

    console.log(`[API] Manual Add: Received request for type: ${type}`)
    console.log("[API] Manual Add: User data from payload:", user)
    console.log("[API] Manual Add: Student data from payload:", student)
    console.log("[API] Manual Add: Faculty data from payload:", faculty)

    // Use provided password from 'user' object or generate default
    const rawPassword = user.password || getDefaultPassword(type)
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(rawPassword, salt)
    console.log(`[API] Manual Add: Password hashed.`)

    // Determine unique username based on type, or use provided username
    let username: string
    if (user.username) {
      username = user.username
    } else if (type === "student" && student?.usn) {
      username = student.usn // Use USN as username for students
    } else if ((type === "faculty" || type === "hod" || type === "coordinator") && faculty?.employee_id) {
      username = faculty.employee_id // Use employee_id for faculty/HOD/coordinator
    } else {
      // Fallback for other types or if specific ID is missing
      username = user.email.split("@")[0] + "_" + Date.now().toString().slice(-5) // Append timestamp for uniqueness
      console.warn(`[API] Manual Add: No specific ID for username. Generated fallback: ${username}`)
    }
    console.log(`[API] Manual Add: Determined username: ${username}`)

    // Prepare user record for insertion
    const userInsertData = {
      email: user.email,
      password_hash: passwordHash,
      username: username,
      role: type,
      first_name: user.first_name,
      last_name: user.last_name,
      department: user.department, // Department should come from the user object
      phone: user.phone || null,
      is_active: user.status === "Active" || true, // Default to active if not provided
      is_verified: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      login_count: 0,
    }
    console.log(`[API] Manual Add: Attempting to insert user:`, userInsertData)

    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert(userInsertData)
      .select("id")
      .single()

    if (userError) {
      console.error("[API] Manual Add: User creation error:", userError)
      if (userError.code === "23505") {
        if (userError.message.includes("users_email_key")) {
          return NextResponse.json(
            {
              success: false,
              message: `Email '${user.email}' already exists.`,
            },
            { status: 400 },
          )
        } else if (userError.message.includes("users_username_key")) {
          return NextResponse.json(
            {
              success: false,
              message: `Username '${username}' already exists. Please check USN/Employee ID or try a different email.`,
            },
            { status: 400 },
          )
        }
      }
      throw new Error(`User creation error: ${userError.message}`)
    }

    if (!newUser || !newUser.id) {
      console.error("[API] Manual Add: User ID not returned after insertion.")
      throw new Error("Failed to retrieve user ID after creation.")
    }
    console.log(`[API] Manual Add: User created with ID: ${newUser.id}`)

    let specificRecord = null

    // Create type-specific record
    if (type === "student" && student) {
      const studentData = {
        user_id: newUser.id,
        usn: student.usn,
        roll_number: student.roll_number || student.usn, // Ensure roll_number is not null
        semester: Number.parseInt(student.semester.toString().replace(/\D/g, "")),
        section: student.section,
        batch: student.batch || new Date().getFullYear().toString(), // Use provided batch or current year
        admission_date: student.admission_date || new Date().toISOString().split("T")[0],
        admission_number: student.admission_number || student.usn,
        is_active: student.status === "Active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        father_name: student.father_name || null,
        parent_name: student.parent_name || student.father_name || null,
        parent_phone: student.parent_phone || student.father_phone || null,
        blood_group: student.blood_group || null,
      }
      console.log(`[API] Manual Add: Attempting to insert student:`, studentData)

      const { data: newStudent, error: studentError } = await supabase
        .from("students")
        .insert(studentData)
        .select()
        .single()

      if (studentError) {
        console.error("[API] Manual Add: Student creation error:", studentError)
        await supabase.from("users").delete().eq("id", newUser.id) // Rollback user creation
        if (studentError.code === "23505") {
          return NextResponse.json(
            {
              success: false,
              message: `USN '${student.usn}' already exists.`,
            },
            { status: 400 },
          )
        }
        throw new Error(`Student creation error: ${studentError.message}`)
      }
      specificRecord = newStudent
      console.log(`[API] Manual Add: Student created:`, specificRecord)
    } else if ((type === "faculty" || type === "hod" || type === "coordinator") && faculty) {
      const facultyData = {
        user_id: newUser.id,
        employee_id: faculty.employee_id,
        designation: faculty.designation,
        qualification: faculty.qualification || null,
        join_date: faculty.join_date || new Date().toISOString().split("T")[0],
        is_hod: type === "hod",
        is_coordinator: type === "coordinator",
        is_active: true, // Faculty/HOD/Coordinator are active by default on manual add
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        experience_years: faculty.experience_years ? Number.parseInt(faculty.experience_years.toString()) : null,
        specialization: faculty.specialization || null,
      }
      console.log(`[API] Manual Add: Attempting to insert faculty/hod/coordinator:`, facultyData)

      const { data: newFaculty, error: facultyError } = await supabase
        .from("faculty")
        .insert(facultyData)
        .select()
        .single()

      if (facultyError) {
        console.error("[API] Manual Add: Faculty/HOD/Coordinator creation error:", facultyError)
        await supabase.from("users").delete().eq("id", newUser.id) // Rollback user creation
        if (facultyError.code === "23505") {
          return NextResponse.json(
            {
              success: false,
              message: `Employee ID '${faculty.employee_id}' already exists.`,
            },
            { status: 400 },
          )
        }
        throw new Error(`Faculty/HOD/Coordinator creation error: ${facultyError.message}`)
      }
      specificRecord = newFaculty
      console.log(`[API] Manual Add: Faculty/HOD/Coordinator created:`, specificRecord)

      // If HOD, update the department's head field
      if (type === "hod" && user.department) {
        const { error: departmentError } = await supabase
          .from("departments")
          .update({ head: user.first_name + " " + user.last_name }) // Assuming 'name' is the HOD's full name
          .eq("short_name", user.department)

        if (departmentError) {
          console.error("Supabase department update error:", departmentError)
          // Log and continue, as HOD is still created.
        }
      }
    } else {
      console.warn(`[API] Manual Add: Unknown user type: ${type}. No specific record created.`)
    }

    const isDefaultPassword = !user.password
    const responseMessage = isDefaultPassword
      ? `${type.charAt(0).toUpperCase() + type.slice(1)} ${user.first_name} ${user.last_name} added successfully with default password: ${rawPassword}`
      : `${type.charAt(0).toUpperCase() + type.slice(1)} ${user.first_name} ${user.last_name} added successfully.`

    console.log(`[API] Manual Add: Final success response for ${type}: ${responseMessage}`)
    return NextResponse.json({
      success: true,
      message: responseMessage,
      data: {
        user: newUser,
        [type]: specificRecord,
      },
    })
  } catch (error) {
    console.error("[API] Manual Add: Error in manual add process:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add user",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
