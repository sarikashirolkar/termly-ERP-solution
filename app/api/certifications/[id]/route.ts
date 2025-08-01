import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Certification ID is required" }, { status: 400 })
    }

    // In a real application, this would delete from a database
    // For now, we'll just return success
    // The actual deletion happens in localStorage on the client side

    return NextResponse.json({
      success: true,
      message: "Certification deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting certification:", error)
    return NextResponse.json({ error: "Failed to delete certification" }, { status: 500 })
  }
}
