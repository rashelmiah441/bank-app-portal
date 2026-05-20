import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            App Portal
          </h1>
          <p className="text-gray-500 text-lg">
            Your centralized hub for custom web applications.
          </p>
        </div>

        <div className="space-y-4 pt-4">
          {session ? (
            <Link
              href="/apps/dashboard"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Enter Portal
            </Link>
          ) : (
            <Link
              href="/api/auth/signin"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Login to Get Started
            </Link>
          )}
          
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
              Powered by SQLite & Auth.js
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} App Portal. 100% Free & Self-Hosted.
      </footer>
    </div>
  );
}
