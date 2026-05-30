"use client";

import { useState } from "react";

export default function PersonalLoanCalculator() {
  const [principal, setPrincipal] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(9.5);
  const [tenure, setTenure] = useState<number>(12); // months
  const [emi, setEmi] = useState<number | null>(null);

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    // EMI Formula: [P x R x (1+R)^N]/[(1+R)^N-1]
    const r = interestRate / 12 / 100;
    const n = tenure;
    const result = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    setEmi(result);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Personal Loan (EMI) Calculator</h1>
      
      <form onSubmit={calculate} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Loan Amount (Principal)</label>
          <input 
            type="number" 
            value={principal || ""} 
            onChange={(e) => setPrincipal(Number(e.target.value))}
            placeholder="Enter amount"
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Interest Rate (% p.a.)</label>
            <input 
              type="number" 
              step="0.01"
              value={interestRate} 
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tenure (Months)</label>
            <input 
              type="number" 
              value={tenure} 
              onChange={(e) => setTenure(Number(e.target.value))}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors"
        >
          Calculate EMI
        </button>
      </form>

      {emi !== null && (
        <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-xl text-center">
          <div className="text-sm text-indigo-700 font-semibold uppercase tracking-wider">Monthly EMI</div>
          <div className="text-4xl font-black text-indigo-900 mt-1">
            {emi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm border-t border-indigo-100 pt-4">
            <div>
              <span className="text-gray-500">Total Payment:</span>
              <div className="font-bold">{(emi * tenure).toLocaleString()}</div>
            </div>
            <div>
              <span className="text-gray-500">Total Interest:</span>
              <div className="font-bold text-red-600">{((emi * tenure) - principal).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
