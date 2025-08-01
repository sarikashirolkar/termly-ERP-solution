import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function DepartmentCOPOPage() {
  const departmentData = {
    name: "Computer Science and Engineering",
    shortName: "CSE",
    establishedDate: "1990-09-01",
    description:
      "The Department of Computer Science and Engineering offers programs focused on computing theory, algorithms, and practical applications.",
    hod: "Dr. Jane Doe",
    courses: [
      {
        id: "cs101",
        name: "Introduction to Programming",
        code: "CS101",
        semester: 1,
        credits: 4,
        outcomes: [
          { coNumber: "CO1", description: "Understand fundamental programming concepts." },
          { coNumber: "CO2", description: "Develop basic algorithms." },
        ],
      },
      {
        id: "cs201",
        name: "Data Structures and Algorithms",
        code: "CS201",
        semester: 3,
        credits: 4,
        outcomes: [
          { coNumber: "CO1", description: "Analyze and implement various data structures." },
          { coNumber: "CO2", description: "Design efficient algorithms for problem-solving." },
        ],
      },
    ],
    programOutcomes: [
      {
        poNumber: "PO1",
        description:
          "Engineering knowledge: Apply the knowledge of mathematics, science, engineering fundamentals, and an engineering specialization to the solution of complex engineering problems.",
      },
      {
        poNumber: "PO2",
        description:
          "Problem analysis: Identify, formulate, review research literature, and analyze complex engineering problems reaching substantiated conclusions using first principles of mathematics, natural sciences, and engineering sciences.",
      },
      {
        poNumber: "PO3",
        description:
          "Design/development of solutions: Design solutions for complex engineering problems and design system components or processes that meet the specified needs with appropriate consideration for the public health and safety, and the cultural, societal, and environmental considerations.",
      },
    ],
  }

  return (
    <div className="grid gap-6 p-6 md:p-8">
      <h1 className="text-3xl font-bold">Department CO-PO Mapping</h1>

      <Card>
        <CardHeader>
          <CardTitle>Department Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Department Name</p>
              <p className="text-lg font-semibold">{departmentData.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Short Name</p>
              <p className="text-lg font-semibold">{departmentData.shortName}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">HOD</p>
              <p className="text-lg font-semibold">{departmentData.hod}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Established Date</p>
              <p className="text-lg font-semibold">{departmentData.establishedDate}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="text-base">{departmentData.description}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Program Outcomes (POs)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">PO Number</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentData.programOutcomes.map((po) => (
                <TableRow key={po.poNumber}>
                  <TableCell className="font-medium">{po.poNumber}</TableCell>
                  <TableCell>{po.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {departmentData.courses.map((course) => (
        <Card key={course.id}>
          <CardHeader>
            <CardTitle>
              {course.name} ({course.code}) - Semester {course.semester}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{course.credits} Credits</p>
          </CardHeader>
          <CardContent className="grid gap-4">
            <h3 className="text-lg font-semibold">Course Outcomes (COs)</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">CO Number</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {course.outcomes.map((co) => (
                  <TableRow key={co.coNumber}>
                    <TableCell className="font-medium">{co.coNumber}</TableCell>
                    <TableCell>{co.description}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <h3 className="text-lg font-semibold mt-4">CO-PO Mapping (Example)</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">CO / PO</TableHead>
                  {departmentData.programOutcomes.map((po) => (
                    <TableHead key={po.poNumber} className="text-center">
                      {po.poNumber}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {course.outcomes.map((co) => (
                  <TableRow key={co.coNumber}>
                    <TableCell className="font-medium">{co.coNumber}</TableCell>
                    {departmentData.programOutcomes.map((po) => {
                      // Mock mapping strength (replace with actual data)
                      const strength = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3
                      const strengthMap = {
                        1: { text: "Low", color: "bg-blue-100 text-blue-800" },
                        2: { text: "Medium", color: "bg-green-100 text-green-800" },
                        3: { text: "High", color: "bg-purple-100 text-purple-800" },
                      }
                      const { text, color } = strengthMap[strength]
                      return (
                        <TableCell key={`${co.coNumber}-${po.poNumber}`} className="text-center">
                          <Badge className={color}>{text}</Badge>
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
