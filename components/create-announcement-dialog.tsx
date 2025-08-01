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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { MegaphoneIcon } from "lucide-react"

export function CreateAnnouncementDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isImportant, setIsImportant] = useState(false)
  const [targetAudience, setTargetAudience] = useState("all")
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setAttachedFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !description) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real application, this would be an API call to save the announcement
      // For demo purposes, we'll simulate a network request
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Here you would upload the file and get a URL to store with the announcement
      // const fileUrl = attachedFile ? await uploadFile(attachedFile) : null;

      toast({
        title: "Announcement created",
        description: `Your announcement has been published successfully${attachedFile ? " with attachment" : ""}.`,
      })

      // Reset form and close dialog
      setTitle("")
      setDescription("")
      setIsImportant(false)
      setTargetAudience("all")
      setAttachedFile(null)
      setOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create announcement. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MegaphoneIcon className="h-4 w-4" />
          Create Announcement
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Announcement</DialogTitle>
          <DialogDescription>Create an announcement to notify users. Fill in the details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter announcement details"
                required
                className="min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="attachment">Attachment (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input id="attachment" type="file" onChange={handleFileChange} className="flex-1" />
                {attachedFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAttachedFile(null)}
                    className="h-8 px-2"
                  >
                    Clear
                  </Button>
                )}
              </div>
              {attachedFile && (
                <p className="text-sm text-muted-foreground">
                  File: {attachedFile.name} ({(attachedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target-audience">Target Audience</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger id="target-audience">
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="students">Students Only</SelectItem>
                  <SelectItem value="faculty">Faculty Only</SelectItem>
                  <SelectItem value="department">My Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="important"
                checked={isImportant}
                onCheckedChange={(checked) => setIsImportant(checked as boolean)}
              />
              <Label htmlFor="important">Mark as important</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Publishing..." : "Publish Announcement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
