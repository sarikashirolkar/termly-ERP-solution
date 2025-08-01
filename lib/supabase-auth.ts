import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database-schema"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Authentication service that works with RLS policies
export const authService = {
  // Sign in a user and create a proper Supabase session
  async signInUser(email: string, userId: string) {
    try {
      console.log("Attempting to sign in user:", { email, userId })

      // For development/testing, we'll use a custom token approach
      // In production, you'd use proper Supabase Auth sign-in

      // First, check if user exists in our users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .eq("email", email)
        .single()

      if (userError || !userData) {
        console.error("User not found in database:", userError)
        throw new Error("User not found")
      }

      // Create a session using Supabase Auth admin functions
      // This is a workaround for custom auth systems
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: "temp_password_" + userId, // This would be handled differently in production
      })

      if (authError) {
        console.log("Direct auth failed, trying alternative approach...")

        // Alternative: Set the session manually using admin functions
        // This requires the user to exist in Supabase Auth
        return await this.createCustomSession(userData)
      }

      console.log("User signed in successfully:", authData.user?.id)
      return authData.user
    } catch (error) {
      console.error("Error signing in user:", error)
      throw error
    }
  },

  // Create a custom session for users not in Supabase Auth
  async createCustomSession(userData: any) {
    try {
      // For systems with custom auth, we need to create a temporary user in Supabase Auth
      // or use service role to bypass RLS
      console.log("Creating custom session for user:", userData.id)

      // Try to create user in Supabase Auth if they don't exist
      const tempPassword = "temp_" + userData.id + "_" + Date.now()

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: tempPassword,
        options: {
          data: {
            user_id: userData.id,
            role: userData.role,
          },
        },
      })

      if (signUpError && !signUpError.message.includes("already registered")) {
        console.error("Error creating auth user:", signUpError)
        throw signUpError
      }

      // Now try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: tempPassword,
      })

      if (signInError) {
        console.error("Error signing in after creation:", signInError)
        throw signInError
      }

      console.log("Custom session created successfully")
      return signInData.user
    } catch (error) {
      console.error("Error creating custom session:", error)
      throw error
    }
  },

  // Get current session
  async getCurrentSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()
    if (error) {
      console.error("Error getting session:", error)
      return null
    }
    return session
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error)
      throw error
    }
  },

  // Get authenticated Supabase client
  getAuthenticatedClient() {
    return supabase
  },
}
