"use client"
import { useState } from "react"
import { getComparisonData } from "@/app/apps/branch-position/actions"

export default function ComparisonClient() {
  const [date1, setDate1] = useState("")
  const [date2, setDate2] = useState("")
  const [branchCode, setBranchCode] = useState("")
  const [data, setData] = useState<{ gl: any[], pl: any[] }>({ gl: [], pl: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleCompare = async () => {
    if (!date1 || !date2) return
    setIsLoading(true)
    try {
      const results = await getComparisonData(date1, date2, branchCode)
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

  const getNumericValue = (val: any) => {
    if (typeof val !== 'string') return 0
    const num = parseFloat(val.replace(/,/g, ''))
    return isNaN(num) ? 0 : num
  }

  // Define highlight patterns for comparison
  const highlightPatterns = [
    { label: "Total Deposit", pattern: "Total Deposit", color: "bg-blue-600" },
    { label: "Loans & Advances", pattern: "Loans & Advances", color: "bg-indigo-600" },
    { label: "Total Income", pattern: "Total Income", color: "bg-emerald-600" },
    { label: "Expenses & Provisions", pattern: "Expenses & Provisions", color: "bg-rose-600" },
    { label: "Net Income/Loss", pattern: "Net Income/Loss", color: "bg-amber-600" },
  ]

  const getSummaryHighlights = () => {
    const allItems = [...data.gl, ...data.pl]
    return highlightPatterns.map(h => {
      const item = allItems.find(i => i.description.toLowerCase().includes(h.pattern.toLowerCase()))
      if (!item) return null
      const val1 = getNumericValue(item.date1)
      const val2 = getNumericValue(item.date2)
      const diff = val2 - val1
      return { ...h, date1: item.date1, date2: item.date2, diff }
    }).filter(Boolean)
  }

  const summary = getSummaryHighlights()

  return (
    <div className="space-y-12">
      {/* Print Button (Floating) */}
      {hasSearched && (
        <button
          onClick={() => window.print()}
          className="fixed bottom-10 right-10 z-50 bg-indigo-600 text-white p-4 rounded-2xl shadow-2xl hover:bg-indigo-700 transition-all transform hover:-translate-y-1 flex items-center gap-2 print:hidden group"
          title="Print Comparison Report"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          <span className="font-bold pr-2">Print Report</span>
        </button>
      )}

      {/* Date & Branch Selector Card */}
      <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-wrap gap-8 items-end relative overflow-hidden print:hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-cyan-600"></div>
        <div className="flex-1 min-w-[200px] space-y-3">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Base Date (From)</label>
          <div className="relative">
            <input
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              className="block w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-cyan-500 focus:bg-white transition-all font-bold text-gray-700"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px] space-y-3">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Target Date (To)</label>
          <div className="relative">
            <input
              type="date"
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
              className="block w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-cyan-500 focus:bg-white transition-all font-bold text-gray-700"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px] space-y-3">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Branch Code</label>
          <div className="relative">
            <input
              type="text"
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value)}
              placeholder="e.g. 1234"
              className="block w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-cyan-500 focus:bg-white transition-all font-bold text-gray-700"
            />
          </div>
        </div>
        <button
          onClick={handleCompare}
          disabled={isLoading || !date1 || !date2}
          className="px-12 py-4 bg-gray-900 hover:bg-black text-white font-black rounded-2xl shadow-2xl shadow-gray-400 transition-all disabled:opacity-50 disabled:shadow-none h-[64px] uppercase tracking-widest text-sm"
        >
          {isLoading ? (
            <span className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.14 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Analyzing...
            </span>
          ) : "Compare"}
        </button>
      </div>

      {hasSearched && (
        <div className="space-y-16 animate-in fade-in zoom-in-95 duration-700">
          {/* Comparison Highlights - Forced to be side-by-side in print */}
          {summary.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 print:flex print:flex-row print:gap-4">
              {summary.map((item: any, idx) => {
                const isGrowth = item.diff > 0;
                return (
                  <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-50 relative overflow-hidden group hover:-translate-y-1 transition-transform print:flex-1 print:p-2 print:rounded-lg print:border-gray-200">
                    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${item.color} print:w-12 print:h-12 print:-mr-4 print:-mt-4`}></div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-3 print:mb-0.5 print:text-[8px] print:tracking-tight">{item.label}</h3>
                    <div className="flex flex-col gap-1 print:gap-0">
                      <span className="text-2xl font-black text-gray-900 tracking-tight print:text-xs">{formatBalance(item.date2)}</span>
                      <div className={`flex items-center gap-1.5 font-black text-sm print:text-[8px] ${isGrowth ? 'text-emerald-500' : 'text-rose-500'}`}>
                        <span className={`p-1 rounded-md print:p-0.5 ${isGrowth ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                          {isGrowth ? '↑' : '↓'}
                        </span>
                        {formatBalance(Math.abs(item.diff).toString())}
                      </div>
                    </div>
                  </div>

                );
              })}
            </div>
          )}

          <div className="flex flex-col gap-16 print:gap-4">
            {/* GL Comparison Table */}
            <div className="space-y-8 print:space-y-2">
              <div className="flex items-center justify-between px-2 print:px-0">
                <div className="flex items-center gap-4 print:gap-2">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 print:w-6 print:h-6 print:rounded-md">
                    <svg className="w-6 h-6 text-white print:w-3 print:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase print:text-sm">GL Comparison</h2>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden print:rounded-xl print:shadow-none print:border-gray-300">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="pl-10 pr-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em] print:pl-4 print:py-1 print:text-[8px]">Description</th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-[0.2em] print:px-2 print:py-1 print:text-[8px]">{date1}</th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-[0.2em] print:px-2 print:py-1 print:text-[8px]">{date2}</th>
                        <th className="pl-6 pr-10 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-[0.2em] print:pr-4 print:py-1 print:text-[8px]">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 print:divide-gray-200">
                      {data.gl.map((row, index) => {
                        const diff = getNumericValue(row.date2) - getNumericValue(row.date1);
                        const isSignificant = highlightPatterns.some(p => row.description.toLowerCase().includes(p.pattern.toLowerCase()));
                        return (
                          <tr key={index} className={`group hover:bg-gray-50/80 transition-all duration-300 ${isSignificant ? 'bg-blue-50/20' : ''} print:bg-transparent`}>
                            <td className="pl-10 pr-6 py-3 text-sm font-black text-gray-700 group-hover:text-blue-600 transition-colors print:pl-4 print:py-0.5 print:text-[9px]">{row.description}</td>
                            <td className="px-6 py-3 text-sm text-right font-mono font-bold text-gray-400 print:px-2 print:py-0.5 print:text-[9px]">{formatBalance(row.date1)}</td>
                            <td className="px-6 py-3 text-sm text-right font-mono font-black text-gray-900 print:px-2 print:py-0.5 print:text-[9px]">{formatBalance(row.date2)}</td>
                            <td className="pl-6 pr-10 py-3 text-right print:pr-4 print:py-0.5">
                              <span className="font-black font-mono print:text-[9px]">
                                {diff > 0 ? '+' : ''}{formatBalance(diff.toString())}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* PL Comparison Table - Forced to Page 2 */}
            <div className="space-y-8 print:space-y-2 print:mt-4 print:break-before-page">
              <div className="flex items-center justify-between px-2 print:px-0">
                <div className="flex items-center gap-4 print:gap-2">
                  <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 print:w-6 print:h-6 print:rounded-md">
                    <svg className="w-6 h-6 text-white print:w-3 print:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase print:text-sm">PL Comparison</h2>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden print:rounded-xl print:shadow-none print:border-gray-300">
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50">
                        <th className="pl-10 pr-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em] print:pl-4 print:py-1 print:text-[8px]">Description</th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-[0.2em] print:px-2 print:py-1 print:text-[8px]">{date1}</th>
                        <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-[0.2em] print:px-2 print:py-1 print:text-[8px]">{date2}</th>
                        <th className="pl-6 pr-10 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-[0.2em] print:pr-4 print:py-1 print:text-[8px]">Variance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 print:divide-gray-200">
                      {data.pl.map((row, index) => {
                        const diff = getNumericValue(row.date2) - getNumericValue(row.date1);
                        const isSignificant = highlightPatterns.some(p => row.description.toLowerCase().includes(p.pattern.toLowerCase()));
                        return (
                          <tr key={index} className={`group hover:bg-gray-50/80 transition-all duration-300 ${isSignificant ? 'bg-emerald-50/20' : ''} print:bg-transparent`}>
                            <td className="pl-10 pr-6 py-3 text-sm font-black text-gray-700 group-hover:text-emerald-600 transition-colors print:pl-4 print:py-0.5 print:text-[9px]">{row.description}</td>
                            <td className="px-6 py-3 text-sm text-right font-mono font-bold text-gray-400 print:px-2 print:py-0.5 print:text-[9px]">{formatBalance(row.date1)}</td>
                            <td className="px-6 py-3 text-sm text-right font-mono font-black text-gray-900 print:px-2 print:py-0.5 print:text-[9px]">{formatBalance(row.date2)}</td>
                            <td className="pl-6 pr-10 py-3 text-right print:pr-4 print:py-0.5">
                              <span className="font-black font-mono print:text-[9px]">
                                {diff > 0 ? '+' : ''}{formatBalance(diff.toString())}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
          body {
            background: white !important;
            padding: 0 !important;
          }
          .animate-in {
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
          /* Ensure text doesn't overflow in portrait */
          table {
            table-layout: fixed;
            width: 100%;
          }
          th:first-child, td:first-child {
            width: 40%;
            word-wrap: break-word;
          }
        }
      `}</style>
    </div>
  )
}
