export interface Subject {
  id: string
  code: string
  name: string
  department: string
  semester: number
  credits: number
  academic_year?: string // Change from academicYear to academic_year
  syllabus?: string
  faculty_id?: string
  faculty_name?: string
  section?: string
}
