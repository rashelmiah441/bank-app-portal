"use client"

import { useState } from "react"
import { createBranch, updateBranch } from "./actions"
import { Branch } from "@prisma/client"

interface BranchFormProps {
  initialData?: Branch
  onSuccess: () => void
  onCancel?: () => void
}

export default function BranchForm({ initialData, onSuccess, onCancel }: BranchFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setIsLoading(true)
    setError(null)

    const formData = new FormData(form)
    const data = {
      districtName: formData.get("districtName") as string,
      branchName: formData.get("branchName") as string,
      branchCode: formData.get("branchCode") as string,
      routingNumber: formData.get("routingNumber") as string,
      phoneNumber: formData.get("phoneNumber") as string,
    }

    try {
      if (initialData) {
        await updateBranch(initialData.id, data)
      } else {
        await createBranch(data)
        form.reset()
      }
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-100 rounded-lg">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">
          {initialData ? "Edit Branch" : "Insert New Branch"}
        </h3>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">District Name</label>
          <input 
            name="districtName" 
            defaultValue={initialData?.districtName}
            placeholder="e.g. Dhaka"
            required 
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" 
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Branch Name</label>
          <input 
            name="branchName" 
            defaultValue={initialData?.branchName}
            placeholder="e.g. Motijheel"
            required 
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" 
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Branch Code</label>
          <input 
            name="branchCode" 
            defaultValue={initialData?.branchCode}
            placeholder="e.g. 0101"
            required 
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" 
          />
        </div>
        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Routing Number</label>
          <input 
            name="routingNumber" 
            defaultValue={initialData?.routingNumber}
            placeholder="9-digit number"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" 
          />
        </div>
        <div className="md:col-span-2 space-y-1">
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
          <input 
            name="phoneNumber" 
            defaultValue={initialData?.phoneNumber}
            placeholder="Contact number"
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none" 
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-6 mt-auto border-t border-gray-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {initialData ? "Update Branch" : "Insert Branch"}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
