import {
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  ClipboardList,
  FileText,
  BarChart,
  Settings,
  Bell,
  GraduationCap,
  Building,
  UserCheck,
  FileUp,
  Mail,
  Award,
  ClipboardCheck,
  Calculator,
  FileBarChart,
  BookMarked,
  FileQuestion,
  FileBadge,
  FileSpreadsheet,
  FileSearch,
  FileSignature,
  User,
} from "lucide-react"

export const navigation = {
  admin: [
    {
      title: "Dashboard",
      links: [
        {
          href: "/dashboard",
          label: "Overview",
          icon: LayoutDashboard,
        },
        {
          href: "/dashboard/analytics",
          label: "Analytics",
          icon: BarChart,
        },
        {
          href: "/dashboard/notifications",
          label: "Notifications",
          icon: Bell,
        },
        {
          href: "/dashboard/system-settings",
          label: "System Settings",
          icon: Settings,
        },
      ],
    },
    {
      title: "User Management",
      links: [
        {
          href: "/dashboard/students",
          label: "Students",
          icon: Users,
        },
        {
          href: "/dashboard/faculty",
          label: "Faculty",
          icon: GraduationCap,
        },
        {
          href: "/dashboard/manage-hods",
          label: "Manage HODs",
          icon: UserCheck,
        },
        {
          href: "/dashboard/manage-coordinators",
          label: "Manage Coordinators",
          icon: UserCheck,
        },
      ],
    },
    {
      title: "Academic Management",
      links: [
        {
          href: "/dashboard/manage-departments",
          label: "Departments",
          icon: Building,
        },
        {
          href: "/dashboard/manage-subjects",
          label: "Subjects",
          icon: BookOpen,
        },
        {
          href: "/dashboard/courses",
          label: "Courses",
          icon: BookOpen,
        },
        {
          href: "/dashboard/assign-subjects",
          label: "Assign Subjects",
          icon: ClipboardList,
        },
        {
          href: "/dashboard/create-timetable",
          label: "Create Timetable",
          icon: Calendar,
        },
        {
          href: "/dashboard/assign-proctees",
          label: "Assign Proctees",
          icon: Users,
        },
      ],
    },
    {
      title: "Data & Reports",
      links: [
        {
          href: "/dashboard/upload-marks",
          label: "Upload Marks",
          icon: FileUp,
        },
        {
          href: "/dashboard/upload-materials",
          label: "Upload Materials",
          icon: FileUp,
        },
        {
          href: "/dashboard/reports",
          label: "Reports",
          icon: FileBarChart,
        },
        {
          href: "/dashboard/co-po-mapping",
          label: "CO-PO Mapping",
          icon: FileSignature,
        },
        {
          href: "/dashboard/view-co-po-reports",
          label: "View CO-PO Reports",
          icon: FileSearch,
        },
      ],
    },
    {
      title: "Forms & Surveys",
      links: [
        {
          href: "/dashboard/forms",
          label: "Manage Forms",
          icon: FileText,
        },
        {
          href: "/dashboard/forms-survey",
          label: "Forms Survey",
          icon: FileQuestion,
        },
        {
          href: "/dashboard/course-end-survey",
          label: "Course End Survey",
          icon: FileBadge,
        },
      ],
    },
  ],
  hod: [
    {
      title: "Dashboard",
      links: [
        {
          href: "/dashboard",
          label: "Overview",
          icon: LayoutDashboard,
        },
        {
          href: "/dashboard/hod-profile",
          label: "My Profile",
          icon: User,
        },
        {
          href: "/dashboard/notifications",
          label: "Notifications",
          icon: Bell,
        },
      ],
    },
    {
      title: "Department Management",
      links: [
        {
          href: "/dashboard/department-details",
          label: "Department Details",
          icon: Building,
        },
        {
          href: "/dashboard/department-faculty",
          label: "Department Faculty",
          icon: Users,
        },
        {
          href: "/dashboard/department-co-po",
          label: "Department CO-PO",
          icon: FileSignature,
        },
      ],
    },
    {
      title: "Academic Operations",
      links: [
        {
          href: "/dashboard/manage-subjects",
          label: "Manage Subjects",
          icon: BookOpen,
        },
        {
          href: "/dashboard/courses",
          label: "Manage Courses",
          icon: BookOpen,
        },
        {
          href: "/dashboard/assign-subjects",
          label: "Assign Subjects",
          icon: ClipboardList,
        },
        {
          href: "/dashboard/create-timetable",
          label: "Create Timetable",
          icon: Calendar,
        },
        {
          href: "/dashboard/assign-proctees",
          label: "Assign Proctees",
          icon: Users,
        },
        {
          href: "/dashboard/upload-marks",
          label: "Upload Marks",
          icon: FileUp,
        },
        {
          href: "/dashboard/upload-materials",
          label: "Upload Materials",
          icon: FileUp,
        },
      ],
    },
    {
      title: "Reports & Analytics",
      links: [
        {
          href: "/dashboard/reports",
          label: "Reports",
          icon: FileBarChart,
        },
        {
          href: "/dashboard/co-po-mapping",
          label: "CO-PO Mapping",
          icon: FileSignature,
        },
        {
          href: "/dashboard/view-co-po-reports",
          label: "View CO-PO Reports",
          icon: FileSearch,
        },
      ],
    },
    {
      title: "Forms & Surveys",
      links: [
        {
          href: "/dashboard/forms",
          label: "Manage Forms",
          icon: FileText,
        },
        {
          href: "/dashboard/forms-survey",
          label: "Forms Survey",
          icon: FileQuestion,
        },
        {
          href: "/dashboard/course-end-survey",
          label: "Course End Survey",
          icon: FileBadge,
        },
      ],
    },
  ],
  faculty: [
    {
      title: "Dashboard",
      links: [
        {
          href: "/dashboard",
          label: "Overview",
          icon: LayoutDashboard,
        },
        {
          href: "/dashboard/faculty-profile",
          label: "My Profile",
          icon: User,
        },
        {
          href: "/dashboard/notifications",
          label: "Notifications",
          icon: Bell,
        },
      ],
    },
    {
      title: "My Courses",
      links: [
        {
          href: "/dashboard/faculty-courses",
          label: "Assigned Courses",
          icon: BookOpen,
        },
        {
          href: "/dashboard/course-students",
          label: "Course Students",
          icon: Users,
        },
        {
          href: "/dashboard/attendance",
          label: "Mark Attendance",
          icon: ClipboardCheck,
        },
        {
          href: "/dashboard/ia-marks",
          label: "Internal Assessment Marks",
          icon: FileSpreadsheet,
        },
        {
          href: "/dashboard/assignment-marks",
          label: "Assignment Marks",
          icon: FileSignature,
        },
        {
          href: "/dashboard/materials",
          label: "Course Materials",
          icon: BookMarked,
        },
      ],
    },
    {
      title: "Student Engagement",
      links: [
        {
          href: "/dashboard/proctoring",
          label: "Proctoring",
          icon: UserCheck,
        },
        {
          href: "/dashboard/student-feedback",
          label: "Student Feedback",
          icon: Mail,
        },
        {
          href: "/dashboard/achievements",
          label: "Achievements",
          icon: Award,
        },
        {
          href: "/dashboard/common-letter",
          label: "Common Letter",
          icon: FileText,
        },
      ],
    },
    {
      title: "Surveys & Reports",
      links: [
        {
          href: "/dashboard/forms-survey/respond",
          label: "Respond to Forms",
          icon: FileQuestion,
        },
        {
          href: "/dashboard/course-end-survey/respond",
          label: "Respond to Course Survey",
          icon: FileBadge,
        },
      ],
    },
  ],
  student: [
    {
      title: "Dashboard",
      links: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
        {
          href: "/dashboard/attendance",
          label: "Attendance",
          icon: ClipboardCheck,
        },
        {
          href: "/dashboard/marks",
          label: "Marks",
          icon: FileBarChart,
        },
        {
          href: "/dashboard/materials",
          label: "Study Materials",
          icon: BookMarked,
        },
        {
          href: "/dashboard/analytics",
          label: "Analytics",
          icon: BarChart,
        },
        {
          href: "/dashboard/certifications",
          label: "Certifications",
          icon: FileBadge,
        },
        {
          href: "/dashboard/cgpa-calculator",
          label: "CGPA Calculator",
          icon: Calculator,
        },
        {
          href: "/dashboard/forms-survey",
          label: "Forms & Survey",
          icon: FileQuestion,
        },
        {
          href: "/dashboard/feedback",
          label: "Feedback",
          icon: Mail,
        },
        {
          href: "/dashboard/common-letter",
          label: "Common Letter",
          icon: FileText,
        },
        {
          href: "/dashboard/calendar-events",
          label: "Calendar of Events",
          icon: Calendar,
        },
        {
          href: "/dashboard/achievements",
          label: "Achievements",
          icon: Award,
        },
        {
          href: "/dashboard/settings",
          label: "Settings",
          icon: Settings,
        },
      ],
    },
  ],
  coordinator: [
    {
      title: "Dashboard",
      links: [
        {
          href: "/dashboard",
          label: "Overview",
          icon: LayoutDashboard,
        },
        {
          href: "/dashboard/notifications",
          label: "Notifications",
          icon: Bell,
        },
      ],
    },
    // Removed the "Course Management" section as requested
    {
      title: "Data & Reports",
      links: [
        {
          href: "/dashboard/upload-marks",
          label: "Upload Marks",
          icon: FileUp,
        },
        {
          href: "/dashboard/upload-materials",
          label: "Upload Materials",
          icon: FileUp,
        },
        {
          href: "/dashboard/reports",
          label: "Reports",
          icon: FileBarChart,
        },
      ],
    },
  ],
}

