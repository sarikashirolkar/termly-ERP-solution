import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  BookOpen,
  GraduationCap,
  Award,
  CalendarDays,
  FileText,
  BarChart,
  MessageSquare,
  ShieldCheck,
  Mail,
  ClipboardList,
  FileBadge,
  Clock,
  Settings,
  Bell,
  Upload,
  FileQuestion,
} from "lucide-react"

export default function FeaturesPage() {
  const features = [
    {
      icon: Users,
      title: "Student & Faculty Management",
      description: "Efficiently manage student and faculty profiles, roles, and access permissions.",
    },
    {
      icon: BookOpen,
      title: "Course & Subject Management",
      description: "Organize courses, subjects, and assign them to departments and faculty.",
    },
    {
      icon: CalendarDays,
      title: "Timetable Generation",
      description: "Automate timetable creation and manage class schedules with ease.",
    },
    {
      icon: ClipboardList,
      title: "Attendance Tracking",
      description: "Monitor student attendance, generate reports, and identify trends.",
    },
    {
      icon: BarChart,
      title: "Marks & Performance Analytics",
      description: "Record marks, analyze student performance, and generate detailed reports.",
    },
    {
      icon: Award,
      title: "Achievement Tracking & Verification",
      description: "Track student achievements and streamline the verification process.",
    },
    {
      icon: MessageSquare,
      title: "Feedback & Communication",
      description: "Collect student feedback, facilitate communication, and manage announcements.",
    },
    {
      icon: ShieldCheck,
      title: "Proctoring Integration",
      description: "Integrate with proctoring solutions for secure online examinations.",
    },
    {
      icon: FileText,
      title: "Syllabus & Material Management",
      description: "Upload, organize, and share course syllabi and study materials.",
    },
    {
      icon: FileBadge,
      title: "CO-PO Mapping & Attainment",
      description: "Map Course Outcomes to Program Outcomes and analyze attainment levels.",
    },
    {
      icon: Mail,
      title: "Application & Letter Requests",
      description: "Manage student applications and requests for various official letters.",
    },
    {
      icon: GraduationCap,
      title: "Certifications Management",
      description: "Track and manage student certifications and external courses.",
    },
    {
      icon: Clock,
      title: "Calendar & Events",
      description: "Keep track of academic events, holidays, and important deadlines.",
    },
    {
      icon: Settings,
      title: "System Settings & Preferences",
      description: "Customize system settings, user roles, and individual preferences.",
    },
    {
      icon: Bell,
      title: "Notifications & Alerts",
      description: "Send instant notifications and alerts to students, faculty, and staff.",
    },
    {
      icon: Upload,
      title: "Bulk Data Import/Export",
      description: "Easily import and export large datasets for students, faculty, and courses.",
    },
    {
      icon: FileQuestion,
      title: "Forms & Surveys",
      description: "Create custom forms and surveys for various academic and administrative purposes.",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
          Powerful Features for Academic Excellence
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          TERMLY offers a comprehensive suite of tools designed to streamline academic operations, enhance learning
          experiences, and improve administrative efficiency.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="flex flex-col items-center text-center p-6">
            <CardHeader>
              <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                <feature.icon className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
