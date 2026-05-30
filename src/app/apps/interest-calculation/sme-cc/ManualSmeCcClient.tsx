"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";

interface HistoryRecord {
  id: string;
  fromPeriod: Date;
  toPeriod: Date | null;
  smeCcRate: number;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  outstanding: number;
  days: number;
  rate: number;
  interest: number;
}

interface QuarterReport {
    periodName: string;
    rows: any[];
    quarterInterest: number;
    closingBalance: number;
}

export default function ManualSmeCcClient({ initialHistory }: { initialHistory: HistoryRecord[] }) {
  const [calculateUpTo, setCalculateUpTo] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: "1", date: "", description: "Opening Balance", debit: 0, credit: 0, outstanding: 0, days: 0, rate: 13.40, interest: 0 }
  ]);
  
  const [report, setReport] = useState<QuarterReport[] | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "SME CC Manual Interest Calculation",
  });

  const toLocalISO = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const parseToLocalMidnight = (dateStr: string) => {
    if (!dateStr) return new Date(NaN);
    let clean = dateStr.trim().replace(/,/g, '');
    if (/[a-zA-Z]/.test(clean)) {
        const d = new Date(clean); d.setHours(0,0,0,0); return d;
    }
    if (clean.includes('/') || clean.includes('-')) {
        const separator = clean.includes('/') ? '/' : '-';
        const parts = clean.split(separator);
        if (parts.length === 3) {
            let y, m, d;
            if (parts[0].length === 4) { y = parseInt(parts[0]); m = parseInt(parts[1]) - 1; d = parseInt(parts[2]); }
            else { y = parseInt(parts[2]); m = parseInt(parts[1]) - 1; d = parseInt(parts[0]); }
            return new Date(y, m, d, 0, 0, 0, 0);
        }
    }
    const finalD = new Date(clean); finalD.setHours(0,0,0,0); return finalD;
  };

  const formatCurrency = (val: number) => {
    if (val === 0) return "0.00";
    const sign = val < 0 ? "-" : "";
    const [intPart, decPart] = Math.abs(val).toFixed(2).split('.');
    
    if (intPart.length <= 3) return sign + intPart + "." + decPart;

    let res = intPart.slice(-3);
    let rem = intPart.slice(0, -3);
    
    // First group of 2
    res = rem.slice(-2) + "," + res;
    rem = rem.slice(0, -2);

    if (rem.length > 0) {
        // Second group of 2
        res = rem.slice(-2) + "," + res;
        rem = rem.slice(0, -2);
    }

    if (rem.length > 0) {
        // No more commas for the rest
        res = rem + "," + res;
    }

    return sign + res + "." + decPart;
  };

  const formatExcelDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = parseToLocalMidnight(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${date.getDate()}-${months[date.getMonth()]}-${date.getFullYear()}`;
  };

  const getQuarterEnd = (date: Date) => {
    const month = date.getMonth();
    let qMonth = month < 3 ? 2 : month < 6 ? 5 : month < 9 ? 8 : 11;
    return new Date(date.getFullYear(), qMonth + 1, 0); 
  };

  const getRateForDate = (dateStr: string) => {
    if (!dateStr || initialHistory.length === 0) return 13.40;
    const targetDate = parseToLocalMidnight(dateStr);
    const record = initialHistory.find(h => {
        const from = new Date(h.fromPeriod); from.setHours(0,0,0,0);
        const to = h.toPeriod ? new Date(h.toPeriod) : new Date(); to.setHours(23,59,59,999);
        return targetDate >= from && targetDate <= to;
    });
    return record ? record.smeCcRate : 13.40;
  };

  const recalculateLedger = (list: Transaction[], upToDateStr: string) => {
    const newList = [...list];
    let currentOutstanding = 0;
    const upToDate = parseToLocalMidnight(upToDateStr);
    
    for (let i = 0; i < newList.length; i++) {
        const row = { ...newList[i] };
        currentOutstanding += (Number(row.debit) - Number(row.credit));
        row.outstanding = currentOutstanding;

        if (row.date) {
            row.rate = getRateForDate(row.date);
            const d1 = parseToLocalMidnight(row.date);
            let d2 = (i < newList.length - 1 && newList[i+1].date) ? parseToLocalMidnight(newList[i+1].date) : upToDate;
            if (d2 >= d1) row.days = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
            else row.days = 0;
        }
        row.interest = row.outstanding > 0 ? (row.outstanding * (row.rate / 100) * row.days) / 360 : 0;
        newList[i] = row;
    }
    setTransactions(newList);
  };

  useEffect(() => {
    if (transactions.length > 0) recalculateLedger(transactions, calculateUpTo);
  }, [calculateUpTo]);

  const addRow = () => {
    const lastRow = transactions[transactions.length - 1];
    const newList = [...transactions, { id: Math.random().toString(36).substr(2, 9), date: lastRow.date, description: "", debit: 0, credit: 0, outstanding: lastRow.outstanding, days: 0, rate: lastRow.rate, interest: 0 }];
    recalculateLedger(newList, calculateUpTo);
  };

  const removeRow = (id: string) => {
    if (transactions.length > 1) {
      const filtered = transactions.filter(t => t.id !== id);
      recalculateLedger(filtered, calculateUpTo);
    }
  };

  const updateTransaction = (index: number, field: keyof Transaction, value: any) => {
    const newTransactions = [...transactions];
    let val = value;
    if (field === "debit" || field === "credit") val = Math.abs(Number(value) || 0);
    newTransactions[index] = { ...newTransactions[index], [field]: val };
    recalculateLedger(newTransactions, calculateUpTo);
  };

  const processManualCalculation = () => {
    const rawData = transactions.filter(t => t.date !== "").map(t => ({
        ...t, dateObj: parseToLocalMidnight(t.date)
    })).filter(t => !isNaN(t.dateObj.getTime())).sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    const upToDate = parseToLocalMidnight(calculateUpTo);
    if (rawData.length === 0 || isNaN(upToDate.getTime())) return;

    const eventDates = new Set<number>();
    rawData.forEach(t => eventDates.add(t.dateObj.getTime()));
    initialHistory.forEach(h => {
        const d = new Date(h.fromPeriod); d.setHours(0,0,0,0);
        if (d >= rawData[0].dateObj && d <= upToDate) eventDates.add(d.getTime());
    });
    let qPtr = new Date(rawData[0].dateObj);
    while (qPtr <= upToDate) {
        let qEnd = getQuarterEnd(qPtr); qEnd.setHours(0,0,0,0);
        eventDates.add(qEnd.getTime());
        qPtr = new Date(qEnd); qPtr.setDate(qPtr.getDate() + 1);
        if (qPtr <= upToDate) eventDates.add(qPtr.getTime());
    }
    eventDates.add(upToDate.getTime());
    const sortedEvents = Array.from(eventDates).sort((a, b) => a - b).map(ts => new Date(ts));

    const quarterReports: QuarterReport[] = [];
    let activeBal = 0;
    let reportStart = new Date(rawData[0].dateObj);

    while (reportStart <= upToDate) {
        let qEnd = getQuarterEnd(reportStart); qEnd.setHours(0,0,0,0);
        let segmentEnd = qEnd < upToDate ? qEnd : upToDate;

        let qInterest = 0;
        let qRows: any[] = [];
        const qEvents = sortedEvents.filter(d => d >= reportStart && d <= segmentEnd);
        
        for (let i = 0; i < qEvents.length; i++) {
            const currentEventDate = qEvents[i];
            const nextEventDate = qEvents[i+1];
            const transToday = rawData.filter(t => t.dateObj.getTime() === currentEventDate.getTime());
            
            transToday.forEach((t) => {
                let desc = t.description;
                if (qRows.length === 0) desc = "Opening balance";
                
                const isFirstRowOfReport = t.id === rawData[0].id;
                if (isFirstRowOfReport) activeBal = t.outstanding;
                else activeBal += (Number(t.debit) - Number(t.credit));

                qRows.push({ 
                    date: toLocalISO(currentEventDate), description: desc, 
                    debit: t.debit, credit: t.credit, outstanding: activeBal, 
                    days: 0, rate: getRateForDate(toLocalISO(currentEventDate)), interest: 0 
                });
            });

            if (qRows.length === 0) {
                qRows.push({ date: toLocalISO(currentEventDate), description: "Opening balance", debit: 0, credit: 0, outstanding: activeBal, days: 0, rate: getRateForDate(toLocalISO(currentEventDate)), interest: 0 });
            }

            if (nextEventDate) {
                const diff = Math.round((nextEventDate.getTime() - currentEventDate.getTime()) / (1000 * 60 * 60 * 24));
                const rate = getRateForDate(toLocalISO(currentEventDate));
                if (diff > 0) {
                    const int = activeBal > 0 ? (activeBal * (rate / 100) * diff) / 360 : 0;
                    qInterest += int;
                    const lastRow = qRows[qRows.length - 1]; lastRow.days = diff; lastRow.interest = int; lastRow.rate = rate;
                }
            }
        }

        const finalRate = getRateForDate(toLocalISO(segmentEnd));
        const finalInt = activeBal > 0 ? (activeBal * (finalRate / 100) * 1) / 360 : 0;
        qInterest += finalInt;

        qRows.push({ date: toLocalISO(segmentEnd), description: "", debit: 0, credit: 0, outstanding: activeBal, days: 1, rate: finalRate, interest: finalInt });
        qRows.push({ date: toLocalISO(segmentEnd), description: "", debit: 0, credit: 0, outstanding: activeBal, days: 0, rate: finalRate, interest: 0 });

        quarterReports.push({
            periodName: `${formatExcelDate(toLocalISO(reportStart))} to ${formatExcelDate(toLocalISO(segmentEnd))}`,
            rows: qRows, quarterInterest: qInterest, closingBalance: activeBal + qInterest
        });

        activeBal += qInterest;
        reportStart = new Date(segmentEnd); reportStart.setDate(reportStart.getDate() + 1);
    }
    setReport(quarterReports);
  };

  return (
    <div className="p-8 max-w-[98%] mx-auto space-y-8 text-black font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: portrait; margin: 8mm; }
          .print-hidden { display: none !important; }
          body { font-family: "Segoe UI", Tahoma, sans-serif !important; color: #000 !important; }
          .excel-table { width: 100% !important; border-collapse: collapse !important; margin-bottom: 12px !important; border: 0.5pt solid #000 !important; }
          .excel-table th, .excel-table td { border: 0.5pt solid #000 !important; padding: 3px 5px !important; font-size: 8pt !important; line-height: 1.1 !important; }
          .excel-header { background-color: #f2f2f2 !important; font-weight: bold !important; text-transform: uppercase !important; font-size: 7.5pt !important; }
          .text-right { text-align: right !important; }
          .font-bold { font-weight: bold !important; }
          .quarter-summary { font-size: 8.5pt !important; margin-top: -8px !important; margin-bottom: 15px !important; border-left: 2pt solid #000 !important; padding-left: 8px !important; }
          .report-header { text-align: center !important; margin-bottom: 20px !important; border-bottom: 1pt solid #000 !important; padding-bottom: 10px !important; }
          .report-header h1 { font-size: 14pt !important; margin: 0 !important; font-weight: 900 !important; }
          .report-header p { font-size: 8pt !important; margin: 2px 0 !important; color: #444 !important; }
          .quarter-container { break-inside: avoid !important; margin-bottom: 30px !important; }
        }
      `}} />

      <div className="flex justify-between items-center print-hidden">
        <div className="flex items-center gap-4">
          <Link href="/apps/interest-calculation/sme-cc" className="p-2 bg-white border rounded-lg text-gray-600 hover:text-blue-600 shadow-sm transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg></Link>
          <h1 className="text-3xl font-bold tracking-tight">Manual Calculation</h1>
        </div>
        <button onClick={() => handlePrint()} className="bg-white border border-gray-200 text-gray-700 px-6 py-2 rounded-xl font-bold hover:bg-gray-50 shadow-sm transition-all active:scale-95 text-xs">Print Report</button>
      </div>

      <div ref={printRef} className="space-y-4 font-sans text-black">
        <div className="hidden print:block report-header">
            <h1>SME CC LOAN INTEREST CALCULATION</h1>
            <div className="grid grid-cols-2 gap-4 mt-6 text-left max-w-4xl mx-auto border p-4 rounded-xl bg-gray-50/50">
                <div className="space-y-1 border-r border-gray-200 pr-4">
                    <div className="space-y-0.5">
                        <div className="text-[7pt] text-gray-400 font-black uppercase">Bank Name</div>
                        <div className="text-[10pt] font-black text-gray-900 leading-none">{bankName || "N/A"}</div>
                    </div>
                    <div className="space-y-0.5 pt-1">
                        <div className="text-[7pt] text-gray-400 font-black uppercase">Branch Name</div>
                        <div className="text-[9pt] font-bold text-gray-700 leading-none">{branchName || "N/A"}</div>
                    </div>
                </div>
                <div className="space-y-1 pl-4 text-right">
                    <div className="space-y-0.5">
                        <div className="text-[7pt] text-gray-400 font-black uppercase">Customer Name</div>
                        <div className="text-[10pt] font-black text-blue-900 uppercase tracking-tight leading-none">{customerName || "N/A"}</div>
                    </div>
                    <div className="space-y-0.5 pt-1">
                        <div className="text-[7pt] text-gray-400 font-black uppercase">Account Number</div>
                        <div className="text-[10pt] font-black text-gray-900 leading-none font-mono">{accountNumber || "N/A"}</div>
                    </div>
                </div>
            </div>
            <p className="mt-6 text-[8pt] text-gray-400 font-bold">Calculated Up to: {formatExcelDate(calculateUpTo)}</p>
        </div>
        <div className="text-sm font-bold mb-4 print:hidden text-gray-700">Calculate Interest Up to: {formatExcelDate(calculateUpTo)}</div>

        {!report ? (
          <div className="space-y-8 print-hidden">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 grid md:grid-cols-2 gap-8 shadow-sm">
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">Calculation Settings</h2>
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                        <label className="text-xs font-black text-gray-400 uppercase w-20">End Date</label>
                        <input type="date" value={calculateUpTo} onChange={(e) => setCalculateUpTo(e.target.value)} className="p-2 border-none bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 font-bold flex-1" />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3">
                        <label className="text-[10px] font-black uppercase text-gray-400 w-24">Bank Name</label>
                        <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. Agrani Bank PLC" className="flex-1 bg-gray-50 border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 font-medium" />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-[10px] font-black uppercase text-gray-400 w-24">Account No.</label>
                        <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="e.g. 0200000123456" className="flex-1 bg-gray-50 border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 font-bold" />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-[10px] font-black uppercase text-gray-400 w-24">Branch Name</label>
                        <input type="text" value={branchName} onChange={(e) => setBranchName(e.target.value)} placeholder="e.g. Principal Branch" className="flex-1 bg-gray-50 border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 font-medium" />
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-[10px] font-black uppercase text-gray-400 w-24">Customer</label>
                        <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="e.g. John Doe Enterprises" className="flex-1 bg-gray-50 border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 font-bold" />
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead className="bg-gray-100 border-b border-gray-200 sticky top-0 z-10 font-black text-gray-900 uppercase text-[10px] tracking-widest shadow-sm">
                      <tr>
                        <th className="px-6 py-4 text-center">SL</th>
                        <th className="px-6 py-4 w-32">Date</th>
                        <th className="px-6 py-4 text-center">Description</th>
                        <th className="px-6 py-4 text-right">Debit</th>
                        <th className="px-6 py-4 text-right">Credit</th>
                        <th className="px-6 py-4 text-right">Outstanding</th>
                        <th className="px-6 py-4 text-center text-gray-600">Days</th>
                        <th className="px-6 py-4 text-center text-gray-600">Rate</th>
                        <th className="px-6 py-4 text-right text-gray-600">Interest</th>
                        <th className="px-6 py-4 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {transactions.map((t, idx) => (
                        <tr key={t.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-50">
                          <td className="px-6 py-3 text-center text-gray-400 font-mono text-xs">{idx + 1}</td>
                          <td className="px-6 py-3"><input type="date" value={t.date} onChange={(e) => updateTransaction(idx, "date", e.target.value)} className="w-full bg-transparent p-0 border-none focus:ring-0 font-medium text-black text-sm" /></td>
                          <td className="px-6 py-3 text-gray-700 text-sm"><input type="text" value={t.description} onChange={(e) => updateTransaction(idx, "description", e.target.value)} placeholder="Entry..." className="w-full bg-transparent p-0 border-none focus:ring-0 text-black text-sm" /></td>
                          <td className="px-6 py-3 text-right"><input type="number" value={t.debit || ""} onChange={(e) => updateTransaction(idx, "debit", Number(e.target.value))} placeholder="0.00" className="w-full bg-transparent text-right p-0 border-none focus:ring-0 font-bold text-black" /></td>
                          <td className="px-6 py-3 text-right"><input type="number" value={t.credit || ""} onChange={(e) => updateTransaction(idx, "credit", Number(e.target.value))} placeholder="0.00" className="w-full bg-transparent text-right p-0 border-none focus:ring-0 font-bold text-black" /></td>
                          <td className="px-6 py-3 text-right font-black text-gray-900 text-sm">{t.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-6 py-3 text-center font-bold text-gray-400 text-sm">{t.days}</td>
                          <td className="px-6 py-3 text-center text-gray-500 font-bold text-sm">{t.rate.toFixed(2)}%</td>
                          <td className="px-6 py-3 text-right font-bold text-blue-600 text-sm">{t.interest.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          <td className="px-6 py-3 text-center">
                            <button onClick={() => removeRow(t.id)} className="text-red-300 hover:text-red-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center">
                    <button onClick={addRow} className="flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50 px-6 py-3 rounded-xl border-2 border-dashed border-blue-200 transition-all active:scale-95"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>Add Manual Row</button>
                    <button onClick={processManualCalculation} className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-lg uppercase tracking-tight">Generate Calculation Report</button>
                </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            {report.map((q, qIdx) => (
              <div key={qIdx} className="space-y-4 quarter-container">
                <table className="excel-table w-full text-sm border-collapse border border-gray-300">
                  <thead>
                    <tr className="excel-header bg-gray-100 text-left font-bold">
                      <th className="p-2 border border-gray-300">Date</th>
                      <th className="p-2 border border-gray-300">Description</th>
                      <th className="p-2 border border-gray-300 text-right">Debit</th>
                      <th className="p-2 border border-gray-300 text-right">Credit</th>
                      <th className="p-2 border border-gray-300 text-right">Outstanding</th>
                      <th className="p-2 border border-gray-300 text-center">Days</th>
                      <th className="p-2 border border-gray-300 text-center">Interest rate</th>
                      <th className="p-2 border border-gray-300 text-right">Interest Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {q.rows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td className="p-2 border border-gray-300">{formatExcelDate(row.date)}</td>
                        <td className="p-2 border border-gray-300">{row.description}</td>
                        <td className="p-2 border border-gray-300 text-right">{row.debit !== 0 ? formatCurrency(row.debit) : ""}</td>
                        <td className="p-2 border border-gray-300 text-right">{row.credit !== 0 ? formatCurrency(row.credit) : ""}</td>
                        <td className="p-2 border border-gray-300 text-right">{formatCurrency(row.outstanding)}</td>
                        <td className="p-2 border border-gray-300 text-center">{row.days}</td>
                        <td className="p-2 border border-gray-300 text-center">{row.rate.toFixed(2)}%</td>
                        <td className="p-2 border border-gray-300 text-right">{formatCurrency(row.interest)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold">
                      <td colSpan={5} className="border border-gray-300"></td>
                      <td colSpan={2} className="p-2 border border-gray-300 text-left text-xs uppercase">Interest For the Quarter</td>
                      <td className="p-2 border border-gray-300 text-right">{formatCurrency(q.quarterInterest)}</td>
                    </tr>
                  </tfoot>
                </table>
                <div className="flex justify-start gap-12 font-bold text-sm">
                    <span>Balance at the end of the quarter</span>
                    <span>{formatCurrency(q.closingBalance)}</span>
                </div>
              </div>
            ))}
            <button onClick={() => setReport(null)} className="print-hidden bg-gray-100 text-gray-700 px-10 py-3 rounded-lg font-bold hover:bg-gray-200 transition-all shadow-sm active:scale-95 text-sm">← BACK TO DATA ENTRY</button>
          </div>
        )}
      </div>
    </div>
  );
}
