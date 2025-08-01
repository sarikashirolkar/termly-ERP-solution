import { type NextRequest, NextResponse } from "next/server"
import { branchCodes } from "@/lib/dummy-data"

// Define types for CO-PO report data
type CourseOutcome = {
  id: string
  description: string
}

type ProgramOutcome = {
  id: string
  description: string
}

type COPOMapping = {
  coId: string
  poId: string
  value: number
}

type AttainmentRecord = {
  co: string
  cie: number
  cieLevel: number
  use: number
  useLevel: number
  ces: number
  attainment: number
}

type CourseInfo = {
  name: string
  code: string
  semester: string
  faculty: string
  academicYear: string
  targetLevel: string
}

type CESData = {
  questions: number
  studentsResponded: number
  responses: number
  totalResponseValue: number
}

type ReportData = {
  courseInfo: CourseInfo
  courseOutcomes: CourseOutcome[]
  attainment: AttainmentRecord[]
  averageGrade: number
  averageAttainment: number
  weightage: { cie: number; use: number; ces: number }
  cesData: CESData
  mappings?: COPOMapping[]
  programOutcomes?: ProgramOutcome[]
}

type Report = {
  id: string
  subjectId: string
  subjectName: string
  academicYear: string
  facultyId: string
  facultyName: string
  department: string
  semester: string
  date: string
  courseCode: string
  reportData: ReportData
}

