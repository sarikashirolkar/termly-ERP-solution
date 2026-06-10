// Updated credentials file with only admin and principal users initially
// Other users will be imported via CSV

export interface UserCredential {
  id: string
  email: string
  password: string
  role: string
  name: string
  department?: string
}

// Initial system credentials - only admin and principal
export const allCredentials: UserCredential[] = [
  {
    id: "admin1",
    email: "admin@termly.edu",
    password: "admin123",
    role: "admin",
    name: "System Administrator",
    department: "Administration",
  },
  {
    id: "principal1",
    email: "principal@termly.edu",
    password: "principal123",
    role: "principal",
    name: "Dr. Ganesha Prasad",
    department: "Administration",
  },
]

// Function to get all credentials including imported users
export function getAllCredentials(): UserCredential[] {
  if (typeof window === "undefined") {
    return allCredentials
  }

  try {
    const importedUsers = JSON.parse(localStorage.getItem("importedUsers") || "[]")
    const formattedImportedUsers = importedUsers.map((user: any) => ({
      id: user.id,
      email: user.email,
      password: user.password_hash, // In real app, this would be handled securely
      role: user.role,
      name: `${user.first_name} ${user.last_name}`,
      department: user.department,
    }))

    return [...allCredentials, ...formattedImportedUsers]
  } catch (error) {
    console.error("Error loading imported users:", error)
    return allCredentials
  }
}

// Function to add imported user credentials
export function addImportedCredentials(users: any[]) {
  if (typeof window === "undefined") return

  try {
    const existingUsers = JSON.parse(localStorage.getItem("importedUsers") || "[]")
    const updatedUsers = [...existingUsers, ...users]
    localStorage.setItem("importedUsers", JSON.stringify(updatedUsers))
  } catch (error) {
    console.error("Error saving imported users:", error)
  }
}
