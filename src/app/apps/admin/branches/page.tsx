"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useState } from "react"
import BranchForm from "./BranchForm"
import BranchList from "./BranchList"
import ExcelUpload from "./ExcelUpload"

export default function BranchesPage() {
  const { data: session, status } = useSession()
  const [refreshKey, setRefreshKey] = useState(0)

  if (status === "loading") return <div className="p-8 text-center">Loading...</div>
  
  if (!session || (session.user as any)?.role !== "ADMIN") {
    redirect("/apps/dashboard")
  }

  const handleRefresh = () => setRefreshKey(prev => prev + 1)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Branch Information Management</h1>
        <p className="text-gray-500">Manage bank branches, upload Excel data, and perform bulk operations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-1">
          <BranchForm onSuccess={handleRefresh} />
        </div>
        <div className="lg:col-span-2">
          <ExcelUpload onSuccess={handleRefresh} />
        </div>
      </div>

      <BranchList key={refreshKey} />
    </div>
  )
}
