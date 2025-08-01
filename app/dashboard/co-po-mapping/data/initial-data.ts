import type { MappingData, AttainmentData, SurveyData } from "../types"

// Initial data for the Mapping tab
export const initialMappingData: MappingData = {
  courseOutcomes: [
    { id: "co1", code: "CO1", description: "Understand basic computer science concepts" },
    { id: "co2", code: "CO2", description: "Apply programming principles to solve problems" },
    { id: "co3", code: "CO3", description: "Analyze algorithms for efficiency" },
    { id: "co4", code: "CO4", description: "Design software solutions for real-world problems" },
    { id: "co5", code: "CO5", description: "Evaluate different approaches to problem-solving" },
  ],
  programOutcomes: [
    { id: "po1", code: "PO1", description: "Engineering Knowledge" },
    { id: "po2", code: "PO2", description: "Problem Analysis" },
    { id: "po3", code: "PO3", description: "Design/Development of Solutions" },
    { id: "po4", code: "PO4", description: "Investigation" },
    { id: "po5", code: "PO5", description: "Modern Tool Usage" },
    { id: "po6", code: "PO6", description: "Engineer and Society" },
    { id: "po7", code: "PO7", description: "Environment and Sustainability" },
    { id: "po8", code: "PO8", description: "Ethics" },
    { id: "po9", code: "PO9", description: "Individual and Team Work" },
    { id: "po10", code: "PO10", description: "Communication" },
    { id: "po11", code: "PO11", description: "Project Management" },
    { id: "po12", code: "PO12", description: "Life-long Learning" },
  ],
  programSpecificOutcomes: [
    { id: "pso1", code: "PSO1", description: "Domain Knowledge" },
    { id: "pso2", code: "PSO2", description: "Application Development" },
    { id: "pso3", code: "PSO3", description: "Research Aptitude" },
  ],
  mappings: [
    { coId: "co1", poId: "po1", value: 3 },
    { coId: "co1", poId: "po2", value: 2 },
    { coId: "co2", poId: "po3", value: 3 },
    { coId: "co3", poId: "po4", value: 1 },
    { coId: "co4", poId: "po5", value: 2 },
    { coId: "co5", poId: "po6", value: 1 },
    { coId: "co1", poId: "pso1", value: 3 },
    { coId: "co2", poId: "pso2", value: 2 },
    { coId: "co3", poId: "pso3", value: 1 },
  ],
}

// Initial data for the Attainment tab
export const initialAttainmentData: AttainmentData = {
  assessmentComponents: [
    { id: "c1", name: "Internal Assessment 1", weight: 15, maxMarks: 50 },
    { id: "c2", name: "Internal Assessment 2", weight: 15, maxMarks: 50 },
    { id: "c3", name: "Assignment", weight: 10, maxMarks: 25 },
    { id: "c4", name: "Final Exam", weight: 60, maxMarks: 100 },
  ],
  thresholds: [
    { coId: "co1", threshold: 40 },
    { coId: "co2", threshold: 40 },
    { coId: "co3", threshold: 40 },
    { coId: "co4", threshold: 40 },
    { coId: "co5", threshold: 40 },
  ],
  studentMarks: [
    {
      studentId: "S001",
      studentName: "John Doe",
      marks: {
        c1: { co1: 40, co2: 35 },
        c2: { co3: 42, co4: 38 },
        c3: { co5: 20 },
        c4: { co1: 75, co2: 80, co3: 70, co4: 65, co5: 60 },
      },
    },
    {
      studentId: "S002",
      studentName: "Jane Smith",
      marks: {
        c1: { co1: 45, co2: 42 },
        c2: { co3: 40, co4: 44 },
        c3: { co5: 22 },
        c4: { co1: 85, co2: 78, co3: 82, co4: 75, co5: 70 },
      },
    },
  ],
  attainmentLevels: {
    co1: 0,
    co2: 0,
    co3: 0,
    co4: 0,
    co5: 0,
  },
}

// Initial data for the Course End Survey tab
export const initialSurveyData: SurveyData = {
  questions: [
    { id: "q1", text: "How well did the course help you understand basic computer science concepts?", coId: "co1" },
    { id: "q2", text: "How effectively did the course teach you to apply programming principles?", coId: "co2" },
    { id: "q3", text: "How well did you learn to analyze algorithms for efficiency?", coId: "co3" },
    { id: "q4", text: "How confident are you in designing software solutions after this course?", coId: "co4" },
    {
      id: "q5",
      text: "How well did the course teach you to evaluate different problem-solving approaches?",
      coId: "co5",
    },
  ],
  submissions: [
    {
      id: "sub1",
      studentId: "S001",
      responses: [
        { questionId: "q1", rating: 4 },
        { questionId: "q2", rating: 5 },
        { questionId: "q3", rating: 3 },
        { questionId: "q4", rating: 4 },
        { questionId: "q5", rating: 4 },
      ],
      timestamp: "2023-11-15T10:30:00Z",
    },
    {
      id: "sub2",
      studentId: "S002",
      responses: [
        { questionId: "q1", rating: 5 },
        { questionId: "q2", rating: 4 },
        { questionId: "q3", rating: 4 },
        { questionId: "q4", rating: 3 },
        { questionId: "q5", rating: 5 },
      ],
      timestamp: "2023-11-15T11:15:00Z",
    },
  ],
}
