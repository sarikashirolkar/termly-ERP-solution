"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { ContactUsDialog } from "@/components/contact-us-dialog"
import { LearnMoreDialog } from "@/components/learn-more-dialog"
import { Button } from "@/components/ui/button"
import NextLink from "next/link"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [isLearnMoreDialogOpen, setIsLearnMoreDialogOpen] = useState(false)

  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem("user")
    setIsLoggedIn(!!user)
  }, [])

  return (
    <header className="w-full py-2 px-3 sm:py-3 sm:px-4 md:py-4 md:px-6 border-b dark:bg-[#131924] bg-[#f9f9f7]">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          <Link href={isLoggedIn ? "/dashboard" : "/"}>
            <div className="relative w-32 h-8 sm:w-36 sm:h-10 md:w-48 md:h-12">
              <Image
                src="/images/logolight(1).png"
                alt="TERMLY Logo Light"
                fill
                className="object-contain block dark:hidden"
                priority
                onError={(e) => {
                  // Fallback to text if image fails to load
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  target.parentElement!.innerHTML += '<span class="font-bold text-xl">TERMLY</span>'
                }}
              />
              <Image
                src="/images/logodark.png"
                alt="TERMLY Logo Dark"
                fill
                className="object-contain hidden dark:block"
                priority
                onError={(e) => {
                  // Fallback to text if image fails to load
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  target.parentElement!.innerHTML += '<span class="font-bold text-xl text-white">TERMLY</span>'
                }}
              />
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
          {!isLoggedIn && (
            <>
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm" asChild>
                <NextLink href="/contact">Contact Us</NextLink>
              </Button>
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm" asChild>
                <NextLink href="/learn-more">Learn More</NextLink>
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>

      <ContactUsDialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen} />

      <LearnMoreDialog open={isLearnMoreDialogOpen} onOpenChange={setIsLearnMoreDialogOpen} />
    </header>
  )
}
