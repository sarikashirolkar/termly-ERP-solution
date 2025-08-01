"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Download, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { type EmailRecipient, sendBulkEmails, downloadRecipientsList } from "@/lib/email-service"

interface ReminderButtonsProps {
  recipients: EmailRecipient[]
  className?: string
}

export function ReminderButtons({ recipients, className }: ReminderButtonsProps) {
  const [isSending, setIsSending] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleSendReminders = async () => {
    if (recipients.length === 0) {
      toast({
        title: "No recipients",
        description: "There are no recipients to send reminders to.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      const result = await sendBulkEmails(recipients)
      toast({
        title: "Reminders sent",
        description: `Successfully sent ${result.success} reminders. Failed: ${result.failed}`,
        variant: result.failed > 0 ? "destructive" : "default",
      })
    } catch (error) {
      toast({
        title: "Error sending reminders",
        description: "An error occurred while sending reminders.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleExportList = () => {
    if (recipients.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no recipients to export.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)
    try {
      downloadRecipientsList(recipients, "pending-submissions")
      toast({
        title: "Export successful",
        description: "The list has been exported successfully.",
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "An error occurred while exporting the list.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button variant="outline" onClick={handleSendReminders} disabled={isSending || recipients.length === 0}>
        {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
        Send Reminders
      </Button>

      <Button variant="outline" onClick={handleExportList} disabled={isExporting || recipients.length === 0}>
        {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
        Export List
      </Button>
    </div>
  )
}
