"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  BarChart3,
  FileText,
  Copy,
  Send,
  Search,
  X,
  GraduationCap,
  BookOpen,
  CheckCircle2,
  XCircle,
  Download,
  Mail,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FormQuestion {
  id: string
  type: "text" | "textarea" | "radio" | "checkbox" | "select" | "rating" | "date"
  question: string
  required: boolean
  options?: string[]
}

interface Student {
  id: string
  name: string
  email: string
  usn: string
  semester: string
  section: string
  department: string
  hasResponded: boolean
}

interface Form {
  id: string
  title: string
  description: string
  category: string
  status: "draft" | "active" | "closed"
  createdAt: string
  dueDate?: string
  isRequired: boolean
  estimatedTime: number
  questions: FormQuestion[]
  responses: number
  totalStudents: number
  createdBy: string
  targetSemesters?: string[]
  targetSections?: string[]
  targetSubject?: string
  academicYear?: string
  students?: Student[]
}

interface PublishFormData {
  semesters: string[]
  sections: string[]
  subject: string
}

export default function FormsPage() {
  const { toast } = useToast()
  const [forms, setForms] = useState<Form[]>([])
  const [filteredForms, setFilteredForms] = useState<Form[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<Form | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string>("")
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false)
  const [publishingForm, setPublishingForm] = useState<Form | null>(null)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [previewingForm, setPreviewingForm] = useState<Form | null>(null)
  const [isResponsesDialogOpen, setIsResponsesDialogOpen] = useState(false)
  const [viewingResponsesForm, setViewingResponsesForm] = useState<Form | null>(null)
  const [currentAcademicYear, setCurrentAcademicYear] = useState("")
  const [responseTab, setResponseTab] = useState("responses")

  // Publishing form data
  const [publishFormData, setPublishFormData] = useState<PublishFormData>({
    semesters: [],
    sections: [],
    subject: "",
  })

  // Form creation state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    dueDate: "",
    isRequired: false,
    estimatedTime: 5,
    questions: [] as FormQuestion[],
  })

  const [newQuestion, setNewQuestion] = useState<FormQuestion>({
    id: "",
    type: "text",
    question: "",
    required: false,
    options: [],
  })

  // Mock subjects data
  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Computer Science",
    "Electronics",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Information Technology",
    "Data Structures",
    "Algorithms",
    "Database Management",
    "Software Engineering",
    "Operating Systems",
    "Computer Networks",
  ]

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const userData = JSON.parse(storedUser)
      setUser(userData)
      setUserRole(userData.role || "faculty")
    }

    // Set current academic year
    setCurrentAcademicYear(getCurrentAcademicYear())

    // Load mock forms
    loadMockForms()
  }, [])

  useEffect(() => {
    // Filter forms based on search and status
    let filtered = forms

    if (searchTerm) {
      filtered = filtered.filter(
        (form) =>
          form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          form.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((form) => form.status === statusFilter)
    }

    setFilteredForms(filtered)
  }, [forms, searchTerm, statusFilter])

  const getCurrentAcademicYear = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // JavaScript months are 0-indexed

    // Academic year typically starts in July/August
    if (currentMonth >= 7) {
      // July onwards is the start of new academic year
      return `${currentYear}-${(currentYear + 1).toString().slice(-2)} Odd`
    } else {
      // January to June is the even semester of previous academic year
      return `${currentYear - 1}-${currentYear.toString().slice(-2)} Even`
    }
  }

  // Generate mock students
  const generateMockStudents = (count: number, respondedCount: number): Student[] => {
    const students: Student[] = []
    const sections = ["A", "B", "C"]
    const semesters = ["3rd Sem", "5th Sem", "7th Sem"]
    const departments = ["CSE", "ECE", "ME", "CE", "EEE"]

    for (let i = 1; i <= count; i++) {
      const hasResponded = i <= respondedCount
      students.push({
        id: `STU${1000 + i}`,
        name: `Student ${i}`,
        email: `student${i}@example.com`,
        usn: `1MS21CS${100 + i}`,
        semester: semesters[Math.floor(Math.random() * semesters.length)],
        section: sections[Math.floor(Math.random() * sections.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        hasResponded,
      })
    }

    return students
  }

  const loadMockForms = () => {
    const mockForms: Form[] = [
      {
        id: "1",
        title: "Course Feedback Survey",
        description: "Please provide feedback on the course content and teaching methodology",
        category: "Academic Survey",
        status: "active",
        createdAt: "2024-01-15",
        dueDate: "2024-02-15",
        isRequired: true,
        estimatedTime: 10,
        questions: [
          {
            id: "q1",
            type: "rating",
            question: "How would you rate the course content?",
            required: true,
          },
          {
            id: "q2",
            type: "textarea",
            question: "What improvements would you suggest?",
            required: false,
          },
        ],
        responses: 45,
        totalStudents: 60,
        createdBy: "Dr. Smith",
        academicYear: "2024-25 Odd",
        targetSemesters: ["3rd Sem"],
        targetSections: ["A", "B"],
        targetSubject: "Computer Science",
        students: generateMockStudents(60, 45),
      },
      {
        id: "2",
        title: "Library Services Feedback",
        description: "Help us improve our library services by providing your feedback",
        category: "Institutional Survey",
        status: "active",
        createdAt: "2024-01-10",
        dueDate: "2024-02-20",
        isRequired: false,
        estimatedTime: 5,
        questions: [
          {
            id: "q1",
            type: "radio",
            question: "How often do you use the library?",
            required: true,
            options: ["Daily", "Weekly", "Monthly", "Rarely"],
          },
        ],
        responses: 23,
        totalStudents: 60,
        createdBy: "Library Staff",
        academicYear: "2024-25 Odd",
        targetSemesters: ["1st Sem", "2nd Sem", "3rd Sem"],
        students: generateMockStudents(60, 23),
      },
      {
        id: "3",
        title: "Event Registration Form",
        description: "Register for the upcoming tech symposium",
        category: "Event Registration",
        status: "draft",
        createdAt: "2024-01-20",
        dueDate: "2024-03-01",
        isRequired: false,
        estimatedTime: 3,
        questions: [],
        responses: 0,
        totalStudents: 60,
        createdBy: "Event Committee",
        students: generateMockStudents(60, 0),
      },
    ]
    setForms(mockForms)
  }

  const openPublishDialog = (form: Form) => {
    setPublishingForm(form)
    setPublishFormData({
      semesters: [],
      sections: [],
      subject: "",
    })
    setIsPublishDialogOpen(true)
  }

  const handleSemesterChange = (semester: string, checked: boolean) => {
    if (userRole === "faculty") {
      // Faculty can only select one semester
      setPublishFormData({
        ...publishFormData,
        semesters: checked ? [semester] : [],
        sections: [], // Reset sections when semester changes
        subject: "", // Reset subject when semester changes
      })
    } else {
      // Coordinator can select multiple semesters
      const updatedSemesters = checked
        ? [...publishFormData.semesters, semester]
        : publishFormData.semesters.filter((s) => s !== semester)

      setPublishFormData({
        ...publishFormData,
        semesters: updatedSemesters,
      })
    }
  }

  const handleSectionChange = (section: string, checked: boolean) => {
    const updatedSections = checked
      ? [...publishFormData.sections, section]
      : publishFormData.sections.filter((s) => s !== section)

    setPublishFormData({
      ...publishFormData,
      sections: updatedSections,
    })
  }

  const canPublishForm = () => {
    if (userRole === "faculty") {
      return (
        publishFormData.semesters.length === 1 &&
        publishFormData.sections.length > 0 &&
        publishFormData.subject.trim() !== ""
      )
    } else {
      return publishFormData.semesters.length > 0
    }
  }

  const handlePublishForm = () => {
    if (!canPublishForm()) {
      const errorMessage =
        userRole === "faculty"
          ? "Please select one semester, at least one section, and a subject"
          : "Please select at least one semester"

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return
    }

    if (!publishingForm) return

    const updatedForm = {
      ...publishingForm,
      status: "active" as const,
      targetSemesters: publishFormData.semesters,
      targetSections: userRole === "faculty" ? publishFormData.sections : undefined,
      targetSubject: userRole === "faculty" ? publishFormData.subject : undefined,
      academicYear: currentAcademicYear,
    }

    setForms(forms.map((form) => (form.id === publishingForm.id ? updatedForm : form)))
    setIsPublishDialogOpen(false)
    setPublishingForm(null)

    const successMessage =
      userRole === "faculty"
        ? `Form published to ${publishFormData.semesters[0]}, sections ${publishFormData.sections.join(", ")} for ${publishFormData.subject}`
        : `Form published to ${publishFormData.semesters.length} semester(s) for ${currentAcademicYear}`

    toast({
      title: "Form published",
      description: successMessage,
    })
  }

  const openPreviewDialog = (form: Form) => {
    setPreviewingForm(form)
    setIsPreviewDialogOpen(true)
  }

  const openEditDialog = (form: Form) => {
    setEditingForm(form)
    setFormData({
      title: form.title,
      description: form.description,
      category: form.category,
      dueDate: form.dueDate || "",
      isRequired: form.isRequired,
      estimatedTime: form.estimatedTime,
      questions: form.questions,
    })
    setIsCreateDialogOpen(true)
  }

  const openResponsesDialog = (form: Form) => {
    setViewingResponsesForm(form)
    setResponseTab("responses")
    setIsResponsesDialogOpen(true)
  }

  const handleCreateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a form title",
        variant: "destructive",
      })
      return
    }

    if (editingForm) {
      // Update existing form
      setForms(
        forms.map((form) =>
          form.id === editingForm.id
            ? {
                ...form,
                title: formData.title,
                description: formData.description,
                category: formData.category || "General",
                dueDate: formData.dueDate,
                isRequired: formData.isRequired,
                estimatedTime: formData.estimatedTime,
                questions: formData.questions,
              }
            : form,
        ),
      )

      toast({
        title: "Form updated",
        description: "Your form has been updated successfully",
      })
    } else {
      // Create new form
      const newForm: Form = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        category: formData.category || "General",
        status: "draft",
        createdAt: new Date().toISOString().split("T")[0],
        dueDate: formData.dueDate,
        isRequired: formData.isRequired,
        estimatedTime: formData.estimatedTime,
        questions: formData.questions,
        responses: 0,
        totalStudents: 60,
        createdBy: user?.firstName + " " + user?.lastName || "Unknown",
        students: generateMockStudents(60, 0),
      }

      setForms([newForm, ...forms])

      toast({
        title: "Form created",
        description: "Your form has been created successfully",
      })
    }

    setIsCreateDialogOpen(false)
    setEditingForm(null)
    resetFormData()
  }

  const resetFormData = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      dueDate: "",
      isRequired: false,
      estimatedTime: 5,
      questions: [],
    })
    setNewQuestion({
      id: "",
      type: "text",
      question: "",
      required: false,
      options: [],
    })
  }

  const addQuestion = () => {
    if (!newQuestion.question.trim()) {
      toast({
        title: "Error",
        description: "Please enter a question",
        variant: "destructive",
      })
      return
    }

    const question: FormQuestion = {
      ...newQuestion,
      id: Date.now().toString(),
    }

    setFormData({
      ...formData,
      questions: [...formData.questions, question],
    })

    setNewQuestion({
      id: "",
      type: "text",
      question: "",
      required: false,
      options: [],
    })
  }

  const removeQuestion = (questionId: string) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((q) => q.id !== questionId),
    })
  }

  const duplicateForm = (form: Form) => {
    const duplicatedForm: Form = {
      ...form,
      id: Date.now().toString(),
      title: form.title + " (Copy)",
      status: "draft",
      createdAt: new Date().toISOString().split("T")[0],
      responses: 0,
      students: form.students ? generateMockStudents(form.students.length, 0) : undefined,
    }

    setForms([duplicatedForm, ...forms])

    toast({
      title: "Form duplicated",
      description: "A copy of the form has been created",
    })
  }

  const deleteForm = (formId: string) => {
    setForms(forms.filter((form) => form.id !== formId))

    toast({
      title: "Form deleted",
      description: "The form has been deleted successfully",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "closed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getResponseRate = (responses: number, total: number) => {
    return total > 0 ? Math.round((responses / total) * 100) : 0
  }

  const sendReminder = (studentIds: string[]) => {
    toast({
      title: "Reminders sent",
      description: `Reminders sent to ${studentIds.length} students`,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Forms Management</h1>
          <p className="text-muted-foreground">Create and manage forms for students</p>
          <div className="flex items-center gap-2 mt-2">
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Academic Year: {currentAcademicYear}</span>
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Form
        </Button>
      </div>

      {/* Analytics Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forms.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Forms</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forms.filter((f) => f.status === "active").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{forms.reduce((sum, form) => sum + form.responses, 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forms.length > 0
                ? Math.round(
                    forms.reduce((sum, form) => sum + getResponseRate(form.responses, form.totalStudents), 0) /
                      forms.length,
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Forms List */}
      <div className="grid gap-4">
        {filteredForms.map((form) => (
          <Card key={form.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{form.title}</CardTitle>
                    <Badge className={getStatusColor(form.status)}>{form.status}</Badge>
                    {form.isRequired && <Badge variant="destructive">Required</Badge>}
                  </div>
                  <CardDescription>{form.description}</CardDescription>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Created: {new Date(form.createdAt).toLocaleDateString()}
                    </span>
                    {form.dueDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Due: {new Date(form.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {form.responses}/{form.totalStudents} responses (
                      {getResponseRate(form.responses, form.totalStudents)}%)
                    </span>
                  </div>
                  {form.status === "active" && (
                    <div className="flex items-center gap-4 text-sm">
                      {form.academicYear && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <GraduationCap className="h-4 w-4" />
                          {form.academicYear}
                        </span>
                      )}
                      {form.targetSemesters && (
                        <span className="text-green-600">Semesters: {form.targetSemesters.join(", ")}</span>
                      )}
                      {form.targetSections && (
                        <span className="text-purple-600">Sections: {form.targetSections.join(", ")}</span>
                      )}
                      {form.targetSubject && (
                        <span className="flex items-center gap-1 text-orange-600">
                          <BookOpen className="h-4 w-4" />
                          {form.targetSubject}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {form.status === "draft" && (
                    <Button size="sm" onClick={() => openPublishDialog(form)}>
                      <Send className="h-4 w-4 mr-1" />
                      Publish
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => duplicateForm(form)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openPreviewDialog(form)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(form)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteForm(form.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {form.responses > 0 && (
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm">
                      <span className="font-medium">{form.responses}</span> responses
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{form.totalStudents - form.responses}</span> pending
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => openResponsesDialog(form)}>
                    <BarChart3 className="h-4 w-4 mr-1" />
                    View Responses
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {filteredForms.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No forms found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Create your first form to get started"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Form
            </Button>
          )}
        </div>
      )}

      {/* Create Form Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingForm ? "Edit Form" : "Create New Form"}</DialogTitle>
            <DialogDescription>
              {editingForm ? "Update your form details and questions" : "Create a new form for students to fill out"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="title">Form Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter form title"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter form description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Academic Survey">Academic Survey</SelectItem>
                        <SelectItem value="Institutional Survey">Institutional Survey</SelectItem>
                        <SelectItem value="Event Registration">Event Registration</SelectItem>
                        <SelectItem value="Feedback">Feedback</SelectItem>
                        <SelectItem value="Assessment">Assessment</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="required"
                      checked={formData.isRequired}
                      onCheckedChange={(checked) => setFormData({ ...formData, isRequired: checked })}
                    />
                    <Label htmlFor="required">Required for all students</Label>
                  </div>
                  <div>
                    <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                    <Input
                      id="estimatedTime"
                      type="number"
                      value={formData.estimatedTime}
                      onChange={(e) =>
                        setFormData({ ...formData, estimatedTime: Number.parseInt(e.target.value) || 5 })
                      }
                      min="1"
                      max="120"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Questions</h3>

              {/* Existing Questions */}
              {formData.questions.length > 0 && (
                <div className="space-y-3">
                  {formData.questions.map((question, index) => (
                    <Card key={question.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium">Q{index + 1}</span>
                              <Badge variant="outline">{question.type}</Badge>
                              {question.required && (
                                <Badge variant="destructive" className="text-xs">
                                  Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm">{question.question}</p>
                            {question.options && question.options.length > 0 && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                Options: {question.options.join(", ")}
                              </div>
                            )}
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeQuestion(question.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Add New Question */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add Question</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="questionType">Question Type</Label>
                    <Select
                      value={newQuestion.type}
                      onValueChange={(value: any) => setNewQuestion({ ...newQuestion, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Short Text</SelectItem>
                        <SelectItem value="textarea">Long Text</SelectItem>
                        <SelectItem value="radio">Multiple Choice (Single)</SelectItem>
                        <SelectItem value="checkbox">Multiple Choice (Multiple)</SelectItem>
                        <SelectItem value="select">Dropdown</SelectItem>
                        <SelectItem value="rating">Rating Scale</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="questionText">Question *</Label>
                    <Input
                      id="questionText"
                      value={newQuestion.question}
                      onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                      placeholder="Enter your question"
                    />
                  </div>

                  {(newQuestion.type === "radio" ||
                    newQuestion.type === "checkbox" ||
                    newQuestion.type === "select") && (
                    <div>
                      <Label>Options (one per line)</Label>
                      <Textarea
                        value={newQuestion.options?.join("\n") || ""}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            options: e.target.value.split("\n").filter((opt) => opt.trim()),
                          })
                        }
                        placeholder="Option 1&#10;Option 2&#10;Option 3"
                        rows={4}
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="questionRequired"
                      checked={newQuestion.required}
                      onCheckedChange={(checked) => setNewQuestion({ ...newQuestion, required: checked })}
                    />
                    <Label htmlFor="questionRequired">Required question</Label>
                  </div>

                  <Button onClick={addQuestion} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateForm}>{editingForm ? "Update Form" : "Create Form"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced Publish Form Dialog */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Publish Form</DialogTitle>
            <DialogDescription>
              {userRole === "faculty"
                ? "Select semester, sections, and subject to publish this form to"
                : "Select semesters to publish this form to"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Academic Year Display */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  Academic Year: {currentAcademicYear}
                </span>
              </div>
            </div>

            {/* Semester Selection */}
            <div>
              <Label className="text-base font-medium">Select Semester{userRole === "coordinator" ? "s" : ""} *</Label>
              <p className="text-sm text-muted-foreground mb-3">
                {userRole === "faculty"
                  ? "Choose one semester for your subject"
                  : "Choose multiple semesters for institutional forms"}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {["1st Sem", "2nd Sem", "3rd Sem", "4th Sem", "5th Sem", "6th Sem", "7th Sem", "8th Sem"].map((sem) => (
                  <div key={sem} className="flex items-center space-x-2">
                    <input
                      type={userRole === "faculty" ? "radio" : "checkbox"}
                      id={sem}
                      name={userRole === "faculty" ? "semester" : undefined}
                      checked={publishFormData.semesters.includes(sem)}
                      onChange={(e) => handleSemesterChange(sem, e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor={sem} className="text-sm font-medium">
                      {sem}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Section Selection (Faculty Only) */}
            {userRole === "faculty" && publishFormData.semesters.length > 0 && (
              <div>
                <Label className="text-base font-medium">Select Sections *</Label>
                <p className="text-sm text-muted-foreground mb-3">Choose sections within the selected semester</p>
                <div className="grid grid-cols-3 gap-3">
                  {["A", "B", "C", "D", "E", "F"].map((section) => (
                    <div key={section} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`section-${section}`}
                        checked={publishFormData.sections.includes(section)}
                        onChange={(e) => handleSectionChange(section, e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor={`section-${section}`} className="text-sm font-medium">
                        Section {section}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subject Selection (Faculty Only) */}
            {userRole === "faculty" && publishFormData.sections.length > 0 && (
              <div>
                <Label className="text-base font-medium">Select Subject *</Label>
                <p className="text-sm text-muted-foreground mb-3">Choose the subject this form relates to</p>
                <Select
                  value={publishFormData.subject}
                  onValueChange={(value) => setPublishFormData({ ...publishFormData, subject: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Form Preview */}
            {publishingForm && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  {publishingForm.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">{publishingForm.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span>⏱️ {publishingForm.estimatedTime} min</span>
                  <span>❓ {publishingForm.questions.length} questions</span>
                  {publishingForm.isRequired && <span className="text-red-600">⚠️ Required</span>}
                </div>
              </div>
            )}

            {/* Publish Summary */}
            {canPublishForm() && (
              <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <h5 className="font-medium text-green-900 dark:text-green-100 mb-1">Ready to Publish</h5>
                <div className="text-sm text-green-700 dark:text-green-300">
                  {userRole === "faculty" ? (
                    <>
                      <div>📚 Semester: {publishFormData.semesters[0]}</div>
                      <div>🏫 Sections: {publishFormData.sections.join(", ")}</div>
                      <div>���� Subject: {publishFormData.subject}</div>
                    </>
                  ) : (
                    <div>📚 Semesters: {publishFormData.semesters.join(", ")}</div>
                  )}
                  <div>📅 Academic Year: {currentAcademicYear}</div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePublishForm} disabled={!canPublishForm()}>
              <Send className="h-4 w-4 mr-2" />
              Publish Form
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Form Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Preview</DialogTitle>
            <DialogDescription>This is how the form will appear to students</DialogDescription>
          </DialogHeader>

          {previewingForm && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold">{previewingForm.title}</h2>
                <p className="text-muted-foreground">{previewingForm.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>Estimated time: {previewingForm.estimatedTime} minutes</span>
                  {previewingForm.isRequired && <Badge variant="destructive">Required</Badge>}
                </div>
              </div>

              <div className="space-y-4">
                {previewingForm.questions.map((question, index) => (
                  <Card key={question.id}>
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-sm font-medium">{index + 1}.</span>
                          <div className="flex-1">
                            <p className="font-medium">{question.question}</p>
                            {question.required && <span className="text-red-500 text-sm">*</span>}
                          </div>
                        </div>

                        {question.type === "text" && <Input placeholder="Your answer" disabled />}

                        {question.type === "textarea" && <Textarea placeholder="Your answer" disabled rows={3} />}

                        {question.type === "radio" && question.options && (
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-2">
                                <input type="radio" disabled />
                                <Label>{option}</Label>
                              </div>
                            ))}
                          </div>
                        )}

                        {question.type === "checkbox" && question.options && (
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center space-x-2">
                                <input type="checkbox" disabled />
                                <Label>{option}</Label>
                              </div>
                            ))}
                          </div>
                        )}

                        {question.type === "select" && question.options && (
                          <Select disabled>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                          </Select>
                        )}

                        {question.type === "rating" && (
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <Button key={rating} variant="outline" size="sm" disabled>
                                {rating}
                              </Button>
                            ))}
                          </div>
                        )}

                        {question.type === "date" && <Input type="date" disabled />}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsPreviewDialogOpen(false)}>Close Preview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Enhanced View Responses Dialog with Pending Students */}
      <Dialog open={isResponsesDialogOpen} onOpenChange={setIsResponsesDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Form Responses</DialogTitle>
            <DialogDescription>View responses and manage pending students</DialogDescription>
          </DialogHeader>

          {viewingResponsesForm && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">{viewingResponsesForm.responses}</div>
                    <p className="text-sm text-muted-foreground">Total Responses</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">
                      {getResponseRate(viewingResponsesForm.responses, viewingResponsesForm.totalStudents)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Response Rate</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-2xl font-bold">
                      {viewingResponsesForm.totalStudents - viewingResponsesForm.responses}
                    </div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </CardContent>
                </Card>
              </div>

              <Tabs value={responseTab} onValueChange={setResponseTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="responses">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Responses ({viewingResponsesForm.responses})
                  </TabsTrigger>
                  <TabsTrigger value="pending">
                    <XCircle className="h-4 w-4 mr-2" />
                    Pending Students ({viewingResponsesForm.totalStudents - viewingResponsesForm.responses})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="responses" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Submitted Responses</h3>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Responses
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {viewingResponsesForm.students
                      ?.filter((student) => student.hasResponded)
                      .slice(0, 5)
                      .map((student, index) => (
                        <Card key={student.id}>
                          <CardHeader className="py-3">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-base flex items-center">
                                <Users className="h-4 w-4 mr-2" />
                                {student.name} ({student.usn})
                              </CardTitle>
                              <Badge variant="outline">
                                {student.semester} | Section {student.section}
                              </Badge>
                            </div>
                            <CardDescription>
                              Submitted on {new Date().toLocaleDateString()} at{" "}
                              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {viewingResponsesForm.questions.slice(0, 2).map((question, qIndex) => (
                                <div key={question.id}>
                                  <p className="font-medium text-sm">{question.question}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {question.type === "rating"
                                      ? `Rating: ${Math.floor(Math.random() * 5) + 1}/5`
                                      : `Sample answer for question ${qIndex + 1} from ${student.name}`}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>

                  {viewingResponsesForm.responses > 5 && (
                    <div className="text-center mt-4">
                      <Button variant="outline">View All {viewingResponsesForm.responses} Responses</Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="pending" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Pending Students</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const pendingStudents = viewingResponsesForm.students?.filter(
                            (student) => !student.hasResponded,
                          )
                          sendReminder(pendingStudents?.map((s) => s.id) || [])
                        }}
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Reminders
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export List
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-md">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-3 font-medium">Student</th>
                          <th className="text-left p-3 font-medium">USN</th>
                          <th className="text-left p-3 font-medium">Semester</th>
                          <th className="text-left p-3 font-medium">Section</th>
                          <th className="text-left p-3 font-medium">Department</th>
                          <th className="text-right p-3 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingResponsesForm.students
                          ?.filter((student) => !student.hasResponded)
                          .slice(0, 10)
                          .map((student) => (
                            <tr key={student.id} className="border-b">
                              <td className="p-3">{student.name}</td>
                              <td className="p-3">{student.usn}</td>
                              <td className="p-3">{student.semester}</td>
                              <td className="p-3">Section {student.section}</td>
                              <td className="p-3">{student.department}</td>
                              <td className="p-3 text-right">
                                <Button variant="ghost" size="sm" onClick={() => sendReminder([student.id])}>
                                  <Mail className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {viewingResponsesForm.totalStudents - viewingResponsesForm.responses > 10 && (
                    <div className="text-center mt-4">
                      <Button variant="outline">
                        View All {viewingResponsesForm.totalStudents - viewingResponsesForm.responses} Pending Students
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsResponsesDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
