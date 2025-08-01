"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CameraIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { userService, studentService, facultyService, departmentService } from "@/lib/supabase-service"
import type { User, StudentProfile, FacultyProfile } from "@/lib/database-schema"

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [departmentName, setDepartmentName] = useState("")
  const [role, setRole] = useState("")
  const [userProfile, setUserProfile] = useState<StudentProfile | FacultyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      try {
        const storedUser = localStorage.getItem("user")
        if (!storedUser) {
          toast({
            title: "Error",
            description: "User not logged in.",
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        const parsedUser: User = JSON.parse(storedUser)
        setCurrentUser(parsedUser)

        // Fetch full user details from the 'users' table first
        const { data: fullUserData, error: userError } = await userService.getById(parsedUser.id)
        if (userError || !fullUserData) {
          throw new Error(userError?.message || "Failed to fetch user details.")
        }

        setFirstName(fullUserData.first_name || "")
        setLastName(fullUserData.last_name || "")
        setEmail(fullUserData.email || "")
        setRole(fullUserData.role || "")

        let profileData: StudentProfile | FacultyProfile | null = null
        let departmentShortName: string | undefined

        if (fullUserData.role === "student") {
          const { data, error } = await studentService.getById(fullUserData.id)
          if (error) throw error
          profileData = data
          departmentShortName = data?.department
        } else if (
          fullUserData.role === "faculty" ||
          fullUserData.role === "hod" ||
          fullUserData.role === "coordinator" ||
          fullUserData.role === "admin" ||
          fullUserData.role === "principal"
        ) {
          const { data, error } = await facultyService.getById(fullUserData.id)
          if (error) throw error
          profileData = data
          departmentShortName = data?.department
        }
        setUserProfile(profileData)

        if (departmentShortName) {
          const { data: departmentsData, error: deptError } = await departmentService.getAllDepartments()
          if (deptError) throw deptError
          const department = departmentsData?.find((d) => d.short_name === departmentShortName)
          setDepartmentName(department?.name || departmentShortName)
        } else {
          setDepartmentName("N/A")
        }
      } catch (error: any) {
        console.error("Error fetching user data:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to load user profile.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [toast])

  const handleProfileUpdate = async () => {
    if (!currentUser) return

    setLoading(true)
    try {
      // Update user table
      const { error: userUpdateError } = await userService.update(currentUser.id, {
        first_name: firstName,
        last_name: lastName,
        email: email,
      })
      if (userUpdateError) throw userUpdateError

      // Update role-specific profile table if necessary (e.g., department for faculty/student)
      if (userProfile) {
        if (currentUser.role === "student") {
          await studentService.update(currentUser.id, {
            // Assuming department is updated via user table or not directly editable here
          })
        } else if (
          currentUser.role === "faculty" ||
          currentUser.role === "hod" ||
          currentUser.role === "coordinator" ||
          currentUser.role === "admin" ||
          currentUser.role === "principal"
        ) {
          await facultyService.update(currentUser.id, {
            // Assuming department is updated via user table or not directly editable here
          })
        }
      }

      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      })
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Loading Settings...</h2>
          <p className="text-muted-foreground">Please wait while your profile data loads.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userProfile?.profilePicture || "/placeholder.svg?height=96&width=96"} />
                  <AvatarFallback>
                    {firstName ? firstName.charAt(0) : ""}
                    {lastName ? lastName.charAt(0) : ""}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <CameraIcon className="h-4 w-4" />
                  Change Picture
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input
                    id="first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input
                    id="last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Your last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  type="email"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={departmentName} placeholder="Your department" disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={role} placeholder="Your role" disabled />
              </div>
              <Button onClick={handleProfileUpdate}>Save changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account credentials and security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" placeholder="Enter current password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" placeholder="Confirm new password" />
              </div>
              <Button>Update Password</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Notification settings will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Appearance settings will be implemented here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
