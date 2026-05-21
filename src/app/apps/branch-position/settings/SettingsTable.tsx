"use client"
import { useState } from "react"
import { saveSettings, fetchAmountByDescription } from "@/app/apps/branch-position/actions"

interface SettingItem {
  description: string;
  amount: string;
}

interface SettingsData {
  gl: SettingItem[];
  pl: SettingItem[];
}

export default function SettingsTable({ initialSettings }: { initialSettings: SettingsData }) {
  const [glSettings, setGlSettings] = useState<SettingItem[]>(
    initialSettings.gl?.length > 0 ? initialSettings.gl : [{ description: "", amount: "0.00" }]
  )
  const [plSettings, setPlSettings] = useState<SettingItem[]>(
    initialSettings.pl?.length > 0 ? initialSettings.pl : [{ description: "", amount: "0.00" }]
  )
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState("")

  const addRow = (type: "gl" | "pl") => {
    if (type === "gl") {
      setGlSettings([...glSettings, { description: "", amount: "0.00" }])
    } else {
      setPlSettings([...plSettings, { description: "", amount: "0.00" }])
    }
  }

  const removeRow = (type: "gl" | "pl", index: number) => {
    if (type === "gl") {
      const newSettings = glSettings.filter((_, i) => i !== index)
      setGlSettings(newSettings.length > 0 ? newSettings : [{ description: "", amount: "0.00" }])
    } else {
      const newSettings = plSettings.filter((_, i) => i !== index)
      setPlSettings(newSettings.length > 0 ? newSettings : [{ description: "", amount: "0.00" }])
    }
  }

  const updateRow = async (type: "gl" | "pl", index: number, value: string) => {
    if (type === "gl") {
      const newSettings = [...glSettings]
      newSettings[index].description = value
      setGlSettings(newSettings)

      if (value.length >= 3) {
        const amount = await fetchAmountByDescription(value, "GL")
        const updated = [...newSettings]
        updated[index].amount = amount || "0.00"
        setGlSettings(updated)
      } else if (value.length === 0) {
        const updated = [...newSettings]
        updated[index].amount = "0.00"
        setGlSettings(updated)
      }
    } else {
      const newSettings = [...plSettings]
      newSettings[index].description = value
      setPlSettings(newSettings)

      if (value.length >= 3) {
        const amount = await fetchAmountByDescription(value, "PL")
        const updated = [...newSettings]
        updated[index].amount = amount || "0.00"
        setPlSettings(updated)
      } else if (value.length === 0) {
        const updated = [...newSettings]
        updated[index].amount = "0.00"
        setPlSettings(updated)
      }
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setMessage("")
    try {
      await saveSettings({ gl: glSettings, pl: plSettings })
      setMessage("Settings saved successfully!")
    } catch (error) {
      setMessage("Failed to save settings.")
    } finally {
      setIsSaving(false)
    }
  }

  const formatBalance = (val: any) => {
    if (typeof val !== 'string') return "0.00"
    const num = parseFloat(val.replace(/,/g, ''))
    if (isNaN(num)) return "0.00"
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GL Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">GL Settings</h2>
            <button
              onClick={() => addRow("gl")}
              className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
            >
              + Add GL
            </button>
          </div>
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GL Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {glSettings.map((row, index) => (
                  <tr key={`gl-${index}`}>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => updateRow("gl", index, e.target.value)}
                        className="block w-full sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="GL Description"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-mono font-bold">{formatBalance(row.amount)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removeRow("gl", index)} className="text-red-600 hover:text-red-900 text-xs">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* PL Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">PL Settings</h2>
            <button
              onClick={() => addRow("pl")}
              className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
            >
              + Add PL
            </button>
          </div>
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PL Description</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plSettings.map((row, index) => (
                  <tr key={`pl-${index}`}>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => updateRow("pl", index, e.target.value)}
                        className="block w-full sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
                        placeholder="PL Description"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-mono font-bold">{formatBalance(row.amount)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => removeRow("pl", index)} className="text-red-600 hover:text-red-900 text-xs">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center gap-4">
        {message && (
          <span className={`text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  )
}
