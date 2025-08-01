"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Check, X, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import type { CourseConfig, CourseOutcome, ProgramOutcome, ProgramSpecificOutcome } from "../types"

interface OutcomesTabProps {
  courseConfig: CourseConfig
  courseOutcomes: Record<string, CourseOutcome[]>
  programOutcomes: ProgramOutcome[]
  programSpecificOutcomes: ProgramSpecificOutcome[]
  selectedCourse: string
  editingCO: string | null
  editingPO: string | null
  editingPSO: string | null
  tempEditValue: string
  setTempEditValue: (value: string) => void
  startEditingCO: (coId: string, field: keyof CourseOutcome) => void
  startEditingPO: (poId: string, field: keyof ProgramOutcome) => void
  startEditingPSO: (psoId: string, field: keyof ProgramSpecificOutcome) => void
  saveEditCO: (coId: string, field: keyof CourseOutcome) => boolean
  saveEditPO: (poId: string, field: keyof ProgramOutcome) => boolean
  saveEditPSO: (psoId: string, field: keyof ProgramSpecificOutcome) => boolean
  cancelEdit: () => void
  addCourseOutcome?: (course: string) => void
  addProgramOutcome?: () => void
  addProgramSpecificOutcome?: () => void
  deleteCourseOutcome?: (course: string, coId: string) => void
  deleteProgramOutcome?: (poId: string) => void
  deleteProgramSpecificOutcome?: (psoId: string) => void
}

