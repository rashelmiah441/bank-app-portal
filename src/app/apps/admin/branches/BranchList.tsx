"use client"

import { useState, useEffect, useCallback } from "react"
import { getBranches, deleteBranch } from "./actions"
import BranchForm from "./BranchForm"
import { Branch } from "@prisma/client"

export default function BranchList() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getBranches(currentPage, 10, search)
      setBranches(data.branches as Branch[])
      setTotal(data.total)
      setPages(data.pages)
    } catch (error) {
      console.error("Failed to fetch branches", error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, search])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this branch?")) {
      await deleteBranch(id)
      fetchData()
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {editingBranch && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="max-w-2xl w-full animate-in zoom-in-95 duration-200">
            <BranchForm 
              initialData={editingBranch} 
              onSuccess={() => {
                setEditingBranch(null)
                fetchData()
              }} 
              onCancel={() => setEditingBranch(null)} 
            />
          </div>
        </div>
      )}

      <div className="p-8 border-b border-gray-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Branch Directory</h2>
          <p className="text-sm text-gray-500 mt-1">Narsingdi branches are prioritized. Total records: <span className="font-semibold text-purple-600">{total}</span>.</p>
        </div>
        <div className="relative group">
          <input
            type="text"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none w-full md:w-96 shadow-inner"
          />
          <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Code</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Branch Name</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">District</th>
              <th className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Routing #</th>
              <th className="px-8 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="animate-spin h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-500 font-medium">Loading branches...</span>
                  </div>
                </td>
              </tr>
            ) : branches.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-gray-50 rounded-full">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-400 font-medium">No branches found matching your search.</span>
                  </div>
                </td>
              </tr>
            ) : (
              branches.map((branch) => (
                <tr key={branch.id} className="hover:bg-purple-50/40 transition-all group">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 uppercase tracking-tighter">
                      {branch.branchCode}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{branch.branchName}</div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {branch.districtName}
                    </div>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                      {branch.routingNumber || "N/A"}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setEditingBranch(branch)}
                        title="Edit Branch"
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(branch.id)}
                        title="Delete Branch"
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500">
            Page <span className="text-gray-900">{currentPage}</span> of <span className="text-gray-900">{pages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.98]"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(pages, p + 1))}
              disabled={currentPage === pages}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.98]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
