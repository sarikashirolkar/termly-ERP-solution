"use client"

import { useEffect, useState } from "react"
import { checkSupabaseConnection } from "@/lib/supabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export function SupabaseConnectionCheck() {
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "failed">("checking")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const isConnected = await checkSupabaseConnection()
        if (isConnected) {
          setConnectionStatus("connected")
        } else {
          setConnectionStatus("failed")
          setError("Unable to connect to Supabase database")
        }
      } catch (err) {
        setConnectionStatus("failed")
        setError(err instanceof Error ? err.message : "Unknown connection error")
      }
    }

    checkConnection()
  }, [])

  if (connectionStatus === "checking") {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Checking Database Connection</AlertTitle>
        <AlertDescription>Verifying connection to Supabase...</AlertDescription>
      </Alert>
    )
  }

  if (connectionStatus === "failed") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Database Connection Failed</AlertTitle>
        <AlertDescription>
          {error || "Unable to connect to the database. Please check your Supabase configuration."}
          <br />
          <br />
          Make sure you have:
          <ul className="list-disc list-inside mt-2">
            <li>Set NEXT_PUBLIC_SUPABASE_URL in your environment variables</li>
            <li>Set NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables</li>
            <li>Run the database schema from database/complete_nexalink_schema.sql</li>
          </ul>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Database Connected</AlertTitle>
      <AlertDescription className="text-green-700">Successfully connected to Supabase database.</AlertDescription>
    </Alert>
  )
}
