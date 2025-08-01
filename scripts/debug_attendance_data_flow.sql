-- Debug script to check attendance data flow and fix any issues
-- Fixed missing created_at column error

-- 1. Check if attendance sessions are being created properly
SELECT 
    s.id as session_id,
    s.course_id,
    s.date,
    s.created_by_id,
    s.created_at,
    c.course_code,
    c.course_name,
    c.section,
    c.batch,
    c.component_type,
    COUNT(r.id) as record_count
FROM attendance_sessions s
LEFT JOIN courses c ON s.course_id = c.id
LEFT JOIN attendance_records r ON s.id = r.session_id
WHERE s.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY s.id, s.course_id, s.date, s.created_by_id, s.created_at, 
         c.course_code, c.course_name, c.section, c.batch, c.component_type
ORDER BY s.created_at DESC
LIMIT 10;

-- 2. Check attendance records with student details
SELECT 
    r.id as record_id,
    r.session_id,
    r.student_id,
    r.is_present,
    r.status,
    r.marked_at,
    s.date as session_date,
    s.course_id,
    st.usn,
    u.first_name,
    u.last_name,
    c.course_code,
    c.section,
    c.batch
FROM attendance_records r
JOIN attendance_sessions s ON r.session_id = s.id
JOIN students st ON r.student_id = st.user_id
JOIN users u ON r.student_id = u.id
JOIN courses c ON s.course_id = c.id
WHERE s.date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY r.marked_at DESC
LIMIT 20;

-- 3. Check for any orphaned records or data integrity issues
SELECT 
    'Missing Sessions' as issue_type,
    COUNT(*) as count
FROM attendance_records r
LEFT JOIN attendance_sessions s ON r.session_id = s.id
WHERE s.id IS NULL

UNION ALL

SELECT 
    'Missing Students' as issue_type,
    COUNT(*) as count
FROM attendance_records r
LEFT JOIN students st ON r.student_id = st.user_id
WHERE st.user_id IS NULL

UNION ALL

SELECT 
    'Missing Users' as issue_type,
    COUNT(*) as count
FROM attendance_records r
LEFT JOIN users u ON r.student_id = u.id
WHERE u.id IS NULL

UNION ALL

SELECT 
    'Missing Course Enrollments' as issue_type,
    COUNT(*) as count
FROM attendance_records r
LEFT JOIN course_enrollments ce ON r.student_enrollment_id = ce.id
WHERE r.student_enrollment_id IS NOT NULL AND ce.id IS NULL;

-- 4. Check course enrollments for debugging (using a real course ID)
-- First find some actual course IDs to use
WITH sample_courses AS (
    SELECT id, course_code, course_name 
    FROM courses 
    WHERE date_part('year', CURRENT_DATE) = date_part('year', CURRENT_DATE) -- Simplified filter
    LIMIT 5
)
SELECT 
    ce.id as enrollment_id,
    ce.course_id,
    ce.student_id,
    ce.is_active,
    ce.batch as enrollment_batch,
    c.course_code,
    c.course_name,
    c.section,
    c.batch as course_batch,
    c.component_type,
    st.usn,
    u.first_name,
    u.last_name
FROM course_enrollments ce
JOIN courses c ON ce.course_id = c.id
JOIN students st ON ce.student_id = st.user_id
JOIN users u ON ce.student_id = u.id
WHERE ce.course_id IN (SELECT id FROM sample_courses)
ORDER BY c.course_code, st.usn;

-- 5. Test query to simulate the checkExistingAttendance function
-- Using a real course ID from the system
WITH recent_course AS (
    SELECT id FROM courses 
    LIMIT 1 -- Simplified to just get any course
)
SELECT 
    s.id,
    s.date,
    s.course_id,
    s.created_by_id,
    s.created_at,
    json_agg(
        json_build_object(
            'id', r.id,
            'student_id', r.student_id,
            'is_present', r.is_present,
            'status', r.status,
            'marked_at', r.marked_at
        )
    ) as attendance_records
FROM attendance_sessions s
LEFT JOIN attendance_records r ON s.id = r.session_id
WHERE s.course_id IN (SELECT id FROM recent_course)
  AND s.date = CURRENT_DATE
GROUP BY s.id, s.date, s.course_id, s.created_by_id, s.created_at;

-- 6. Check RLS policies (if any issues with permissions)
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('attendance_sessions', 'attendance_records', 'course_enrollments', 'courses')
ORDER BY tablename, policyname;

-- 7. Additional diagnostic: Check for section type mismatches
SELECT 
    'courses' as table_name,
    section,
    pg_typeof(section) as data_type
FROM courses
WHERE section IS NOT NULL
LIMIT 5;

SELECT 
    'subject_assignments' as table_name,
    section,
    pg_typeof(section) as data_type
FROM subject_assignments
WHERE section IS NOT NULL
LIMIT 5;

-- 8. Check if the RPC functions exist and have correct permissions
SELECT 
    routine_name,
    routine_type,
    data_type,
    security_type,
    is_null_call
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name LIKE '%attendance%'
ORDER BY routine_name;
