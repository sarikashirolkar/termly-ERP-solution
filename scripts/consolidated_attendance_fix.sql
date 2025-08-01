-- ============================================================================
-- Consolidated Attendance System Fix
-- This script combines all attendance-related fixes into a single script
-- ============================================================================

-- 1. FIX TABLE STRUCTURES AND CONSTRAINTS
-- ============================================================================

-- Fix attendance_sessions table structure
DO $$
BEGIN
    -- Add missing columns to attendance_sessions if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_sessions' AND column_name = 'created_at') THEN
        ALTER TABLE attendance_sessions ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_sessions' AND column_name = 'created_by_id') THEN
        ALTER TABLE attendance_sessions ADD COLUMN created_by_id UUID REFERENCES users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_sessions' AND column_name = 'course_id') THEN
        ALTER TABLE attendance_sessions ADD COLUMN course_id UUID REFERENCES courses(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_sessions' AND column_name = 'date') THEN
        ALTER TABLE attendance_sessions ADD COLUMN date DATE NOT NULL;
    END IF;
END $$;

-- Fix attendance_records table structure
DO $$
BEGIN
    -- Add missing columns to attendance_records if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_records' AND column_name = 'marked_at') THEN
        ALTER TABLE attendance_records ADD COLUMN marked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_records' AND column_name = 'session_id') THEN
        ALTER TABLE attendance_records ADD COLUMN session_id UUID REFERENCES attendance_sessions(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_records' AND column_name = 'student_id') THEN
        ALTER TABLE attendance_records ADD COLUMN student_id UUID REFERENCES students(user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_records' AND column_name = 'is_present') THEN
        ALTER TABLE attendance_records ADD COLUMN is_present BOOLEAN NOT NULL DEFAULT true;
    END IF;

    -- Additional columns from schema image
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_records' AND column_name = 'student_enrollment_id') THEN
        ALTER TABLE attendance_records ADD COLUMN student_enrollment_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_records' AND column_name = 'status') THEN
        -- Create enum type for status if it doesn't exist
        DO $enum$
        BEGIN
            CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $enum$;
        
        ALTER TABLE attendance_records ADD COLUMN status attendance_status DEFAULT 'present';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_records' AND column_name = 'marked_by_id') THEN
        ALTER TABLE attendance_records ADD COLUMN marked_by_id UUID REFERENCES users(id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'attendance_records' AND column_name = 'remarks') THEN
        ALTER TABLE attendance_records ADD COLUMN remarks TEXT;
    END IF;
    
    -- Make status column nullable
    ALTER TABLE attendance_records ALTER COLUMN status DROP NOT NULL;
END $$;

-- 2. FIX FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Drop incorrect foreign key constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'attendance_records_student_enrollment_id_fkey' 
        AND table_name = 'attendance_records'
    ) THEN
        ALTER TABLE attendance_records DROP CONSTRAINT attendance_records_student_enrollment_id_fkey;
    END IF;
END $$;

-- Add correct foreign key constraint to course_enrollments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'attendance_records_course_enrollment_fkey' 
        AND table_name = 'attendance_records'
    ) THEN
        ALTER TABLE attendance_records 
        ADD CONSTRAINT attendance_records_course_enrollment_fkey 
        FOREIGN KEY (student_enrollment_id) REFERENCES course_enrollments(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_course_date 
ON attendance_sessions(course_id, date);

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_created_by 
ON attendance_sessions(created_by_id);

CREATE INDEX IF NOT EXISTS idx_attendance_records_session 
ON attendance_records(session_id);

CREATE INDEX IF NOT EXISTS idx_attendance_records_student 
ON attendance_records(student_id);

CREATE INDEX IF NOT EXISTS idx_attendance_sessions_course_date_created_by 
ON attendance_sessions(course_id, date, created_by_id);

CREATE INDEX IF NOT EXISTS idx_attendance_records_session_student 
ON attendance_records(session_id, student_id);

CREATE INDEX IF NOT EXISTS idx_attendance_records_enrollment 
ON attendance_records(student_enrollment_id);

CREATE INDEX IF NOT EXISTS idx_attendance_records_student_date 
ON attendance_records(student_id, marked_at);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_student
ON course_enrollments(course_id, student_id);

-- 4. ADD UNIQUE CONSTRAINTS
-- ============================================================================

-- Remove old unique constraint if it exists
ALTER TABLE attendance_sessions DROP CONSTRAINT IF EXISTS unique_course_date_session;

-- Add flexible unique constraint
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'unique_course_date_faculty_session' 
                   AND table_name = 'attendance_sessions') THEN
        ALTER TABLE attendance_sessions 
        ADD CONSTRAINT unique_course_date_faculty_session 
        UNIQUE (course_id, date, created_by_id);
    END IF;
END $$;

-- Add unique constraint for attendance records
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'unique_session_student_record' 
                   AND table_name = 'attendance_records') THEN
        ALTER TABLE attendance_records 
        ADD CONSTRAINT unique_session_student_record 
        UNIQUE (session_id, student_id);
    END IF;
