"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Download } from "lucide-react"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { achievementService } from "@/lib/supabase-service"
import { useAuth } from "@/lib/auth"
import type { Achievement } from "@/lib/database-schema"

export function MyAchievements() {
  const { user } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchAchievements = async () => {
      if (user?.id) {
        setLoading(true)
        try {
          const data = await achievementService.getByStudent(user.id)
          setAchievements(data)
        } catch (error) {
          console.error("Error fetching student achievements:", error)
          toast({
            title: "Error",
            description: "Failed to load your achievements.",
            variant: "destructive",
          })
        } finally {
          setLoading(false)
        }
      }
    }
    fetchAchievements()
  }, [user?.id, toast])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading achievements...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No achievements found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {achievements.map((achievement) => (
                <TableRow key={achievement.id}>
                  <TableCell className="font-medium">{achievement.title}</TableCell>
                  <TableCell>{achievement.type}</TableCell>
                  <TableCell>{achievement.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        achievement.status === "verified"
                          ? "default"
                          : achievement.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {achievement.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {achievement.certificate_url && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={achievement.certificate_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View Certificate</span>
                        </a>
                      </Button>
                    )}
                    {/* Add download functionality if applicable */}
                    {achievement.certificate_url && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={achievement.certificate_url} download>
                          <Download className="h-4 w-4" />
                          <span className="sr-only">Download Certificate</span>
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
