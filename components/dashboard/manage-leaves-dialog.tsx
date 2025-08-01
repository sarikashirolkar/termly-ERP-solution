"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiService } from "@/lib/supabase-service"
import type { LeaveBalance } from "@/lib/database-schema"

interface ManageLeavesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ManageLeavesDialog: React.FC<ManageLeavesDialogProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast()
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance>({
    CL: 10,
    RH: 5,
    OOD: 15,
    CO: 5,
    SL: 10,
    LWP: 10,
    EL: 30,
  })
  const [loading, setLoading] = useState(false)
  const [fetchingData, setFetchingData] = useState(false)

  useEffect(() => {
    if (open) {
      fetchLeaveAllocations()
    }
  }, [open])

  const fetchLeaveAllocations = async () => {
    setFetchingData(true)
    try {
      const allocations = await apiService.leaveAllocations.getLeaveBalances()
      setLeaveBalances(allocations)
    } catch (error) {
      console.error("Error fetching leave allocations:", error)
      toast({
        title: "Error",
        description: "Failed to load leave allocations.",
        variant: "destructive",
      })
    } finally {
      setFetchingData(false)
    }
  }

  const handleLeaveBalanceChange = (leaveType: keyof LeaveBalance, value: number) => {
    setLeaveBalances((prevBalances) => ({
      ...prevBalances,
      [leaveType]: Math.max(0, value), // Ensure non-negative values
    }))
  }

  const handleSaveLeaves = async () => {
    setLoading(true)
    try {
      await apiService.leaveAllocations.updateLeaveBalances(leaveBalances)

      toast({
        title: "Success",
        description: "Leave allocations updated successfully.",
      })
      onOpenChange(false) // Close the dialog
    } catch (error) {
      console.error("Error updating leave allocations:", error)
      toast({
        title: "Error",
        description: "Failed to update leave allocations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const leaveCategories = [
    { key: "CL" as keyof LeaveBalance, label: "Casual Leaves" },
    { key: "EL" as keyof LeaveBalance, label: "Earned Leaves" },
    { key: "LWP" as keyof LeaveBalance, label: "Leaves Without Pay" },
    { key: "SL" as keyof LeaveBalance, label: "Sick Leaves" },
    { key: "RH" as keyof LeaveBalance, label: "Restricted Holidays" },
    { key: "OOD" as keyof LeaveBalance, label: "On Official Duty" },
    { key: "CO" as keyof LeaveBalance, label: "Compensatory Off" },
  ]

  // Calculate "Other Leaves" as sum of RH, OOD, CO, SL
  const otherLeaves = leaveBalances.RH + leaveBalances.OOD + leaveBalances.CO + leaveBalances.SL

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Manage Leave Allocations</DialogTitle>
          <DialogDescription>Set the number of leaves available for each category.</DialogDescription>
        </DialogHeader>

        {fetchingData ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading leave allocations...</span>
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            {/* Main leave categories in 2x2 grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="CL" className="text-sm font-medium">
                  Casual Leaves
                </Label>
                <Input
                  type="number"
                  id="CL"
                  value={leaveBalances.CL}
                  onChange={(e) => handleLeaveBalanceChange("CL", Number(e.target.value))}
                  className="text-center text-lg font-semibold"
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="EL" className="text-sm font-medium">
                  Earned Leaves
                </Label>
                <Input
                  type="number"
                  id="EL"
                  value={leaveBalances.EL}
                  onChange={(e) => handleLeaveBalanceChange("EL", Number(e.target.value))}
                  className="text-center text-lg font-semibold"
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="LWP" className="text-sm font-medium">
                  Leaves Without Pay
                </Label>
                <Input
                  type="number"
                  id="LWP"
                  value={leaveBalances.LWP}
                  onChange={(e) => handleLeaveBalanceChange("LWP", Number(e.target.value))}
                  className="text-center text-lg font-semibold"
                  min="0"
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Other Leaves</Label>
                <div className="text-center text-lg font-semibold p-2 bg-muted rounded-md">{otherLeaves}</div>
                <p className="text-xs text-muted-foreground">Sum of SL, RH, OOD, CO</p>
              </div>
            </div>

            {/* Detailed breakdown for "Other Leaves" */}
            <div className="border-t pt-4">
              <Label className="text-sm font-medium mb-3 block">Other Leave Categories</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="SL" className="text-xs">
                    Sick Leaves
                  </Label>
                  <Input
                    type="number"
                    id="SL"
                    value={leaveBalances.SL}
                    onChange={(e) => handleLeaveBalanceChange("SL", Number(e.target.value))}
                    className="text-center"
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="RH" className="text-xs">
                    Restricted Holidays
                  </Label>
                  <Input
                    type="number"
                    id="RH"
                    value={leaveBalances.RH}
                    onChange={(e) => handleLeaveBalanceChange("RH", Number(e.target.value))}
                    className="text-center"
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="OOD" className="text-xs">
                    On Official Duty
                  </Label>
                  <Input
                    type="number"
                    id="OOD"
                    value={leaveBalances.OOD}
                    onChange={(e) => handleLeaveBalanceChange("OOD", Number(e.target.value))}
                    className="text-center"
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="CO" className="text-xs">
                    Compensatory Off
                  </Label>
                  <Input
                    type="number"
                    id="CO"
                    value={leaveBalances.CO}
                    onChange={(e) => handleLeaveBalanceChange("CO", Number(e.target.value))}
                    className="text-center"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSaveLeaves} disabled={loading || fetchingData}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ManageLeavesDialog
