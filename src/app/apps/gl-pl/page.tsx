import { auth } from "@/auth"
import { redirect } from "next/navigation"
import GLPLUploadForm from "./GLPLUploadForm"
import UploadList from "./UploadList"
import { getUploads } from "./actions"

export default async function GLPLPage() {
  const session = await auth()
  if (!session) redirect("/api/auth/signin")

  const uploads = await getUploads()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">GL-PL Management</h1>
        <p className="text-gray-500">Upload and view your GL and PL text files.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <GLPLUploadForm />
        </div>
        <div className="lg:col-span-2">
          <UploadList uploads={uploads} />
        </div>
      </div>
    </div>
  )
}
