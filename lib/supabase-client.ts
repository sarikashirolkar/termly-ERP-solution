import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database-schema"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create the main Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Function to get authenticated Supabase client
export const getAuthenticatedSupabaseClient = async () => {
  // Get the current session
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error("Error getting session:", error)
    return supabase // Return regular client if session fails
  }

  if (!session) {
    console.warn("No active session found")
    return supabase // Return regular client if no session
  }

  // Create authenticated client with the session token
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
  })
}

// Function to ensure user is authenticated and set up session
export const ensureAuthentication = async (user: any) => {
  try {
    // Check if we already have a session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session && session.user.id === user.id) {
      console.log("Session already exists for user:", user.id)
      return session.access_token
    }

    // If no session, try to sign in the user
    // Note: This is a simplified approach. In a real app, you'd handle this differently
    console.log("No session found, user needs to authenticate properly")
    return null
  } catch (error) {
    console.error("Error ensuring authentication:", error)
    return null
  }
}

export default supabase
