import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getLatestData } from "@/app/apps/branch-position/actions"
import Link from "next/link"

export default async function LatestPositionPage() {
  const session = await auth()
  if (!session) redirect("/api/auth/signin")

  const data = await getLatestData()

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

  const isEmpty = data.gl.length === 0 && data.pl.length === 0

  // Define highlight patterns
  const highlights = [
    { label: "Total Deposit", pattern: "Total Deposit", color: "bg-blue-600", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { label: "Loans & Advances", pattern: "Loans & Advances", color: "bg-indigo-600", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Total Income", pattern: "Total Income", color: "bg-emerald-600", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
    { label: "Expenses & Provisions", pattern: "Expenses & Provisions", color: "bg-rose-600", icon: "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" },
    { label: "Net Income/Loss", pattern: "Net Income/Loss", color: "bg-amber-600", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
  ]

  // Extract highlighted values
  const allItems = [...data.gl, ...data.pl]
  const highlightCards = highlights.map(h => {
    const item = allItems.find(i => i.description.toLowerCase().includes(h.pattern.toLowerCase()))
    return {
      ...h,
      value: item ? item.amount : "0.00"
    }
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gray-50 min-h-screen">
      <div className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Branch Performance</h1>
          <p className="mt-2 text-lg text-gray-600">Executive summary and detailed financial position.</p>
        </div>
        <Link
          href="/apps/branch-position"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          <svg className="mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Hub
        </Link>
      </div>

      {isEmpty ? (
        <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-gray-200 text-center">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">No data configured</h3>
          <p className="mt-2 text-gray-500">Configure your GL/PL descriptions in settings to see your branch performance.</p>
          <Link href="/apps/branch-position/settings" className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-cyan-600 hover:bg-cyan-700">
            Go to Settings
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Highlight Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {highlightCards.map((card, idx) => {
              const valNum = getNumericValue(card.value);
              const isNegative = valNum < 0;
              return (
                <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${card.color}`}></div>
                  <div className={`inline-flex p-3 rounded-xl mb-4 ${card.color} text-white shadow-lg shadow-opacity-20`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{card.label}</h3>
                  <p className={`text-2xl font-black mt-2 tracking-tight ${isNegative ? 'text-rose-600' : 'text-gray-900'}`}>
                    {formatBalance(card.value)}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Detailed GL Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900">GL Details</h2>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Description</th>
                      <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.gl.map((row: any, index: number) => {
                      const isHighlighted = highlights.some(h => row.description.toLowerCase().includes(h.pattern.toLowerCase()));
                      return (
                        <tr key={index} className={`hover:bg-gray-50/50 transition-colors ${isHighlighted ? 'bg-blue-50/30' : ''}`}>
                          <td className="px-8 py-5 text-sm font-semibold text-gray-700">{row.description}</td>
                          <td className={`px-8 py-5 text-sm text-right font-mono font-bold ${getNumericValue(row.amount) < 0 ? 'text-rose-500' : 'text-gray-900'}`}>
                            {formatBalance(row.amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed PL Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-emerald-600 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900">PL Details</h2>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Description</th>
                      <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.pl.map((row: any, index: number) => {
                      const isHighlighted = highlights.some(h => row.description.toLowerCase().includes(h.pattern.toLowerCase()));
                      return (
                        <tr key={index} className={`hover:bg-gray-50/50 transition-colors ${isHighlighted ? 'bg-emerald-50/30' : ''}`}>
                          <td className="px-8 py-5 text-sm font-semibold text-gray-700">{row.description}</td>
                          <td className={`px-8 py-5 text-sm text-right font-mono font-bold ${getNumericValue(row.amount) < 0 ? 'text-rose-500' : 'text-gray-900'}`}>
                            {formatBalance(row.amount)}
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
      )}
    </div>
  )
}
