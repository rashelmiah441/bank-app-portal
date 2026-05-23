"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import { getExciseDuties } from "../excise-duty/actions";

interface ExciseDutyEntry {
  id: string;
  fromAmount: number;
  toAmount: number;
  dutyAmount: number;
}

export default function FDRCalculator() {
  const [amount, setAmount] = useState<string>("");
  const [period, setPeriod] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("");
  const [taxRate, setTaxRate] = useState<number>(10);
  const [exciseDuties, setExciseDuties] = useState<ExciseDutyEntry[]>([]);
  const [result, setResult] = useState<{
    grossInterest: number;
    taxAmount: number;
    exciseDuty: number;
    netInterest: number;
    maturityAmount: number;
  } | null>(null);

  useEffect(() => {
    const loadExciseDuties = async () => {
      try {
        const duties = await getExciseDuties();
        setExciseDuties(duties);
      } catch (error) {
        console.error("Failed to load excise duties:", error);
      }
    };
    loadExciseDuties();
  }, []);

  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: "FDR_Calculation_Result",
  });

  const calculateFDR = (e: React.FormEvent) => {
    e.preventDefault();
    const principal = parseFloat(amount);
    const timeInMonths = parseFloat(period);
    const rate = parseFloat(interestRate);

    if (isNaN(principal) || isNaN(timeInMonths) || isNaN(rate)) {
      alert("Please enter valid numbers");
      return;
    }

    // Find applicable excise duty
    const applicableDuty = exciseDuties.find(
      (duty) => principal >= duty.fromAmount && principal <= duty.toAmount
    );
    const exciseDutyAmount = applicableDuty ? applicableDuty.dutyAmount : 0;

    // Simple Interest Calculation: I = P * R * T
    // t = period in years
    const t = timeInMonths / 12;
    const r = rate / 100;
    
    const grossInterest = principal * r * t;
    const taxAmount = grossInterest * (taxRate / 100);
    const netInterest = grossInterest - taxAmount;
    
    // Total Maturity after both deductions
    const netMaturity = principal + netInterest - exciseDutyAmount;

    setResult({
      grossInterest: Math.round(grossInterest * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      exciseDuty: exciseDutyAmount,
      netInterest: Math.round(netInterest * 100) / 100,
      maturityAmount: Math.round(netMaturity * 100) / 100,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <style jsx global>{`
        @media print {
          @page {
            margin: 0.5cm;
            size: A4 portrait;
          }
          body {
            background-color: white !important;
            color: black !important;
            font-size: 10pt !important;
          }
          .print-single-page {
            page-break-after: avoid;
            page-break-before: avoid;
            page-break-inside: avoid;
            height: 14cm !important; /* Approximately 50% of A4 height */
            overflow: hidden;
          }
          /* Remove background colors and use thin borders for B&W print */
          .print-border-only {
            background-color: transparent !important;
            border: 0.5pt solid black !important;
            color: black !important;
            padding: 4pt !important;
          }
          .print-text-black {
            color: black !important;
          }
          .print-divider {
            border-bottom: 0.5pt solid black !important;
            margin-bottom: 6pt !important;
            padding-bottom: 2pt !important;
          }
        }
      `}</style>
      <div className="mb-8 flex items-center justify-between print:hidden">
        <div>
          <Link
            href="/apps/dashboard"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">FDR Calculator</h1>
          <p className="text-gray-500 mt-2">Calculate your Fixed Deposit returns with source tax deductions.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 print:hidden">
        <form onSubmit={calculateFDR} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                FDR Amount
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
                FDR Period (Months)
              </label>
              <input
                type="number"
                id="period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="Enter months"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-1">
                Yearly Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                id="interestRate"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="Annual rate"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Source Tax (on Interest)
            </label>
            <div className="flex gap-4">
              {[10, 15].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setTaxRate(rate)}
                  className={`flex-1 py-3 px-6 rounded-xl border-2 transition-all font-semibold flex items-center justify-center gap-2 ${
                    taxRate === rate
                      ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm"
                      : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    taxRate === rate ? "border-blue-600" : "border-gray-300"
                  }`}>
                    {taxRate === rate && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                  </div>
                  {rate}% Source Tax
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => {
                setAmount("");
                setPeriod("");
                setInterestRate("");
                setTaxRate(10);
                setResult(null);
              }}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Calculate
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className="mt-12 space-y-6">
          <div className="flex justify-end print:hidden">
            <button
              onClick={() => handlePrint()}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Result
            </button>
          </div>

          <div ref={contentRef} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0 print:m-0 print:block print-single-page print-text-black mx-auto" style={{ breakInside: 'avoid', maxWidth: '100%', width: '100%', display: 'block' }}>
            <div className="print:max-w-[14cm] print:mx-auto">
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4 hidden print:grid print:divider">
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 print:text-black">Principal Amount</p>
                <p className="text-sm font-bold">{new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", minimumFractionDigits: 2 }).format(parseFloat(amount))}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 print:text-black">Tenure</p>
                <p className="text-sm font-bold">{period} Months</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 print:text-black">Interest Rate (Yearly)</p>
                <p className="text-sm font-bold">{interestRate}%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-gray-500 print:text-black">Source Tax Rate</p>
                <p className="text-sm font-bold">{taxRate}%</p>
              </div>
            </div>

            <div className="bg-blue-50 p-8 rounded-xl border border-blue-100 print:print-border-only print:rounded-none print:p-4">
              <h2 className="text-xl font-bold text-blue-900 mb-4 print:text-sm print:text-black print:uppercase print:tracking-widest print:mb-2">Calculation Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 print:gap-2 print:mb-2">
                <div className="bg-white/60 p-4 rounded-lg border border-blue-100 print:print-border-only">
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-wider print:text-[9px] print:text-black">Gross Interest</p>
                  <p className="text-xl font-bold text-gray-700 mt-1 print:text-sm print:text-black">
                    {new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", minimumFractionDigits: 2 }).format(result.grossInterest)}
                  </p>
                </div>
                <div className="bg-white/60 p-4 rounded-lg border border-blue-100 print:print-border-only">
                  <p className="text-xs text-red-600 font-bold uppercase tracking-wider print:text-[9px] print:text-black">Source Tax ({taxRate}%)</p>
                  <p className="text-xl font-bold text-red-600 mt-1 print:text-sm print:text-black">
                    - {new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", minimumFractionDigits: 2 }).format(result.taxAmount)}
                  </p>
                </div>
                <div className="bg-white/60 p-4 rounded-lg border border-blue-100 print:print-border-only">
                  <p className="text-xs text-red-600 font-bold uppercase tracking-wider print:text-[9px] print:text-black">Excise Duty</p>
                  <p className="text-xl font-bold text-red-600 mt-1 print:text-sm print:text-black">
                    - {new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", minimumFractionDigits: 2 }).format(result.exciseDuty)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-blue-200 print:border-black print:pt-2 print:gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200 print:print-border-only">
                  <p className="text-sm text-blue-600 font-medium uppercase tracking-wider print:text-[10px] print:text-black">Net Interest Earned</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2 print:text-base print:text-black">
                    {new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", minimumFractionDigits: 2 }).format(result.netInterest)}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200 print:print-border-only">
                  <p className="text-sm text-blue-600 font-medium uppercase tracking-wider print:text-[10px] print:text-black">Net Maturity Amount</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2 print:text-base print:text-black">
                    {new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", minimumFractionDigits: 2 }).format(result.maturityAmount)}
                  </p>
                </div>
              </div>
              
              <p className="mt-8 text-xs text-blue-500 italic text-center print:text-[8px] print:text-black print:not-italic print:mt-2">
                This calculation assumes simple interest, {taxRate}% source tax on interest, and applicable excise duty.
              </p>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
