"use client"

// Role switching utility functions

/**
 * Handles role switching between primary roles and faculty view
 * This centralized approach ensures consistent behavior across the application
 */
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function useRoleSwitcher() {
  const router = useRouter()
  const { toast } = useToast()

  /**
   * Switch between a primary role and faculty view
   * @param primaryRole The primary role (hod, admin, principal, coordinator)
   * @param currentUser The current user object
   */
  const switchRole = (primaryRole: string, currentUser: any) => {
    if (!currentUser) return

    // Get current active role
    const currentRole = localStorage.getItem("activeRole") || currentUser.role

    // Determine the new role
    const newRole = currentRole === primaryRole ? "faculty" : primaryRole

    // Update localStorage
    localStorage.setItem("activeRole", newRole)

    // Dispatch a custom event to notify components about the role change
    const roleChangeEvent = new CustomEvent("roleChange", {
      detail: { newRole, previousRole: currentRole },
    })
    window.dispatchEvent(roleChangeEvent)

    // Show toast notification
    const roleDisplayNames: Record<string, string> = {
      hod: "HOD",
      admin: "Admin",
      principal: "Principal",
      coordinator: "Coordinator",
      faculty: "Faculty",
    }

    const primaryRoleArticle = primaryRole === "admin" ? "an" : "a"
    const newRoleArticle = newRole === "admin" ? "an" : "a"

    toast({
      title: `Switched to ${roleDisplayNames[newRole]} view`,
      description: `You are now viewing the dashboard as ${newRoleArticle} ${newRole === "faculty" ? "Faculty member" : roleDisplayNames[newRole]}.`,
    })

    // Force a refresh of the dashboard
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "activeRole",
        newValue: newRole,
        oldValue: currentRole,
      }),
    )
  }

  return { switchRole }
}

/**
 * Get the current active role, with fallback to the user's primary role
 * @param user The current user object
 * @returns The active role
 */
export function getActiveRole(user: any): string {
  if (typeof window === "undefined" || !user) return ""

  return localStorage.getItem("activeRole") || user.role
}

/**
 * Check if a user is currently in faculty view mode
 * @param user The current user object
 * @returns Boolean indicating if in faculty view
 */
export function isInFacultyView(user: any): boolean {
  if (typeof window === "undefined" || !user) return false

  const activeRole = localStorage.getItem("activeRole")
  return activeRole === "faculty" && user.role !== "faculty"
}
