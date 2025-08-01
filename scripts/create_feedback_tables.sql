-- Create student_feedback table
CREATE TABLE IF NOT EXISTS student_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_name TEXT NOT NULL,
    message TEXT NOT NULL,
    response TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('phase-1', 'phase-2', 'general')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_feedback_student_id ON student_feedback(student_id);
CREATE INDEX IF NOT EXISTS idx_student_feedback_faculty_id ON student_feedback(faculty_id);
CREATE INDEX IF NOT EXISTS idx_student_feedback_course_id ON student_feedback(course_id);
CREATE INDEX IF NOT EXISTS idx_student_feedback_subject_id ON student_feedback(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_feedback_feedback_type ON student_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_student_feedback_status ON student_feedback(status);
CREATE INDEX IF NOT EXISTS idx_student_feedback_submitted_at ON student_feedback(submitted_at);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_student_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_student_feedback_updated_at
    BEFORE UPDATE ON student_feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_student_feedback_updated_at();

-- Enable Row Level Security
ALTER TABLE student_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Students can view their own feedback" ON student_feedback
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can insert their own feedback" ON student_feedback
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Faculty can view feedback for their courses" ON student_feedback
    FOR SELECT USING (faculty_id = auth.uid());

CREATE POLICY "Faculty can update responses to their feedback" ON student_feedback
    FOR UPDATE USING (faculty_id = auth.uid())
    WITH CHECK (faculty_id = auth.uid());

-- Create policy for admins and coordinators to view all feedback
CREATE POLICY "Admins and coordinators can view all feedback" ON student_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'coordinator', 'principal', 'hod')
        )
    );

-- Grant necessary permissions
GRANT SELECT, INSERT ON student_feedback TO authenticated;
GRANT UPDATE (response, status, responded_at, updated_at) ON student_feedback TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE student_feedback IS 'Stores student feedback for courses and faculty';
COMMENT ON COLUMN student_feedback.feedback_type IS 'Type of feedback: phase-1, phase-2, or general';
COMMENT ON COLUMN student_feedback.status IS 'Status of feedback: pending or responded';
COMMENT ON COLUMN student_feedback.rating IS 'Student rating from 1 to 5 stars';
