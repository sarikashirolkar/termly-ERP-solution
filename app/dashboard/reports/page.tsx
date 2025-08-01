"use client"

import { useState, useEffect } from "react"
import { Calendar, BarChart2, MessageSquare, Trophy, Download, FileText } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js"
import { Pie, Bar } from "react-chartjs-2"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

// Define types
interface Student {
  id: string
  usn: string
  name: string
}

interface AttendanceRecord extends Student {
  department: string
  semester: string
  section: string
  subject: string
  attendance: number
  status: string
}

interface PerformanceRecord extends Student {
  department: string
  semester: string
  section: string
  subject: string
  marks: number
  grade: string
  status: string
}

interface FeedbackRecord {
  area: string
  rating: number
  comments: string
}

interface AchievementRecord {
  id: string
  usn: string
  studentName: string
  title: string
  category: string
  date: string
  department: string
  verified: boolean
}

// Department mapping function
const mapDepartmentName = (dept: string) => {
  const mapping: { [key: string]: string } = {
    "Computer Science": "CSE",
    "Information Science": "ISE",
    "Electronics and Communication": "ECE",
    "Electrical and Electronics": "EEE",
    Mechanical: "MECH",
    "Computer Science (AI/ML)": "CSE(AIML)",
    "Computer Science (Data Science)": "CSE(DS)",
    // Also handle reverse mapping
    CSE: "CSE",
    ISE: "ISE",
    ECE: "ECE",
    EEE: "EEE",
    MECH: "MECH",
    "CSE(AIML)": "CSE(AIML)",
    "CSE(DS)": "CSE(DS)",
  }
  return mapping[dept] || dept
}

// Comprehensive mock attendance data covering all departments and scenarios
const mockAttendanceData: AttendanceRecord[] = [
  // CSE Department - Multiple semesters and sections with CS101 subject
  {
    id: "S001",
    usn: "1VA22CS001",
    name: "Aarav Sharma",
    department: "CSE",
    semester: "1",
    section: "A",
    subject: "CS101",
    attendance: 92,
    status: "Excellent",
  },
  {
    id: "S002",
    usn: "1VA22CS002",
    name: "Aditi Patel",
    department: "CSE",
    semester: "1",
    section: "A",
    subject: "CS101",
    attendance: 88,
    status: "Good",
  },
  {
    id: "S003",
    usn: "1VA22CS003",
    name: "Arjun Singh",
    department: "CSE",
    semester: "1",
    section: "A",
    subject: "CS101",
    attendance: 75,
    status: "Average",
  },
  {
    id: "S004",
    usn: "1VA22CS004",
    name: "Ananya Reddy",
    department: "CSE",
    semester: "1",
    section: "A",
    subject: "CS101",
    attendance: 65,
    status: "Poor",
  },
  {
    id: "S005",
    usn: "1VA22CS005",
    name: "Dhruv Kumar",
    department: "CSE",
    semester: "1",
    section: "B",
    subject: "CS101",
    attendance: 95,
    status: "Excellent",
  },
  {
    id: "S006",
    usn: "1VA22CS006",
    name: "Diya Verma",
    department: "CSE",
    semester: "1",
    section: "B",
    subject: "CS101",
    attendance: 82,
    status: "Good",
  },
  {
    id: "S007",
    usn: "1VA22CS007",
    name: "Karan Mehta",
    department: "CSE",
    semester: "2",
    section: "A",
    subject: "CS201",
    attendance: 89,
    status: "Good",
  },
  {
    id: "S008",
    usn: "1VA22CS008",
    name: "Priya Gupta",
    department: "CSE",
    semester: "2",
    section: "A",
    subject: "CS201",
    attendance: 94,
    status: "Excellent",
  },
  {
    id: "S009",
    usn: "1VA22CS009",
    name: "Rohit Sharma",
    department: "CSE",
    semester: "3",
    section: "A",
    subject: "CS301",
    attendance: 87,
    status: "Good",
  },
  {
    id: "S010",
    usn: "1VA22CS010",
    name: "Sneha Patel",
    department: "CSE",
    semester: "3",
    section: "B",
    subject: "CS301",
    attendance: 91,
    status: "Excellent",
  },

  // ISE Department
  {
    id: "S011",
    usn: "1VA22IS001",
    name: "Neil Saxena",
    department: "ISE",
    semester: "1",
    section: "A",
    subject: "CS101",
    attendance: 93,
    status: "Excellent",
  },
  {
    id: "S012",
    usn: "1VA22IS002",
    name: "Prisha Kapoor",
    department: "ISE",
    semester: "1",
    section: "A",
    subject: "CS101",
    attendance: 87,
    status: "Good",
  },
  {
    id: "S013",
    usn: "1VA22IS003",
    name: "Vikram Joshi",
    department: "ISE",
    semester: "2",
    section: "A",
    subject: "IS201",
    attendance: 85,
    status: "Good",
  },
  {
    id: "S014",
    usn: "1VA22IS004",
    name: "Kavya Reddy",
    department: "ISE",
    semester: "2",
    section: "B",
    subject: "IS201",
    attendance: 90,
    status: "Excellent",
  },
  {
    id: "S015",
    usn: "1VA22IS005",
    name: "Aryan Malhotra",
    department: "ISE",
    semester: "3",
    section: "A",
    subject: "IS301",
    attendance: 88,
    status: "Good",
  },

  // ECE Department
  {
    id: "S016",
    usn: "1VA22EC001",
    name: "Arnav Desai",
    department: "ECE",
    semester: "1",
    section: "A",
    subject: "EC101",
    attendance: 90,
    status: "Excellent",
  },
  {
    id: "S017",
    usn: "1VA22EC002",
    name: "Avni Reddy",
    department: "ECE",
    semester: "1",
    section: "A",
    subject: "EC101",
    attendance: 84,
    status: "Good",
  },
  {
    id: "S018",
    usn: "1VA22EC003",
    name: "Siddharth Nair",
    department: "ECE",
    semester: "2",
    section: "A",
    subject: "EC201",
    attendance: 92,
    status: "Excellent",
  },
  {
    id: "S019",
    usn: "1VA22EC004",
    name: "Meera Pillai",
    department: "ECE",
    semester: "2",
    section: "B",
    subject: "EC201",
    attendance: 86,
    status: "Good",
  },
  {
    id: "S020",
    usn: "1VA22EC005",
    name: "Rajesh Kumar",
    department: "ECE",
    semester: "3",
    section: "A",
    subject: "EC301",
    attendance: 89,
    status: "Good",
  },

  // EEE Department
  {
    id: "S021",
    usn: "1VA22EE001",
    name: "Aditya Singh",
    department: "EEE",
    semester: "1",
    section: "A",
    subject: "EE101",
    attendance: 88,
    status: "Good",
  },
  {
    id: "S022",
    usn: "1VA22EE002",
    name: "Ishita Verma",
    department: "EEE",
    semester: "1",
    section: "A",
    subject: "EE101",
    attendance: 91,
    status: "Excellent",
  },
  {
    id: "S023",
    usn: "1VA22EE003",
    name: "Varun Thakur",
    department: "EEE",
    semester: "2",
    section: "A",
    subject: "EE201",
    attendance: 83,
    status: "Good",
  },
  {
    id: "S024",
    usn: "1VA22EE004",
    name: "Tanvi Agarwal",
    department: "EEE",
    semester: "2",
    section: "B",
    subject: "EE201",
    attendance: 87,
    status: "Good",
  },

  // MECH Department
  {
    id: "S025",
    usn: "1VA22ME001",
    name: "Nikhil Menon",
    department: "MECH",
    semester: "1",
    section: "A",
    subject: "ME101",
    attendance: 85,
    status: "Good",
  },
  {
    id: "S026",
    usn: "1VA22ME002",
    name: "Divya Krishna",
    department: "MECH",
    semester: "1",
    section: "A",
    subject: "ME101",
    attendance: 89,
    status: "Good",
  },
  {
    id: "S027",
    usn: "1VA22ME003",
    name: "Karthik Iyer",
    department: "MECH",
    semester: "2",
    section: "A",
    subject: "ME201",
    attendance: 82,
    status: "Good",
  },
  {
    id: "S028",
    usn: "1VA22ME004",
    name: "Anjali Thomas",
    department: "MECH",
    semester: "2",
    section: "B",
    subject: "ME201",
    attendance: 86,
    status: "Good",
  },

  // CSE(AIML) Department
  {
    id: "S029",
    usn: "1VA22CA001",
    name: "Rahul Bhat",
    department: "CSE(AIML)",
    semester: "1",
    section: "A",
    subject: "CA101",
    attendance: 93,
    status: "Excellent",
  },
  {
    id: "S030",
    usn: "1VA22CA002",
    name: "Pooja Sharma",
    department: "CSE(AIML)",
    semester: "1",
    section: "A",
    subject: "CA101",
    attendance: 88,
    status: "Good",
  },
  {
    id: "S031",
    usn: "1VA22CA003",
    name: "Akash Patel",
    department: "CSE(AIML)",
    semester: "2",
    section: "A",
    subject: "CA201",
    attendance: 91,
    status: "Excellent",
  },
  {
    id: "S032",
    usn: "1VA22CA004",
    name: "Riya Gupta",
    department: "CSE(AIML)",
    semester: "2",
    section: "B",
    subject: "CA201",
    attendance: 87,
    status: "Good",
  },

  // CSE(DS) Department
  {
    id: "S033",
    usn: "1VA22DS001",
    name: "Harsh Agarwal",
    department: "CSE(DS)",
    semester: "1",
    section: "A",
    subject: "DS101",
    attendance: 90,
    status: "Excellent",
  },
  {
    id: "S034",
    usn: "1VA22DS002",
    name: "Shreya Jain",
    department: "CSE(DS)",
    semester: "1",
    section: "A",
    subject: "DS101",
    attendance: 85,
    status: "Good",
  },
  {
    id: "S035",
    usn: "1VA22DS003",
    name: "Yash Malhotra",
    department: "CSE(DS)",
    semester: "2",
    section: "A",
    subject: "DS201",
    attendance: 89,
    status: "Good",
  },
  {
    id: "S036",
    usn: "1VA22DS004",
    name: "Nisha Reddy",
    department: "CSE(DS)",
    semester: "2",
    section: "B",
    subject: "DS201",
    attendance: 92,
    status: "Excellent",
  },
]

