"use client"

import { useState, useRef } from "react"
import { uploadBranchesExcel } from "./actions"

interface ExcelUploadProps {
  onSuccess: () => void
}

export default function ExcelUpload({ onSuccess }: ExcelUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) return

    setIsUploading(true)
    setMessage(null)

    const formData = new FormData()
    formData.append("file", file)
    
    try {
      const result = await uploadBranchesExcel(formData)
      setMessage({ type: "success", text: `Successfully imported ${result.count} branches!` })
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      onSuccess()
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Upload failed" })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Bulk Import via Excel</h3>
      </div>
      
      <p className="text-sm text-gray-500 mb-6">
        Quickly add multiple branches by uploading an Excel file. Use headers: 
        <span className="font-mono text-xs bg-gray-50 text-purple-700 px-2 py-1 rounded ml-1 border border-purple-100">
          District Name, Branch Name, Branch Code, Routing Number, Phone Number
        </span>
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6 mt-auto">
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
            file ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            name="file" 
            accept=".xlsx, .xls"
            required
            className="hidden"
            id="excel-upload-main"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <label htmlFor="excel-upload-main" className="cursor-pointer flex flex-col items-center">
            {file ? (
              <>
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-gray-900">{file.name}</span>
                <span className="text-xs text-gray-500 mt-1">File selected - Click to change</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-900">Choose Excel file</span>
                <span className="text-xs text-gray-400 mt-1">or drag and drop here</span>
              </>
            )}
          </label>
        </div>

        <button
          type="submit"
          disabled={isUploading || !file}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload & Import Branches
            </>
          )}
        </button>

        {message && (
          <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
            message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
          }`}>
            {message.type === "success" ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {message.text}
          </div>
        )}
      </form>
    </div>
  )
}