// Generate a set of standard course outcomes for each department
const departmentCourseOutcomes: Record<string, CourseOutcome[][]> = {
  CSE: [
    [
      { id: "CO1", description: "Understand fundamental concepts of computer science and programming." },
      { id: "CO2", description: "Apply programming principles to solve computational problems." },
      { id: "CO3", description: "Analyze algorithms for efficiency and correctness." },
      { id: "CO4", description: "Design software solutions using appropriate data structures." },
      { id: "CO5", description: "Evaluate different approaches to problem-solving in computing." },
    ],
    [
      { id: "CO1", description: "Understand database management system concepts and architecture." },
      { id: "CO2", description: "Apply normalization techniques to design efficient database schemas." },
      { id: "CO3", description: "Analyze and optimize SQL queries for performance." },
      { id: "CO4", description: "Design and implement database applications with appropriate security measures." },
      { id: "CO5", description: "Evaluate various database systems for specific application requirements." },
    ],
    [
      { id: "CO1", description: "Understand operating system principles and architecture." },
      { id: "CO2", description: "Apply process management and scheduling algorithms." },
      { id: "CO3", description: "Analyze memory management techniques and virtual memory systems." },
      { id: "CO4", description: "Design solutions for synchronization and deadlock problems." },
      { id: "CO5", description: "Evaluate file system implementations and I/O management strategies." },
    ],
  ],
  "CSE(AIML)": [
    [
      { id: "CO1", description: "Understand fundamental concepts of artificial intelligence and machine learning." },
      { id: "CO2", description: "Apply supervised learning algorithms to classification and regression problems." },
      {
        id: "CO3",
        description: "Analyze unsupervised learning techniques for clustering and dimensionality reduction.",
      },
      { id: "CO4", description: "Design neural network architectures for deep learning applications." },
      { id: "CO5", description: "Evaluate model performance and implement appropriate optimization strategies." },
    ],
    [
      { id: "CO1", description: "Understand natural language processing fundamentals and applications." },
      { id: "CO2", description: "Apply text preprocessing and feature extraction techniques." },
      { id: "CO3", description: "Analyze sentiment and semantic meaning from textual data." },
      { id: "CO4", description: "Design language models and implement sequence-to-sequence architectures." },
      { id: "CO5", description: "Evaluate NLP systems and address challenges in language understanding." },
    ],
    [
      { id: "CO1", description: "Understand computer vision principles and image processing techniques." },
      { id: "CO2", description: "Apply feature extraction and object detection algorithms." },
      { id: "CO3", description: "Analyze image segmentation and recognition methods." },
      { id: "CO4", description: "Design convolutional neural networks for visual recognition tasks." },
      { id: "CO5", description: "Evaluate vision systems for real-world applications." },
    ],
  ],
  "CSE(DS)": [
    [
      { id: "CO1", description: "Understand fundamental concepts of data science and analytics." },
      { id: "CO2", description: "Apply statistical methods for data analysis and inference." },
      { id: "CO3", description: "Analyze large datasets using appropriate computational techniques." },
      { id: "CO4", description: "Design data visualization solutions to communicate insights effectively." },
      { id: "CO5", description: "Evaluate data-driven decision-making processes in various domains." },
    ],
    [
      { id: "CO1", description: "Understand big data frameworks and distributed computing principles." },
      { id: "CO2", description: "Apply MapReduce paradigm for parallel data processing." },
      { id: "CO3", description: "Analyze streaming data and implement real-time analytics." },
      { id: "CO4", description: "Design scalable data pipelines for ETL processes." },
      { id: "CO5", description: "Evaluate NoSQL databases for specific big data applications." },
    ],
    [
      { id: "CO1", description: "Understand predictive modeling techniques and methodologies." },
      { id: "CO2", description: "Apply feature engineering and selection methods." },
      { id: "CO3", description: "Analyze model performance and implement validation strategies." },
      { id: "CO4", description: "Design ensemble methods to improve prediction accuracy." },
      { id: "CO5", description: "Evaluate model deployment and monitoring in production environments." },
    ],
  ],
  ISE: [
    [
      { id: "CO1", description: "Understand information security principles and threat landscapes." },
      { id: "CO2", description: "Apply cryptographic algorithms for data protection." },
      { id: "CO3", description: "Analyze security vulnerabilities in software and systems." },
      { id: "CO4", description: "Design secure network architectures and implement access controls." },
      { id: "CO5", description: "Evaluate security policies and compliance frameworks." },
    ],
    [
      { id: "CO1", description: "Understand web application security concepts and attack vectors." },
      { id: "CO2", description: "Apply secure coding practices and input validation techniques." },
      { id: "CO3", description: "Analyze common web vulnerabilities like XSS, CSRF, and SQL injection." },
      { id: "CO4", description: "Design authentication and authorization mechanisms." },
      { id: "CO5", description: "Evaluate security testing methodologies for web applications." },
    ],
    [
      { id: "CO1", description: "Understand network security fundamentals and protocols." },
      { id: "CO2", description: "Apply firewall configurations and intrusion detection systems." },
      { id: "CO3", description: "Analyze network traffic for anomalies and potential threats." },
      { id: "CO4", description: "Design VPN solutions and secure communication channels." },
      { id: "CO5", description: "Evaluate incident response procedures for network breaches." },
    ],
  ],
  ECE: [
    [
      { id: "CO1", description: "Understand digital signal processing concepts and applications." },
      { id: "CO2", description: "Apply discrete-time signal analysis techniques." },
      { id: "CO3", description: "Analyze frequency domain representations using Fourier transforms." },
      { id: "CO4", description: "Design digital filters for specific signal processing requirements." },
      { id: "CO5", description: "Evaluate DSP implementations on hardware platforms." },
    ],
    [
      { id: "CO1", description: "Understand analog electronic circuit principles and components." },
      { id: "CO2", description: "Apply semiconductor device physics to circuit analysis." },
      { id: "CO3", description: "Analyze amplifier configurations and frequency responses." },
      { id: "CO4", description: "Design oscillators and waveform generation circuits." },
      { id: "CO5", description: "Evaluate power amplifiers and voltage regulation techniques." },
    ],
    [
      { id: "CO1", description: "Understand communication system fundamentals and modulation techniques." },
      { id: "CO2", description: "Apply analog and digital modulation methods." },
      { id: "CO3", description: "Analyze noise effects and calculate signal-to-noise ratios." },
      { id: "CO4", description: "Design transmitter and receiver architectures." },
      { id: "CO5", description: "Evaluate communication system performance under various channel conditions." },
    ],
  ],
}

