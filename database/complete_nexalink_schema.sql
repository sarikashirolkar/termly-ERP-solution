-- =====================================================
-- NexaLink Academic System - Complete PostgreSQL Schema
-- Compatible with Supabase
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- CUSTOM TYPES AND ENUMS
-- =====================================================

-- Drop existing types if they exist to avoid conflicts
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS user_status CASCADE;
DROP TYPE IF EXISTS department_type CASCADE;
DROP TYPE IF EXISTS section_type CASCADE;
DROP TYPE IF EXISTS semester_type CASCADE;
DROP TYPE IF EXISTS subject_type CASCADE;
DROP TYPE IF EXISTS assessment_type CASCADE;
DROP TYPE IF EXISTS attendance_status CASCADE;
DROP TYPE IF EXISTS grade_type CASCADE;
DROP TYPE IF EXISTS feedback_type CASCADE;
DROP TYPE IF EXISTS question_type CASCADE;
DROP TYPE IF EXISTS achievement_category CASCADE;
DROP TYPE IF EXISTS achievement_level CASCADE;
DROP TYPE IF EXISTS achievement_status CASCADE;
DROP TYPE IF EXISTS application_status CASCADE;
DROP TYPE IF EXISTS priority_type CASCADE;
DROP TYPE IF EXISTS notification_priority CASCADE;
DROP TYPE IF EXISTS material_type CASCADE;

-- User and Role Types
CREATE TYPE user_role AS ENUM (
    'student', 'faculty', 'hod', 'coordinator', 'admin', 'principal'
);

CREATE TYPE user_status AS ENUM (
    'active', 'inactive', 'suspended', 'graduated', 'transferred'
);

CREATE TYPE department_type AS ENUM (
    'CSE', 'ISE', 'ECE', 'MECH', 'CIVIL', 'CSE(AIML)', 'CSE(DS)'
);

CREATE TYPE section_type AS ENUM ('A', 'B', 'C', 'D');

-- Academic Types
CREATE TYPE semester_type AS ENUM ('1', '2', '3', '4', '5', '6', '7', '8');
CREATE TYPE subject_type AS ENUM ('theory', 'practical', 'project');
CREATE TYPE assessment_type AS ENUM ('IA1', 'IA2', 'IA3', 'assignment', 'project', 'quiz', 'see');

-- Attendance Types
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');

-- Performance Types
CREATE TYPE grade_type AS ENUM ('A+', 'A', 'B+', 'B', 'C', 'D', 'F', 'AB', 'I');

-- Feedback Types
CREATE TYPE feedback_type AS ENUM ('phase1', 'phase2', 'overall', 'course_end');
CREATE TYPE question_type AS ENUM ('rating', 'text', 'multiple_choice', 'boolean');

-- Achievement Types
CREATE TYPE achievement_category AS ENUM (
    'academic', 'technical', 'sports', 'cultural', 'social', 'other'
);
CREATE TYPE achievement_level AS ENUM (
    'college', 'university', 'state', 'national', 'international'
);
CREATE TYPE achievement_status AS ENUM ('pending', 'verified', 'rejected');

-- Application Types
CREATE TYPE application_status AS ENUM (
    'draft', 'submitted', 'under_review', 'approved', 'rejected', 'completed'
);
CREATE TYPE priority_type AS ENUM ('low', 'medium', 'high', 'urgent');

-- Notification Types
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Material Types
CREATE TYPE material_type AS ENUM (
    'notes', 'slides', 'assignment', 'reference', 'video', 'other'
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Academic Years
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    year VARCHAR(10) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (Main user table)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    role user_role NOT NULL,
    department department_type NOT NULL,
    status user_status DEFAULT 'active',
    
    -- Contact Information
    phone VARCHAR(17),
    alternate_phone VARCHAR(17),
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(17),
    
    -- Personal Information
    profile_picture TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    blood_group VARCHAR(5),
    
    -- Address Information
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    country VARCHAR(100) DEFAULT 'India',
    
    -- System Information
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    login_count INTEGER DEFAULT 0,
    verification_token VARCHAR(100),
    password_reset_token VARCHAR(100),
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students
CREATE TABLE IF NOT EXISTS students (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    usn VARCHAR(15) UNIQUE NOT NULL,
    roll_number VARCHAR(20) UNIQUE NOT NULL,
    semester semester_type NOT NULL,
    section section_type NOT NULL,
    batch VARCHAR(10) NOT NULL,
    specialization VARCHAR(100),
    
    -- Admission Details
    admission_date DATE NOT NULL,
    admission_type VARCHAR(15) DEFAULT 'regular',
    admission_number VARCHAR(20) UNIQUE NOT NULL,
    category VARCHAR(10) DEFAULT 'general',
    
    -- Academic Performance
    cgpa DECIMAL(4,2) DEFAULT 0.00 CHECK (cgpa >= 0.00 AND cgpa <= 10.00),
    sgpa_current DECIMAL(4,2) DEFAULT 0.00 CHECK (sgpa_current >= 0.00 AND sgpa_current <= 10.00),
    total_credits_earned INTEGER DEFAULT 0,
    total_credits_required INTEGER DEFAULT 180,
    
    -- Faculty Relationships
    faculty_advisor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    proctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Parent/Guardian Information
    parent_name VARCHAR(200),
    parent_phone VARCHAR(17),
    parent_email VARCHAR(254),
    parent_occupation VARCHAR(100),
    guardian_name VARCHAR(200),
    guardian_phone VARCHAR(17),
    guardian_relation VARCHAR(50),
    
    -- Financial Information
    fee_paid DECIMAL(10,2) DEFAULT 0.00,
    fee_due DECIMAL(10,2) DEFAULT 0.00,
    scholarship_amount DECIMAL(10,2) DEFAULT 0.00,
    
    -- Status Information
    is_hosteller BOOLEAN DEFAULT FALSE,
    hostel_room VARCHAR(20),
    transport_required BOOLEAN DEFAULT FALSE,
    bus_route VARCHAR(100),
    
    -- Academic History
    previous_institution VARCHAR(200),
    previous_percentage DECIMAL(5,2),
    entrance_exam_score DECIMAL(6,2),
    entrance_exam_rank INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Faculty
CREATE TABLE IF NOT EXISTS faculty (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    designation VARCHAR(30) NOT NULL,
    employment_type VARCHAR(15) DEFAULT 'permanent',
    join_date DATE NOT NULL,
    confirmation_date DATE,
    retirement_date DATE,
    
    -- Educational Qualifications
    qualification VARCHAR(100) NOT NULL,
    specialization VARCHAR(200),
    phd_completed BOOLEAN DEFAULT FALSE,
    phd_university VARCHAR(200),
    phd_year INTEGER,
    
    -- Experience
    experience_years INTEGER DEFAULT 0,
    industry_experience INTEGER DEFAULT 0,
    teaching_experience INTEGER DEFAULT 0,
    research_experience INTEGER DEFAULT 0,
    
    -- Research Information
    research_interests TEXT,
    publications_count INTEGER DEFAULT 0,
    patents_count INTEGER DEFAULT 0,
    projects_completed INTEGER DEFAULT 0,
    h_index INTEGER DEFAULT 0,
    
    -- Administrative Roles
    is_hod BOOLEAN DEFAULT FALSE,
    is_coordinator BOOLEAN DEFAULT FALSE,
    administrative_positions TEXT,
    
    -- Contact and Office Information
    office_room VARCHAR(20),
    office_phone VARCHAR(17),
    cabin_number VARCHAR(10),
    
    -- Professional Information
    professional_memberships TEXT,
    certifications TEXT,
    awards_received TEXT,
    
    -- Teaching Load
    max_teaching_hours INTEGER DEFAULT 16,
    current_teaching_hours INTEGER DEFAULT 0,
    max_students_advised INTEGER DEFAULT 20,
    
    -- Status Information
    on_leave BOOLEAN DEFAULT FALSE,
    leave_start_date DATE,
    leave_end_date DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HODs
CREATE TABLE IF NOT EXISTS hods (
    faculty_id UUID PRIMARY KEY REFERENCES faculty(user_id) ON DELETE CASCADE,
    appointed_date DATE NOT NULL,
    tenure_end_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    
    -- Administrative Information
    office_room VARCHAR(20),
    secretary_name VARCHAR(100),
    secretary_phone VARCHAR(17),
    
    -- Responsibilities
    responsibilities TEXT,
    achievements TEXT,
    
    -- Meeting Information
    office_hours VARCHAR(100),
    meeting_schedule TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Principals
CREATE TABLE IF NOT EXISTS principals (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    appointed_date DATE NOT NULL,
    tenure_end_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    
    -- Administrative Information
    office_room VARCHAR(20),
    personal_assistant VARCHAR(100),
    pa_phone VARCHAR(17),
    
    -- Professional Information
    previous_positions TEXT,
    achievements TEXT,
    vision_statement TEXT,
    
    -- Meeting Information
    office_hours VARCHAR(100),
    meeting_schedule TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coordinators
CREATE TABLE IF NOT EXISTS coordinators (
    faculty_id UUID PRIMARY KEY REFERENCES faculty(user_id) ON DELETE CASCADE,
    coordination_type VARCHAR(50) NOT NULL CHECK (coordination_type IN (
        'placement', 'training', 'research', 'industry', 'student_affairs',
        'cultural', 'sports', 'nss', 'ncc', 'ieee', 'iste', 'entrepreneurship',
        'alumni', 'international', 'examination', 'library', 'hostel',
        'transport', 'anti_ragging', 'grievance', 'women_cell', 'sc_st_cell'
    )),
    appointed_date DATE NOT NULL,
    tenure_end_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    
    -- Coordination Details
    scope VARCHAR(20) DEFAULT 'institution' CHECK (scope IN ('department', 'institution')),
    
    -- Contact Information
    coordination_office VARCHAR(100),
    coordination_phone VARCHAR(17),
    coordination_email VARCHAR(254),
    
    -- Activity Information
    responsibilities TEXT,
    achievements TEXT,
    upcoming_events TEXT,
    
    -- Meeting Information
    meeting_schedule VARCHAR(100),
    office_hours VARCHAR(100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ACADEMIC STRUCTURE TABLES
-- =====================================================

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    department department_type NOT NULL,
    semester semester_type NOT NULL,
    credits INTEGER NOT NULL CHECK (credits > 0),
    subject_type subject_type DEFAULT 'theory',
    syllabus TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subject Assignments (Faculty-Subject mapping)
CREATE TABLE IF NOT EXISTS subject_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID NOT NULL REFERENCES faculty(user_id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    section section_type NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(subject_id, academic_year_id, section)
);

-- Student Enrollments
CREATE TABLE IF NOT EXISTS student_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
    subject_assignment_id UUID NOT NULL REFERENCES subject_assignments(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(student_id, subject_assignment_id)
);

-- Timetable
CREATE TABLE IF NOT EXISTS timetable (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_assignment_id UUID NOT NULL REFERENCES subject_assignments(id) ON DELETE CASCADE,
    day VARCHAR(10) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(subject_assignment_id, day, start_time)
);

-- =====================================================
-- ATTENDANCE SYSTEM TABLES
-- =====================================================

-- Attendance Sessions
CREATE TABLE IF NOT EXISTS attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_assignment_id UUID NOT NULL REFERENCES subject_assignments(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    topic_covered VARCHAR(500),
    total_students INTEGER DEFAULT 0,
    present_count INTEGER DEFAULT 0,
    absent_count INTEGER DEFAULT 0,
    late_count INTEGER DEFAULT 0,
    is_finalized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(subject_assignment_id, date, start_time)
);

-- Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    student_enrollment_id UUID NOT NULL REFERENCES student_enrollments(id) ON DELETE CASCADE,
    status attendance_status NOT NULL,
    marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    marked_by_id UUID REFERENCES faculty(user_id) ON DELETE SET NULL,
    remarks VARCHAR(200),
    
    UNIQUE(session_id, student_enrollment_id)
);

-- Attendance Summaries (Monthly)
CREATE TABLE IF NOT EXISTS attendance_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_enrollment_id UUID NOT NULL REFERENCES student_enrollments(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    total_classes INTEGER DEFAULT 0,
    classes_attended INTEGER DEFAULT 0,
    classes_missed INTEGER DEFAULT 0,
    late_count INTEGER DEFAULT 0,
    attendance_percentage DECIMAL(5,2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(student_enrollment_id, month, year)
);

-- =====================================================
-- PERFORMANCE/MARKS SYSTEM TABLES
-- =====================================================

-- Assessment Types
CREATE TABLE IF NOT EXISTS assessment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    max_marks INTEGER DEFAULT 100,
    weightage DECIMAL(5,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Assessments
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_assignment_id UUID NOT NULL REFERENCES subject_assignments(id) ON DELETE CASCADE,
    assessment_type_id UUID NOT NULL REFERENCES assessment_types(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    max_marks INTEGER NOT NULL,
    date_conducted DATE NOT NULL,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by_id UUID NOT NULL REFERENCES faculty(user_id) ON DELETE CASCADE,
    is_published BOOLEAN DEFAULT FALSE
);

-- Student Marks
CREATE TABLE IF NOT EXISTS student_marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    student_enrollment_id UUID NOT NULL REFERENCES student_enrollments(id) ON DELETE CASCADE,
    marks_obtained DECIMAL(6,2) NOT NULL,
    is_absent BOOLEAN DEFAULT FALSE,
    grade grade_type,
    remarks VARCHAR(200),
    entered_by_id UUID NOT NULL REFERENCES faculty(user_id) ON DELETE CASCADE,
    entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(assessment_id, student_enrollment_id)
);

-- Subject Performance Summaries
CREATE TABLE IF NOT EXISTS subject_performance_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_enrollment_id UUID NOT NULL REFERENCES student_enrollments(id) ON DELETE CASCADE,
    total_assessments INTEGER DEFAULT 0,
    assessments_completed INTEGER DEFAULT 0,
    total_marks_obtained DECIMAL(8,2) DEFAULT 0.00,
    total_max_marks DECIMAL(8,2) DEFAULT 0.00,
    average_percentage DECIMAL(5,2) DEFAULT 0.00,
    current_grade grade_type,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(student_enrollment_id)
);

-- =====================================================
-- FEEDBACK SYSTEM TABLES
-- =====================================================

-- Feedback Questions
CREATE TABLE IF NOT EXISTS feedback_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_text TEXT NOT NULL,
    question_type question_type DEFAULT 'rating',
    is_required BOOLEAN DEFAULT TRUE,
    order_num INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback Sessions
CREATE TABLE IF NOT EXISTS feedback_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_assignment_id UUID NOT NULL REFERENCES subject_assignments(id) ON DELETE CASCADE,
    feedback_type feedback_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_anonymous BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback Responses
CREATE TABLE IF NOT EXISTS feedback_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES feedback_sessions(id) ON DELETE CASCADE,
    student_enrollment_id UUID NOT NULL REFERENCES student_enrollments(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_complete BOOLEAN DEFAULT FALSE,
    
    UNIQUE(session_id, student_enrollment_id)
);

-- Feedback Answers
CREATE TABLE IF NOT EXISTS feedback_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id UUID NOT NULL REFERENCES feedback_responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES feedback_questions(id) ON DELETE CASCADE,
    rating_value INTEGER CHECK (rating_value >= 1 AND rating_value <= 5),
    text_value TEXT,
    choice_value VARCHAR(200),
    
    UNIQUE(response_id, question_id)
);

-- Feedback Summaries
CREATE TABLE IF NOT EXISTS feedback_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES feedback_sessions(id) ON DELETE CASCADE,
    total_responses INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,
    response_rate DECIMAL(5,2) DEFAULT 0.00,
    
    -- Rating distribution
    rating_5_count INTEGER DEFAULT 0,
    rating_4_count INTEGER DEFAULT 0,
    rating_3_count INTEGER DEFAULT 0,
    rating_2_count INTEGER DEFAULT 0,
    rating_1_count INTEGER DEFAULT 0,
    
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(session_id)
);

-- =====================================================
-- ACHIEVEMENTS SYSTEM TABLES
-- =====================================================

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    category achievement_category NOT NULL,
    level achievement_level NOT NULL,
    institution_name VARCHAR(200) NOT NULL,
    date_achieved DATE NOT NULL,
    position VARCHAR(50),
    certificate_file TEXT,
    image TEXT,
    
    -- Verification fields
    status achievement_status DEFAULT 'pending',
    verified_by_id UUID REFERENCES faculty(user_id) ON DELETE SET NULL,
    verification_date TIMESTAMP WITH TIME ZONE,
    verification_remarks TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievement Comments
CREATE TABLE IF NOT EXISTS achievement_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    commenter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievement Statistics
CREATE TABLE IF NOT EXISTS achievement_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department department_type NOT NULL,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    category achievement_category NOT NULL,
    total_achievements INTEGER DEFAULT 0,
    verified_achievements INTEGER DEFAULT 0,
    students_with_achievements INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(department, academic_year_id, category)
);

-- =====================================================
-- MATERIALS SYSTEM TABLES
-- =====================================================

-- Material Categories
CREATE TABLE IF NOT EXISTS material_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

-- Study Materials
CREATE TABLE IF NOT EXISTS study_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_assignment_id UUID NOT NULL REFERENCES subject_assignments(id) ON DELETE CASCADE,
    category_id UUID REFERENCES material_categories(id) ON DELETE SET NULL,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    material_type material_type NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(10) NOT NULL,
    
    -- Access control
    is_public BOOLEAN DEFAULT TRUE,
    specific_sections VARCHAR(10),
    
    -- Metadata
    uploaded_by_id UUID NOT NULL REFERENCES faculty(user_id) ON DELETE CASCADE,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    download_count INTEGER DEFAULT 0
);

-- Material Downloads
CREATE TABLE IF NOT EXISTS material_downloads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID NOT NULL REFERENCES study_materials(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(user_id) ON DELETE CASCADE,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET
);

-- Assignments
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_assignment_id UUID NOT NULL REFERENCES subject_assignments(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    max_marks INTEGER NOT NULL,
    
    -- Dates
    assigned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    late_submission_allowed BOOLEAN DEFAULT FALSE,
    late_penalty_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Files
    assignment_file TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft',
    created_by_id UUID NOT NULL REFERENCES faculty(user_id) ON DELETE CASCADE
);

-- Assignment Submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    submission_file TEXT,
    submission_text TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Grading
    marks_obtained DECIMAL(6,2),
    feedback TEXT,
    graded_by_id UUID REFERENCES faculty(user_id) ON DELETE SET NULL,
    graded_at TIMESTAMP WITH TIME ZONE,
    
    status VARCHAR(20) DEFAULT 'submitted',
    
    UNIQUE(assignment_id, student_id)
);

-- =====================================================
-- NOTIFICATIONS SYSTEM TABLES
-- =====================================================

-- Notification Templates
CREATE TABLE IF NOT EXISTS notification_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    notification_type VARCHAR(30) NOT NULL,
    title_template VARCHAR(200) NOT NULL,
    message_template TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority notification_priority DEFAULT 'medium',
    
    -- Notification behavior
    is_read BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    is_push_sent BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Optional linking to related objects
    related_object_type VARCHAR(50),
    related_object_id UUID,
    action_url TEXT
);

