"use client"

import React from "react"

interface PrintKPIProps {
  month: string
  data: any
  branchInfo: {
    name: string
    nameBangla?: string
    code: string
    district: string
    zone: string
  }
}

export default function PrintKPI({ month, data, branchInfo }: PrintKPIProps) {
  const topics = Object.keys(data)
  const metrics = [
    "Branch Achievement 2025",
    "Branch Target 2026",
    "Branch Target Up to Current Month",
    "Branch Achievement Up to Current Month (Last Year)",
    "Branch Achievement Up to Current Month (This Year)",
    "Achievement Percentage"
  ]

  const formatDate = (monthStr: string) => {
    const [year, m] = monthStr.split("-")
    return new Date(parseInt(year), parseInt(m) - 1).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long"
    })
  }

  const getDynamicLabel = (metric: string) => {
    const [yearStr, monthStr] = month.split("-")
    const year = parseInt(yearStr)
    const monthIndex = parseInt(monthStr) - 1
    const monthName = new Date(year, monthIndex).toLocaleDateString("en-US", { month: "long" })

    if (metric === "Branch Target Up to Current Month") {
      return `Target (${monthName}, ${year})`
    }
    if (metric === "Branch Achievement Up to Current Month (Last Year)") {
      return `Achievement (${monthName}, ${year - 1})`
    }
    if (metric === "Branch Achievement Up to Current Month (This Year)") {
      return `Achievement (${monthName}, ${year})`
    }
    if (metric === "Achievement Percentage") {
      return "Achievement %"
    }
    return metric.replace("Branch ", "")
  }

  // Calculate dynamic top 4 categories by achievement percentage
  const topCategories = topics
    .map(topic => ({
      name: topic,
      val: data[topic]?.['Achievement Percentage'] || '0%',
      percentage: parseFloat(data[topic]?.['Achievement Percentage']?.replace('%', '') || '0')
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 4)

  return (
    <div className="print-container bg-white text-black p-4 max-w-[210mm] mx-auto leading-tight" style={{ fontSize: '9pt' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 5mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print { display: none !important; }
        }
        table { border-collapse: collapse; width: 100%; table-layout: fixed; }
        th, td { border: 0.5pt solid #e5e7eb; padding: 4pt 6pt; word-wrap: break-word; }
        .bg-gray-header { background-color: #f9fafb !important; }
        .text-indigo-print { color: #4338ca !important; }
        .font-bold { font-weight: 700; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
      `}} />

      {/* Header */}
      <div className="border-b-2 border-indigo-600 pb-4 mb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-indigo-print m-0 uppercase tracking-tighter">KPI Performance Report</h1>
          <p className="m-0 font-bold text-gray-700">{formatDate(month)}</p>
        </div>
        <div className="text-right">
          <p className="m-0 font-bold">{branchInfo.name} Branch ({branchInfo.code})</p>
          {branchInfo.nameBangla && (
            <p className="m-0 font-bold text-gray-600 text-[8pt]">
              {branchInfo.nameBangla} শাখা{branchInfo.zone && `, ${branchInfo.zone}`}
            </p>
          )}
        </div>
      </div>

      {/* Dynamic Summary Stats Bar - Shows Top 4 by Achievement */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {topCategories.map((stat, i) => (
          <div key={i} className="bg-indigo-50 border border-indigo-100 p-2 rounded text-center">
            <div className="text-[7pt] text-indigo-700 uppercase font-bold truncate">{stat.name}</div>
            <div className="text-lg font-bold text-indigo-900 leading-none">{stat.val}</div>
          </div>
        ))}
      </div>

      {/* Main Data Table */}
      <table className="text-[8pt]">
        <thead>
          <tr className="bg-gray-header">
            <th className="w-1/4 text-left">Category (Figures in Crore)</th>
            {metrics.map((m, i) => (
              <th key={i} className="text-center">
                {getDynamicLabel(m)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {topics.map((topic, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
              <td className="font-bold text-indigo-900 border-l-2 border-l-indigo-600">{topic}</td>
              {metrics.map((metric, j) => (
                <td key={j} className={`text-center ${metric === 'Achievement Percentage' ? 'font-bold text-indigo-700' : ''}`}>
                  {data[topic][metric] || '0.00'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center text-[7pt] text-gray-400">
        <div>Generated by App-Portal KPI System | {new Date().toLocaleString()}</div>
        <div className="italic">All figures are in Crore unless otherwise specified.</div>
      </div>
      
      {/* Signature Section */}
      <div className="mt-12 grid grid-cols-2 gap-20 px-10">
        <div className="border-t border-black pt-1 text-center font-bold uppercase">Prepared By</div>
        <div className="border-t border-black pt-1 text-center font-bold uppercase">Branch Manager</div>
      </div>
    </div>
  )
}
