import Link from "next/link"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function BranchPositionPage() {
  const session = await auth()
  if (!session) redirect("/api/auth/signin")

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Branch Position</h1>
        <p className="text-gray-500">Monitor and compare your branch's financial position.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Link
          href="/apps/branch-position/latest"
          className="group p-8 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-cyan-500 transition-all flex flex-col items-center text-center"
        >
          <div className="p-4 bg-cyan-50 rounded-xl group-hover:bg-cyan-100 transition-colors mb-6">
            <svg className="w-10 h-10 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Latest Branch Position</h3>
          <p className="mt-2 text-gray-500">View the most recent financial status based on your GL/PL settings.</p>
        </Link>

        <Link
          href="/apps/branch-position/compare"
          className="group p-8 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-cyan-500 transition-all flex flex-col items-center text-center"
        >
          <div className="p-4 bg-cyan-50 rounded-xl group-hover:bg-cyan-100 transition-colors mb-6">
            <svg className="w-10 h-10 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Compare Branch Position</h3>
          <p className="mt-2 text-gray-500">Compare financial data between two different dates to see trends.</p>
        </Link>

        <Link
          href="/apps/branch-position/settings"
          className="group p-8 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-cyan-500 transition-all flex flex-col items-center text-center"
        >
          <div className="p-4 bg-cyan-50 rounded-xl group-hover:bg-cyan-100 transition-colors mb-6">
            <svg className="w-10 h-10 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.543-.426-1.543-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Settings for Branch Position</h3>
          <p className="mt-2 text-gray-500">Configure which GL and PL codes are used for calculation.</p>
        </Link>
      </div>
    </div>
  )
}
