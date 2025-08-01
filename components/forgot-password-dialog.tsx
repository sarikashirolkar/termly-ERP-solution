"use client"

import type React from "react"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export function ForgotPasswordDialog({ children }: { children?: React.ReactNode }) {
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"email" | "verification" | "reset">("email")
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate sending verification code
    setTimeout(() => {
      setIsLoading(false)
      setStep("verification")
      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password.",
      })
    }, 1500)
  }

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate verifying code
    setTimeout(() => {
      setIsLoading(false)
      if (verificationCode === "123456") {
        setStep("reset")
      } else {
        toast({
          title: "Invalid code",
          description: "The verification code you entered is invalid. Please try again.",
          variant: "destructive",
        })
      }
    }, 1500)
  }

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate password reset
    setTimeout(() => {
      setIsLoading(false)
      setOpen(false)
      toast({
        title: "Password reset successful",
        description: "Your password has been reset successfully. You can now log in with your new password.",
      })

      // Reset the form
      setEmail("")
      setVerificationCode("")
      setNewPassword("")
      setStep("email")
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children || <Button variant="link">Forgot password?</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {step === "email" && (
          <>
            <DialogHeader>
              <DialogTitle>Forgot Password</DialogTitle>
              <DialogDescription>Enter your email address to reset your password.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSendCode} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 min-h-[40px]"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading} className="h-10 min-h-[40px]">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    "Send verification code"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}

        {step === "verification" && (
          <>
            <DialogHeader>
              <DialogTitle>Verify your email</DialogTitle>
              <DialogDescription>
                We've sent a verification code to {email}. Enter the code below to continue.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleVerifyCode} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Verification code</Label>
                <Input
                  id="code"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  className="h-10 min-h-[40px]"
                />
                <p className="text-xs text-muted-foreground">For demo purposes, use code: 123456</p>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setStep("email")} className="mr-auto">
                  Back
                </Button>
                <Button type="submit" disabled={isLoading} className="h-10 min-h-[40px]">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify code"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}

        {step === "reset" && (
          <>
            <DialogHeader>
              <DialogTitle>Reset your password</DialogTitle>
              <DialogDescription>Enter your new password below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleResetPassword} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="h-10 min-h-[40px]"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setStep("verification")} className="mr-auto">
                  Back
                </Button>
                <Button type="submit" disabled={isLoading} className="h-10 min-h-[40px]">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting password...
                    </>
                  ) : (
                    "Reset password"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
