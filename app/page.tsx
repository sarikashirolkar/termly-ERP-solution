"use client"
import Image from "next/image"
import NextLink from "next/link"
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  GraduationCap,
  LineChart,
  MessageSquare,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "@/components/login-form"
import { Header } from "@/components/header"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <section className="py-8 md:py-20 dark:bg-transparent bg-[#f5f8ff]">
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 md:px-6">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
                  MyNexaLink Academic Management System
                </h1>
                <p className="text-muted-foreground md:text-xl">Your One Stop for all the Academic stuff.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild>
                  <NextLink href="/features">
                    Explore Features <ArrowRight className="ml-2 h-4 w-4" />
                  </NextLink>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <NextLink href="/contact">Join Us</NextLink>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center lg:justify-end">
              <Card className="w-full max-w-md" id="login">
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>Sign in to your academic portal today.</CardDescription>
                </CardHeader>
                <CardContent>
                  <LoginForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-8 md:py-12 bg-muted/50" id="features">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold">Key Features</h2>
              <p className="text-muted-foreground mt-2">
                Comprehensive tools for academic management and student success
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <Calendar className="h-6 w-6 text-primary mb-2" />
                  <CardTitle>Attendance Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Automated attendance management with real-time tracking and reporting capabilities.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <FileText className="h-6 w-6 text-primary mb-2" />
                  <CardTitle>IA Marks Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Streamlined internal assessment marks entry, calculation, and analysis.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <LineChart className="h-6 w-6 text-primary mb-2" />
                  <CardTitle>Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Comprehensive dashboards with visual analytics to track academic progress.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <BookOpen className="h-6 w-6 text-primary mb-2" />
                  <CardTitle>Course Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Centralized access to syllabus and study materials for all enrolled courses.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <MessageSquare className="h-6 w-6 text-primary mb-2" />
                  <CardTitle>Faculty Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Anonymous feedback and rating system for continuous improvement.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <Clock className="h-6 w-6 text-primary mb-2" />
                  <CardTitle>Class Scheduling</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Efficient class scheduling and management with conflict detection.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold">Who Benefits</h2>
              <p className="text-muted-foreground mt-2">
                MyNexaLink serves the entire academic ecosystem with role-specific features
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Students</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Track attendance and performance</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Access course materials and resources</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Submit feedback on courses and teaching</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Faculty</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Manage attendance and grading</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Upload and organize course materials</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm">View student performance analytics</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                    <LineChart className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Administrators</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Generate comprehensive reports</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Manage faculty and student accounts</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm">Configure system-wide settings</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-8 dark:bg-[#131924] bg-[#f9f9f7]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col space-y-8 md:space-y-0 md:flex-row md:justify-between">
            <div className="w-full md:w-1/4 mb-6 md:mb-0">
              <NextLink href="/">
                <div className="relative w-36 h-10">
                  <Image
                    src="/images/logolight(1).png"
                    alt="MyNexaLink Logo Light"
                    fill
                    className="object-contain block dark:hidden"
                  />
                  <Image
                    src="/images/logodark.png"
                    alt="MyNexaLink Logo Dark"
                    fill
                    className="object-contain hidden dark:block"
                  />
                </div>
              </NextLink>
              <p className="text-sm text-muted-foreground mt-3">Your One Stop for all the Academic stuff.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full md:w-2/3">
              <div>
                <h3 className="font-medium mb-3">Quick Links</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <NextLink href="/features" className="text-muted-foreground hover:text-foreground">
                      Features
                    </NextLink>
                  </li>
                  <li>
                    <NextLink href="#login" className="text-muted-foreground hover:text-foreground">
                      Login
                    </NextLink>
                  </li>
                  <li>
                    <NextLink href="/about" className="text-muted-foreground hover:text-foreground">
                      About Us
                    </NextLink>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-3">Support</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <NextLink href="/contact" className="text-muted-foreground hover:text-foreground">
                      Contact Us
                    </NextLink>
                  </li>
                  <li>
                    <NextLink href="#" className="text-muted-foreground hover:text-foreground">
                      Help Center
                    </NextLink>
                  </li>
                  <li>
                    <NextLink href="#" className="text-muted-foreground hover:text-foreground">
                      FAQs
                    </NextLink>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-3">Legal</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <NextLink href="#" className="text-muted-foreground hover:text-foreground">
                      Privacy Policy
                    </NextLink>
                  </li>
                  <li>
                    <NextLink href="#" className="text-muted-foreground hover:text-foreground">
                      Terms of Service
                    </NextLink>
                  </li>
                  <li>
                    <NextLink href="#" className="text-muted-foreground hover:text-foreground">
                      Cookie Policy
                    </NextLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} MyNexaLink Edtechz. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
