"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import KPIForm from "./KPIForm"
import PrintKPI from "./PrintKPI"
import { saveKPIReport, deleteKPIReport, updateKPIBaseline } from "./actions"
import { useReactToPrint } from "react-to-print"

export default function KPIDashboard({ 
  initialReports, 
  initialBaseline,
  user
}: { 
  initialReports: any[],
  initialBaseline: any,
  user: any
}) {
  const [view, setView] = useState<"dashboard" | "form">("dashboard")
  const [editingReport, setEditingReport] = useState<any>(null)
  const [reports, setReports] = useState(initialReports)
  const [baseline, setBaseline] = useState(initialBaseline)
  
  // Printing support
  const [printData, setPrintData] = useState<any>(null)
  const printRef = useRef<HTMLDivElement>(null)
  const handlePrintAction = useReactToPrint({
    contentRef: printRef,
    documentTitle: `KPI_Report_${printData?.month || 'export'}`,
  })

  const handleCreateNew = () => {
    setEditingReport(null)
    setView("form")
  }

  const handleEdit = (report: any) => {
    setEditingReport(report)
    setView("form")
  }

  const handlePrint = (report: any) => {
    setPrintData(report)
    // Small delay to ensure state update before print dialog opens
    setTimeout(() => {
      handlePrintAction()
    }, 100)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this report?")) {
      await deleteKPIReport(id)
      setReports(reports.filter(r => r.id !== id))
    }
  }

  const handleSave = async (month: string, data: any) => {
    const savedReport = await saveKPIReport(month, data)
    await updateKPIBaseline(data)
    
    const index = reports.findIndex(r => r.month === month)
    if (index > -1) {
      const newReports = [...reports]
      newReports[index] = savedReport
      setReports(newReports)
    } else {
      setReports([savedReport, ...reports].sort((a, b) => b.month.localeCompare(a.month)))
    }

    const newBaseline: Record<string, any> = {}
    Object.keys(data).forEach(topic => {
      newBaseline[topic] = {
        "Branch Achievement 2025": data[topic]["Branch Achievement 2025"],
        "Branch Target 2026": data[topic]["Branch Target 2026"]
      }
    })
    setBaseline(newBaseline)
  }

  const formatDate = (monthStr: string) => {
    const [year, month] = monthStr.split("-")
    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long"
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Hidden Print Component */}
      <div className="hidden">
        <div ref={printRef}>
          {printData && (
            <PrintKPI 
              month={printData.month} 
              data={JSON.parse(printData.data)} 
              branchInfo={{
                name: user.branchName || "Unknown",
                nameBangla: user.branchNameBangla,
                code: user.branchCode || "0000",
                district: user.districtName || "N/A",
                zone: user.zoneName || "N/A"
              }}
            />
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <Link 
              href="/apps/dashboard" 
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-2 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {view === "dashboard" ? "KPI Dashboard" : editingReport ? "Edit KPI Report" : "Create New KPI Report"}
            </h1>
            <p className="text-gray-500 mt-1">
              {view === "dashboard" 
                ? "Manage and monitor your month-wise performance reports (Figures in Crore)." 
                : "Enter performance metrics for the selected month (Figures in Crore)."}
            </p>
          </div>
          {view === "dashboard" && (
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Report
            </button>
          )}
        </div>

        {view === "dashboard" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.length > 0 ? (
              reports.map((report) => (
                <div key={report.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group">
                  <div className="bg-indigo-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-indigo-900">{formatDate(report.month)}</h3>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handlePrint(report)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                        title="Print"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleEdit(report)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(report.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-500 mb-4">Last updated: {new Date(report.updatedAt).toLocaleDateString()}</p>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEdit(report)}
                        className="flex-1 py-2.5 px-4 bg-gray-50 hover:bg-indigo-50 text-indigo-700 font-semibold rounded-xl border border-gray-200 hover:border-indigo-200 transition-all"
                      >
                        Edit Details
                      </button>
                      <button 
                        onClick={() => handlePrint(report)}
                        className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-all"
                        title="Quick Print"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">No KPI reports found</h3>
                <p className="text-gray-500 mt-1">Start by creating your first month-wise report.</p>
                <button
                  onClick={handleCreateNew}
                  className="mt-6 text-indigo-600 font-semibold hover:underline"
                >
                  Create New Report
                </button>
              </div>
            )}
          </div>
        ) : (
          <KPIForm 
            initialData={editingReport ? JSON.parse(editingReport.data) : null}
            initialMonth={editingReport?.month}
            baseline={baseline}
            onSave={handleSave}
            onCancel={() => setView("dashboard")}
          />
        )}
      </div>
    </div>
  )
}
