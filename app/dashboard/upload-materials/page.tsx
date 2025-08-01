"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { BookOpen, FileText, Filter, Search, Upload, Video, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getActiveRole } from "@/lib/role-switcher" // Import getActiveRole

// Mock data for study materials
const initialMaterialsData = [
  {
    id: 1,
    title: "Introduction to Computer Science",
    description: "Comprehensive notes on computer science fundamentals",
    type: "PDF",
    course: "Computer Science 101",
    courseCode: "CS101",
    size: "2.5 MB",
    uploadedAt: "2025-03-01",
  },
  {
    id: 2,
    title: "Data Structures & Algorithms",
    description: "Lecture notes on common data structures and algorithms",
    type: "PDF",
    course: "Data Structures",
    courseCode: "DS201",
    size: "3.2 MB",
    uploadedAt: "2025-03-01",
  },
  {
    id: 3,
    title: "Artificial Intelligence Fundamentals",
    description: "Introduction to AI concepts and applications",
    type: "PDF",
    course: "Artificial Intelligence",
    courseCode: "AI301",
    size: "4.1 MB",
    uploadedAt: "2025-02-28",
  },
  {
    id: 4,
    title: "Database Systems Overview",
    description: "Lecture video on database design principles",
    type: "Video",
    course: "Database Systems",
    courseCode: "DB201",
    size: "120 MB",
    uploadedAt: "2025-02-27",
  },
  {
    id: 5,
    title: "Web Development Basics",
    description: "Tutorial on HTML, CSS, and JavaScript",
    type: "Video",
    course: "Web Development",
    courseCode: "WD101",
    size: "150 MB",
    uploadedAt: "2025-02-26",
  },
]

export default function UploadMaterialsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [materialsData, setMaterialsData] = useState(initialMaterialsData)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    description: "",
    type: "PDF",
    course: "",
    courseCode: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [activeRole, setActiveRole] = useState<string | null>(null) // State for active role

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setActiveRole(getActiveRole(parsedUser)) // Set active role
    }

    // Listen for role changes
    const handleRoleChange = () => {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        setActiveRole(getActiveRole(parsedUser))
      }
    }
    window.addEventListener("roleChange", handleRoleChange)
    return () => window.removeEventListener("roleChange", handleRoleChange)
  }, [])

  // Filter materials based on search term, selected type, and selected course
  const filteredMaterials = materialsData.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || material.type === selectedType
    const matchesCourse = selectedCourse === "all" || material.course === selectedCourse

    return matchesSearch && matchesType && matchesCourse
  })

  // Get unique courses for filter
  const uniqueCourses = Array.from(new Set(materialsData.map((material) => material.course)))

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)

      // Auto-detect file type
      if (file.type.includes("pdf")) {
        setNewMaterial({ ...newMaterial, type: "PDF" })
      } else if (file.type.includes("video")) {
        setNewMaterial({ ...newMaterial, type: "Video" })
      }
    }
  }

  const handleUpload = () => {
    // Validate form
    if (!newMaterial.title || !newMaterial.course || !newMaterial.courseCode || !selectedFile) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and select a file",
        variant: "destructive",
      })
      return
    }

    // Add new material
    const newId = Math.max(...materialsData.map((material) => material.id)) + 1
    const materialToAdd = {
      ...newMaterial,
      id: newId,
      size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString().split("T")[0],
    }

    setMaterialsData([...materialsData, materialToAdd])
    setIsUploadDialogOpen(false)

    // Reset form
    setNewMaterial({
      title: "",
      description: "",
      type: "PDF",
      course: "",
      courseCode: "",
    })
    setSelectedFile(null)

    toast({
      title: "Material uploaded",
      description: `${newMaterial.title} has been uploaded successfully.`,
    })
  }

  const handleDeleteMaterial = (id: number) => {
    setMaterialsData(materialsData.filter((material) => material.id !== id))

    toast({
      title: "Material deleted",
      description: "The material has been deleted successfully.",
    })
  }

  // Modify the permission check to include coordinators
  if (!user || !activeRole || !["faculty", "coordinator", "principal", "hod"].includes(activeRole)) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>
          You don't have permission to access this page. Only faculty, coordinators, HODs, and principal can upload
          materials.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Upload Study Materials</h2>
          <p className="text-muted-foreground">Upload and manage study materials for your courses</p>
        </div>
        <Button className="gap-1" onClick={() => setIsUploadDialogOpen(true)}>
          <Upload className="h-4 w-4" />
          <span>Upload Material</span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materialsData.length}</div>
            <p className="text-xs text-muted-foreground">Uploaded materials</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PDF Documents</CardTitle>
            <FileText className="h-4 w-4 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {materialsData.filter((material) => material.type === "PDF").length}
            </div>
            <p className="text-xs text-muted-foreground">PDF study materials</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Lectures</CardTitle>
            <Video className="h-4 w-4 text-purple-500 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {materialsData.filter((material) => material.type === "Video").length}
            </div>
            <p className="text-xs text-muted-foreground">Video lectures</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Covered</CardTitle>
            <BookOpen className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCourses.length}</div>
            <p className="text-xs text-muted-foreground">Courses with materials</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-background">
        <CardHeader>
          <CardTitle>Uploaded Materials</CardTitle>
          <CardDescription>View and manage your uploaded study materials</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div className="flex flex-1 items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 w-full md:w-[300px]"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-8 w-[150px]">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {uniqueCourses.map((course) => (
                    <SelectItem key={course} value={course}>
                      {course}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.length === 0 ? (
              <div className="col-span-full text-center py-4">No materials found matching your search criteria</div>
            ) : (
              filteredMaterials.map((material) => (
                <Card key={material.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{material.title}</CardTitle>
                      {material.type === "PDF" ? (
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Video className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <CardDescription>{material.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Course:</span>
                        <span>
                          {material.course} ({material.courseCode})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{material.size}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Uploaded:</span>
                        <span>{new Date(material.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                  <div className="p-4 pt-0 flex justify-between">
                    <Button variant="outline" size="sm" onClick={() => handleDeleteMaterial(material.id)}>
                      Delete
                    </Button>
                    <Button size="sm">View</Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Material Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Upload Study Material</DialogTitle>
            <DialogDescription>Upload a new study material for your students.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Introduction to Computer Science"
                value={newMaterial.title}
                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the material"
                className="min-h-[100px]"
                value={newMaterial.description}
                onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courseCode">Course Code</Label>
                <Input
                  id="courseCode"
                  placeholder="e.g., CS101"
                  value={newMaterial.courseCode}
                  onChange={(e) => setNewMaterial({ ...newMaterial, courseCode: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course Name</Label>
                <Input
                  id="course"
                  placeholder="e.g., Computer Science 101"
                  value={newMaterial.course}
                  onChange={(e) => setNewMaterial({ ...newMaterial, course: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Material Type</Label>
              <Select
                value={newMaterial.type}
                onValueChange={(value) => setNewMaterial({ ...newMaterial, type: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF Document</SelectItem>
                  <SelectItem value="Video">Video Lecture</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Upload File</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                  accept={newMaterial.type === "PDF" ? ".pdf" : "video/*"}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  {selectedFile ? "Change File" : "Select File"}
                </Button>
                {selectedFile && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => setSelectedFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {selectedFile && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected file: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpload}>Upload Material</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
