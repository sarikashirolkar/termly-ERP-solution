import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  // Explicitly check for the service role key
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseServiceRoleKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.")
    return NextResponse.json(
      { error: "Server configuration error: Supabase service role key is missing." },
      { status: 500 },
    )
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseServiceRoleKey)

  try {
    const { data: departments, error } = await supabase.from("departments").select("*").order("name")

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(departments || [])
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Explicitly check for the service role key
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseServiceRoleKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.")
    return NextResponse.json(
      { error: "Server configuration error: Supabase service role key is missing." },
      { status: 500 },
    )
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseServiceRoleKey)

  try {
    const body = await request.json()
    const { name, description, hod_id } = body

    if (!name) {
      return NextResponse.json({ error: "Department name is required" }, { status: 400 })
    }

    const { data: department, error } = await supabase
      .from("departments")
      .insert([
        {
          name,
          description,
          hod_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Assuming 'code' and 'short_name' are auto-generated or handled elsewhere if not provided
          code: name.substring(0, 3).toUpperCase(), // Placeholder
          short_name: name.substring(0, 3).toUpperCase(), // Placeholder
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(department, { status: 201 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  // Explicitly check for the service role key
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseServiceRoleKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.")
    return NextResponse.json(
      { error: "Server configuration error: Supabase service role key is missing." },
      { status: 500 },
    )
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseServiceRoleKey)

  try {
    const body = await request.json()
    const { id, name, description, hod_id } = body

    if (!id) {
      return NextResponse.json({ error: "Department ID is required" }, { status: 400 })
    }

    const { data: department, error } = await supabase
      .from("departments")
      .update({
        name,
        description,
        hod_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(department)
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  // Explicitly check for the service role key
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseServiceRoleKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.")
    return NextResponse.json(
      { error: "Server configuration error: Supabase service role key is missing." },
      { status: 500 },
    )
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, supabaseServiceRoleKey)

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Department ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("departments").delete().eq("id", id)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Department deleted successfully" })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 })
  }
}
