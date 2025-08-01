export type EmailRecipient = {
  id: string
  name: string
  email: string
}

export type EmailTemplate = {
  subject: string
  body: string
}

export const defaultReminderTemplate: EmailTemplate = {
  subject: "Reminder: Pending Form Submission",
  body: `Dear {name},

This is a friendly reminder that you have a pending form submission in the NexaLink Academic System. Please log in to your account and complete the submission at your earliest convenience.

Thank you,
NexaLink Academic System`,
}

export async function sendEmail(
  recipient: EmailRecipient,
  template: EmailTemplate = defaultReminderTemplate,
): Promise<boolean> {
  try {
    // In a real application, this would connect to an email service
    // For demo purposes, we'll simulate a successful email send
    console.log(`Sending email to ${recipient.email}`)
    console.log(`Subject: ${template.subject}`)
    console.log(`Body: ${template.body.replace("{name}", recipient.name)}`)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return true
  } catch (error) {
    console.error("Failed to send email:", error)
    return false
  }
}

export async function sendBulkEmails(
  recipients: EmailRecipient[],
  template: EmailTemplate = defaultReminderTemplate,
): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  for (const recipient of recipients) {
    const result = await sendEmail(recipient, template)
    if (result) {
      success++
    } else {
      failed++
    }
  }

  return { success, failed }
}

export function downloadRecipientsList(recipients: EmailRecipient[], filename = "recipients-list"): void {
  // Create CSV content
  const headers = "ID,Name,Email\n"
  const csvContent = recipients.map((r) => `${r.id},${r.name},${r.email}`).join("\n")
  const fullContent = headers + csvContent

  // Create a blob and download it
  const blob = new Blob([fullContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}-${new Date().toISOString().split("T")[0]}.csv`)
  link.style.visibility = "hidden"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
