"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Upload } from "lucide-react"

interface FileImportExportProps {
  onImport: (data: string) => void
  onExport: () => void
  exportFileName?: string
}

export function FileImportExport({ onImport, onExport, exportFileName = "data.csv" }: FileImportExportProps) {
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const csvData = event.target?.result as string
      if (csvData) {
        onImport(csvData)
        setIsImporting(false)
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex items-center gap-2">
      {isImporting ? (
        <div className="flex items-center gap-2">
          <Input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} className="max-w-[250px]" />
          <Button variant="outline" size="sm" onClick={() => setIsImporting(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setIsImporting(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Import CSV
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={onExport}>
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
    </div>
  )
}