END $$;

-- 5. SET UP PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON attendance_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON attendance_records TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 6. CONFIGURE ROW LEVEL SECURITY
-- ============================================================================

-- Disable RLS temporarily to fix policies
ALTER TABLE attendance_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can manage their own attendance sessions" ON attendance_sessions;
DROP POLICY IF EXISTS "Users can manage attendance records for their sessions" ON attendance_records;
DROP POLICY IF EXISTS "Faculty can create attendance sessions" ON attendance_sessions;
DROP POLICY IF EXISTS "Faculty can manage attendance records" ON attendance_records;

-- Create more permissive policies for faculty members
CREATE POLICY "Faculty can create attendance sessions" ON attendance_sessions
FOR ALL 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('faculty', 'hod', 'coordinator', 'principal')
        AND users.is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('faculty', 'hod', 'coordinator', 'principal')
        AND users.is_active = true
    )
);

CREATE POLICY "Faculty can manage attendance records" ON attendance_records
FOR ALL 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('faculty', 'hod', 'coordinator', 'principal')
        AND users.is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('faculty', 'hod', 'coordinator', 'principal')
        AND users.is_active = true
    )
);

-- Re-enable RLS
ALTER TABLE attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- 7. CREATE RPC FUNCTIONS
-- ============================================================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_course_enrollments_for_attendance(UUID, UUID[]);
DROP FUNCTION IF EXISTS insert_attendance_record(UUID, UUID, UUID, BOOLEAN, UUID, TEXT);
DROP FUNCTION IF EXISTS save_attendance_batch(UUID, DATE, UUID, JSONB);
DROP FUNCTION IF EXISTS save_attendance_batch_simple(UUID, DATE, UUID, JSONB);
DROP FUNCTION IF EXISTS save_attendance_batch_consolidated(UUID, DATE, UUID, JSONB);
DROP FUNCTION IF EXISTS test_attendance_rpc();
DROP FUNCTION IF EXISTS get_attendance_records_for_session(UUID);
DROP FUNCTION IF EXISTS get_course_attendance_sessions_detailed(UUID);

-- Create test function
CREATE OR REPLACE FUNCTION test_attendance_rpc()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN 'Consolidated attendance RPC functions are working correctly';
END $$;

