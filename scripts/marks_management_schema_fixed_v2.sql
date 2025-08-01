-- This script ensures the necessary tables and functions for marks management are correctly set up.
-- APPROACH: Create table and functions first, then add security policies separately

-- Drop existing table if it exists (for clean setup)
DROP TABLE IF EXISTS student_marks CASCADE;

-- Create the student_marks table WITHOUT RLS initially
CREATE TABLE student_marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    assessment_type VARCHAR(20) NOT NULL CHECK (assessment_type IN ('IA1', 'IA2', 'IA3', 'Assignment1', 'Assignment2', 'Assignment3', 'Assignment4', 'Assignment5', 'Final')),
    max_marks INTEGER NOT NULL,
    obtained_marks INTEGER NOT NULL,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    entered_by UUID NOT NULL REFERENCES users(id),
    entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    remarks TEXT,
    UNIQUE(student_id, course_id, assessment_type)
);

-- Create indexes for better performance
CREATE INDEX idx_student_marks_student_id ON student_marks(student_id);
CREATE INDEX idx_student_marks_course_id ON student_marks(course_id);
CREATE INDEX idx_student_marks_assessment_type ON student_marks(assessment_type);
CREATE INDEX idx_student_marks_assessment_date ON student_marks(assessment_date);

-- Function to get academic years from courses table
CREATE OR REPLACE FUNCTION get_academic_years()
RETURNS TABLE (
    academic_year VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT c.academic_year
    FROM courses c
    WHERE c.academic_year IS NOT NULL
    ORDER BY c.academic_year DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get faculty courses for marks entry
CREATE OR REPLACE FUNCTION get_faculty_courses_for_marks(
    p_faculty_user_id UUID,
    p_academic_year VARCHAR DEFAULT NULL,
    p_semester INTEGER DEFAULT NULL,
    p_section VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    course_id UUID,
    subject_id UUID,
    subject_code VARCHAR,
    subject_name VARCHAR,
    component_type subject_component_type,
    semester INTEGER,
    section VARCHAR,
    academic_year VARCHAR,
    batch VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id as course_id,
        c.subject_id,
        s.code as subject_code,
        s.name as subject_name,
        c.component_type,
        c.semester,
        c.section,
        c.academic_year,
        c.batch
    FROM courses c
    JOIN subjects s ON c.subject_id = s.id
    WHERE c.faculty_id = p_faculty_user_id
        AND (p_academic_year IS NULL OR c.academic_year = p_academic_year)
        AND (p_semester IS NULL OR c.semester = p_semester)
        AND (p_section IS NULL OR c.section = p_section)
    ORDER BY s.code, c.component_type, c.section, c.batch;
END;
$$ LANGUAGE plpgsql;

-- Function to get students in a course
CREATE OR REPLACE FUNCTION get_course_students_for_marks(p_course_id UUID)
RETURNS TABLE (
    student_id UUID,
    student_name VARCHAR,
    usn VARCHAR,
    roll_number VARCHAR,
    email VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id as student_id,
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        st.usn,
        st.roll_number,
        u.email
    FROM courses c
    JOIN students st ON (
        st.semester = c.semester
        AND st.section = c.section
        AND st.academic_year = c.academic_year
    )
    JOIN users u ON st.user_id = u.id
    WHERE c.id = p_course_id
        AND u.is_active = true
        AND u.role = 'student'
    ORDER BY st.roll_number, u.first_name, u.last_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get student marks with details
CREATE OR REPLACE FUNCTION get_student_marks_with_details(p_student_user_id UUID)
RETURNS TABLE (
    mark_id UUID,
    student_id UUID,
    course_id UUID,
    subject_id UUID,
    subject_code VARCHAR,
    subject_name VARCHAR,
    component_type subject_component_type,
    assessment_type VARCHAR,
    max_marks INTEGER,
    obtained_marks INTEGER,
    assessment_date DATE,
    percentage DECIMAL,
    grade VARCHAR,
    semester INTEGER,
    academic_year VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sm.id as mark_id,
        sm.student_id,
        sm.course_id,
        c.subject_id,
        s.code as subject_code,
        s.name as subject_name,
        c.component_type,
        sm.assessment_type,
        sm.max_marks,
        sm.obtained_marks,
        sm.assessment_date,
        ROUND((sm.obtained_marks::DECIMAL / sm.max_marks::DECIMAL) * 100, 2) as percentage,
        CASE
            WHEN (sm.obtained_marks::DECIMAL / sm.max_marks::DECIMAL) * 100 >= 90 THEN 'Excellent'
            WHEN (sm.obtained_marks::DECIMAL / sm.max_marks::DECIMAL) * 100 >= 75 THEN 'Good'
            WHEN (sm.obtained_marks::DECIMAL / sm.max_marks::DECIMAL) * 100 >= 60 THEN 'Average'
            ELSE 'Needs Improvement'
        END as grade,
        c.semester,
        c.academic_year
    FROM student_marks sm
    JOIN courses c ON sm.course_id = c.id
    JOIN subjects s ON c.subject_id = s.id
    WHERE sm.student_id = p_student_user_id
    ORDER BY s.code, sm.assessment_type, sm.assessment_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to upsert student marks
CREATE OR REPLACE FUNCTION upsert_student_marks(
    p_student_id UUID,
    p_course_id UUID,
    p_assessment_type VARCHAR,
    p_max_marks INTEGER,
    p_obtained_marks INTEGER,
    p_entered_by UUID,
    p_assessment_date DATE DEFAULT CURRENT_DATE
)
RETURNS UUID AS $$
DECLARE
    mark_id UUID;
BEGIN
    INSERT INTO student_marks (
        student_id,
        course_id,
        assessment_type,
        max_marks,
        obtained_marks,
        entered_by,
        assessment_date,
        updated_at
    )
    VALUES (
        p_student_id,
        p_course_id,
        p_assessment_type,
        p_max_marks,
        p_obtained_marks,
        p_entered_by,
        p_assessment_date,
        NOW()
    )
    ON CONFLICT (student_id, course_id, assessment_type)
    DO UPDATE SET
        max_marks = EXCLUDED.max_marks,
        obtained_marks = EXCLUDED.obtained_marks,
        entered_by = EXCLUDED.entered_by,
        assessment_date = EXCLUDED.assessment_date,
        updated_at = NOW()
    RETURNING id INTO mark_id;

    RETURN mark_id;
END;
$$ LANGUAGE plpgsql;

-- Grant basic permissions first
GRANT SELECT, INSERT, UPDATE ON student_marks TO authenticated;
GRANT EXECUTE ON FUNCTION get_student_marks_with_details(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_faculty_courses_for_marks(UUID, VARCHAR, INTEGER, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION get_course_students_for_marks(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_student_marks(UUID, UUID, VARCHAR, INTEGER, INTEGER, UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION get_academic_years() TO authenticated;

-- Now enable RLS and create policies using a different approach
ALTER TABLE student_marks ENABLE ROW LEVEL SECURITY;

-- Create a helper function for checking user permissions
CREATE OR REPLACE FUNCTION can_access_student_marks(mark_student_id UUID, mark_course_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if current user is the student
    IF auth.uid() = mark_student_id THEN
        RETURN TRUE;
    END IF;
    
    -- Check if current user is faculty for this course
    IF EXISTS (
        SELECT 1 FROM courses c
        WHERE c.id = mark_course_id
        AND c.faculty_id = auth.uid()
    ) THEN
        RETURN TRUE;
    END IF;
    
    -- Check if current user has admin privileges
    IF EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid()
        AND u.role IN ('hod', 'coordinator', 'principal', 'admin')
    ) THEN
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies using the helper function
CREATE POLICY "student_marks_access_policy" ON student_marks
    FOR ALL USING (can_access_student_marks(student_id, course_id));

-- Grant execute permission on helper function
GRANT EXECUTE ON FUNCTION can_access_student_marks(UUID, UUID) TO authenticated;
