"use client"

import { useState, useEffect } from "react"
import { fetchGLPLData } from "./actions"

const topics = [
  "Deposit",
  "Loans and Advance",
  "Profit",
  "Foreign Remittance",
  "Classified Loans Recovery",
  "Write Off Loan Recovery",
  "Import",
  "Export",
  "Non Interest Income"
]

const metrics = [
  "Branch Achievement 2025",
  "Branch Target 2026",
  "Branch Target Up to Current Month",
  "Branch Achievement Up to Current Month (Last Year)",
  "Branch Achievement Up to Current Month (This Year)",
  "Achievement Percentage"
]

interface KPIFormProps {
  initialData?: any
  initialMonth?: string
  baseline?: any
  onSave: (month: string, data: any) => Promise<void>
  onCancel: () => void
}

export default function KPIForm({ initialData, initialMonth, baseline, onSave, onCancel }: KPIFormProps) {
  const [month, setMonth] = useState(initialMonth || new Date().toISOString().slice(0, 7))
  const [data, setData] = useState(() => {
    const result = initialData ? JSON.parse(JSON.stringify(initialData)) : {}
    topics.forEach(topic => {
      if (!result[topic]) result[topic] = {}
      metrics.forEach(metric => {
        // If it's a baseline metric, prefer the global baseline if available
        if ((metric === "Branch Achievement 2025" || metric === "Branch Target 2026") && baseline?.[topic]?.[metric]) {
          result[topic][metric] = baseline[topic][metric]
        } else if (result[topic][metric] === undefined) {
          result[topic][metric] = ""
        }
      })
    })
    return result
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isFetchingGL, setIsFetchingGL] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Automatic calculation logic
  useEffect(() => {
    const monthNum = parseInt(month.split("-")[1]);
    if (isNaN(monthNum)) return;

    setData((prev: any) => {
      const newData = { ...prev };
      topics.forEach(topic => {
        const achievement2025 = parseFloat(newData[topic]["Branch Achievement 2025"]) || 0;
        const target2026 = parseFloat(newData[topic]["Branch Target 2026"]) || 0;
        const achievementThisYear = parseFloat(newData[topic]["Branch Achievement Up to Current Month (This Year)"]) || 0;

        let targetUpToMonth = 0;
        if (topic === "Profit" || topic === "Classified Loans Recovery" || topic === "Non Interest Income") {
          // Special Formula for selected categories: (Target 2026 / 12) * monthNum
          targetUpToMonth = (target2026 / 12) * monthNum;
        } else {
          // Standard Growth Formula: ((Target 2026 - Achievement 2025) / 12 * monthNum) + Achievement 2025
          targetUpToMonth = ((target2026 - achievement2025) / 12 * monthNum) + achievement2025;
        }

        const percentage = targetUpToMonth !== 0 ? (achievementThisYear / targetUpToMonth) * 100 : 0;

        newData[topic] = {
          ...newData[topic],
          "Branch Target Up to Current Month": targetUpToMonth.toFixed(2),
          "Achievement Percentage": percentage.toFixed(2) + "%"
        };
      });
      return newData;
    });
  }, [month]);

  const handleChange = (topic: string, metric: string, value: string) => {
    setData((prev: any) => {
      const newData = {
        ...prev,
        [topic]: {
          ...prev[topic],
          [metric]: value
        }
      };

      // Re-calculate derived fields for this topic
      const monthNum = parseInt(month.split("-")[1]);
      const achievement2025 = parseFloat(newData[topic]["Branch Achievement 2025"]) || 0;
      const target2026 = parseFloat(newData[topic]["Branch Target 2026"]) || 0;
      const achievementThisYear = parseFloat(newData[topic]["Branch Achievement Up to Current Month (This Year)"]) || 0;

      let targetUpToMonth = 0;
      if (topic === "Profit" || topic === "Classified Loans Recovery" || topic === "Non Interest Income") {
        // Special Formula for selected categories: (Target 2026 / 12) * monthNum
        targetUpToMonth = (target2026 / 12) * monthNum;
      } else {
        // Standard Growth Formula: ((Target 2026 - Achievement 2025) / 12 * monthNum) + Achievement 2025
        targetUpToMonth = ((target2026 - achievement2025) / 12 * monthNum) + achievement2025;
      }

      const percentage = targetUpToMonth !== 0 ? (achievementThisYear / targetUpToMonth) * 100 : 0;

      newData[topic]["Branch Target Up to Current Month"] = targetUpToMonth.toFixed(2);
      newData[topic]["Achievement Percentage"] = percentage.toFixed(2) + "%";

      return newData;
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveSuccess(false)
    setFetchError(null)
    try {
      await onSave(month, data)
      setSaveSuccess(true)
      // Hide success message after 5 seconds
      setTimeout(() => setSaveSuccess(false), 5000)
    } catch (err: any) {
      setFetchError(err.message || "Failed to save report")
    } finally {
      setIsSaving(false)
    }
  }

  const handleFetchGL = async (targetTopic: "Deposit" | "Loans and Advance" | "Profit" | "Non Interest Income") => {
    setIsFetchingGL(true)
    setFetchError(null)
    try {
      const result = await fetchGLPLData(month)
      if (result.success) {
        let value = "0.00"
        if (targetTopic === "Deposit") value = result.data.deposit
        else if (targetTopic === "Loans and Advance") value = result.data.loans
        else if (targetTopic === "Profit") value = result.data.profit
        else if (targetTopic === "Non Interest Income") value = result.data.nonInterestIncome
        
        handleChange(targetTopic, "Branch Achievement Up to Current Month (This Year)", value)
      }
    } catch (err: any) {
      setFetchError(err.message || "Failed to fetch GL/PL data")
    } finally {
      setIsFetchingGL(false)
    }
  }

  const handleFetchAll = async () => {
    setIsFetchingGL(true)
    setFetchError(null)
    try {
      const result = await fetchGLPLData(month)
      if (result.success) {
        setData((prev: any) => {
          const newData = { ...prev };
          const monthNum = parseInt(month.split("-")[1]);
          
          const updates = [
            { topic: "Deposit", value: result.data.deposit },
            { topic: "Loans and Advance", value: result.data.loans },
            { topic: "Profit", value: result.data.profit },
            { topic: "Non Interest Income", value: result.data.nonInterestIncome }
          ];

          updates.forEach(({ topic, value }) => {
            if (!newData[topic]) newData[topic] = {};
            newData[topic] = {
              ...newData[topic],
              "Branch Achievement Up to Current Month (This Year)": value
            };

            const achievement2025 = parseFloat(newData[topic]["Branch Achievement 2025"]) || 0;
            const target2026 = parseFloat(newData[topic]["Branch Target 2026"]) || 0;
            const achievementThisYear = parseFloat(value) || 0;

            let targetUpToMonth = 0;
            if (topic === "Profit" || topic === "Classified Loans Recovery" || topic === "Non Interest Income") {
              targetUpToMonth = (target2026 / 12) * monthNum;
            } else {
              targetUpToMonth = ((target2026 - achievement2025) / 12 * monthNum) + achievement2025;
            }

            const percentage = targetUpToMonth !== 0 ? (achievementThisYear / targetUpToMonth) * 100 : 0;
            newData[topic]["Branch Target Up to Current Month"] = targetUpToMonth.toFixed(2);
            newData[topic]["Achievement Percentage"] = percentage.toFixed(2) + "%";
          });

          return newData;
        });
      }
    } catch (err: any) {
      setFetchError(err.message || "Failed to fetch GL/PL data")
    } finally {
      setIsFetchingGL(false)
    }
  }

  const isReadOnly = (metric: string) => {
    return metric === "Branch Target Up to Current Month" || metric === "Achievement Percentage";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm font-bold text-gray-700">Select Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
            className="block w-full max-w-xs px-4 py-3 rounded-xl border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleFetchAll}
            disabled={isFetchingGL}
            className="inline-flex items-center px-6 py-3 border border-indigo-200 text-base font-medium rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all disabled:opacity-50"
          >
            <svg className={`w-5 h-5 mr-2 ${isFetchingGL ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isFetchingGL ? "Fetching..." : "Fetch All from GL/PL"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all"
          >
            Go Back
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Report"}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Report saved successfully! You can continue editing or go back to the dashboard.
        </div>
      )}

      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl text-sm font-medium animate-in fade-in slide-in-from-top-4">
          {fetchError}
        </div>
      )}

      {topics.map((topic) => (
        <div key={topic} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-indigo-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-bold text-indigo-900">{topic} (Figures in Crore)</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics.map((metric) => {
                const readOnly = isReadOnly(metric);
                return (
                  <div key={metric} className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      {metric}
                    </label>
                    <input
                      type="text"
                      value={data[topic]?.[metric] || ""}
                      onChange={(e) => !readOnly && handleChange(topic, metric, e.target.value)}
                      readOnly={readOnly}
                      placeholder={metric === "Achievement Percentage" ? "0.00%" : "0.00"}
                      className={`block w-full px-4 py-3 rounded-xl border-gray-300 transition-all text-gray-900 placeholder-gray-400 ${
                        readOnly 
                          ? "bg-gray-100 cursor-not-allowed font-medium text-indigo-700" 
                          : "bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </form>
  )
}
