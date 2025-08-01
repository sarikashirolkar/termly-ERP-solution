// Database models for user credentials and theme preferences

// User credential model
export interface UserCredential {
  id: string
  email: string
  passwordHash: string // Hashed password, never store plain text
  salt: string // Salt used for password hashing
  role: "student" | "faculty" | "admin"
  firstName: string
  lastName: string
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
}

// User preference model
// This file is intentionally left empty as database schema is defined in lib/database-schema.ts
// and interactions are handled by lib/supabase-service.ts.
// This file might have been intended for ORM models, but we are using direct Supabase client.

// Session model for authentication
export interface UserSession {
  id: string
  userId: string
  token: string
  expiresAt: Date
  createdAt: Date
  ipAddress?: string
  userAgent?: string
}

// Remember me token model
export interface RememberMeToken {
  id: string
  userId: string
  selector: string // Random selector used to find the token
  validator: string // Hashed token that is validated
  expiresAt: Date
  createdAt: Date
}
