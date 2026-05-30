"use client"

import { updateCurrentUser } from "@/lib/actions/users"
import { useState } from "react"

export default function SettingsForm({ user }: { user: any }) {
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)

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
          <label className="block text-sm font-semibold text-gray-700 ml-1">Branch Name (English)</label>
          <input
            type="text"
            name="branchName"
            defaultValue={user.branchName || ""}
            className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900"
            placeholder="e.g. Motijheel"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-gray-700 ml-1 font-bangla">ব্রাঞ্চের নাম (বাংলা)</label>
          <input
            type="text"
            name="branchNameBangla"
            defaultValue={user.branchNameBangla || ""}
            className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900"
            placeholder="উদা: মতিঝিল"
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
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-gray-900 pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
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