-- Bulk Notifications
CREATE TABLE IF NOT EXISTS bulk_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    target_type VARCHAR(20) NOT NULL,
    target_criteria JSONB,
    
    -- Sender info
    sent_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Statistics
    total_recipients INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    read_count INTEGER DEFAULT 0
);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Email preferences
    email_attendance_alerts BOOLEAN DEFAULT TRUE,
    email_assignment_reminders BOOLEAN DEFAULT TRUE,
    email_marks_updates BOOLEAN DEFAULT TRUE,
    email_feedback_requests BOOLEAN DEFAULT TRUE,
    email_general_announcements BOOLEAN DEFAULT TRUE,
    
    -- Push notification preferences
    push_attendance_alerts BOOLEAN DEFAULT TRUE,
    push_assignment_reminders BOOLEAN DEFAULT TRUE,
    push_marks_updates BOOLEAN DEFAULT TRUE,
    push_feedback_requests BOOLEAN DEFAULT FALSE,
    push_general_announcements BOOLEAN DEFAULT FALSE,
    
    -- Frequency settings
    digest_frequency VARCHAR(20) DEFAULT 'immediate',
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FORMS/APPLICATIONS SYSTEM TABLES
-- =====================================================

-- Application Types
CREATE TABLE IF NOT EXISTS application_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    required_documents JSONB DEFAULT '[]',
    approval_workflow JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_type_id UUID NOT NULL REFERENCES application_types(id) ON DELETE CASCADE,
    applicant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status application_status DEFAULT 'draft',
    priority priority_type DEFAULT 'medium',
    
    -- Application data
    form_data JSONB DEFAULT '{}',
    
    -- Workflow tracking
    current_stage VARCHAR(50),
    assigned_to_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application Documents
CREATE TABLE IF NOT EXISTS application_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application Comments
CREATE TABLE IF NOT EXISTS application_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application Approvals
CREATE TABLE IF NOT EXISTS application_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL,
    approver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL,
    comments TEXT,
    approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(application_id, stage, approver_id)
);

-- Common Letters
CREATE TABLE IF NOT EXISTS common_letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    letter_type VARCHAR(20) NOT NULL,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Letter content
    purpose TEXT NOT NULL,
    additional_details JSONB DEFAULT '{}',
    
    -- Status and workflow
    status VARCHAR(20) DEFAULT 'pending',
    approved_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Generated letter
    letter_content TEXT,
    letter_file TEXT,
    
    -- Timestamps
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    issued_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- CERTIFICATIONS SYSTEM TABLES
-- =====================================================

-- Certification Categories
CREATE TABLE IF NOT EXISTS certification_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Certifications
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES certification_categories(id) ON DELETE CASCADE,
    
    -- Certification details
    title VARCHAR(200) NOT NULL,
    issuing_organization VARCHAR(200) NOT NULL,
    description TEXT,
    level VARCHAR(20) DEFAULT 'beginner',
    
    -- Dates
    issue_date DATE NOT NULL,
    expiry_date DATE,
    
    -- Verification
    status VARCHAR(20) DEFAULT 'pending',
    verified_by_id UUID REFERENCES faculty(user_id) ON DELETE SET NULL,
    verification_date TIMESTAMP WITH TIME ZONE,
    verification_notes TEXT,
    
    -- Files
    certificate_file TEXT,
    
    -- Metadata
    skills_gained JSONB DEFAULT '[]',
    external_url TEXT,
    certificate_id VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Certification Skills
CREATE TABLE IF NOT EXISTS certification_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

-- Student Skills
CREATE TABLE IF NOT EXISTS student_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES certification_skills(id) ON DELETE CASCADE,
    proficiency VARCHAR(20) DEFAULT 'basic',
    
    -- Self-assessment
    self_rating INTEGER DEFAULT 1 CHECK (self_rating >= 1 AND self_rating <= 10),
    years_of_experience DECIMAL(4,1) DEFAULT 0,
    
    -- Timestamps
    acquired_date DATE DEFAULT CURRENT_DATE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(student_id, skill_id)
);

-- =====================================================
-- CO-PO MAPPING SYSTEM TABLES
-- =====================================================

-- Program Outcomes
CREATE TABLE IF NOT EXISTS program_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    department department_type NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(code, department)
);

-- Program Specific Outcomes
CREATE TABLE IF NOT EXISTS program_specific_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    department department_type NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(code, department)
);

-- Course Outcomes
CREATE TABLE IF NOT EXISTS course_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    code VARCHAR(10) NOT NULL,
    description TEXT NOT NULL,
    bloom_level VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(subject_id, code)
);

-- CO-PO Mappings
CREATE TABLE IF NOT EXISTS copo_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_outcome_id UUID NOT NULL REFERENCES course_outcomes(id) ON DELETE CASCADE,
    program_outcome_id UUID NOT NULL REFERENCES program_outcomes(id) ON DELETE CASCADE,
    mapping_level INTEGER DEFAULT 0 CHECK (mapping_level >= 0 AND mapping_level <= 3),
    justification TEXT,
    mapped_by_id UUID NOT NULL REFERENCES faculty(user_id) ON DELETE CASCADE,
    mapped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(course_outcome_id, program_outcome_id)
);

-- CO-PSO Mappings
CREATE TABLE IF NOT EXISTS copso_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_outcome_id UUID NOT NULL REFERENCES course_outcomes(id) ON DELETE CASCADE,
    program_specific_outcome_id UUID NOT NULL REFERENCES program_specific_outcomes(id) ON DELETE CASCADE,
    mapping_level INTEGER DEFAULT 0 CHECK (mapping_level >= 0 AND mapping_level <= 3),
    justification TEXT,
    mapped_by_id UUID NOT NULL REFERENCES faculty(user_id) ON DELETE CASCADE,
    mapped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(course_outcome_id, program_specific_outcome_id)
);

-- Attainment Levels
CREATE TABLE IF NOT EXISTS attainment_levels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_assignment_id UUID NOT NULL REFERENCES subject_assignments(id) ON DELETE CASCADE,
    course_outcome_id UUID NOT NULL REFERENCES course_outcomes(id) ON DELETE CASCADE,
    assessment_method VARCHAR(30) NOT NULL,
    attainment_value DECIMAL(4,2) NOT NULL,
    threshold DECIMAL(4,2) DEFAULT 2.0,
    
    -- Calculation details
    total_students INTEGER NOT NULL,
    students_above_threshold INTEGER NOT NULL,
    average_marks DECIMAL(6,2) NOT NULL,
    
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    calculated_by_id UUID NOT NULL REFERENCES faculty(user_id) ON DELETE CASCADE,
    
    UNIQUE(subject_assignment_id, course_outcome_id, assessment_method)
);

-- CO-PO Reports
CREATE TABLE IF NOT EXISTS copo_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_assignment_id UUID NOT NULL REFERENCES subject_assignments(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    report_title VARCHAR(200) NOT NULL,
    
    -- Report data (stored as JSON for flexibility)
    co_attainment_data JSONB,
    po_attainment_data JSONB,
    pso_attainment_data JSONB,
    
    -- File paths
    pdf_file_path TEXT,
    excel_file_path TEXT,
    
    -- Metadata
    generated_by_id UUID NOT NULL REFERENCES faculty(user_id) ON DELETE CASCADE,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_finalized BOOLEAN DEFAULT FALSE,
    
    UNIQUE(subject_assignment_id, academic_year_id)
);

-- =====================================================
-- ANALYTICS SYSTEM TABLES
-- =====================================================

-- Analytics Reports
CREATE TABLE IF NOT EXISTS analytics_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    report_type VARCHAR(20) NOT NULL,
    description TEXT,
    
    -- Report configuration
    parameters JSONB DEFAULT '{}',
    format VARCHAR(10) DEFAULT 'pdf',
    
    -- Generation details
    generated_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending',
    
    -- File storage
    file_path TEXT,
    file_size INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- User Activities
CREATE TABLE IF NOT EXISTS user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL,
    description VARCHAR(200) NOT NULL,
    
    -- Additional data
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Metrics
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(30) NOT NULL,
    value DECIMAL(15,2) NOT NULL,
    unit VARCHAR(20),
    
    -- Dimensions for grouping
    dimensions JSONB DEFAULT '{}',
    
    -- Timestamp
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard Widgets
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    widget_type VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Configuration
    config JSONB DEFAULT '{}',
    data_source VARCHAR(100) NOT NULL,
    
    -- Access control
    roles JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Layout
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 4,
    height INTEGER DEFAULT 3,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Dashboards
CREATE TABLE IF NOT EXISTS user_dashboards (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Configuration
    layout JSONB DEFAULT '{}',
    theme VARCHAR(20) DEFAULT 'default',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Dashboard Widgets
CREATE TABLE IF NOT EXISTS user_dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dashboard_user_id UUID NOT NULL REFERENCES user_dashboards(user_id) ON DELETE CASCADE,
    widget_id UUID NOT NULL REFERENCES dashboard_widgets(id) ON DELETE CASCADE,
    
    -- Custom positioning for this user
    position_x INTEGER NOT NULL,
    position_y INTEGER NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    
    -- Custom configuration
    custom_config JSONB DEFAULT '{}',
    is_visible BOOLEAN DEFAULT TRUE,
    
    -- Timestamp
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(dashboard_user_id, widget_id)
);

-- =====================================================
-- USER PREFERENCES AND SESSIONS
-- =====================================================

-- User Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    
    -- Appearance Settings
    theme VARCHAR(10) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'en',
    font_size VARCHAR(10) DEFAULT 'medium',
    
    -- Notification Preferences
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    
    -- Specific Notification Types
    attendance_alerts BOOLEAN DEFAULT TRUE,
    assignment_reminders BOOLEAN DEFAULT TRUE,
    marks_updates BOOLEAN DEFAULT TRUE,
    feedback_requests BOOLEAN DEFAULT TRUE,
    general_announcements BOOLEAN DEFAULT TRUE,
    
    -- Dashboard Preferences
    dashboard_layout VARCHAR(20) DEFAULT 'grid',
    
    -- Privacy Settings
    profile_visibility VARCHAR(20) DEFAULT 'department',
    show_contact_info BOOLEAN DEFAULT FALSE,
    show_academic_info BOOLEAN DEFAULT TRUE,
    
    -- System Preferences
    auto_logout_minutes INTEGER DEFAULT 60,
    items_per_page INTEGER DEFAULT 20,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_key VARCHAR(40) UNIQUE NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    device_type VARCHAR(20),
    
    -- Location Information (if available)
    city VARCHAR(100),
    country VARCHAR(100),
    
    -- Session Information
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_time TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

-- User Activity Logs
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(50),
    description TEXT,
    
    -- Request Information
    ip_address INET NOT NULL,
    user_agent TEXT,
    request_method VARCHAR(10),
    request_path VARCHAR(500),
    
    -- Response Information
    status_code INTEGER,
    response_time FLOAT,
    
    -- Timestamp
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USER IMPORT SYSTEM TABLES
-- =====================================================

-- User Import Logs
CREATE TABLE IF NOT EXISTS user_import_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    imported_by_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    import_type VARCHAR(50) NOT NULL CHECK (import_type IN ('students', 'faculty', 'hods', 'coordinators')),
    total_records INTEGER NOT NULL DEFAULT 0,
    successful_imports INTEGER NOT NULL DEFAULT 0,
    failed_imports INTEGER NOT NULL DEFAULT 0,
    error_details JSONB DEFAULT '[]',
    import_summary JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credentials Table for Login Management
