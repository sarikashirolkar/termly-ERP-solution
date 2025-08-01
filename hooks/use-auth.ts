"use client"

import { useState, useEffect } from "react"
import supabase from "@/lib/supabase-client" // Corrected import

interface User {
  id: string
  email: string
  full_name?: string
  role?: string
  first_name?: string
  last_name?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  // supabase is now directly imported as the client instance

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) {
          // Get user details from our users table
          const { data: userData } = await supabase.from("users").select("*").eq("id", session.user.id).single()

          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              full_name: userData.full_name,
              role: userData.role,
              first_name: userData.first_name,
              last_name: userData.last_name,
            })
          }
        }
      } catch (error) {
        console.error("Error getting session:", error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: userData } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (userData) {
          setUser({
            id: userData.id,
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role,
            first_name: userData.first_name,
            last_name: userData.last_name,
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
