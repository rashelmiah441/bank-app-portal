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

interface YearlyBreakdown {
  year: number;
  principal: number;
  grossInterest: number;
  tax: number;
  exciseDuty: number;
  netMaturity: number;
}

export default function ABSCalculator() {
  const [installment, setInstallment] = useState<string>("");
  const [years, setYears] = useState<string>("");
  const [interestRate, setInterestRate] = useState<string>("");
  const [taxRate, setTaxRate] = useState<number>(10);
  const [exciseDuties, setExciseDuties] = useState<ExciseDutyEntry[]>([]);
  const [result, setResult] = useState<{
    totalPrincipal: number;
    grossInterest: number;
    taxAmount: number;
    exciseDuty: number;
    netInterest: number;
    maturityAmount: number;
    breakdown: YearlyBreakdown[];
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
    documentTitle: "DPS_Calculation_Result",
  });

  const calculateDPS = (e: React.FormEvent) => {
    e.preventDefault();
    const monthlyAmount = parseFloat(installment);
    const totalYearsInput = parseFloat(years);
    const rate = parseFloat(interestRate);

    if (isNaN(monthlyAmount) || isNaN(totalYearsInput) || isNaN(rate)) {
      alert("Please enter valid numbers");
      return;
    }

    const r = rate / 100;
    const yearlyBreakdown: YearlyBreakdown[] = [];

    for (let y = 1; y <= totalYearsInput; y++) {
      const months = y * 12;
      const principal = monthlyAmount * months;
      
      // I = P * (r/100) * (n(n+1)/(2*12))
      const grossInt = monthlyAmount * r * (months * (months + 1) / (2 * 12));
      const tax = grossInt * (taxRate / 100);
      
      const applicableDuty = exciseDuties.find(
        (duty) => principal >= duty.fromAmount && principal <= duty.toAmount
      );
      const exciseDuty = applicableDuty ? applicableDuty.dutyAmount : 0;
      const netMaturity = principal + (grossInt - tax) - exciseDuty;

      yearlyBreakdown.push({
        year: y,
        principal,
        grossInterest: Math.round(grossInt * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        exciseDuty,
        netMaturity: Math.round(netMaturity * 100) / 100,
      });
    }

    const final = yearlyBreakdown[yearlyBreakdown.length - 1];

    setResult({
      totalPrincipal: final.principal,
      grossInterest: final.grossInterest,
      taxAmount: final.tax,
      exciseDuty: final.exciseDuty,
      netInterest: Math.round((final.grossInterest - final.tax) * 100) / 100,
      maturityAmount: final.netMaturity,
      breakdown: yearlyBreakdown,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", minimumFractionDigits: 2 }).format(amount);
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
            font-size: 8pt !important;
          }
          .print-single-page {
            page-break-after: avoid;
            page-break-before: avoid;
            page-break-inside: avoid;
            height: 14cm !important;
            overflow: hidden;
          }
          .print-border-only {
            background-color: transparent !important;
            border: 0.5pt solid black !important;
            color: black !important;
            padding: 2pt !important;
          }
          .print-divider {
            border-bottom: 0.5pt solid black !important;
            margin-bottom: 4pt !important;
            padding-bottom: 2pt !important;
          }
          .print-table th, .print-table td {
            border: 0.5pt solid black !important;
            padding: 2pt !important;
            font-size: 7pt !important;
          }
        }
      `}</style>

      <div className="mb-8 flex items-center justify-between print:hidden">
        <div>
          <Link href="/apps/dashboard" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">ABS (DPS) Calculator</h1>
          <p className="text-gray-500 mt-2">Calculate your Deposit Pension Scheme returns year-wise.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 print:hidden">
        <form onSubmit={calculateDPS} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="installment" className="block text-sm font-medium text-gray-700 mb-1">Installment Amount</label>
              <input
                type="number"
                id="installment"
                value={installment}
                onChange={(e) => setInstallment(e.target.value)}
                placeholder="Monthly amount"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label htmlFor="years" className="block text-sm font-medium text-gray-700 mb-1">Period (Years)</label>
              <input
                type="number"
                id="years"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                placeholder="Number of years"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700 mb-1">Yearly Interest Rate (%)</label>
              <input
                type="number"
                step="0.01"
                id="interestRate"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="Annual rate"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Source Tax (on Interest)</label>
            <div className="flex gap-4">
              {[10, 15].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setTaxRate(rate)}
                  className={`flex-1 py-3 px-6 rounded-xl border-2 transition-all font-semibold flex items-center justify-center gap-2 ${
                    taxRate === rate ? "border-yellow-600 bg-yellow-50 text-yellow-700 shadow-sm" : "border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200"
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${taxRate === rate ? "border-yellow-600" : "border-gray-300"}`}>
                    {taxRate === rate && <div className="w-2 h-2 rounded-full bg-yellow-600" />}
                  </div>
                  {rate}% Source Tax
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={() => { setInstallment(""); setYears(""); setInterestRate(""); setTaxRate(10); setResult(null); }} className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors">Reset</button>
            <button type="submit" className="px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors shadow-sm">Calculate</button>
          </div>
        </form>
      </div>

      {result && (
        <div className="mt-12 space-y-6">
          <div className="flex justify-end print:hidden">
            <button onClick={() => handlePrint()} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              Print Result
            </button>
          </div>

          <div ref={contentRef} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 print:shadow-none print:border-none print:p-0 print:m-0 print:block print-single-page print-text-black mx-auto" style={{ breakInside: 'avoid', maxWidth: '100%', width: '100%', display: 'block' }}>
            <div className="print:max-w-[14cm] print:mx-auto">
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4 hidden print:grid print:divider">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-500 print:text-black">Monthly Installment</p>
                  <p className="text-sm font-bold">{formatCurrency(parseFloat(installment))}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-500 print:text-black">Period</p>
                  <p className="text-sm font-bold">{years} Years</p>
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

              <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-100 print:print-border-only print:rounded-none print:p-2 mb-4">
                <h2 className="text-xl font-bold text-yellow-900 mb-4 print:text-xs print:text-black print:uppercase print:mb-2">Final Summary</h2>
                <div className="grid grid-cols-3 gap-4 mb-4 print:gap-1 print:mb-2">
                  <div className="bg-white/60 p-3 rounded-lg border border-yellow-100 print:print-border-only">
                    <p className="text-[10px] text-yellow-700 font-bold uppercase print:text-[7px] print:text-black">Principal</p>
                    <p className="text-base font-bold text-gray-700 print:text-xs print:text-black">{formatCurrency(result.totalPrincipal)}</p>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg border border-yellow-100 print:print-border-only">
                    <p className="text-[10px] text-yellow-700 font-bold uppercase print:text-[7px] print:text-black">Interest (Gross)</p>
                    <p className="text-base font-bold text-gray-700 print:text-xs print:text-black">{formatCurrency(result.grossInterest)}</p>
                  </div>
                  <div className="bg-white/60 p-3 rounded-lg border border-yellow-100 print:print-border-only">
                    <p className="text-[10px] text-yellow-700 font-bold uppercase print:text-[7px] print:text-black">Maturity (Net)</p>
                    <p className="text-base font-bold text-yellow-900 print:text-xs print:text-black">{formatCurrency(result.maturityAmount)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4 print:text-xs print:text-black print:mb-2">Year-wise Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse print:table">
                    <thead>
                      <tr className="bg-gray-50 print:bg-transparent">
                        <th className="px-4 py-2 text-xs font-bold text-gray-700 uppercase print:px-1 print:py-1">Year</th>
                        <th className="px-4 py-2 text-xs font-bold text-gray-700 uppercase print:px-1 print:py-1">Principal</th>
                        <th className="px-4 py-2 text-xs font-bold text-gray-700 uppercase print:px-1 print:py-1">Interest</th>
                        <th className="px-4 py-2 text-xs font-bold text-gray-700 uppercase print:px-1 print:py-1">Tax ({taxRate}%)</th>
                        <th className="px-4 py-2 text-xs font-bold text-gray-700 uppercase print:px-1 print:py-1">Excise</th>
                        <th className="px-4 py-2 text-xs font-bold text-gray-700 uppercase print:px-1 print:py-1">Net Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.breakdown.map((row) => (
                        <tr key={row.year} className="hover:bg-gray-50 print:hover:bg-transparent">
                          <td className="px-4 py-2 text-sm font-medium text-gray-900 print:px-1 print:py-1">Year {row.year}</td>
                          <td className="px-4 py-2 text-sm text-gray-600 print:px-1 print:py-1">{formatCurrency(row.principal)}</td>
                          <td className="px-4 py-2 text-sm text-gray-600 print:px-1 print:py-1">{formatCurrency(row.grossInterest)}</td>
                          <td className="px-4 py-2 text-sm text-red-600 print:px-1 print:py-1">-{formatCurrency(row.tax)}</td>
                          <td className="px-4 py-2 text-sm text-red-600 print:px-1 print:py-1">-{formatCurrency(row.exciseDuty)}</td>
                          <td className="px-4 py-2 text-sm font-bold text-gray-900 print:px-1 print:py-1">{formatCurrency(row.netMaturity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="mt-4 text-[10px] text-gray-500 italic text-center print:text-[7px] print:text-black print:not-italic">
                * Note: Yearly balance reflects the total maturity if withdrawn at the end of that specific year.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
