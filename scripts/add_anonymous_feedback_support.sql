-- Add is_anonymous column to student_feedback table if it doesn't exist
DO $$ 
BEGIN
    -- Add is_anonymous column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'student_feedback' 
        AND column_name = 'is_anonymous'
    ) THEN
        ALTER TABLE student_feedback 
        ADD COLUMN is_anonymous BOOLEAN DEFAULT false;
        
        COMMENT ON COLUMN student_feedback.is_anonymous IS 'Whether this feedback was submitted anonymously';
    END IF;

    -- Add updated_at column if it doesn't exist (for future use)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'student_feedback' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE student_feedback 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        
        COMMENT ON COLUMN student_feedback.updated_at IS 'When the feedback record was last updated';
    END IF;

    -- Create trigger to automatically update updated_at column
    CREATE OR REPLACE FUNCTION update_student_feedback_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Drop trigger if exists and recreate
    DROP TRIGGER IF EXISTS trigger_update_student_feedback_updated_at ON student_feedback;
    CREATE TRIGGER trigger_update_student_feedback_updated_at
        BEFORE UPDATE ON student_feedback
        FOR EACH ROW
        EXECUTE FUNCTION update_student_feedback_updated_at();

    -- Update existing records to set is_anonymous based on student_id
    UPDATE student_feedback 
    SET is_anonymous = true 
    WHERE student_id = 'anonymous' OR student_id IS NULL;

    -- Create index for better performance on anonymous feedback queries
    CREATE INDEX IF NOT EXISTS idx_student_feedback_is_anonymous 
    ON student_feedback(is_anonymous);

    -- Create index for better performance on faculty_id queries
    CREATE INDEX IF NOT EXISTS idx_student_feedback_faculty_id 
    ON student_feedback(faculty_id);

    -- Create index for better performance on status queries
    CREATE INDEX IF NOT EXISTS idx_student_feedback_status 
    ON student_feedback(status);

END $$;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'student_feedback' 
AND column_name IN ('is_anonymous', 'updated_at')
ORDER BY column_name;
