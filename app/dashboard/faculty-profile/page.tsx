"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Book, Building, Calendar, Clock, GraduationCap, Mail, Phone, User } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Faculty {
  id: string
  name: string
  email: string
  phone: string
  department: string
  position: string
  joinDate: string
  status: "Active" | "Inactive" | "On Leave"
  education: string[]
  expertise: string[]
  bio: string
}

export default function FacultyProfile() {
  const searchParams = useSearchParams()
  const facultyId = searchParams.get("id")

  const [faculty, setFaculty] = useState<Faculty | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real application, fetch faculty details
    // For now, we'll use dummy data
    const dummyFaculty: Faculty = {
      id: facultyId || "f1",
      name: "Dr. Alan Turing",
      email: "alan.turing@example.com",
      phone: "+1 (555) 123-4567",
      department: "Computer Science",
      position: "Professor",
      joinDate: "15/1/2020",
      status: "Active",
      education: [
        "Ph.D. in Computer Science, Cambridge University",
        "M.Sc. in Mathematics, Princeton University",
        "B.Sc. in Mathematics, King's College London",
      ],
      expertise: ["Artificial Intelligence", "Machine Learning", "Algorithms", "Computational Theory"],
      bio: "Dr. Alan Turing is a distinguished professor with over 15 years of experience in computer science research and education. His work focuses on artificial intelligence and machine learning algorithms, with applications in various domains including healthcare and finance.",
    }

    setTimeout(() => {
      setFaculty(dummyFaculty)
      setLoading(false)
    }, 500)
  }, [facultyId])

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/faculty">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 animate-pulse">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-muted mb-4"></div>
                <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-6"></div>
                <div className="h-8 bg-muted rounded w-full mb-4"></div>
                <div className="h-8 bg-muted rounded w-full"></div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/4 mb-2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-4 bg-muted rounded w-full"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!faculty) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/faculty">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Faculty Not Found</h1>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center py-10">
              <User className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Faculty Not Found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                The faculty member you are looking for does not exist or has been removed.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/faculty">Back to Faculty List</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/faculty">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Faculty Profile</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={`/placeholder.svg?height=128&width=128&text=${faculty.name.charAt(0)}`} />
                <AvatarFallback>
                  {faculty.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{faculty.name}</h2>
              <p className="text-muted-foreground mb-6">{faculty.position}</p>

              <Badge
                variant={
                  faculty.status === "Active" ? "success" : faculty.status === "On Leave" ? "warning" : "destructive"
                }
                className="mb-4"
              >
                {faculty.status}
              </Badge>

              <div className="w-full space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{faculty.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{faculty.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{faculty.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Joined {faculty.joinDate}</span>
                </div>
              </div>

              <Separator className="my-6" />

              <Button className="w-full" asChild>
                <Link href={`/dashboard/faculty-courses?id=${faculty.id}&name=${faculty.name}`}>View Courses</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{faculty.bio}</p>

            <Separator className="my-6" />

            <h3 className="font-medium mb-3">Education</h3>
            <ul className="list-disc pl-5 space-y-1 mb-6">
              {faculty.education.map((edu, index) => (
                <li key={index} className="text-sm">
                  {edu}
                </li>
              ))}
            </ul>

            <h3 className="font-medium mb-3">Areas of Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {faculty.expertise.map((exp, index) => (
                <Badge key={index} variant="outline">
                  {exp}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Teaching History</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="current">
              <TabsList className="mb-4">
                <TabsTrigger value="current">Current Courses</TabsTrigger>
                <TabsTrigger value="past">Past Courses</TabsTrigger>
              </TabsList>

              <TabsContent value="current">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Introduction to Computer Science</CardTitle>
                      <p className="text-sm text-muted-foreground">CS101 • Fall 2023</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        <Book className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">4 Credits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">42 Students</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Data Structures and Algorithms</CardTitle>
                      <p className="text-sm text-muted-foreground">CS201 • Fall 2023</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-2">
                        <Book className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">4 Credits</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">38 Students</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="past">
                <div className="text-center py-10">
                  <Clock className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">Past Courses</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Historical course data is not available in this demo.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
