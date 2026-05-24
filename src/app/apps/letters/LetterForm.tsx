"use client"
import { createLetter, updateLetter, deleteLetter } from "./actions"
import Link from "next/link"
import { useState, useRef } from "react"
import { useReactToPrint } from "react-to-print"

type Letter = {
  id: string
  title: string
  content: string
  letterNo: string | null
  recipient: string | null
  language: string
  date: Date
}

type SavedRecipient = {
  id: string
  name: string
  address: string
}

export default function LetterForm({ 
  letter, 
  logo,
  savedRecipients = [] 
}: { 
  letter?: Letter, 
  logo: string | null,
  savedRecipients?: SavedRecipient[]
}) {
  const isEditing = !!letter
  const [isDeleting, setIsDeleting] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  // Form State for Live Print Preview
  const [title, setTitle] = useState(letter?.title || "")
  const [date, setDate] = useState(letter?.date ? new Date(letter.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
  const [letterNo, setLetterNo] = useState(letter?.letterNo || "")
  const [recipient, setRecipient] = useState(letter?.recipient || "")
  const [content, setContent] = useState(letter?.content || "")
  const [language, setLanguage] = useState(letter?.language || "EN")

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: title || "Letter",
  })

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this letter?")) {
      setIsDeleting(true)
      await deleteLetter(letter!.id)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex justify-between items-center">
          <Link href="/apps/letters" className="text-blue-600 hover:underline flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Letters
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? "Edit Letter" : "Create New Letter"}
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handlePrint()}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Letter
            </button>
            {isEditing && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            )}
          </div>
        </div>

        <form action={isEditing ? updateLetter.bind(null, letter.id) : createLetter} className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
            <div className="flex flex-wrap items-center gap-6 pb-4 border-b border-gray-100">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Letter Language</label>
                <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
                  <button
                    type="button"
                    onClick={() => setLanguage("EN")}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      language === "EN" 
                        ? "bg-white text-blue-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("BN")}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                      language === "BN" 
                        ? "bg-white text-blue-600 shadow-sm" 
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Bangla
                  </button>
                </div>
                <input type="hidden" name="language" value={language} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Subject / Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Prayer for 3 days leave"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Letter Date</label>
                <input
                  name="date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Letter Number</label>
                <input
                  name="letterNo"
                  type="text"
                  value={letterNo}
                  onChange={(e) => setLetterNo(e.target.value)}
                  placeholder="e.g. ANBL/HO/2024/123"
                  className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700">Recipient Address</label>
                {savedRecipients.length > 0 && (
                  <select 
                    onChange={(e) => {
                      if (e.target.value) {
                        setRecipient(e.target.value)
                      }
                    }}
                    className="text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 text-gray-600 cursor-pointer"
                  >
                    <option value="">Select Saved Recipient...</option>
                    {savedRecipients.map((r) => (
                      <option key={r.id} value={r.address}>{r.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <textarea
                name="recipient"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="DGM&#10;Agrani Bank PLC&#10;Zonal Office, Narsingdi"
                rows={4}
                className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Letter Content</label>
              <textarea
                name="content"
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the body of your letter here..."
                rows={12}
                className="w-full p-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm font-mono text-sm leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Link
                href="/apps/letters"
                className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
              >
                {isEditing ? "Save Changes" : "Create Letter"}
              </button>
            </div>
          </div>
        </form>

        {/* Print Layout */}
        <div className="hidden">
          <div 
            ref={printRef} 
            className={`pt-[0.5in] pb-16 text-gray-900 bg-white min-h-[297mm] ${
              language === "EN" ? "font-serif" : "font-sans"
            }`}
            style={language === "BN" ? { fontFamily: "'Kalpurush', 'Siyam Rupali', 'SolaimanLipi', sans-serif" } : {}}
          >
            {/* 1. Header with Logo (Edge-to-Edge + Scaled) */}
            {logo && (
              <div className="w-full mb-10 overflow-visible flex justify-center">
                <img src={logo} alt="Logo" className="w-full h-auto block scale-110 origin-center" />
              </div>
            )}

            <div className="px-16">
              {/* 2. Letter No and Date Row */}
              <div className="flex justify-between items-start mb-8 text-[12pt]">
                <div>
                  {letterNo && (
                    <p><span className="font-bold">{language === "BN" ? "পত্র নং" : "No"}:</span> <span className="font-semibold">{letterNo}</span></p>
                  )}
                </div>
                <div className="text-right">
                  <p><span className="font-bold">{language === "BN" ? "তারিখ" : "Date"}:</span> <span className="font-semibold">
                    {(() => {
                      const d = new Date(date);
                      const day = String(d.getDate()).padStart(2, '0');
                      const month = String(d.getMonth() + 1).padStart(2, '0');
                      const year = d.getFullYear();
                      const formatted = `${day}/${month}/${year}`;
                      
                      if (language === "BN") {
                        // Convert to Bangla digits
                        const banglaDigits: { [key: string]: string } = {
                          '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
                          '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
                        };
                        return formatted.split('').map(char => banglaDigits[char] || char).join('');
                      }
                      return formatted;
                    })()}
                  </span></p>
                </div>
              </div>

              {/* 3. Recipient Address */}
              <div className="mb-10 text-[12pt] leading-relaxed whitespace-pre-wrap">
                {recipient}
              </div>

              {/* Subject */}
              <div className="mb-8 text-[12pt]">
                <p className="font-bold underline decoration-1 underline-offset-4">
                  {language === "BN" ? "বিষয়" : "Subject"}: {title}
                </p>
              </div>

              {/* Body */}
              <div className="text-[12pt] leading-relaxed whitespace-pre-wrap">
                {content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
