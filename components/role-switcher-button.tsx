"use client"

import { Button } from "@/components/ui/button"
import { useRoleSwitcher } from "@/lib/role-switcher"

interface RoleSwitcherButtonProps {
  user: any
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function RoleSwitcherButton({
  user,
  variant = "outline",
  size = "sm",
  className = "",
}: RoleSwitcherButtonProps) {
  const { switchRole } = useRoleSwitcher()

  if (!user || user.role === "student" || user.role === "faculty") {
    return null
  }

  const currentRole = localStorage.getItem("activeRole") || user.role
  const isInFacultyView = currentRole === "faculty"

  const handleClick = () => {
    const currentRole = localStorage.getItem("activeRole") || user.role
    const newRole = currentRole === user.role ? "faculty" : user.role

    // Update localStorage
    localStorage.setItem("activeRole", newRole)

    // Dispatch custom events to ensure all components update
    window.dispatchEvent(
      new CustomEvent("roleChange", {
        detail: { newRole, previousRole: currentRole },
      }),
    )

    // Also dispatch a storage event for components listening to storage changes
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "activeRole",
        newValue: newRole,
        oldValue: currentRole,
      }),
    )

    // Call the role switcher function
    switchRole(user.role, user)
  }

  return (
    <Button variant={variant} size={size} className={`justify-start gap-2 ${className}`} onClick={handleClick}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
        <path d="M3 3v5 h5"></path>
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
        <path d="M16 21h5v-5"></path>
      </svg>
      <span>Switch to {isInFacultyView ? getRoleDisplayName(user.role) : "Faculty"} View</span>
    </Button>
  )
}

function getRoleDisplayName(role: string): string {
  const displayNames: Record<string, string> = {
    hod: "HOD",
    admin: "Admin",
    principal: "Principal",
    coordinator: "Coordinator",
    faculty: "Faculty",
  }

  return displayNames[role] || role
}
