import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"

export default function LearnMorePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <section className="py-12 md:py-16 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold tracking-tight">About MyNexaLink</h1>
              <p className="text-xl text-muted-foreground mt-4 max-w-3xl mx-auto">
                Learn more about how MyNexaLink is transforming academic management
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground mb-6">
                  At MyNexaLink, we're committed to revolutionizing academic management through innovative technology
                  solutions. Our mission is to empower educational institutions with tools that streamline
                  administrative processes, enhance teaching effectiveness, and improve student outcomes.
                </p>
                <p className="text-muted-foreground">
                  We believe that by reducing administrative burden and providing actionable insights, educators can
                  focus more on what truly matters: delivering quality education and supporting student success.
                </p>
              </div>
              <div className="bg-muted rounded-lg p-8">
                <h3 className="text-xl font-semibold mb-4">Why Choose MyNexaLink?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Comprehensive academic management solution</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Intuitive, user-friendly interface</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Robust data security and privacy</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Dedicated customer support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Regular updates and new features</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold">Our Approach</h2>
              <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                We've designed MyNexaLink with a focus on these core principles
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>User-Centered Design</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We prioritize intuitive interfaces and workflows that make sense for educators, administrators, and
                    students. Our system is designed to be easy to learn and efficient to use.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Data-Driven Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    MyNexaLink transforms raw academic data into actionable insights, helping institutions make informed
                    decisions about curriculum, teaching methods, and student support.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Continuous Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We're constantly evolving our platform based on user feedback and educational research to ensure
                    MyNexaLink remains at the forefront of academic management technology.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to transform your institution?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the growing community of educational institutions using MyNexaLink to streamline their academic
              management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="/contact">Contact Us</a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="/features">Explore Features</a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-8 dark:bg-[#131924] bg-[#f9f9f7]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} MyNexaLink Academic System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
