import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase URL or public key. Make sure to set your environment variables.")
}

export const getClientSupabase = () => {
  return createClient(supabaseUrl!, supabaseAnonKey!)
}

export const createAdminSupabaseClient = () => {
  if (!supabaseServiceRoleKey) {
    throw new Error("Missing Supabase service role key. Make sure to set your environment variables.")
  }
  return createClient(supabaseUrl!, supabaseServiceRoleKey)
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!)
