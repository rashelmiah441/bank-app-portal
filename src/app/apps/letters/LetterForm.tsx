"use client"
import { createLetter, updateLetter, deleteLetter } from "./actions"
import Link from "next/link"
import { useState, useRef, useLayoutEffect } from "react"
import { useReactToPrint } from "react-to-print"
import { useRouter } from "next/navigation"

type Letter = {
  id: string
  title: string
  subject: string | null
  cc: string | null
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

type SavedCC = {
  id: string
  name: string
  address: string
}

export default function LetterForm({ 
  letter, 
  logo,
  savedRecipients = [],
  savedCCs = [] 
}: { 
  letter?: Letter, 
  logo: string | null,
  savedRecipients?: SavedRecipient[],
  savedCCs?: SavedCC[]
}) {
  const router = useRouter()
  const isEditing = !!letter
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  // Form State for Live Print Preview
  const [title, setTitle] = useState(letter?.title || "")
  const [subject, setSubject] = useState(letter?.subject || "")
  const [cc, setCC] = useState(letter?.cc || "")
  const [showCC, setShowCC] = useState(!!letter?.cc)
  const [date, setDate] = useState(letter?.date ? new Date(letter.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
  const [letterNo, setLetterNo] = useState(letter?.letterNo || "")
  const [recipient, setRecipient] = useState(letter?.recipient || "")
  const [content, setContent] = useState(letter?.content || "")
  const [language, setLanguage] = useState(letter?.language || "EN")
  const [fontSize, setFontSize] = useState(12)

  // Smart Shrink Logic: Only reduce font size if content overflows A4 height
  useLayoutEffect(() => {
    const element = printRef.current
    if (!element) return

    // Reset to base size first to re-calculate accurately
    if (fontSize < 12) {
      const hasOverflow = element.scrollHeight > element.offsetHeight
      if (!hasOverflow) {
        // We might be able to grow back, but for stability, we only reset when content shortens significantly
        // For simplicity, we just trigger a reset whenever content changes (handled by deps)
      }
    }

    const checkOverflow = () => {
      // Check if the scroll height is greater than the fixed A4 height (297mm)
      // Allow shrinking down to 4pt (nearly unlimited for practical purposes)
      if (element.scrollHeight > element.offsetHeight && fontSize > 4) {
        setFontSize((prev) => prev - 0.2)
      }
    }

    // Small delay to allow browser to render font changes
    const timeout = setTimeout(checkOverflow, 10)
    return () => clearTimeout(timeout)
  }, [content, subject, recipient, letterNo, fontSize, cc, showCC])

  // Reset font size when content is drastically changed to try 12pt again
  useLayoutEffect(() => {
    setFontSize(12)
  }, [content.length, subject.length, recipient.length, cc.length, showCC])

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: title || "Letter",
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    setIsSaving(true)
    setShowSaved(false)
    
    try {
      if (isEditing) {
        await updateLetter(letter.id, formData)
      } else {
        const newLetter = await createLetter(formData)
        router.replace(`/apps/letters/${newLetter.id}`)
      }
      
      setShowSaved(true)
      setTimeout(() => setShowSaved(false), 3000)
    } catch (error) {
      console.error("Save error:", error)
      alert("Failed to save letter")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this letter?")) {
      setIsDeleting(true)
      await deleteLetter(letter!.id)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 relative">
      {/* Save Notification */}
      {showSaved && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[9999]">
          <div className="bg-green-600 text-white px-8 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold text-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Letter Saved Successfully!
          </div>
        </div>
      )}

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

        <form onSubmit={handleSubmit} className="space-y-6">
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
                <label className="text-sm font-semibold text-gray-700">Private Title (only visible in dashboard)</label>
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Printable Subject (will be underlined in print)</label>
              <textarea
                name="subject"
                rows={2}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="The formal subject line for the letter..."
                className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm resize-none"
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

            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="toggle-cc"
                  checked={showCC}
                  onChange={(e) => setShowCC(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="toggle-cc" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Include Carbon Copy (CC)?
                </label>
              </div>
              
              {showCC && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-gray-700">CC Addresses (one per line)</label>
                    {savedCCs.length > 0 && (
                      <select 
                        onChange={(e) => {
                          if (e.target.value) {
                            setCC(prev => prev ? `${prev}\n${e.target.value}` : e.target.value)
                          }
                        }}
                        className="text-xs border border-gray-200 rounded px-2 py-1 outline-none focus:ring-1 focus:ring-blue-500 bg-gray-50 text-gray-600 cursor-pointer"
                      >
                        <option value="">Select Saved CC...</option>
                        {savedCCs.map((c) => (
                          <option key={c.id} value={c.address}>{c.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <textarea
                    name="cc"
                    rows={3}
                    value={cc}
                    onChange={(e) => setCC(e.target.value)}
                    placeholder={"১. মহাব্যবস্থাপক...\n২. উপ-মহাব্যবস্থাপক..."}
                    className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              )}
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
                disabled={isSaving}
                className={`px-8 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 ${
                  isSaving 
                    ? "bg-blue-400 cursor-not-allowed opacity-80 text-white" 
                    : "bg-blue-600 hover:bg-blue-700 text-white active:scale-95"
                }`}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : isEditing ? "Update Letter" : "Save Letter"}
              </button>
            </div>
          </div>
        </form>

        {/* Print Layout */}
        <div className="fixed top-0 left-0 pointer-events-none opacity-0 -z-50 overflow-hidden h-0">
          <style>{`
            @media print {
              @page {
                size: A4;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
          `}</style>
          <div 
            ref={printRef} 
            className={`px-[0.75in] py-[0.75in] text-gray-900 bg-white w-[210mm] h-[297mm] overflow-hidden flex flex-col ${
              language === "EN" ? "font-serif" : "font-sans"
            }`}
            style={{
              fontSize: `${fontSize}pt`,
              ...(language === "BN" ? { fontFamily: "'Kalpurush', 'Siyam Rupali', 'SolaimanLipi', sans-serif" } : {})
            }}
          >
            {/* 1. Header with Logo (Aligned with Content) */}
            {logo && (
              <div className="mb-6 flex justify-start flex-shrink-0" style={{ fontSize: '12pt' }}>
                <img src={logo} alt="Logo" className="w-full h-auto block" />
              </div>
            )}

            {/* 2. Letter No and Date Row */}
            <div className="flex justify-between items-start mb-4 flex-shrink-0">
              <div>
                {letterNo && (
                  <p><span>{language === "BN" ? "পত্র নং" : "No"}:</span> <span>{letterNo}</span></p>
                )}
              </div>
              <div className="text-right">
                <p><span>{language === "BN" ? "তারিখ" : "Date"}:</span> <span>
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
            <div className="mb-4 leading-snug whitespace-pre-wrap flex-shrink-0">
              {recipient}
            </div>

            {/* Subject */}
            <div className="mb-4 flex items-start flex-shrink-0">
              <span className="whitespace-nowrap mr-2">{language === "BN" ? "বিষয়" : "Subject"}:</span>
              <span className="border-b border-black pb-0.5 inline-block flex-1 leading-tight text-justify font-semibold">
                {subject}
              </span>
            </div>

            {/* Body */}
            <div className="leading-relaxed whitespace-pre-wrap mb-4">
              {content}
            </div>

            {/* CC Section */}
            {showCC && cc && (
              <div className="border-t border-gray-200 pt-4 mt-auto">
                <p className="font-bold underline mb-2">
                  {language === "BN" ? "অনুলিপি (সদয় অবগতি ও প্রয়োজনীয় ব্যবস্থা গ্রহনের জন্য):" : "Copy for information and necessary action:"}
                </p>
                <div className="whitespace-pre-wrap pl-4">
                  {cc}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
