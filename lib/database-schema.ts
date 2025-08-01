// lib/database-schema.ts
// This file defines the types for your Supabase tables.
// Ensure these types match your actual database schema.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_date: string | null
          achievement_type: string | null
          created_at: string
          description: string | null
          id: string
          student_id: string | null
          title: string | null
          verified: boolean | null
          verified_by: string | null
        }
        Insert: {
          achievement_date?: string | null
          achievement_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          student_id?: string | null
          title?: string | null
          verified?: boolean | null
          verified_by?: string | null
        }
        Update: {
          achievement_date?: string | null
          achievement_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          student_id?: string | null
          title?: string | null
          verified?: boolean | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "achievements_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string | null
          created_at: string
          id: string
          title: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          title?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          attendance_date: string | null
          course_id: string | null
          created_at: string
          id: string
          is_present: boolean | null
          student_id: string | null
        }
        Insert: {
          attendance_date?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          is_present?: boolean | null
          student_id?: string | null
        }
        Update: {
          attendance_date?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          is_present?: boolean | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_sessions: {
        Row: {
          id: string
          course_id: string
          subject_assignment_id: string
          date: string
          created_by_id: string
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          subject_assignment_id: string
          date: string
          created_by_id: string
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          subject_assignment_id?: string
          date?: string
          created_by_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_sessions_subject_assignment_id_fkey"
            columns: ["subject_assignment_id"]
            isOneToOne: false
            referencedRelation: "subject_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_sessions_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          id: string
          session_id: string
          student_id: string
          student_enrollment_id: string
          is_present: boolean
          marked_at: string
          marked_by_id: string
          status: string | null
        }
        Insert: {
          id?: string
          session_id: string
          student_id: string
          student_enrollment_id: string
          is_present: boolean
          marked_at?: string
          marked_by_id: string
          status?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          student_id?: string
          student_enrollment_id?: string
          is_present?: boolean
          marked_at?: string
          marked_by_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "attendance_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_enrollment_id_fkey"
            columns: ["student_enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_marked_by_id_fkey"
            columns: ["marked_by_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_years: {
        Row: {
          id: string
          year_name: string
          start_date: string
          end_date: string
          is_current: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          year_name: string
          start_date: string
          end_date: string
          is_current?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          year_name?: string
          start_date?: string
          end_date?: string
          is_current?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      certifications: {
        Row: {
          certification_date: string | null
          created_at: string
          description: string | null
          id: string
          student_id: string | null
          title: string | null
        }
        Insert: {
          certification_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          student_id?: string | null
          title?: string | null
        }
        Update: {
          certification_date?: string | null
          created_at?: string
          description?: string | null
          id?: string
          student_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certifications_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      co_po_mapping: {
        Row: {
          co_id: string
          created_at: string
          id: string
          po_id: string
          strength: number | null
          subject_id: string
        }
        Insert: {
          co_id: string
          created_at?: string
          id?: string
          po_id: string
          strength?: number | null
          subject_id: string
        }
        Update: {
          co_id?: string
          created_at?: string
          id?: string
          po_id?: string
          strength?: number | null
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "co_po_mapping_co_id_fkey"
            columns: ["co_id"]
            isOneToOne: false
            referencedRelation: "course_outcomes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "co_po_mapping_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "program_outcomes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "co_po_mapping_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      course_end_survey_questions: {
        Row: {
          created_at: string
          id: string
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          subject_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_text: string
          question_type: Database["public"]["Enums"]["question_type"]
          subject_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_text?: string
          question_type?: Database["public"]["Enums"]["question_type"]
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_end_survey_questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      course_end_survey_responses: {
        Row: {
          created_at: string
          id: string
          question_id: string
          response_value: number
          student_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          response_value: number
          student_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          response_value?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_end_survey_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "course_end_survey_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_end_survey_responses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      course_faculty_assignments: {
        Row: {
          course_id: string
          created_at: string
          faculty_id: string
          id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          faculty_id: string
          id?: string
        }
        Update: {
          course_id?: string
          created_at?: string
          faculty_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_faculty_assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_faculty_assignments_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      course_outcomes: {
        Row: {
          co_code: string
          created_at: string
          description: string | null
          id: string
          subject_id: string
        }
        Insert: {
          co_code: string
          created_at?: string
          description?: string | null
          id?: string
          subject_id: string
        }
        Update: {
          co_code?: string
          created_at?: string
          description?: string | null
          id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_outcomes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          academic_year: string | null
          component_type: Database["public"]["Enums"]["subject_component_type"] | null
          course_code: string | null
          course_name: string | null
          credits: number | null
          created_at: string
          department: string | null
          department_id: string | null
          faculty_id: string | null
          id: string
          section: string | null
          semester: number | null
          subject_id: string
          batch: string | null
        }
        Insert: {
          academic_year?: string | null
          component_type?: Database["public"]["Enums"]["subject_component_type"] | null
          course_code?: string | null
          course_name?: string | null
          credits?: number | null
          created_at?: string
          department?: string | null
          department_id?: string | null
          faculty_id?: string | null
          id?: string
          section?: string | null
          semester?: number | null
          subject_id: string
          batch?: string | null
        }
        Update: {
          academic_year?: string | null
          component_type?: Database["public"]["Enums"]["subject_component_type"] | null
          course_code?: string | null
          course_name?: string | null
          credits?: number | null
          created_at?: string
          department?: string | null
          department_id?: string | null
          faculty_id?: string | null
          id?: string
          section?: string | null
          semester?: number | null
          subject_id?: string
          batch?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          id: string
          course_id: string
          student_id: string
          enrollment_date: string
          is_active: boolean
          created_at: string
          updated_at: string
          batch: string | null
        }
        Insert: {
          id?: string
          course_id: string
          student_id: string
          enrollment_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          batch?: string | null
        }
        Update: {
          id?: string
          course_id?: string
          student_id?: string
          enrollment_date?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
          batch?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          established_date: string | null
          head: string | null
          hod_id: string | null
          id: string
          name: string
          short_name: string | null
          total_courses: number | null
          total_faculty: number | null
          total_students: number | null
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          established_date?: string | null
          head?: string | null
          hod_id?: string | null
          id?: string
          name: string
          short_name?: string | null
          total_courses?: number | null
          total_faculty?: number | null
          total_students?: number | null
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          established_date?: string | null
          head?: string | null
          hod_id?: string | null
          id?: string
          name?: string
          short_name?: string | null
          total_courses?: number | null
          total_faculty?: number | null
          total_students?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_hod_id_fkey"
            columns: ["hod_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty: {
        Row: {
          created_at: string
          designation: string | null
          employee_id: string | null
          experience_years: number | null
          is_coordinator: boolean | null
          is_hod: boolean | null
          join_date: string | null
          qualification: string | null
          specialization: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          designation?: string | null
          employee_id?: string | null
          experience_years?: number | null
          is_coordinator?: boolean | null
          is_hod?: boolean | null
          join_date?: string | null
          qualification?: string | null
          specialization?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          designation?: string | null
          employee_id?: string | null
          experience_years?: number | null
          is_coordinator?: boolean | null
          is_hod?: boolean | null
          join_date?: string | null
          qualification?: string | null
          specialization?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculty_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_responses: {
        Row: {
          created_at: string
          faculty_id: string
          feedback_date: string
          id: string
          rating: number
          student_id: string
          subject_id: string
        }
        Insert: {
          created_at?: string
          faculty_id: string
          feedback_date?: string
          id?: string
          rating: number
          student_id: string
          subject_id: string
        }
        Update: {
          created_at?: string
          faculty_id?: string
          feedback_date?: string
          id?: string
          rating?: number
          student_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_responses_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_responses_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_responses_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_schedules: {
        Row: {
          created_at: string
          end_date: string
          id: string
          start_date: string
          subject_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          start_date: string
          subject_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          start_date?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_schedules_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      ia_marks: {
        Row: {
          assessment_type: Database["public"]["Enums"]["assessment_type"] | null
          course_id: string | null
          created_at: string
          id: string
          marks_obtained: number | null
          max_marks: number | null
          student_id: string | null
        }
        Insert: {
          assessment_type?: Database["public"]["Enums"]["assessment_type"] | null
          course_id?: string | null
          created_at?: string
          id?: string
          marks_obtained?: number | null
          max_marks?: number | null
          student_id?: string | null
        }
        Update: {
          assessment_type?: Database["public"]["Enums"]["assessment_type"] | null
          course_id?: string | null
          created_at?: string
          id?: string
          marks_obtained?: number | null
          max_marks?: number | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ia_marks_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ia_marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leaves: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          reason: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["leave_status"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          reason?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["leave_status"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          reason?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["leave_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaves_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          subject_id: string | null
          title: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          subject_id?: string | null
          title?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          subject_id?: string | null
          title?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "materials_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materials_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          content: string | null
          created_at: string
          id: string
          read: boolean | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          read?: boolean | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          read?: boolean | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      program_outcomes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          po_code: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          po_code: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          po_code?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          admission_date: string | null
          admission_number: string | null
          batch: string | null
          blood_group: string | null
          cgpa: number | null
          created_at: string
          father_name: string | null
          parent_name: string | null
          parent_phone: string | null
          roll_number: string | null
          section: string | null
          semester: string | null
          updated_at: string
          user_id: string
          usn: string | null
        }
        Insert: {
          admission_date?: string | null
          admission_number?: string | null
          batch?: string | null
          blood_group?: string | null
          cgpa?: number | null
          created_at?: string
          father_name?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          roll_number?: string | null
          section?: string | null
          semester?: string | null
          updated_at?: string
          user_id: string
          usn?: string | null
        }
        Update: {
          admission_date?: string | null
          admission_number?: string | null
          batch?: string | null
          blood_group?: string | null
          cgpa?: number | null
          created_at?: string
          father_name?: string | null
          parent_name?: string | null
          parent_phone?: string | null
          roll_number?: string | null
          section?: string | null
          semester?: string | null
          updated_at?: string
          user_id?: string
          usn?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_assignments: {
        Row: {
          id: string
          faculty_id: string
          subject_id: string
          academic_year_id: string
          section: string
          is_active: boolean
          assigned_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          faculty_id: string
          subject_id: string
          academic_year_id: string
          section: string
          is_active?: boolean
          assigned_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          faculty_id?: string
          subject_id?: string
          academic_year_id?: string
          section?: string
          is_active?: boolean
          assigned_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_assignments_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_assignments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          academic_year: string | null
          code: string
          course_category: Database["public"]["Enums"]["course_category_type"] | null
          credits: number | null
          created_at: string
          department: string | null
          faculty_id: string | null
          has_lab: boolean | null
          has_project: boolean | null
          has_theory: boolean | null
          id: string
          name: string
          section: string | null
          semester: number | null
          subject_type: string | null
          syllabus: string | null
          updated_at: string
          number_of_batches: number | null
          department_id: string | null
        }
        Insert: {
          academic_year?: string | null
          code: string
          course_category?: Database["public"]["Enums"]["course_category_type"] | null
          credits?: number | null
          created_at?: string
          department?: string | null
          faculty_id?: string | null
          has_lab?: boolean | null
          has_project?: boolean | null
          has_theory?: boolean | null
          id?: string
          name: string
          section?: string | null
          semester?: number | null
          subject_type?: string | null
          syllabus?: string | null
          updated_at?: string
          number_of_batches?: number | null
          department_id?: string | null
        }
        Update: {
          academic_year?: string | null
          code?: string
          course_category?: Database["public"]["Enums"]["course_category_type"] | null
          credits?: number | null
          created_at?: string
          department?: string | null
          faculty_id?: string | null
          has_lab?: boolean | null
          has_project?: boolean | null
          has_theory?: boolean | null
          id?: string
          name?: string
          section?: string | null
          semester?: number | null
          subject_type?: string | null
          syllabus?: string | null
          updated_at?: string
          number_of_batches?: number | null
          department_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "subjects_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      timetables: {
        Row: {
          academic_year: string
          created_at: string
          data: Json
          id: string
          section: string
          semester: number
          updated_at: string
        }
        Insert: {
          academic_year: string
          created_at?: string
          data: Json
          id?: string
          section: string
          semester: number
          updated_at?: string
        }
        Update: {
          academic_year?: string
          created_at?: string
          data?: Json
          id?: string
          section?: string
          semester: number
          updated_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          address: string | null
          created_at: string
          date_of_birth: string | null
          gender: Database["public"]["Enums"]["gender"] | null
          id: string
          phone_number: string | null
          profile_picture_url: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          phone_number?: string | null
          profile_picture_url?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          date_of_birth?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          phone_number?: string | null
          profile_picture_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          alternate_phone: string | null
          created_at: string
          department: string | null
          email: string
          first_name: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          name: string | null
          phone: string | null
          profile_picture: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          alternate_phone?: string | null
          created_at?: string
          department?: string | null
          email: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          name?: string | null
          phone?: string | null
          profile_picture?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          alternate_phone?: string | null
          created_at?: string
          department?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          name?: string | null
          phone?: string | null
          profile_picture?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      assessment_type: "IA1" | "IA2" | "IA3" | "SEE" | "Assignment" | "Quiz"
      course_category_type: "IPCC" | "PCC" | "PEC" | "OEC" | "PROJ"
      day_of_week: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
      gender: "Male" | "Female" | "Other"
      leave_status: "Pending" | "Approved" | "Rejected"
      question_type: "rating" | "text"
      subject_component_type: "theory" | "lab" | "project"
      user_role: "student" | "faculty" | "hod" | "coordinator" | "principal" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"]) | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    ? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

// Custom types for convenience
export type SubjectType = Tables<"subjects">
export type CourseType = Tables<"courses"> & {
  subjects?: SubjectType | null
  assigned_faculty?: FacultyProfile[]
}
export type Department = Tables<"departments"> & {
  hod_name?: string | null
}
export type DepartmentType = Department

export type FacultyProfile = {
  id: string
  user_id: string
  name: string
  employeeId: string | null
  email: string
  phone: string | null
  department: string | null
  designation: string | null
  qualification: string | null
  join_date: string | null
  is_hod: boolean
  is_coordinator: boolean
  status: string
  profilePicture?: string | null
  role: string
}

// Define StudentProfile type based on the joined data structure
export type StudentProfile = {
  user_id: string
  id: string
  name: string
  usn: string | null
  email: string
  phone: string | null
  department: string
  semester: string | null
  section: string | null
  batch: string | null
  enrollmentDate: string
  profilePicture: string | null
  is_active: boolean | null
  cgpa: number | null
  roll_number: string | null
  status: string
  role: string
}

// Define ApplicationType for the 'leaves' table, as it's used for forms/applications
export type ApplicationType = Tables<"leaves"> & {
  user?: { department: string | null } | null // Add user department for filtering
}