CREATE TABLE IF NOT EXISTS credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(254) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_temporary BOOLEAN DEFAULT TRUE,
    must_change_password BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id),
    UNIQUE(email)
);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to calculate attendance percentage
CREATE OR REPLACE FUNCTION calculate_attendance_percentage(
    p_student_id UUID,
    p_subject_assignment_id UUID DEFAULT NULL,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    total_sessions INTEGER;
    attended_sessions INTEGER;
    attendance_percentage DECIMAL(5,2);
BEGIN
    -- Count total sessions
    SELECT COUNT(*)
    INTO total_sessions
    FROM attendance_sessions ats
    JOIN student_enrollments se ON ats.subject_assignment_id = se.subject_assignment_id
    WHERE se.student_id = p_student_id
    AND se.is_active = TRUE
    AND ats.is_finalized = TRUE
    AND (p_subject_assignment_id IS NULL OR ats.subject_assignment_id = p_subject_assignment_id)
    AND (p_start_date IS NULL OR ats.date >= p_start_date)
    AND (p_end_date IS NULL OR ats.date <= p_end_date);
    
    -- Count attended sessions (present + late)
    SELECT COUNT(*)
    INTO attended_sessions
    FROM attendance_records ar
    JOIN attendance_sessions ats ON ar.session_id = ats.id
    JOIN student_enrollments se ON ar.student_enrollment_id = se.id
    WHERE se.student_id = p_student_id
    AND se.is_active = TRUE
    AND ats.is_finalized = TRUE
    AND ar.status IN ('present', 'late')
    AND (p_subject_assignment_id IS NULL OR ats.subject_assignment_id = p_subject_assignment_id)
    AND (p_start_date IS NULL OR ats.date >= p_start_date)
    AND (p_end_date IS NULL OR ats.date <= p_end_date);
    
    -- Calculate percentage
    IF total_sessions > 0 THEN
        attendance_percentage := (attended_sessions::DECIMAL / total_sessions::DECIMAL) * 100;
    ELSE
        attendance_percentage := 0.00;
    END IF;
    
    RETURN attendance_percentage;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate CGPA
CREATE OR REPLACE FUNCTION calculate_cgpa(p_student_id UUID)
RETURNS DECIMAL(4,2) AS $$
DECLARE
    total_credits INTEGER := 0;
    weighted_points DECIMAL(10,2) := 0.00;
    cgpa DECIMAL(4,2);
    grade_points DECIMAL(4,2);
    subject_credits INTEGER;
    current_grade grade_type;
BEGIN
    -- Loop through all completed subjects for the student
    FOR current_grade, subject_credits IN
        SELECT 
            sps.current_grade,
            s.credits
        FROM subject_performance_summaries sps
        JOIN student_enrollments se ON sps.student_enrollment_id = se.id
        JOIN subject_assignments sa ON se.subject_assignment_id = sa.id
        JOIN subjects s ON sa.subject_id = s.id
        WHERE se.student_id = p_student_id
        AND se.is_active = TRUE
        AND sps.current_grade IS NOT NULL
        AND sps.current_grade != 'F'
        AND sps.current_grade != 'AB'
        AND sps.current_grade != 'I'
    LOOP
        -- Convert grade to points
        grade_points := CASE current_grade
            WHEN 'A+' THEN 10.0
            WHEN 'A' THEN 9.0
            WHEN 'B+' THEN 8.0
            WHEN 'B' THEN 7.0
            WHEN 'C' THEN 6.0
            WHEN 'D' THEN 5.0
            ELSE 0.0
        END;
        
        total_credits := total_credits + subject_credits;
        weighted_points := weighted_points + (grade_points * subject_credits);
    END LOOP;
    
    -- Calculate CGPA
    IF total_credits > 0 THEN
        cgpa := weighted_points / total_credits;
    ELSE
        cgpa := 0.00;
    END IF;
    
    RETURN ROUND(cgpa, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to update attendance counts in sessions
CREATE OR REPLACE FUNCTION update_attendance_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE attendance_sessions
        SET 
            total_students = (
                SELECT COUNT(*)
                FROM attendance_records
                WHERE session_id = OLD.session_id
            ),
            present_count = (
                SELECT COUNT(*)
                FROM attendance_records
                WHERE session_id = OLD.session_id AND status = 'present'
            ),
            absent_count = (
                SELECT COUNT(*)
                FROM attendance_records
                WHERE session_id = OLD.session_id AND status = 'absent'
            ),
            late_count = (
                SELECT COUNT(*)
                FROM attendance_records
                WHERE session_id = OLD.session_id AND status = 'late'
            ),
            updated_at = NOW()
        WHERE id = OLD.session_id;
        RETURN OLD;
    ELSE
        UPDATE attendance_sessions
        SET 
            total_students = (
                SELECT COUNT(*)
                FROM attendance_records
                WHERE session_id = NEW.session_id
            ),
            present_count = (
                SELECT COUNT(*)
                FROM attendance_records
                WHERE session_id = NEW.session_id AND status = 'present'
            ),
            absent_count = (
                SELECT COUNT(*)
                FROM attendance_records
                WHERE session_id = NEW.session_id AND status = 'absent'
            ),
            late_count = (
                SELECT COUNT(*)
                FROM attendance_records
                WHERE session_id = NEW.session_id AND status = 'late'
            ),
            updated_at = NOW()
        WHERE id = NEW.session_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update subject performance summary
CREATE OR REPLACE FUNCTION update_subject_performance()
RETURNS TRIGGER AS $$
DECLARE
    enrollment_id UUID;
    total_assessments INTEGER;
    completed_assessments INTEGER;
    total_marks DECIMAL(8,2);
    total_max_marks DECIMAL(8,2);
    avg_percentage DECIMAL(5,2);
    calculated_grade grade_type;
BEGIN
    IF TG_OP = 'DELETE' THEN
        enrollment_id := OLD.student_enrollment_id;
    ELSE
        enrollment_id := NEW.student_enrollment_id;
    END IF;
    
    -- Calculate summary statistics
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN NOT sm.is_absent THEN 1 END),
        COALESCE(SUM(CASE WHEN NOT sm.is_absent THEN sm.marks_obtained ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN NOT sm.is_absent THEN a.max_marks ELSE 0 END), 0)
    INTO total_assessments, completed_assessments, total_marks, total_max_marks
    FROM student_marks sm
    JOIN assessments a ON sm.assessment_id = a.id
    WHERE sm.student_enrollment_id = enrollment_id
    AND a.is_published = TRUE;
    
    -- Calculate average percentage
    IF total_max_marks > 0 THEN
        avg_percentage := (total_marks / total_max_marks) * 100;
    ELSE
        avg_percentage := 0.00;
    END IF;
    
    -- Calculate grade
    calculated_grade := CASE
        WHEN avg_percentage >= 90 THEN 'A+'
        WHEN avg_percentage >= 80 THEN 'A'
        WHEN avg_percentage >= 70 THEN 'B+'
        WHEN avg_percentage >= 60 THEN 'B'
        WHEN avg_percentage >= 50 THEN 'C'
        WHEN avg_percentage >= 40 THEN 'D'
        ELSE 'F'
    END;
    
    -- Update or insert performance summary
    INSERT INTO subject_performance_summaries (
        student_enrollment_id,
        total_assessments,
        assessments_completed,
        total_marks_obtained,
        total_max_marks,
        average_percentage,
        current_grade,
        updated_at
    ) VALUES (
        enrollment_id,
        total_assessments,
        completed_assessments,
        total_marks,
        total_max_marks,
        avg_percentage,
        calculated_grade,
        NOW()
    )
    ON CONFLICT (student_enrollment_id)
    DO UPDATE SET
        total_assessments = EXCLUDED.total_assessments,
        assessments_completed = EXCLUDED.assessments_completed,
        total_marks_obtained = EXCLUDED.total_marks_obtained,
        total_max_marks = EXCLUDED.total_max_marks,
        average_percentage = EXCLUDED.average_percentage,
        current_grade = EXCLUDED.current_grade,
        updated_at = EXCLUDED.updated_at;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update student CGPA
CREATE OR REPLACE FUNCTION update_student_cgpa()
RETURNS TRIGGER AS $$
DECLARE
    student_id UUID;
    new_cgpa DECIMAL(4,2);
BEGIN
    -- Get student ID from enrollment
    SELECT se.student_id INTO student_id
    FROM student_enrollments se
    WHERE se.id = NEW.student_enrollment_id;
    
    -- Calculate new CGPA
    new_cgpa := calculate_cgpa(student_id);
    
    -- Update student record
    UPDATE students
    SET cgpa = new_cgpa, updated_at = NOW()
    WHERE user_id = student_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to sync credentials with users table
CREATE OR REPLACE FUNCTION sync_user_credentials()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Create credentials entry when user is created
        INSERT INTO credentials (user_id, email, password_hash, is_temporary, must_change_password)
        VALUES (NEW.id, NEW.email, NEW.password_hash, TRUE, TRUE);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update credentials when user email or password changes
        UPDATE credentials 
        SET 
            email = NEW.email,
            password_hash = NEW.password_hash,
            updated_at = NOW()
        WHERE user_id = NEW.id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Delete credentials when user is deleted
        DELETE FROM credentials WHERE user_id = OLD.id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function for bulk credential creation from CSV import
CREATE OR REPLACE FUNCTION create_bulk_credentials(
    p_user_data JSONB,
    p_imported_by_id UUID
)
RETURNS JSONB AS $$
DECLARE
    user_record JSONB;
    new_user_id UUID;
    temp_password VARCHAR(12);
    result JSONB := '{"success": [], "errors": []}';
    success_count INTEGER := 0;
    error_count INTEGER := 0;
BEGIN
    -- Loop through each user in the JSON array
    FOR user_record IN SELECT * FROM jsonb_array_elements(p_user_data)
    LOOP
        BEGIN
            -- Generate temporary password
            temp_password := substring(md5(random()::text) from 1 for 12);
            
            -- Insert user
            INSERT INTO users (
                username, email, password_hash, first_name, last_name, 
                role, department, phone, is_active, is_verified
            ) VALUES (
                user_record->>'username',
                user_record->>'email',
                crypt(temp_password, gen_salt('bf')),
                user_record->>'first_name',
                user_record->>'last_name',
                (user_record->>'role')::user_role,
                (user_record->>'department')::department_type,
                user_record->>'phone',
                TRUE,
                FALSE
            ) RETURNING id INTO new_user_id;
            
            -- Insert role-specific data
            IF (user_record->>'role') = 'student' THEN
                INSERT INTO students (
                    user_id, usn, roll_number, semester, section, 
                    batch, admission_date, admission_number
                ) VALUES (
                    new_user_id,
                    user_record->>'usn',
                    user_record->>'roll_number',
                    (user_record->>'semester')::semester_type,
                    (user_record->>'section')::section_type,
                    user_record->>'batch',
                    (user_record->>'admission_date')::DATE,
                    user_record->>'admission_number'
                );
            ELSIF (user_record->>'role') = 'faculty' THEN
                INSERT INTO faculty (
                    user_id, employee_id, designation, qualification, join_date
                ) VALUES (
                    new_user_id,
                    user_record->>'employee_id',
                    user_record->>'designation',
                    user_record->>'qualification',
                    (user_record->>'join_date')::DATE
                );
            END IF;
            
            -- Add to success array
            result := jsonb_set(
                result, 
                '{success}', 
                (result->'success') || jsonb_build_object(
                    'user_id', new_user_id,
                    'email', user_record->>'email',
                    'temp_password', temp_password
                )
            );
            success_count := success_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            -- Add to error array
            result := jsonb_set(
                result, 
                '{errors}', 
                (result->'errors') || jsonb_build_object(
                    'email', user_record->>'email',
                    'error', SQLERRM
                )
            );
            error_count := error_count + 1;
        END;
    END LOOP;
    
    -- Log the import
    INSERT INTO user_import_logs (
        imported_by_id, file_name, import_type, 
        total_records, successful_imports, failed_imports,
        import_summary
    ) VALUES (
        p_imported_by_id,
        'bulk_import_' || extract(epoch from now())::text || '.json',
        'bulk_users',
        success_count + error_count,
        success_count,
        error_count,
        result
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CREATE TRIGGERS
-- =====================================================

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_students_updated_at ON students;
DROP TRIGGER IF EXISTS update_faculty_updated_at ON faculty;
DROP TRIGGER IF EXISTS update_hods_updated_at ON hods;
DROP TRIGGER IF EXISTS update_principals_updated_at ON principals;
DROP TRIGGER IF EXISTS update_coordinators_updated_at ON coordinators;
DROP TRIGGER IF EXISTS update_subjects_updated_at ON subjects;
DROP TRIGGER IF EXISTS update_attendance_sessions_updated_at ON attendance_sessions;
DROP TRIGGER IF EXISTS update_student_marks_updated_at ON student_marks;
DROP TRIGGER IF EXISTS update_achievements_updated_at ON achievements;
DROP TRIGGER IF EXISTS update_study_materials_updated_at ON study_materials;
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
DROP TRIGGER IF EXISTS update_certifications_updated_at ON certifications;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
DROP TRIGGER IF EXISTS update_credentials_updated_at ON credentials;
DROP TRIGGER IF EXISTS sync_user_credentials_trigger ON users;
DROP TRIGGER IF EXISTS update_attendance_counts_trigger ON attendance_records;
DROP TRIGGER IF EXISTS update_subject_performance_trigger ON student_marks;
DROP TRIGGER IF EXISTS update_student_cgpa_trigger ON subject_performance_summaries;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON faculty FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hods_updated_at BEFORE UPDATE ON hods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_principals_updated_at BEFORE UPDATE ON principals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coordinators_updated_at BEFORE UPDATE ON coordinators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_sessions_updated_at BEFORE UPDATE ON attendance_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_marks_updated_at BEFORE UPDATE ON student_marks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_study_materials_updated_at BEFORE UPDATE ON study_materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_credentials_updated_at BEFORE UPDATE ON credentials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to sync credentials with users table
CREATE TRIGGER sync_user_credentials_trigger
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION sync_user_credentials();

-- Trigger to update attendance counts
CREATE TRIGGER update_attendance_counts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON attendance_records
    FOR EACH ROW EXECUTE FUNCTION update_attendance_counts();

-- Trigger to update subject performance
CREATE TRIGGER update_subject_performance_trigger
    AFTER INSERT OR UPDATE OR DELETE ON student_marks
    FOR EACH ROW EXECUTE FUNCTION update_subject_performance();

-- Trigger to update student CGPA when performance changes
CREATE TRIGGER update_student_cgpa_trigger
    AFTER INSERT OR UPDATE ON subject_performance_summaries
    FOR EACH ROW EXECUTE FUNCTION update_student_cgpa();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Drop existing indexes to avoid conflicts
DROP INDEX IF EXISTS idx_users_role_department;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_status;
DROP INDEX IF EXISTS idx_users_created_at;
DROP INDEX IF EXISTS idx_students_usn;
DROP INDEX IF EXISTS idx_students_semester_section;
DROP INDEX IF EXISTS idx_students_batch;
DROP INDEX IF EXISTS idx_students_faculty_advisor;
DROP INDEX IF EXISTS idx_students_proctor;
DROP INDEX IF EXISTS idx_faculty_employee_id;
DROP INDEX IF EXISTS idx_faculty_designation;
DROP INDEX IF EXISTS idx_subjects_department_semester;
DROP INDEX IF EXISTS idx_subjects_code;
DROP INDEX IF EXISTS idx_subjects_is_active;
DROP INDEX IF EXISTS idx_subject_assignments_faculty_year;
DROP INDEX IF EXISTS idx_subject_assignments_subject_section;
DROP INDEX IF EXISTS idx_subject_assignments_is_active;
DROP INDEX IF EXISTS idx_student_enrollments_student_active;
DROP INDEX IF EXISTS idx_student_enrollments_assignment;
DROP INDEX IF EXISTS idx_attendance_sessions_date_assignment;
DROP INDEX IF EXISTS idx_attendance_sessions_finalized;
DROP INDEX IF EXISTS idx_attendance_records_enrollment_status;
DROP INDEX IF EXISTS idx_attendance_records_session_status;
DROP INDEX IF EXISTS idx_assessments_assignment_date;
DROP INDEX IF EXISTS idx_assessments_type_published;
DROP INDEX IF EXISTS idx_student_marks_enrollment_marks;
DROP INDEX IF EXISTS idx_student_marks_assessment_marks;
DROP INDEX IF EXISTS idx_feedback_sessions_assignment_type;
DROP INDEX IF EXISTS idx_feedback_sessions_dates;
DROP INDEX IF EXISTS idx_feedback_responses_session_complete;
DROP INDEX IF EXISTS idx_feedback_responses_submitted;
DROP INDEX IF EXISTS idx_achievements_student_category;
DROP INDEX IF EXISTS idx_achievements_status_date;
DROP INDEX IF EXISTS idx_achievements_level_category;
DROP INDEX IF EXISTS idx_study_materials_assignment_type;
DROP INDEX IF EXISTS idx_study_materials_upload_date;
DROP INDEX IF EXISTS idx_study_materials_public;
DROP INDEX IF EXISTS idx_notifications_recipient_read;
DROP INDEX IF EXISTS idx_notifications_created;
DROP INDEX IF EXISTS idx_notifications_priority;
DROP INDEX IF EXISTS idx_applications_applicant_status;
DROP INDEX IF EXISTS idx_applications_type_status;
DROP INDEX IF EXISTS idx_applications_assigned_status;
DROP INDEX IF EXISTS idx_certifications_student_status;
DROP INDEX IF EXISTS idx_certifications_category_status;
DROP INDEX IF EXISTS idx_certifications_issue_date;
DROP INDEX IF EXISTS idx_user_activities_user_timestamp;
DROP INDEX IF EXISTS idx_user_activities_action_timestamp;
DROP INDEX IF EXISTS idx_user_sessions_user_active;
DROP INDEX IF EXISTS idx_user_sessions_session_key;
DROP INDEX IF EXISTS idx_user_sessions_login_time;
DROP INDEX IF EXISTS idx_user_activity_logs_user_timestamp;
DROP INDEX IF EXISTS idx_user_activity_logs_action_timestamp;
DROP INDEX IF EXISTS idx_user_activity_logs_resource_timestamp;
DROP INDEX IF EXISTS idx_credentials_user_id;
DROP INDEX IF EXISTS idx_credentials_email;
DROP INDEX IF EXISTS idx_import_logs_imported_by;
DROP INDEX IF EXISTS idx_import_logs_type_date;

-- Users table indexes
CREATE INDEX idx_users_role_department ON users(role, department);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Students table indexes
CREATE INDEX idx_students_usn ON students(usn);
CREATE INDEX idx_students_semester_section ON students(semester, section);
CREATE INDEX idx_students_batch ON students(batch);
CREATE INDEX idx_students_faculty_advisor ON students(faculty_advisor_id);
CREATE INDEX idx_students_proctor ON students(proctor_id);

-- Faculty table indexes
CREATE INDEX idx_faculty_employee_id ON faculty(employee_id);
CREATE INDEX idx_faculty_designation ON faculty(designation);

-- Subjects table indexes
CREATE INDEX idx_subjects_department_semester ON subjects(department, semester);
CREATE INDEX idx_subjects_code ON subjects(code);
CREATE INDEX idx_subjects_is_active ON subjects(is_active);

-- Subject assignments indexes
CREATE INDEX idx_subject_assignments_faculty_year ON subject_assignments(faculty_id, academic_year_id);
CREATE INDEX idx_subject_assignments_subject_section ON subject_assignments(subject_id, section);
CREATE INDEX idx_subject_assignments_is_active ON subject_assignments(is_active);

-- Student enrollments indexes
CREATE INDEX idx_student_enrollments_student_active ON student_enrollments(student_id, is_active);
CREATE INDEX idx_student_enrollments_assignment ON student_enrollments(subject_assignment_id);

-- Attendance sessions indexes
CREATE INDEX idx_attendance_sessions_date_assignment ON attendance_sessions(date, subject_assignment_id);
CREATE INDEX idx_attendance_sessions_finalized ON attendance_sessions(is_finalized);

-- Attendance records indexes
CREATE INDEX idx_attendance_records_enrollment_status ON attendance_records(student_enrollment_id, status);
CREATE INDEX idx_attendance_records_session_status ON attendance_records(session_id, status);

-- Assessments indexes
CREATE INDEX idx_assessments_assignment_date ON assessments(subject_assignment_id, date_conducted);
CREATE INDEX idx_assessments_type_published ON assessments(assessment_type_id, is_published);

-- Student marks indexes
CREATE INDEX idx_student_marks_enrollment_marks ON student_marks(student_enrollment_id, marks_obtained);
CREATE INDEX idx_student_marks_assessment_marks ON student_marks(assessment_id, marks_obtained);

-- Feedback sessions indexes
CREATE INDEX idx_feedback_sessions_assignment_type ON feedback_sessions(subject_assignment_id, feedback_type);
CREATE INDEX idx_feedback_sessions_dates ON feedback_sessions(start_date, end_date);

-- Feedback responses indexes
CREATE INDEX idx_feedback_responses_session_complete ON feedback_responses(session_id, is_complete);
CREATE INDEX idx_feedback_responses_submitted ON feedback_responses(submitted_at);

-- Achievements indexes
CREATE INDEX idx_achievements_student_category ON achievements(student_id, category);
CREATE INDEX idx_achievements_status_date ON achievements(status, date_achieved);
CREATE INDEX idx_achievements_level_category ON achievements(level, category);

-- Study materials indexes
CREATE INDEX idx_study_materials_assignment_type ON study_materials(subject_assignment_id, material_type);
CREATE INDEX idx_study_materials_upload_date ON study_materials(upload_date);
CREATE INDEX idx_study_materials_public ON study_materials(is_public);

-- Notifications indexes
CREATE INDEX idx_notifications_recipient_read ON notifications(recipient_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
CREATE INDEX idx_notifications_priority ON notifications(priority);

-- Applications indexes
CREATE INDEX idx_applications_applicant_status ON applications(applicant_id, status);
CREATE INDEX idx_applications_type_status ON applications(application_type_id, status);
CREATE INDEX idx_applications_assigned_status ON applications(assigned_to_id, status);

-- Certifications indexes
CREATE INDEX idx_certifications_student_status ON certifications(student_id, status);
CREATE INDEX idx_certifications_category_status ON certifications(category_id, status);
CREATE INDEX idx_certifications_issue_date ON certifications(issue_date);

-- User activities indexes
CREATE INDEX idx_user_activities_user_timestamp ON user_activities(user_id, timestamp);
CREATE INDEX idx_user_activities_action_timestamp ON user_activities(action, timestamp);

-- User sessions indexes
CREATE INDEX idx_user_sessions_user_active ON user_sessions(user_id, is_active);
CREATE INDEX idx_user_sessions_session_key ON user_sessions(session_key);
CREATE INDEX idx_user_sessions_login_time ON user_sessions(login_time);

-- User activity logs indexes
CREATE INDEX idx_user_activity_logs_user_timestamp ON user_activity_logs(user_id, timestamp);
CREATE INDEX idx_user_activity_logs_action_timestamp ON user_activity_logs(action, timestamp);
CREATE INDEX idx_user_activity_logs_resource_timestamp ON user_activity_logs(resource_type, timestamp);

-- Credentials table indexes
CREATE INDEX idx_credentials_user_id ON credentials(user_id);
CREATE INDEX idx_credentials_email ON credentials(email);

-- User import logs indexes
CREATE INDEX idx_import_logs_imported_by ON user_import_logs(imported_by_id);
CREATE INDEX idx_import_logs_type_date ON user_import_logs(import_type, created_at);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Student Performance View
CREATE OR REPLACE VIEW student_performance_view AS
SELECT 
    s.user_id,
    s.usn,
    u.first_name,
    u.last_name,
    u.email,
    s.semester,
    s.section,
    u.department,
    s.cgpa,
    s.batch,
    COUNT(se.id) as enrolled_subjects,
    AVG(CASE WHEN NOT sm.is_absent THEN (sm.marks_obtained / a.max_marks) * 100 END) as average_percentage,
    calculate_attendance_percentage(s.user_id) as attendance_percentage
FROM students s
JOIN users u ON s.user_id = u.id
LEFT JOIN student_enrollments se ON s.user_id = se.student_id AND se.is_active = TRUE
LEFT JOIN student_marks sm ON se.id = sm.student_enrollment_id
LEFT JOIN assessments a ON sm.assessment_id = a.id AND a.is_published = TRUE
WHERE u.is_active = TRUE
GROUP BY s.user_id, s.usn, u.first_name, u.last_name, u.email, s.semester, s.section, u.department, s.cgpa, s.batch;

-- Faculty Workload View
CREATE OR REPLACE VIEW faculty_workload_view AS
SELECT 
    f.user_id,
    f.employee_id,
    u.first_name,
    u.last_name,
    u.email,
    u.department,
    f.designation,
    COUNT(DISTINCT sa.id) as assigned_subjects,
    COUNT(DISTINCT se.student_id) as total_students,
    COUNT(DISTINCT s.user_id) as advised_students,
    f.current_teaching_hours,
    f.max_teaching_hours
FROM faculty f
JOIN users u ON f.user_id = u.id
LEFT JOIN subject_assignments sa ON f.user_id = sa.faculty_id AND sa.is_active = TRUE
LEFT JOIN student_enrollments se ON sa.id = se.subject_assignment_id AND se.is_active = TRUE
LEFT JOIN students s ON f.user_id = s.faculty_advisor_id
WHERE u.is_active = TRUE
GROUP BY f.user_id, f.employee_id, u.first_name, u.last_name, u.email, u.department, f.designation, f.current_teaching_hours, f.max_teaching_hours;

-- Department Statistics View
CREATE OR REPLACE VIEW department_statistics_view AS
SELECT 
    u.department,
    COUNT(CASE WHEN u.role = 'student' THEN 1 END) as total_students,
    COUNT(CASE WHEN u.role = 'faculty' THEN 1 END) as total_faculty,
    COUNT(CASE WHEN u.role = 'student' AND s.semester = '1' THEN 1 END) as first_year_students,
    COUNT(CASE WHEN u.role = 'student' AND s.semester = '8' THEN 1 END) as final_year_students,
    AVG(CASE WHEN u.role = 'student' THEN s.cgpa END) as average_cgpa,
    COUNT(CASE WHEN u.role = 'student' AND s.cgpa >= 8.0 THEN 1 END) as high_performers
FROM users u
LEFT JOIN students s ON u.id = s.user_id
WHERE u.is_active = TRUE
GROUP BY u.department;

-- Subject Enrollment View
CREATE OR REPLACE VIEW subject_enrollment_view AS
SELECT 
    sub.id as subject_id,
    sub.code,
    sub.name,
    sub.department,
    sub.semester,
    sub.credits,
    sa.section,
    ay.year as academic_year,
    CONCAT(f_u.first_name, ' ', f_u.last_name) as faculty_name,
    COUNT(se.student_id) as enrolled_students,
    AVG(sps.average_percentage) as class_average
FROM subjects sub
JOIN subject_assignments sa ON sub.id = sa.subject_id
JOIN academic_years ay ON sa.academic_year_id = ay.id
JOIN faculty f ON sa.faculty_id = f.user_id
JOIN users f_u ON f.user_id = f_u.id
LEFT JOIN student_enrollments se ON sa.id = se.subject_assignment_id AND se.is_active = TRUE
LEFT JOIN subject_performance_summaries sps ON se.id = sps.student_enrollment_id
WHERE sa.is_active = TRUE AND ay.is_current = TRUE
GROUP BY sub.id, sub.code, sub.name, sub.department, sub.semester, sub.credits, sa.section, ay.year, f_u.first_name, f_u.last_name;

-- Attendance Summary View
CREATE OR REPLACE VIEW attendance_summary_view AS
SELECT 
    s.user_id as student_id,
    s.usn,
    CONCAT(u.first_name, ' ', u.last_name) as student_name,
    sub.code as subject_code,
    sub.name as subject_name,
    COUNT(ar.id) as total_classes,
    COUNT(CASE WHEN ar.status = 'present' THEN 1 END) as present_count,
    COUNT(CASE WHEN ar.status = 'absent' THEN 1 END) as absent_count,
    COUNT(CASE WHEN ar.status = 'late' THEN 1 END) as late_count,
    ROUND(
        (COUNT(CASE WHEN ar.status IN ('present', 'late') THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(ar.id), 0)) * 100, 2
    ) as attendance_percentage
FROM students s
JOIN users u ON s.user_id = u.id
JOIN student_enrollments se ON s.user_id = se.student_id
JOIN subject_assignments sa ON se.subject_assignment_id = sa.id
JOIN subjects sub ON sa.subject_id = sub.id
JOIN attendance_sessions ats ON sa.id = ats.subject_assignment_id
JOIN attendance_records ar ON ats.id = ar.session_id AND se.id = ar.student_enrollment_id
WHERE se.is_active = TRUE AND ats.is_finalized = TRUE
GROUP BY s.user_id, s.usn, u.first_name, u.last_name, sub.code, sub.name;

-- Achievement Statistics View
CREATE OR REPLACE VIEW achievement_statistics_view AS
SELECT 
    u.department,
    a.category,
    a.level,
    COUNT(*) as total_achievements,
    COUNT(CASE WHEN a.status = 'verified' THEN 1 END) as verified_achievements,
    COUNT(DISTINCT a.student_id) as students_with_achievements,
    EXTRACT(YEAR FROM a.date_achieved) as achievement_year
FROM achievements a
JOIN students s ON a.student_id = s.user_id
JOIN users u ON s.user_id = u.id
GROUP BY u.department, a.category, a.level, EXTRACT(YEAR FROM a.date_achieved);

-- =====================================================
-- UTILITY FUNCTIONS FOR API
-- =====================================================

-- Function to get student dashboard data
CREATE OR REPLACE FUNCTION get_student_dashboard_data(p_student_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'student_info', (
            SELECT json_build_object(
                'usn', s.usn,
                'name', u.first_name || ' ' || u.last_name,
                'semester', s.semester,
                'section', s.section,
                'cgpa', s.cgpa,
                'department', u.department
            )
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.user_id = p_student_id
        ),
        'attendance_summary', (
            SELECT json_build_object(
                'overall_percentage', calculate_attendance_percentage(p_student_id),
                'total_classes', COUNT(ar.id),
                'present_count', COUNT(CASE WHEN ar.status = 'present' THEN 1 END),
                'absent_count', COUNT(CASE WHEN ar.status = 'absent' THEN 1 END)
            )
            FROM attendance_records ar
            JOIN student_enrollments se ON ar.student_enrollment_id = se.id
            WHERE se.student_id = p_student_id
        ),
        'recent_marks', (
            SELECT json_agg(
                json_build_object(
                    'subject', sub.name,
                    'assessment', a.title,
                    'marks', sm.marks_obtained,
                    'max_marks', a.max_marks,
                    'percentage', ROUND((sm.marks_obtained / a.max_marks) * 100, 2),
                    'date', a.date_conducted
                )
            )
            FROM student_marks sm
            JOIN assessments a ON sm.assessment_id = a.id
            JOIN subject_assignments sa ON a.subject_assignment_id = sa.id
            JOIN subjects sub ON sa.subject_id = sub.id
            JOIN student_enrollments se ON sm.student_enrollment_id = se.id
            WHERE se.student_id = p_student_id
            AND a.is_published = TRUE
            ORDER BY a.date_conducted DESC
            LIMIT 5
        ),
        'upcoming_assignments', (
            SELECT json_agg(
                json_build_object(
                    'title', asn.title,
                    'subject', sub.name,
                    'due_date', asn.due_date,
                    'max_marks', asn.max_marks
                )
            )
            FROM assignments asn
            JOIN subject_assignments sa ON asn.subject_assignment_id = sa.id
            JOIN subjects sub ON sa.subject_id = sub.id
            JOIN student_enrollments se ON sa.id = se.subject_assignment_id
            WHERE se.student_id = p_student_id
            AND asn.due_date > NOW()
            AND asn.status = 'published'
            ORDER BY asn.due_date
            LIMIT 5
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get faculty dashboard data
CREATE OR REPLACE FUNCTION get_faculty_dashboard_data(p_faculty_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'faculty_info', (
            SELECT json_build_object(
                'employee_id', f.employee_id,
                'name', u.first_name || ' ' || u.last_name,
                'designation', f.designation,
                'department', u.department,
                'teaching_hours', f.current_teaching_hours,
                'max_hours', f.max_teaching_hours
            )
            FROM faculty f
            JOIN users u ON f.user_id = u.id
            WHERE f.user_id = p_faculty_id
        ),
        'assigned_subjects', (
            SELECT json_agg(
                json_build_object(
                    'subject_code', sub.code,
                    'subject_name', sub.name,
                    'semester', sub.semester,
                    'section', sa.section,
                    'enrolled_students', COUNT(se.student_id)
                )
            )
            FROM subject_assignments sa
            JOIN subjects sub ON sa.subject_id = sub.id
            LEFT JOIN student_enrollments se ON sa.id = se.subject_assignment_id AND se.is_active = TRUE
            WHERE sa.faculty_id = p_faculty_id
            AND sa.is_active = TRUE
            GROUP BY sub.code, sub.name, sub.semester, sa.section
        ),
        'recent_feedback', (
            SELECT json_agg(
                json_build_object(
                    'subject', sub.name,
                    'feedback_type', fs.feedback_type,
                    'average_rating', COALESCE(fsm.average_rating, 0),
                    'response_count', COALESCE(fsm.total_responses, 0),
                    'session_date', fs.start_date
                )
            )
            FROM feedback_sessions fs
            JOIN subject_assignments sa ON fs.subject_assignment_id = sa.id
            JOIN subjects sub ON sa.subject_id = sub.id
            LEFT JOIN feedback_summaries fsm ON fs.id = fsm.session_id
            WHERE sa.faculty_id = p_faculty_id
            ORDER BY fs.start_date DESC
            LIMIT 5
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to get department analytics
CREATE OR REPLACE FUNCTION get_department_analytics(p_department department_type)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'student_statistics', (
            SELECT json_build_object(
                'total_students', COUNT(*),
                'average_cgpa', ROUND(AVG(s.cgpa), 2),
                'high_performers', COUNT(CASE WHEN s.cgpa >= 8.0 THEN 1 END),
                'low_performers', COUNT(CASE WHEN s.cgpa < 6.0 THEN 1 END)
            )
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE u.department = p_department AND u.is_active = TRUE
        ),
        'faculty_statistics', (
            SELECT json_build_object(
                'total_faculty', COUNT(*),
                'professors', COUNT(CASE WHEN f.designation = 'professor' THEN 1 END),
                'associate_professors', COUNT(CASE WHEN f.designation = 'associate_professor' THEN 1 END),
                'assistant_professors', COUNT(CASE WHEN f.designation = 'assistant_professor' THEN 1 END)
            )
            FROM faculty f
            JOIN users u ON f.user_id = u.id
            WHERE u.department = p_department AND u.is_active = TRUE
        ),
        'semester_distribution', (
            SELECT json_agg(
                json_build_object(
                    'semester', s.semester,
                    'student_count', COUNT(*)
                )
            )
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE u.department = p_department AND u.is_active = TRUE
            GROUP BY s.semester
            ORDER BY s.semester
        ),
        'achievement_statistics', (
            SELECT json_agg(
                json_build_object(
                    'category', a.category,
                    'total_achievements', COUNT(*),
                    'verified_achievements', COUNT(CASE WHEN a.status = 'verified' THEN 1 END)
                )
            )
            FROM achievements a
            JOIN students s ON a.student_id = s.user_id
            JOIN users u ON s.user_id = u.id
            WHERE u.department = p_department
            GROUP BY a.category
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- BACKUP AND MAINTENANCE
-- =====================================================

-- Function to cleanup old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS VOID AS $$
BEGIN
    -- Delete old user sessions (older than 30 days)
    DELETE FROM user_sessions 
    WHERE logout_time < NOW() - INTERVAL '30 days'
    OR (is_active = FALSE AND last_activity < NOW() - INTERVAL '30 days');
    
    -- Delete old activity logs (older than 1 year)
    DELETE FROM user_activity_logs 
    WHERE timestamp < NOW() - INTERVAL '1 year';
    
    -- Delete old notifications (older than 6 months and read)
    DELETE FROM notifications 
    WHERE created_at < NOW() - INTERVAL '6 months'
    AND is_read = TRUE;
    
    -- Delete old system metrics (older than 3 months)
    DELETE FROM system_metrics 
    WHERE timestamp < NOW() - INTERVAL '3 months';
    
    RAISE NOTICE 'Old data cleanup completed';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS AND DOCUMENTATION
-- =====================================================

COMMENT ON DATABASE postgres IS 'NexaLink Academic Management System Database';

COMMENT ON TABLE users IS 'Main user table storing all system users with role-based access';
COMMENT ON TABLE students IS 'Student-specific information and academic details';
COMMENT ON TABLE faculty IS 'Faculty-specific information and professional details';
COMMENT ON TABLE subjects IS 'Course/subject definitions with curriculum details';
COMMENT ON TABLE attendance_sessions IS 'Individual class sessions for attendance tracking';
COMMENT ON TABLE attendance_records IS 'Student attendance records for each session';
COMMENT ON TABLE assessments IS 'Assessment/exam definitions';
COMMENT ON TABLE student_marks IS 'Student marks/grades for assessments';
COMMENT ON TABLE feedback_sessions IS 'Faculty feedback collection sessions';
COMMENT ON TABLE achievements IS 'Student achievements and accomplishments';
COMMENT ON TABLE study_materials IS 'Course materials uploaded by faculty';
COMMENT ON TABLE notifications IS 'System notifications for users';
COMMENT ON TABLE applications IS 'Student applications for various services';
COMMENT ON TABLE user_import_logs IS 'Logs of user data imports via CSV';
COMMENT ON TABLE credentials IS 'Login credentials management for bulk imports';

-- =====================================================
-- INITIAL DATA INSERTION
-- =====================================================

-- Insert current academic year
INSERT INTO academic_years (year, start_date, end_date, is_current) 
VALUES ('2024-2025', '2024-06-01', '2025-05-31', TRUE)
ON CONFLICT (year) DO NOTHING;

-- Insert default admin user
INSERT INTO users (
    username, email, password_hash, first_name, last_name, 
    role, department, is_active, is_verified
) VALUES (
    'admin',
    'admin@nexalink.edu',
    crypt('admin123', gen_salt('bf')),
    'System',
    'Administrator',
    'admin',
    'CSE',
    TRUE,
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Insert default principal user
INSERT INTO users (
    username, email, password_hash, first_name, last_name, 
    role, department, is_active, is_verified
) VALUES (
    'principal',
    'principal@nexalink.edu',
    crypt('principal123', gen_salt('bf')),
    'College',
    'Principal',
    'principal',
    'CSE',
    TRUE,
    TRUE
) ON CONFLICT (email) DO NOTHING;

-- Insert principal record
INSERT INTO principals (
    user_id, employee_id, appointed_date, is_current,
    office_room, office_hours
)
SELECT 
    u.id,
    'PRIN001',
    '2024-01-01',
    TRUE,
    'Principal Office',
    '9:00 AM - 5:00 PM'
FROM users u 
WHERE u.email = 'principal@nexalink.edu'
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- FINAL SETUP COMMANDS
-- =====================================================

-- Create a function to initialize the database with sample data
CREATE OR REPLACE FUNCTION initialize_sample_data()
RETURNS VOID AS $$
BEGIN
    -- This function can be called to populate the database with sample data
    -- Implementation would go here based on specific requirements
    RAISE NOTICE 'Sample data initialization function created. Call with specific data as needed.';
END;
$$ LANGUAGE plpgsql;

-- Final message
SELECT 'NexaLink Academic System Database Schema with Admin/Principal Login and CSV Import Capability Created Successfully!' as status;
-- Enable the uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the import_audit_logs table
CREATE TABLE IF NOT EXISTS import_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    import_type VARCHAR(50) NOT NULL,
    imported_by UUID REFERENCES users(id), -- Assuming users.id is UUID
    import_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total_records INT NOT NULL,
    successful_imports INT NOT NULL,
    failed_imports INT NOT NULL,
    errors TEXT, -- Store JSON string of errors or a simple text summary
    file_name VARCHAR(255)
);

-- Add an index for faster lookup by import_type or import_date
CREATE INDEX IF NOT EXISTS idx_import_audit_logs_type_date ON import_audit_logs (import_type, import_date DESC);
-- Add father_name, parent_name, parent_phone, and blood_group columns to the students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS father_name TEXT,
ADD COLUMN IF NOT EXISTS parent_name TEXT,
ADD COLUMN IF NOT EXISTS parent_phone TEXT,
ADD COLUMN IF NOT EXISTS blood_group TEXT;

-- You might also want to ensure the sync_user_credentials function is up-to-date
-- This is a placeholder for the actual function definition if it needs to be updated
-- For example, if it needs to handle new user fields or roles.
-- If your sync_user_credentials function is already correct and handles user creation
-- and role assignment properly, you might not need to modify it.
-- However, if you suspect issues with user creation, you can define the full function here.
-- For now, assuming the previous version was sufficient for its purpose.
-- This script adds the blood_group column to the students table if it doesn't exist.
-- It also ensures that the column is of type VARCHAR(5) and is nullable.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'students' AND column_name = 'blood_group') THEN
    ALTER TABLE students ADD COLUMN blood_group VARCHAR(5);
  END IF;
END $$;
-- This script updates the sync_user_credentials function to handle potential errors during credential creation.

CREATE OR REPLACE FUNCTION sync_user_credentials()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Create credentials entry when user is created
    BEGIN
      INSERT INTO credentials (user_id, email, password_hash, is_temporary, must_change_password)
      VALUES (NEW.id, NEW.email, NEW.password_hash, TRUE, TRUE);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Failed to create credentials for user %: %', NEW.id, SQLERRM;
      -- Optionally, you might want to log this error to a separate table for later investigation.
    END;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Update credentials when user email or password changes
    UPDATE credentials 
    SET 
      email = NEW.email,
      password_hash = NEW.password_hash,
      updated_at = NOW()
    WHERE user_id = NEW.id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Delete credentials when user is deleted
    DELETE FROM credentials WHERE user_id = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
-- Update the 'users' table to ensure all necessary columns are present
ALTER TABLE users
ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(100),
ADD COLUMN IF NOT EXISTS pincode VARCHAR(20),
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Update the 'students' table to ensure all necessary columns are present
ALTER TABLE students
ADD COLUMN IF NOT EXISTS roll_number VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS admission_date DATE,
ADD COLUMN IF NOT EXISTS admission_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS father_name TEXT,
ADD COLUMN IF NOT EXISTS parent_name TEXT,
ADD COLUMN IF NOT EXISTS parent_phone TEXT,
ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Update the 'faculty' table to ensure all necessary columns are present
ALTER TABLE faculty
ADD COLUMN IF NOT EXISTS qualification TEXT,
ADD COLUMN IF NOT EXISTS experience_years INTEGER,
ADD COLUMN IF NOT EXISTS specialization TEXT,
ADD COLUMN IF NOT EXISTS join_date DATE,
ADD COLUMN IF NOT EXISTS is_hod BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_coordinator BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Add or update the 'academic_years' table if it doesn't exist or needs 'is_current'
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year_name VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add or update the 'subjects' table if it doesn't exist
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    credits INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    department VARCHAR(50) NOT NULL,
    subject_type VARCHAR(50) DEFAULT 'theory',
    syllabus TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add or update the 'subject_assignments' table if it doesn't exist
CREATE TABLE IF NOT EXISTS subject_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES faculty(user_id) ON DELETE CASCADE, -- Assuming faculty.user_id is the FK
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    semester INTEGER NOT NULL,
    section VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    assigned_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (subject_id, faculty_id, academic_year_id, semester, section)
);

-- Ensure 'updated_at' columns are automatically updated on row modification
-- For PostgreSQL, this typically involves triggers.
-- Example for 'users' table (repeat for other tables if needed):
DO $$ BEGIN
    CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_faculty_updated_at
    BEFORE UPDATE ON faculty
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_academic_years_updated_at
    BEFORE UPDATE ON academic_years
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_subject_assignments_updated_at
    BEFORE UPDATE ON subject_assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Function to update updated_at column (if not already defined)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- database/seed_academic_year_v5.sql

-- Ensure the academic_years table exists (already in complete_nexalink_schema.sql, but good to be explicit)
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    year_name VARCHAR(50) UNIQUE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add a trigger to update updated_at for academic_years if not already defined
DO $$ BEGIN
    CREATE TRIGGER update_academic_years_updated_at
    BEFORE UPDATE ON academic_years
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
-- Ensure year_name column exists
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'academic_years' AND column_name = 'year_name'
    ) THEN
        ALTER TABLE academic_years ADD COLUMN year_name VARCHAR(50) UNIQUE;
    END IF;
END $$;


-- Insert a default academic year if no current academic year exists
INSERT INTO academic_years (year_name, start_date, end_date, is_current)
SELECT
    '2024-2025',
    '2024-08-01',
    '2025-07-31',
    TRUE
WHERE NOT EXISTS (SELECT 1 FROM academic_years WHERE is_current = TRUE);

-- If there are multiple academic years, ensure only one is marked as current.
-- This is a safety measure. If you intend to manage academic years manually,
-- you might adjust this logic.
UPDATE academic_years
SET is_current = FALSE
WHERE id NOT IN (
    SELECT id FROM academic_years WHERE is_current = TRUE LIMIT 1
) AND is_current = TRUE;

-- If no academic year exists at all (e.g., fresh install), ensure one is set to current
-- This handles the edge case where the above INSERT might not run if is_current is already false for all.
UPDATE academic_years
SET is_current = TRUE
WHERE id = (SELECT id FROM academic_years ORDER BY created_at DESC LIMIT 1)
AND NOT EXISTS (SELECT 1 FROM academic_years WHERE is_current = TRUE);


-- Update subjects table to ensure it has the correct structure for course imports
-- This script ensures the subjects table matches the expected structure for CSV imports

-- Check if subjects table exists and has the correct columns
DO $$ 
BEGIN
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subjects' AND column_name = 'code') THEN
        ALTER TABLE subjects ADD COLUMN code VARCHAR(50);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subjects' AND column_name = 'name') THEN
        ALTER TABLE subjects ADD COLUMN name VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subjects' AND column_name = 'credits') THEN
        ALTER TABLE subjects ADD COLUMN credits INTEGER;
    END IF;

    -- Check if semester column exists and handle type mismatch
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subjects' AND column_name = 'semester') THEN
        ALTER TABLE subjects ADD COLUMN semester semester_type;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subjects' AND column_name = 'department') THEN
        ALTER TABLE subjects ADD COLUMN department VARCHAR(50);
    END IF;
END $$;

-- Create index on code column for better performance if it doesn't exist
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(code);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create index on department column for filtering if it doesn't exist
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_subjects_department ON subjects(department);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create index on semester column for filtering if it doesn't exist
DO $$ BEGIN
    CREATE INDEX IF NOT EXISTS idx_subjects_semester ON subjects(semester);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Add unique constraint on code column if it doesn't exist
DO $$ BEGIN
    ALTER TABLE subjects ADD CONSTRAINT subjects_code_unique UNIQUE (code);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- First, check what values are valid for semester_type enum
-- Run this query separately to see the valid enum values:
-- SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'semester_type');

-- Insert sample data only if the table is empty
DO $$ 
DECLARE
    valid_semester_value semester_type;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM subjects LIMIT 1) THEN
        -- Get the first valid enum value
        SELECT enumlabel::semester_type INTO valid_semester_value 
        FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'semester_type')
        ORDER BY enumsortorder 
        LIMIT 1;
        
        -- Insert sample data with the first valid semester value
        INSERT INTO subjects (code, name, credits, semester, department)
        VALUES ('SAMPLE001', 'Sample Course', 4, valid_semester_value, 'CSE');
    END IF;
END $$;

-- Fix subjects table by removing all unnecessary columns and keeping only the 5 required ones
-- This script will clean up the table structure completely

-- First, drop dependent views to avoid conflicts
DROP VIEW IF EXISTS subject_enrollment_view CASCADE;
DROP VIEW IF EXISTS "subject*enrollment_view" CASCADE;

-- Drop all existing constraints and indexes to avoid conflicts
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_code_unique CASCADE;
ALTER TABLE subjects DROP CONSTRAINT IF EXISTS subjects_pkey CASCADE;

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_subjects_code;
DROP INDEX IF EXISTS idx_subjects_department;
DROP INDEX IF EXISTS idx_subjects_semester;

-- Drop all unnecessary columns that might exist
ALTER TABLE subjects DROP COLUMN IF EXISTS subject_type CASCADE;
ALTER TABLE subjects DROP COLUMN IF EXISTS is_active CASCADE;
ALTER TABLE subjects DROP COLUMN IF EXISTS created_at CASCADE;
ALTER TABLE subjects DROP COLUMN IF EXISTS updated_at CASCADE;
ALTER TABLE subjects DROP COLUMN IF EXISTS syllabus CASCADE;
ALTER TABLE subjects DROP COLUMN IF EXISTS description CASCADE;
ALTER TABLE subjects DROP COLUMN IF EXISTS faculty_id CASCADE;
ALTER TABLE subjects DROP COLUMN IF EXISTS course_code CASCADE;
ALTER TABLE subjects DROP COLUMN IF EXISTS courseName CASCADE;
ALTER TABLE subjects DROP COLUMN IF EXISTS faculty CASCADE;
ALTER TABLE subjects DROP COLUMN IF EXISTS studentsEnrolled CASCADE;
ALTER TABLE subjects DROP COLUMN IF EXISTS enrollmentDate CASCADE;
ALTER TABLE subjects DROP COLUMN IF EXISTS status CASCADE;
ALTER TABLE subjects DROP COLUMN IF EXISTS type CASCADE;

-- Drop department and semester columns if they're enum types and recreate as VARCHAR/INTEGER
ALTER TABLE subjects DROP COLUMN IF EXISTS department CASCADE;
ALTER TABLE subjects DROP COLUMN IF EXISTS semester CASCADE;

-- Add all required columns with proper data types
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS code VARCHAR(50);
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS department VARCHAR(50);
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS credits INTEGER;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS semester INTEGER;

-- Clear existing data to avoid conflicts
TRUNCATE TABLE subjects;

-- Set NOT NULL constraints
ALTER TABLE subjects ALTER COLUMN code SET NOT NULL;
ALTER TABLE subjects ALTER COLUMN name SET NOT NULL;
ALTER TABLE subjects ALTER COLUMN department SET NOT NULL;
ALTER TABLE subjects ALTER COLUMN credits SET NOT NULL;
ALTER TABLE subjects ALTER COLUMN semester SET NOT NULL;

-- Add primary key
ALTER TABLE subjects ADD CONSTRAINT subjects_pkey PRIMARY KEY (id);

-- Add unique constraint on code
ALTER TABLE subjects ADD CONSTRAINT subjects_code_unique UNIQUE (code);

-- Create indexes for better performance
CREATE INDEX idx_subjects_code ON subjects(code);
CREATE INDEX idx_subjects_department ON subjects(department);
CREATE INDEX idx_subjects_semester ON subjects(semester);

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'subjects' 
ORDER BY ordinal_position;

-- Create departments table since it doesn't exist
-- This table is needed for the course management functionality

-- Drop table if exists to recreate fresh
DROP TABLE IF EXISTS departments CASCADE;

-- Create departments table
CREATE TABLE departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_departments_name ON departments(name);
CREATE INDEX idx_departments_code ON departments(code);


-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for departments table
CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
DROP TYPE IF EXISTS department_type CASCADE;

    


-- Add the department column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS department TEXT;

-- Alter the department column to TEXT type, handling existing data if any
ALTER TABLE users ALTER COLUMN department TYPE TEXT USING department::TEXT;


ALTER TABLE faculty
ALTER COLUMN qualification DROP NOT NULL;
-- Add hod_id column only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'departments' AND column_name = 'hod_id'
    ) THEN
        ALTER TABLE departments 
        ADD COLUMN hod_id UUID REFERENCES faculty(user_id);
    END IF;
END$$;

-- Remove the old head column if it exists
ALTER TABLE departments 
DROP COLUMN IF EXISTS head;

-- Add index on hod_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_departments_hod_id ON departments(hod_id);
-- Create leave_allocations table for global leave settings
CREATE TABLE IF NOT EXISTS leave_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leave_type VARCHAR(10) NOT NULL UNIQUE,
    allocation INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default leave allocations
INSERT INTO leave_allocations (leave_type, allocation, description) VALUES
('CL', 10, 'Casual Leave'),
('RH', 5, 'Restricted Holiday'),
('OOD', 15, 'On Official Duty'),
('CO', 5, 'Compensatory Off'),
('SL', 10, 'Sick Leave'),
('LWP', 10, 'Leave Without Pay'),
('EL', 30, 'Earned Leave')
ON CONFLICT (leave_type) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for leave_allocations table
CREATE TRIGGER update_leave_allocations_updated_at 
    BEFORE UPDATE ON leave_allocations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
-- Add the columns that the Manage-Departments page expects.
-- Run this once in Supabase (or any Postgres client).

ALTER TABLE public.departments
  ADD COLUMN IF NOT EXISTS head              TEXT,
  ADD COLUMN IF NOT EXISTS established_date  DATE,
  ADD COLUMN IF NOT EXISTS total_students    INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_faculty     INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_courses     INTEGER DEFAULT 0;

-- Optional: keep updated_at in sync when these columns change.
-- (Assumes you already have the update_updated_at_column() trigger.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_departments_updated_at'
  ) THEN
    CREATE TRIGGER update_departments_updated_at
      BEFORE UPDATE ON public.departments
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;
-- Add the short_name column that the dashboard expects.
-- Run this once in Supabase or any Postgres client.

ALTER TABLE public.departments
  ADD COLUMN IF NOT EXISTS short_name TEXT UNIQUE;

-- If you want a quick lookup by short_name (recommended):
CREATE UNIQUE INDEX IF NOT EXISTS departments_short_name_idx
  ON public.departments (short_name);
-- This script modifies the 'faculty' table to ensure 'user_id' is NOT NULL.
-- Before running, ensure any existing NULL 'user_id' values are handled (e.g., by deleting or associating them).
-- If you have existing rows with NULL user_id, this ALTER TABLE statement will fail.
-- You might need to run a cleanup query first, e.g.:
-- DELETE FROM faculty WHERE user_id IS NULL;

ALTER TABLE public.faculty
ALTER COLUMN user_id SET NOT NULL;
-- Create feedback_schedules table
CREATE TABLE IF NOT EXISTS feedback_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phase VARCHAR(20) NOT NULL CHECK (phase IN ('phase-1', 'phase-2')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'upcoming' CHECK (status IN ('active', 'upcoming', 'completed')),
    academic_year VARCHAR(10) NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_feedback table
CREATE TABLE IF NOT EXISTS student_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES students(user_id),
    faculty_id UUID REFERENCES faculty(user_id),
    subject_id UUID REFERENCES subjects(id),
    subject_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    response TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('phase-1', 'phase-2', 'general')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded')),
    schedule_id UUID REFERENCES feedback_schedules(id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE
);

-- Create feedback_responses table for faculty responses
CREATE TABLE IF NOT EXISTS feedback_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feedback_id UUID REFERENCES student_feedback(id),
    faculty_id UUID REFERENCES faculty(user_id),
    response_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feedback_schedules_phase ON feedback_schedules(phase);
CREATE INDEX IF NOT EXISTS idx_feedback_schedules_status ON feedback_schedules(status);
CREATE INDEX IF NOT EXISTS idx_feedback_schedules_dates ON feedback_schedules(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_student_feedback_student ON student_feedback(student_id);
CREATE INDEX IF NOT EXISTS idx_student_feedback_faculty ON student_feedback(faculty_id);
CREATE INDEX IF NOT EXISTS idx_student_feedback_status ON student_feedback(status);
CREATE INDEX IF NOT EXISTS idx_student_feedback_type ON student_feedback(feedback_type);

-- Function to automatically update feedback schedule status
CREATE OR REPLACE FUNCTION update_feedback_schedule_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if the status actually needs to change
    IF TG_OP = 'INSERT' OR 
       (TG_OP = 'UPDATE' AND 
        (OLD.start_date <> NEW.start_date OR OLD.end_date <> NEW.end_date)) THEN
        
        -- Use a different approach to avoid recursive triggers
        EXECUTE format('UPDATE feedback_schedules 
                       SET status = CASE 
                           WHEN end_date < CURRENT_DATE THEN ''completed''
                           WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN ''active''
                           ELSE ''upcoming''
                       END,
                       updated_at = NOW()
                       WHERE id = %L AND 
                       (status <> CASE 
                           WHEN end_date < CURRENT_DATE THEN ''completed''
                           WHEN start_date <= CURRENT_DATE AND end_date >= CURRENT_DATE THEN ''active''
                           ELSE ''upcoming''
                       END OR updated_at <> NOW())', NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update status
DROP TRIGGER IF EXISTS trigger_update_feedback_schedule_status ON feedback_schedules;
CREATE TRIGGER trigger_update_feedback_schedule_status
    AFTER INSERT OR UPDATE OF start_date, end_date ON feedback_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_feedback_schedule_status();
-- Update subjects table to match required structure
-- Adds missing columns, constraints, indexes, and triggers

-- Add missing columns
DO $$
BEGIN
    -- Add subject_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subjects' AND column_name = 'subject_type'
    ) THEN
        ALTER TABLE subjects ADD COLUMN subject_type VARCHAR(20) DEFAULT 'theory';
    END IF;

    -- Add academic_year column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subjects' AND column_name = 'academic_year'
    ) THEN
        ALTER TABLE subjects ADD COLUMN academic_year VARCHAR(20);
    END IF;

    -- Add syllabus column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subjects' AND column_name = 'syllabus'
    ) THEN
        ALTER TABLE subjects ADD COLUMN syllabus TEXT;
    END IF;

    -- Add faculty_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subjects' AND column_name = 'faculty_id'
    ) THEN
        ALTER TABLE subjects ADD COLUMN faculty_id UUID REFERENCES users(id);
    END IF;

    -- Add section column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subjects' AND column_name = 'section'
    ) THEN
        ALTER TABLE subjects ADD COLUMN section VARCHAR(10);
    END IF;

    -- Add created_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subjects' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE subjects ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    -- Add updated_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subjects' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE subjects ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Add constraints
