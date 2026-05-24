import Link from "next/link";
import { auth } from "@/auth";
import WorldClock from "@/components/WorldClock";

export default async function Dashboard() {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {session?.user?.name}</h2>
        <p className="text-gray-500">Select an application to get started.</p>
      </div>

      <WorldClock />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/apps/notes"
          className="group p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-500 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Notes App</h3>
          <p className="mt-2 text-sm text-gray-500">Create and manage your notes with real-time autosave and PDF export.</p>
        </Link>

        <Link
          href="/apps/tasks"
          className="group p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-green-500 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Task Manager</h3>
          <p className="mt-2 text-sm text-gray-500">Stay organized with structured task lists and detailed descriptions.</p>
        </Link>

        <Link
          href="/apps/gl-pl"
          className="group p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-orange-500 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">GL-PL Upload</h3>
          <p className="mt-2 text-sm text-gray-500">Upload and manage GL and PL text files by date and branch.</p>
        </Link>

        <Link
          href="/apps/branch-position"
          className="group p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-cyan-500 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-cyan-50 rounded-lg group-hover:bg-cyan-100 transition-colors">
              <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Branch Position</h3>
          <p className="mt-2 text-sm text-gray-500">View latest position, compare dates, and configure GL/PL settings.</p>
        </Link>

        <Link
          href="/apps/fdr-calculator"
          className="group p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-pink-500 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-pink-50 rounded-lg group-hover:bg-pink-100 transition-colors">
              <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">FDR Calculator</h3>
          <p className="mt-2 text-sm text-gray-500">Calculate maturity amount and interest earned on your fixed deposits.</p>
        </Link>

        <Link
          href="/apps/excise-duty"
          className="group p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-emerald-500 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.67 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.407-2.67-1M12 16v1m4-12H8a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Excise Duty</h3>
          <p className="mt-2 text-sm text-gray-500">Manage and save your excise duty ranges and applicable fees.</p>
        </Link>

        <Link
          href="/apps/abs-calculator"
          className="group p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-yellow-500 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-50 rounded-lg group-hover:bg-yellow-100 transition-colors">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">ABS (DPS) Calculator</h3>
          <p className="mt-2 text-sm text-gray-500">Calculate Deposit Pension Scheme (DPS) maturity and interest returns.</p>
        </Link>

        <Link
          href="/apps/branch-logo-generator"
          className="group p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-red-500 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Branch Logo Generator</h3>
          <p className="mt-2 text-sm text-gray-500">Generate A4 size branch logos with Agrani PLC branding and branch info.</p>
        </Link>

        <Link
          href="/apps/letters"
          className="group p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-amber-500 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Letters App</h3>
          <p className="mt-2 text-sm text-gray-500">Create, search, and manage your letters with a dedicated storage.</p>
        </Link>

        <Link
          href="/apps/settings"
          className="group p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-500 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
          <p className="mt-2 text-sm text-gray-500">Manage your profile, email, and password.</p>
        </Link>

        {isAdmin && (
          <>
            <Link
              href="/apps/admin/users"
              className="group p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-500 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
              <p className="mt-2 text-sm text-gray-500">Add, remove, or modify user accounts and roles.</p>
            </Link>

            <Link
              href="/apps/admin/branches"
              className="group p-6 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-purple-500 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition-colors">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Branch Information</h3>
              <p className="mt-2 text-sm text-gray-500">Manage branch details, upload Excel data, and search branches.</p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