// Add this function after the departmentCourseOutcomes declaration
const getECECourseOutcomes = () => {
  return [
    [
      { id: "CO1", description: "Demonstrate understanding of MOS transistor theory and CMOS fabrication flow." },
      {
        id: "CO2",
        description:
          "Construct schematic, stick and layout diagram for Boolean expressions with the knowledge of physical design aspects.",
      },
      { id: "CO3", description: "Illustrate memory elements along with timing considerations." },
      { id: "CO4", description: "Interpret testing and testability issues in combinational logic design." },
      { id: "CO5", description: "Analyze testing and testability issues in sequential logic design." },
    ],
    // Keep other ECE course outcomes
    departmentCourseOutcomes.ECE[1],
    departmentCourseOutcomes.ECE[2],
  ]
}

// Then update the departmentCourseOutcomes.ECE assignment:
departmentCourseOutcomes.ECE = getECECourseOutcomes()

// Standard program outcomes for engineering disciplines
const standardProgramOutcomes: ProgramOutcome[] = [
  { id: "PO1", description: "Engineering Knowledge" },
  { id: "PO2", description: "Problem Analysis" },
  { id: "PO3", description: "Design/Development of Solutions" },
  { id: "PO4", description: "Conduct Investigations of Complex Problems" },
  { id: "PO5", description: "Modern Tool Usage" },
  { id: "PO6", description: "The Engineer and Society" },
  { id: "PO7", description: "Environment and Sustainability" },
  { id: "PO8", description: "Ethics" },
  { id: "PO9", description: "Individual and Team Work" },
  { id: "PO10", description: "Communication" },
  { id: "PO11", description: "Project Management and Finance" },
  { id: "PO12", description: "Life-long Learning" },
]

// Department-specific program specific outcomes (PSOs)
const departmentPSOs: Record<string, ProgramOutcome[]> = {
  CSE: [
    { id: "PSO1", description: "Professional Skills" },
    { id: "PSO2", description: "Problem Solving Skills" },
    { id: "PSO3", description: "Successful Career and Entrepreneurship" },
  ],
  "CSE(AIML)": [
    { id: "PSO1", description: "AI/ML Application Development" },
    { id: "PSO2", description: "Intelligent System Design" },
    { id: "PSO3", description: "Data-driven Decision Making" },
  ],
  "CSE(DS)": [
    { id: "PSO1", description: "Data Analytics and Visualization" },
    { id: "PSO2", description: "Big Data Technologies" },
    { id: "PSO3", description: "Business Intelligence Applications" },
  ],
  ISE: [
    { id: "PSO1", description: "Information Security Applications" },
    { id: "PSO2", description: "Network and System Security" },
    { id: "PSO3", description: "Security Governance and Compliance" },
  ],
  ECE: [
    { id: "PSO1", description: "Electronic System Design" },
    { id: "PSO2", description: "Communication Engineering" },
    { id: "PSO3", description: "Signal Processing Applications" },
  ],
}

