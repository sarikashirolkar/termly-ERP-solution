-- Drop existing marks table if it exists
DROP TABLE IF EXISTS public.marks CASCADE;

-- Create marks table
CREATE TABLE public.marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    assessment_type VARCHAR(50) NOT NULL, -- IA1, IA2, Assignment1, etc.
    max_marks INTEGER NOT NULL DEFAULT 30,
    obtained_marks INTEGER NOT NULL DEFAULT 0,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    batch VARCHAR(10), -- For lab courses: A1, A2, etc.
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(student_id, course_id, assessment_type, batch)
);

-- Indexes
CREATE INDEX idx_marks_student_id ON public.marks(student_id);
CREATE INDEX idx_marks_course_id ON public.marks(course_id);
CREATE INDEX idx_marks_assessment_type ON public.marks(assessment_type);
CREATE INDEX idx_marks_assessment_date ON public.marks(assessment_date);

-- Enable RLS
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

-- RLS: Students can view only their own marks
CREATE POLICY "Students can view their own marks" ON public.marks
    FOR SELECT USING (student_id = auth.uid());

-- RLS: Faculty can view marks for their assigned courses
CREATE POLICY "Faculty can view marks for their courses" ON public.marks
    FOR SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.subject_assignments sa
            JOIN public.courses c ON c.subject_id = sa.subject_id
            WHERE sa.faculty_id = auth.uid()
            AND c.id = marks.course_id
        )
    );

-- RLS: Faculty can insert marks
CREATE POLICY "Faculty can insert marks for their courses" ON public.marks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.subject_assignments sa
            JOIN public.courses c ON c.subject_id = sa.subject_id
            WHERE sa.faculty_id = auth.uid()
            AND c.id = marks.course_id
        )
    );

-- RLS: Faculty can update marks
CREATE POLICY "Faculty can update marks for their courses" ON public.marks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.subject_assignments sa
            JOIN public.courses c ON c.subject_id = sa.subject_id
            WHERE sa.faculty_id = auth.uid()
            AND c.id = marks.course_id
        )
    );

-- Sample data population (limited to 5 students and 3 courses each)
DO $$
DECLARE
    student_record RECORD;
    course_record RECORD;
    assessment TEXT;
    assessment_types TEXT[] := ARRAY['IA1', 'IA2', 'Assignment1'];
    random_marks INTEGER;
    faculty_id UUID;
BEGIN
    -- Get any faculty ID to use as creator
    SELECT id INTO faculty_id FROM auth.users WHERE raw_user_meta_data->>'role' = 'faculty' LIMIT 1;

    FOR student_record IN 
        SELECT id FROM auth.users 
        WHERE raw_user_meta_data->>'role' = 'student' 
        LIMIT 5
    LOOP
        FOR course_record IN 
            SELECT c.id, c.component_type, c.batch
            FROM public.courses c
            INNER JOIN public.enrollments e ON e.course_id = c.id
            WHERE e.student_id = student_record.id
            LIMIT 3
        LOOP
            FOREACH assessment IN ARRAY assessment_types
            LOOP
                random_marks := 15 + floor(random() * 16)::INT;
                
                INSERT INTO public.marks (
                    student_id,
                    course_id,
                    assessment_type,
                    max_marks,
                    obtained_marks,
                    assessment_date,
                    batch,
                    created_by
                ) VALUES (
                    student_record.id,
                    course_record.id,
                    assessment,
                    30,
                    random_marks,
                    CURRENT_DATE - (random() * 30)::INT,
                    CASE 
                        WHEN course_record.component_type = 'lab' THEN course_record.batch
                        ELSE NULL
                    END,
                    faculty_id
                )
                ON CONFLICT (student_id, course_id, assessment_type, batch) DO NOTHING;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Optional: Grant access to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.marks TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
