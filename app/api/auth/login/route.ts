import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"
import { sanitizeUserLike } from "@/lib/name-sanitizer"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email and password are required" }, { status: 400 })
    }

    // Get user from database
    const { data: user, error: userError } = await supabase.from("users").select("*").eq("email", email).single()

    if (userError || !user) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 })
    }

    // Get client IP address safely
    const forwarded = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const clientIp = forwarded?.split(",")[0] || realIp || "127.0.0.1"

    // Update last login info
    const { error: updateError } = await supabase
      .from("users")
      .update({
        last_login: new Date().toISOString(),
        last_login_ip: clientIp,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Error updating login info:", updateError)
      // Don't fail the login if we can't update the login info
    }

    // Determine the effective role based on user's primary role and faculty flags
    let effectiveRole = user.role
    if (user.role === "faculty") {
      const { data: facultyRecord, error: facultyRecordError } = await supabase
        .from("faculty")
        .select("is_hod, is_coordinator")
        .eq("user_id", user.id)
        .single()

      if (!facultyRecordError && facultyRecord) {
        if (facultyRecord.is_hod) {
          effectiveRole = "hod"
        } else if (facultyRecord.is_coordinator) {
          effectiveRole = "coordinator"
        }
      }
    }

    // Return user data (excluding password)
    const { password_hash, ...userWithoutPassword } = user
    const userWithEffectiveRole = sanitizeUserLike({ ...userWithoutPassword, role: effectiveRole })

    return NextResponse.json({
      success: true,
      user: userWithEffectiveRole,
      message: "Login successful",
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
