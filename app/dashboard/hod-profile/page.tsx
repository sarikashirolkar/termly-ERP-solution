"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { User, Mail, Phone, Building, Calendar, GraduationCap, Edit, ArrowLeft, BookOpen, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock HOD data
const hodData = {
  id: "hod1",
  firstName: "Sarah",
  lastName: "Johnson",
  email: "sarah.johnson@example.edu",
  phone: "+1 (555) 123-4567",
  department: "Computer Science",
  designation: "Professor",
  employeeId: "HOD001",
  joinDate: "2015-06-15",
  qualifications: [
    { degree: "Ph.D.", field: "Computer Science", university: "Stanford University", year: 2010 },
    { degree: "M.S.", field: "Computer Science", university: "MIT", year: 2005 },
    { degree: "B.Tech", field: "Computer Science", university: "IIT Delhi", year: 2003 },
  ],
  publications: [
    {
      title: "Advances in Machine Learning Algorithms",
      journal: "Journal of Artificial Intelligence",
      year: 2018,
      citation: 45,
    },
    {
      title: "Neural Networks for Natural Language Processing",
      journal: "IEEE Transactions on Neural Networks and Learning Systems",
      year: 2020,
      citation: 32,
    },
    {
      title: "Efficient Data Structures for Big Data Analytics",
      journal: "ACM Transactions on Database Systems",
      year: 2016,
      citation: 28,
    },
  ],
  awards: [
    { title: "Outstanding Researcher Award", organization: "National Science Foundation", year: 2019 },
    { title: "Best Paper Award", conference: "International Conference on Machine Learning", year: 2017 },
    { title: "Teaching Excellence Award", institution: "University", year: 2016 },
  ],
  facultyManaged: [
    { id: "fac1", name: "Dr. Alan Turing", designation: "Professor", specialization: "Artificial Intelligence" },
    {
      id: "fac2",
      name: "Dr. Grace Hopper",
      designation: "Associate Professor",
      specialization: "Programming Languages",
    },
    { id: "fac3", name: "Dr. Tim Berners-Lee", designation: "Assistant Professor", specialization: "Web Technologies" },
    { id: "fac4", name: "Dr. Ada Lovelace", designation: "Professor", specialization: "Algorithms" },
    { id: "fac5", name: "Dr. John McCarthy", designation: "Associate Professor", specialization: "Machine Learning" },
  ],
  coursesOverseeing: [
    { id: 1, code: "CS101", name: "Introduction to Computer Science", faculty: "Dr. Alan Turing", students: 42 },
    { id: 2, code: "DS201", name: "Data Structures & Algorithms", faculty: "Dr. Ada Lovelace", students: 38 },
    { id: 3, code: "AI301", name: "Artificial Intelligence", faculty: "Dr. Alan Turing", students: 35 },
    { id: 4, code: "DB201", name: "Database Systems", faculty: "Dr. Grace Hopper", students: 40 },
    { id: 5, code: "WD401", name: "Web Development", faculty: "Dr. Tim Berners-Lee", students: 30 },
  ],
  achievements: [
    {
      title: "Department Ranking Improvement",
      description: "Improved department ranking from #15 to #5 nationally",
      year: 2022,
    },
    {
      title: "Research Grant",
      description: "Secured $2.5 million research grant for the department",
      year: 2021,
    },
    {
      title: "Industry Partnership",
      description: "Established partnerships with 10 leading tech companies",
      year: 2020,
    },
  ],
}

