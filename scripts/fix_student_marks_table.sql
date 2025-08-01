-- Create student_marks table with proper schema
CREATE TABLE IF NOT EXISTS student_marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    assessment_type VARCHAR(50) NOT NULL,
    max_marks INTEGER NOT NULL DEFAULT 30,
    obtained_marks INTEGER NOT NULL,
    assessment_date DATE NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique constraint for student, course, and assessment type
    UNIQUE(student_id, course_id, assessment_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_marks_student_id ON student_marks(student_id);
CREATE INDEX IF NOT EXISTS idx_student_marks_course_id ON student_marks(course_id);
CREATE INDEX IF NOT EXISTS idx_student_marks_assessment_type ON student_marks(assessment_type);
CREATE INDEX IF NOT EXISTS idx_student_marks_assessment_date ON student_marks(assessment_date);

-- Enable RLS
ALTER TABLE student_marks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Faculty can view marks for their courses" ON student_marks
    FOR SELECT USING (
        course_id IN (
            SELECT id FROM courses WHERE faculty_id = auth.uid()
        )
    );

CREATE POLICY "Faculty can insert marks for their courses" ON student_marks
    FOR INSERT WITH CHECK (
        course_id IN (
            SELECT id FROM courses WHERE faculty_id = auth.uid()
        )
    );

CREATE POLICY "Faculty can update marks for their courses" ON student_marks
    FOR UPDATE USING (
        course_id IN (
            SELECT id FROM courses WHERE faculty_id = auth.uid()
        )
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_student_marks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_student_marks_updated_at
    BEFORE UPDATE ON student_marks
    FOR EACH ROW
    EXECUTE FUNCTION update_student_marks_updated_at();
