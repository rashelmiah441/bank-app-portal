import { auth } from "@/auth"
import { getAllUsers } from "@/lib/actions/users"
import { redirect } from "next/navigation"
import UserList from "./UserList"
import AddUserForm from "./AddUserForm"

export default async function AdminUsersPage() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    redirect("/apps/dashboard")
  }

  const users = await getAllUsers()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">User Management</h1>
        <p className="text-gray-500 mt-2 text-xl">Manage system access, roles, and security for all users.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">System Users</h2>
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-bold border border-blue-100">
              {users.length} Total
            </span>
          </div>
          <UserList users={users} currentUserId={session?.user?.id} />
        </div>
        
        <div className="lg:col-span-4 sticky top-24">
          <AddUserForm />
        </div>
      </div>
    </div>
  )
}
