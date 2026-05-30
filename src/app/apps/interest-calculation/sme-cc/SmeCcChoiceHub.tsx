"use client";

import { useState } from "react";
import Link from "next/link";
import ManualSmeCcClient from "./ManualSmeCcClient";
import AutoSmeCcClient from "./AutoSmeCcClient";

interface HistoryRecord {
  id: string;
  fromPeriod: Date;
  toPeriod: Date | null;
  smeCcRate: number;
}

export default function SmeCcChoiceHub({ history, savedLedgers }: { history: any[], savedLedgers: any[] }) {
  const [choice, setChoice] = useState<"none" | "manual" | "auto">("none");

  if (choice === "manual") return <ManualSmeCcClient initialHistory={history} savedLedgers={savedLedgers} />;
  if (choice === "auto") return <AutoSmeCcClient initialHistory={history} />;

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center space-y-12">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-6">
            <Link href="/apps/interest-calculation" className="bg-white p-3 rounded-full shadow-sm hover:shadow-md transition-all text-gray-400 hover:text-blue-600 border border-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
        </div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">SME CC Calculator</h1>
        <p className="text-gray-500 font-medium max-w-md mx-auto">Choose your preferred calculation method to get started.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
        <button 
          onClick={() => setChoice("manual")}
          className="group bg-white p-10 rounded-3xl border-2 border-transparent hover:border-blue-500 shadow-xl shadow-gray-200/50 transition-all hover:-translate-y-2 text-left space-y-6"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Manual Calculation</h2>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">Type your transactions row-by-row for custom ledgers and precise one-off calculations.</p>
          </div>
          <div className="flex items-center text-blue-600 font-bold text-sm">
            Start Manual Ledger <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </div>
        </button>

        <button 
          onClick={() => setChoice("auto")}
          className="group bg-white p-10 rounded-3xl border-2 border-transparent hover:border-green-500 shadow-xl shadow-gray-200/50 transition-all hover:-translate-y-2 text-left space-y-6"
        >
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Automatic Calculation</h2>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">Upload your CSV or Excel bank statement. We'll automatically detect balances and dates.</p>
          </div>
          <div className="flex items-center text-green-600 font-bold text-sm">
            Upload Statement <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </div>
        </button>
      </div>
    </div>
  );
}
