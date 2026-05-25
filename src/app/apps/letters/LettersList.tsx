"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { saveUserLogo, createSavedRecipient, deleteSavedRecipient, updateSavedRecipient, createSavedCC, deleteSavedCC, updateSavedCC } from "./actions"

type Letter = {
  id: string
  title: string
  subject: string | null
  cc: string | null
  content: string
  date: Date
  createdAt: Date
}

type SavedRecipient = {
  id: string
  name: string
  address: string
}

type SavedCC = {
  id: string
  name: string
  address: string
}

export default function LettersList({ 
  initialLetters, 
  initialLogo,
  initialRecipients,
  initialCCs
}: { 
  initialLetters: Letter[], 
  initialLogo: string | null,
  initialRecipients: SavedRecipient[],
  initialCCs: SavedCC[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get("q") || "")
  const [logo, setLogo] = useState(initialLogo)
  const [recipients, setRecipients] = useState(initialRecipients)
  const [ccs, setCCs] = useState(initialCCs)
  const [isUploading, setIsUploading] = useState(false)
  const [isAddingRecipient, setIsAddingRecipient] = useState(false)
  const [isAddingCC, setIsAddingCC] = useState(false)
  const [editingRecipientId, setEditingRecipientId] = useState<string | null>(null)
  const [editingCCId, setEditingCCId] = useState<string | null>(null)

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("q", value)
    } else {
      params.delete("q")
    }
    router.push(`?${params.toString()}`)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64String = reader.result as string
      await saveUserLogo(base64String)
      setLogo(base64String)
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = async () => {
    if (confirm("Are you sure you want to remove the logo?")) {
      await saveUserLogo(null)
      setLogo(null)
    }
  }

  const handleAddRecipient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsAddingRecipient(true)
    const formData = new FormData(e.currentTarget)
    await createSavedRecipient(formData)
    window.location.reload()
  }

  const handleUpdateRecipient = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await updateSavedRecipient(id, formData)
    setEditingRecipientId(null)
    window.location.reload()
  }

  const handleDeleteRecipient = async (id: string) => {
    if (confirm("Delete this saved recipient?")) {
      await deleteSavedRecipient(id)
      setRecipients(recipients.filter(r => r.id !== id))
    }
  }

  const handleAddCC = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsAddingCC(true)
    const formData = new FormData(e.currentTarget)
    await createSavedCC(formData)
    window.location.reload()
  }

  const handleUpdateCC = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    await updateSavedCC(id, formData)
    setEditingCCId(null)
    window.location.reload()
  }

  const handleDeleteCC = async (id: string) => {
    if (confirm("Delete this saved CC?")) {
      await deleteSavedCC(id)
      setCCs(ccs.filter(c => c.id !== id))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header & Create Button */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/apps/dashboard" className="text-blue-600 hover:underline flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Letters App</h1>
          </div>
          <Link
            href="/apps/letters/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Letter
          </Link>
        </div>

        {/* Logo Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Letterhead Logo Settings
          </h2>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden relative group">
              {logo ? (
                <>
                  <img src={logo} alt="User Logo" className="max-w-full max-h-full object-contain" />
                  <button 
                    onClick={handleRemoveLogo}
                    className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <span className="text-gray-400 text-xs text-center px-2">No Logo Uploaded</span>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm text-gray-500">
                Upload your organization logo to appear at the top of every printed letter.
              </p>
              <div className="flex items-center gap-3">
                <label className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors shadow-sm">
                  {isUploading ? "Uploading..." : logo ? "Change Logo" : "Upload Logo"}
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} disabled={isUploading} />
                </label>
                {logo && (
                  <button onClick={handleRemoveLogo} className="text-red-600 hover:text-red-700 text-sm font-medium">
                    Delete Current Logo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Saved Recipients Management */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Saved Recipients
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Add New Recipient */}
            <form onSubmit={handleAddRecipient} className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Add New Recipient</h3>
              <div className="space-y-3">
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Label (e.g. DGM Narsingdi)"
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <textarea
                  name="address"
                  required
                  placeholder="Full Address..."
                  rows={3}
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={isAddingRecipient}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold transition-colors disabled:bg-blue-300"
                >
                  {isAddingRecipient ? "Saving..." : "Save Recipient"}
                </button>
              </div>
            </form>

            {/* List of Recipients */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Existing Recipients</h3>
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 border border-gray-50 p-2 rounded-lg">
                {recipients.length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-4">No saved recipients yet.</p>
                ) : (
                  recipients.map((r) => (
                    <div key={r.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                      {editingRecipientId === r.id ? (
                        <form onSubmit={(e) => handleUpdateRecipient(e, r.id)} className="space-y-3">
                          <input
                            name="name"
                            type="text"
                            required
                            defaultValue={r.name}
                            className="w-full p-1.5 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <textarea
                            name="address"
                            required
                            defaultValue={r.address}
                            rows={3}
                            className="w-full p-1.5 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-[10px] font-bold hover:bg-green-700"
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingRecipientId(null)}
                              className="flex-1 bg-gray-200 text-gray-700 py-1 px-2 rounded text-[10px] font-bold hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{r.name}</span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => setEditingRecipientId(r.id)}
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRecipient(r.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Saved CCs Management */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            Saved CC Addresses
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Add New CC */}
            <form onSubmit={handleAddCC} className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Add New CC</h3>
              <div className="space-y-3">
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Label (e.g. GM HR)"
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <textarea
                  name="address"
                  required
                  placeholder="Full CC Address..."
                  rows={3}
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={isAddingCC}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-bold transition-colors disabled:bg-purple-300"
                >
                  {isAddingCC ? "Saving..." : "Save CC Address"}
                </button>
              </div>
            </form>

            {/* List of CCs */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Existing CC Addresses</h3>
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 border border-gray-50 p-2 rounded-lg">
                {ccs.length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-4">No saved CCs yet.</p>
                ) : (
                  ccs.map((c) => (
                    <div key={c.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                      {editingCCId === c.id ? (
                        <form onSubmit={(e) => handleUpdateCC(e, c.id)} className="space-y-3">
                          <input
                            name="name"
                            type="text"
                            required
                            defaultValue={c.name}
                            className="w-full p-1.5 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-purple-500 outline-none"
                          />
                          <textarea
                            name="address"
                            required
                            defaultValue={c.address}
                            rows={3}
                            className="w-full p-1.5 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-purple-500 outline-none"
                          />
                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="flex-1 bg-green-600 text-white py-1 px-2 rounded text-[10px] font-bold hover:bg-green-700"
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCCId(null)}
                              className="flex-1 bg-gray-200 text-gray-700 py-1 px-2 rounded text-[10px] font-bold hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">{c.name}</span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => setEditingCCId(c.id)}
                              className="text-gray-400 hover:text-purple-600 transition-colors"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCC(c.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search letters by title or content..."
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Letters Grid */}
        <div className="grid gap-4">
          {initialLetters.map((letter) => (
            <Link
              key={letter.id}
              href={`/apps/letters/${letter.id}`}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 transition-all flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-bold text-gray-900">{letter.title}</h3>
                {letter.subject && (
                  <p className="text-xs text-gray-500 line-clamp-1 italic mb-1">{letter.subject}</p>
                )}
                <p className="text-sm text-gray-400">
                  {new Date(letter.date).toLocaleDateString("en-US", { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
          
          {initialLetters.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400">No letters found. Create your first letter!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