export default function OutcomesTab({
  courseConfig,
  courseOutcomes,
  programOutcomes,
  programSpecificOutcomes,
  selectedCourse,
  editingCO,
  editingPO,
  editingPSO,
  tempEditValue,
  setTempEditValue,
  startEditingCO,
  startEditingPO,
  startEditingPSO,
  saveEditCO,
  saveEditPO,
  saveEditPSO,
  cancelEdit,
  addCourseOutcome,
  addProgramOutcome,
  addProgramSpecificOutcome,
  deleteCourseOutcome,
  deleteProgramOutcome,
  deleteProgramSpecificOutcome,
}: OutcomesTabProps) {
  const { toast } = useToast()
  const [showDeleteCODialog, setShowDeleteCODialog] = useState(false)
  const [showDeletePODialog, setShowDeletePODialog] = useState(false)
  const [showDeletePSODialog, setShowDeletePSODialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState("")

  const handleSaveEditCO = (coId: string, field: keyof CourseOutcome) => {
    const success = saveEditCO(coId, field)
    if (success) {
      toast({
        title: "Updated",
        description: `Course Outcome ${field} updated successfully.`,
      })
    }
  }

  const handleSaveEditPO = (poId: string, field: keyof ProgramOutcome) => {
    const success = saveEditPO(poId, field)
    if (success) {
      toast({
        title: "Updated",
        description: `Program Outcome ${field} updated successfully.`,
      })
    }
  }

  const handleSaveEditPSO = (psoId: string, field: keyof ProgramSpecificOutcome) => {
    const success = saveEditPSO(psoId, field)
    if (success) {
      toast({
        title: "Updated",
        description: `Program Specific Outcome ${field} updated successfully.`,
      })
    }
  }

  const handleAddCO = () => {
    if (addCourseOutcome) {
      addCourseOutcome(selectedCourse)
      toast({
        title: "Added",
        description: "New Course Outcome added successfully.",
      })
    }
  }

  const handleAddPO = () => {
    if (addProgramOutcome) {
      addProgramOutcome()
      toast({
        title: "Added",
        description: "New Program Outcome added successfully.",
      })
    }
  }

  const handleAddPSO = () => {
    if (addProgramSpecificOutcome) {
      addProgramSpecificOutcome()
      toast({
        title: "Added",
        description: "New Program Specific Outcome added successfully.",
      })
    }
  }

  const confirmDeleteCO = (coId: string) => {
    setItemToDelete(coId)
    setShowDeleteCODialog(true)
  }

  const confirmDeletePO = (poId: string) => {
    setItemToDelete(poId)
    setShowDeletePODialog(true)
  }

  const confirmDeletePSO = (psoId: string) => {
    setItemToDelete(psoId)
    setShowDeletePSODialog(true)
  }

  const handleDeleteCO = () => {
    if (deleteCourseOutcome && itemToDelete) {
      deleteCourseOutcome(selectedCourse, itemToDelete)
      toast({
        title: "Deleted",
        description: `Course Outcome ${itemToDelete} deleted successfully.`,
      })
      setShowDeleteCODialog(false)
    }
  }

  const handleDeletePO = () => {
    if (deleteProgramOutcome && itemToDelete) {
      deleteProgramOutcome(itemToDelete)
      toast({
        title: "Deleted",
        description: `Program Outcome ${itemToDelete} deleted successfully.`,
      })
      setShowDeletePODialog(false)
    }
  }

  const handleDeletePSO = () => {
    if (deleteProgramSpecificOutcome && itemToDelete) {
      deleteProgramSpecificOutcome(itemToDelete)
      toast({
        title: "Deleted",
        description: `Program Specific Outcome ${itemToDelete} deleted successfully.`,
      })
      setShowDeletePSODialog(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>CO-PO Labels</CardTitle>
          <CardDescription>Edit course, program, and specific program outcomes</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium mb-2">Course Outcomes</h3>
            <Button variant="outline" size="sm" onClick={handleAddCO}>
              <Plus className="h-4 w-4 mr-2" /> Add Course Outcome
            </Button>
          </div>
          <div className="grid grid-cols-12 gap-4 font-medium text-sm mb-2">
            <div className="col-span-2">Code</div>
            <div className="col-span-8">Description</div>
            <div className="col-span-2">Actions</div>
          </div>
          {courseOutcomes[selectedCourse]?.map((co) => (
            <div key={co.id} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-2">
                {editingCO === `${co.id}-code` ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempEditValue}
                      onChange={(e) => setTempEditValue(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSaveEditCO(co.id, "code")}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={cancelEdit} className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span>{co.code}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditingCO(co.id, "code")}
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:opacity-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="col-span-8">
                {editingCO === `${co.id}-description` ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempEditValue}
                      onChange={(e) => setTempEditValue(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSaveEditCO(co.id, "description")}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={cancelEdit} className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span>{co.description}</span>
                  </div>
                )}
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                {editingCO !== `${co.id}-description` && (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => startEditingCO(co.id, "description")}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => confirmDeleteCO(co.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium mb-2">Program Outcomes</h3>
            <Button variant="outline" size="sm" onClick={handleAddPO}>
              <Plus className="h-4 w-4 mr-2" /> Add Program Outcome
            </Button>
          </div>
          <div className="grid grid-cols-12 gap-4 font-medium text-sm mb-2">
            <div className="col-span-2">Code</div>
            <div className="col-span-8">Description</div>
            <div className="col-span-2">Actions</div>
          </div>
          {programOutcomes.map((po) => (
            <div key={po.id} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-2">
                {editingPO === `${po.id}-code` ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempEditValue}
                      onChange={(e) => setTempEditValue(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSaveEditPO(po.id, "code")}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={cancelEdit} className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span>{po.code}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditingPO(po.id, "code")}
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:opacity-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="col-span-8">
                {editingPO === `${po.id}-description` ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempEditValue}
                      onChange={(e) => setTempEditValue(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSaveEditPO(po.id, "description")}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={cancelEdit} className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span>{po.description}</span>
                  </div>
                )}
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                {editingPO !== `${po.id}-description` && (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => startEditingPO(po.id, "description")}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => confirmDeletePO(po.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium mb-2">Program Specific Outcomes</h3>
            <Button variant="outline" size="sm" onClick={handleAddPSO}>
              <Plus className="h-4 w-4 mr-2" /> Add Program Specific Outcome
            </Button>
          </div>
          <div className="grid grid-cols-12 gap-4 font-medium text-sm mb-2">
            <div className="col-span-2">Code</div>
            <div className="col-span-8">Description</div>
            <div className="col-span-2">Actions</div>
          </div>
          {programSpecificOutcomes.map((pso) => (
            <div key={pso.id} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-2">
                {editingPSO === `${pso.id}-code` ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempEditValue}
                      onChange={(e) => setTempEditValue(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSaveEditPSO(pso.id, "code")}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={cancelEdit} className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span>{pso.code}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditingPSO(pso.id, "code")}
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:opacity-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="col-span-8">
                {editingPSO === `${pso.id}-description` ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={tempEditValue}
                      onChange={(e) => setTempEditValue(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSaveEditPSO(pso.id, "description")}
                      className="h-8 w-8"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={cancelEdit} className="h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span>{pso.description}</span>
                  </div>
                )}
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                {editingPSO !== `${pso.id}-description` && (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => startEditingPSO(pso.id, "description")}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => confirmDeletePSO(pso.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Delete Confirmation Dialogs */}
        <Dialog open={showDeleteCODialog} onOpenChange={setShowDeleteCODialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Course Outcome</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this Course Outcome? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteCODialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteCO}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDeletePODialog} onOpenChange={setShowDeletePODialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Program Outcome</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this Program Outcome? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeletePODialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePO}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showDeletePSODialog} onOpenChange={setShowDeletePSODialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Program Specific Outcome</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this Program Specific Outcome? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeletePSODialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePSO}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
