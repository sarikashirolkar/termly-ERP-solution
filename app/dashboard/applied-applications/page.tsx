"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Search, Filter, Eye, Download } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ReminderButtons } from "@/components/reminder-buttons"
import { SingleReminderButton } from "@/components/single-reminder-button"
import type { EmailRecipient } from "@/lib/email-service"

// Types
type LeaveType = "CL" | "RH" | "OOD" | "CO" | "SL" | "LWP" | "EL"

type LeaveApplication = {
  id: string
  startDate: Date
  endDate: Date
  days: number
  reason: string
  type: LeaveType
  replacementFaculty: string[]
  sendTo: "hod" | "principal" | "both"
  status: "pending" | "approved" | "rejected" | "approved_by_hod"
  comments?: string
  createdAt: Date
  applicantId?: string
  applicantName?: string
  applicantDepartment?: string
  hodApproval?: {
    status: "pending" | "approved" | "rejected"
    comments?: string
    timestamp?: Date
  }
  principalApproval?: {
    status: "pending" | "approved" | "rejected"
    comments?: string
    timestamp?: Date
  }
}

type CommonLetterApplication = {
  id: string
  subject: string
  message: string
  recipients?: ("proctor" | "hod" | "principal")[]
  sendTo?: "hod" | "principal" | "both"
  status: "pending" | "approved" | "rejected"
  comments?: string
  createdAt: Date
  applicantId?: string
  applicantName?: string
  applicantDepartment?: string
  studentId?: string
  studentName?: string
  studentDepartment?: string
  studentSemester?: number
  currentApprover?: "proctor" | "hod" | "principal"
  approvalFlow?: {
    proctor?: {
      status: "pending" | "approved" | "rejected"
      comments?: string
      timestamp?: Date
    }
    hod?: {
      status: "pending" | "approved" | "rejected"
      comments?: string
      timestamp?: Date
    }
    principal?: {
      status: "pending" | "approved" | "rejected"
      comments?: string
      timestamp?: Date
    }
  }
}

// Mock data for applications
const applications = [
  {
    id: "APP001",
    studentId: "STU001",
    studentName: "John Doe",
    email: "john.doe@example.com",
    formType: "Leave Application",
    submissionDate: "2023-05-15",
    status: "Pending",
  },
  {
    id: "APP002",
    studentId: "STU002",
    studentName: "Jane Smith",
    email: "jane.smith@example.com",
    formType: "Certificate Request",
    submissionDate: "2023-05-14",
    status: "Approved",
  },
  {
    id: "APP003",
    studentId: "STU003",
    studentName: "Michael Johnson",
    email: "michael.johnson@example.com",
    formType: "Scholarship Application",
    submissionDate: "2023-05-13",
    status: "Rejected",
  },
  {
    id: "APP004",
    studentId: "STU004",
    studentName: "Emily Brown",
    email: "emily.brown@example.com",
    formType: "Leave Application",
    submissionDate: "2023-05-12",
    status: "Pending",
  },
  {
    id: "APP005",
    studentId: "STU005",
    studentName: "David Wilson",
    email: "david.wilson@example.com",
    formType: "Certificate Request",
    submissionDate: "2023-05-11",
    status: "Pending",
  },
]

