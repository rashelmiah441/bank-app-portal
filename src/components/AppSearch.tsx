"use client"
import { useState } from "react";
import Link from "next/link";

interface AppLink {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  adminOnly?: boolean;
}

export default function AppSearch({ 
  isAdmin, 
  userName 
}: { 
  isAdmin: boolean;
  userName: string;
}) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const apps: AppLink[] = [
    {
      title: "ABS (DPS) Calculator",
      description: "Calculate Deposit Pension Scheme (DPS) maturity and interest returns.",
      href: "/apps/abs-calculator",
      color: "amber",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Branch Information",
      description: "Manage branch details, upload Excel data, and search branches.",
      href: "/apps/admin/branches",
      color: "purple",
      adminOnly: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      title: "Branch Logo Generator",
      description: "Generate A4 size branch logos with Agrani PLC branding and branch info.",
      href: "/apps/branch-logo-generator",
      color: "red",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Branch Position",
      description: "View latest position, compare dates, and configure GL/PL settings.",
      href: "/apps/branch-position",
      color: "cyan",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: "Excise Duty",
      description: "Manage and save your excise duty ranges and applicable fees.",
      href: "/apps/excise-duty",
      color: "emerald",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.407 2.67 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.407-2.67-1M12 16v1m4-12H8a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2z" />
        </svg>
      )
    },
    {
      title: "FDR Calculator",
      description: "Calculate maturity amount and interest earned on your fixed deposits.",
      href: "/apps/fdr-calculator",
      color: "pink",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "GL-PL Upload",
      description: "Upload and manage GL and PL text files by date and branch.",
      href: "/apps/gl-pl",
      color: "orange",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: "Letters App",
      description: "Create, search, and manage your letters with a dedicated storage.",
      href: "/apps/letters",
      color: "amber",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      title: "Notes App",
      description: "Create and manage your notes with real-time autosave and PDF export.",
      href: "/apps/notes",
      color: "blue",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    },
    {
      title: "Settings",
      description: "Manage your profile, email, and password.",
      href: "/apps/settings",
      color: "indigo",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      title: "Task Manager",
      description: "Stay organized with structured task lists and detailed descriptions.",
      href: "/apps/tasks",
      color: "green",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      )
    },
    {
      title: "User Management",
      description: "Add, remove, or modify user accounts and roles.",
      href: "/apps/admin/users",
      color: "purple",
      adminOnly: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    }
  ];

  const filteredApps = apps.filter(app => {
    if (app.adminOnly && !isAdmin) return false;
    const searchLower = search.toLowerCase();
    return (
      app.title.toLowerCase().includes(searchLower) ||
      app.description.toLowerCase().includes(searchLower)
    );
  });

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: string } = {
      amber: "text-amber-600 bg-amber-50 group-hover:bg-amber-100 group-hover:border-amber-500",
      purple: "text-purple-600 bg-purple-50 group-hover:bg-purple-100 group-hover:border-purple-500",
      red: "text-red-600 bg-red-50 group-hover:bg-red-100 group-hover:border-red-500",
      cyan: "text-cyan-600 bg-cyan-50 group-hover:bg-cyan-100 group-hover:border-cyan-500",
      emerald: "text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100 group-hover:border-emerald-500",
      pink: "text-pink-600 bg-pink-50 group-hover:bg-pink-100 group-hover:border-pink-500",
      orange: "text-orange-600 bg-orange-50 group-hover:bg-orange-100 group-hover:border-orange-500",
      blue: "text-blue-600 bg-blue-50 group-hover:bg-blue-100 group-hover:border-blue-500",
      indigo: "text-indigo-600 bg-indigo-50 group-hover:bg-indigo-100 group-hover:border-indigo-500",
      green: "text-green-600 bg-green-50 group-hover:bg-green-100 group-hover:border-green-500",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Search & View Toggle Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center max-w-4xl mx-auto">
        <div className="relative group flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search for an application..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-transparent rounded-2xl shadow-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-lg placeholder-gray-400"
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl shadow-xl border border-gray-100 shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"}`}
            title="Grid View"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:bg-gray-50"}`}
            title="List View"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Rendering */}
      {filteredApps.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => (
              <Link
                key={app.href}
                href={app.href}
                className="group relative p-6 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Hover Decoration */}
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`}>
                  {app.icon}
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl transition-all duration-300 border border-transparent ${getColorClasses(app.color)}`}>
                    {app.icon}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all text-blue-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{app.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed line-clamp-2">
                  {app.description}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-w-5xl mx-auto">
            {filteredApps.map((app) => (
              <Link
                key={app.href}
                href={app.href}
                className="group flex items-center gap-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all duration-300"
              >
                <div className={`p-3 rounded-xl shrink-0 transition-all duration-300 border border-transparent ${getColorClasses(app.color)}`}>
                  {app.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                    {app.title}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {app.description}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all text-blue-500 shrink-0 pr-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">No applications found</h3>
          <p className="text-gray-500 mt-2">Try a different search term or browse the full list.</p>
          <button 
            onClick={() => setSearch("")}
            className="mt-6 text-blue-600 font-semibold hover:underline"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}
