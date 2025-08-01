import { supabase } from "@/lib/supabase-client"

export const academicYearService = {
  async getAcademicYears(): Promise<string[]> {
    try {
      // Get distinct academic years from courses table
      const { data, error } = await supabase
        .from("courses")
        .select("academic_year")
        .not("academic_year", "is", null)
        .order("academic_year", { ascending: false })

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(`Database error: ${error.message}`)
      }

      if (!data) {
        return []
      }

      // Extract unique academic years
      const uniqueYears = [...new Set(data.map((item) => item.academic_year))]
        .filter((year) => year !== null && year !== undefined)
        .sort((a, b) => b.localeCompare(a)) // Sort in descending order

      return uniqueYears
    } catch (error) {
      console.error("Error in getAcademicYears:", error)

      // Return fallback data if database query fails
      const currentYear = new Date().getFullYear()
      return [
        `${currentYear}-${currentYear + 1}`,
        `${currentYear - 1}-${currentYear}`,
        `${currentYear - 2}-${currentYear - 1}`,
      ]
    }
  },

  async getCurrentAcademicYear(): Promise<string> {
    try {
      const years = await this.getAcademicYears()
      return years[0] || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
    } catch (error) {
      console.error("Error getting current academic year:", error)
      const currentYear = new Date().getFullYear()
      return `${currentYear}-${currentYear + 1}`
    }
  },
}