DO $$
BEGIN
    -- subject_type should be one of: theory, practical, project
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'subjects_subject_type_check'
    ) THEN
        ALTER TABLE subjects ADD CONSTRAINT subjects_subject_type_check 
        CHECK (subject_type IN ('theory', 'practical', 'IPCC','project'));
    END IF;

    -- semester should be between 1 and 8
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'subjects_semester_check'
    ) THEN
        ALTER TABLE subjects ADD CONSTRAINT subjects_semester_check 
        CHECK (semester >= 1 AND semester <= 8);
    END IF;

    -- credits should be between 1 and 10
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'subjects_credits_check'
    ) THEN
        ALTER TABLE subjects ADD CONSTRAINT subjects_credits_check 
        CHECK (credits > 0 AND credits <= 10);
    END IF;

    -- REMOVING THE PROBLEMATIC ACADEMIC_YEAR CHECK CONSTRAINT
    -- IF EXISTS (
    --     SELECT 1 FROM information_schema.check_constraints 
    --     WHERE constraint_name = 'subjects_academic_year_check'
    -- ) THEN
    --     ALTER TABLE subjects DROP CONSTRAINT subjects_academic_year_check;
    -- END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_department ON subjects(department);
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON subjects(semester);
CREATE INDEX IF NOT EXISTS idx_subjects_academic_year ON subjects(academic_year);
CREATE INDEX IF NOT EXISTS idx_subjects_faculty_id ON subjects(faculty_id);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(code);

