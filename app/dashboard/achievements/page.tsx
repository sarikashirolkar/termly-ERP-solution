"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BookOpen, Code, ExternalLink, Plus, Search, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { AddAchievementDialog } from "@/components/dashboard/add-achievement-dialog"
import { PrincipalAchievementCharts } from "@/components/dashboard/principal-achievement-charts"
import type { Achievement } from "@/lib/database-schema"
import { departments } from "@/lib/dummy-data"
import { Calendar, Check, Clock, X } from "lucide-react"
import { AchievementVerificationDialog } from "@/components/dashboard/achievement-verification-dialog"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

// Utility functions
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// Mock student data with different names - all from Computer Science department
const mockStudents = [
  { id: "S101", firstName: "Shivay", lastName: "Mishra", usn: "1MS21CS101", semester: 6 },
  { id: "S102", firstName: "Aadhya", lastName: "Jain", usn: "1MS21CS102", semester: 6 },
  { id: "S103", firstName: "Arjun", lastName: "Sharma", usn: "1MS21CS103", semester: 6 },
  { id: "S104", firstName: "Ananya", lastName: "Patel", usn: "1MS21CS104", semester: 6 },
  { id: "S105", firstName: "Rohan", lastName: "Gupta", usn: "1MS21CS105", semester: 6 },
  { id: "S106", firstName: "Diya", lastName: "Singh", usn: "1MS21CS106", semester: 6 },
]