// ---- helper functions expected by DashboardLayout & other components ----
export type FlatNavItem = {
  name: string
  href: string
  icon: any
}

/**
 * Flatten a role’s navigation sections into a single array that matches
 * the original structure used throughout the dashboard.
 */
const flatten = (role: keyof typeof navigation): FlatNavItem[] =>
  navigation[role].flatMap((section) =>
    section.links.map(({ label, href, icon }) => ({
      name: label,
      href,
      icon,
    })),
  )

export const getStudentNavigation = (): FlatNavItem[] => flatten("student")
export const getFacultyNavigation = (): FlatNavItem[] => flatten("faculty")
export const getHODNavigation = (): FlatNavItem[] => flatten("hod")
export const getAdminNavigation = (): FlatNavItem[] => flatten("admin")
export const getPrincipalNavigation = (): FlatNavItem[] => flatten("principal")
export const getCoordinatorNavigation = (): FlatNavItem[] => flatten("coordinator")

/**
 * Centralised helper ‒ keeps the original signature used across the app.
 */
export const getNavigationForRole = (role: string): FlatNavItem[] => {
  switch (role) {
    case "student":
      return getStudentNavigation()
    case "faculty":
      return getFacultyNavigation()
    case "hod":
      return getHODNavigation()
    case "admin":
      return getAdminNavigation()
    case "principal":
      return getPrincipalNavigation()
    case "coordinator":
      return getCoordinatorNavigation()
    default:
      return []
  }
}
