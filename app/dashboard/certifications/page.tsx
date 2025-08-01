"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { FileText, Upload, X, Download, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Certification {
  id: string
  name: string
  issuer: string
  date: string
  file: string
  fileType: string
  fileSize: string
}

export default function CertificationsPage() {
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [viewCertification, setViewCertification] = useState<Certification | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load certifications from localStorage
    const storedCertifications = localStorage.getItem("certifications")
    if (storedCertifications) {
      setCertifications(JSON.parse(storedCertifications))
    }
  }, [])

  useEffect(() => {
    // Save certifications to localStorage whenever they change
    localStorage.setItem("certifications", JSON.stringify(certifications))
  }, [certifications])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if file is PDF
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // Read file as data URL
    const reader = new FileReader()
    reader.onload = (event) => {
      const newCertification: Certification = {
        id: Date.now().toString(),
        name: file.name.replace(".pdf", ""),
        issuer: "",
        date: new Date().toISOString().split("T")[0],
        file: event.target?.result as string,
        fileType: file.type,
        fileSize: formatFileSize(file.size),
      }

      setCertifications((prev) => [...prev, newCertification])
      setIsUploading(false)

      toast({
        title: "Certification uploaded",
        description: "Your certification has been uploaded successfully",
      })

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }

    reader.readAsDataURL(file)
  }

  const handleDeleteCertification = (id: string) => {
    setCertifications((prev) => prev.filter((cert) => cert.id !== id))
    toast({
      title: "Certification deleted",
      description: "Your certification has been deleted",
    })
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const handleDownload = (certification: Certification) => {
    const link = document.createElement("a")
    link.href = certification.file
    link.download = `${certification.name}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Certifications</h1>
        <p className="text-muted-foreground">Upload and manage your course certifications</p>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <Badge variant="outline" className="text-sm">
            Total Certifications: {certifications.length}
          </Badge>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Certification
          </Button>
        </div>
      </div>

      {certifications.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              You haven't uploaded any certifications yet.
              <br />
              Upload your first certification to get started.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Certification
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {certifications.map((certification) => (
            <Card key={certification.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg truncate" title={certification.name}>
                  {certification.name}
                </CardTitle>
                <CardDescription>Uploaded on {new Date(certification.date).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{certification.fileSize}</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setViewCertification(certification)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(certification)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  onClick={() => handleDeleteCertification(certification.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* PDF Viewer Dialog */}
      {viewCertification && (
        <Dialog open={!!viewCertification} onOpenChange={(open) => !open && setViewCertification(null)}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>{viewCertification.name}</DialogTitle>
              <DialogDescription>Uploaded on {new Date(viewCertification.date).toLocaleDateString()}</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              <iframe src={viewCertification.file} className="w-full h-[60vh]" title={viewCertification.name} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleDownload(viewCertification)}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button onClick={() => setViewCertification(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
