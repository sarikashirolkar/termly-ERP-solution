"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import AttainmentTab from "./components/attainment-tab"
import CourseEndSurveyTab from "./components/course-end-survey-tab"
import { useMappingData } from "./hooks/use-mapping-data"
import { useOutcomesData } from "./hooks/use-outcomes-data"
import { useAttainmentData } from "./hooks/use-attainment-data"
import { useSurveyData } from "./hooks/use-survey-data"

export default function COPOMappingPage() {
  const [activeTab, setActiveTab] = useState("attainment")

  // Use custom hooks for each tab's data management
  const mappingData = useMappingData()
  const outcomesData = useOutcomesData()
  const attainmentData = useAttainmentData()
  const surveyData = useSurveyData()

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="attainment" value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="attainment">Attainment</TabsTrigger>
              <TabsTrigger value="ces">CES</TabsTrigger>
            </TabsList>

            <TabsContent value="attainment" className="p-4">
              <AttainmentTab
                courseOutcomes={outcomesData.courseOutcomes[outcomesData.selectedCourse]}
                courseConfig={outcomesData.courseConfig}
                programOutcomes={outcomesData.programOutcomes}
                programSpecificOutcomes={outcomesData.programSpecificOutcomes}
                selectedCourse={outcomesData.selectedCourse}
                editingCO={outcomesData.editingCO}
                editingPO={outcomesData.editingPO}
                editingPSO={outcomesData.editingPSO}
                tempEditValue={outcomesData.tempEditValue}
                setTempEditValue={outcomesData.setTempEditValue}
                startEditingCO={outcomesData.startEditingCO}
                startEditingPO={outcomesData.startEditingPO}
                startEditingPSO={outcomesData.startEditingPSO}
                saveEditCO={outcomesData.saveEditCO}
                saveEditPO={outcomesData.saveEditPO}
                saveEditPSO={outcomesData.saveEditPSO}
                cancelEdit={outcomesData.cancelEdit}
                addCourseOutcome={outcomesData.addCourseOutcome}
                addProgramOutcome={outcomesData.addProgramOutcome}
                addProgramSpecificOutcome={outcomesData.addProgramSpecificOutcome}
                deleteCourseOutcome={outcomesData.deleteCourseOutcome}
                deleteProgramOutcome={outcomesData.deleteProgramOutcome}
                deleteProgramSpecificOutcome={outcomesData.deleteProgramSpecificOutcome}
              />
            </TabsContent>

            <TabsContent value="ces" className="p-4">
              <CourseEndSurveyTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
