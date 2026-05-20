"use client"

import { updateCurrentUser } from "@/lib/actions/users"
import { useState } from "react"

export default function SettingsForm({ user }: { user: any }) {
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setStatus(null)
    const result = await updateCurrentUser(formData)
    if (result.success) {
      setStatus({ type: "success", message: "Profile updated successfully" })
    } else if (result.error) {
      setStatus({ type: "error", message: result.error })
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {status && (
        <div className={`p-4 rounded-xl text-sm font-medium ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
          {status.message}
        </div>
      )}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-gray-700 ml-1">Email Address</label>
        <input
          type="email"
          name="email"
          defaultValue={user.email || ""}
          className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900"
          placeholder="your@email.com"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700 ml-1">Branch Name</label>
          <input
            type="text"
            name="branchName"
            defaultValue={user.branchName || ""}
            className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900"
            placeholder="e.g. Motijheel"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700 ml-1">Branch Code</label>
          <input
            type="text"
            name="branchCode"
            defaultValue={user.branchCode || ""}
            className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900"
            placeholder="e.g. 0101"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700 ml-1">District Name</label>
          <input
            type="text"
            name="districtName"
            defaultValue={user.districtName || ""}
            className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900"
            placeholder="e.g. Dhaka"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700 ml-1">Zone Name</label>
          <input
            type="text"
            name="zoneName"
            defaultValue={user.zoneName || ""}
            className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900"
            placeholder="e.g. Dhaka North"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-semibold text-gray-700 ml-1">New Password</label>
        <input
          type="password"
          name="password"
          placeholder="••••••••"
          className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900"
        />
        <p className="text-xs text-gray-400 mt-1 ml-1 italic">Leave blank to keep your current password</p>
      </div>
      <button
        type="submit"
        className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
      >
        Save Profile Changes
      </button>
    </form>
  )
}