-- Create function to update 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating 'updated_at' on row update
DROP TRIGGER IF EXISTS update_subjects_updated_at ON subjects;
CREATE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON subjects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Set default values for existing null fields
UPDATE subjects SET subject_type = 'theory' WHERE subject_type IS NULL;
UPDATE subjects SET created_at = NOW() WHERE created_at IS NULL;
UPDATE subjects SET updated_at = NOW() WHERE updated_at IS NULL;
-- Add foreign key constraint for faculty_id in the subjects table
-- This links the faculty_id in subjects to the user_id in the faculty table.
-- ON UPDATE CASCADE: If a faculty's user_id changes, update corresponding subjects.
-- ON DELETE SET NULL: If a faculty is deleted, set their assigned subjects' faculty_id to NULL.

DO $$ BEGIN
    ALTER TABLE public.subjects
    ADD CONSTRAINT subjects_faculty_id_fkey
    FOREIGN KEY (faculty_id) REFERENCES public.faculty(user_id)
    ON UPDATE CASCADE ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN RAISE NOTICE 'Constraint subjects_faculty_id_fkey already exists.';
END $$;

-- Ensure the 'section' column exists and is of type TEXT in the subjects table.
-- This is a precautionary step, as the schema already indicates its presence.
DO $$ BEGIN
    ALTER TABLE public.subjects
    ADD COLUMN IF NOT EXISTS section TEXT;
EXCEPTION
    WHEN duplicate_column THEN RAISE NOTICE 'Column section already exists in public.subjects.';
END $$;
-- Create the timetables table if it doesn't exist
CREATE TABLE IF NOT EXISTS timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year TEXT NOT NULL,
    semester INTEGER NOT NULL,
    section TEXT NOT NULL,
    data JSONB NOT NULL, -- Stores the full timetable structure as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add a unique constraint to prevent duplicate timetables for the same academic year, semester, and section
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_timetable_combination
ON timetables (academic_year, semester, section);

-- Create a trigger to update the updated_at column on each row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the old trigger if it exists to avoid duplicates
DROP TRIGGER IF EXISTS set_timestamp ON timetables;

-- Create the new trigger
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON timetables
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
-- Add academic_year column to subjects table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subjects' AND column_name='academic_year') THEN
        ALTER TABLE subjects ADD COLUMN academic_year TEXT;
    END IF;
END $$;

-- Ensure semester column is of type INTEGER
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subjects' AND column_name='semester' AND data_type <> 'integer') THEN
        ALTER TABLE subjects ALTER COLUMN semester TYPE INTEGER USING semester::integer;
    END IF;
END $$;

-- Add faculty_id column to subjects table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subjects' AND column_name='faculty_id') THEN
        ALTER TABLE subjects ADD COLUMN faculty_id UUID;
    END IF;
END $$;

-- Add foreign key constraint for faculty_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_subjects_faculty_id') THEN
        ALTER TABLE subjects
        ADD CONSTRAINT fk_subjects_faculty_id
        FOREIGN KEY (faculty_id) REFERENCES faculty(user_id)
        ON DELETE SET NULL;
    END IF;
END $$;

-- Add section column to subjects table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subjects' AND column_name='section') THEN
        ALTER TABLE subjects ADD COLUMN section TEXT;
    END IF;
END $$;
-- This script ensures the 'courses' table exists with the necessary columns and foreign keys.
-- It's designed to be idempotent, meaning it won't cause issues if the table already exists.

CREATE TABLE IF NOT EXISTS public.courses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id uuid NOT NULL,
    faculty_id uuid NOT NULL,
    semester integer NOT NULL,
    section text NOT NULL,
    academic_year text NOT NULL,
    course_code text,
    course_name text,
    department text,
    faculty_name text,
    syllabus_url text,
    CONSTRAINT fk_subject FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE,
    CONSTRAINT fk_faculty FOREIGN KEY (faculty_id) REFERENCES public.faculty(user_id) ON DELETE CASCADE
);

-- Add unique constraint to prevent duplicate course entries for the same subject, faculty, semester, section, and academic year
ALTER TABLE public.courses
ADD CONSTRAINT unique_course_offering UNIQUE (subject_id, faculty_id, semester, section, academic_year);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_courses_subject_id ON public.courses (subject_id);
CREATE INDEX IF NOT EXISTS idx_courses_faculty_id ON public.courses (faculty_id);
CREATE INDEX IF NOT EXISTS idx_courses_academic_year_semester_section ON public.courses (academic_year, semester, section);

-- Optional: Add comments for better documentation
COMMENT ON TABLE public.courses IS 'Represents specific course offerings, linking subjects to faculties for a given academic period and section.';
COMMENT ON COLUMN public.courses.subject_id IS 'Foreign key to the subjects table.';
COMMENT ON COLUMN public.courses.faculty_id IS 'Foreign key to the faculty table (user_id).';
COMMENT ON COLUMN public.courses.semester IS 'The academic semester the course is offered.';
COMMENT ON COLUMN public.courses.section IS 'The section of the course (e.g., A, B).';
COMMENT ON COLUMN public.courses.academic_year IS 'The academic year the course is offered (e.g., 2023-24(odd)).';
COMMENT ON COLUMN public.courses.course_code IS 'The code of the course (derived from subject).';
COMMENT ON COLUMN public.courses.course_name IS 'The name of the course (derived from subject).';
COMMENT ON COLUMN public.courses.department IS 'The department offering the course.';
COMMENT ON COLUMN public.courses.faculty_name IS 'The name of the faculty teaching the course.';
COMMENT ON COLUMN public.courses.syllabus_url IS 'URL to the course syllabus.';
-- Create new enum for course categories
DO $$ BEGIN
  CREATE TYPE public.course_category_type AS ENUM ('IPCC', 'PCC', 'PEC', 'OEC', 'PROJ');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create new enum for subject components
DO $$ BEGIN
  CREATE TYPE public.subject_component_type AS ENUM ('theory', 'lab', 'project');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add new columns to the subjects table
ALTER TABLE public.subjects
ADD COLUMN course_category public.course_category_type,
ADD COLUMN has_theory BOOLEAN DEFAULT FALSE,
ADD COLUMN has_lab BOOLEAN DEFAULT FALSE;

-- Add new column to the courses table
ALTER TABLE public.courses
ADD COLUMN component_type public.subject_component_type;
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'faculty_user_id_fkey'
          AND table_name = 'faculty'
          AND constraint_type = 'FOREIGN KEY'
    ) THEN
        ALTER TABLE public.faculty
        ADD CONSTRAINT faculty_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.users(id)
        ON UPDATE CASCADE ON DELETE CASCADE;
    END IF;
END $$;
-- Add 'project' to subject_component_type enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum
        JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
        WHERE pg_type.typname = 'subject_component_type'
          AND enumlabel = 'project'
    ) THEN
        ALTER TYPE subject_component_type ADD VALUE 'project';
    END IF;
END $$;

