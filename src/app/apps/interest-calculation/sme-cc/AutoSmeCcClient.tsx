"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import * as XLSX from 'xlsx';

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
  isImported?: boolean;
}

interface QuarterReport {
    periodName: string;
    rows: any[];
    quarterInterest: number;
    closingBalance: number;
}

export default function AutoSmeCcClient({ initialHistory }: { initialHistory: any[] }) {
  const [calculateUpTo, setCalculateUpTo] = useState<string>(new Date().toISOString().split('T')[0]);
  const [bankName, setBankName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [report, setReport] = useState<QuarterReport[] | null>(null);
  const [isCsvLoaded, setIsCsvLoaded] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: "SME CC Automatic Interest Calculation",
  });

  const formatCurrency = (val: number) => {
    if (val === 0) return "0.00";
    const sign = val < 0 ? "-" : "";
    const [intPart, decPart] = Math.abs(val).toFixed(2).split('.');
    if (intPart.length <= 3) return sign + intPart + "." + decPart;
    let res = intPart.slice(-3);
    let rem = intPart.slice(0, -3);
    res = rem.slice(-2) + "," + res;
    rem = rem.slice(0, -2);
    if (rem.length > 0) { res = rem.slice(-2) + "," + res; rem = rem.slice(0, -2); }
    if (rem.length > 0) { res = rem + "," + res; }
    return sign + res + "." + decPart;
  };

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
        if (i === 0 && row.isImported) currentOutstanding = row.outstanding;
        else {
            currentOutstanding += (Number(row.debit) - Number(row.credit));
            row.outstanding = currentOutstanding;
        }

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

  const updateTransaction = (index: number, field: keyof Transaction, value: any) => {
    const newTransactions = [...transactions];
    newTransactions[index] = { ...newTransactions[index], [field]: value };
    recalculateLedger(newTransactions, calculateUpTo);
  };

  useEffect(() => {
    if (transactions.length > 0) recalculateLedger(transactions, calculateUpTo);
  }, [calculateUpTo]);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const parseMoney = (val: any) => {
        if (val === undefined || val === null || val === "") return 0;
        const cleaned = String(val).replace(/[^0-9.-]/g, '');
        return Math.abs(parseFloat(cleaned) || 0);
    };
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
      const headerRowIndex = rows.findIndex(row => row && row.some(cell => typeof cell === 'string' && cell.toLowerCase().includes('trans date')));
      if (headerRowIndex === -1) { alert("Header 'Trans Date' not found."); return; }
      let openingBalanceVal = 0;
      rows.forEach((row) => { row.forEach((cell, cIdx) => {
        if (typeof cell === 'string' && cell.toLowerCase().includes('account balance at period start :')) {
            const nextCell = row[cIdx + 1]; if (nextCell !== undefined) openingBalanceVal = parseMoney(nextCell);
        }
      });});
      const headers = rows[headerRowIndex].map(h => String(h || "").trim().toLowerCase());
      const dataRows = rows.slice(headerRowIndex + 1);
      const findColIndex = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h === k || h.includes(k)));
      const colDate = findColIndex(['trans date', 'transaction date', 'date']);
      const colType = findColIndex(['transaction type', 'type', 'description', 'particulars']);
      const colDebit = findColIndex(['debit amount', 'debit', 'withdrawal', 'dr amount', 'payment']);
      const colCredit = findColIndex(['credit amount', 'credit', 'deposit', 'cr amount', 'receipt']);
      const colBalance = findColIndex(['balance amount', 'balance', 'outstanding']);
      const mapped: Transaction[] = dataRows
        .filter(row => {
            const rawDate = row[colDate]; if (!rawDate || String(rawDate).trim() === "") return false;
            let testDate = new Date(rawDate); if (isNaN(testDate.getTime())) return false;
            if (colType !== -1 && String(row[colType] || "").toLowerCase().includes("debit interest")) return false;
            return true;
        })
        .map((row, idx) => {
            const rawDate = row[colDate];
            let dateVal = "";
            
            if (rawDate instanceof Date) {
                dateVal = toLocalISO(rawDate);
            } else {
                const parsed = parseToLocalMidnight(String(rawDate));
                if (!isNaN(parsed.getTime())) {
                    dateVal = toLocalISO(parsed);
                } else {
                    dateVal = String(rawDate).trim();
                }
            }

            return {
                id: `csv-${idx}-${Math.random()}`, date: dateVal,
                description: colType !== -1 ? String(row[colType] || "").trim() : "Imported Transaction",
                debit: parseMoney(row[colDebit]), credit: parseMoney(row[colCredit]),
                outstanding: parseMoney(row[colBalance]), days: 0, rate: 13.40, interest: 0, isImported: true
            };
        });

      let finalTransactions = mapped;
      if (mapped.length > 0) {
          const firstTransDate = mapped[0].date;
          const obRow: Transaction = {
              id: 'ob-imported', date: firstTransDate, description: "Opening Balance",
              debit: 0, credit: 0, outstanding: openingBalanceVal,
              days: 0, rate: getRateForDate(firstTransDate), interest: 0, isImported: true
          };
          finalTransactions = [obRow, ...mapped];
      }
      setTransactions(finalTransactions); setIsCsvLoaded(true); recalculateLedger(finalTransactions, calculateUpTo);
    };
    reader.readAsBinaryString(file);
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
          <h1 className="text-3xl font-bold tracking-tight">Automatic Calculation</h1>
        </div>
        <button onClick={() => handlePrint()} className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 shadow-sm transition-all active:scale-95 text-xs">Print Report</button>
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

        {!report && (
          <div className="space-y-8 print-hidden">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 grid md:grid-cols-2 gap-8 shadow-sm">
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">Report Headers</h2>
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                        <label className="text-xs font-black text-gray-400 uppercase w-20">End Date</label>
                        <input type="date" value={calculateUpTo} onChange={(e) => setCalculateUpTo(e.target.value)} className="p-2 border-none bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 font-bold flex-1" />
                    </div>
                    <div className="relative group">
                        <input type="file" accept=".csv, .xlsx, .xls" onChange={handleCsvUpload} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" />
                        <div className="p-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl flex items-center justify-center gap-3 group-hover:bg-blue-100 transition-colors">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            <span className="text-sm font-bold text-blue-700">{isCsvLoaded ? "File Loaded" : "Upload Statement"}</span>
                        </div>
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

            {isCsvLoaded && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                  <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
                    <h3 className="font-bold tracking-wide uppercase text-xs">Imported Transaction Data</h3>
                    <span className="bg-white/20 px-2 py-1 rounded-md text-[10px] font-black">{transactions.length} ROWS</span>
                  </div>
                  <div className="overflow-x-auto max-h-[550px]">
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
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {transactions.map((t, idx) => (
                          <tr key={t.id} className="hover:bg-blue-50/30 transition-colors border-b border-gray-50">
                            <td className="px-6 py-3 text-center text-gray-400 font-mono text-xs">{idx + 1}</td>
                            <td className="px-6 py-3">
                                <input 
                                    type="date" 
                                    value={t.date} 
                                    onChange={(e) => updateTransaction(idx, "date", e.target.value)} 
                                    className="w-full bg-transparent p-0 border-none focus:ring-0 font-bold text-gray-900 text-sm" 
                                />
                            </td>
                            <td className="px-6 py-3 text-gray-700 text-sm">{t.description}</td>
                            <td className="px-6 py-3 text-right"><span className="text-blue-600 font-bold text-sm">{formatCurrency(t.debit)}</span></td>
                            <td className="px-6 py-3 text-right"><span className="text-rose-600 font-bold text-sm">{formatCurrency(t.credit)}</span></td>
                            <td className="px-6 py-3 text-right font-black text-gray-900 text-sm">{formatCurrency(t.outstanding)}</td>
                            <td className="px-6 py-3 text-center font-bold text-gray-400 text-sm">{t.days}</td>
                            <td className="px-6 py-3 text-center text-gray-500 font-bold text-sm">{t.rate.toFixed(2)}%</td>
                            <td className="px-6 py-3 text-right font-bold text-blue-600 text-sm">{formatCurrency(t.interest)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                    <button onClick={() => { setIsCsvLoaded(false); setTransactions([]); }} className="bg-gray-100 text-gray-700 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all shadow-sm">Clear & Re-upload</button>
                    <button onClick={processManualCalculation} className="bg-blue-600 text-white px-12 py-4 rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-lg uppercase tracking-tight">Generate Calculation Report</button>
                </div>
              </div>
            )}
          </div>
        )}

        {report && (
          <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            {report.map((q, qIdx) => (
              <div key={qIdx} className="space-y-4 quarter-container">
                <table className="excel-table w-full text-sm border-collapse border border-gray-300">
                  <thead>
                    <tr className="excel-header bg-gray-100 text-left font-bold text-gray-900 uppercase text-[10px] tracking-widest">
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
                        <td className="p-2 border border-gray-300 text-black">{formatExcelDate(row.date)}</td>
                        <td className="p-2 border border-gray-300 text-gray-700">{row.description}</td>
                        <td className="p-2 border border-gray-300 text-right text-black">{row.debit !== 0 ? formatCurrency(row.debit) : ""}</td>
                        <td className="p-2 border border-gray-300 text-right text-black">{row.credit !== 0 ? formatCurrency(row.credit) : ""}</td>
                        <td className="p-2 border border-gray-300 text-right font-bold text-black">{formatCurrency(row.outstanding)}</td>
                        <td className="p-2 border border-gray-300 text-center text-black font-bold">{row.days}</td>
                        <td className="p-2 border border-gray-300 text-center text-gray-400 font-mono text-xs">{row.rate.toFixed(2)}%</td>
                        <td className="p-2 border border-gray-300 text-right font-medium text-black">{formatCurrency(row.interest)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="font-bold text-black">
                      <td colSpan={5} className="border border-gray-300"></td>
                      <td colSpan={2} className="p-2 border border-gray-300 text-left text-xs uppercase font-black">Interest For the Quarter</td>
                      <td className="p-2 border border-gray-300 text-right font-black text-blue-700">{formatCurrency(q.quarterInterest)}</td>
                    </tr>
                  </tfoot>
                </table>
                <div className="flex justify-start gap-12 font-bold text-sm">
                    <span className="text-gray-500 uppercase tracking-tighter">Balance at the end of the quarter</span>
                    <span className="text-black font-black">{formatCurrency(q.closingBalance)}</span>
                </div>
              </div>
            ))}
            <button onClick={() => setReport(null)} className="print-hidden bg-gray-100 text-gray-700 px-10 py-3 rounded-lg font-bold hover:bg-gray-200 transition-all shadow-sm active:scale-95 text-sm uppercase">← BACK TO DATA REVIEW</button>
          </div>
        )}
      </div>
    </div>
  );
}