export default function AppliedApplicationsPage() {
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([])
  const [commonLetters, setCommonLetters] = useState<CommonLetterApplication[]>([])
  const [selectedApplication, setSelectedApplication] = useState<LeaveApplication | CommonLetterApplication | null>(
    null,
  )
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [comments, setComments] = useState("")
  const [action, setAction] = useState<"approve" | "reject">("approve")
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")
  const [activeTab, setActiveTab] = useState<"leave" | "letter">("leave")
  const [filteredLeaveApplications, setFilteredLeaveApplications] = useState<LeaveApplication[]>([])
  const [filteredCommonLetters, setFilteredCommonLetters] = useState<CommonLetterApplication[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredApplications, setFilteredApplications] = useState(applications)
  const [pendingRecipients, setPendingRecipients] = useState<EmailRecipient[]>([])

  // Load user data and applications
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  useEffect(() => {
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.formType.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (activeTab !== "all") {
      filtered = filtered.filter((app) => app.status.toLowerCase() === activeTab.toLowerCase())
    }

    setFilteredApplications(filtered)

    const pending = applications
      .filter((app) => app.status.toLowerCase() === "pending")
      .map((app) => ({
        id: app.studentId,
        name: app.studentName,
        email: app.email,
      }))

    setPendingRecipients(pending)
  }, [searchTerm, activeTab])

  const handleAction = () => {
    setActionDialogOpen(false)
    setComments("")

    toast({
      title: action === "approve" ? "Application Approved" : "Application Rejected",
      description: `The application has been ${action}d successfully.`,
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      case "approved_by_hod":
        return <Badge className="bg-blue-500">Approved by HOD</Badge>
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Applied Applications</CardTitle>
              <CardDescription>View and manage all student applications</CardDescription>
            </div>
            <ReminderButtons recipients={pendingRecipients} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search applications..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Form Type</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.length > 0 ? (
                      filteredApplications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell>{application.id}</TableCell>
                          <TableCell>{application.studentName}</TableCell>
                          <TableCell>{application.formType}</TableCell>
                          <TableCell>{application.submissionDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                application.status === "Approved"
                                  ? "default"
                                  : application.status === "Rejected"
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {application.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View details</span>
                              </Button>

                              {application.status === "Pending" && (
                                <SingleReminderButton
                                  recipient={{
                                    id: application.studentId,
                                    name: application.studentName,
                                    email: application.email,
                                  }}
                                />
                              )}

                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No applications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Form Type</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.length > 0 ? (
                      filteredApplications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell>{application.id}</TableCell>
                          <TableCell>{application.studentName}</TableCell>
                          <TableCell>{application.formType}</TableCell>
                          <TableCell>{application.submissionDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                application.status === "Approved"
                                  ? "default"
                                  : application.status === "Rejected"
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {application.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View details</span>
                              </Button>

                              {application.status === "Pending" && (
                                <SingleReminderButton
                                  recipient={{
                                    id: application.studentId,
                                    name: application.studentName,
                                    email: application.email,
                                  }}
                                />
                              )}

                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No applications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Form Type</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.length > 0 ? (
                      filteredApplications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell>{application.id}</TableCell>
                          <TableCell>{application.studentName}</TableCell>
                          <TableCell>{application.formType}</TableCell>
                          <TableCell>{application.submissionDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                application.status === "Approved"
                                  ? "default"
                                  : application.status === "Rejected"
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {application.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View details</span>
                              </Button>

                              {application.status === "Pending" && (
                                <SingleReminderButton
                                  recipient={{
                                    id: application.studentId,
                                    name: application.studentName,
                                    email: application.email,
                                  }}
                                />
                              )}

                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No applications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Application ID</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Form Type</TableHead>
                      <TableHead>Submission Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.length > 0 ? (
                      filteredApplications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell>{application.id}</TableCell>
                          <TableCell>{application.studentName}</TableCell>
                          <TableCell>{application.formType}</TableCell>
                          <TableCell>{application.submissionDate}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                application.status === "Approved"
                                  ? "default"
                                  : application.status === "Rejected"
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {application.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View details</span>
                              </Button>

                              {application.status === "Pending" && (
                                <SingleReminderButton
                                  recipient={{
                                    id: application.studentId,
                                    name: application.studentName,
                                    email: application.email,
                                  }}
                                />
                              )}

                              <Button variant="ghost" size="icon">
                                <Download className="h-4 w-4" />
                                <span className="sr-only">Download</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No applications found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>

          <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{action === "approve" ? "Approve Application" : "Reject Application"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Comments (Optional)</h4>
                  <Textarea
                    placeholder="Add your comments here..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>

                <p className="text-sm text-muted-foreground">
                  {action === "approve"
                    ? "By approving this application, you confirm that the request meets all requirements and can be processed."
                    : "Please provide a reason for rejecting this application to help the applicant understand your decision."}
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAction} variant={action === "approve" ? "default" : "destructive"}>
                  {action === "approve" ? "Approve" : "Reject"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
