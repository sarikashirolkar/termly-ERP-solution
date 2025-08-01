"use client"

import { useState, useEffect } from "react"
import { BookOpen, Download, FileText, Filter, Search, Video } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { mockStudyMaterials } from "@/lib/mock-materials"

// Use the imported mock data
const MaterialsPage = () => {
  const [studyMaterials, setStudyMaterials] = useState(mockStudyMaterials)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedCourse, setSelectedCourse] = useState("all")
  const [userRole, setUserRole] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Get user role from localStorage
    const user = localStorage.getItem("user")
    if (user) {
      const { role } = JSON.parse(user)
      setUserRole(role)
    }
  }, [])

  const filteredMaterials = studyMaterials.filter((material) => {
    const matchesSearch =
      material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || material.type === selectedType
    const matchesCourse = selectedCourse === "all" || material.course === selectedCourse

    return matchesSearch && matchesType && matchesCourse
  })

  const uniqueCourses = Array.from(new Set(studyMaterials.map((material) => material.course)))

  const handleDownload = (id: number) => {
    const material = studyMaterials.find((m) => m.id === id)

    if (!material) {
      toast({
        title: "Error",
        description: "Material not found",
        variant: "destructive",
      })
      return
    }

    // Create mock file data based on material type
    let fileData: Blob
    let fileName: string

    if (material.type === "PDF") {
      // For PDF, create a simple text blob (in a real app, this would be the actual PDF data)
      fileData = new Blob([`Mock PDF content for ${material.title}`], { type: "application/pdf" })
      fileName = `${material.title.replace(/\s+/g, "_")}.pdf`
    } else if (material.type === "Video") {
      // For video, create a simple text blob (in a real app, this would be the actual video data)
      fileData = new Blob([`Mock video content for ${material.title}`], { type: "video/mp4" })
      fileName = `${material.title.replace(/\s+/g, "_")}.mp4`
    } else {
      fileData = new Blob([`Mock content for ${material.title}`], { type: "text/plain" })
      fileName = `${material.title.replace(/\s+/g, "_")}.txt`
    }

    // Create a download link and trigger the download
    const url = URL.createObjectURL(fileData)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Download started",
      description: `Downloading ${material.title}...`,
    })
  }

  const handlePreview = (id: number) => {
    toast({
      title: "Preview loading",
      description: "Opening file preview...",
    })
  }

  const handleUpload = () => {
    toast({
      title: "Upload material",
      description: "Opening upload dialog...",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Study Materials</h2>
          <p className="text-muted-foreground">Access and manage your study materials</p>
        </div>
        {(userRole === "faculty" || userRole === "admin") && (
          <Button className="gap-1" onClick={handleUpload}>
            <BookOpen className="h-4 w-4" />
            <span>Upload Material</span>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Materials</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studyMaterials.length}</div>
            <p className="text-xs text-muted-foreground">Available study materials</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/20 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PDF Documents</CardTitle>
            <FileText className="h-4 w-4 text-green-500 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studyMaterials.filter((material) => material.type === "PDF").length}
            </div>
            <p className="text-xs text-muted-foreground">PDF study materials</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-900/20 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Video Lectures</CardTitle>
            <Video className="h-4 w-4 text-purple-500 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studyMaterials.filter((material) => material.type === "Video").length}
            </div>
            <p className="text-xs text-muted-foreground">Video lectures and tutorials</p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 dark:bg-amber-900/20 border-none shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Covered</CardTitle>
            <BookOpen className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueCourses.length}</div>
            <p className="text-xs text-muted-foreground">Courses with study materials</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Materials</TabsTrigger>
          <TabsTrigger value="pdf">PDF Documents</TabsTrigger>
          <TabsTrigger value="video">Video Lectures</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Study Materials</CardTitle>
              <CardDescription>Browse and access all your study materials</CardDescription>
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
                            <span>{material.course}</span>
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
                      <CardFooter>
                        <div className="flex w-full gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => handlePreview(material.id)}>
                            Preview
                          </Button>
                          <Button className="flex-1 gap-1" onClick={() => handleDownload(material.id)}>
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pdf" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PDF Documents</CardTitle>
              <CardDescription>Browse and access your PDF study materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {studyMaterials
                  .filter((material) => material.type === "PDF")
                  .map((material) => (
                    <Card key={material.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{material.title}</CardTitle>
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <CardDescription>{material.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Course:</span>
                            <span>{material.course}</span>
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
                      <CardFooter>
                        <div className="flex w-full gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => handlePreview(material.id)}>
                            Preview
                          </Button>
                          <Button className="flex-1 gap-1" onClick={() => handleDownload(material.id)}>
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="video" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Video Lectures</CardTitle>
              <CardDescription>Browse and access your video lectures and tutorials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {studyMaterials
                  .filter((material) => material.type === "Video")
                  .map((material) => (
                    <Card key={material.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{material.title}</CardTitle>
                          <Video className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <CardDescription>{material.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Course:</span>
                            <span>{material.course}</span>
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
                      <CardFooter>
                        <div className="flex w-full gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => handlePreview(material.id)}>
                            Preview
                          </Button>
                          <Button className="flex-1 gap-1" onClick={() => handleDownload(material.id)}>
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default MaterialsPage
