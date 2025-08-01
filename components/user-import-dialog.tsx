"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, Download, FileText, Users, GraduationCap, UserCheck, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UserImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportComplete?: (result: any) => void
}

export function UserImportDialog({ open, onOpenChange, onImportComplete }: UserImportDialogProps) {
  const [importType, setImportType] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const { toast } = useToast()

  const importTypes = [
    {
      value: "students",
      label: "Students",
      icon: Users,
      description: "Import student data with USN, semester, section details",
    },
    {
      value: "faculty",
      label: "Faculty",
      icon: GraduationCap,
      description: "Import faculty data with employee ID, designation details",
    },
    { value: "hods", label: "HODs", icon: UserCheck, description: "Import Head of Department data" },
    { value: "coordinators", label: "Coordinators", icon: FileText, description: "Import coordinator data" },
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV file.",
          variant: "destructive",
        })
        return
      }
      setFile(selectedFile)
    }
  }

  const handleDownloadTemplate = async () => {
    if (!importType) {
      toast({
        title: "Select import type",
        description: "Please select an import type first.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/users/templates?type=${importType}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${importType}_import_template.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "Template downloaded",
          description: `${importType} import template has been downloaded.`,
        })
      } else {
        throw new Error("Failed to download template")
      }
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download template. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleImport = async () => {
    if (!file || !importType) {
      toast({
        title: "Missing information",
        description: "Please select both import type and file.",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)
    setImportResult(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("importType", importType)
      formData.append("importedBy", "admin") // In real app, get from user session

      const response = await fetch("/api/users/import", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()
      setImportResult(result)

      if (result.success) {
        // Store imported users in localStorage for demo purposes
        // In a real app, this would be handled by the backend
        const existingUsers = JSON.parse(localStorage.getItem("importedUsers") || "[]")
        const newUsers = result.result.importedUsers || []
        localStorage.setItem("importedUsers", JSON.stringify([...existingUsers, ...newUsers]))

        toast({
          title: "Import successful",
          description: result.message,
        })

        if (onImportComplete) {
          onImportComplete(result)
        }
      } else {
        toast({
          title: "Import failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Import error",
        description: "An error occurred during import. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    setImportType("")
    setFile(null)
    setImportResult(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Users</DialogTitle>
          <DialogDescription>
            Import users from CSV files. Download the template first to ensure proper formatting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Import Type Selection */}
          <div className="space-y-3">
            <Label>Import Type</Label>
            <div className="grid grid-cols-1 gap-3">
              {importTypes.map((type) => (
                <Card
                  key={type.value}
                  className={`cursor-pointer transition-colors ${
                    importType === type.value ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setImportType(type.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <type.icon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <h4 className="font-medium">{type.label}</h4>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            importType === type.value ? "border-primary bg-primary" : "border-muted-foreground"
                          }`}
                        >
                          {importType === type.value && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Template Download */}
          <div className="space-y-2">
            <Label>Download Template</Label>
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              disabled={!importType}
              className="w-full bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              Download {importType ? importTypes.find((t) => t.value === importType)?.label : "Template"} Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csvFile">Upload CSV File</Label>
            <Input id="csvFile" type="file" accept=".csv" onChange={handleFileChange} disabled={isImporting} />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Import Result */}
          {importResult && (
            <Card className={importResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              <CardHeader>
                <CardTitle className={`text-sm ${importResult.success ? "text-green-800" : "text-red-800"}`}>
                  Import {importResult.success ? "Successful" : "Failed"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>Total Records: {importResult.result.totalRecords}</p>
                  <p className="text-green-600">Successful: {importResult.result.successfulImports}</p>
                  <p className="text-red-600">Failed: {importResult.result.failedImports}</p>

                  {importResult.result.errors && importResult.result.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium text-red-800">Errors:</p>
                      <ul className="list-disc list-inside space-y-1 text-red-700">
                        {importResult.result.errors.slice(0, 5).map((error: string, index: number) => (
                          <li key={index} className="text-xs">
                            {error}
                          </li>
                        ))}
                        {importResult.result.errors.length > 5 && (
                          <li className="text-xs">... and {importResult.result.errors.length - 5} more errors</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            {importResult ? "Close" : "Cancel"}
          </Button>
          {!importResult && (
            <Button onClick={handleImport} disabled={!file || !importType || isImporting}>
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Users
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
