"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Subject {
  id: string
  name: string
  code: string
  credits: number
}

export default function ViewSubjectsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [academicYear, setAcademicYear] = useState<string>("")
  const [semester, setSemester] = useState<string>("")
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    // Retrieve selected values from localStorage
    const storedYear = localStorage.getItem("selectedAcademicYear")
    const storedSemester = localStorage.getItem("selectedSemester")

    if (!storedYear || !storedSemester) {
      toast({
        title: "Missing Information",
        description: "Please select academic year and semester first",
        variant: "destructive",
      })
      router.push("/dashboard/manage-subjects")
      return
    }

    setAcademicYear(storedYear)
    setSemester(storedSemester)

    // Load subjects for this academic year and semester
    const storageKey = `subjects_${storedYear}_${storedSemester}`
    const storedSubjects = localStorage.getItem(storageKey)

    if (storedSubjects) {
      setSubjects(JSON.parse(storedSubjects))
    } else {
      setSubjects([])
    }
  }, [router, toast])

  const handleDeleteClick = (subjectId: string) => {
    setDeleteSubjectId(subjectId)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (!deleteSubjectId) return

    const updatedSubjects = subjects.filter((subject) => subject.id !== deleteSubjectId)
    setSubjects(updatedSubjects)

    // Update localStorage
    const storageKey = `subjects_${academicYear}_${semester}`
    localStorage.setItem(storageKey, JSON.stringify(updatedSubjects))

    toast({
      title: "Subject Deleted",
      description: "The subject has been deleted successfully",
    })

    setShowDeleteDialog(false)
    setDeleteSubjectId(null)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/manage-subjects")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">View Subjects</h1>
      </div>

      <div className="mb-6 flex items-center">
        <div className="bg-muted px-3 py-1 rounded-md text-sm font-medium mr-2">{academicYear}</div>
        <div className="bg-muted px-3 py-1 rounded-md text-sm font-medium">Semester {semester}</div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subject List</CardTitle>
            <CardDescription>
              All subjects for {academicYear}, Semester {semester}
            </CardDescription>
          </div>
          <Button onClick={() => router.push("/dashboard/manage-subjects/add")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </CardHeader>
        <CardContent>
          {subjects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Code</TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell className="font-medium">{subject.code}</TableCell>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>{subject.credits}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteClick(subject.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No subjects found for this semester</p>
              <Button onClick={() => router.push("/dashboard/manage-subjects/add")}>Add Your First Subject</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the subject.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
