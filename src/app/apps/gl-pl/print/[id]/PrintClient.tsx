"use client"

export default function PrintClient() {
  const handlePrint = () => {
    window.print()
  }

  const handleBack = () => {
    window.history.back()
  }

  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-3 print:hidden">
      <button
        onClick={handleBack}
        className="bg-gray-800 text-white p-4 rounded-full shadow-2xl hover:bg-gray-900 transition-all transform hover:-translate-y-1 flex items-center gap-2"
        title="Go Back"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="font-bold pr-2 text-xl">Back</span>
      </button>
      <button
        onClick={handlePrint}
        className="bg-indigo-600 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-700 transition-all transform hover:-translate-y-1 flex items-center gap-2"
        title="Print Page"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        <span className="font-bold pr-2 text-xl">Print</span>
      </button>
    </div>
  )
}
