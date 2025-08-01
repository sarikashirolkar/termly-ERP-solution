"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Trash2, FileText, Star, Eye, FileSpreadsheet } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

// Types
interface Question {
  id: string
  text: string
}

interface Survey {
  id: string
  title: string
  department: string
  semester: string
  section: string
  subjectCode: string
  subjectName: string
  facultyName: string
  academicYear: string
  dateCreated: string
  questions: Question[]
  status: "draft" | "published" | "completed"
}

interface SurveyResponse {
  id: string
  surveyId: string
  questionId: string
  rating: 1 | 2 | 3
  studentId: string
}

interface SurveyReport {
  surveyId: string
  facultyName: string
  subjectCode: string
  subjectName: string
  academicYear: string
  department: string
  semester: string
  section: string
  dateOfCES: string
  totalStudents: number
  respondedStudents: number
  responseRate: number
  questions: {
    id: string
    text: string
    ratings: {
      1: number
      2: number
      3: number
    }
    cesScore: number
  }[]
  avgCesScore: number
}

// Mock data
const departments = ["CSE", "CSE(AIML)", "CSE(DS)", "ISE", "ECE"]
const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"]
const sections = ["A", "B", "C", "D"]
const subjects = [
  { code: "BMATS101", name: "Mathematics I for CSE Stream" },
  { code: "BPHYS102", name: "Engineering Physics" },
  { code: "BCHEM103", name: "Engineering Chemistry" },
  { code: "BCSE104", name: "Programming in C" },
  { code: "BCSE201", name: "Data Structures" },
  { code: "BCSE301", name: "Database Management Systems" },
  { code: "BCSE401", name: "Computer Networks" },
]

// Mock surveys
const mockSurveys: Survey[] = [
  {
    id: "survey1",
    title: "Mathematics I End Semester Survey",
    department: "CSE",
    semester: "1",
    section: "C",
    subjectCode: "BMATS101",
    subjectName: "Mathematics I for CSE Stream",
    facultyName: "Dr. Arun Kumar R",
    academicYear: "2024-2025-ODD",
    dateCreated: "2025-01-10",
    questions: [
      {
        id: "q1",
        text: "Have you applied the knowledge of calculus to solve problems related to polar curves and learn the notion of partial differentiation to compute rate of change of multivariate functions",
      },
      {
        id: "q2",
        text: "Rate your idea of analyze the solution of linear and nonlinear ordinary differential equations",
      },
      {
        id: "q3",
        text: "Have you got acquainted and to apply modular arithmetic to computer algorithms",
      },
      {
        id: "q4",
        text: "Rate your Knowledge of make use of matrix theory for solving the system of linear equations and compute eigenvalues and eigenvectors",
      },
      {
        id: "q5",
        text: "How much you familiarize with modern mathematical tools namely MATHEMATICA/MATLAB/ PYTHON/ SCILAB",
      },
    ],
    status: "completed",
  },
  {
    id: "survey2",
    title: "Data Structures End Semester Survey",
    department: "CSE",
    semester: "3",
    section: "A",
    subjectCode: "BCSE201",
    subjectName: "Data Structures",
    facultyName: "Dr. Priya Sharma",
    academicYear: "2024-2025-ODD",
    dateCreated: "2025-01-15",
    questions: [
      {
        id: "q1",
        text: "Rate your understanding of basic data structures like arrays, linked lists, stacks, and queues",
      },
      {
        id: "q2",
        text: "How well can you implement tree and graph data structures",
      },
      {
        id: "q3",
        text: "Rate your ability to analyze the time and space complexity of algorithms",
      },
      {
        id: "q4",
        text: "How comfortable are you with implementing sorting and searching algorithms",
      },
    ],
    status: "published",
  },
  {
    id: "survey3",
    title: "Database Management Systems Survey",
    department: "CSE",
    semester: "5",
    section: "B",
    subjectCode: "BCSE301",
    subjectName: "Database Management Systems",
    facultyName: "Prof. Vikram Singh",
    academicYear: "2024-2025-ODD",
    dateCreated: "2025-01-20",
    questions: [
      {
        id: "q1",
        text: "Rate your understanding of database design principles and normalization",
      },
      {
        id: "q2",
        text: "How well can you write complex SQL queries",
      },
      {
        id: "q3",
        text: "Rate your understanding of transaction management and concurrency control",
      },
    ],
    status: "draft",
  },
]

