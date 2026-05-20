import { auth } from "@/auth"
import { redirect } from "next/navigation"
import SettingsForm from "./SettingsForm"
import { prisma } from "@/lib/prisma"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/api/auth/signin")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) redirect("/api/auth/signin")

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
        <p className="text-gray-500 mt-2 text-xl">Update your profile information and security credentials.</p>
      </div>
      
      <div className="max-w-2xl">
        <div className="bg-white p-10 rounded-3xl shadow-xl shadow-blue-50 border border-gray-100">
          <SettingsForm user={user} />
        </div>
      </div>
    </div>
  )
}
