-- Add subject_assignment_id column to attendance_sessions table
ALTER TABLE attendance_sessions
ADD COLUMN IF NOT EXISTS subject_assignment_id UUID REFERENCES subject_assignments(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_subject_assignment_id ON attendance_sessions(subject_assignment_id);

-- Update existing attendance_sessions to have subject_assignment_id based on course_id
UPDATE attendance_sessions
SET subject_assignment_id = (
    SELECT sa.id
    FROM subject_assignments sa
    JOIN courses c ON sa.subject_id = c.subject_id
    WHERE c.id = attendance_sessions.course_id
    LIMIT 1
)
WHERE subject_assignment_id IS NULL;

-- Make the subject_assignment_id NOT NULL
ALTER TABLE attendance_sessions ALTER COLUMN subject_assignment_id SET NOT NULL;
