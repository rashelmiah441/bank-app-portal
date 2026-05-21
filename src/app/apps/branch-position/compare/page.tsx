import { auth } from "@/auth"
import { redirect } from "next/navigation"
import ComparisonClient from "./ComparisonClient"
import Link from "next/link"

export default async function ComparePositionPage() {
  const session = await auth()
  if (!session) redirect("/api/auth/signin")

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Branch Position Comparison</h1>
        </div>
        <Link
          href="/apps/branch-position"
          className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-2 print:hidden"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Link>
      </div>

      <ComparisonClient />
    </div>
  )
}
