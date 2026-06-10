"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Settings,
  Users,
  Database,
  Shield,
  Bell,
  Mail,
  Upload,
  Download,
  Server,
  Key,
  AlertTriangle,
} from "lucide-react"
import { UserImportDialog } from "@/components/user-import-dialog"

export default function SystemSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [systemSettings, setSystemSettings] = useState({
    siteName: "TERMLY Academic System",
    siteDescription: "Comprehensive Academic Management Platform",
    maintenanceMode: false,
    registrationEnabled: false,
    emailNotifications: true,
    smsNotifications: false,
    backupEnabled: true,
    autoBackupInterval: "daily",
    maxFileSize: "10",
    allowedFileTypes: "pdf,doc,docx,jpg,png",
    sessionTimeout: "24",
    passwordMinLength: "8",
    requirePasswordComplexity: true,
    enableTwoFactor: false,
  })
  const { toast } = useToast()

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    // Load system settings from localStorage
    const savedSettings = localStorage.getItem("systemSettings")
    if (savedSettings) {
      setSystemSettings({ ...systemSettings, ...JSON.parse(savedSettings) })
    }
  }, [])

  const handleSettingChange = (key: string, value: any) => {
    const updatedSettings = { ...systemSettings, [key]: value }
    setSystemSettings(updatedSettings)

    // Save to localStorage
    localStorage.setItem("systemSettings", JSON.stringify(updatedSettings))

    toast({
      title: "Setting updated",
      description: "System setting has been updated successfully.",
    })
  }

  const handleImportComplete = (result: any) => {
    toast({
      title: "Import completed",
      description: `Successfully imported ${result.result.successfulImports} users.`,
    })
  }

  const handleExportUsers = () => {
    try {
      const importedUsers = JSON.parse(localStorage.getItem("importedUsers") || "[]")
      const csvContent =
        "data:text/csv;charset=utf-8," +
        "ID,Email,Role,Name,Department,Created At\n" +
        importedUsers
          .map(
            (user: any) =>
              `${user.id},${user.email},${user.role},"${user.first_name} ${user.last_name}",${user.department},${user.created_at}`,
          )
          .join("\n")

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `users_export_${new Date().toISOString().split("T")[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export successful",
        description: "User data has been exported to CSV file.",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export user data. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBackupDatabase = () => {
    // Simulate database backup
    toast({
      title: "Backup initiated",
      description: "Database backup has been started. You will be notified when complete.",
    })
  }

  const handleClearCache = () => {
    // Clear application cache
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name)
        })
      })
    }

    toast({
      title: "Cache cleared",
      description: "Application cache has been cleared successfully.",
    })
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access system settings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">Manage system configuration and user data</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Configure basic system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={systemSettings.siteName}
                    onChange={(e) => handleSettingChange("siteName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => handleSettingChange("sessionTimeout", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Input
                  id="siteDescription"
                  value={systemSettings.siteDescription}
                  onChange={(e) => handleSettingChange("siteDescription", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={systemSettings.maxFileSize}
                    onChange={(e) => handleSettingChange("maxFileSize", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                  <Input
                    id="allowedFileTypes"
                    value={systemSettings.allowedFileTypes}
                    onChange={(e) => handleSettingChange("allowedFileTypes", e.target.value)}
                    placeholder="pdf,doc,docx,jpg,png"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Import and manage user data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button onClick={() => setImportDialogOpen(true)} className="h-20 flex-col gap-2">
                  <Upload className="h-6 w-6" />
                  Import Users
                  <span className="text-xs opacity-75">Import from CSV files</span>
                </Button>
                <Button variant="outline" onClick={handleExportUsers} className="h-20 flex-col gap-2 bg-transparent">
                  <Download className="h-6 w-6" />
                  Export Users
                  <span className="text-xs opacity-75">Export to CSV file</span>
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>User Registration</Label>
                  <p className="text-sm text-muted-foreground">Allow new users to register accounts</p>
                </div>
                <Switch
                  checked={systemSettings.registrationEnabled}
                  onCheckedChange={(checked) => handleSettingChange("registrationEnabled", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure security and authentication settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={systemSettings.passwordMinLength}
                    onChange={(e) => handleSettingChange("passwordMinLength", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Password Complexity</Label>
                    <p className="text-sm text-muted-foreground">Require uppercase, lowercase, numbers, and symbols</p>
                  </div>
                  <Switch
                    checked={systemSettings.requirePasswordComplexity}
                    onCheckedChange={(checked) => handleSettingChange("requirePasswordComplexity", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Enable 2FA for enhanced security</p>
                  </div>
                  <Switch
                    checked={systemSettings.enableTwoFactor}
                    onCheckedChange={(checked) => handleSettingChange("enableTwoFactor", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure system notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via email</p>
                  </div>
                </div>
                <Switch
                  checked={systemSettings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5 flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                  </div>
                </div>
                <Switch
                  checked={systemSettings.smsNotifications}
                  onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Maintenance
              </CardTitle>
              <CardDescription>System maintenance and backup settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Put the system in maintenance mode</p>
                </div>
                <Switch
                  checked={systemSettings.maintenanceMode}
                  onCheckedChange={(checked) => handleSettingChange("maintenanceMode", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Backups</Label>
                  <p className="text-sm text-muted-foreground">Enable automatic database backups</p>
                </div>
                <Switch
                  checked={systemSettings.backupEnabled}
                  onCheckedChange={(checked) => handleSettingChange("backupEnabled", checked)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <Button onClick={handleBackupDatabase} className="flex-col gap-2 h-16">
                  <Database className="h-5 w-5" />
                  Backup Database
                </Button>
                <Button variant="outline" onClick={handleClearCache} className="flex-col gap-2 h-16 bg-transparent">
                  <Server className="h-5 w-5" />
                  Clear Cache
                </Button>
                <Button variant="outline" className="flex-col gap-2 h-16 bg-transparent">
                  <Key className="h-5 w-5" />
                  Reset API Keys
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <UserImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportComplete={handleImportComplete}
      />
    </div>
  )
}