export default function AchievementsPage() {
  const [user, setUser] = useState<{
    firstName: string
    lastName: string
    role: string
    email: string
    department?: string
    id?: string
  } | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [myAchievements, setMyAchievements] = useState<Achievement[]>([])
  const [filteredAchievements, setFilteredAchievements] = useState<Achievement[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    academic: 0,
    technical: 0,
    external: 0,
  })
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] = useState(false)
  const [isProofDialogOpen, setIsProofDialogOpen] = useState(false)
  const [selectedProof, setSelectedProof] = useState<string | null>(null)
  const router = useRouter()

  // Check if user has admin privileges (can see all departments)
  const hasAdminPrivileges = user?.role === "admin" || user?.role === "principal"
  const isDepartmentUser = user?.role === "hod" || user?.role === "faculty" || user?.role === "coordinator"

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)

      // Ensure department is set for role-based users
      let userDepartment = parsedUser.department

      // If department is not set in user data, use a default based on role
      if (!userDepartment) {
        switch (parsedUser.role) {
          case "student":
            userDepartment = "Computer Science & Engineering"
            break
          case "faculty":
            userDepartment = "Computer Science & Engineering"
            break
          case "hod":
            userDepartment = "Computer Science & Engineering"
            break
          case "coordinator":
            userDepartment = "Computer Science & Engineering"
            break
          default:
            userDepartment =
              parsedUser.role === "admin" || parsedUser.role === "principal"
                ? undefined
                : "Computer Science & Engineering"
        }

        // Update the user object with the department
        parsedUser.department = userDepartment
      }

      setUser({
        ...parsedUser,
        id: parsedUser.role === "student" ? "S001" : "F001", // Mock ID for demo
        department: userDepartment,
      })

      // If user is not admin/principal, set selected department to user's department
      // and disable department selection
      if (parsedUser.role !== "admin" && parsedUser.role !== "principal") {
        setSelectedDepartment(userDepartment)
      }
    }

    // Fetch achievements
    fetchAchievements()
  }, [])

  useEffect(() => {
    // Filter achievements based on search query, department, and active tab
    let filtered = [...achievements]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (achievement) =>
          achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          achievement.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply department filter based on user role
    if (!hasAdminPrivileges && user?.department) {
      // For non-admin roles, ONLY show achievements from their department
      filtered = filtered.filter((achievement) => achievement.department === user.department)
    } else if (selectedDepartment !== "all") {
      // For admin roles with department filter selected
      filtered = filtered.filter((achievement) => achievement.department === selectedDepartment)
    }

    // Filter by category (tab)
    if (activeTab !== "all") {
      filtered = filtered.filter((achievement) => achievement.category.toLowerCase() === activeTab.toLowerCase())
    }

    // Ensure we always have some mock data for all users
    if (filtered.length === 0 && user?.department) {
      filtered = generateMockAchievementsForDepartment(user.department)
    }

    setFilteredAchievements(filtered)
  }, [searchQuery, selectedDepartment, activeTab, achievements, user, hasAdminPrivileges, isDepartmentUser])

  // Update the useEffect for stats calculation to count actual verified achievements
  useEffect(() => {
    // Calculate stats based on visible achievements
    const visibleAchievements = [...filteredAchievements]

    // Count verified achievements for stats
    const verifiedAchievements = visibleAchievements.filter((a) => a.verified)

    const total = verifiedAchievements.length
    const academic = verifiedAchievements.filter((a) => a.category === "academic").length
    const technical = verifiedAchievements.filter((a) => a.category === "technical").length
    const external = verifiedAchievements.filter((a) => a.institution === "other").length

    setStats({
      total,
      academic,
      technical,
      external,
    })

    // Filter my achievements if user is a student
    if (user?.role === "student" && user?.id) {
      let myAchievs = achievements.filter((a) => a.studentId === user.id)

      // If no achievements found, generate mock achievements for the student
      if (myAchievs.length === 0) {
        myAchievs = [
          {
            id: "my-ach1",
            studentId: user.id,
            title: "Achievement 1",
            description: "Description of achievement 1",
            date: "2024-01-01",
            category: "academic",
            institution: "other",
            otherInstitutionName: "Some Other Institution",
            department: user.department || "Computer Science & Engineering",
            image: undefined,
            verified: false,
            verifiedBy: undefined,
            fileUrl: undefined,
            achievementType: "student",
          },
          {
            id: "my-ach2",
            studentId: user.id,
            title: "Achievement 2",
            description: "Description of achievement 2",
            date: "2024-01-01",
            category: "academic",
            institution: "other",
            otherInstitutionName: "Some Other Institution",
            department: user.department || "Computer Science & Engineering",
            image: undefined,
            verified: false,
            fileUrl: undefined,
            achievementType: "student",
          },
        ]
      }

      setMyAchievements(myAchievs)
    }
  }, [filteredAchievements, user, achievements])

  const fetchAchievements = async () => {
    try {
      // In a real app, we would fetch from API with department filter
      // For demo, we'll use mock data
      const response = await fetch("/api/achievements")
      let data

      try {
        data = await response.json()
      } catch (error) {
        data = { achievements: [] }
      }

      // Use consistent mock data for all users
      if (user?.department) {
        const mockData = generateMockAchievementsForDepartment(user.department)
        setAchievements(mockData)
      } else {
        // Original mock data for admin/principal roles
        const mockAchievements: Achievement[] = [
          {
            id: "ach1",
            studentId: "S001",
            title: "First Place in Coding Competition",
            description:
              "Won first place in the annual coding competition organized by the Computer Science department",
            date: "2024-01-15",
            category: "technical",
            institution: "college",
            otherInstitutionName: undefined,
            department: "Computer Science & Engineering",
            image: undefined,
            verified: true,
            verifiedBy: "fac1",
            fileUrl: undefined,
            achievementType: "student",
          },
          {
            id: "ach2",
            studentId: "S001",
            title: "Research Paper Publication",
            description:
              "Published a research paper on AI applications in healthcare in the International Journal of Computer Science",
            date: "2024-02-20",
            category: "academic",
            institution: "other",
            otherInstitutionName: "International Journal of Computer Science",
            department: "Computer Science & Engineering",
            image: undefined,
            verified: false,
            verifiedBy: undefined,
            fileUrl: undefined,
            achievementType: "student",
          },
          {
            id: "ach3",
            studentId: "S001",
            title: "Hackathon Winner",
            description: "Led a team that won the national hackathon focused on sustainable technology solutions",
            date: "2024-03-10",
            category: "technical",
            institution: "other",
            otherInstitutionName: "TechForGood Foundation",
            department: "Computer Science & Engineering",
            image: undefined,
            verified: true,
            verifiedBy: "fac1",
            fileUrl: undefined,
            achievementType: "student",
          },
        ]
        setAchievements(mockAchievements)
      }
    } catch (error) {
      console.error("Failed to fetch achievements:", error)
      // Use mock data for demo
      if (user?.department) {
        const mockData = generateMockAchievementsForDepartment(user.department)
        setAchievements(mockData)
      } else {
        // Original mock data for other roles
        const mockAchievements: Achievement[] = []
        setAchievements(mockAchievements)
      }
    }
  }

  // Update the generateMockAchievementsForDepartment function to include more verified achievements
  const generateMockAchievementsForDepartment = (department: string): Achievement[] => {
    // Generate consistent mock achievements for the specified department
    return [
      {
        id: "mock1",
        studentId: "S101",
        title: "First Place in National Coding Competition",
        description: "Won first place in the prestigious national coding competition organized by TechMinds India",
        date: "2024-03-15",
        category: "technical",
        institution: "other",
        otherInstitutionName: "TechMinds India",
        department: department,
        image: undefined,
        verified: true,
        verifiedBy: "fac1",
        fileUrl: "/achievement-proof-1.pdf",
        achievementType: "student",
        studentName: "Shivay Mishra",
        usn: "1MS21CS101",
        semester: "6",
      },
      {
        id: "mock2",
        studentId: "S102",
        title: "Research Paper Publication in IEEE",
        description:
          "Published a research paper on 'AI Applications in Healthcare' in the IEEE International Conference",
        date: "2024-02-10",
        category: "academic",
        institution: "other",
        otherInstitutionName: "IEEE",
        department: department,
        image: undefined,
        verified: true,
        verifiedBy: "fac2",
        fileUrl: "/achievement-proof-2.pdf",
        achievementType: "student",
        studentName: "Aadhya Jain",
        usn: "1MS21CS102",
        semester: "6",
      },
      {
        id: "mock3",
        studentId: "S103",
        title: "Inter-College Cricket Tournament Winner",
        description: "Led the department cricket team to victory in the inter-college tournament",
        date: "2024-04-05",
        category: "sports",
        institution: "college",
        department: department,
        image: undefined,
        verified: true,
        verifiedBy: "fac3",
        fileUrl: "/achievement-proof-3.pdf",
        achievementType: "student",
        studentName: "Arjun Sharma",
        usn: "1MS21CS103",
        semester: "6",
      },
      {
        id: "mock4",
        studentId: "S104",
        title: "Best Project Award",
        description: "Received the best project award for innovative solution in sustainable technology",
        date: "2024-01-20",
        category: "academic",
        institution: "college",
        department: department,
        image: undefined,
        verified: true,
        fileUrl: "/achievement-proof-4.pdf",
        verifiedBy: "fac2",
        achievementType: "student",
        studentName: "Ananya Patel",
        usn: "1MS21CS104",
        semester: "6",
      },
      {
        id: "mock5",
        studentId: "S105",
        title: "Cultural Fest Dance Competition Winner",
        description: "Won first prize in the classical dance competition at the annual cultural fest",
        date: "2024-03-25",
        category: "cultural",
        institution: "college",
        department: department,
        image: undefined,
        verified: true,
        verifiedBy: "fac4",
        fileUrl: "/achievement-proof-5.pdf",
        achievementType: "student",
        studentName: "Rohan Gupta",
        usn: "1MS21CS105",
        semester: "6",
      },
      {
        id: "mock6",
        studentId: "S106",
        title: "Hackathon Winner at TechFest 2024",
        description:
          "Led a team of 4 students to win the 24-hour hackathon with an innovative solution for smart cities",
        date: "2024-02-28",
        category: "technical",
        institution: "other",
        otherInstitutionName: "TechFest 2024",
        department: department,
        image: undefined,
        verified: true,
        fileUrl: "/achievement-proof-6.pdf",
        verifiedBy: "fac1",
        achievementType: "student",
        studentName: "Diya Singh",
        usn: "1MS21CS106",
        semester: "6",
      },
    ]
  }

  const handleAddAchievement = async (newAchievement: Partial<Achievement>) => {
    try {
      // In a real app, we would post to API
      // For demo, we'll just update the state
      const achievementWithId: Achievement = {
        id: `ach${achievements.length + 1}`,
        studentId: user?.role === "student" ? user.id : undefined,
        title: newAchievement.title || "",
        description: newAchievement.description || "",
        date: newAchievement.date || new Date().toISOString().split("T")[0],
        category: newAchievement.category || "academic",
        institution: newAchievement.institution || "college",
        otherInstitutionName: newAchievement.otherInstitutionName,
        department: newAchievement.department || user?.department || "Computer Science",
        image: newAchievement.image,
        verified: false,
        verifiedBy: undefined,
        fileUrl: newAchievement.fileUrl,
        achievementType: user?.role === "student" ? "student" : "faculty",
      }

      // Update state with new achievement
      setAchievements((prev) => [...prev, achievementWithId])
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Failed to add achievement:", error)
    }
  }

  const handleRejectAchievement = async (achievementId: string, reason: string) => {
    try {
      // In a real app, we would post to API
      // For demo, we'll just update the state
      setAchievements((prev) =>
        prev.map((achievement) =>
          achievement.id === achievementId
            ? {
                ...achievement,
                verified: false,
                rejected: true,
                rejectionReason: reason,
                verifiedBy: user?.email,
              }
            : achievement,
        ),
      )
      setIsVerificationDialogOpen(false)
      toast({
        title: "Achievement Rejected",
        description: "The achievement has been rejected successfully.",
      })
    } catch (error) {
      console.error("Failed to reject achievement:", error)
    }
  }

  // Fix the issue with verification not working properly
  // Update the handleVerifyAchievement function to properly update the achievement status
  const handleVerifyAchievement = async (achievementId: string) => {
    try {
      // In a real app, we would post to API
      // For demo, we'll just update the state
      const updatedAchievements = achievements.map((achievement) =>
        achievement.id === achievementId
          ? {
              ...achievement,
              verified: true,
              verifiedBy: user?.email || user?.id,
            }
          : achievement,
      )

      // Update both the main achievements list and filtered achievements
      setAchievements(updatedAchievements)

      // Close the verification dialog
      setIsVerificationDialogOpen(false)

      // Force refresh the filtered achievements
      const updatedFiltered = updatedAchievements.filter((achievement) => {
        // Apply the same filters as in the useEffect
        let match = true

        // Filter by search query
        if (searchQuery) {
          match =
            match &&
            (achievement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              achievement.description.toLowerCase().includes(searchQuery.toLowerCase()))
        }

        // Apply department filter
        if (!hasAdminPrivileges && user?.department) {
          match = match && achievement.department === user.department
        } else if (selectedDepartment !== "all") {
          match = match && achievement.department === selectedDepartment
        }

        // Filter by category (tab)
        if (activeTab !== "all") {
          match = match && achievement.category.toLowerCase() === activeTab.toLowerCase()
        }

        return match
      })

      setFilteredAchievements(updatedFiltered)

      // Show success toast
      toast({
        title: "Achievement Verified",
        description: "The achievement has been verified successfully.",
        variant: "default",
      })
    } catch (error) {
      console.error("Failed to verify achievement:", error)
      toast({
        title: "Verification Failed",
        description: "There was an error verifying the achievement.",
        variant: "destructive",
      })
    }
  }

  const openVerificationDialog = (achievement: Achievement) => {
    setSelectedAchievement(achievement)
    setIsVerificationDialogOpen(true)
  }

  const openProofDialog = (proofUrl: string) => {
    setSelectedProof(proofUrl)
    setIsProofDialogOpen(true)
  }

  // Get student details by ID
  const getStudentById = (studentId: string) => {
    // First try to find the student in our mockStudents array
    const foundStudent = mockStudents.find((student) => student.id === studentId)

    if (foundStudent) {
      return foundStudent
    }

    // If not found, generate a fallback name based on the studentId hash
    // This ensures consistent but different names for different IDs
    const fallbackNames = [
      { firstName: "Aditya", lastName: "Patel", department: "CSE(AIML)", usn: "1MS21CS999", semester: 6 },
      { firstName: "Priya", lastName: "Sharma", department: "CSE(DS)", usn: "1MS21CS998", semester: 6 },
      { firstName: "Rahul", lastName: "Verma", department: "ECE", usn: "1MS21EC101", semester: 6 },
      { firstName: "Neha", lastName: "Gupta", department: "CSE", usn: "1MS21CS201", semester: 6 },
      { firstName: "Vikram", lastName: "Singh", department: "ISE", usn: "1MS21IS301", semester: 6 },
      { firstName: "Anjali", lastName: "Kumar", department: "MECH", usn: "1MS21ME101", semester: 6 },
      { firstName: "Sanjay", lastName: "Reddy", department: "CIVIL", usn: "1MS21CV101", semester: 6 },
      { firstName: "Meera", lastName: "Iyer", department: "EEE", usn: "1MS21EE101", semester: 6 },
    ]

    // Use the last character of the studentId to select a fallback name
    // This ensures consistent mapping for the same ID
    const idLastChar = studentId.charAt(studentId.length - 1)
    const idNum = Number.parseInt(idLastChar, 36) % fallbackNames.length // Convert to number 0-35 then get modulo

    return fallbackNames[idNum] || fallbackNames[0] // Default to first name if something goes wrong
  }

  // Render appropriate view based on user role
  if (!user) {
    return <div>Loading...</div>
  }

  // Principal view with charts
  if (user.role === "principal") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Student Achievements</h1>
            <p className="text-muted-foreground">Celebrate and recognize student accomplishments</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-100 dark:bg-blue-800 p-2">
                  <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-sm text-muted-foreground">
                    {selectedDepartment === "all" ? "Across all departments" : `In ${selectedDepartment}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 dark:bg-green-900/20 border-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-100 dark:bg-green-800 p-2">
                  <BookOpen className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.academic}</div>
                  <p className="text-sm text-muted-foreground">Academic excellence</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 dark:bg-purple-900/20 border-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-purple-100 dark:bg-purple-800 p-2">
                  <Code className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.technical}</div>
                  <p className="text-sm text-muted-foreground">Technical competitions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-amber-100 dark:bg-amber-800 p-2">
                  <ExternalLink className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.external}</div>
                  <p className="text-sm text-muted-foreground">From external institutions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Charts */}
        <PrincipalAchievementCharts
          achievements={
            selectedDepartment === "all"
              ? achievements
              : achievements.filter((a) => a.department === selectedDepartment)
          }
        />

        {/* Achievement Listing */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Achievements</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search achievements..."
                  className="pl-8 w-[250px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {hasAdminPrivileges ? (
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by department" />
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
              ) : (
                <div className="text-sm font-medium text-muted-foreground px-3 py-2 border rounded-md">
                  {user?.department || "Computer Science & Engineering"}
                </div>
              )}
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Achievements</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="sports">Sports</TabsTrigger>
              <TabsTrigger value="cultural">Cultural</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="grid gap-4 md:grid-cols-3">
                {filteredAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    userRole={user.role}
                    onVerify={handleVerifyAchievement}
                    openVerificationDialog={openVerificationDialog}
                    openProofDialog={openProofDialog}
                    student={getStudentById(achievement.studentId || "")}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
        {/* Verification Dialog */}
        <AchievementVerificationDialog
          open={isVerificationDialogOpen}
          onOpenChange={setIsVerificationDialogOpen}
          achievement={selectedAchievement}
          onVerify={handleVerifyAchievement}
          onReject={handleRejectAchievement}
        />
        {/* Proof Dialog */}
        <Dialog open={isProofDialogOpen} onOpenChange={setIsProofDialogOpen}>
          <DialogContent className="max-w-4xl">
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Achievement Proof Document</h2>
              {selectedProof ? (
                <div className="bg-muted p-8 rounded-md text-center">
                  <p className="mb-4">
                    In a real application, this would display the actual proof document (PDF, image, etc.)
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">Document URL: {selectedProof}</p>
                  <img
                    src="/images/achievement-placeholder.png"
                    alt="Achievement Proof Placeholder"
                    className="max-w-md mx-auto rounded-md border"
                  />
                </div>
              ) : (
                <p>No proof document available</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Student view with My Achievements section
  if (user.role === "student") {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Student Achievements</h1>
            <p className="text-muted-foreground">Celebrate and recognize student accomplishments</p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Achievement
          </Button>
        </div>

        {/* My Achievements Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">My Achievements</h2>

          {myAchievements.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {myAchievements.map((achievement) => (
                <Card key={achievement.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        {getCategoryBadge(achievement.category)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {formatDate(achievement.date)}
                        </div>
                        {achievement.institution === "other" && (
                          <div>Institution: {achievement.otherInstitutionName}</div>
                        )}
                      </div>
                    </div>
                    <div className="border-t p-3 flex items-center justify-between bg-muted/30">
                      {achievement.verified ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Verified
                        </Badge>
                      ) : achievement.rejected ? (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                        >
                          <X className="h-3.5 w-3.5 mr-1" /> Rejected
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                        >
                          <Clock className="h-3.5 w-3.5 mr-1" /> Pending Verification
                        </Badge>
                      )}

                      {achievement.rejected && (
                        <Button variant="ghost" size="sm" className="text-xs">
                          View Reason
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-2">No achievements yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't added any achievements yet. Add your first achievement to get started!
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Achievement
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-blue-100 dark:bg-blue-800 p-2">
                  <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-sm text-muted-foreground">In {user.department || "your department"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 dark:bg-green-900/20 border-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-green-100 dark:bg-green-800 p-2">
                  <BookOpen className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.academic}</div>
                  <p className="text-sm text-muted-foreground">Academic excellence</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 dark:bg-purple-900/20 border-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-purple-100 dark:bg-purple-800 p-2">
                  <Code className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.technical}</div>
                  <p className="text-sm text-muted-foreground">Technical competitions</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-amber-50 dark:bg-amber-900/20 border-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-amber-100 dark:bg-amber-800 p-2">
                  <ExternalLink className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{stats.external}</div>
                  <p className="text-sm text-muted-foreground">From external institutions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Achievement Listing */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {user.department ? `${user.department} Achievements` : "Department Achievements"}
            </h2>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search achievements..."
                className="pl-8 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Achievements</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="technical">Technical</TabsTrigger>
              <TabsTrigger value="sports">Sports</TabsTrigger>
              <TabsTrigger value="cultural">Cultural</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              <div className="grid gap-4 md:grid-cols-3">
                {filteredAchievements.length > 0 ? (
                  filteredAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      userRole={user.role}
                      onVerify={handleVerifyAchievement}
                      openVerificationDialog={openVerificationDialog}
                      openProofDialog={openProofDialog}
                      student={getStudentById(achievement.studentId || "")}
                    />
                  ))
                ) : (
                  <div className="col-span-3 text-center py-10">
                    <p className="text-muted-foreground">No achievements found in your department.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Add Achievement Dialog */}
        <AddAchievementDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAddAchievement}
          department={user.department}
        />
        {/* Verification Dialog */}
        <AchievementVerificationDialog
          open={isVerificationDialogOpen}
          onOpenChange={setIsVerificationDialogOpen}
          achievement={selectedAchievement}
          onVerify={handleVerifyAchievement}
          onReject={handleRejectAchievement}
        />
        {/* Proof Dialog */}
        <Dialog open={isProofDialogOpen} onOpenChange={setIsProofDialogOpen}>
          <DialogContent className="max-w-4xl">
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Achievement Proof Document</h2>
              {selectedProof ? (
                <div className="bg-muted p-8 rounded-md text-center">
                  <p className="mb-4">
                    In a real application, this would display the actual proof document (PDF, image, etc.)
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">Document URL: {selectedProof}</p>
                  <img
                    src="/images/achievement-placeholder.png"
                    alt="Achievement Proof Placeholder"
                    className="max-w-md mx-auto rounded-md border"
                  />
                </div>
              ) : (
                <p>No proof document available</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Faculty, HOD, Coordinator view - matched exactly to reference image
  const userRole = user.role
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Achievements</h1>
        <p className="text-muted-foreground">Celebrate and recognize student accomplishments</p>
      </div>

      {/* Stats Cards - Exactly matching reference */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-blue-100 dark:bg-blue-800 p-2">
                <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-sm text-muted-foreground">In Computer Science</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/20 border-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-green-100 dark:bg-green-800 p-2">
                <BookOpen className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.academic}</div>
                <p className="text-sm text-muted-foreground">Academic excellence</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-purple-100 dark:bg-purple-800 p-2">
                <Code className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.technical}</div>
                <p className="text-sm text-muted-foreground">Technical competitions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-amber-100 dark:bg-amber-800 p-2">
                <ExternalLink className="h-5 w-5 text-amber-600 dark:text-amber-300" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.external}</div>
                <p className="text-sm text-muted-foreground">From external institutions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Achievements */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {!hasAdminPrivileges && user?.department
              ? `${user.department} Achievements`
              : selectedDepartment !== "all"
                ? `${selectedDepartment} Achievements`
                : "All Department Achievements"}
          </h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search achievements..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Achievements</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="sports">Sports</TabsTrigger>
            <TabsTrigger value="cultural">Cultural</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Use filteredAchievements instead of hardcoded cards */}
              {filteredAchievements.map((achievement) => {
                const student = getStudentById(achievement.studentId || "")
                return (
                  <Card key={achievement.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar>
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>
                              {student.firstName.charAt(0)}
                              {student.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{`${student.firstName} ${student.lastName}`}</h3>
                            <p className="text-sm text-muted-foreground">{achievement.department}</p>
                          </div>
                          <div className="ml-auto">{getCategoryBadge(achievement.category)}</div>
                        </div>
                        <h4 className="font-semibold mb-1">{achievement.title}</h4>
                        <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            {formatDate(achievement.date)}
                          </div>
                          {achievement.institution === "other" && (
                            <div>Institution: {achievement.otherInstitutionName}</div>
                          )}
                        </div>
                      </div>
                      <div className="border-t p-3 flex items-center justify-between bg-muted/30">
                        {achievement.verified ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                          >
                            <Check className="h-3.5 w-3.5 mr-1" /> Verified
                          </Badge>
                        ) : achievement.rejected ? (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                          >
                            <X className="h-3.5 w-3.5 mr-1" /> Rejected
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                          >
                            Pending Verification
                          </Badge>
                        )}
                        {!achievement.verified &&
                          (userRole === "faculty" || userRole === "hod" || userRole === "coordinator") && (
                            <Button size="sm" onClick={() => openVerificationDialog(achievement)}>
                              View Details
                            </Button>
                          )}
                        {achievement.verified && achievement.fileUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openProofDialog(achievement.fileUrl || "")}
                          >
                            View Proof
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Verification Dialog */}
      <AchievementVerificationDialog
        open={isVerificationDialogOpen}
        onOpenChange={setIsVerificationDialogOpen}
        achievement={selectedAchievement}
        onVerify={handleVerifyAchievement}
        onReject={handleRejectAchievement}
      />

      {/* Proof Dialog */}
      <Dialog open={isProofDialogOpen} onOpenChange={setIsProofDialogOpen}>
        <DialogContent className="max-w-4xl">
          <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Achievement Proof Document</h2>
            {selectedProof ? (
              <div className="bg-muted p-8 rounded-md text-center">
                <p className="mb-4">
                  In a real application, this would display the actual proof document (PDF, image, etc.)
                </p>
                <p className="text-sm text-muted-foreground mb-4">Document URL: {selectedProof}</p>
                <img
                  src="/images/achievement-placeholder.png"
                  alt="Achievement Proof Placeholder"
                  className="max-w-md mx-auto rounded-md border"
                />
              </div>
            ) : (
              <p>No proof document available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Special component to match the reference image exactly
interface DepartmentAchievementCardProps {
  student: {
    firstName: string
    lastName: string
    usn?: string
    semester?: number
  }
  department: string
  title: string
  description: string
  date: string
  category: string
  institution?: string
  verified: boolean
  status?: "verified" | "pending" | "rejected"
  userRole: string
  onVerify: (id: string) => void
  openVerificationDialog: (achievement: Achievement) => void
  openProofDialog: (proofUrl: string) => void
  achievementId: string
  proofUrl?: string
}

function DepartmentAchievementCard({
  student,
  department,
  title,
  description,
  date,
  category,
  institution,
  verified,
  status = "verified",
  userRole,
  onVerify,
  openVerificationDialog,
  openProofDialog,
  achievementId,
  proofUrl,
}: DepartmentAchievementCardProps) {
  // Get appropriate badge based on category
  const getCategoryBadge = () => {
    switch (category.toLowerCase()) {
      case "academic":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 ml-auto">Academic</Badge>
      case "technical":
        return (
          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100 ml-auto">Technical</Badge>
        )
      case "sports":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 ml-auto">Sports</Badge>
        )
      case "cultural":
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 ml-auto">
            Cultural
          </Badge>
        )
      default:
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 ml-auto">Other</Badge>
    }
  }

  const canVerify = (userRole === "faculty" || userRole === "hod" || userRole === "coordinator") && !verified
  const studentName = `${student.firstName} ${student.lastName}`

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar>
              <AvatarFallback>
                {student.firstName.charAt(0)}
                {student.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{studentName}</h3>
              <p className="text-sm text-muted-foreground">{department}</p>
            </div>
            {getCategoryBadge()}
          </div>
          <h4 className="font-semibold mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {date}
            </div>
            {institution && <div>Institution: {institution}</div>}
          </div>
        </div>
        <div className="border-t p-3 flex items-center justify-between bg-muted/30">
          {verified ? (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
            >
              <Check className="h-3.5 w-3.5 mr-1" /> Verified
            </Badge>
          ) : status === "rejected" ? (
            <Badge
              variant="outline"
              className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
            >
              <X className="h-3.5 w-3.5 mr-1" /> Rejected
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
            >
              Pending Verification
            </Badge>
          )}
          {canVerify && (
            <Button
              size="sm"
              onClick={() => {
                // Create a mock achievement object based on the props
                const mockAchievement: Achievement = {
                  id: achievementId,
                  studentId: student?.id || "S001",
                  title: title,
                  description: description,
                  date: new Date(date.split("/").reverse().join("-")).toISOString(),
                  category: category,
                  institution: institution ? "other" : "college",
                  otherInstitutionName: institution,
                  department: department,
                  verified: verified,
                  achievementType: "student",
                  studentName: studentName,
                  usn: student.usn,
                  semester: student.semester?.toString(),
                }
                openVerificationDialog(mockAchievement)
              }}
            >
              View Details
            </Button>
          )}
          {verified && proofUrl && (
            <Button variant="outline" size="sm" onClick={() => openProofDialog(proofUrl)}>
              View Proof
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface AchievementCardProps {
  achievement: Achievement
  userRole: string
  onVerify: (id: string) => void
  openVerificationDialog: (achievement: Achievement) => void
  openProofDialog: (proofUrl: string) => void
  student: {
    firstName: string
    lastName: string
    usn?: string
    semester?: number
  }
}

function AchievementCard({
  achievement,
  userRole,
  onVerify,
  openVerificationDialog,
  openProofDialog,
  student,
}: AchievementCardProps) {
  const canVerify =
    (userRole === "faculty" || userRole === "hod" || userRole === "coordinator") && !achievement.verified

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Avatar>
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>{`${student.firstName.charAt(0)}${student.lastName.charAt(0)}`}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{`${student.firstName} ${student.lastName}`}</h3>
              <p className="text-sm text-muted-foreground">{achievement.department}</p>
            </div>
            <div className="ml-auto">{getCategoryBadge(achievement.category)}</div>
          </div>
          <h4 className="font-semibold mb-1">{achievement.title}</h4>
          <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {formatDate(achievement.date)}
            </div>
            {achievement.institution === "other" && <div>Institution: {achievement.otherInstitutionName}</div>}
          </div>
        </div>
        <div className="border-t p-3 flex items-center justify-between bg-muted/30">
          {achievement.verified ? (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
            >
              <Check className="h-3.5 w-3.5 mr-1" /> Verified
            </Badge>
          ) : achievement.rejected ? (
            <Badge
              variant="outline"
              className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
            >
              <X className="h-3.5 w-3.5 mr-1" /> Rejected
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
            >
              Pending Verification
            </Badge>
          )}
          {canVerify && (
            <Button size="sm" onClick={() => openVerificationDialog(achievement)}>
              View Details
            </Button>
          )}
          {achievement.verified && achievement.fileUrl && (
            <Button variant="outline" size="sm" onClick={() => openProofDialog(achievement.fileUrl || "")}>
              View Proof
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
