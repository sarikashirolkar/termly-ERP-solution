"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ResponsiveContainer } from "@/components/responsive-container"
import { ResponsiveGrid } from "@/components/responsive-grid"
import { ResponsiveDialog } from "@/components/ui/responsive-dialog"
import { useMobile } from "@/hooks/use-mobile"

export default function ResponsiveTestPage() {
  const { isMobile, isTablet, isDesktop } = useMobile()
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6">Responsive Design Test</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Current Viewport</CardTitle>
          <CardDescription>This shows your current device viewport category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isMobile ? "bg-green-500" : "bg-gray-300"}`}></div>
              <span>Mobile: {isMobile ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isTablet ? "bg-green-500" : "bg-gray-300"}`}></div>
              <span>Tablet: {isTablet ? "Yes" : "No"}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isDesktop ? "bg-green-500" : "bg-gray-300"}`}></div>
              <span>Desktop: {isDesktop ? "Yes" : "No"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Responsive Container</h2>
      <ResponsiveContainer
        className="p-4 mb-8 border rounded-lg"
        mobileClassName="bg-red-100"
        tabletClassName="bg-blue-100"
        desktopClassName="bg-green-100"
      >
        <p>This container changes background color based on viewport size:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Red on mobile</li>
          <li>Blue on tablet</li>
          <li>Green on desktop</li>
        </ul>
      </ResponsiveContainer>

      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Responsive Grid</h2>
      <ResponsiveGrid mobileColumns={1} tabletColumns={2} desktopColumns={4} gap="md" className="mb-8">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item}>
            <CardHeader>
              <CardTitle>Card {item}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This grid adjusts columns based on screen size.</p>
            </CardContent>
            <CardFooter>
              <Button size="sm">Action</Button>
            </CardFooter>
          </Card>
        ))}
      </ResponsiveGrid>

      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Responsive Dialog</h2>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Dialog/Drawer Component</CardTitle>
          <CardDescription>Opens as a drawer on mobile, dialog on larger screens</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setDialogOpen(true)}>Open {isMobile ? "Drawer" : "Dialog"}</Button>

          <ResponsiveDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title="Responsive Dialog"
            description="This appears as a bottom drawer on mobile and a centered dialog on larger screens."
          >
            <div className="p-4">
              <p className="mb-4">This component automatically adapts to the current viewport size.</p>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </div>
          </ResponsiveDialog>
        </CardContent>
      </Card>

      <h2 className="text-xl sm:text-2xl font-semibold mb-4">Responsive Typography</h2>
      <Card>
        <CardContent className="py-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Heading 1</h1>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mb-3">Heading 2</h2>
          <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium mb-3">Heading 3</h3>
          <p className="text-sm sm:text-base md:text-lg mb-2">
            Regular paragraph text that adjusts size based on screen.
          </p>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
            Smaller text for captions and secondary information.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
