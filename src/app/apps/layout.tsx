import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function AppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white shadow-sm border-b sticky top-0 z-10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <Link href="/apps/dashboard" className="text-xl font-bold text-gray-900">
                App Portal
              </Link>
              <div className="hidden md:flex items-center gap-4">
                <Link href="/apps/dashboard" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Dashboard</Link>
                <Link href="/apps/settings" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Settings</Link>
                {(session?.user as any)?.role === "ADMIN" && (
                  <Link href="/apps/admin/users" className="text-gray-600 hover:text-gray-900 text-sm font-medium">User Management</Link>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end mr-2">
                <span className="text-sm font-medium text-gray-900">{session?.user?.name}</span>
                <span className="text-xs text-gray-500 capitalize">{(session?.user as any)?.role}</span>
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition-colors">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