// Comprehensive mock performance data
const mockPerformanceData: PerformanceRecord[] = [
  // CSE Department
  {
    id: "S001",
    usn: "1VA22CS001",
    name: "Aarav Sharma",
    department: "CSE",
    semester: "1",
    section: "A",
    subject: "CS101",
    marks: 92,
    grade: "A+",
    status: "Excellent",
  },
  {
    id: "S002",
    usn: "1VA22CS002",
    name: "Aditi Patel",
    department: "CSE",
    semester: "1",
    section: "A",
    subject: "CS101",
    marks: 85,
    grade: "A",
    status: "Good",
  },
  {
    id: "S003",
    usn: "1VA22CS003",
    name: "Arjun Singh",
    department: "CSE",
    semester: "1",
    section: "A",
    subject: "CS101",
    marks: 78,
    grade: "B+",
    status: "Good",
  },
  {
    id: "S004",
    usn: "1VA22CS004",
    name: "Ananya Reddy",
    department: "CSE",
    semester: "1",
    section: "A",
    subject: "CS101",
    marks: 65,
    grade: "C",
    status: "Average",
  },
  {
    id: "S005",
    usn: "1VA22CS005",
    name: "Dhruv Kumar",
    department: "CSE",
    semester: "1",
    section: "B",
    subject: "CS101",
    marks: 95,
    grade: "A+",
    status: "Excellent",
  },
  {
    id: "S006",
    usn: "1VA22CS006",
    name: "Diya Verma",
    department: "CSE",
    semester: "1",
    section: "B",
    subject: "CS101",
    marks: 82,
    grade: "A",
    status: "Good",
  },
  {
    id: "S007",
    usn: "1VA22CS007",
    name: "Karan Mehta",
    department: "CSE",
    semester: "2",
    section: "A",
    subject: "CS201",
    marks: 88,
    grade: "A",
    status: "Good",
  },
  {
    id: "S008",
    usn: "1VA22CS008",
    name: "Priya Gupta",
    department: "CSE",
    semester: "2",
    section: "A",
    subject: "CS201",
    marks: 94,
    grade: "A+",
    status: "Excellent",
  },
  {
    id: "S009",
    usn: "1VA22CS009",
    name: "Rohit Sharma",
    department: "CSE",
    semester: "3",
    section: "A",
    subject: "CS301",
    marks: 86,
    grade: "A",
    status: "Good",
  },
  {
    id: "S010",
    usn: "1VA22CS010",
    name: "Sneha Patel",
    department: "CSE",
    semester: "3",
    section: "B",
    subject: "CS301",
    marks: 91,
    grade: "A+",
    status: "Excellent",
  },

  // ISE Department
  {
    id: "S011",
    usn: "1VA22IS001",
    name: "Neil Saxena",
    department: "ISE",
    semester: "1",
    section: "A",
    subject: "CS101",
    marks: 88,
    grade: "A",
    status: "Good",
  },
  {
    id: "S012",
    usn: "1VA22IS002",
    name: "Prisha Kapoor",
    department: "ISE",
    semester: "1",
    section: "A",
    subject: "CS101",
    marks: 76,
    grade: "B",
    status: "Good",
  },
  {
    id: "S013",
    usn: "1VA22IS003",
    name: "Vikram Joshi",
    department: "ISE",
    semester: "2",
    section: "A",
    subject: "IS201",
    marks: 84,
    grade: "A",
    status: "Good",
  },
  {
    id: "S014",
    usn: "1VA22IS004",
    name: "Kavya Reddy",
    department: "ISE",
    semester: "2",
    section: "B",
    subject: "IS201",
    marks: 89,
    grade: "A",
    status: "Good",
  },
  {
    id: "S015",
    usn: "1VA22IS005",
    name: "Aryan Malhotra",
    department: "ISE",
    semester: "3",
    section: "A",
    subject: "IS301",
    marks: 87,
    grade: "A",
    status: "Good",
  },

  // ECE Department
  {
    id: "S016",
    usn: "1VA22EC001",
    name: "Arnav Desai",
    department: "ECE",
    semester: "1",
    section: "A",
    subject: "EC101",
    marks: 89,
    grade: "A",
    status: "Good",
  },
  {
    id: "S017",
    usn: "1VA22EC002",
    name: "Avni Reddy",
    department: "ECE",
    semester: "1",
    section: "A",
    subject: "EC101",
    marks: 83,
    grade: "A",
    status: "Good",
  },
  {
    id: "S018",
    usn: "1VA22EC003",
    name: "Siddharth Nair",
    department: "ECE",
    semester: "2",
    section: "A",
    subject: "EC201",
    marks: 91,
    grade: "A+",
    status: "Excellent",
  },
  {
    id: "S019",
    usn: "1VA22EC004",
    name: "Meera Pillai",
    department: "ECE",
    semester: "2",
    section: "B",
    subject: "EC201",
    marks: 85,
    grade: "A",
    status: "Good",
  },
  {
    id: "S020",
    usn: "1VA22EC005",
    name: "Rajesh Kumar",
    department: "ECE",
    semester: "3",
    section: "A",
    subject: "EC301",
    marks: 88,
    grade: "A",
    status: "Good",
  },

  // EEE Department
  {
    id: "S021",
    usn: "1VA22EE001",
    name: "Aditya Singh",
    department: "EEE",
    semester: "1",
    section: "A",
    subject: "EE101",
    marks: 87,
    grade: "A",
    status: "Good",
  },
  {
    id: "S022",
    usn: "1VA22EE002",
    name: "Ishita Verma",
    department: "EEE",
    semester: "1",
    section: "A",
    subject: "EE101",
    marks: 90,
    grade: "A+",
    status: "Excellent",
  },
  {
    id: "S023",
    usn: "1VA22EE003",
    name: "Varun Thakur",
    department: "EEE",
    semester: "2",
    section: "A",
    subject: "EE201",
    marks: 82,
    grade: "A",
    status: "Good",
  },
  {
    id: "S024",
    usn: "1VA22EE004",
    name: "Tanvi Agarwal",
    department: "EEE",
    semester: "2",
    section: "B",
    subject: "EE201",
    marks: 86,
    grade: "A",
    status: "Good",
  },

  // MECH Department
  {
    id: "S025",
    usn: "1VA22ME001",
    name: "Nikhil Menon",
    department: "MECH",
    semester: "1",
    section: "A",
    subject: "ME101",
    marks: 84,
    grade: "A",
    status: "Good",
  },
  {
    id: "S026",
    usn: "1VA22ME002",
    name: "Divya Krishna",
    department: "MECH",
    semester: "1",
    section: "A",
    subject: "ME101",
    marks: 88,
    grade: "A",
    status: "Good",
  },
  {
    id: "S027",
    usn: "1VA22ME003",
    name: "Karthik Iyer",
    department: "MECH",
    semester: "2",
    section: "A",
    subject: "ME201",
    marks: 81,
    grade: "A-",
    status: "Good",
  },
  {
    id: "S028",
    usn: "1VA22ME004",
    name: "Anjali Thomas",
    department: "MECH",
    semester: "2",
    section: "B",
    subject: "ME201",
    marks: 85,
    grade: "A",
    status: "Good",
  },

  // CSE(AIML) Department
  {
    id: "S029",
    usn: "1VA22CA001",
    name: "Rahul Bhat",
    department: "CSE(AIML)",
    semester: "1",
    section: "A",
    subject: "CA101",
    marks: 92,
    grade: "A+",
    status: "Excellent",
  },
  {
    id: "S030",
    usn: "1VA22CA002",
    name: "Pooja Sharma",
    department: "CSE(AIML)",
    semester: "1",
    section: "A",
    subject: "CA101",
    marks: 87,
    grade: "A",
    status: "Good",
  },
  {
    id: "S031",
    usn: "1VA22CA003",
    name: "Akash Patel",
    department: "CSE(AIML)",
    semester: "2",
    section: "A",
    subject: "CA201",
    marks: 90,
    grade: "A+",
    status: "Excellent",
  },
  {
    id: "S032",
    usn: "1VA22CA004",
    name: "Riya Gupta",
    department: "CSE(AIML)",
    semester: "2",
    section: "B",
    subject: "CA201",
    marks: 86,
    grade: "A",
    status: "Good",
  },

  // CSE(DS) Department
  {
    id: "S033",
    usn: "1VA22DS001",
    name: "Harsh Agarwal",
    department: "CSE(DS)",
    semester: "1",
    section: "A",
    subject: "DS101",
    marks: 89,
    grade: "A",
    status: "Good",
  },
  {
    id: "S034",
    usn: "1VA22DS002",
    name: "Shreya Jain",
    department: "CSE(DS)",
    semester: "1",
    section: "A",
    subject: "DS101",
    marks: 84,
    grade: "A",
    status: "Good",
  },
  {
    id: "S035",
    usn: "1VA22DS003",
    name: "Yash Malhotra",
    department: "CSE(DS)",
    semester: "2",
    section: "A",
    subject: "DS201",
    marks: 88,
    grade: "A",
    status: "Good",
  },
  {
    id: "S036",
    usn: "1VA22DS004",
    name: "Nisha Reddy",
    department: "CSE(DS)",
    semester: "2",
    section: "B",
    subject: "DS201",
    marks: 91,
    grade: "A+",
    status: "Excellent",
  },
]

