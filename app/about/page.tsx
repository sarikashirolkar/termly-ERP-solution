import { Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="container mx-auto py-6 md:py-10 px-4 md:px-6 flex-1">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">About MyNexaLink</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Streamline Academic Management with our comprehensive platform
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  At MyNexaLink, our mission is to transform academic management through innovative technology. We aim
                  to streamline administrative processes, enhance communication between students and educators, and
                  provide valuable insights through data analytics. Our platform is designed to make academic management
                  more efficient, transparent, and accessible for all stakeholders in the educational ecosystem.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Our Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start gap-2 md:gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Simplify academic administration</h3>
                      <p className="text-muted-foreground mt-1">
                        Reduce paperwork and manual processes through digital solutions that save time and resources for
                        educational institutions.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Improve student engagement and performance tracking</h3>
                      <p className="text-muted-foreground mt-1">
                        Provide tools that help students stay engaged with their coursework and allow educators to track
                        progress effectively.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Facilitate seamless communication</h3>
                      <p className="text-muted-foreground mt-1">
                        Create channels for effective communication between students, faculty, and administrators to
                        enhance collaboration and information sharing.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Provide data-driven insights</h3>
                      <p className="text-muted-foreground mt-1">
                        Leverage analytics to help institutions make informed decisions about curriculum, teaching
                        methods, and resource allocation.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2 md:gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium">Create an inclusive platform</h3>
                      <p className="text-muted-foreground mt-1">
                        Ensure accessibility for all educational stakeholders regardless of technical expertise or
                        background.
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium">Attendance Management</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Track and manage attendance records efficiently with automated reporting and alerts.
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium">IA Marks Tracking</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Monitor internal assessment performance with detailed analytics and progress tracking.
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium">Performance Analytics</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Gain insights through comprehensive data analysis of student performance and engagement.
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium">Study Materials</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Access and manage academic resources in a centralized digital repository.
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium">Feedback System</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Provide and receive constructive feedback to improve teaching and learning experiences.
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium">Course Management</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Organize and manage course content, schedules, and resources efficiently.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Our Team</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  NexaLink is developed by a dedicated team of education technology specialists, software engineers, and
                  former educators who understand the challenges faced by academic institutions. Our diverse team brings
                  together expertise in educational management, user experience design, and cutting-edge technology to
                  create a platform that truly serves the needs of modern educational institutions.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Leadership</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Our leadership team combines decades of experience in education technology, academic
                        administration, and software development to guide our vision and strategy.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Development</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Our engineers and developers work tirelessly to build robust, scalable solutions that meet the
                        evolving needs of educational institutions.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <footer className="border-t py-6 md:py-8 dark:bg-[#131924] bg-[#f9f9f7]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} MyNexaLink Edtechz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
