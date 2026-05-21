"use client"
import { useState } from "react"
import { getComparisonData } from "@/app/apps/branch-position/actions"

export default function ComparisonClient() {
  const [date1, setDate1] = useState("")
  const [date2, setDate2] = useState("")
  const [data, setData] = useState<{ gl: any[], pl: any[] }>({ gl: [], pl: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleCompare = async () => {
    if (!date1 || !date2) return
    setIsLoading(true)
    try {
      const results = await getComparisonData(date1, date2)
      setData(results)
      setHasSearched(true)
    } catch (error) {
      console.error("Comparison error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatBalance = (val: any) => {
    if (typeof val !== 'string') return "0.00"
    const num = parseFloat(val.replace(/,/g, ''))
    if (isNaN(num)) return "0.00"
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const calculateDiff = (val2: string, val1: string) => {
    const n2 = parseFloat(val2.replace(/,/g, ''))
    const n1 = parseFloat(val1.replace(/,/g, ''))
    if (isNaN(n2) || isNaN(n1)) return "0.00"
    const diff = n2 - n1
    return diff.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-6 items-end">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Date 1</label>
          <input
            type="date"
            value={date1}
            onChange={(e) => setDate1(e.target.value)}
            className="block w-full sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Date 2</label>
          <input
            type="date"
            value={date2}
            onChange={(e) => setDate2(e.target.value)}
            className="block w-full sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
        <button
          onClick={handleCompare}
          disabled={isLoading || !date1 || !date2}
          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
        >
          {isLoading ? "Comparing..." : "Compare"}
        </button>
      </div>

      {hasSearched && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* GL Comparison */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">GL Comparison</h2>
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{date1}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{date2}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Diff</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.gl.map((row, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{row.description}</td>
                      <td className="px-4 py-4 text-sm text-right font-mono text-gray-500">{formatBalance(row.date1)}</td>
                      <td className="px-4 py-4 text-sm text-right font-mono text-gray-500">{formatBalance(row.date2)}</td>
                      <td className="px-4 py-4 text-sm text-right font-mono font-bold text-gray-900">{calculateDiff(row.date2, row.date1)}</td>
                    </tr>
                  ))}
                  {data.gl.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-4 text-sm text-gray-500 text-center">No GL items</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* PL Comparison */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">PL Comparison</h2>
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{date1}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">{date2}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Diff</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.pl.map((row, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">{row.description}</td>
                      <td className="px-4 py-4 text-sm text-right font-mono text-gray-500">{formatBalance(row.date1)}</td>
                      <td className="px-4 py-4 text-sm text-right font-mono text-gray-500">{formatBalance(row.date2)}</td>
                      <td className="px-4 py-4 text-sm text-right font-mono font-bold text-gray-900">{calculateDiff(row.date2, row.date1)}</td>
                    </tr>
                  ))}
                  {data.pl.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-4 text-sm text-gray-500 text-center">No PL items</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