export default function HODProfilePage() {
  const searchParams = useSearchParams()
  const hodId = searchParams.get("hodId")
  const [hod, setHOD] = useState(hodData)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editedHOD, setEditedHOD] = useState(hodData)
  const [user, setUser] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    // In a real app, you would fetch the HOD data based on the hodId
    // For now, we'll just use the mock data
    console.log(`Fetching HOD with ID: ${hodId}`)
  }, [hodId])

  const handleEditHOD = () => {
    setHOD(editedHOD)
    setIsEditDialogOpen(false)
    toast({
      title: "Profile updated",
      description: "HOD profile has been updated successfully.",
    })
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-full">
        <p>You don't have permission to access this page.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">HOD Profile</h1>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>{getInitials(hod.firstName, hod.lastName)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>
                {hod.firstName} {hod.lastName}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <GraduationCap className="h-3 w-3" />
                {hod.designation}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{hod.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{hod.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>Head of {hod.department} Department</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Employee ID: {hod.employeeId}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined: {new Date(hod.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>Faculty Members</span>
                </div>
                <Badge>{hod.facultyManaged.length}</Badge>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-500" />
                  <span>Courses</span>
                </div>
                <Badge>{hod.coursesOverseeing.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Department Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50">
                <Users className="h-8 w-8 text-blue-500 mb-2" />
                <div className="text-2xl font-bold">{hod.facultyManaged.length}</div>
                <div className="text-sm text-muted-foreground">Faculty Members</div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50">
                <BookOpen className="h-8 w-8 text-green-500 mb-2" />
                <div className="text-2xl font-bold">{hod.coursesOverseeing.length}</div>
                <div className="text-sm text-muted-foreground">Courses</div>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/50">
                <GraduationCap className="h-8 w-8 text-purple-500 mb-2" />
                <div className="text-2xl font-bold">
                  {hod.coursesOverseeing.reduce((sum, course) => sum + course.students, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Students</div>
              </div>
            </div>
            <div className="pt-2">
              <h3 className="text-lg font-semibold mb-2">Recent Achievements</h3>
              <div className="space-y-3">
                {hod.achievements.map((achievement, index) => (
                  <div key={index} className="p-3 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{achievement.title}</div>
                      <Badge variant="outline">{achievement.year}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="faculty" className="space-y-4">
        <TabsList>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
          <TabsTrigger value="awards">Awards</TabsTrigger>
        </TabsList>

        <TabsContent value="faculty" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Faculty Members</CardTitle>
              <CardDescription>
                Faculty members under {hod.firstName} {hod.lastName}'s supervision
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hod.facultyManaged.map((faculty) => (
                    <TableRow key={faculty.id}>
                      <TableCell className="font-medium">{faculty.name}</TableCell>
                      <TableCell>{faculty.designation}</TableCell>
                      <TableCell>{faculty.specialization}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/faculty-profile?facultyId=${faculty.id}`)}
                        >
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Courses Overseeing</CardTitle>
              <CardDescription>Courses under {hod.department} department</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Faculty</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hod.coursesOverseeing.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.code}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{course.faculty}</TableCell>
                      <TableCell>{course.students}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/course-details?courseId=${course.id}`)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Educational Qualifications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Degree</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>University</TableHead>
                    <TableHead>Year</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hod.qualifications.map((qualification, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{qualification.degree}</TableCell>
                      <TableCell>{qualification.field}</TableCell>
                      <TableCell>{qualification.university}</TableCell>
                      <TableCell>{qualification.year}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Research Publications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Journal</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Citations</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hod.publications.map((publication, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{publication.title}</TableCell>
                      <TableCell>{publication.journal}</TableCell>
                      <TableCell>{publication.year}</TableCell>
                      <TableCell>{publication.citation}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="awards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Awards & Recognitions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Organization/Conference</TableHead>
                    <TableHead>Year</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hod.awards.map((award, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{award.title}</TableCell>
                      <TableCell>{award.organization || award.conference || award.institution}</TableCell>
                      <TableCell>{award.year}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit HOD Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit HOD Profile</DialogTitle>
            <DialogDescription>Update the profile information for this HOD.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={editedHOD.firstName}
                  onChange={(e) => setEditedHOD({ ...editedHOD, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={editedHOD.lastName}
                  onChange={(e) => setEditedHOD({ ...editedHOD, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={editedHOD.email}
                  onChange={(e) => setEditedHOD({ ...editedHOD, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={editedHOD.phone}
                  onChange={(e) => setEditedHOD({ ...editedHOD, phone: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  value={editedHOD.department}
                  onValueChange={(value) => setEditedHOD({ ...editedHOD, department: value })}
                >
                  <SelectTrigger id="department">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Select
                  value={editedHOD.designation}
                  onValueChange={(value) => setEditedHOD({ ...editedHOD, designation: value })}
                >
                  <SelectTrigger id="designation">
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Professor">Professor</SelectItem>
                    <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                    <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={editedHOD.employeeId}
                  onChange={(e) => setEditedHOD({ ...editedHOD, employeeId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="joinDate">Join Date</Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={editedHOD.joinDate}
                  onChange={(e) => setEditedHOD({ ...editedHOD, joinDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditHOD}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