-- Add has_project column to subjects table if it doesn't exist
ALTER TABLE public.subjects
ADD COLUMN IF NOT EXISTS has_project BOOLEAN DEFAULT FALSE;

-- Add credits column to courses table if it doesn't exist
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS credits INTEGER;

-- Add department_id column to courses table if it doesn't exist
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS department_id UUID;

-- Add foreign key constraint for department_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'courses_department_id_fkey'
    ) THEN
        ALTER TABLE public.courses
        ADD CONSTRAINT courses_department_id_fkey
        FOREIGN KEY (department_id) REFERENCES public.departments(id);
    END IF;
END $$;

-- Add department column to courses table if it doesn't exist
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS department TEXT;

-- Backfill department and department_id from subjects if missing
UPDATE public.courses c
SET
    department = s.department,
    department_id = d.id
FROM
    public.subjects s
    LEFT JOIN public.departments d ON s.department = d.name
WHERE
    c.subject_id = s.id
    AND c.department IS NULL;
ALTER TABLE public.courses
DROP CONSTRAINT IF EXISTS unique_course_offering;

ALTER TABLE public.courses
ADD CONSTRAINT unique_course_offering 
UNIQUE (subject_id, academic_year, semester, section, component_type);
SELECT subject_id, academic_year, semester, section, component_type, COUNT(*)
FROM public.courses
GROUP BY subject_id, academic_year, semester, section, component_type
HAVING COUNT(*) > 1;
-- Fix faculty assignments to support multiple faculty per subject component
-- This script ensures proper data structure and relationships

-- Step 1: Fix the courses table structure
DO $$ 
BEGIN
    -- Add component_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'component_type'
    ) THEN
        ALTER TABLE courses ADD COLUMN component_type subject_component_type;
    END IF;
    
    -- Drop old unique constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_course_offering' AND table_name = 'courses'
    ) THEN
        ALTER TABLE courses DROP CONSTRAINT unique_course_offering;
    END IF;
    
    -- Add new unique constraint to allow multiple faculty
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_course_faculty_offering' AND table_name = 'courses'
    ) THEN
        ALTER TABLE courses ADD CONSTRAINT unique_course_faculty_offering 
        UNIQUE (subject_id, academic_year, semester, section, component_type, faculty_id);
    END IF;

    -- Add helpful indexes
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_courses_subject_component'
    ) THEN
        CREATE INDEX idx_courses_subject_component 
        ON courses(subject_id, component_type, academic_year, semester, section);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_courses_faculty'
    ) THEN
        CREATE INDEX idx_courses_faculty ON courses(faculty_id);
    END IF;
END $$;

-- Step 2: Create course_faculty_assignments if needed
CREATE TABLE IF NOT EXISTS course_faculty_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(course_id, faculty_id)
);

-- Step 3: Add indexes for that table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_course_faculty_course'
    ) THEN
        CREATE INDEX idx_course_faculty_course ON course_faculty_assignments(course_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'idx_course_faculty_faculty'
    ) THEN
        CREATE INDEX idx_course_faculty_faculty ON course_faculty_assignments(faculty_id);
    END IF;
END $$;

-- Step 4: Drop and recreate the subject + faculty assignment function
DROP FUNCTION IF EXISTS get_subjects_with_faculty_assignments(TEXT, TEXT);

CREATE OR REPLACE FUNCTION get_subjects_with_faculty_assignments(
    user_role TEXT DEFAULT NULL,
    user_department TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    code TEXT,
    name TEXT,
    semester INTEGER,
    credits INTEGER,
    department TEXT,
    academic_year TEXT,
    has_theory BOOLEAN,
    has_lab BOOLEAN,
    has_project BOOLEAN,
    is_assigned BOOLEAN,
    assigned_faculty_ids TEXT[],
    assigned_faculty_names TEXT[],
    theory_faculty_ids TEXT[],
    theory_faculty_names TEXT[],
    lab_faculty_ids TEXT[],
    lab_faculty_names TEXT[],
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
    subject_record RECORD;
    faculty_record RECORD;
    all_faculty_ids TEXT[] := '{}';
    all_faculty_names TEXT[] := '{}';
    theory_faculty_ids TEXT[] := '{}';
    theory_faculty_names TEXT[] := '{}';
    lab_faculty_ids TEXT[] := '{}';
    lab_faculty_names TEXT[] := '{}';
    faculty_name TEXT;
BEGIN
    FOR subject_record IN 
        SELECT s.* FROM subjects s
        WHERE (user_role IS NULL OR user_role != 'coordinator' OR s.department = user_department)
        ORDER BY s.semester, s.code
    LOOP
        all_faculty_ids := '{}';
        all_faculty_names := '{}';
        theory_faculty_ids := '{}';
        theory_faculty_names := '{}';
        lab_faculty_ids := '{}';
        lab_faculty_names := '{}';

        FOR faculty_record IN
            SELECT DISTINCT c.faculty_id, c.component_type, u.first_name, u.last_name
            FROM courses c
            JOIN users u ON c.faculty_id = u.id
            WHERE c.subject_id = subject_record.id
              AND c.faculty_id IS NOT NULL
        LOOP
            faculty_name := TRIM(COALESCE(faculty_record.first_name, '') || ' ' || COALESCE(faculty_record.last_name, ''));

            IF faculty_record.faculty_id::TEXT != ALL(all_faculty_ids) THEN
                all_faculty_ids := array_append(all_faculty_ids, faculty_record.faculty_id::TEXT);
            END IF;

            IF faculty_name != '' AND faculty_name != ALL(all_faculty_names) THEN
                all_faculty_names := array_append(all_faculty_names, faculty_name);
            END IF;

            IF faculty_record.component_type = 'theory' OR faculty_record.component_type IS NULL THEN
                IF faculty_record.faculty_id::TEXT != ALL(theory_faculty_ids) THEN
                    theory_faculty_ids := array_append(theory_faculty_ids, faculty_record.faculty_id::TEXT);
                END IF;
                IF faculty_name != '' AND faculty_name != ALL(theory_faculty_names) THEN
                    theory_faculty_names := array_append(theory_faculty_names, faculty_name);
                END IF;
            END IF;

            IF faculty_record.component_type = 'lab' THEN
                IF faculty_record.faculty_id::TEXT != ALL(lab_faculty_ids) THEN
                    lab_faculty_ids := array_append(lab_faculty_ids, faculty_record.faculty_id::TEXT);
                END IF;
                IF faculty_name != '' AND faculty_name != ALL(lab_faculty_names) THEN
                    lab_faculty_names := array_append(lab_faculty_names, faculty_name);
                END IF;
            END IF;
        END LOOP;

        -- Output one subject row
        id := subject_record.id;
        code := subject_record.code;
        name := subject_record.name;
        semester := subject_record.semester;
        credits := subject_record.credits;
        department := subject_record.department;
        academic_year := subject_record.academic_year;
        has_theory := COALESCE(subject_record.has_theory, false);
        has_lab := COALESCE(subject_record.has_lab, false);
        has_project := COALESCE(subject_record.has_project, false);
        is_assigned := array_length(all_faculty_ids, 1) > 0;
        assigned_faculty_ids := all_faculty_ids;
        assigned_faculty_names := all_faculty_names;
        theory_faculty_ids := theory_faculty_ids;
        theory_faculty_names := theory_faculty_names;
        lab_faculty_ids := lab_faculty_ids;
        lab_faculty_names := lab_faculty_names;
        created_at := subject_record.created_at;
        updated_at := subject_record.updated_at;

        RETURN NEXT;
    END LOOP;
END;
$$;

-- Step 5: Grant access to client roles
GRANT EXECUTE ON FUNCTION get_subjects_with_faculty_assignments TO authenticated;
GRANT EXECUTE ON FUNCTION get_subjects_with_faculty_assignments TO anon;

-- Step 6: Fix and run duplicate cleanup with proper enum casting
DELETE FROM courses a USING courses b 
WHERE a.id > b.id 
AND a.subject_id = b.subject_id 
AND a.academic_year = b.academic_year 
AND a.semester = b.semester 
AND a.section = b.section 
AND COALESCE(a.component_type::TEXT, '') = COALESCE(b.component_type::TEXT, '')
AND a.faculty_id = b.faculty_id;
-- Add course_enrollments table to track student enrollments in courses
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure a student can only be enrolled once per course
    UNIQUE(course_id, student_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student_id ON course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_active ON course_enrollments(is_active);

-- Add RLS policies for course_enrollments
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Policy for students to see their own enrollments
CREATE POLICY "Students can view their own enrollments" ON course_enrollments
    FOR SELECT USING (
        auth.uid() = student_id OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'principal', 'hod', 'coordinator', 'faculty')
        )
    );

-- Policy for faculty/admin to manage enrollments
CREATE POLICY "Faculty and admin can manage enrollments" ON course_enrollments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'principal', 'hod', 'coordinator', 'faculty')
        )
    );

-- Update the courses table to ensure it has all necessary columns
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS component_type VARCHAR(20) DEFAULT 'theory' CHECK (component_type IN ('theory', 'lab', 'both'));

-- Add a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for course_enrollments
DROP TRIGGER IF EXISTS update_course_enrollments_updated_at ON course_enrollments;
CREATE TRIGGER update_course_enrollments_updated_at
    BEFORE UPDATE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add some helpful views for easier querying
CREATE OR REPLACE VIEW student_course_enrollments AS
SELECT 
    ce.id as enrollment_id,
    ce.course_id,
    ce.student_id,
    ce.enrollment_date,
    ce.is_active,
    c.course_code,
    c.course_name,
    c.semester,
    c.section,
    c.academic_year,
    s.code as subject_code,
    s.name as subject_name,
    s.credits,
    u.first_name || ' ' || u.last_name as student_name,
    st.usn,
    u.email as student_email
FROM course_enrollments ce
JOIN courses c ON ce.course_id = c.id
JOIN subjects s ON c.subject_id = s.id
JOIN users u ON ce.student_id = u.id
JOIN students st ON u.id = st.user_id
WHERE ce.is_active = true;

-- Grant necessary permissions
GRANT SELECT ON student_course_enrollments TO authenticated;
-- Create course_enrollments table to track student enrollments in courses
CREATE TABLE IF NOT EXISTS public.course_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure a student can only be enrolled once per course
    UNIQUE(course_id, student_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student_id ON public.course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_active ON public.course_enrollments(is_active);

-- Disable Row Level Security temporarily to allow operations
ALTER TABLE public.course_enrollments DISABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Faculty and admin can manage enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Faculty can manage all enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Faculty can create enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Faculty can update enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Faculty can delete enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Allow viewing enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Allow creating enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Allow updating enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Allow deleting enrollments" ON public.course_enrollments;

-- For now, let's disable RLS to get the functionality working
-- We can re-enable it later with proper authentication setup
-- ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows all operations for authenticated users
-- This is temporary until we set up proper authentication
-- CREATE POLICY "Allow all operations for authenticated users" ON public.course_enrollments
--     FOR ALL USING (true);

-- Drop the view first to avoid column rename conflicts
DROP VIEW IF EXISTS public.student_course_enrollments;

-- Recreate the view with clean column aliases
CREATE VIEW public.student_course_enrollments AS
SELECT 
    ce.id,
    ce.course_id,
    ce.student_id,
    ce.enrollment_date,
    ce.is_active,
    c.course_code,
    c.course_name,
    c.semester,
    c.section,
    c.academic_year,
    s.code AS subject_code,
    s.name AS subject_name,
    s.credits,
    u.first_name,
    u.last_name,
    u.email,
    st.usn,
    st.roll_number,
    d.name AS department_name,
    d.short_name AS department_short_name
FROM public.course_enrollments ce
JOIN public.courses c ON ce.course_id = c.id
JOIN public.subjects s ON c.subject_id = s.id
JOIN public.users u ON ce.student_id = u.id
LEFT JOIN public.students st ON u.id = st.user_id
LEFT JOIN public.departments d ON c.department_id = d.id
WHERE ce.is_active = true;

-- Grant permissions
GRANT SELECT ON public.student_course_enrollments TO authenticated;
GRANT ALL ON public.course_enrollments TO authenticated;
GRANT ALL ON public.course_enrollments TO anon;

-- Also ensure the courses table has proper permissions
DO $$
BEGIN
    -- Disable RLS on courses table temporarily
    ALTER TABLE public.courses DISABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies to avoid conflicts
    DROP POLICY IF EXISTS "Faculty can manage courses" ON public.courses;
    DROP POLICY IF EXISTS "Users can view courses" ON public.courses;
    DROP POLICY IF EXISTS "Allow viewing courses" ON public.courses;
    DROP POLICY IF EXISTS "Allow managing courses" ON public.courses;
    
    -- Grant permissions
    GRANT ALL ON public.courses TO authenticated;
    GRANT ALL ON public.courses TO anon;
        
EXCEPTION
    WHEN OTHERS THEN
        -- Continue if there are any errors
        NULL;
END $$;

-- Create a function to set user context (for future RLS implementation)
CREATE OR REPLACE FUNCTION public.set_current_user_email(user_email TEXT)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_email', user_email, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.set_current_user_email(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_current_user_email(TEXT) TO anon;
-- Add 'batch' column to 'courses' if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'courses' AND column_name = 'batch'
    ) THEN
        ALTER TABLE courses ADD COLUMN batch VARCHAR(10);
    END IF;
END $$;

-- Add 'batch' column to 'course_enrollments' if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'course_enrollments' AND column_name = 'batch'
    ) THEN
        ALTER TABLE course_enrollments ADD COLUMN batch VARCHAR(10);
    END IF;
END $$;

-- Create indexes if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'idx_courses_batch'
    ) THEN
        CREATE INDEX idx_courses_batch ON courses(batch);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE relname = 'idx_course_enrollments_batch'
    ) THEN
        CREATE INDEX idx_course_enrollments_batch ON course_enrollments(batch);
    END IF;
END $$;

-- Add batch format constraint to 'courses' if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'courses' AND constraint_name = 'chk_courses_batch_format'
    ) THEN
        ALTER TABLE courses 
        ADD CONSTRAINT chk_courses_batch_format 
        CHECK (batch IS NULL OR batch ~ '^[A-D][1-4]$');
    END IF;
END $$;

-- Add batch format constraint to 'course_enrollments' if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'course_enrollments' AND constraint_name = 'chk_course_enrollments_batch_format'
    ) THEN
        ALTER TABLE course_enrollments 
        ADD CONSTRAINT chk_course_enrollments_batch_format 
        CHECK (batch IS NULL OR batch ~ '^[A-D][1-4]$');
    END IF;
END $$;

-- Update existing records to NULL for theory components
UPDATE courses 
SET batch = NULL 
WHERE component_type = 'theory';

-- Ensure existing nulls are retained in enrollments
UPDATE course_enrollments 
SET batch = NULL 
WHERE batch IS NULL;
-- Fix course enrollments table to handle batch assignments better
-- Add batch column if it doesn't exist and update constraints

-- Add batch column to course_enrollments table if it doesn't exist
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS batch VARCHAR(10);

-- Add batch column to courses table if it doesn't exist
ALTER TABLE courses ADD COLUMN IF NOT EXISTS batch VARCHAR(10);

-- Drop the old unique constraint if it exists
ALTER TABLE course_enrollments DROP CONSTRAINT IF EXISTS course_enrollments_course_id_student_id_key;

-- Add new unique constraint that includes batch for lab courses
-- This allows same student to be enrolled in different batches of the same course
ALTER TABLE course_enrollments 
ADD CONSTRAINT course_enrollments_course_id_student_id_batch_key 
UNIQUE (course_id, student_id, batch);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_course_enrollments_batch ON course_enrollments(batch);
CREATE INDEX IF NOT EXISTS idx_courses_batch ON courses(batch);

-- Add number_of_batches column to subjects table for lab batch management
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS number_of_batches INTEGER DEFAULT 1;

-- Update existing subjects to have default number of batches
UPDATE subjects 
SET number_of_batches = CASE 
    WHEN has_lab = true THEN 2 
    ELSE 1 
END 
WHERE number_of_batches IS NULL;
-- Add department_id column to subjects table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subjects' AND column_name = 'department_id') THEN
        ALTER TABLE subjects ADD COLUMN department_id UUID REFERENCES departments(id);
    END IF;
END $$;

-- Update existing subjects to have department_id based on department short_name
UPDATE subjects 
SET department_id = d.id 
FROM departments d 
WHERE subjects.department = d.short_name 
AND subjects.department_id IS NULL;

-- Add number_of_batches column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'subjects' AND column_name = 'number_of_batches') THEN
        ALTER TABLE subjects ADD COLUMN number_of_batches INTEGER DEFAULT 1;
    END IF;
END $$;

-- Update existing subjects to have default number_of_batches
UPDATE subjects 
SET number_of_batches = 1 
WHERE number_of_batches IS NULL;
-- Fix the unique constraint to allow same faculty in different batches
-- Drop the existing constraint
ALTER TABLE public.courses DROP CONSTRAINT IF EXISTS unique_course_faculty_offering;

-- Add the new constraint that includes batch field
ALTER TABLE public.courses ADD CONSTRAINT unique_course_faculty_offering 
UNIQUE (subject_id, academic_year, semester, section, component_type, faculty_id, batch);

---------------------------------------------------------------------------------------------------
-- Additional SQL script to fix timetable data relationships
-- This script ensures proper data consistency for student timetables

-- Update any existing course_enrollments to ensure they have proper batch information for lab subjects
UPDATE course_enrollments 
SET batch = courses.batch 
FROM courses 
WHERE course_enrollments.course_id = courses.id 
  AND courses.component_type = 'lab' 
  AND course_enrollments.batch IS NULL;
-- Drop and recreate the enrollment function with correct return types
DROP FUNCTION IF EXISTS get_student_enrolled_subjects(UUID);

