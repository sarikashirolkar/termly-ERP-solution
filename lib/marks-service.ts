import { createClient } from "@/lib/supabase-client"

export interface StudentMark {
  mark_id: string
  student_id: string
  course_id: string
  subject_id: string
  subject_code: string
  subject_name: string
  component_type: string
  assessment_type: string
  max_marks: number
  obtained_marks: number
  assessment_date: string
  percentage: number
  grade: string
  semester: number
  academic_year: string
}

export interface FacultyCourse {
  course_id: string
  subject_id: string
  subject_code: string
  subject_name: string
  component_type: string
  semester: number
  section: string
  academic_year: string
  batch: string
}

export interface CourseStudent {
  student_id: string
  student_name: string
  usn: string
  roll_number: string
  email: string
}

export class MarksService {
  private supabase = createClient()

  async getFacultyCoursesForMarks(
    facultyUserId: string,
    academicYear?: string,
    semester?: number,
    section?: string,
  ): Promise<FacultyCourse[]> {
    const { data, error } = await this.supabase.rpc("get_faculty_courses_for_marks", {
      p_faculty_user_id: facultyUserId,
      p_academic_year: academicYear || null,
      p_semester: semester || null,
      p_section: section || null,
    })

    if (error) {
      console.error("Error fetching faculty courses:", error)
      throw new Error(`Failed to fetch faculty courses: ${error.message}`)
    }

    return data || []
  }

  async getCourseStudentsForMarks(courseId: string): Promise<CourseStudent[]> {
    const { data, error } = await this.supabase.rpc("get_course_students_for_marks", {
      p_course_id: courseId,
    })

    if (error) {
      console.error("Error fetching course students:", error)
      throw new Error(`Failed to fetch course students: ${error.message}`)
    }

    return data || []
  }

  async getStudentMarksWithDetails(studentUserId: string): Promise<StudentMark[]> {
    const { data, error } = await this.supabase.rpc("get_student_marks_with_details", {
      p_student_user_id: studentUserId,
    })

    if (error) {
      console.error("Error fetching student marks:", error)
      throw new Error(`Failed to fetch student marks: ${error.message}`)
    }

    return data || []
  }

  async upsertStudentMarks(
    studentId: string,
    courseId: string,
    assessmentType: string,
    maxMarks: number,
    obtainedMarks: number,
    enteredBy: string,
    assessmentDate?: string,
  ): Promise<string> {
    const { data, error } = await this.supabase.rpc("upsert_student_marks", {
      p_student_id: studentId,
      p_course_id: courseId,
      p_assessment_type: assessmentType,
      p_max_marks: maxMarks,
      p_obtained_marks: obtainedMarks,
      p_entered_by: enteredBy,
      p_assessment_date: assessmentDate || new Date().toISOString().split("T")[0],
    })

    if (error) {
      console.error("Error upserting student marks:", error)
      throw new Error(`Failed to save student marks: ${error.message}`)
    }

    return data
  }

  async saveMultipleMarks(
    marks: Array<{
      studentId: string
      courseId: string
      assessmentType: string
      maxMarks: number
      obtainedMarks: number
      enteredBy: string
      assessmentDate?: string
    }>,
  ): Promise<void> {
    const promises = marks.map((mark) =>
      this.upsertStudentMarks(
        mark.studentId,
        mark.courseId,
        mark.assessmentType,
        mark.maxMarks,
        mark.obtainedMarks,
        mark.enteredBy,
        mark.assessmentDate,
      ),
    )

    await Promise.all(promises)
  }
}

export const marksService = new MarksService()
