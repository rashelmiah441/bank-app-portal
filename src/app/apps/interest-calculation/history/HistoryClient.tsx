"use client";

import { useState, useRef } from "react";
import { createInterestRate, deleteInterestRate, updateInterestRate } from "./actions";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";

interface HistoryRecord {
  id: string;
  fromPeriod: Date;
  toPeriod: Date | null;
  smeCcRate: number;
  personalLoanRate: number;
  anyPurposeLoanRate: number;
  staffLoanRate: number;
  ruralCreditCropRate: number;
  circularLink: string | null;
}

export default function InterestRateHistoryPage({ 
  initialData 
}: { 
  initialData: HistoryRecord[] 
}) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOngoing, setIsOngoing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "Interest Rate History - App Portal",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      if (isEditing) {
        await updateInterestRate(isEditing, formData);
        setIsEditing(null);
      } else {
        await createInterestRate(formData);
      }
      formRef.current?.reset();
      setIsOngoing(false);
    } catch (err) {
      alert("Error saving data");
    } finally {
      setIsLoading(false);
    }
  }

  const handleEdit = (record: HistoryRecord) => {
    setIsEditing(record.id);
    setIsOngoing(record.toPeriod === null);
    
    if (formRef.current) {
      const form = formRef.current;
      (form.elements.namedItem("fromPeriod") as HTMLInputElement).value = new Date(record.fromPeriod).toISOString().split('T')[0];
      if (record.toPeriod) {
        (form.elements.namedItem("toPeriod") as HTMLInputElement).value = new Date(record.toPeriod).toISOString().split('T')[0];
      }
      (form.elements.namedItem("smeCcRate") as HTMLInputElement).value = record.smeCcRate.toString();
      (form.elements.namedItem("personalLoanRate") as HTMLInputElement).value = record.personalLoanRate.toString();
      (form.elements.namedItem("anyPurposeLoanRate") as HTMLInputElement).value = record.anyPurposeLoanRate.toString();
      (form.elements.namedItem("staffLoanRate") as HTMLInputElement).value = record.staffLoanRate.toString();
      (form.elements.namedItem("ruralCreditCropRate") as HTMLInputElement).value = record.ruralCreditCropRate.toString();
      (form.elements.namedItem("circularLink") as HTMLInputElement).value = record.circularLink || "";
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setIsEditing(null);
    setIsOngoing(false);
    formRef.current?.reset();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8" ref={contentRef}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { 
            size: auto;
            margin: 5mm;
          }
          body { 
            background: white !important;
            font-size: 11pt !important;
          }
          .p-8 { padding: 0 !important; }
          .max-w-7xl { max-width: 100% !important; }
          .space-y-8 > * + * { margin-top: 0.5rem !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { 
            padding: 4px 2px !important; 
            font-size: 9pt !important;
            border-bottom: 0.5pt solid #eee !important;
          }
          /* Ensure Period Range gets more space */
          th:first-child, td:first-child { 
            width: 25% !important;
            padding-right: 8px !important;
          }
          /* Tighten up interest rate columns */
          th:not(:first-child), td:not(:first-child) {
            text-align: center !important;
            width: 15% !important;
          }
          h1 { font-size: 19pt !important; margin-bottom: 2mm !important; }
          .print-header { border-bottom: 1px solid black !important; padding-bottom: 2mm !important; }
        }
      `}} />
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center gap-4">
          <Link 
            href="/apps/interest-calculation" 
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Interest Rate History</h1>
            <p className="text-gray-500 mt-1">Manage and track historical loan interest rates.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => handlePrint()}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-2 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-95"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Report
          </button>
          {isEditing && (
            <button 
              onClick={handleCancel}
              className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel Editing
            </button>
          )}
        </div>
      </div>

      {/* Header for Print Only */}
      <div className="hidden print:block text-center border-b-2 border-gray-900 pb-6 mb-8">
        <h1 className="text-4xl font-black text-gray-900 uppercase">Interest Rate History</h1>
        <p className="text-gray-500 mt-2 font-medium">Exported from App Portal on {new Date().toLocaleDateString('en-GB')}</p>
      </div>

      {/* Input Form */}
      <form 
        ref={formRef}
        onSubmit={handleSubmit} 
        className={`bg-white p-8 rounded-2xl shadow-sm border transition-all duration-300 ${isEditing ? 'border-blue-500 ring-4 ring-blue-50' : 'border-gray-100'} space-y-8 print:hidden`}
      >
        <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${isEditing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-sm font-bold uppercase tracking-wider text-gray-400">
                {isEditing ? "Editing Record" : "New Entry"}
            </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">From Period (Date)</label>
            <input type="date" name="fromPeriod" required className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-gray-700">To Period (Date)</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    name="isOngoing" 
                    checked={isOngoing}
                    onChange={(e) => setIsOngoing(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
                  />
                  <span className="text-xs font-bold text-gray-500 group-hover:text-blue-600 transition-colors">PRESENT / ONGOING</span>
                </label>
                {!isOngoing && (
                    <button 
                        type="button"
                        onClick={() => {
                        if (formRef.current) {
                            (formRef.current.elements.namedItem("toPeriod") as HTMLInputElement).value = new Date().toISOString().split('T')[0];
                        }
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                        SET TODAY
                    </button>
                )}
              </div>
            </div>
            <input 
                type="date" 
                name="toPeriod" 
                required={!isOngoing} 
                disabled={isOngoing}
                className={`w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all ${isOngoing ? 'opacity-30' : ''}`} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">SME CC (%)</label>
            <input type="number" step="0.01" name="smeCcRate" placeholder="0.00" required className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Personal (%)</label>
            <input type="number" step="0.01" name="personalLoanRate" placeholder="0.00" required className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Any Purpose (%)</label>
            <input type="number" step="0.01" name="anyPurposeLoanRate" placeholder="0.00" required className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Staff (%)</label>
            <input type="number" step="0.01" name="staffLoanRate" placeholder="0.00" required className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 text-emerald-700">Rural Credit Crop (%)</label>
            <input type="number" step="0.01" name="ruralCreditCropRate" placeholder="0.00" required className="w-full p-3 bg-emerald-50 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 transition-all" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-end justify-between gap-6">
          <div className="w-full md:w-2/3 space-y-2">
            <label className="text-sm font-semibold text-gray-700">Google Drive Link for Circular</label>
            <input 
              type="url" 
              name="circularLink" 
              placeholder="https://drive.google.com/..." 
              className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all" 
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {isEditing && (
                <button 
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 md:flex-none bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                    Cancel
                </button>
            )}
            <button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 md:flex-none bg-blue-600 text-white px-12 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-400 transition-all shadow-lg shadow-blue-200 hover:shadow-xl active:scale-95"
            >
                {isLoading ? "Saving..." : isEditing ? "Save Changes" : "Create History Entry"}
            </button>
          </div>
        </div>
      </form>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Period Range</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">SME CC</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Personal</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Any Purpose</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Staff</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Rural Crop</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider print:hidden">Circular</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right print:hidden">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {initialData.map((record) => (
                <tr key={record.id} className={`hover:bg-blue-50/30 transition-colors group text-sm ${isEditing === record.id ? 'bg-blue-50 animate-pulse' : ''}`}>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <span>{new Date(record.fromPeriod).toLocaleDateString('en-GB')}</span>
                      <span className="text-gray-400 font-normal">to</span>
                      {record.toPeriod ? (
                          <span>{new Date(record.toPeriod).toLocaleDateString('en-GB')}</span>
                      ) : (
                          <div className="flex items-center gap-2">
                            <span>{new Date().toLocaleDateString('en-GB')}</span>
                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter">Present</span>
                          </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{record.smeCcRate.toFixed(2)}%</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{record.personalLoanRate.toFixed(2)}%</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{record.anyPurposeLoanRate.toFixed(2)}%</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">{record.staffLoanRate.toFixed(2)}%</span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md">{record.ruralCreditCropRate.toFixed(2)}%</span>
                  </td>
                  <td className="px-6 py-5 print:hidden">
                    {record.circularLink ? (
                      <a 
                        href={record.circularLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs font-bold text-blue-500 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full"
                      >
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        LINK
                      </a>
                    ) : (
                      <span className="text-xs text-gray-300 font-medium">No Link</span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right space-x-2 print:hidden">
                    <button 
                      onClick={() => handleEdit(record)}
                      disabled={isEditing === record.id}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all disabled:opacity-30"
                      title="Edit Entry"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => { if(confirm("Are you sure?")) deleteInterestRate(record.id) }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg transition-all"
                      title="Delete Entry"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {initialData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-gray-50 rounded-full mb-4">
                        <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-sm font-bold text-gray-900">No History Found</h3>
                      <p className="text-xs text-gray-500 mt-1">Start by adding your first interest rate record above.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