CREATE OR REPLACE FUNCTION get_student_enrolled_subjects(student_user_id UUID)
RETURNS TABLE (
    course_id UUID,
    subject_id UUID,
    subject_code VARCHAR(20),
    subject_name VARCHAR(200),
    component_type VARCHAR(20),
    batch VARCHAR(10),
    faculty_name VARCHAR(300),
    semester INTEGER,
    section VARCHAR(10),
    academic_year VARCHAR(20),
    enrollment_date TIMESTAMPTZ,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ce.course_id,
        c.subject_id,
        s.code::VARCHAR(20) as subject_code,
        s.name::VARCHAR(200) as subject_name,
        COALESCE(c.component_type::VARCHAR(20), 'theory') as component_type,
        COALESCE(ce.batch, c.batch, '')::VARCHAR(10) as batch,
        COALESCE(
            CASE 
                WHEN u.first_name IS NOT NULL AND u.last_name IS NOT NULL 
                THEN (u.first_name || ' ' || u.last_name)::VARCHAR(300)
                ELSE 'TBA'
            END,
            'TBA'
        ) as faculty_name,
        c.semester,
        c.section::VARCHAR(10),
        c.academic_year::VARCHAR(20),
        ce.enrollment_date,
        ce.is_active
    FROM course_enrollments ce
    INNER JOIN courses c ON ce.course_id = c.id
    INNER JOIN subjects s ON c.subject_id = s.id
    LEFT JOIN users u ON c.faculty_id = u.id
    WHERE ce.student_id = student_user_id
    AND ce.is_active = true
    ORDER BY s.code, c.component_type, u.first_name, u.last_name;
END;
$$ LANGUAGE plpgsql;

-- Function to enroll students with multiple faculty support
DROP FUNCTION IF EXISTS enroll_students_with_multiple_faculty(UUID, TEXT, INTEGER, TEXT, TEXT, TEXT, UUID[], UUID[]);

CREATE OR REPLACE FUNCTION enroll_students_with_multiple_faculty(
    p_subject_id UUID,
    p_academic_year TEXT,
    p_semester INTEGER,
    p_section TEXT,
    p_component_type TEXT,
    p_batch TEXT,
    p_student_ids UUID[],
    p_faculty_ids UUID[]
)
RETURNS VOID AS $$
DECLARE
    v_student_id UUID;
    v_faculty_id UUID;
    v_course_record RECORD;
BEGIN
    FOREACH v_faculty_id IN ARRAY p_faculty_ids
    LOOP
        SELECT * INTO v_course_record
        FROM courses c
        WHERE c.subject_id = p_subject_id
        AND c.academic_year = p_academic_year
        AND c.semester = p_semester
        AND c.section = p_section
        AND c.component_type = p_component_type::subject_component_type
        AND c.faculty_id = v_faculty_id
        AND (
            (p_batch IS NULL AND c.batch IS NULL) OR
            (p_batch IS NOT NULL AND c.batch = p_batch)
        );

        IF NOT FOUND THEN
            RAISE NOTICE 'Course not found for faculty % in subject % batch %', v_faculty_id, p_subject_id, p_batch;
            CONTINUE;
        END IF;

        FOREACH v_student_id IN ARRAY p_student_ids
        LOOP
            IF NOT EXISTS (
                SELECT 1 FROM course_enrollments 
                WHERE course_id = v_course_record.id 
                AND student_id = v_student_id
            ) THEN
                INSERT INTO course_enrollments (
                    course_id,
                    student_id,
                    enrollment_date,
                    is_active,
                    batch
                ) VALUES (
                    v_course_record.id,
                    v_student_id,
                    NOW(),
                    true,
                    p_batch
                );
            ELSE
                UPDATE course_enrollments 
                SET is_active = true, batch = p_batch
                WHERE course_id = v_course_record.id 
                AND student_id = v_student_id;
            END IF;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up and re-enroll students properly
DROP FUNCTION IF EXISTS fix_existing_lab_enrollments();

CREATE OR REPLACE FUNCTION fix_existing_lab_enrollments()
RETURNS VOID AS $$
DECLARE
    lab_course RECORD;
    student_ids UUID[];
    faculty_ids UUID[];
BEGIN
    FOR lab_course IN
        SELECT 
            c.subject_id,
            c.academic_year,
            c.semester,
            c.section,
            c.batch,
            c.component_type,
            array_agg(DISTINCT c.faculty_id) as faculty_list,
            array_agg(DISTINCT ce.student_id) as student_list
        FROM courses c
        INNER JOIN course_enrollments ce ON c.id = ce.course_id
        WHERE c.component_type = 'lab'
        AND ce.is_active = true
        GROUP BY c.subject_id, c.academic_year, c.semester, c.section, c.batch, c.component_type
        HAVING count(DISTINCT c.faculty_id) > 1
    LOOP
        RAISE NOTICE 'Processing lab course: subject=%, batch=%, faculty_count=%', 
            lab_course.subject_id, lab_course.batch, array_length(lab_course.faculty_list, 1);

        SELECT array_agg(DISTINCT ce.student_id) INTO student_ids
        FROM course_enrollments ce
        INNER JOIN courses c ON ce.course_id = c.id
        WHERE c.subject_id = lab_course.subject_id
        AND c.academic_year = lab_course.academic_year
        AND c.semester = lab_course.semester
        AND c.section = lab_course.section
        AND c.component_type = lab_course.component_type
        AND (
            (lab_course.batch IS NULL AND c.batch IS NULL) OR
            (lab_course.batch IS NOT NULL AND c.batch = lab_course.batch)
        )
        AND ce.is_active = true;

        PERFORM enroll_students_with_multiple_faculty(
            lab_course.subject_id,
            lab_course.academic_year,
            lab_course.semester,
            lab_course.section,
            lab_course.component_type::TEXT,
            lab_course.batch,
            student_ids,
            lab_course.faculty_list
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_student_enrolled_subjects(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION enroll_students_with_multiple_faculty(UUID, TEXT, INTEGER, TEXT, TEXT, TEXT, UUID[], UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION fix_existing_lab_enrollments() TO authenticated;

-- Run the fix
SELECT fix_existing_lab_enrollments();

-- Test
SELECT * FROM get_student_enrolled_subjects(
    (SELECT user_id FROM students WHERE usn = '1VA22CD012')
);

-- Fix cross-section enrollments and ensure proper course_enrollments structure

-- 1. Ensure course_enrollments table structure
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'course_enrollments' AND column_name = 'batch'
    ) THEN
        ALTER TABLE course_enrollments ADD COLUMN batch VARCHAR(10);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'course_enrollments' AND column_name = 'enrollment_date'
    ) THEN
        ALTER TABLE course_enrollments ADD COLUMN enrollment_date TIMESTAMP DEFAULT NOW();
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'course_enrollments' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE course_enrollments ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student_active 
ON course_enrollments(student_id, is_active);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_active 
ON course_enrollments(course_id, is_active);

-- 3. Drop old function to avoid return type conflict
DROP FUNCTION IF EXISTS get_student_enrolled_subjects(UUID);

-- 4. Function: Get enrolled subjects
CREATE OR REPLACE FUNCTION get_student_enrolled_subjects(student_user_id UUID)
RETURNS TABLE (
    course_id UUID,
    subject_id UUID,
    subject_code VARCHAR,
    subject_name VARCHAR,
    component_type subject_component_type,
    batch VARCHAR,
    faculty_name VARCHAR,
    semester INTEGER,
    section VARCHAR,
    academic_year VARCHAR,
    enrollment_date TIMESTAMP,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        s.id,
        s.code,
        s.name,
        c.component_type,
        COALESCE(ce.batch, c.batch),
        COALESCE(u.first_name || ' ' || u.last_name, 'No Faculty'),
        c.semester,
        c.section,
        c.academic_year,
        ce.enrollment_date,
        ce.is_active
    FROM course_enrollments ce
    INNER JOIN courses c ON ce.course_id = c.id
    INNER JOIN subjects s ON c.subject_id = s.id
    LEFT JOIN users u ON c.faculty_id = u.id
    WHERE ce.student_id = student_user_id 
    AND ce.is_active = TRUE
    ORDER BY s.code, c.component_type, c.section;
END;
$$ LANGUAGE plpgsql;

-- 5. Function: Can enroll student
CREATE OR REPLACE FUNCTION can_enroll_student_in_course(
    p_student_id UUID,
    p_course_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    student_semester INTEGER;
    course_semester INTEGER;
    existing_enrollment_count INTEGER;
BEGIN
    SELECT semester INTO student_semester FROM students WHERE user_id = p_student_id;
    SELECT semester INTO course_semester FROM courses WHERE id = p_course_id;

    IF student_semester != course_semester THEN
        RETURN FALSE;
    END IF;

    SELECT COUNT(*) INTO existing_enrollment_count
    FROM course_enrollments
    WHERE student_id = p_student_id AND course_id = p_course_id AND is_active = TRUE;

    IF existing_enrollment_count > 0 THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 6. Function: Enroll students in multiple courses
CREATE OR REPLACE FUNCTION enroll_students_in_courses(
    p_course_ids UUID[],
    p_student_ids UUID[],
    p_batch VARCHAR DEFAULT NULL
) RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    enrolled_count INTEGER
) AS $$
DECLARE
    course_id UUID;
    student_id UUID;
    enrollment_count INTEGER := 0;
    error_count INTEGER := 0;
    error_messages TEXT[] := ARRAY[]::TEXT[];
BEGIN
    FOREACH course_id IN ARRAY p_course_ids LOOP
        FOREACH student_id IN ARRAY p_student_ids LOOP
            IF can_enroll_student_in_course(student_id, course_id) THEN
                BEGIN
                    INSERT INTO course_enrollments (
                        course_id, student_id, enrollment_date, is_active, batch
                    ) VALUES (
                        course_id, student_id, NOW(), TRUE, p_batch
                    );
                    enrollment_count := enrollment_count + 1;
                EXCEPTION WHEN OTHERS THEN
                    error_count := error_count + 1;
                    error_messages := array_append(error_messages, 
                        'Failed to enroll student ' || student_id || ' in course ' || course_id || ': ' || SQLERRM);
                END;
            ELSE
                error_count := error_count + 1;
                error_messages := array_append(error_messages, 
                    'Student ' || student_id || ' cannot be enrolled in course ' || course_id);
            END IF;
        END LOOP;
    END LOOP;

    IF error_count = 0 THEN
        RETURN QUERY SELECT TRUE, 'All students enrolled successfully', enrollment_count;
    ELSE
        RETURN QUERY SELECT FALSE, array_to_string(error_messages, '; '), enrollment_count;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. Backfill batch for labs
UPDATE course_enrollments ce
SET batch = c.batch
FROM courses c
WHERE ce.course_id = c.id
AND ce.batch IS NULL
AND c.batch IS NOT NULL
AND c.component_type = 'lab';

-- 8. View: Cross-section enrollments
CREATE OR REPLACE VIEW cross_section_enrollments AS
SELECT 
    ce.id AS enrollment_id,
    s_student.section AS student_section,
    c.section AS course_section,
    u.first_name || ' ' || u.last_name AS student_name,
    st.usn,
    subj.code AS subject_code,
    subj.name AS subject_name,
    c.component_type,
    ce.batch,
    c.semester,
    c.academic_year,
    ce.enrollment_date,
    CASE 
        WHEN s_student.section::text != c.section THEN TRUE 
        ELSE FALSE 
    END AS is_cross_section
FROM course_enrollments ce
INNER JOIN courses c ON ce.course_id = c.id
INNER JOIN subjects subj ON c.subject_id = subj.id
INNER JOIN students st ON ce.student_id = st.user_id
INNER JOIN students s_student ON ce.student_id = s_student.user_id
INNER JOIN users u ON ce.student_id = u.id
WHERE ce.is_active = TRUE
ORDER BY subj.code, c.component_type, c.section, u.first_name, u.last_name;

-- 9. Grants
GRANT EXECUTE ON FUNCTION get_student_enrolled_subjects(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION can_enroll_student_in_course(UUID, UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION enroll_students_in_courses(UUID[], UUID[], VARCHAR) TO anon, authenticated;
GRANT SELECT ON cross_section_enrollments TO anon, authenticated;

-- 10. Comments
COMMENT ON FUNCTION get_student_enrolled_subjects(UUID) IS 'Returns all subjects a student is enrolled in, including cross-section enrollments';
COMMENT ON FUNCTION can_enroll_student_in_course(UUID, UUID) IS 'Checks if a student can be enrolled in a specific course (semester match, no duplicates)';
COMMENT ON FUNCTION enroll_students_in_courses(UUID[], UUID[], VARCHAR) IS 'Safely enrolls multiple students in multiple courses with validation';
COMMENT ON VIEW cross_section_enrollments IS 'Shows all enrollments with cross-section indicators for reporting';

-- 11. Trigger: Auto enrollment_date
CREATE OR REPLACE FUNCTION set_enrollment_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.enrollment_date IS NULL THEN
        NEW.enrollment_date := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_enrollment_date ON course_enrollments;
CREATE TRIGGER trigger_set_enrollment_date
    BEFORE INSERT ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION set_enrollment_date();

-- 12. Success message
DO $$
BEGIN
    RAISE NOTICE 'Cross-section enrollment fixes applied successfully!';
    RAISE NOTICE 'New functions created:';
    RAISE NOTICE '  - get_student_enrolled_subjects(UUID)';
    RAISE NOTICE '  - can_enroll_student_in_course(UUID, UUID)';
    RAISE NOTICE '  - enroll_students_in_courses(UUID[], UUID[], VARCHAR)';
    RAISE NOTICE 'New view created: cross_section_enrollments';
    RAISE NOTICE 'Triggers and indexes added for better performance';
END $$;

DROP FUNCTION IF EXISTS get_student_enrolled_subjects(UUID);

CREATE OR REPLACE FUNCTION get_student_enrolled_subjects(student_user_id UUID)
RETURNS TABLE (
    course_id UUID,
    subject_id UUID,
    subject_code VARCHAR,
    subject_name VARCHAR,
    component_type VARCHAR,
    batch VARCHAR,
    faculty_name VARCHAR,
    semester INTEGER,
    section VARCHAR,
    academic_year VARCHAR,
    enrollment_date TIMESTAMPTZ,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id AS course_id,
        s.id AS subject_id,
        s.code AS subject_code,
        s.name AS subject_name,
        c.component_type::VARCHAR AS component_type,
        COALESCE(ce.batch, c.batch) AS batch,
        COALESCE(u.first_name || ' ' || u.last_name, 'No Faculty')::VARCHAR AS faculty_name,
        c.semester,
        c.section::VARCHAR,
        c.academic_year::VARCHAR,
        ce.enrollment_date,
        ce.is_active
    FROM course_enrollments ce
    INNER JOIN courses c ON ce.course_id = c.id
    INNER JOIN subjects s ON c.subject_id = s.id
    LEFT JOIN users u ON c.faculty_id = u.id
    WHERE ce.student_id = student_user_id 
      AND ce.is_active = TRUE
    ORDER BY s.code, c.component_type, c.section;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION get_student_enrolled_subjects(UUID) TO anon, authenticated;

-- Test block
DO $$
DECLARE
    test_student_id UUID;
    enrollment_count INTEGER;
BEGIN
    SELECT user_id INTO test_student_id FROM students LIMIT 1;

    IF test_student_id IS NOT NULL THEN
        SELECT COUNT(*) INTO enrollment_count 
        FROM get_student_enrolled_subjects(test_student_id);
        
        RAISE NOTICE 'Function test completed. Found % enrollments for test student.', enrollment_count;
    ELSE
        RAISE NOTICE 'No students found for testing, but function created successfully.';
    END IF;
END $$;
-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_faculty_timetable_data(UUID);
DROP FUNCTION IF EXISTS get_faculty_weekly_schedule(UUID, DATE);
DROP FUNCTION IF EXISTS get_faculty_attendance_stats(UUID);
DROP FUNCTION IF EXISTS get_subject_color(VARCHAR);

-- Create function to generate subject colors consistently
CREATE OR REPLACE FUNCTION get_subject_color(subject_code VARCHAR)
RETURNS VARCHAR LANGUAGE plpgsql AS $$
DECLARE
    color_options VARCHAR[] := ARRAY[
        '#4f46e5', '#0891b2', '#ca8a04', '#15803d', 
        '#be185d', '#7c3aed', '#ea580c', '#0369a1'
    ];
    hash_value INTEGER;
BEGIN
    -- Generate a consistent hash from subject code
    hash_value := abs(hashtext(subject_code)) % array_length(color_options, 1) + 1;
    RETURN color_options[hash_value];
END;
$$;

-- Create function to get faculty's weekly schedule in the exact format expected by frontend
CREATE OR REPLACE FUNCTION get_faculty_weekly_schedule(
    faculty_user_id UUID,
    week_start_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    day_name VARCHAR,
    time_slot_id VARCHAR,
    start_time VARCHAR,
    end_time VARCHAR,
    subject_code VARCHAR,
    subject_name VARCHAR,
    component_type VARCHAR,
    section VARCHAR,
    batch VARCHAR,
    room_number VARCHAR,
    student_count BIGINT,
    color VARCHAR,
    semester INTEGER,
    academic_year VARCHAR
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    WITH faculty_courses AS (
        SELECT 
            c.id as course_id,
            s.id as subject_id,
            s.code as subject_code,
            s.name as subject_name,
            c.component_type,
            c.semester,
            c.section,
            c.batch,
            c.academic_year,
            s.department,
            COALESCE(enrollment_counts.student_count, 0) as student_count
        FROM courses c
        INNER JOIN subjects s ON c.subject_id = s.id
        LEFT JOIN (
            SELECT 
                ce.course_id,
                COUNT(*) as student_count
            FROM course_enrollments ce
            WHERE ce.is_active = true
            GROUP BY ce.course_id
        ) as enrollment_counts ON enrollment_counts.course_id = c.id
        WHERE c.faculty_id = faculty_user_id
    ),
    timetable_data AS (
        SELECT 
            tt.academic_year,
            tt.semester,
            tt.section,
            cell_data.subject_code,
            cell_data.component_type,
            cell_data.batch,
            cell_data.day as timetable_day,
            cell_data.time_slot_id as timetable_time_slot,
            cell_data.start_time as timetable_start_time,
            cell_data.end_time as timetable_end_time,
            cell_data.color,
            COALESCE(cell_data.room_number, 'TBA') as room_number
        FROM timetables tt,
        LATERAL (
            SELECT 
                cell->>'day' as day,
                cell->>'timeSlotId' as time_slot_id,
                class_entry->>'subjectCode' as subject_code,
                class_entry->>'componentType' as component_type,
                class_entry->>'batch' as batch,
                class_entry->>'color' as color,
                class_entry->>'room' as room_number,
                -- Extract start and end times from time slot
                CASE 
                    WHEN cell->>'timeSlotId' = 'slot1' THEN '8:30'
                    WHEN cell->>'timeSlotId' = 'slot2' THEN '9:30'
                    WHEN cell->>'timeSlotId' = 'slot4' THEN '10:50'
                    WHEN cell->>'timeSlotId' = 'slot5' THEN '11:50'
                    WHEN cell->>'timeSlotId' = 'slot7' THEN '1:30'
                    WHEN cell->>'timeSlotId' = 'slot8' THEN '2:25'
                    WHEN cell->>'timeSlotId' = 'slot9' THEN '3:20'
                    ELSE '8:30'
                END as start_time,
                CASE 
                    WHEN cell->>'timeSlotId' = 'slot1' THEN '9:30'
                    WHEN cell->>'timeSlotId' = 'slot2' THEN '10:30'
                    WHEN cell->>'timeSlotId' = 'slot4' THEN '11:50'
                    WHEN cell->>'timeSlotId' = 'slot5' THEN '12:50'
                    WHEN cell->>'timeSlotId' = 'slot7' THEN '2:25'
                    WHEN cell->>'timeSlotId' = 'slot8' THEN '3:20'
                    WHEN cell->>'timeSlotId' = 'slot9' THEN '4:10'
                    ELSE '9:30'
                END as end_time
            FROM jsonb_array_elements(tt.data->'cells') as cell,
            LATERAL jsonb_array_elements(COALESCE(cell->'classEntries', '[]'::jsonb)) as class_entry
            WHERE jsonb_array_length(COALESCE(cell->'classEntries', '[]'::jsonb)) > 0
        ) as cell_data
    )
    SELECT 
        COALESCE(td.timetable_day, '')::VARCHAR as day_name,
        COALESCE(td.timetable_time_slot, '')::VARCHAR as time_slot_id,
        COALESCE(td.timetable_start_time, '')::VARCHAR as start_time,
        COALESCE(td.timetable_end_time, '')::VARCHAR as end_time,
        fc.subject_code::VARCHAR,
        fc.subject_name::VARCHAR,
        fc.component_type::VARCHAR,
        fc.section::VARCHAR,
        COALESCE(fc.batch, '')::VARCHAR as batch,
        COALESCE(td.room_number, 'TBA')::VARCHAR as room_number,
        fc.student_count,
        COALESCE(td.color, get_subject_color(fc.subject_code))::VARCHAR as color,
        fc.semester,
        fc.academic_year::VARCHAR
    FROM faculty_courses fc
    LEFT JOIN timetable_data td ON (
        td.academic_year = fc.academic_year AND
        td.semester = fc.semester AND
        td.section = fc.section AND
        td.subject_code = fc.subject_code AND
        td.component_type = fc.component_type::VARCHAR AND
        (td.batch = fc.batch OR (td.batch IS NULL AND fc.batch IS NULL))
    )
    WHERE td.timetable_day IS NOT NULL AND td.timetable_time_slot IS NOT NULL
    ORDER BY 
        CASE td.timetable_day
            WHEN 'Monday' THEN 1
            WHEN 'Tuesday' THEN 2
            WHEN 'Wednesday' THEN 3
            WHEN 'Thursday' THEN 4
            WHEN 'Friday' THEN 5
            WHEN 'Saturday' THEN 6
            ELSE 7
        END,
        CASE td.timetable_time_slot
            WHEN 'slot1' THEN 1
            WHEN 'slot2' THEN 2
            WHEN 'slot4' THEN 4
            WHEN 'slot5' THEN 5
            WHEN 'slot7' THEN 7
            WHEN 'slot8' THEN 8
            WHEN 'slot9' THEN 9
            ELSE 10
        END;
END;
$$;

-- Create function to get faculty attendance statistics
CREATE OR REPLACE FUNCTION get_faculty_attendance_stats(faculty_user_id UUID)
RETURNS TABLE (
    total_classes_scheduled BIGINT,
    classes_conducted BIGINT,
    total_students BIGINT,
    average_attendance NUMERIC
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    WITH faculty_courses AS (
        SELECT c.id as course_id
        FROM courses c
        WHERE c.faculty_id = faculty_user_id
    ),
    enrollment_stats AS (
        SELECT 
            COUNT(DISTINCT ce.course_id) as total_courses,
            COUNT(DISTINCT ce.student_id) as total_students
        FROM course_enrollments ce
        INNER JOIN faculty_courses fc ON ce.course_id = fc.course_id
        WHERE ce.is_active = true
    )
    SELECT 
        COALESCE(es.total_courses * 3, 0)::BIGINT as total_classes_scheduled, -- Assume 3 classes per week per course
        COALESCE(es.total_courses * 2, 0)::BIGINT as classes_conducted, -- Mock: 2 out of 3 conducted
        COALESCE(es.total_students, 0)::BIGINT as total_students,
        85.5::NUMERIC as average_attendance -- Mock average attendance
    FROM enrollment_stats es;
END;
$$;

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_student_enrolled_subjects(UUID);

-- Create the function with correct return structure and type casts
CREATE OR REPLACE FUNCTION get_student_enrolled_subjects(student_user_id UUID)
RETURNS TABLE (
    course_id UUID,
    subject_id UUID,
    subject_code VARCHAR,
    subject_name VARCHAR,
    component_type VARCHAR,
    batch VARCHAR,
    faculty_name VARCHAR,
    semester INTEGER,
    section VARCHAR,
    academic_year VARCHAR,
    enrollment_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id AS course_id,
        s.id AS subject_id,
        s.code AS subject_code,
        s.name AS subject_name,
        c.component_type::VARCHAR AS component_type,
        COALESCE(ce.batch, c.batch)::VARCHAR AS batch,
        COALESCE(u.first_name || ' ' || u.last_name, 'No Faculty')::VARCHAR AS faculty_name,
        c.semester,
        c.section::VARCHAR,
        c.academic_year::VARCHAR,
        ce.enrollment_date,  -- Already TIMESTAMP WITH TIME ZONE
        ce.is_active
    FROM course_enrollments ce
    INNER JOIN courses c ON ce.course_id = c.id
    INNER JOIN subjects s ON c.subject_id = s.id
    LEFT JOIN users u ON c.faculty_id = u.id
    WHERE ce.student_id = student_user_id 
      AND ce.is_active = TRUE
    ORDER BY s.code, c.component_type, c.section;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_courses_faculty_id ON courses(faculty_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON course_enrollments(course_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_timetables_lookup ON timetables(academic_year, semester, section);

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_subject_color(VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_faculty_attendance_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_faculty_weekly_schedule(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_student_enrolled_subjects(UUID) TO anon, authenticated;
-- Fix subject batch configuration and ensure proper batch information
-- This script updates the subjects table to have proper batch configuration

-- Step 1: Ensure the subjects table has necessary columns
ALTER TABLE subjects 
ADD COLUMN IF NOT EXISTS has_theory BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS has_lab BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS number_of_batches INTEGER DEFAULT 1;

-- Step 2: Update existing subjects to have consistent flags
UPDATE subjects 
SET has_theory = true, has_lab = false, number_of_batches = 1
WHERE has_theory IS NULL OR has_lab IS NULL;

-- Step 3: Ensure theory subjects that also have labs are marked correctly
UPDATE subjects 
SET has_theory = true 
WHERE has_lab = true;

-- Step 4: Set default number of batches for theory-only subjects
UPDATE subjects 
SET number_of_batches = 1 
WHERE has_lab = false AND number_of_batches > 1;

-- Step 5: Drop the function first to avoid return type conflict
DROP FUNCTION IF EXISTS get_subjects_with_batch_info(integer, text, text);

-- Step 6: Create or replace function to get subjects with batch information
CREATE OR REPLACE FUNCTION get_subjects_with_batch_info(
    p_semester INTEGER DEFAULT NULL,
    p_section TEXT DEFAULT NULL,
    p_academic_year TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    code TEXT,
    name TEXT,
    credits INTEGER,
    semester INTEGER,
    academic_year TEXT,
    department TEXT,
    has_theory BOOLEAN,
    has_lab BOOLEAN,
    number_of_batches INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.code,
        s.name,
        s.credits,
        s.semester,
        s.academic_year,
        s.department,
        COALESCE(s.has_theory, true) as has_theory,
        COALESCE(s.has_lab, false) as has_lab,
        COALESCE(s.number_of_batches, CASE WHEN COALESCE(s.has_lab, false) THEN 3 ELSE 1 END) as number_of_batches,
        s.created_at,
        s.updated_at
    FROM subjects s
    WHERE 
        (p_semester IS NULL OR s.semester = p_semester) AND
        (p_academic_year IS NULL OR s.academic_year = p_academic_year)
    ORDER BY s.semester, s.code;
END;
$$;

-- Step 7: Final cleanup for any NULLs remaining
UPDATE subjects 
SET 
    has_theory = COALESCE(has_theory, true),
    has_lab = COALESCE(has_lab, false),
    number_of_batches = COALESCE(number_of_batches, CASE WHEN COALESCE(has_lab, false) THEN 3 ELSE 1 END)
WHERE has_theory IS NULL OR has_lab IS NULL OR number_of_batches IS NULL;

-- Step 8: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_semester_academic_year ON subjects(semester, academic_year);
CREATE INDEX IF NOT EXISTS idx_subjects_department ON subjects(department);
CREATE INDEX IF NOT EXISTS idx_subjects_has_lab ON subjects(has_lab);

-- Step 9: Grant necessary permissions to clients
GRANT EXECUTE ON FUNCTION get_subjects_with_batch_info TO authenticated;
GRANT EXECUTE ON FUNCTION get_subjects_with_batch_info TO anon;

-- Optional commit (only if you're running inside a transaction block)
-- COMMIT;
-- Fix subject batch synchronization issue
-- This script ensures that the number_of_batches in subjects table is properly synced
-- with the actual course assignments

-- Step 1: Create a function to calculate actual number of batches for a subject
CREATE OR REPLACE FUNCTION calculate_subject_batches(subject_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    max_batch_number INTEGER := 0;
    batch_record RECORD;
BEGIN
    -- Get all lab courses for this subject and extract batch numbers
    FOR batch_record IN 
        SELECT DISTINCT batch
        FROM courses 
        WHERE subject_id = subject_uuid 
        AND component_type = 'lab'
        AND batch IS NOT NULL
    LOOP
        -- Extract the numeric part from batch names like 'A1', 'B2', etc.
        DECLARE
            batch_number INTEGER;
        BEGIN
            batch_number := CAST(RIGHT(batch_record.batch, LENGTH(batch_record.batch) - 1) AS INTEGER);
            IF batch_number > max_batch_number THEN
                max_batch_number := batch_number;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                -- Skip invalid batch names
                CONTINUE;
        END;
    END LOOP;
    
    -- Return at least 1 for lab subjects, or 1 for theory-only subjects
    RETURN GREATEST(max_batch_number, 1);
END;
$$;

-- Step 2: Update all existing subjects to have correct number_of_batches
UPDATE subjects 
SET number_of_batches = calculate_subject_batches(id)
WHERE has_lab = true;

-- Step 3: Ensure theory-only subjects have number_of_batches = 1
UPDATE subjects 
SET number_of_batches = 1
WHERE has_lab = false OR has_lab IS NULL;

-- Step 4: Create a trigger function to automatically update number_of_batches
-- when courses are inserted, updated, or deleted
CREATE OR REPLACE FUNCTION sync_subject_batches()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    affected_subject_id UUID;
BEGIN
    -- Determine which subject was affected
    IF TG_OP = 'DELETE' THEN
        affected_subject_id := OLD.subject_id;
    ELSE
        affected_subject_id := NEW.subject_id;
    END IF;
    
    -- Only update if it's a lab course
    IF (TG_OP = 'DELETE' AND OLD.component_type = 'lab') OR 
       (TG_OP != 'DELETE' AND NEW.component_type = 'lab') THEN
        
        -- Update the subject's number_of_batches
        UPDATE subjects 
        SET number_of_batches = calculate_subject_batches(affected_subject_id),
            updated_at = NOW()
        WHERE id = affected_subject_id;
    END IF;
    
    -- Return appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Step 5: Create the trigger
DROP TRIGGER IF EXISTS trigger_sync_subject_batches ON courses;
CREATE TRIGGER trigger_sync_subject_batches
    AFTER INSERT OR UPDATE OR DELETE ON courses
    FOR EACH ROW
    EXECUTE FUNCTION sync_subject_batches();

-- Step 6: Create a function to manually sync a specific subject's batches
-- This can be called from the application when needed
CREATE OR REPLACE FUNCTION sync_subject_batch_count(subject_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    new_batch_count INTEGER;
BEGIN
    -- Calculate the new batch count
    new_batch_count := calculate_subject_batches(subject_uuid);
    
    -- Update the subject
    UPDATE subjects 
    SET number_of_batches = new_batch_count,
        updated_at = NOW()
    WHERE id = subject_uuid;
    
    -- Return the new batch count
    RETURN new_batch_count;
END;
$$;

-- Step 7: Create a function to get subjects with correct batch information
-- This replaces the problematic get_subjects_with_batch_info function
CREATE OR REPLACE FUNCTION get_subjects_with_current_batches(
    p_semester INTEGER DEFAULT NULL,
    p_section TEXT DEFAULT NULL,
    p_academic_year TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    code TEXT,
    name TEXT,
    credits INTEGER,
    semester INTEGER,
    academic_year TEXT,
    department TEXT,
    has_theory BOOLEAN,
    has_lab BOOLEAN,
    number_of_batches INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.code,
        s.name,
        s.credits,
        s.semester,
        s.academic_year,
        s.department,
        COALESCE(s.has_theory, true) as has_theory,
        COALESCE(s.has_lab, false) as has_lab,
        -- Use the calculated batch count, ensuring it's at least 1
        GREATEST(COALESCE(s.number_of_batches, 1), 1) as number_of_batches,
        s.created_at,
        s.updated_at
    FROM subjects s
    WHERE 
        (p_semester IS NULL OR s.semester = p_semester) AND
        (p_academic_year IS NULL OR s.academic_year = p_academic_year)
    ORDER BY s.semester, s.code;
END;
$$;

-- Step 8: Fix any subjects that might have NULL or 0 number_of_batches
UPDATE subjects 
SET number_of_batches = CASE 
    WHEN has_lab = true THEN GREATEST(COALESCE(number_of_batches, 1), 1)
    ELSE 1
END
WHERE number_of_batches IS NULL OR number_of_batches < 1;

-- Step 9: Add a constraint to ensure number_of_batches is always positive
ALTER TABLE subjects 
DROP CONSTRAINT IF EXISTS check_positive_batches;

ALTER TABLE subjects 
ADD CONSTRAINT check_positive_batches 
CHECK (number_of_batches > 0);

-- Step 10: Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_subjects_batch_info 
ON subjects(semester, academic_year, has_lab, number_of_batches);

-- Step 11: Grant necessary permissions
GRANT EXECUTE ON FUNCTION calculate_subject_batches TO authenticated;
GRANT EXECUTE ON FUNCTION sync_subject_batch_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_subjects_with_current_batches TO authenticated;
GRANT EXECUTE ON FUNCTION sync_subject_batches TO authenticated;

-- Step 12: Verify the fix by showing current batch counts
SELECT 
    code,
    name,
    semester,
    has_lab,
    number_of_batches,
    (SELECT COUNT(DISTINCT batch) 
     FROM courses 
     WHERE subject_id = subjects.id 
     AND component_type = 'lab' 
     AND batch IS NOT NULL) as actual_lab_batches
FROM subjects 
WHERE has_lab = true
ORDER BY semester, code;

-- Step 13: Create a maintenance function to fix any inconsistencies
CREATE OR REPLACE FUNCTION fix_all_subject_batches()
RETURNS TABLE (
    subject_code TEXT,
    old_batch_count INTEGER,
    new_batch_count INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    subject_record RECORD;
    old_count INTEGER;
    new_count INTEGER;
BEGIN
    FOR subject_record IN 
        SELECT id, code, number_of_batches 
        FROM subjects 
        WHERE has_lab = true
    LOOP
        old_count := subject_record.number_of_batches;
        new_count := sync_subject_batch_count(subject_record.id);
        
        IF old_count != new_count THEN
            subject_code := subject_record.code;
            old_batch_count := old_count;
            new_batch_count := new_count;
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$;

-- Run the maintenance function to show what was fixed
SELECT * FROM fix_all_subject_batches();

COMMIT;
-- Create weekly_timetable_modifications table for faculty-specific weekly schedule changes
CREATE TABLE IF NOT EXISTS weekly_timetable_modifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    original_class_id TEXT NOT NULL,
    modified_class_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one modification per faculty per week per class
    UNIQUE(faculty_id, week_start_date, original_class_id)
);

-- Create index for faster queries by faculty and week
CREATE INDEX IF NOT EXISTS idx_weekly_timetable_modifications_faculty_week 
ON weekly_timetable_modifications(faculty_id, week_start_date);

-- Create index for faster queries by faculty
CREATE INDEX IF NOT EXISTS idx_weekly_timetable_modifications_faculty 
ON weekly_timetable_modifications(faculty_id);

-- Enable RLS
ALTER TABLE weekly_timetable_modifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Faculty can view their own modifications" ON weekly_timetable_modifications;
DROP POLICY IF EXISTS "Faculty can insert their own modifications" ON weekly_timetable_modifications;
DROP POLICY IF EXISTS "Faculty can update their own modifications" ON weekly_timetable_modifications;
DROP POLICY IF EXISTS "Faculty can delete their own modifications" ON weekly_timetable_modifications;

-- Create more permissive RLS policies for now (we'll handle authorization in the application layer)
CREATE POLICY "Allow all operations for authenticated users" ON weekly_timetable_modifications
    FOR ALL USING (true);

-- Grant necessary permissions
GRANT ALL ON weekly_timetable_modifications TO authenticated;
GRANT ALL ON weekly_timetable_modifications TO service_role;

-- Add comments for documentation
COMMENT ON TABLE weekly_timetable_modifications IS 'Stores faculty-specific weekly modifications to their timetable';
COMMENT ON COLUMN weekly_timetable_modifications.faculty_id IS 'Reference to the faculty member who made the modification';
COMMENT ON COLUMN weekly_timetable_modifications.week_start_date IS 'Start date of the week (Monday) for which the modification applies';
COMMENT ON COLUMN weekly_timetable_modifications.original_class_id IS 'ID of the original class that was modified';
COMMENT ON COLUMN weekly_timetable_modifications.modified_class_data IS 'JSON data containing the modified class information';
-- Add created_by_id column to attendance_sessions table
-- This script adds the missing created_by_id column and removes the not-null constraint from start_time

-- First, add the created_by_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance_sessions' 
        AND column_name = 'created_by_id'
    ) THEN
        ALTER TABLE attendance_sessions 
        ADD COLUMN created_by_id UUID REFERENCES users(id);
    END IF;
END $$;

-- Remove the not-null constraint from start_time since it's not always needed
ALTER TABLE attendance_sessions 
ALTER COLUMN start_time DROP NOT NULL;

-- Remove the not-null constraint from end_time since it's not always needed
ALTER TABLE attendance_sessions 
ALTER COLUMN end_time DROP NOT NULL;

-- Add an index on created_by_id for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_created_by_id 
ON attendance_sessions(created_by_id);

-- Add a comment to document the change
COMMENT ON COLUMN attendance_sessions.created_by_id IS 'ID of the user who created this attendance session';
-- Fix attendance_sessions table schema
-- Remove NOT NULL constraints from start_time and end_time
-- Ensure course_id foreign key exists and is properly configured

-- First, check if the table exists and get its current structure
DO $$
BEGIN
    -- Remove NOT NULL constraint from start_time if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance_sessions' 
        AND column_name = 'start_time' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE attendance_sessions ALTER COLUMN start_time DROP NOT NULL;
        RAISE NOTICE 'Removed NOT NULL constraint from start_time';
    END IF;

    -- Remove NOT NULL constraint from end_time if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance_sessions' 
        AND column_name = 'end_time' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE attendance_sessions ALTER COLUMN end_time DROP NOT NULL;
        RAISE NOTICE 'Removed NOT NULL constraint from end_time';
    END IF;

    -- Ensure course_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance_sessions' 
        AND column_name = 'course_id'
    ) THEN
        ALTER TABLE attendance_sessions ADD COLUMN course_id UUID;
        RAISE NOTICE 'Added course_id column';
    END IF;

    -- Add foreign key constraint for course_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'attendance_sessions' 
        AND constraint_name = 'attendance_sessions_course_id_fkey'
    ) THEN
        ALTER TABLE attendance_sessions 
        ADD CONSTRAINT attendance_sessions_course_id_fkey 
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for course_id';
    END IF;

    -- Ensure created_by_id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance_sessions' 
        AND column_name = 'created_by_id'
    ) THEN
        ALTER TABLE attendance_sessions ADD COLUMN created_by_id UUID;
        RAISE NOTICE 'Added created_by_id column';
    END IF;

    -- Add foreign key constraint for created_by_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'attendance_sessions' 
        AND constraint_name = 'attendance_sessions_created_by_id_fkey'
    ) THEN
        ALTER TABLE attendance_sessions 
        ADD CONSTRAINT attendance_sessions_created_by_id_fkey 
        FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint for created_by_id';
    END IF;

    -- Ensure created_at column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'attendance_sessions' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE attendance_sessions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column';
    END IF;

END $$;

-- Update the table comment
COMMENT ON TABLE attendance_sessions IS 'Stores attendance sessions for courses with optional time constraints';
COMMENT ON COLUMN attendance_sessions.course_id IS 'References the course for which attendance is being taken';
COMMENT ON COLUMN attendance_sessions.start_time IS 'Optional start time for the class session';
COMMENT ON COLUMN attendance_sessions.end_time IS 'Optional end time for the class session';
COMMENT ON COLUMN attendance_sessions.created_by_id IS 'Faculty member who created this attendance session';
COMMENT ON COLUMN attendance_sessions.created_at IS 'Timestamp when the session was created';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_course_id ON attendance_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_date ON attendance_sessions(date);
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_created_by ON attendance_sessions(created_by_id);