// Subject data for each department
const departmentSubjects: Record<string, any[]> = {
  CSE: [
    {
      id: "CS101",
      code: "18CS32",
      name: "Data Structures and Algorithms",
      semester: "3",
      faculty: { id: "fac2", name: "Dr. Priya Sharma" },
    },
    {
      id: "CS201",
      code: "18CS42",
      name: "Design and Analysis of Algorithms",
      semester: "4",
      faculty: { id: "fac2", name: "Dr. Priya Sharma" },
    },
    {
      id: "CS301",
      code: "18CS52",
      name: "Database Management Systems",
      semester: "5",
      faculty: { id: "fac1", name: "Dr. Rajesh Kumar" },
    },
    {
      id: "CS401",
      code: "18CS61",
      name: "Operating Systems",
      semester: "6",
      faculty: { id: "fac2", name: "Dr. Priya Sharma" },
    },
  ],
  "CSE(AIML)": [
    {
      id: "CA101",
      code: "18CA32",
      name: "Machine Learning Fundamentals",
      semester: "3",
      faculty: { id: "fac3", name: "Dr. Amit Patel" },
    },
    {
      id: "CA201",
      code: "18CA42",
      name: "Neural Networks and Deep Learning",
      semester: "4",
      faculty: { id: "fac3", name: "Dr. Amit Patel" },
    },
    {
      id: "CA301",
      code: "18CA52",
      name: "Natural Language Processing",
      semester: "5",
      faculty: { id: "fac3", name: "Dr. Amit Patel" },
    },
    {
      id: "CA401",
      code: "18CA61",
      name: "Computer Vision",
      semester: "6",
      faculty: { id: "fac3", name: "Dr. Amit Patel" },
    },
  ],
  "CSE(DS)": [
    {
      id: "CD101",
      code: "18CD32",
      name: "Data Science Fundamentals",
      semester: "3",
      faculty: { id: "fac4", name: "Dr. Sneha Verma" },
    },
    {
      id: "CD201",
      code: "18CD42",
      name: "Statistical Methods for Data Science",
      semester: "4",
      faculty: { id: "fac4", name: "Dr. Sneha Verma" },
    },
    {
      id: "CD301",
      code: "18CD52",
      name: "Big Data Analytics",
      semester: "5",
      faculty: { id: "fac4", name: "Dr. Sneha Verma" },
    },
    {
      id: "CD401",
      code: "18CD61",
      name: "Predictive Analytics",
      semester: "6",
      faculty: { id: "fac4", name: "Dr. Sneha Verma" },
    },
  ],
  ISE: [
    {
      id: "IS101",
      code: "18IS32",
      name: "Information Security Fundamentals",
      semester: "3",
      faculty: { id: "fac5", name: "Dr. Vikram Singh" },
    },
    {
      id: "IS201",
      code: "18IS42",
      name: "Cryptography and Network Security",
      semester: "4",
      faculty: { id: "fac5", name: "Dr. Vikram Singh" },
    },
    {
      id: "IS301",
      code: "18IS52",
      name: "Web Application Security",
      semester: "5",
      faculty: { id: "fac5", name: "Dr. Vikram Singh" },
    },
    {
      id: "IS401",
      code: "18IS61",
      name: "Security Governance and Compliance",
      semester: "6",
      faculty: { id: "fac5", name: "Dr. Vikram Singh" },
    },
  ],
  ECE: [
    {
      id: "EC101",
      code: "18EC32",
      name: "Digital Signal Processing",
      semester: "3",
      faculty: { id: "fac6", name: "Dr. Anjali Reddy" },
    },
    {
      id: "EC201",
      code: "18EC42",
      name: "Analog Electronics",
      semester: "4",
      faculty: { id: "fac6", name: "Dr. Anjali Reddy" },
    },
    {
      id: "EC301",
      code: "18EC52",
      name: "Communication Systems",
      semester: "5",
      faculty: { id: "fac1", name: "Dr. Rajesh Kumar" },
    },
    {
      id: "EC401",
      code: "18EC61",
      name: "VLSI Design",
      semester: "6",
      faculty: { id: "fac6", name: "Dr. Anjali Reddy" },
    },
  ],
}

