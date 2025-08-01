"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { type EmailRecipient, sendEmail } from "@/lib/email-service"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SingleReminderButtonProps {
  recipient: EmailRecipient
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function SingleReminderButton({
  recipient,
  className,
  size = "icon",
  variant = "ghost",
}: SingleReminderButtonProps) {
  const [isSending, setIsSending] = useState(false)

  const handleSendReminder = async () => {
    setIsSending(true)
    try {
      const result = await sendEmail(recipient)
      if (result) {
        toast({
          title: "Reminder sent",
          description: `Successfully sent reminder to ${recipient.name}`,
        })
      } else {
        toast({
          title: "Failed to send reminder",
          description: `Could not send reminder to ${recipient.name}`,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while sending the reminder.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant={variant} size={size} onClick={handleSendReminder} disabled={isSending} className={className}>
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            <span className="sr-only">Send reminder to {recipient.name}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Send reminder to {recipient.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
