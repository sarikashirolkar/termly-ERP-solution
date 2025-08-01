-- Create proctoring system tables
-- This script creates the necessary tables for the proctoring system

-- Create proctor_assignments table to store student-proctor relationships
CREATE TABLE IF NOT EXISTS proctor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(proctor_id, student_id)
);

-- Create proctoring_meetings table to store scheduled meetings
CREATE TABLE IF NOT EXISTS proctoring_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    meeting_date DATE NOT NULL,
    meeting_time TIME NOT NULL,
    location VARCHAR(255),
    agenda TEXT,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add title column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proctoring_meetings' AND column_name = 'title') THEN
        ALTER TABLE proctoring_meetings ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT 'Meeting';
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proctoring_meetings' AND column_name = 'description') THEN
        ALTER TABLE proctoring_meetings ADD COLUMN description TEXT;
    END IF;
END $$;

-- Create proctoring_meeting_attendees table to store which students are invited
CREATE TABLE IF NOT EXISTS proctoring_meeting_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES proctoring_meetings(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    attendance_status VARCHAR(20) DEFAULT 'invited' CHECK (attendance_status IN ('invited', 'attended', 'absent')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(meeting_id, student_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_proctor_assignments_proctor_id ON proctor_assignments(proctor_id);
CREATE INDEX IF NOT EXISTS idx_proctor_assignments_student_id ON proctor_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_proctor_assignments_active ON proctor_assignments(is_active);
CREATE INDEX IF NOT EXISTS idx_proctoring_meetings_proctor_id ON proctoring_meetings(proctor_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_meetings_date ON proctoring_meetings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_meeting_id ON proctoring_meeting_attendees(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_attendees_student_id ON proctoring_meeting_attendees(student_id);

-- Enable RLS and create policies only if they don't exist
DO $$
BEGIN
    -- Proctor Assignments
    ALTER TABLE proctor_assignments ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'proctor_assignments' AND policyname = 'Users can view proctor assignments') THEN
        CREATE POLICY "Users can view proctor assignments" ON proctor_assignments FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'proctor_assignments' AND policyname = 'Coordinators can manage proctor assignments') THEN
        CREATE POLICY "Coordinators can manage proctor assignments" ON proctor_assignments FOR ALL 
        USING (auth.uid() = assigned_by OR auth.uid() = proctor_id);
    END IF;

    -- Proctoring Meetings
    ALTER TABLE proctoring_meetings ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'proctoring_meetings' AND policyname = 'Users can view proctoring meetings') THEN
        CREATE POLICY "Users can view proctoring meetings" ON proctoring_meetings FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'proctoring_meetings' AND policyname = 'Faculty can manage their meetings') THEN
        CREATE POLICY "Faculty can manage their meetings" ON proctoring_meetings FOR ALL 
        USING (auth.uid() = proctor_id OR auth.uid() = created_by);
    END IF;

    -- Meeting Attendees
    ALTER TABLE proctoring_meeting_attendees ENABLE ROW LEVEL SECURITY;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'proctoring_meeting_attendees' AND policyname = 'Users can view meeting attendees') THEN
        CREATE POLICY "Users can view meeting attendees" ON proctoring_meeting_attendees FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'proctoring_meeting_attendees' AND policyname = 'Faculty can manage meeting attendees') THEN
        CREATE POLICY "Faculty can manage meeting attendees" ON proctoring_meeting_attendees FOR ALL 
        USING (EXISTS (
            SELECT 1 FROM proctoring_meetings pm 
            WHERE pm.id = meeting_id AND (pm.proctor_id = auth.uid() OR pm.created_by = auth.uid())
        ));
    END IF;
END $$;

-- Create function to get proctor's assigned students
CREATE OR REPLACE FUNCTION get_proctor_students(proctor_user_id UUID)
RETURNS TABLE (
    student_id UUID,
    student_name TEXT,
    student_usn TEXT,
    student_email TEXT,
    student_phone TEXT,
    department TEXT,
    semester INTEGER,
    section TEXT,
    batch TEXT,
    cgpa DECIMAL,
    parent_name TEXT,
    parent_phone TEXT,
    assigned_at TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as student_id,
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        s.usn as student_usn,
        u.email as student_email,
        u.phone as student_phone,
        u.department,
        s.semester,
        s.section,
        s.batch,
        s.cgpa,
        s.parent_name,
        s.father_phone as parent_phone,
        pa.assigned_at
    FROM proctor_assignments pa
    JOIN users u ON pa.student_id = u.id
    JOIN students s ON u.id = s.user_id
    WHERE pa.proctor_id = proctor_user_id 
    AND pa.is_active = true
    AND u.is_active = true
    ORDER BY s.usn;
END;
$$;

-- Create function to get available students for assignment (not already assigned to any proctor)
CREATE OR REPLACE FUNCTION get_available_students_for_proctoring(coordinator_department TEXT)
RETURNS TABLE (
    student_id UUID,
    student_name TEXT,
    student_usn TEXT,
    student_email TEXT,
    department TEXT,
    semester INTEGER,
    section TEXT,
    batch TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as student_id,
        CONCAT(u.first_name, ' ', u.last_name) as student_name,
        s.usn as student_usn,
        u.email as student_email,
        u.department,
        s.semester,
        s.section,
        s.batch
    FROM users u
    JOIN students s ON u.id = s.user_id
    LEFT JOIN proctor_assignments pa ON u.id = pa.student_id AND pa.is_active = true
    WHERE u.role = 'student'
    AND u.department = coordinator_department
    AND u.is_active = true
    AND pa.student_id IS NULL  -- Not already assigned to any proctor
    ORDER BY s.semester, s.section, s.usn;
END;
$$;

-- Create function to get department faculty for proctoring
CREATE OR REPLACE FUNCTION get_department_faculty_for_proctoring(dept_short_name TEXT)
RETURNS TABLE (
    faculty_id UUID,
    faculty_name TEXT,
    faculty_email TEXT,
    faculty_phone TEXT,
    designation TEXT,
    employee_id TEXT,
    current_proctees_count BIGINT,
    max_proctees INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as faculty_id,
        CONCAT(u.first_name, ' ', u.last_name) as faculty_name,
        u.email as faculty_email,
        u.phone as faculty_phone,
        f.designation,
        f.employee_id,
        COALESCE(pa_count.proctees_count, 0) as current_proctees_count,
        20 as max_proctees  -- Default max proctees per faculty
    FROM users u
    JOIN faculty f ON u.id = f.user_id
    LEFT JOIN (
        SELECT 
            proctor_id, 
            COUNT(*) as proctees_count
        FROM proctor_assignments 
        WHERE is_active = true 
        GROUP BY proctor_id
    ) pa_count ON u.id = pa_count.proctor_id
    WHERE u.department = dept_short_name
    AND u.role IN ('faculty', 'hod')
    AND u.is_active = true
    AND f.is_active = true
    ORDER BY faculty_name;
END;
$$;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at columns
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_proctor_assignments_updated_at') THEN
        CREATE TRIGGER update_proctor_assignments_updated_at 
        BEFORE UPDATE ON proctor_assignments 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_proctoring_meetings_updated_at') THEN
        CREATE TRIGGER update_proctoring_meetings_updated_at 
        BEFORE UPDATE ON proctoring_meetings 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
