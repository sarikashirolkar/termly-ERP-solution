"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, FileText, Calendar } from "lucide-react"

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
  applicantId: string
  applicantName: string
  applicantDepartment: string
  hodApproval?: {
    status: "approved" | "rejected"
    comments?: string
    timestamp: Date
  }
  principalApproval?: {
    status: "approved" | "rejected"
    comments?: string
    timestamp: Date
  }
}

type CommonLetterApplication = {
  id: string
  subject: string
  message: string
  recipients: ("proctor" | "hod" | "principal")[]
  status: "pending" | "approved" | "rejected"
  comments?: string
  createdAt: Date
  studentId?: string
  studentName?: string
  studentDepartment?: string
  studentSemester?: number
  applicantId?: string
  applicantName?: string
  applicantDepartment?: string
  currentApprover?: "proctor" | "hod" | "principal"
  approvalFlow: {
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

export default function AppliedApplications() {
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [leaveApplications, setLeaveApplications] = useState<LeaveApplication[]>([])
  const [commonLetters, setCommonLetters] = useState<CommonLetterApplication[]>([])
  const [activeTab, setActiveTab] = useState<"leave" | "letter">("leave")
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")

  // Load user data and applications
  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    // Load leave applications
    const storedApplications = localStorage.getItem("applications")
    if (storedApplications) {
      try {
        const parsedApplications = JSON.parse(storedApplications).map((app: any) => ({
          ...app,
          startDate: new Date(app.startDate),
          endDate: new Date(app.endDate),
          createdAt: new Date(app.createdAt),
          hodApproval: app.hodApproval
            ? {
                ...app.hodApproval,
                timestamp: new Date(app.hodApproval.timestamp),
              }
            : undefined,
          principalApproval: app.principalApproval
            ? {
                ...app.principalApproval,
                timestamp: new Date(app.principalApproval.timestamp),
              }
            : undefined,
        }))
        setLeaveApplications(parsedApplications)
      } catch (error) {
        console.error("Error parsing applications:", error)
      }
    }

    // Load common letters
    const storedLetters = localStorage.getItem("student-common-letters")
    if (storedLetters) {
      try {
        const parsedLetters = JSON.parse(storedLetters).map((letter: any) => ({
          ...letter,
          createdAt: new Date(letter.createdAt),
          approvalFlow: {
            ...letter.approvalFlow,
            proctor: letter.approvalFlow?.proctor
              ? {
                  ...letter.approvalFlow.proctor,
                  timestamp: letter.approvalFlow.proctor.timestamp
                    ? new Date(letter.approvalFlow.proctor.timestamp)
                    : undefined,
                }
              : undefined,
            hod: letter.approvalFlow?.hod
              ? {
                  ...letter.approvalFlow.hod,
                  timestamp: letter.approvalFlow.hod.timestamp
                    ? new Date(letter.approvalFlow.hod.timestamp)
                    : undefined,
                }
              : undefined,
            principal: letter.approvalFlow?.principal
              ? {
                  ...letter.approvalFlow.principal,
                  timestamp: letter.approvalFlow.principal.timestamp
                    ? new Date(letter.approvalFlow.principal.timestamp)
                    : undefined,
                }
              : undefined,
          },
        }))
        setCommonLetters(parsedLetters)
      } catch (error) {
        console.error("Error parsing letters:", error)
      }
    }
  }, [])

  // Get filtered applications based on user and filter
  const getFilteredLeaveApplications = () => {
    if (!user) return []

    return leaveApplications.filter((app) => {
      // Filter by applicant
      const isApplicant = app.applicantId === user.id

      // Filter by status
      const matchesStatus =
        filter === "all" || app.status === filter || (filter === "approved" && app.status === "approved_by_hod")

      return isApplicant && matchesStatus
    })
  }

  // Get filtered letters based on user and filter
  const getFilteredCommonLetters = () => {
    if (!user) return []

    return commonLetters.filter((letter) => {
      // Filter by applicant (student or faculty)
      const isApplicant =
        (user.role === "student" && letter.studentId === user.id) ||
        (user.role !== "student" && letter.applicantId === user.id)

      // Filter by status - for letters, check the overall status or the relevant approval flow status
      let matchesStatus = filter === "all"

      if (filter === "pending") {
        matchesStatus = letter.status === "pending"
      } else if (filter === "approved") {
        matchesStatus =
          letter.status === "approved" ||
          (letter.approvalFlow?.proctor?.status === "approved" && letter.currentApprover === "hod") ||
          (letter.approvalFlow?.hod?.status === "approved" && letter.currentApprover === "principal")
      } else if (filter === "rejected") {
        matchesStatus =
          letter.status === "rejected" ||
          letter.approvalFlow?.proctor?.status === "rejected" ||
          letter.approvalFlow?.hod?.status === "rejected" ||
          letter.approvalFlow?.principal?.status === "rejected"
      }

      return isApplicant && matchesStatus
    })
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>
      case "approved_by_hod":
        return <Badge className="bg-blue-500">Approved by HOD</Badge>
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>
    }
  }

  // Get letter status badge based on approval flow
  const getLetterStatusBadge = (letter: CommonLetterApplication) => {
    if (letter.status === "approved") {
      return <Badge className="bg-green-500">Approved</Badge>
    }

    if (
      letter.status === "rejected" ||
      letter.approvalFlow?.proctor?.status === "rejected" ||
      letter.approvalFlow?.hod?.status === "rejected" ||
      letter.approvalFlow?.principal?.status === "rejected"
    ) {
      return <Badge className="bg-red-500">Rejected</Badge>
    }

    if (letter.approvalFlow?.proctor?.status === "approved" && letter.currentApprover === "hod") {
      return <Badge className="bg-blue-500">Approved by Proctor</Badge>
    }

    if (letter.approvalFlow?.hod?.status === "approved" && letter.currentApprover === "principal") {
      return <Badge className="bg-blue-500">Approved by HOD</Badge>
    }

    return <Badge className="bg-yellow-500">Pending</Badge>
  }

  // Get leave type full name
  const getLeaveTypeName = (type: LeaveType) => {
    const leaveTypes = {
      CL: "Casual Leave",
      RH: "Restricted Holiday",
      OOD: "On Official Duty",
      CO: "Compensatory Off",
      SL: "Sick Leave",
      LWP: "Leave Without Pay",
      EL: "Earned Leave",
    }
    return leaveTypes[type]
  }

  const filteredLeaveApplications = getFilteredLeaveApplications()
  const filteredCommonLetters = getFilteredCommonLetters()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="text-muted-foreground">View and track your leave applications and common letters.</p>
      </div>

      <Tabs defaultValue="leave" value={activeTab} onValueChange={(value) => setActiveTab(value as "leave" | "letter")}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="leave">Leave Applications</TabsTrigger>
            <TabsTrigger value="letter">Common Letters</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("pending")}
            >
              <Clock className="h-4 w-4 mr-1" />
              Pending
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("approved")}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approved
            </Button>
            <Button
              variant={filter === "rejected" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("rejected")}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Rejected
            </Button>
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              All
            </Button>
          </div>
        </div>

        <TabsContent value="leave" className="space-y-4">
          {filteredLeaveApplications.length > 0 ? (
            filteredLeaveApplications.map((application) => (
              <Card key={application.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{getLeaveTypeName(application.type)}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(application.startDate)} to {formatDate(application.endDate)} ({application.days}{" "}
                        days)
                      </p>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Reason</h4>
                      <p className="text-sm">{application.reason}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Applied On</h4>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          <p className="text-sm">{formatDate(application.createdAt)}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-1">Sent To</h4>
                        <p className="text-sm capitalize">
                          {application.sendTo === "both" ? "HOD and Principal" : application.sendTo}
                        </p>
                      </div>
                    </div>

                    {application.status !== "pending" && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Status Updates</h4>
                        <div className="space-y-2">
                          {application.hodApproval && (
                            <div className="flex items-start gap-2">
                              {application.hodApproval.status === "approved" ? (
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                              )}
                              <div>
                                <p className="text-sm font-medium">
                                  HOD {application.hodApproval.status === "approved" ? "Approved" : "Rejected"} on{" "}
                                  {formatDate(application.hodApproval.timestamp)}
                                </p>
                                {application.hodApproval.comments && (
                                  <p className="text-xs text-muted-foreground">{application.hodApproval.comments}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {application.principalApproval && (
                            <div className="flex items-start gap-2">
                              {application.principalApproval.status === "approved" ? (
                                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                              )}
                              <div>
                                <p className="text-sm font-medium">
                                  Principal{" "}
                                  {application.principalApproval.status === "approved" ? "Approved" : "Rejected"} on{" "}
                                  {formatDate(application.principalApproval.timestamp)}
                                </p>
                                {application.principalApproval.comments && (
                                  <p className="text-xs text-muted-foreground">
                                    {application.principalApproval.comments}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {application.comments && application.status !== "approved_by_hod" && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Comments</h4>
                        <p className="text-sm">{application.comments}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No leave applications found</p>
                <p className="text-sm text-muted-foreground">
                  {filter !== "all"
                    ? `You don't have any ${filter} leave applications.`
                    : "You haven't submitted any leave applications yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="letter" className="space-y-4">
          {filteredCommonLetters.length > 0 ? (
            filteredCommonLetters.map((letter) => (
              <Card key={letter.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{letter.subject}</CardTitle>
                      <p className="text-sm text-muted-foreground">Submitted on {formatDate(letter.createdAt)}</p>
                    </div>
                    {getLetterStatusBadge(letter)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Message</h4>
                      <p className="text-sm">{letter.message}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Recipients</h4>
                      <p className="text-sm">
                        {letter.recipients.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(", ")}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Approval Status</h4>
                      <div className="space-y-2">
                        {letter.approvalFlow?.proctor && (
                          <div className="flex items-start gap-2">
                            {letter.approvalFlow.proctor.status === "approved" ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            ) : letter.approvalFlow.proctor.status === "rejected" ? (
                              <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-500 mt-0.5" />
                            )}
                            <div>
                              <p className="text-sm font-medium">
                                Proctor:{" "}
                                {letter.approvalFlow.proctor.status.charAt(0).toUpperCase() +
                                  letter.approvalFlow.proctor.status.slice(1)}
                                {letter.approvalFlow.proctor.timestamp &&
                                  ` on ${formatDate(letter.approvalFlow.proctor.timestamp)}`}
                              </p>
                              {letter.approvalFlow.proctor.comments && (
                                <p className="text-xs text-muted-foreground">{letter.approvalFlow.proctor.comments}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {letter.approvalFlow?.hod && (
                          <div className="flex items-start gap-2">
                            {letter.approvalFlow.hod.status === "approved" ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            ) : letter.approvalFlow.hod.status === "rejected" ? (
                              <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-500 mt-0.5" />
                            )}
                            <div>
                              <p className="text-sm font-medium">
                                HOD:{" "}
                                {letter.approvalFlow.hod.status.charAt(0).toUpperCase() +
                                  letter.approvalFlow.hod.status.slice(1)}
                                {letter.approvalFlow.hod.timestamp &&
                                  ` on ${formatDate(letter.approvalFlow.hod.timestamp)}`}
                              </p>
                              {letter.approvalFlow.hod.comments && (
                                <p className="text-xs text-muted-foreground">{letter.approvalFlow.hod.comments}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {letter.approvalFlow?.principal && (
                          <div className="flex items-start gap-2">
                            {letter.approvalFlow.principal.status === "approved" ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            ) : letter.approvalFlow.principal.status === "rejected" ? (
                              <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                            ) : (
                              <Clock className="h-4 w-4 text-yellow-500 mt-0.5" />
                            )}
                            <div>
                              <p className="text-sm font-medium">
                                Principal:{" "}
                                {letter.approvalFlow.principal.status.charAt(0).toUpperCase() +
                                  letter.approvalFlow.principal.status.slice(1)}
                                {letter.approvalFlow.principal.timestamp &&
                                  ` on ${formatDate(letter.approvalFlow.principal.timestamp)}`}
                              </p>
                              {letter.approvalFlow.principal.comments && (
                                <p className="text-xs text-muted-foreground">
                                  {letter.approvalFlow.principal.comments}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No common letters found</p>
                <p className="text-sm text-muted-foreground">
                  {filter !== "all"
                    ? `You don't have any ${filter} common letters.`
                    : "You haven't submitted any common letters yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