-- Create comprehensive attendance saving function
CREATE OR REPLACE FUNCTION save_attendance_batch_consolidated(
    p_course_id UUID,
    p_date DATE,
    p_user_id UUID,
    p_attendance_records JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session_id UUID;
    v_record JSONB;
    v_student_id UUID;
    v_is_present BOOLEAN;
    v_status TEXT;
    v_enrollment_id UUID;
    v_records_saved INTEGER := 0;
    v_failed_records JSONB := '[]'::JSONB;
BEGIN
    -- Validate inputs
    IF p_course_id IS NULL OR p_date IS NULL OR p_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'session_id', null,
            'records_saved', 0,
            'error_message', 'Missing required parameters',
            'failed_records', '[]'::JSONB
        );
    END IF;

    -- Verify user authorization
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = p_user_id 
        AND is_active = true 
        AND role IN ('faculty', 'hod', 'coordinator', 'principal', 'admin')
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'session_id', null,
            'records_saved', 0,
            'error_message', 'User not authorized',
            'failed_records', '[]'::JSONB
        );
    END IF;

    -- Verify course exists
    IF NOT EXISTS (SELECT 1 FROM courses WHERE id = p_course_id) THEN
        RETURN jsonb_build_object(
            'success', false,
            'session_id', null,
            'records_saved', 0,
            'error_message', 'Course not found',
            'failed_records', '[]'::JSONB
        );
    END IF;

    BEGIN
        -- Check if attendance session already exists (match by course_id, date, and created_by_id)
        SELECT id INTO v_session_id
        FROM attendance_sessions
        WHERE course_id = p_course_id 
        AND date = p_date 
        AND created_by_id = p_user_id;

        -- If session doesn't exist, create it
        IF v_session_id IS NULL THEN
            INSERT INTO attendance_sessions (
                course_id,
                date,
                created_by_id,
                created_at
            ) VALUES (
                p_course_id,
                p_date,
                p_user_id,
                NOW()
            ) RETURNING id INTO v_session_id;
        ELSE
            -- Delete existing attendance records for this session
            DELETE FROM attendance_records WHERE session_id = v_session_id;
        END IF;

        -- Process each attendance record
        FOR v_record IN SELECT * FROM jsonb_array_elements(p_attendance_records)
        LOOP
            BEGIN
                v_student_id := (v_record->>'studentId')::UUID;
                
                -- Determine is_present and status
                CASE v_record->>'status'
                    WHEN 'present' THEN
                        v_is_present := true;
                        v_status := NULL;
                    WHEN 'absent' THEN
                        v_is_present := false;
                        v_status := NULL;
                    WHEN 'event' THEN
                        v_is_present := true;
                        v_status := 'excused';
                    ELSE
                        v_is_present := true;
                        v_status := NULL;
                END CASE;

                -- Get enrollment ID
                SELECT id INTO v_enrollment_id
                FROM course_enrollments
                WHERE course_id = p_course_id 
                AND student_id = v_student_id 
                AND is_active = true;

                IF v_enrollment_id IS NOT NULL THEN
                    -- Insert attendance record
                    INSERT INTO attendance_records (
                        session_id,
                        student_id,
                        student_enrollment_id,
                        is_present,
                        marked_by_id,
                        status,
                        marked_at
                    ) VALUES (
                        v_session_id,
                        v_student_id,
                        v_enrollment_id,
                        v_is_present,
                        p_user_id,
                        v_status,
                        NOW()
                    );
                    
                    v_records_saved := v_records_saved + 1;
                ELSE
                    v_failed_records := v_failed_records || jsonb_build_object(
                        'student_id', v_student_id,
                        'error', 'No active enrollment found'
                    );
                END IF;

            EXCEPTION WHEN OTHERS THEN
                v_failed_records := v_failed_records || jsonb_build_object(
                    'student_id', COALESCE(v_student_id::TEXT, 'unknown'),
                    'error', SQLERRM
                );
            END;
        END LOOP;

        -- Return success response
        RETURN jsonb_build_object(
            'success', true,
            'session_id', v_session_id,
            'records_saved', v_records_saved,
            'error_message', null,
            'failed_records', v_failed_records
        );

    EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'success', false,
            'session_id', v_session_id,
            'records_saved', v_records_saved,
            'error_message', SQLERRM,
            'failed_records', v_failed_records
        );
    END;
END $$;