// Comprehensive mock achievement data
const mockAchievementData: AchievementRecord[] = [
  // CSE Department achievements
  {
    id: "A001",
    usn: "1VA22CS001",
    studentName: "Aarav Sharma",
    title: "First Place in National Coding Competition",
    category: "technical",
    date: "2024-03-15",
    department: "CSE",
    verified: true,
  },
  {
    id: "A002",
    usn: "1VA22CS002",
    studentName: "Aditi Patel",
    title: "Research Paper Publication in IEEE",
    category: "academic",
    date: "2024-02-10",
    department: "CSE",
    verified: true,
  },
  {
    id: "A003",
    usn: "1VA22CS003",
    studentName: "Arjun Singh",
    title: "Inter-College Cricket Tournament Winner",
    category: "sports",
    date: "2024-04-05",
    department: "CSE",
    verified: true,
  },
  {
    id: "A004",
    usn: "1VA22CS005",
    studentName: "Dhruv Kumar",
    title: "Best Project Award at Tech Fest",
    category: "technical",
    date: "2024-01-20",
    department: "CSE",
    verified: true,
  },
  {
    id: "A005",
    usn: "1VA22CS006",
    studentName: "Diya Verma",
    title: "Cultural Fest Dance Competition Winner",
    category: "cultural",
    date: "2024-03-25",
    department: "CSE",
    verified: true,
  },

  // ISE Department achievements
  {
    id: "A006",
    usn: "1VA22IS001",
    studentName: "Neil Saxena",
    title: "Hackathon Winner - Smart City Solutions",
    category: "technical",
    date: "2024-02-18",
    department: "ISE",
    verified: true,
  },
  {
    id: "A007",
    usn: "1VA22IS002",
    studentName: "Prisha Kapoor",
    title: "Best Paper Award at National Conference",
    category: "academic",
    date: "2024-01-25",
    department: "ISE",
    verified: true,
  },
  {
    id: "A008",
    usn: "1VA22IS003",
    studentName: "Vikram Joshi",
    title: "State Level Basketball Championship",
    category: "sports",
    date: "2024-03-10",
    department: "ISE",
    verified: true,
  },

  // ECE Department achievements
  {
    id: "A009",
    usn: "1VA22EC001",
    studentName: "Arnav Desai",
    title: "Innovation Award in Electronics Design",
    category: "technical",
    date: "2024-02-28",
    department: "ECE",
    verified: true,
  },
  {
    id: "A010",
    usn: "1VA22EC002",
    studentName: "Avni Reddy",
    title: "Outstanding Academic Performance Award",
    category: "academic",
    date: "2024-01-15",
    department: "ECE",
    verified: true,
  },
  {
    id: "A011",
    usn: "1VA22EC003",
    studentName: "Siddharth Nair",
    title: "Inter-University Badminton Tournament",
    category: "sports",
    date: "2024-03-12",
    department: "ECE",
    verified: true,
  },

  // EEE Department achievements
  {
    id: "A012",
    usn: "1VA22EE001",
    studentName: "Aditya Singh",
    title: "Best Innovation in Renewable Energy",
    category: "technical",
    date: "2024-02-10",
    department: "EEE",
    verified: true,
  },
  {
    id: "A013",
    usn: "1VA22EE002",
    studentName: "Ishita Verma",
    title: "Dean's List Academic Excellence",
    category: "academic",
    date: "2024-01-30",
    department: "EEE",
    verified: true,
  },

  // MECH Department achievements
  {
    id: "A014",
    usn: "1VA22ME001",
    studentName: "Nikhil Menon",
    title: "SAE Baja Competition Winner",
    category: "technical",
    date: "2024-03-20",
    department: "MECH",
    verified: true,
  },
  {
    id: "A015",
    usn: "1VA22ME002",
    studentName: "Divya Krishna",
    title: "Best Mechanical Design Project",
    category: "academic",
    date: "2024-02-05",
    department: "MECH",
    verified: true,
  },

  // CSE(AIML) Department achievements
  {
    id: "A016",
    usn: "1VA22CA001",
    studentName: "Rahul Bhat",
    title: "AI/ML Competition National Winner",
    category: "technical",
    date: "2024-03-08",
    department: "CSE(AIML)",
    verified: true,
  },
  {
    id: "A017",
    usn: "1VA22CA002",
    studentName: "Pooja Sharma",
    title: "Research Publication in AI Journal",
    category: "academic",
    date: "2024-02-22",
    department: "CSE(AIML)",
    verified: true,
  },

  // CSE(DS) Department achievements
  {
    id: "A018",
    usn: "1VA22DS001",
    studentName: "Harsh Agarwal",
    title: "Data Science Hackathon Winner",
    category: "technical",
    date: "2024-01-18",
    department: "CSE(DS)",
    verified: true,
  },
  {
    id: "A019",
    usn: "1VA22DS002",
    studentName: "Shreya Jain",
    title: "Best Data Analytics Project",
    category: "academic",
    date: "2024-03-15",
    department: "CSE(DS)",
    verified: true,
  },
]