// Generate random CO-PO mappings for a set of course outcomes
function generateCOPOMappings(courseOutcomes: CourseOutcome[]): COPOMapping[] {
  const mappings: COPOMapping[] = []

  // Map each CO to several POs with different strengths
  courseOutcomes.forEach((co) => {
    // Each CO maps to 3-5 POs
    const numPOs = 3 + Math.floor(Math.random() * 3)
    const selectedPOIndices = new Set<number>()

    // Randomly select PO indices without repetition
    while (selectedPOIndices.size < numPOs) {
      selectedPOIndices.add(Math.floor(Math.random() * 12))
    }

    // Create mappings with random strength (1-3)
    selectedPOIndices.forEach((poIndex) => {
      mappings.push({
        coId: co.id,
        poId: `PO${poIndex + 1}`,
        value: 1 + Math.floor(Math.random() * 3),
      })
    })

    // Also map to 1-2 PSOs
    const numPSOs = 1 + Math.floor(Math.random() * 2)
    const selectedPSOIndices = new Set<number>()

    while (selectedPSOIndices.size < numPSOs) {
      selectedPSOIndices.add(Math.floor(Math.random() * 3))
    }

    selectedPSOIndices.forEach((psoIndex) => {
      mappings.push({
        coId: co.id,
        poId: `PSO${psoIndex + 1}`,
        value: 1 + Math.floor(Math.random() * 3),
      })
    })
  })

  return mappings
}

// Generate attainment data for a set of course outcomes
function generateAttainmentData(courseOutcomes: CourseOutcome[]): AttainmentRecord[] {
  return courseOutcomes.map((co) => {
    // Generate random but realistic attainment values
    const cie = 70 + Math.random() * 20 // 70-90% for CIE
    const use = 30 + Math.random() * 10 // 30-40% for USE
    const ces = 2.5 + Math.random() * 0.5 // 2.5-3.0 for CES

    // Calculate attainment level based on weighted average
    // Assuming weights: CIE 50%, USE 40%, CES 10%
    const cieLevel = cie >= 80 ? 3 : cie >= 70 ? 2 : 1
    const useLevel = use / 40 // Normalized to 1
    const attainment = Math.round((cieLevel * 0.5 + useLevel * 0.4 + ces * 0.1) * 10) / 10

    return {
      co: co.id,
      cie,
      cieLevel,
      use,
      useLevel,
      ces,
      attainment,
    }
  })
}

// Generate CES data
function generateCESData(): CESData {
  const studentsResponded = 80 + Math.floor(Math.random() * 20) // 80-100 students
  const questions = 5 // 5 questions (one per CO)
  const responses = studentsResponded * questions
  const avgResponseValue = 2.5 + Math.random() * 0.5 // Average rating 2.5-3.0
  const totalResponseValue = Math.round(responses * avgResponseValue)

  return {
    questions,
    studentsResponded,
    responses,
    totalResponseValue,
  }
}

