import type { UserRole } from "./database-schema"

const USER_KEY = "termly_user"
const TOKEN_KEY = "termly_token"
const ROLE_KEY = "termly_role"

export const authStorage = {
  setUser: (user: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
  },
  getUser: () => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem(USER_KEY)
      return user ? JSON.parse(user) : null
    }
    return null
  },
  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token)
    }
  },
  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TOKEN_KEY)
    }
    return null
  },
  setRole: (role: UserRole) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ROLE_KEY, role)
    }
  },
  getRole: (): UserRole | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(ROLE_KEY) as UserRole | null
    }
    return null
  },
  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(ROLE_KEY)
    }
  },
}
