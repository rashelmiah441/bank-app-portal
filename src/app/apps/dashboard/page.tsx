import { auth } from "@/auth";
import WorldClock from "@/components/WorldClock";
import AppSearch from "@/components/AppSearch";

export default async function Dashboard() {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-gray-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-6">
          <div className="max-w-4xl mx-auto animate-in zoom-in duration-700">
            <WorldClock />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{session?.user?.name}</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Your personal command center. Search and launch your productivity tools below.
          </p>
        </div>

        {/* Dynamic Search & Grid Section */}
        <AppSearch isAdmin={isAdmin} userName={session?.user?.name || "User"} />
      </div>
    </div>
  );
}