// Generate a complete report for a subject
function generateReport(
  subjectId: string,
  subjectName: string,
  courseCode: string,
  department: string,
  semester: string,
  facultyId: string,
  facultyName: string,
  academicYear: string,
  courseOutcomes: CourseOutcome[],
): Report {
  // Generate mappings
  const mappings = generateCOPOMappings(courseOutcomes)

  // Generate consistent attainment data to match the example
  const attainment = courseOutcomes.map((co, index) => {
    // Use fixed values for the first 5 COs to match the example
    if (index < 5) {
      const cieValues = [82.39, 76.44, 80.81, 80.45, 85.87]
      return {
        co: co.id,
        cie: cieValues[index],
        cieLevel: 3,
        use: 33.07,
        useLevel: 0.83,
        ces: 2.71,
        attainment: 2.1,
      }
    } else {
      // For any additional COs, generate random values
      return {
        co: co.id,
        cie: 75 + Math.random() * 15,
        cieLevel: 3,
        use: 33.07,
        useLevel: 0.83,
        ces: 2.71,
        attainment: 2.1,
      }
    }
  })

  // Create report data with fixed values to match the example
  const reportData: ReportData = {
    courseInfo: {
      name: subjectName,
      code: courseCode,
      semester,
      faculty: facultyName,
      academicYear,
      targetLevel: "60",
    },
    courseOutcomes,
    attainment,
    averageGrade: 3,
    averageAttainment: 2.1,
    weightage: { cie: 50, use: 40, ces: 10 },
    cesData: {
      questions: 5,
      studentsResponded: 88,
      responses: 440,
      totalResponseValue: 1191,
    },
    mappings,
    programOutcomes: [...standardProgramOutcomes, ...(departmentPSOs[department] || [])],
  }

  // Generate a random date within the academic year
  const year = Number.parseInt(academicYear.split("-")[0])
  const month = 1 + Math.floor(Math.random() * 12)
  const day = 1 + Math.floor(Math.random() * 28)
  const date = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`

  return {
    id: `report_${department}_${subjectId}_${academicYear}`,
    subjectId,
    subjectName,
    academicYear,
    facultyId,
    facultyName,
    department,
    semester,
    date,
    courseCode,
    reportData,
  }
}

// Generate all reports for all departments and subjects
const allReports: Report[] = []

// Academic years
const academicYears = ["2022-2023", "2023-2024"]

// Generate reports for each department, subject, and academic year
Object.keys(departmentSubjects).forEach((department) => {
  const subjects = departmentSubjects[department]
  const courseOutcomeSets = departmentCourseOutcomes[department]

  subjects.forEach((subject, index) => {
    // Use the course outcomes set that matches the subject index (or cycle through if needed)
    const courseOutcomes = courseOutcomeSets[index % courseOutcomeSets.length]

    academicYears.forEach((academicYear) => {
      const report = generateReport(
        subject.id,
        subject.name,
        subject.code,
        department,
        subject.semester,
        subject.faculty.id,
        subject.faculty.name,
        academicYear,
        courseOutcomes,
      )

      allReports.push(report)
    })
  })
})

// GET handler - Fetch CO-PO reports with optional filtering
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const departmentId = searchParams.get("departmentId")
  const facultyId = searchParams.get("facultyId")
  const subjectId = searchParams.get("subjectId")
  const academicYear = searchParams.get("academicYear")
  const reportId = searchParams.get("reportId")

  // If reportId is provided, return the specific report
  if (reportId) {
    const report = allReports.find((r) => r.id === reportId)
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }
    return NextResponse.json(report)
  }

  // Apply filters
  let filteredReports = [...allReports]

  if (departmentId) {
    filteredReports = filteredReports.filter((report) => report.department === departmentId)
  }

  if (facultyId) {
    filteredReports = filteredReports.filter((report) => report.facultyId === facultyId)
  }

  if (subjectId) {
    filteredReports = filteredReports.filter((report) => report.subjectId === subjectId)
  }

  if (academicYear) {
    filteredReports = filteredReports.filter((report) => report.academicYear === academicYear)
  }

  // Return basic report info without the full data
  const reportSummaries = filteredReports.map(
    ({ id, subjectId, subjectName, academicYear, facultyId, facultyName, department, semester, date, courseCode }) => ({
      id,
      subjectId,
      subjectName,
      academicYear,
      facultyId,
      facultyName,
      department,
      semester,
      date,
      courseCode,
    }),
  )

  return NextResponse.json(reportSummaries)
}

// POST handler - Generate a new CO-PO report
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { subjectId, academicYear, facultyId, department } = data

    if (!subjectId || !academicYear) {
      return NextResponse.json({ error: "Subject ID and academic year are required" }, { status: 400 })
    }

    // Find the department for this subject if not provided
    let subjectDepartment = department
    if (!subjectDepartment) {
      // Extract department from subject ID prefix
      const prefix = subjectId.substring(0, 2)
      for (const [dept, code] of Object.entries(branchCodes)) {
        if (code === prefix) {
          subjectDepartment = dept
          break
        }
      }
    }

    // In a real implementation, this would generate a new report
    // For now, we'll just return a success message
    return NextResponse.json({
      success: true,
      message: "Report generation initiated",
      reportId: `report_${subjectDepartment}_${subjectId}_${academicYear}`,
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