// Mock survey responses
const mockSurveyResponses: SurveyResponse[] = [
  // Responses for Q1
  { id: "r1", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s1" },
  { id: "r2", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s2" },
  { id: "r3", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s3" },
  { id: "r4", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s4" },
  { id: "r5", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s5" },
  { id: "r6", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s6" },
  { id: "r7", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s7" },
  { id: "r8", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s8" },
  { id: "r9", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s9" },
  { id: "r10", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s10" },
  { id: "r11", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s11" },
  { id: "r12", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s12" },
  { id: "r13", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s13" },
  { id: "r14", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s14" },
  { id: "r15", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s15" },
  { id: "r16", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s16" },
  { id: "r17", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s17" },
  { id: "r18", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s18" },
  { id: "r19", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s19" },
  { id: "r20", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s20" },
  { id: "r21", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s21" },
  { id: "r22", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s22" },
  { id: "r23", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s23" },
  { id: "r24", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s24" },
  { id: "r25", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s25" },
  { id: "r26", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s26" },
  { id: "r27", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s27" },
  { id: "r28", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s28" },
  { id: "r29", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s29" },
  { id: "r30", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s30" },
  { id: "r31", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s31" },
  { id: "r32", surveyId: "survey1", questionId: "q1", rating: 3, studentId: "s32" },
  { id: "r33", surveyId: "survey1", questionId: "q1", rating: 2, studentId: "s33" },
  { id: "r34", surveyId: "survey1", questionId: "q1", rating: 2, studentId: "s34" },
  { id: "r35", surveyId: "survey1", questionId: "q1", rating: 2, studentId: "s35" },
  { id: "r36", surveyId: "survey1", questionId: "q1", rating: 2, studentId: "s36" },
  { id: "r37", surveyId: "survey1", questionId: "q1", rating: 2, studentId: "s37" },
  { id: "r38", surveyId: "survey1", questionId: "q1", rating: 2, studentId: "s38" },
  { id: "r39", surveyId: "survey1", questionId: "q1", rating: 2, studentId: "s39" },
  { id: "r40", surveyId: "survey1", questionId: "q1", rating: 2, studentId: "s40" },
  { id: "r41", surveyId: "survey1", questionId: "q1", rating: 2, studentId: "s41" },
  { id: "r42", surveyId: "survey1", questionId: "q1", rating: 2, studentId: "s42" },
  { id: "r43", surveyId: "survey1", questionId: "q1", rating: 2, studentId: "s43" },
  { id: "r44", surveyId: "survey1", questionId: "q1", rating: 2, studentId: "s44" },
  { id: "r45", surveyId: "survey1", questionId: "q1", rating: 2, studentId: "s45" },

  // Responses for Q2
  { id: "r46", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s1" },
  { id: "r47", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s2" },
  { id: "r48", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s3" },
  { id: "r49", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s4" },
  { id: "r50", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s5" },
  { id: "r51", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s6" },
  { id: "r52", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s7" },
  { id: "r53", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s8" },
  { id: "r54", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s9" },
  { id: "r55", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s10" },
  { id: "r56", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s11" },
  { id: "r57", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s12" },
  { id: "r58", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s13" },
  { id: "r59", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s14" },
  { id: "r60", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s15" },
  { id: "r61", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s16" },
  { id: "r62", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s17" },
  { id: "r63", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s18" },
  { id: "r64", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s19" },
  { id: "r65", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s20" },
  { id: "r66", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s21" },
  { id: "r67", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s22" },
  { id: "r68", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s23" },
  { id: "r69", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s24" },
  { id: "r70", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s25" },
  { id: "r71", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s26" },
  { id: "r72", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s27" },
  { id: "r73", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s28" },
  { id: "r74", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s29" },
  { id: "r75", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s30" },
  { id: "r76", surveyId: "survey1", questionId: "q2", rating: 3, studentId: "s31" },
  { id: "r77", surveyId: "survey1", questionId: "q2", rating: 2, studentId: "s32" },
  { id: "r78", surveyId: "survey1", questionId: "q2", rating: 2, studentId: "s33" },
  { id: "r79", surveyId: "survey1", questionId: "q2", rating: 2, studentId: "s34" },
  { id: "r80", surveyId: "survey1", questionId: "q2", rating: 2, studentId: "s35" },
  { id: "r81", surveyId: "survey1", questionId: "q2", rating: 2, studentId: "s36" },
  { id: "r82", surveyId: "survey1", questionId: "q2", rating: 2, studentId: "s37" },
  { id: "r83", surveyId: "survey1", questionId: "q2", rating: 2, studentId: "s38" },
  { id: "r84", surveyId: "survey1", questionId: "q2", rating: 2, studentId: "s39" },
  { id: "r85", surveyId: "survey1", questionId: "q2", rating: 2, studentId: "s40" },
  { id: "r86", surveyId: "survey1", questionId: "q2", rating: 2, studentId: "s41" },
  { id: "r87", surveyId: "survey1", questionId: "q2", rating: 2, studentId: "s42" },
  { id: "r88", surveyId: "survey1", questionId: "q2", rating: 1, studentId: "s43" },
  { id: "r89", surveyId: "survey1", questionId: "q2", rating: 1, studentId: "s44" },
  { id: "r90", surveyId: "survey1", questionId: "q2", rating: 1, studentId: "s45" },

  // Responses for Q3
  { id: "r91", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s1" },
  { id: "r92", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s2" },
  { id: "r93", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s3" },
  { id: "r94", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s4" },
  { id: "r95", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s5" },
  { id: "r96", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s6" },
  { id: "r97", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s7" },
  { id: "r98", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s8" },
  { id: "r99", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s9" },
  { id: "r100", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s10" },
  { id: "r101", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s11" },
  { id: "r102", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s12" },
  { id: "r103", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s13" },
  { id: "r104", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s14" },
  { id: "r105", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s15" },
  { id: "r106", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s16" },
  { id: "r107", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s17" },
  { id: "r108", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s18" },
  { id: "r109", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s19" },
  { id: "r110", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s20" },
  { id: "r111", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s21" },
  { id: "r112", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s22" },
  { id: "r113", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s23" },
  { id: "r114", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s24" },
  { id: "r115", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s25" },
  { id: "r116", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s26" },
  { id: "r117", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s27" },
  { id: "r118", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s28" },
  { id: "r119", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s29" },
  { id: "r120", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s30" },
  { id: "r121", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s31" },
  { id: "r122", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s32" },
  { id: "r123", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s33" },
  { id: "r124", surveyId: "survey1", questionId: "q3", rating: 3, studentId: "s34" },
  { id: "r125", surveyId: "survey1", questionId: "q3", rating: 2, studentId: "s35" },
  { id: "r126", surveyId: "survey1", questionId: "q3", rating: 2, studentId: "s36" },
  { id: "r127", surveyId: "survey1", questionId: "q3", rating: 2, studentId: "s37" },
  { id: "r128", surveyId: "survey1", questionId: "q3", rating: 2, studentId: "s38" },
  { id: "r129", surveyId: "survey1", questionId: "q3", rating: 2, studentId: "s39" },
  { id: "r130", surveyId: "survey1", questionId: "q3", rating: 2, studentId: "s40" },
  { id: "r131", surveyId: "survey1", questionId: "q3", rating: 2, studentId: "s41" },
  { id: "r132", surveyId: "survey1", questionId: "q3", rating: 2, studentId: "s42" },
  { id: "r133", surveyId: "survey1", questionId: "q3", rating: 2, studentId: "s43" },
  { id: "r134", surveyId: "survey1", questionId: "q3", rating: 2, studentId: "s44" },
  { id: "r135", surveyId: "survey1", questionId: "q3", rating: 1, studentId: "s45" },

  // Responses for Q4
  { id: "r136", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s1" },
  { id: "r137", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s2" },
  { id: "r138", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s3" },
  { id: "r139", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s4" },
  { id: "r140", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s5" },
  { id: "r141", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s6" },
  { id: "r142", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s7" },
  { id: "r143", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s8" },
  { id: "r144", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s9" },
  { id: "r145", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s10" },
  { id: "r146", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s11" },
  { id: "r147", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s12" },
  { id: "r148", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s13" },
  { id: "r149", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s14" },
  { id: "r150", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s15" },
  { id: "r151", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s16" },
  { id: "r152", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s17" },
  { id: "r153", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s18" },
  { id: "r154", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s19" },
  { id: "r155", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s20" },
  { id: "r156", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s21" },
  { id: "r157", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s22" },
  { id: "r158", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s23" },
  { id: "r159", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s24" },
  { id: "r160", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s25" },
  { id: "r161" },
  { id: "r160", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s25" },
  { id: "r161", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s26" },
  { id: "r162", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s27" },
  { id: "r163", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s28" },
  { id: "r164", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s29" },
  { id: "r165", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s30" },
  { id: "r166", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s31" },
  { id: "r167", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s32" },
  { id: "r168", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s33" },
  { id: "r169", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s34" },
  { id: "r170", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s35" },
  { id: "r171", surveyId: "survey1", questionId: "q4", rating: 3, studentId: "s36" },
  { id: "r172", surveyId: "survey1", questionId: "q4", rating: 2, studentId: "s37" },
  { id: "r173", surveyId: "survey1", questionId: "q4", rating: 2, studentId: "s38" },
  { id: "r174", surveyId: "survey1", questionId: "q4", rating: 2, studentId: "s39" },
  { id: "r175", surveyId: "survey1", questionId: "q4", rating: 2, studentId: "s40" },
  { id: "r176", surveyId: "survey1", questionId: "q4", rating: 2, studentId: "s41" },
  { id: "r177", surveyId: "survey1", questionId: "q4", rating: 2, studentId: "s42" },
  { id: "r178", surveyId: "survey1", questionId: "q4", rating: 2, studentId: "s43" },
  { id: "r179", surveyId: "survey1", questionId: "q4", rating: 1, studentId: "s44" },
  { id: "r180", surveyId: "survey1", questionId: "q4", rating: 1, studentId: "s45" },

  // Responses for Q5
  { id: "r181", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s1" },
  { id: "r182", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s2" },
  { id: "r183", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s3" },
  { id: "r184", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s4" },
  { id: "r185", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s5" },
  { id: "r186", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s6" },
  { id: "r187", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s7" },
  { id: "r188", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s8" },
  { id: "r189", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s9" },
  { id: "r190", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s10" },
  { id: "r191", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s11" },
  { id: "r192", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s12" },
  { id: "r193", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s13" },
  { id: "r194", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s14" },
  { id: "r195", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s15" },
  { id: "r196", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s16" },
  { id: "r197", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s17" },
  { id: "r198", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s18" },
  { id: "r199", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s19" },
  { id: "r200", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s20" },
  { id: "r201", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s21" },
  { id: "r202", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s22" },
  { id: "r203", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s23" },
  { id: "r204", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s24" },
  { id: "r205", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s25" },
  { id: "r206", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s26" },
  { id: "r207", surveyId: "survey1", questionId: "q5", rating: 3, studentId: "s27" },
  { id: "r208", surveyId: "survey1", questionId: "q5", rating: 2, studentId: "s28" },
  { id: "r209", surveyId: "survey1", questionId: "q5", rating: 2, studentId: "s29" },
  { id: "r210", surveyId: "survey1", questionId: "q5", rating: 2, studentId: "s30" },
  { id: "r211", surveyId: "survey1", questionId: "q5", rating: 2, studentId: "s31" },
  { id: "r212", surveyId: "survey1", questionId: "q5", rating: 2, studentId: "s32" },
  { id: "r213", surveyId: "survey1", questionId: "q5", rating: 2, studentId: "s33" },
  { id: "r214", surveyId: "survey1", questionId: "q5", rating: 2, studentId: "s34" },
  { id: "r215", surveyId: "survey1", questionId: "q5", rating: 2, studentId: "s35" },
  { id: "r216", surveyId: "survey1", questionId: "q5", rating: 2, studentId: "s36" },
  { id: "r217", surveyId: "survey1", questionId: "q5", rating: 2, studentId: "s37" },
  { id: "r218", surveyId: "survey1", questionId: "q5", rating: 2, studentId: "s38" },
  { id: "r219", surveyId: "survey1", questionId: "q5", rating: 2, studentId: "s39" },
  { id: "r220", surveyId: "survey1", questionId: "q5", rating: 2, studentId: "s40" },
  { id: "r221", surveyId: "survey1", questionId: "q5", rating: 2, studentId: "s41" },
  { id: "r222", surveyId: "survey1", questionId: "q5", rating: 2, studentId: "s42" },
  { id: "r223", surveyId: "survey1", questionId: "q5", rating: 1, studentId: "s43" },
  { id: "r224", surveyId: "survey1", questionId: "q5", rating: 1, studentId: "s44" },
  { id: "r225", surveyId: "survey1", questionId: "q5", rating: 1, studentId: "s45" },
]

// Function to generate survey report
const generateSurveyReport = (surveyId: string): SurveyReport | null => {
  const survey = mockSurveys.find((s) => s.id === surveyId)
  if (!survey) return null

  const responses = mockSurveyResponses.filter((r) => r.surveyId === surveyId)
  if (responses.length === 0) return null

  // Get unique student IDs who responded
  const respondedStudentIds = [...new Set(responses.map((r) => r.studentId))]

  // Calculate question-wise ratings and CES scores
  const questionReports = survey.questions.map((question) => {
    const questionResponses = responses.filter((r) => r.questionId === question.id)

    const ratings = {
      1: questionResponses.filter((r) => r.rating === 1).length,
      2: questionResponses.filter((r) => r.rating === 2).length,
      3: questionResponses.filter((r) => r.rating === 3).length,
    }

    // Calculate CES score using the formula: (1*count1 + 2*count2 + 3*count3) / total
    const totalResponses = ratings[1] + ratings[2] + ratings[3]
    const cesScore =
      totalResponses > 0 ? ((1 * ratings[1] + 2 * ratings[2] + 3 * ratings[3]) / totalResponses).toFixed(2) : "0.00"

    return {
      id: question.id,
      text: question.text,
      ratings,
      cesScore: Number(cesScore),
    }
  })

  // Calculate average CES score
  const avgCesScore = questionReports.reduce((sum, q) => sum + q.cesScore, 0) / questionReports.length

  return {
    surveyId,
    facultyName: survey.facultyName,
    subjectCode: survey.subjectCode,
    subjectName: survey.subjectName,
    academicYear: survey.academicYear,
    department: survey.department,
    semester: survey.semester,
    section: survey.section,
    dateOfCES: survey.dateCreated,
    totalStudents: 64, // Mock total students
    respondedStudents: respondedStudentIds.length,
    responseRate: (respondedStudentIds.length / 64) * 100,
    questions: questionReports,
    avgCesScore: Number(avgCesScore.toFixed(2)),
  }
}

export default function CourseEndSurveyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("manage")
  const [surveys, setSurveys] = useState<Survey[]>(mockSurveys)
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [surveyReport, setSurveyReport] = useState<SurveyReport | null>(null)

  // Create survey state
  const [newSurvey, setNewSurvey] = useState<Partial<Survey>>({
    title: "",
    department: "",
    semester: "",
    section: "",
    subjectCode: "",
    subjectName: "",
    facultyName: "",
    academicYear: "",
    questions: [],
  })

  // Report generation state
  const [reportParams, setReportParams] = useState({
    surveyId: "",
    department: "",
    semester: "",
    section: "",
    subjectCode: "",
  })

  // New question state
  const [newQuestion, setNewQuestion] = useState("")

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)

  // User state
  const [user, setUser] = useState<any>(null)

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  // Handle subject selection
  const handleSubjectSelect = (code: string) => {
    const subject = subjects.find((s) => s.code === code)
    if (subject) {
      setNewSurvey({
        ...newSurvey,
        subjectCode: subject.code,
        subjectName: subject.name,
      })
    }
  }

  // Add question to survey
  const handleAddQuestion = () => {
    if (!newQuestion.trim()) {
      toast({
        title: "Error",
        description: "Question text cannot be empty",
        variant: "destructive",
      })
      return
    }

    const question: Question = {
      id: `q${(newSurvey.questions?.length || 0) + 1}`,
      text: newQuestion,
    }

    setNewSurvey({
      ...newSurvey,
      questions: [...(newSurvey.questions || []), question],
    })

    setNewQuestion("")
  }

  // Remove question from survey
  const handleRemoveQuestion = (questionId: string) => {
    setNewSurvey({
      ...newSurvey,
      questions: newSurvey.questions?.filter((q) => q.id !== questionId) || [],
    })
  }

  // Create survey
  const handleCreateSurvey = () => {
    // Validate survey data
    if (
      !newSurvey.title ||
      !newSurvey.department ||
      !newSurvey.semester ||
      !newSurvey.section ||
      !newSurvey.subjectCode ||
      !newSurvey.facultyName ||
      !newSurvey.academicYear ||
      !newSurvey.questions?.length
    ) {
      toast({
        title: "Error",
        description: "Please fill all required fields and add at least one question",
        variant: "destructive",
      })
      return
    }

    // Create new survey
    const survey: Survey = {
      id: `survey${surveys.length + 1}`,
      title: newSurvey.title || "",
      department: newSurvey.department || "",
      semester: newSurvey.semester || "",
      section: newSurvey.section || "",
      subjectCode: newSurvey.subjectCode || "",
      subjectName: newSurvey.subjectName || "",
      facultyName: newSurvey.facultyName || "",
      academicYear: newSurvey.academicYear || "",
      dateCreated: new Date().toISOString().split("T")[0],
      questions: newSurvey.questions || [],
      status: "draft",
    }

    // Add survey to list
    setSurveys([...surveys, survey])

    // Reset form
    setNewSurvey({
      title: "",
      department: "",
      semester: "",
      section: "",
      subjectCode: "",
      subjectName: "",
      facultyName: "",
      academicYear: "",
      questions: [],
    })

    // Close dialog
    setCreateDialogOpen(false)

    toast({
      title: "Success",
      description: "Survey created successfully",
    })
  }

  // Delete survey
  const handleDeleteSurvey = () => {
    if (!selectedSurvey) return

    setSurveys(surveys.filter((s) => s.id !== selectedSurvey.id))
    setSelectedSurvey(null)
    setDeleteDialogOpen(false)

    toast({
      title: "Success",
      description: "Survey deleted successfully",
    })
  }

  // Publish survey
  const handlePublishSurvey = (survey: Survey) => {
    const updatedSurveys = surveys.map((s) => {
      if (s.id === survey.id) {
        return { ...s, status: "published" }
      }
      return s
    })

    setSurveys(updatedSurveys)

    toast({
      title: "Success",
      description: "Survey published successfully",
    })
  }

  // Generate report
  const handleGenerateReport = () => {
    const report = generateSurveyReport(reportParams.surveyId)

    if (!report) {
      toast({
        title: "Error",
        description: "Failed to generate report. No data found.",
        variant: "destructive",
      })
      return
    }

    setSurveyReport(report)
    setReportDialogOpen(false)
    setActiveTab("report")

    toast({
      title: "Success",
      description: "Report generated successfully",
    })
  }

  // Export report as CSV
  const handleExportCSV = () => {
    if (!surveyReport) return

    // Create CSV content
    let csvContent =
      "Faculty Name,Subject Code,Subject Name,Academic Year,Department,Semester,Section,Date of CES,Total Students,Responded Students,Response Rate\n"
    csvContent += `${surveyReport.facultyName},${surveyReport.subjectCode},${surveyReport.subjectName},${surveyReport.academicYear},${surveyReport.department},${surveyReport.semester},${surveyReport.section},${surveyReport.dateOfCES},${surveyReport.totalStudents},${surveyReport.respondedStudents},${surveyReport.responseRate.toFixed(2)}%\n\n`

    csvContent += "Question,#1 Rating,#2 Rating,#3 Rating,CES Score\n"

    surveyReport.questions.forEach((q, index) => {
      csvContent += `Q${index + 1}. ${q.text},${q.ratings[1]},${q.ratings[2]},${q.ratings[3]},${q.cesScore.toFixed(2)}\n`
    })

    csvContent += `\nAverage CES Score,${surveyReport.avgCesScore.toFixed(2)}`

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `CES_Report_${surveyReport.subjectCode}_${surveyReport.semester}_${surveyReport.section}.csv`,
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Success",
      description: "Report exported successfully",
    })
  }

  // Check if user has access to this page
  const hasAccess = user && ["faculty", "hod", "admin", "coordinator", "principal"].includes(user.role)

  if (!user) {
    return <div>Loading...</div>
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Course End Survey</h1>
          <p className="text-muted-foreground">Create and manage course end surveys for your courses</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Survey
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Course End Survey</DialogTitle>
              <DialogDescription>Fill in the details below to create a new course end survey</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Survey Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter survey title"
                    value={newSurvey.title}
                    onChange={(e) => setNewSurvey({ ...newSurvey, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="faculty">Faculty Name</Label>
                  <Input
                    id="faculty"
                    placeholder="Enter faculty name"
                    value={newSurvey.facultyName}
                    onChange={(e) => setNewSurvey({ ...newSurvey, facultyName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={newSurvey.department}
                    onValueChange={(value) => setNewSurvey({ ...newSurvey, department: value })}
                  >
                    <SelectTrigger id="department">
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
                <div className="space-y-2">
                  <Label htmlFor="academic-year">Academic Year</Label>
                  <Input
                    id="academic-year"
                    placeholder="e.g., 2024-2025-ODD"
                    value={newSurvey.academicYear}
                    onChange={(e) => setNewSurvey({ ...newSurvey, academicYear: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select
                    value={newSurvey.semester}
                    onValueChange={(value) => setNewSurvey({ ...newSurvey, semester: value })}
                  >
                    <SelectTrigger id="semester">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem} value={sem}>
                          {sem}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Select
                    value={newSurvey.section}
                    onValueChange={(value) => setNewSurvey({ ...newSurvey, section: value })}
                  >
                    <SelectTrigger id="section">
                      <SelectValue placeholder="Select section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((sec) => (
                        <SelectItem key={sec} value={sec}>
                          {sec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={newSurvey.subjectCode} onValueChange={handleSubjectSelect}>
                    <SelectTrigger id="subject">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.code} value={subject.code}>
                          {subject.code} - {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Survey Questions (3-Star Rating)</Label>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                    <Star className="h-3 w-3 fill-current" />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Textarea
                    placeholder="Enter question text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleAddQuestion}>
                    Add
                  </Button>
                </div>

                {newSurvey.questions && newSurvey.questions.length > 0 ? (
                  <div className="border rounded-md p-4 mt-2">
                    <h4 className="font-medium mb-2">Added Questions:</h4>
                    <ul className="space-y-2">
                      {newSurvey.questions.map((q, index) => (
                        <li key={q.id} className="flex justify-between items-center">
                          <span>
                            <span className="font-medium">Q{index + 1}.</span> {q.text}
                          </span>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveQuestion(q.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground">
                    No questions added yet
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSurvey}>Create Survey</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage">Manage Surveys</TabsTrigger>
          <TabsTrigger value="report" disabled={!surveyReport}>
            View Report
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Course End Surveys</CardTitle>
              <CardDescription>Manage your existing surveys or generate reports</CardDescription>
            </CardHeader>
            <CardContent>
              {surveys.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Date Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {surveys.map((survey) => (
                      <TableRow key={survey.id}>
                        <TableCell className="font-medium">{survey.title}</TableCell>
                        <TableCell>{survey.subjectCode}</TableCell>
                        <TableCell>{survey.department}</TableCell>
                        <TableCell>{survey.semester}</TableCell>
                        <TableCell>{survey.section}</TableCell>
                        <TableCell>{survey.dateCreated}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              survey.status === "published"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : survey.status === "completed"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                            }
                          >
                            {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {survey.status === "draft" && (
                              <Button variant="outline" size="sm" onClick={() => handlePublishSurvey(survey)}>
                                Publish
                              </Button>
                            )}

                            {survey.status === "completed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const report = generateSurveyReport(survey.id)
                                  if (report) {
                                    setSurveyReport(report)
                                    setActiveTab("report")
                                  }
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Report
                              </Button>
                            )}

                            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive"
                                  onClick={() => setSelectedSurvey(survey)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the survey and all
                                    associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDeleteSurvey}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center p-8 border border-dashed rounded-md">
                  <p className="text-muted-foreground mb-4">No surveys found</p>
                  <Button onClick={() => setCreateDialogOpen(true)}>Create Your First Survey</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Generate Survey Report</CardTitle>
              <CardDescription>Select a survey to generate a detailed report</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full">Generate Report</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate Course End Survey Report</DialogTitle>
                    <DialogDescription>Select the survey details to generate a report</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="report-survey">Select Survey</Label>
                      <Select
                        value={reportParams.surveyId}
                        onValueChange={(value) => setReportParams({ ...reportParams, surveyId: value })}
                      >
                        <SelectTrigger id="report-survey">
                          <SelectValue placeholder="Select survey" />
                        </SelectTrigger>
                        <SelectContent>
                          {surveys
                            .filter((s) => s.status === "completed")
                            .map((survey) => (
                              <SelectItem key={survey.id} value={survey.id}>
                                {survey.title} - {survey.subjectCode}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleGenerateReport}>Generate Report</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report">
          {!surveyReport ? (
            <Card>
              <CardHeader>
                <CardTitle>View Course End Survey Report</CardTitle>
                <CardDescription>Select filters and generate a report to view results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="filter-department">Department</Label>
                    <Select
                      value={reportParams.department}
                      onValueChange={(value) => setReportParams({ ...reportParams, department: value })}
                    >
                      <SelectTrigger id="filter-department">
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
                  <div className="space-y-2">
                    <Label htmlFor="filter-semester">Semester</Label>
                    <Select
                      value={reportParams.semester}
                      onValueChange={(value) => setReportParams({ ...reportParams, semester: value })}
                    >
                      <SelectTrigger id="filter-semester">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.map((sem) => (
                          <SelectItem key={sem} value={sem}>
                            {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-subject">Subject</Label>
                    <Select
                      value={reportParams.subjectCode}
                      onValueChange={(value) => setReportParams({ ...reportParams, subjectCode: value })}
                    >
                      <SelectTrigger id="filter-subject">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.code} value={subject.code}>
                            {subject.code} - {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filter-section">Section</Label>
                    <Select
                      value={reportParams.section}
                      onValueChange={(value) => setReportParams({ ...reportParams, section: value })}
                    >
                      <SelectTrigger id="filter-section">
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((sec) => (
                          <SelectItem key={sec} value={sec}>
                            {sec}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      // Find surveys matching the filter criteria
                      const filteredSurveys = surveys.filter(
                        (s) =>
                          (!reportParams.department || s.department === reportParams.department) &&
                          (!reportParams.semester || s.semester === reportParams.semester) &&
                          (!reportParams.subjectCode || s.subjectCode === reportParams.subjectCode) &&
                          (!reportParams.section || s.section === reportParams.section) &&
                          s.status === "completed",
                      )

                      if (filteredSurveys.length > 0) {
                        // Use the first matching survey for the report
                        const report = generateSurveyReport(filteredSurveys[0].id)
                        if (report) {
                          setSurveyReport(report)
                          toast({
                            title: "Success",
                            description: "Report generated successfully",
                          })
                        } else {
                          toast({
                            title: "Error",
                            description: "Failed to generate report. No data found.",
                            variant: "destructive",
                          })
                        }
                      } else {
                        toast({
                          title: "Error",
                          description: "No completed surveys found for the selected criteria.",
                          variant: "destructive",
                        })
                      }
                    }}
                  >
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-none print:shadow-none">
              <CardContent className="p-0 print:p-0">
                <div className="bg-white dark:bg-background p-6 rounded-lg shadow-sm print:shadow-none">
                  <div className="flex justify-between items-center mb-6 print:mb-4">
                    <h2 className="text-2xl font-bold">Course End Survey Report</h2>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSurveyReport(null)}
                        className="print:hidden"
                      >
                        Back to Filters
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => window.print()} className="print:hidden">
                        <FileText className="h-4 w-4 mr-1" />
                        Print
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleExportCSV} className="print:hidden">
                        <FileSpreadsheet className="h-4 w-4 mr-1" />
                        Export CSV
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden mb-6 print:mb-4">
                    <div className="bg-muted/50 p-3 border-b">
                      <h3 className="font-semibold">Faculty Details</h3>
                    </div>
                    <div className="divide-y">
                      <div className="grid grid-cols-2 divide-x">
                        <div className="p-3 flex">
                          <span className="font-medium w-40">Faculty Name</span>
                          <span>{surveyReport.facultyName}</span>
                        </div>
                        <div className="p-3 flex">
                          <span className="font-medium w-40">Subject Code and Name</span>
                          <span>
                            {surveyReport.subjectCode} {surveyReport.subjectName}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 divide-x">
                        <div className="p-3 flex">
                          <span className="font-medium w-40">Academic Year and Date of CES</span>
                          <span>
                            {surveyReport.academicYear}, {surveyReport.dateOfCES}
                          </span>
                        </div>
                        <div className="p-3 flex">
                          <span className="font-medium w-40">Department</span>
                          <span>{surveyReport.department}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 divide-x">
                        <div className="p-3 flex">
                          <span className="font-medium w-40">Semester</span>
                          <span>{surveyReport.semester}</span>
                        </div>
                        <div className="p-3 flex">
                          <span className="font-medium w-40">Section</span>
                          <span>{surveyReport.section}</span>
                        </div>
                      </div>
                      <div className="p-3 flex">
                        <span className="font-medium w-40">Total Number of Students Given CES</span>
                        <span>
                          {surveyReport.respondedStudents} Out of {surveyReport.totalStudents} (
                          {surveyReport.responseRate.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg overflow-hidden mb-6 print:mb-4">
                    <div className="bg-muted/50 p-3 border-b">
                      <h3 className="font-semibold">Question Wise Analysis</h3>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[60%]">Questions</TableHead>
                          <TableHead className="text-center">#1 rating</TableHead>
                          <TableHead className="text-center">#2 rating</TableHead>
                          <TableHead className="text-center">#3 rating</TableHead>
                          <TableHead className="text-center">CES Score</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {surveyReport.questions.map((question, index) => (
                          <TableRow key={question.id}>
                            <TableCell>
                              <span className="font-medium">Q{index + 1}.</span> {question.text}
                            </TableCell>
                            <TableCell className="text-center">{question.ratings[1]}</TableCell>
                            <TableCell className="text-center">{question.ratings[2]}</TableCell>
                            <TableCell className="text-center">{question.ratings[3]}</TableCell>
                            <TableCell className="text-center">{question.cesScore.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={4} className="text-right font-semibold">
                            Avg. CES Score
                          </TableCell>
                          <TableCell className="text-center font-semibold">
                            {surveyReport.avgCesScore.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div className="grid grid-cols-2 gap-6 print:grid-cols-2">
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-4">Faculty Signature</h3>
                      <div className="h-16 border-b border-dashed"></div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h3 className="font-semibold mb-4">Signature of HoD</h3>
                      <div className="h-16 border-b border-dashed"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
