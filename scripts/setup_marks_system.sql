-- Drop existing marks table if it exists
DROP TABLE IF EXISTS public.marks CASCADE;

-- Create the marks table with proper structure
CREATE TABLE public.marks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL,
    course_id UUID NOT NULL,
    assessment_type VARCHAR(50) NOT NULL,
    max_marks INTEGER NOT NULL DEFAULT 30,
    obtained_marks INTEGER NOT NULL DEFAULT 0,
    assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    batch VARCHAR(10),
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT chk_marks_positive CHECK (obtained_marks >= 0),
    CONSTRAINT chk_max_marks_positive CHECK (max_marks > 0),
    CONSTRAINT chk_obtained_not_exceed_max CHECK (obtained_marks <= max_marks),
    
    -- Unique constraint to prevent duplicate marks
    UNIQUE(student_id, course_id, assessment_type, batch)
);

-- Create indexes for better performance
CREATE INDEX idx_marks_student_id ON public.marks(student_id);
CREATE INDEX idx_marks_course_id ON public.marks(course_id);
CREATE INDEX idx_marks_assessment_type ON public.marks(assessment_type);
CREATE INDEX idx_marks_assessment_date ON public.marks(assessment_date);

-- Insert sample marks data for the specific student
INSERT INTO public.marks (student_id, course_id, assessment_type, max_marks, obtained_marks, assessment_date, batch, created_by) VALUES
-- IA Test marks
('0e47bc94-a7e4-45fe-9ef7-3f1279b5de59', '1606dab9-1359-46fa-bd93-f6d4b72ff49f', 'IA1', 30, 25, '2025-01-15', NULL, '8d35f6cf-839e-467f-93f8-34979a07cefb'),
('0e47bc94-a7e4-45fe-9ef7-3f1279b5de59', '1606dab9-1359-46fa-bd93-f6d4b72ff49f', 'IA2', 30, 27, '2025-02-15', NULL, '8d35f6cf-839e-467f-93f8-34979a07cefb'),
('0e47bc94-a7e4-45fe-9ef7-3f1279b5de59', '1606dab9-1359-46fa-bd93-f6d4b72ff49f', 'IA3', 30, 23, '2025-03-15', NULL, '8d35f6cf-839e-467f-93f8-34979a07cefb'),

-- Assignment marks
('0e47bc94-a7e4-45fe-9ef7-3f1279b5de59', '1606dab9-1359-46fa-bd93-f6d4b72ff49f', 'Assignment1', 30, 28, '2025-01-20', NULL, '8d35f6cf-839e-467f-93f8-34979a07cefb'),
('0e47bc94-a7e4-45fe-9ef7-3f1279b5de59', '1606dab9-1359-46fa-bd93-f6d4b72ff49f', 'Assignment2', 30, 26, '2025-02-20', NULL, '8d35f6cf-839e-467f-93f8-34979a07cefb'),

-- Lab course marks (with batch)
('0e47bc94-a7e4-45fe-9ef7-3f1279b5de59', '01bfdf7f-e4e2-4adb-9d61-468d077774bb', 'IA1', 30, 29, '2025-01-16', 'A1', '8d35f6cf-839e-467f-93f8-34979a07cefb'),
('0e47bc94-a7e4-45fe-9ef7-3f1279b5de59', '01bfdf7f-e4e2-4adb-9d61-468d077774bb', 'Assignment1', 30, 27, '2025-01-21', 'A1', '8d35f6cf-839e-467f-93f8-34979a07cefb')

ON CONFLICT (student_id, course_id, assessment_type, batch) DO UPDATE SET
    obtained_marks = EXCLUDED.obtained_marks,
    max_marks = EXCLUDED.max_marks,
    assessment_date = EXCLUDED.assessment_date,
    updated_at = NOW();

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marks TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify the data was inserted
SELECT 
    m.id,
    m.student_id,
    m.assessment_type,
    m.obtained_marks,
    m.max_marks,
    ROUND((m.obtained_marks::DECIMAL / m.max_marks::DECIMAL) * 100, 2) as percentage,
    c.course_code,
    c.course_name,
    c.component_type,
    s.name as subject_name
FROM public.marks m
JOIN public.courses c ON c.id = m.course_id
JOIN public.subjects s ON s.id = c.subject_id
WHERE m.student_id = '0e47bc94-a7e4-45fe-9ef7-3f1279b5de59'
ORDER BY m.assessment_date DESC;