// Update the departments array to include all departments
const departments = ["CSE", "ISE", "ECE", "EEE", "MECH", "CSE(AIML)", "CSE(DS)"]

const mockFeedbackData: FeedbackRecord[] = [
  {
    area: "Regularity in taking classes and attendance",
    rating: 4.8,
    comments: "Excellent attendance record",
  },
  {
    area: "Effectiveness of teaching and explaining the concepts in a clear manner",
    rating: 4.7,
    comments: "Very clear explanations of complex topics",
  },
  {
    area: "Effective Communication, Voice clarity and Audibility",
    rating: 4.8,
    comments: "Speaks clearly and is easily understood",
  },
  {
    area: "Effective utilization of class hour for teaching the subject",
    rating: 4.9,
    comments: "Makes excellent use of class time",
  },
  {
    area: "Giving notes/Course material before the commencement of the unit/module",
    rating: 4.6,
    comments: "Materials are provided in advance",
  },
  {
    area: "Attitude, Interaction, Encouragement in inviting the questions & clearing the doubts in the class",
    rating: 4.8,
    comments: "Very approachable and encourages questions",
  },
  {
    area: "Timely coverage of syllabus",
    rating: 4.5,
    comments: "Completes syllabus with time for revision",
  },
  {
    area: "Class control and Discipline",
    rating: 4.7,
    comments: "Maintains good discipline in class",
  },
  {
    area: "Approachability and availability for counselling/ helping the students beyond the class hours",
    rating: 4.7,
    comments: "Always available for additional help",
  },
  {
    area: "Fair and Transparency in evaluation and awarding of marks",
    rating: 4.6,
    comments: "Grading is fair and transparent",
  },
]

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [selectedFeedbackType, setSelectedFeedbackType] = useState<string>("overall")

  // State for report generation
  const [activeTab, setActiveTab] = useState("attendance")

  useEffect(() => {
    // Get user from localStorage
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        setLoading(false)
      }
    } catch (error) {
      console.error("Error retrieving user data from localStorage:", error)
      toast({
        title: "Error",
        description: "Failed to retrieve user data. Please try again.",
        variant: "destructive",
      })
      setLoading(false) // Ensure loading is set to false even in case of error
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    )
  }

  // Check permissions - allow access for admin, hod, principal, and faculty roles
  const hasAccess =
    user && (user.role === "admin" || user.role === "hod" || user.role === "principal" || user.role === "faculty")

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
          <p className="text-muted-foreground mt-1">Please contact your administrator for assistance.</p>
        </div>
      </div>
    )
  }

  // Determine user role and department
  const userDepartment = user?.department || ""
  const isHigherRole = user.role === "admin" || user.role === "principal"

  // Get stats based on user role
  const getStatsForRole = () => {
    if (isHigherRole) {
      return [
        {
          id: 1,
          title: "Attendance Rate",
          value: "86.3%",
          description: "Average across all departments",
          icon: Calendar,
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          iconColor: "text-blue-500 dark:text-blue-400",
        },
        {
          id: 2,
          title: "Average Grade",
          value: "85.0%",
          description: "Current semester",
          icon: BarChart2,
          bgColor: "bg-green-50 dark:bg-green-900/20",
          iconColor: "text-green-500 dark:text-green-400",
        },
        {
          id: 3,
          title: "Average Feedback",
          value: "4.5",
          description: "Faculty rating",
          icon: MessageSquare,
          bgColor: "bg-purple-50 dark:bg-purple-900/20",
          iconColor: "text-purple-500 dark:text-purple-400",
        },
        {
          id: 4,
          title: "Total Achievements",
          value: "156",
          description: "Across all departments",
          icon: Trophy,
          bgColor: "bg-amber-50 dark:bg-amber-900/20",
          iconColor: "text-amber-500 dark:text-amber-400",
        },
      ]
    } else if (user.role === "hod") {
      return [
        {
          id: 1,
          title: "Attendance Rate",
          value: "86.3%",
          description: `Average across ${userDepartment}`,
          icon: Calendar,
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          iconColor: "text-blue-500 dark:text-blue-400",
        },
        {
          id: 2,
          title: "Average Grade",
          value: "85.0%",
          description: "Current semester",
          icon: BarChart2,
          bgColor: "bg-green-50 dark:bg-green-900/20",
          iconColor: "text-green-500 dark:text-green-400",
        },
        {
          id: 3,
          title: "Average Feedback",
          value: "4.5",
          description: "Faculty rating",
          icon: MessageSquare,
          bgColor: "bg-purple-50 dark:bg-purple-900/20",
          iconColor: "text-purple-500 dark:text-purple-400",
        },
        {
          id: 4,
          title: "Total Achievements",
          value: "42",
          description: `In ${userDepartment}`,
          icon: Trophy,
          bgColor: "bg-amber-50 dark:bg-amber-900/20",
          iconColor: "text-amber-500 dark:text-amber-400",
        },
      ]
    } else {
      // Faculty view
      return [
        {
          id: 1,
          title: "Class Attendance",
          value: "85%",
          description: "Your classes average",
          icon: Calendar,
          bgColor: "bg-blue-50 dark:bg-blue-900/20",
          iconColor: "text-blue-500 dark:text-blue-400",
        },
        {
          id: 2,
          title: "Student Performance",
          value: "76%",
          description: "Average marks",
          icon: BarChart2,
          bgColor: "bg-green-50 dark:bg-green-900/20",
          iconColor: "text-green-500 dark:text-green-400",
        },
        {
          id: 3,
          title: "Average Feedback",
          value: "4.2",
          description: "Your rating",
          icon: MessageSquare,
          bgColor: "bg-purple-50 dark:bg-purple-900/20",
          iconColor: "text-purple-500 dark:text-purple-400",
        },
        {
          id: 4,
          title: "Students",
          value: "124",
          description: "Across all courses",
          icon: Trophy,
          bgColor: "bg-amber-50 dark:bg-amber-900/20",
          iconColor: "text-amber-500 dark:text-amber-400",
        },
      ]
    }
  }

  const stats = getStatsForRole()

  // Handle export report
  const handleExportReport = (reportType: string, fileType = "csv") => {
    // Create CSV content based on report type
    let csvContent = ""
    let fileName = ""
    let reportTitle = ""

    if (reportType === "attendance") {
      csvContent = "USN,Student Name,Department,Semester,Section,Subject,Attendance %,Status\n"
      mockAttendanceData.forEach((student) => {
        csvContent += `${student.usn},${student.name},${student.department},${student.semester},${student.section},${student.subject},${student.attendance},${student.status}\n`
      })
      fileName = `attendance_report.${fileType}`
      reportTitle = "Attendance Report"
    } else if (reportType === "performance") {
      csvContent = "USN,Student Name,Department,Semester,Section,Subject,Marks,Grade,Status\n"
      mockPerformanceData.forEach((student) => {
        csvContent += `${student.usn},${student.name},${student.department},${student.semester},${student.section},${student.subject},${student.marks},${student.grade},${student.status}\n`
      })
      fileName = `performance_report.${fileType}`
      reportTitle = "Performance Report"
    } else if (reportType === "feedback") {
      csvContent = "Question,Rating,Comments\n"
      mockFeedbackData.forEach((feedback) => {
        csvContent += `${feedback.area},${feedback.rating},${feedback.comments}\n`
      })
      fileName = `feedback_report_${selectedFeedbackType}.${fileType}`
      reportTitle = `Feedback Report - ${selectedFeedbackType.charAt(0).toUpperCase() + selectedFeedbackType.slice(1)}`
    } else if (reportType === "achievements") {
      csvContent = "USN,Student Name,Department,Achievement,Category,Date,Verified\n"
      mockAchievementData.forEach((achievement) => {
        csvContent += `${achievement.usn},${achievement.studentName},${achievement.department},${achievement.title},${achievement.category},${achievement.date},${achievement.verified}\n`
      })
      fileName = `achievements_report.${fileType}`
      reportTitle = "Achievements Report"
    }

    if (fileType === "csv") {
      // Create a blob and download link for CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", fileName)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Report exported successfully",
        description: `${reportTitle} has been exported as ${fileName}.`,
      })
    } else if (fileType === "pdf") {
      toast({
        title: "Generating PDF",
        description: `${reportTitle} is being prepared as PDF.`,
      })

      // Create a simple PDF content
      const pdfContent = `
      ${reportTitle}
      Generated on: ${new Date().toLocaleString()}
      
      ${csvContent.replace(/,/g, "\t")}
    `

      // Create a Blob with the PDF content
      const blob = new Blob([pdfContent], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)

      // Create a download link and trigger it
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", fileName)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "PDF exported successfully",
        description: `${reportTitle} has been exported as ${fileName}.`,
      })
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Reports Dashboard</h1>
        <p className="text-muted-foreground">
          Generate and analyze reports for attendance, performance, feedback, and achievements.
        </p>
      </div>

      {/* Stats Cards - Updated to match dashboard design */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 md:gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.id}
            className={`${stat.bgColor} border-none shadow-sm hover:shadow-md hover:scale-[1.03] transition-all duration-200 cursor-pointer`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="attendance" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="attendance" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Attendance</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Feedback</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>Achievements</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <AttendanceReport
            user={user}
            userDepartment={userDepartment}
            isHigherRole={isHigherRole}
            handleExportReport={handleExportReport}
          />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceReport
            user={user}
            userDepartment={userDepartment}
            isHigherRole={isHigherRole}
            handleExportReport={handleExportReport}
          />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackReport
            user={user}
            userDepartment={userDepartment}
            isHigherRole={isHigherRole}
            handleExportReport={handleExportReport}
            selectedFeedbackType={selectedFeedbackType}
          />
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementReport
            user={user}
            userDepartment={userDepartment}
            isHigherRole={isHigherRole}
            handleExportReport={handleExportReport}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Attendance Report Component
function AttendanceReport({ user, userDepartment, isHigherRole, handleExportReport }: any) {
  const { toast } = useToast()
  const [selectedDepartment, setSelectedDepartment] = useState<string>(isHigherRole ? "CSE" : userDepartment)
  const [selectedSemester, setSelectedSemester] = useState<string>("1")
  const [selectedSection, setSelectedSection] = useState<string>("A")
  const [selectedSubject, setSelectedSubject] = useState<string>("CS101")
  const [showReport, setShowReport] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([])

  // Filter data based on selection
  const filterData = () => {
    let filtered = [...mockAttendanceData]

    // Filter by department if not higher role
    if (!isHigherRole) {
      const mappedDepartment = mapDepartmentName(userDepartment)
      console.log("User department:", userDepartment, "Mapped to:", mappedDepartment)
      filtered = filtered.filter((item) => item.department === mappedDepartment)
    } else if (selectedDepartment !== "all") {
      filtered = filtered.filter((item) => item.department === selectedDepartment)
    }

    // Filter by semester, section, subject
    filtered = filtered.filter(
      (item) =>
        item.semester === selectedSemester && item.section === selectedSection && item.subject === selectedSubject,
    )

    console.log("Filtered attendance data:", filtered)
    return filtered
  }

  // Department comparison data
  const departmentComparisonData = {
    labels: ["CSE", "ISE", "ECE", "EEE", "MECH", "CSE(AIML)", "CSE(DS)"],
    datasets: [
      {
        label: "Average Attendance",
        data: [86.3, 82.3, 90.1, 85.7, 79.2, 88.5, 84.2],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  }

  // Calculate average attendance
  const calculateAverage = (data: AttendanceRecord[]) => {
    if (data.length === 0) return "N/A"
    const sum = data.reduce((acc, curr) => acc + curr.attendance, 0)
    return (sum / data.length).toFixed(1) + "%"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Report</CardTitle>
        <CardDescription>
          View and analyze student attendance data {isHigherRole ? "across departments" : `in ${userDepartment}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generate Attendance Report</CardTitle>
            <CardDescription>Select parameters to generate a detailed attendance report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {isHigherRole && (
                <div className="space-y-2">
                  <Label htmlFor="attendance-dept">Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger id="attendance-dept">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="attendance-sem">Semester</Label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger id="attendance-sem">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                    <SelectItem value="3">Semester 3</SelectItem>
                    <SelectItem value="4">Semester 4</SelectItem>
                    <SelectItem value="5">Semester 5</SelectItem>
                    <SelectItem value="6">Semester 6</SelectItem>
                    <SelectItem value="7">Semester 7</SelectItem>
                    <SelectItem value="8">Semester 8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance-section">Section</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger id="attendance-section">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                    <SelectItem value="D">Section D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="attendance-subject">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger id="attendance-subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CS101">Introduction to Computer Science</SelectItem>
                    <SelectItem value="CS201">Data Structures</SelectItem>
                    <SelectItem value="CS301">Database Systems</SelectItem>
                    <SelectItem value="CS401">Computer Networks</SelectItem>
                    <SelectItem value="CS501">Operating Systems</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Button
                onClick={() => {
                  const data = filterData()
                  setFilteredData(data)
                  setShowReport(true)
                  toast({
                    title: "Generating Attendance Report",
                    description: `Attendance report for ${isHigherRole ? selectedDepartment : mapDepartmentName(userDepartment)}, Semester ${selectedSemester}, Section ${selectedSection} is being generated.`,
                  })
                }}
                className="flex-1"
              >
                Generate Report
              </Button>
              {isHigherRole && (
                <Button variant="outline" onClick={() => setShowComparison(!showComparison)} className="flex-1">
                  {showComparison ? "Hide Comparison" : "Show Department Comparison"}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 gap-1">
                    <Download className="h-4 w-4" />
                    <span>Export Report</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExportReport("attendance", "csv")}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Export as CSV</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportReport("attendance", "pdf")}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Export as PDF</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {showReport && (
          <Card className="mb-6">
            <CardHeader className="border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <CardTitle>Student Attendance Report</CardTitle>
                  <CardDescription>
                    {isHigherRole ? selectedDepartment : mapDepartmentName(userDepartment)}, Semester {selectedSemester}
                    , Section {selectedSection},{" "}
                    {selectedSubject === "CS101" ? "Introduction to Computer Science" : selectedSubject}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Average Attendance:</span>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {calculateAverage(filteredData)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>USN</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="text-center">Attendance %</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.usn}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell className="text-center">{student.attendance}%</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={
                              student.status === "Excellent"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : student.status === "Good"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                  : student.status === "Average"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }
                          >
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No attendance data found for the selected criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {showComparison && (
          <Card>
            <CardHeader>
              <CardTitle>Department Attendance Comparison</CardTitle>
              <CardDescription>Comparing attendance rates across departments</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <Bar
                data={departmentComparisonData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => `Attendance: ${context.parsed.y}%`,
                      },
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}

// Performance Report Component
function PerformanceReport({ user, userDepartment, isHigherRole, handleExportReport }: any) {
  const { toast } = useToast()
  const [selectedDepartment, setSelectedDepartment] = useState<string>(isHigherRole ? "CSE" : userDepartment)
  const [selectedSemester, setSelectedSemester] = useState<string>("1")
  const [selectedSection, setSelectedSection] = useState<string>("A")
  const [selectedSubject, setSelectedSubject] = useState<string>("CS101")
  const [showReport, setShowReport] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [filteredData, setFilteredData] = useState<PerformanceRecord[]>([])

  // Filter data based on selection
  const filterData = () => {
    let filtered = [...mockPerformanceData]

    // Filter by department if not higher role
    if (!isHigherRole) {
      const mappedDepartment = mapDepartmentName(userDepartment)
      filtered = filtered.filter((item) => item.department === mappedDepartment)
    } else if (selectedDepartment !== "all") {
      filtered = filtered.filter((item) => item.department === selectedDepartment)
    }

    // Filter by semester, section, subject
    filtered = filtered.filter(
      (item) =>
        item.semester === selectedSemester && item.section === selectedSection && item.subject === selectedSubject,
    )

    return filtered
  }

  // Department comparison data
  const departmentComparisonData = {
    labels: ["CSE", "ISE", "ECE", "EEE", "MECH", "CSE(AIML)", "CSE(DS)"],
    datasets: [
      {
        label: "Average Marks",
        data: [82.0, 78.0, 85.0, 76.0, 80.0, 84.5, 83.2],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  }

  // Calculate average marks
  const calculateAverage = (data: PerformanceRecord[]) => {
    if (data.length === 0) return "N/A"
    const sum = data.reduce((acc, curr) => acc + curr.marks, 0)
    return (sum / data.length).toFixed(1) + "%"
  }

  // Calculate grade distribution
  const calculateGradeDistribution = (data: PerformanceRecord[]) => {
    const distribution = {
      "A+": 0,
      A: 0,
      "B+": 0,
      B: 0,
      C: 0,
      D: 0,
      F: 0,
    }

    data.forEach((item) => {
      if (distribution[item.grade as keyof typeof distribution] !== undefined) {
        distribution[item.grade as keyof typeof distribution]++
      }
    })

    return {
      labels: Object.keys(distribution),
      datasets: [
        {
          data: Object.values(distribution),
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(255, 99, 132, 0.6)",
            "rgba(255, 159, 64, 0.6)",
            "rgba(83, 83, 83, 0.6)",
          ],
          borderWidth: 1,
        },
      ],
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Report</CardTitle>
        <CardDescription>
          View and analyze student academic performance {isHigherRole ? "across departments" : `in ${userDepartment}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generate Performance Report</CardTitle>
            <CardDescription>Select parameters to generate a detailed performance report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {isHigherRole && (
                <div className="space-y-2">
                  <Label htmlFor="performance-dept">Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger id="performance-dept">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="performance-sem">Semester</Label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger id="performance-sem">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                    <SelectItem value="3">Semester 3</SelectItem>
                    <SelectItem value="4">Semester 4</SelectItem>
                    <SelectItem value="5">Semester 5</SelectItem>
                    <SelectItem value="6">Semester 6</SelectItem>
                    <SelectItem value="7">Semester 7</SelectItem>
                    <SelectItem value="8">Semester 8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="performance-section">Section</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger id="performance-section">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                    <SelectItem value="D">Section D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="performance-subject">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger id="performance-subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CS101">Introduction to Computer Science</SelectItem>
                    <SelectItem value="CS201">Data Structures</SelectItem>
                    <SelectItem value="CS301">Database Systems</SelectItem>
                    <SelectItem value="CS401">Computer Networks</SelectItem>
                    <SelectItem value="CS501">Operating Systems</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Button
                onClick={() => {
                  const data = filterData()
                  setFilteredData(data)
                  setShowReport(true)
                  toast({
                    title: "Generating Performance Report",
                    description: `Performance report for ${isHigherRole ? selectedDepartment : mapDepartmentName(userDepartment)}, Semester ${selectedSemester}, Section ${selectedSection} is being generated.`,
                  })
                }}
                className="flex-1"
              >
                Generate Report
              </Button>
              {isHigherRole && (
                <Button variant="outline" onClick={() => setShowComparison(!showComparison)} className="flex-1">
                  {showComparison ? "Hide Comparison" : "Show Department Comparison"}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 gap-1">
                    <Download className="h-4 w-4" />
                    <span>Export Report</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExportReport("performance", "csv")}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Export as CSV</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportReport("performance", "pdf")}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Export as PDF</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {showReport && (
          <Card className="mb-6">
            <CardHeader className="border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <CardTitle>Student Performance Report</CardTitle>
                  <CardDescription>
                    {isHigherRole ? selectedDepartment : mapDepartmentName(userDepartment)}, Semester {selectedSemester}
                    , Section {selectedSection},{" "}
                    {selectedSubject === "CS101" ? "Introduction to Computer Science" : selectedSubject}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Class Average:</span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {calculateAverage(filteredData)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredData.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Grade Distribution</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[200px]">
                        <Pie
                          data={calculateGradeDistribution(filteredData)}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                          }}
                        />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Performance Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          <li className="flex justify-between items-center">
                            <span>Highest Marks</span>
                            <span className="font-semibold">{Math.max(...filteredData.map((s) => s.marks))}%</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Lowest Marks</span>
                            <span className="font-semibold">{Math.min(...filteredData.map((s) => s.marks))}%</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Average Marks</span>
                            <span className="font-semibold">{calculateAverage(filteredData)}</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Pass Percentage</span>
                            <span className="font-semibold">
                              {((filteredData.filter((s) => s.marks >= 40).length / filteredData.length) * 100).toFixed(
                                1,
                              )}
                              %
                            </span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>USN</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead className="text-center">Marks</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.usn}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell className="text-center">{student.marks}%</TableCell>
                          <TableCell className="text-center">{student.grade}</TableCell>
                          <TableCell className="text-center">
                            <Badge
                              className={
                                student.status === "Excellent"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : student.status === "Good"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                    : student.status === "Average"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                              }
                            >
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No performance data found for the selected criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {showComparison && (
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Comparison</CardTitle>
              <CardDescription>Comparing average marks across departments</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <Bar
                data={departmentComparisonData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => `Average Marks: ${context.parsed.y}%`,
                      },
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}

// Feedback Report Component
function FeedbackReport({ user, userDepartment, isHigherRole, handleExportReport, selectedFeedbackType }: any) {
  const { toast } = useToast()
  const [selectedDepartment, setSelectedDepartment] = useState<string>(isHigherRole ? "CSE" : userDepartment)
  const [selectedSemester, setSelectedSemester] = useState<string>("2")
  const [selectedSection, setSelectedSection] = useState<string>("A")
  const [selectedFaculty, setSelectedFaculty] = useState<string>("Dr. Arun Kumar R")
  const [selectedSubject, setSelectedSubject] = useState<string>("Engineering Mathematics II")
  const [showReport, setShowReport] = useState(false)
  const [filteredData, setFilteredData] = useState<FeedbackRecord[]>([])
  const [showFacultyComparison, setShowFacultyComparison] = useState(false)
  const [selectedYear, setSelectedYear] = useState<string>("2017-18")

  // Calculate average rating
  const calculateAverageRating = (data: FeedbackRecord[]) => {
    if (data.length === 0) return "N/A"
    const sum = data.reduce((acc, curr) => acc + curr.rating, 0)
    return (sum / data.length).toFixed(2)
  }

  // Calculate rating distribution
  const calculateRatingDistribution = () => {
    const ratings = [0, 0, 0, 0, 0] // 1-5 stars

    filteredData.forEach((item) => {
      const roundedRating = Math.round(item.rating)
      if (roundedRating >= 1 && roundedRating <= 5) {
        ratings[roundedRating - 1]++
      }
    })

    return {
      labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
      datasets: [
        {
          data: ratings,
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)",
            "rgba(255, 159, 64, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(54, 162, 235, 0.6)",
            "rgba(75, 192, 192, 0.6)",
          ],
          borderWidth: 1,
        },
      ],
    }
  }

  // Get rating class based on value
  const getRatingClass = (rating: number) => {
    if (rating >= 4.5) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    if (rating >= 3.5) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    if (rating >= 2.5) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  }

  // Faculty comparison data
  const facultyComparisonData = {
    labels: ["Dr. Arun Kumar R", "Prof. Priya Sharma", "Dr. Amit Patel", "Prof. Sneha Verma", "Dr. Vikram Singh"],
    datasets: [
      {
        label: "Average Rating",
        data: [4.7, 4.5, 4.2, 4.6, 4.3],
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  }

  // When generating the report title, include the feedback type
  const getReportTitle = (feedbackType: string) => {
    switch (feedbackType) {
      case "phase1":
        return "Phase-1 Appraisal"
      case "phase2":
        return "Phase-2 Appraisal"
      case "overall":
        return "Overall Appraisal"
      default:
        return "Appraisal"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Faculty Feedback Report - {selectedFeedbackType.charAt(0).toUpperCase() + selectedFeedbackType.slice(1)}
        </CardTitle>
        <CardDescription>View and analyze faculty feedback from students</CardDescription>
      </CardHeader>
      <CardContent>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generate Faculty Feedback Report</CardTitle>
            <CardDescription>Select parameters to generate a detailed faculty feedback report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="feedback-type">Feedback Type</Label>
                <Select
                  value={selectedFeedbackType}
                  onValueChange={(value) => {
                    console.log("Selected feedback type:", value)
                  }}
                >
                  <SelectTrigger id="feedback-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phase1">Phase 1</SelectItem>
                    <SelectItem value="phase2">Phase 2</SelectItem>
                    <SelectItem value="overall">Overall</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isHigherRole && (
                <div className="space-y-2">
                  <Label htmlFor="feedback-dept">Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger id="feedback-dept">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="feedback-sem">Semester</Label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger id="feedback-sem">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                    <SelectItem value="3">Semester 3</SelectItem>
                    <SelectItem value="4">Semester 4</SelectItem>
                    <SelectItem value="5">Semester 5</SelectItem>
                    <SelectItem value="6">Semester 6</SelectItem>
                    <SelectItem value="7">Semester 7</SelectItem>
                    <SelectItem value="8">Semester 8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback-section">Section</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger id="feedback-section">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Section A</SelectItem>
                    <SelectItem value="B">Section B</SelectItem>
                    <SelectItem value="C">Section C</SelectItem>
                    <SelectItem value="D">Section D</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback-faculty">Faculty</Label>
                <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                  <SelectTrigger id="feedback-faculty">
                    <SelectValue placeholder="Select faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Arun Kumar R">Dr. Arun Kumar R</SelectItem>
                    <SelectItem value="Prof. Priya Sharma">Prof. Priya Sharma</SelectItem>
                    <SelectItem value="Dr. Amit Patel">Dr. Amit Patel</SelectItem>
                    <SelectItem value="Prof. Sneha Verma">Prof. Sneha Verma</SelectItem>
                    <SelectItem value="Dr. Vikram Singh">Dr. Vikram Singh</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback-subject">Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger id="feedback-subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering Mathematics II">Engineering Mathematics II</SelectItem>
                    <SelectItem value="Data Structures">Data Structures</SelectItem>
                    <SelectItem value="Database Systems">Database Systems</SelectItem>
                    <SelectItem value="Computer Networks">Computer Networks</SelectItem>
                    <SelectItem value="Operating Systems">Operating Systems</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Button
                onClick={() => {
                  setFilteredData(mockFeedbackData)
                  setShowReport(true)
                  toast({
                    title: "Generating Faculty Feedback Report",
                    description: `Faculty feedback report for ${selectedFaculty} is being generated.`,
                  })
                }}
                className="flex-1"
              >
                Generate Report
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFacultyComparison(!showFacultyComparison)}
                className="flex-1"
              >
                {showFacultyComparison ? "Hide Faculty Comparison" : "Show Faculty Comparison"}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 gap-1">
                    <Download className="h-4 w-4" />
                    <span>Export Report</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExportReport("feedback", "csv")}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Export as CSV</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportReport("feedback", "pdf")}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Export as PDF</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {showReport && (
          <Card className="mt-6">
            <CardHeader className="border-b">
              <div className="flex flex-col gap-2">
                <div className="text-center">
                  <CardTitle className="text-xl">Sai Vidya Institute of Technology, Bangalore-560 064.</CardTitle>
                  <CardDescription className="text-base font-medium mt-1">
                    Evaluation of Teachers by Students - ({getReportTitle(selectedFeedbackType)}) -- {selectedSemester}{" "}
                    - {selectedYear}
                  </CardDescription>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                  <div className="space-y-1">
                    <div className="flex">
                      <span className="font-semibold w-32">Semester:</span>
                      <span>{selectedSemester}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-32">Class Strength:</span>
                      <span>62</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-32">Teacher Name:</span>
                      <span>{selectedFaculty}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex">
                      <span className="font-semibold w-48">Branch:</span>
                      <span>{selectedDepartment}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-48">No. of Students Present:</span>
                      <span>62 - (100%)</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-48">No. of students Absent:</span>
                      <span>0</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-48">Subject Taught:</span>
                      <span>{selectedSubject}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Sl.No.</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead className="text-center w-24">Rating</TableHead>
                    <TableHead className="text-center w-24">Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((feedback, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{feedback.area}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={getRatingClass(feedback.rating)}>{feedback.rating.toFixed(1)}/5</Badge>
                      </TableCell>
                      <TableCell className="text-center">{(feedback.rating * 20).toFixed(0)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-semibold">
                    <TableCell colSpan={2} className="text-right">
                      Total Points
                    </TableCell>
                    <TableCell className="text-center">{calculateAverageRating(filteredData)}/5</TableCell>
                    <TableCell className="text-center">
                      {(Number.parseFloat(calculateAverageRating(filteredData)) * 20).toFixed(0)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="mt-8 border-t pt-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-center md:text-left">
                    <h3 className="text-lg font-semibold">Appraisal of the Teacher as given by the student:</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge className="text-lg px-4 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        {(Number.parseFloat(calculateAverageRating(filteredData)) * 20).toFixed(2)}%
                      </Badge>
                      <span className="text-lg font-semibold">Excellent</span>
                    </div>
                  </div>

                  <div className="w-full md:w-1/3 h-[200px]">
                    <Pie
                      data={calculateRatingDistribution()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "right",
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Signature of the HOD with Remarks</h3>
                  <div className="h-12 border-b border-dashed"></div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Signature of the Principal with Remarks</h3>
                  <div className="h-12 border-b border-dashed"></div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Signature of the Director with Remarks</h3>
                  <div className="h-12 border-b border-dashed"></div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Signature of the Receiver</h3>
                  <div className="h-12 border-b border-dashed"></div>
                </div>
              </div>

              <div className="flex justify-center mt-8">
                <Button onClick={() => handleExportReport("feedback")} className="w-full md:w-1/3 gap-2">
                  <Download className="h-5 w-5" />
                  <span>Export Report</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {showFacultyComparison && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Faculty Comparison</CardTitle>
              <CardDescription>
                Comparing average ratings across faculty members in {isHigherRole ? selectedDepartment : userDepartment}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <Bar
                data={facultyComparisonData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 5,
                    },
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => `Average Rating: ${context.parsed.y}`,
                      },
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}

// Achievement Report Component
function AchievementReport({ user, userDepartment, isHigherRole, handleExportReport }: any) {
  const { toast } = useToast()
  const [selectedDepartment, setSelectedDepartment] = useState<string>(isHigherRole ? "all" : userDepartment)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedSemester, setSelectedSemester] = useState<string>("all")
  const [showReport, setShowReport] = useState(false)
  const [showComparison, setShowComparison] = useState(false)
  const [filteredData, setFilteredData] = useState<AchievementRecord[]>([])

  // Filter data based on selection
  const filterData = () => {
    let filtered = [...mockAchievementData]

    // Filter by department if not higher role
    if (!isHigherRole) {
      const mappedDepartment = mapDepartmentName(userDepartment)
      filtered = filtered.filter((item) => item.department === mappedDepartment)
    } else if (selectedDepartment !== "all") {
      filtered = filtered.filter((item) => item.department === selectedDepartment)
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    return filtered
  }

  // Department comparison data
  const departmentComparisonData = {
    labels: ["CSE", "ISE", "ECE", "EEE", "MECH", "CSE(AIML)", "CSE(DS)"],
    datasets: [
      {
        label: "Technical",
        data: [24, 18, 15, 12, 10, 20, 22],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
      {
        label: "Academic",
        data: [18, 15, 12, 10, 8, 16, 14],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Sports",
        data: [12, 10, 14, 16, 18, 8, 10],
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
      {
        label: "Cultural",
        data: [15, 12, 10, 14, 16, 12, 8],
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
      },
    ],
  }

  // Function to get category badge
  const getCategoryBadge = (category: string) => {
    switch (category.toLowerCase()) {
      case "academic":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">Academic</Badge>
      case "technical":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100">Technical</Badge>
      case "sports":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">Sports</Badge>
      case "cultural":
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100">Cultural</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">Other</Badge>
    }
  }

  // Calculate category distribution
  const calculateCategoryDistribution = (data: AchievementRecord[]) => {
    const categories = ["technical", "academic", "sports", "cultural"]
    const counts = categories.map((category) => data.filter((item) => item.category === category).length)

    return {
      labels: ["Technical", "Academic", "Sports", "Cultural"],
      datasets: [
        {
          data: counts,
          backgroundColor: [
            "rgba(54, 162, 235, 0.6)",
            "rgba(75, 192, 192, 0.6)",
            "rgba(153, 102, 255, 0.6)",
            "rgba(255, 159, 64, 0.6)",
          ],
          borderWidth: 1,
        },
      ],
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements Report</CardTitle>
        <CardDescription>View and analyze student achievements data</CardDescription>
      </CardHeader>
      <CardContent>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generate Achievements Report</CardTitle>
            <CardDescription>Select parameters to generate a detailed achievements report</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {isHigherRole && (
                <div className="space-y-2">
                  <Label htmlFor="achievements-dept">Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger id="achievements-dept">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="achievements-category">Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="achievements-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="achievements-semester">Semester</Label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger id="achievements-semester">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                    <SelectItem value="3">Semester 3</SelectItem>
                    <SelectItem value="4">Semester 4</SelectItem>
                    <SelectItem value="5">Semester 5</SelectItem>
                    <SelectItem value="6">Semester 6</SelectItem>
                    <SelectItem value="7">Semester 7</SelectItem>
                    <SelectItem value="8">Semester 8</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Button
                onClick={() => {
                  const data = filterData()
                  setFilteredData(data)
                  setShowReport(true)
                  toast({
                    title: "Generating Achievements Report",
                    description: `Achievements report ${isHigherRole && selectedDepartment !== "all" ? `for ${selectedDepartment}` : ""} is being generated.`,
                  })
                }}
                className="flex-1"
              >
                Generate Report
              </Button>
              {isHigherRole && (
                <Button variant="outline" onClick={() => setShowComparison(!showComparison)} className="flex-1">
                  {showComparison ? "Hide Comparison" : "Show Department Comparison"}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex-1 gap-1">
                    <Download className="h-4 w-4" />
                    <span>Export Report</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExportReport("achievements", "csv")}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Export as CSV</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportReport("achievements", "pdf")}>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Export as PDF</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {showReport && (
          <Card className="mb-6">
            <CardHeader className="border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <CardTitle>Student Achievements Report</CardTitle>
                  <CardDescription>
                    {isHigherRole && selectedDepartment !== "all"
                      ? selectedDepartment
                      : mapDepartmentName(userDepartment)}
                    {selectedCategory !== "all"
                      ? `, ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} achievements`
                      : ""}
                    {selectedSemester !== "all" ? `, Semester ${selectedSemester}` : ""}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Total Achievements:</span>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {filteredData.length}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {filteredData.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Achievement Categories</CardTitle>
                      </CardHeader>
                      <CardContent className="h-[200px]">
                        <Pie
                          data={calculateCategoryDistribution(filteredData)}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                          }}
                        />
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Achievement Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          <li className="flex justify-between items-center">
                            <span>Total Achievements</span>
                            <span className="font-semibold">{filteredData.length}</span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Technical Achievements</span>
                            <span className="font-semibold">
                              {filteredData.filter((a) => a.category === "technical").length}
                            </span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Academic Achievements</span>
                            <span className="font-semibold">
                              {filteredData.filter((a) => a.category === "academic").length}
                            </span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Sports Achievements</span>
                            <span className="font-semibold">
                              {filteredData.filter((a) => a.category === "sports").length}
                            </span>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Cultural Achievements</span>
                            <span className="font-semibold">
                              {filteredData.filter((a) => a.category === "cultural").length}
                            </span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>USN</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Achievement</TableHead>
                        <TableHead className="text-center">Category</TableHead>
                        <TableHead className="text-center">Date</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredData.map((achievement) => (
                        <TableRow key={achievement.id}>
                          <TableCell className="font-medium">{achievement.usn}</TableCell>
                          <TableCell>{achievement.studentName}</TableCell>
                          <TableCell>{achievement.title}</TableCell>
                          <TableCell className="text-center">{getCategoryBadge(achievement.category)}</TableCell>
                          <TableCell className="text-center">
                            {new Date(achievement.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No achievement data found for the selected criteria.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {showComparison && isHigherRole && (
          <Card>
            <CardHeader>
              <CardTitle>Department Achievements Comparison</CardTitle>
              <CardDescription>Comparing achievements across departments by category</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <Bar
                data={departmentComparisonData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.parsed.y} achievements`,
                      },
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
