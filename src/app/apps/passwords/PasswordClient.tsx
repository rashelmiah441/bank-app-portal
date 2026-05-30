"use client";

import { useState, useRef } from "react";
import { createPassword, deletePassword, updatePassword } from "./actions";
import Link from "next/link";

interface SavedPassword {
  id: string;
  title: string;
  username: string | null;
  password: string;
  url: string | null;
  notes: string | null;
  updatedAt: Date;
}

export default function PasswordClient({ initialHistory }: { initialHistory: SavedPassword[] }) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [showUsernames, setShowUsernames] = useState<{ [key: string]: boolean }>({});
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const filteredData = initialHistory.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    (p.username?.toLowerCase().includes(search.toLowerCase())) ||
    (p.url?.toLowerCase().includes(search.toLowerCase()))
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      if (isEditing) {
        await updatePassword(isEditing, formData);
        setIsEditing(null);
      } else {
        await createPassword(formData);
      }
      formRef.current?.reset();
    } catch (err) {
      alert("Error saving data");
    } finally {
      setIsLoading(false);
    }
  }

  const handleEdit = (p: SavedPassword) => {
    setIsEditing(p.id);
    if (formRef.current) {
        const f = formRef.current;
        (f.elements.namedItem("title") as HTMLInputElement).value = p.title;
        (f.elements.namedItem("username") as HTMLInputElement).value = p.username || "";
        (f.elements.namedItem("password") as HTMLInputElement).value = p.password;
        (f.elements.namedItem("url") as HTMLInputElement).value = p.url || "";
        (f.elements.namedItem("notes") as HTMLTextAreaElement).value = p.notes || "";
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const togglePassword = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleUsername = (id: string) => {
    setShowUsernames(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
            <Link href="/apps/dashboard" className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-blue-600 transition-all shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Passwords</h1>
                <p className="text-gray-500 mt-1">Secure credential management.</p>
            </div>
        </div>
      </div>

      {/* Input Form */}
      <form 
        ref={formRef}
        onSubmit={handleSubmit} 
        className={`bg-white p-8 rounded-2xl shadow-sm border transition-all duration-300 ${isEditing ? 'border-rose-500 ring-4 ring-rose-50' : 'border-gray-100'} space-y-6`}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Account Title</label>
            <input type="text" name="title" placeholder="e.g. Gmail, Bank" required className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-500 transition-all text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Username</label>
            <input type="text" name="username" placeholder="Username/Email" className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-500 transition-all text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <input type="text" name="password" required placeholder="Password" className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-500 transition-all text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">URL / Notes</label>
            <input type="text" name="url" placeholder="https://... or extra notes" className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-500 transition-all text-sm" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {isEditing && (
            <button type="button" onClick={() => { setIsEditing(null); formRef.current?.reset(); }} className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all">Cancel</button>
          )}
          <button type="submit" disabled={isLoading} className="bg-rose-600 text-white px-12 py-3 rounded-xl font-bold hover:bg-rose-700 disabled:bg-gray-400 transition-all shadow-lg shadow-rose-100 active:scale-95">
            {isLoading ? "Saving..." : isEditing ? "Update Entry" : "Add to List"}
          </button>
        </div>
      </form>

      {/* List Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-gray-900">Stored Credentials</h2>
            <div className="relative flex-1 max-w-md">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                    type="text" 
                    placeholder="Search titles or usernames..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-rose-500 text-sm"
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <th className="px-6 py-4">Account Title</th>
                        <th className="px-6 py-4">Username / Email</th>
                        <th className="px-6 py-4">Password</th>
                        <th className="px-6 py-4">URL / Notes</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {filteredData.map((p) => (
                        <tr key={p.id} className="hover:bg-rose-50/20 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="text-sm font-bold text-gray-900">{p.title}</div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <code className="text-xs font-mono font-bold bg-gray-100 px-2 py-1 rounded text-gray-700 tracking-wider">
                                        {showUsernames[p.id] ? (p.username || "—") : "••••••••"}
                                    </code>
                                    <div className="flex items-center gap-1">
                                        {p.username && (
                                            <>
                                                <button 
                                                    onClick={() => toggleUsername(p.id)}
                                                    className="text-[9px] font-black text-gray-400 hover:text-gray-600 uppercase"
                                                >
                                                    {showUsernames[p.id] ? "Hide" : "View"}
                                                </button>
                                                <button 
                                                    onClick={() => copyToClipboard(p.username!, `${p.id}-u`)}
                                                    className={`text-[9px] font-black px-2 py-1 rounded-md transition-all ${copiedId === `${p.id}-u` ? 'bg-green-100 text-green-700' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                                                >
                                                    {copiedId === `${p.id}-u` ? "COPIED" : "COPY"}
                                                </button>
                                            </>
                                        )}
                                        {!p.username && <span className="text-gray-300">—</span>}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <code className="text-xs font-mono font-bold bg-gray-100 px-2 py-1 rounded text-gray-700 tracking-wider">
                                        {showPasswords[p.id] ? p.password : "••••••••"}
                                    </code>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => togglePassword(p.id)}
                                            className="text-[9px] font-black text-gray-400 hover:text-gray-600 uppercase"
                                        >
                                            {showPasswords[p.id] ? "Hide" : "View"}
                                        </button>
                                        <button 
                                            onClick={() => copyToClipboard(p.password, `${p.id}-p`)}
                                            className={`text-[9px] font-black px-2 py-1 rounded-md transition-all ${copiedId === `${p.id}-p` ? 'bg-green-100 text-green-700' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                                        >
                                            {copiedId === `${p.id}-p` ? "COPIED" : "COPY"}
                                        </button>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 max-w-xs">
                                <div className="text-xs text-gray-500 truncate" title={p.url || p.notes || ""}>
                                    {p.url ? (
                                        <a 
                                            href={p.url.startsWith('http') ? p.url : `https://${p.url}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-rose-600 hover:underline flex items-center gap-1"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                            {p.url}
                                        </a>
                                    ) : (
                                        p.notes || "—"
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => handleEdit(p)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button onClick={() => { if(confirm("Are you sure?")) deletePassword(p.id) }} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {filteredData.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No entries matching your search.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}
