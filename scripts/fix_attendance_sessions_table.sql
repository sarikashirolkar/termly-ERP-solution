-- Ensure attendance_sessions table has the correct structure
ALTER TABLE attendance_sessions 
ADD COLUMN IF NOT EXISTS subject_assignment_id UUID REFERENCES subject_assignments(id);

-- Update existing attendance_sessions that don't have subject_assignment_id
UPDATE attendance_sessions 
SET subject_assignment_id = (
    SELECT sa.id 
    FROM subject_assignments sa
    JOIN courses c ON c.subject_id = sa.subject_id
    WHERE c.id = attendance_sessions.course_id
    AND sa.is_active = true
    LIMIT 1
)
WHERE subject_assignment_id IS NULL;

-- Make subject_assignment_id NOT NULL after populating existing records
-- ALTER TABLE attendance_sessions ALTER COLUMN subject_assignment_id SET NOT NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_sessions_subject_assignment_id 
ON attendance_sessions(subject_assignment_id);