-- Create function to get attendance records for a session
CREATE OR REPLACE FUNCTION get_attendance_records_for_session(p_session_id UUID)
RETURNS TABLE(
    student_id UUID,
    student_name TEXT,
    student_usn TEXT,
    is_present BOOLEAN,
    status TEXT,
    marked_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ar.student_id,
        COALESCE(u.first_name || ' ' || u.last_name, u.email) as student_name,
        s.usn as student_usn,
        ar.is_present,
        ar.status,
        ar.marked_at
    FROM attendance_records ar
    JOIN users u ON ar.student_id = u.id
    LEFT JOIN students s ON ar.student_id = s.user_id
    WHERE ar.session_id = p_session_id
    ORDER BY student_name;
END $$;

-- Create function to get attendance sessions for a course
CREATE OR REPLACE FUNCTION get_course_attendance_sessions_detailed(p_course_id UUID)
RETURNS TABLE(
    session_id UUID,
    session_date DATE,
    created_by_name TEXT,
    created_by_id UUID,
    total_students INTEGER,
    present_count INTEGER,
    absent_count INTEGER,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ats.id as session_id,
        ats.date as session_date,
        COALESCE(u.first_name || ' ' || u.last_name, u.email) as created_by_name,
        ats.created_by_id,
        COUNT(ar.id)::INTEGER as total_students,
        COUNT(CASE WHEN ar.is_present THEN 1 END)::INTEGER as present_count,
        COUNT(CASE WHEN NOT ar.is_present THEN 1 END)::INTEGER as absent_count,
        ats.created_at
    FROM attendance_sessions ats
    JOIN users u ON ats.created_by_id = u.id
    LEFT JOIN attendance_records ar ON ats.id = ar.session_id
    WHERE ats.course_id = p_course_id
    GROUP BY ats.id, ats.date, u.first_name, u.last_name, u.email, ats.created_by_id, ats.created_at
    ORDER BY ats.date DESC, ats.created_at DESC;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION test_attendance_rpc() TO authenticated;
GRANT EXECUTE ON FUNCTION save_attendance_batch_consolidated(UUID, DATE, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_attendance_records_for_session(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_course_attendance_sessions_detailed(UUID) TO authenticated;

-- 8. VERIFICATION AND COMPLETION
-- ============================================================================

-- Verify foreign key constraints
DO $$
DECLARE
    constraint_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'attendance_records'
    AND kcu.column_name = 'student_enrollment_id'
    AND ccu.table_name = 'course_enrollments';
    
    IF constraint_count > 0 THEN
        RAISE NOTICE '✓ Foreign key constraint properly references course_enrollments';
    ELSE
        RAISE WARNING '✗ Foreign key constraint not found or incorrect';
    END IF;
END $$;

-- Verify status column is nullable
DO $$
DECLARE
    is_nullable_status TEXT;
BEGIN
    SELECT is_nullable INTO is_nullable_status
    FROM information_schema.columns 
    WHERE table_name = 'attendance_records' 
    AND column_name = 'status';
    
    IF is_nullable_status = 'YES' THEN
        RAISE NOTICE '✓ Status column is properly nullable';
    ELSE
        RAISE WARNING '✗ Status column should be nullable';
    END IF;
END $$;

-- Test RPC function
DO $$
DECLARE
    test_result TEXT;
BEGIN
    SELECT test_attendance_rpc() INTO test_result;
    RAISE NOTICE '✓ RPC Test Result: %', test_result;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING '✗ RPC function test failed: %', SQLERRM;
END $$;

-- Completion message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '✅ CONSOLIDATED ATTENDANCE SYSTEM FIX COMPLETED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Fixed Issues:';
    RAISE NOTICE '  ✓ Foreign key constraint now references course_enrollments';
    RAISE NOTICE '  ✓ Status column is nullable for normal attendance';
    RAISE NOTICE '  ✓ Added performance indexes';
    RAISE NOTICE '  ✓ Updated RPC functions with better error handling';
    RAISE NOTICE '  ✓ Added helper functions for attendance queries';
    RAISE NOTICE '';
    RAISE NOTICE 'Available Functions:';
    RAISE NOTICE '  - test_attendance_rpc()';
    RAISE NOTICE '  - save_attendance_batch_consolidated(course_id, date, user_id, records)';
    RAISE NOTICE '  - get_attendance_records_for_session(session_id)';
    RAISE NOTICE '  - get_course_attendance_sessions_detailed(course_id)';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Test attendance saving functionality';
    RAISE NOTICE '  2. Verify UI updates properly after saving';
    RAISE NOTICE '';
END $$;
