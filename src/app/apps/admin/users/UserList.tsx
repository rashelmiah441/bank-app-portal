"use client"

import { deleteUser, updateUser } from "@/lib/actions/users"
import { useState } from "react"

interface User {
  id: string
  name: string | null
  email: string | null
  role: string
}

export default function UserList({ users, currentUserId }: { users: User[], currentUserId: string | undefined }) {
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleDelete = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const result = await deleteUser(userId)
      if (result.error) {
        alert(result.error)
      }
    }
  }

  const handleUpdate = async (userId: string, formData: FormData) => {
    const result = await updateUser(userId, formData)
    if (result.success) {
      setEditingId(null)
    } else if (result.error) {
      alert(result.error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{user.name || "N/A"}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {editingId === user.id ? (
                  <form id={`edit-form-${user.id}`} action={(fd) => handleUpdate(user.id, fd)}>
                    <select
                      name="role"
                      defaultValue={user.role}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </form>
                ) : (
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}>
                    {user.role}
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                {editingId === user.id ? (
                  <div className="flex items-center justify-end space-x-2">
                    <input
                      type="password"
                      name="password"
                      placeholder="New password"
                      form={`edit-form-${user.id}`}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-40 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    />
                    <button
                      type="submit"
                      form={`edit-form-${user.id}`}
                      className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => setEditingId(user.id)}
                      className="text-blue-600 hover:text-blue-900 font-semibold"
                    >
                      Edit
                    </button>
                    {user.id !== currentUserId && (
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900 font-semibold"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
