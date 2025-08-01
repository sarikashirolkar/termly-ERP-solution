import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export interface FeedbackSchedule {
  id: string
  phase: "phase-1" | "phase-2"
  start_date: string
  end_date: string
  status: "active" | "upcoming" | "completed"
  academic_year: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface StudentFeedback {
  id: string
  student_id: string
  faculty_id: string
  subject_id: string
  subject_name: string
  message: string
  response?: string
  rating?: number
  feedback_type: "phase-1" | "phase-2" | "general"
  status: "pending" | "responded"
  schedule_id?: string
  submitted_at: string
  responded_at?: string
}

export const feedbackScheduleService = {
  // Create a new feedback schedule
  async createSchedule(
    schedule: Omit<FeedbackSchedule, "id" | "created_at" | "updated_at">,
  ): Promise<FeedbackSchedule> {
    const { data, error } = await supabase.from("feedback_schedules").insert([schedule]).select().single()

    if (error) {
      console.error("Error creating feedback schedule:", error)
      throw new Error(`Failed to create feedback schedule: ${error.message}`)
    }

    return data
  },

  // Get all feedback schedules
  async getAllSchedules(): Promise<FeedbackSchedule[]> {
    const { data, error } = await supabase
      .from("feedback_schedules")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching feedback schedules:", error)
      throw new Error(`Failed to fetch feedback schedules: ${error.message}`)
    }

    return data || []
  },

  // Get active feedback schedules
  async getActiveSchedules(): Promise<FeedbackSchedule[]> {
    const { data, error } = await supabase
      .from("feedback_schedules")
      .select("*")
      .eq("status", "active")
      .order("start_date", { ascending: true })

    if (error) {
      console.error("Error fetching active feedback schedules:", error)
      throw new Error(`Failed to fetch active feedback schedules: ${error.message}`)
    }

    return data || []
  },

  // Update feedback schedule
  async updateSchedule(id: string, updates: Partial<FeedbackSchedule>): Promise<FeedbackSchedule> {
    const { data, error } = await supabase.from("feedback_schedules").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating feedback schedule:", error)
      throw new Error(`Failed to update feedback schedule: ${error.message}`)
    }

    return data
  },

  // Delete feedback schedule
  async deleteSchedule(id: string): Promise<void> {
    const { error } = await supabase.from("feedback_schedules").delete().eq("id", id)

    if (error) {
      console.error("Error deleting schedule:", error)
      throw new Error(`Failed to delete feedback schedule: ${error.message}`)
    }
  },

  // Submit student feedback
  async submitFeedback(feedback: Omit<StudentFeedback, "id" | "submitted_at">): Promise<StudentFeedback> {
    const { data, error } = await supabase.from("student_feedback").insert([feedback]).select().single()

    if (error) {
      console.error("Error submitting feedback:", error)
      throw new Error(`Failed to submit feedback: ${error.message}`)
    }

    return data
  },

  // Get feedback for a specific faculty member
  async getFacultyFeedback(facultyId: string): Promise<StudentFeedback[]> {
    const { data, error } = await supabase
      .from("student_feedback")
      .select(`
        *,
        student:students!student_feedback_student_id_fkey(
          user_id,
          usn,
          users!students_user_id_fkey(first_name, last_name, email)
        ),
        subject:subjects!student_feedback_subject_id_fkey(name, code)
      `)
      .eq("faculty_id", facultyId)
      .order("submitted_at", { ascending: false })

    if (error) {
      console.error("Error fetching faculty feedback:", error)
      throw new Error(`Failed to fetch faculty feedback: ${error.message}`)
    }

    return data || []
  },

  // Get pending feedback for coordinators
  async getPendingFeedback(): Promise<StudentFeedback[]> {
    const { data, error } = await supabase
      .from("student_feedback")
      .select(`
        *,
        student:students!student_feedback_student_id_fkey(
          user_id,
          usn,
          users!students_user_id_fkey(first_name, last_name, email)
        ),
        faculty:faculty!student_feedback_faculty_id_fkey(
          user_id,
          users!faculty_user_id_fkey(first_name, last_name, email)
        ),
        subject:subjects!student_feedback_subject_id_fkey(name, code)
      `)
      .eq("status", "pending")
      .order("submitted_at", { ascending: false })

    if (error) {
      console.error("Error fetching pending feedback:", error)
      throw new Error(`Failed to fetch pending feedback: ${error.message}`)
    }

    return data || []
  },

  // Get feedback for a specific student
  async getStudentFeedback(studentId: string): Promise<StudentFeedback[]> {
    const { data, error } = await supabase
      .from("student_feedback")
      .select(`
        *,
        faculty:faculty!student_feedback_faculty_id_fkey(
          user_id,
          users!faculty_user_id_fkey(first_name, last_name, email)
        ),
        subject:subjects!student_feedback_subject_id_fkey(name, code)
      `)
      .eq("student_id", studentId)
      .order("submitted_at", { ascending: false })

    if (error) {
      console.error("Error fetching student feedback:", error)
      throw new Error(`Failed to fetch student feedback: ${error.message}`)
    }

    return data || []
  },

  // Respond to feedback (for faculty)
  async respondToFeedback(feedbackId: string, response: string, facultyId: string): Promise<void> {
    const { error } = await supabase
      .from("student_feedback")
      .update({
        response,
        status: "responded",
        responded_at: new Date().toISOString(),
      })
      .eq("id", feedbackId)
      .eq("faculty_id", facultyId)

    if (error) {
      console.error("Error responding to feedback:", error)
      throw new Error(`Failed to respond to feedback: ${error.message}`)
    }

    // Also create a record in feedback_responses table
    const { error: responseError } = await supabase.from("feedback_responses").insert([
      {
        feedback_id: feedbackId,
        faculty_id: facultyId,
        response_text: response,
      },
    ])

    if (responseError) {
      console.error("Error creating feedback response record:", responseError)
      // Don't throw here as the main update succeeded
    }
  },

  async getCurrentOpenPhases(): Promise<string[]> {
    try {
      const activeSchedules = await this.getActiveSchedules()
      return activeSchedules.map((schedule) => schedule.phase)
    } catch (error) {
      console.error("Error in getCurrentOpenPhases:", error)
      return []
    }
  },
}
