"use client"

import { createUser } from "@/lib/actions/users"
import { useRef, useState } from "react"

export default function AddUserForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setStatus(null)
    const result = await createUser(formData)
    if (result.success) {
      setStatus({ type: "success", message: "User created successfully" })
      formRef.current?.reset()
    } else if (result.error) {
      setStatus({ type: "error", message: result.error })
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm space-y-5 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-2">Create Account</h3>
      {status && (
        <div className={`p-4 rounded-xl text-sm font-medium ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
          {status.message}
        </div>
      )}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-gray-700 ml-1">Full Name</label>
        <input
          type="text"
          name="name"
          required
          placeholder="John Doe"
          className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-gray-900"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-gray-700 ml-1">Email Address</label>
        <input
          type="email"
          name="email"
          required
          placeholder="john@example.com"
          className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-gray-900"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-gray-700 ml-1">Initial Password</label>
        <input
          type="password"
          name="password"
          required
          placeholder="••••••••"
          className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-gray-900"
        />
      </div>
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-gray-700 ml-1">System Role</label>
        <select
          name="role"
          defaultValue="USER"
          className="block w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 transition-all focus:bg-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-gray-900 appearance-none"
        >
          <option value="USER">Standard User</option>
          <option value="ADMIN">System Administrator</option>
        </select>
      </div>
      <button
        type="submit"
        className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
      >
        Register User
      </button>
    </form>
  )
}
