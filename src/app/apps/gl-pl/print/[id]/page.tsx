import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { readFile } from "fs/promises"
import { notFound, redirect } from "next/navigation"
import path from "path"
import PrintClient from "./PrintClient"

interface PrintPageProps {
  params: { id: string }
  searchParams: { type?: string }
}

export default async function PrintPage({ params, searchParams }: PrintPageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/api/auth/signin")

  const { id } = await params
  const type = (await searchParams).type || "short"

  const upload = await prisma.fileUpload.findUnique({
    where: { id, userId: session.user.id }
  })

  if (!upload) notFound()

  const filePath = path.join(process.cwd(), upload.filePath)
  let fileContent = ""
  try {
    fileContent = await readFile(filePath, "utf-8")
  } catch (error) {
    console.error("Error reading file:", error)
    return <div className="p-8 text-red-500">Error reading file content.</div>
  }

  const lines = fileContent.split("\n")

  // 1. Try to get branch name from the Branch model using branchCode
  let branchName = upload.branchName || upload.branchCode || "Unknown Branch"
  if (upload.branchCode) {
    const branchInfo = await prisma.branch.findUnique({
      where: { branchCode: upload.branchCode }
    })
    if (branchInfo) {
      branchName = branchInfo.branchName
    } else {
      // 2. Fallback: Extract Branch Name from header if DB lookup fails
      const headerLine = lines.find(line => 
        line.includes("STATEMENT OF AFFAIRS") || 
        line.includes("PROFIT & LOSS STATEMENT")
      )
      if (headerLine) {
        const match = headerLine.match(/RE\d+\s+(.*?)\s+\d+\s+/)
        if (match && match[1]) {
          branchName = match[1].trim().replace("NARSING", "NARSINGDI")
        }
      }
    }
  }

  // Parse lines starting with ====>
  const allTableData = lines
    .filter(line => line.startsWith("====>"))
    .map(line => {
      const lineNo = line.substring(5, 9).trim()
      const description = line.substring(10, 40).trim()
      const legacyCode = line.substring(40, 65).trim()
      const closingBalance = line.substring(66).trim()
      return { lineNo, description, legacyCode, closingBalance }
    })
    .filter(item => item.lineNo || item.description || item.legacyCode || item.closingBalance)

  const tableData = allTableData.filter(item => {
    if (type === "short") {
      if (!item.closingBalance) return false;
      const cleanBalance = item.closingBalance.replace(/,/g, '');
      return cleanBalance !== "" && cleanBalance !== "0.00";
    } else {
      return item.closingBalance !== "";
    }
  })

  // Custom number formatter (3,2,2 then stop)
  const formatInIN = (val: string) => {
    const clean = val.replace(/,/g, '');
    const num = parseFloat(clean);
    if (isNaN(num)) return val;
    
    const parts = num.toFixed(2).split(".");
    let integerPart = parts[0];
    const decimalPart = parts[1];

    const isNegative = integerPart.startsWith("-");
    if (isNegative) integerPart = integerPart.substring(1);

    let result = "";
    const len = integerPart.length;

    if (len > 3) {
      const last3 = integerPart.substring(len - 3);
      const after3 = integerPart.substring(0, len - 3);
      
      if (after3.length > 2) {
        const next2 = after3.substring(after3.length - 2);
        const after2 = after3.substring(0, after3.length - 2);
        
        if (after2.length > 2) {
          const next2_2 = after2.substring(after2.length - 2);
          const remaining = after2.substring(0, after2.length - 2);
          result = remaining + "," + next2_2 + "," + next2 + "," + last3;
        } else {
          result = after2 + "," + next2 + "," + last3;
        }
      } else {
        result = after3 + "," + last3;
      }
    } else {
      result = integerPart;
    }

    return (isNegative ? "-" : "") + result + "." + decimalPart;
  }

  // Standardized font sizes for both versions
  const baseFontSize = "text-[9px]";
  const titleSize = "text-base";
  const branchSize = "text-sm";
  const dateSize = "text-base";
  const colHeaderSize = "text-[11px]";

  return (
    <div className={`bg-white min-h-screen font-serif print:bg-white ${baseFontSize}`}>
      <PrintClient />
      
      <div className="max-w-5xl mx-auto p-2 print:p-0 print:max-w-none">
        <div className="flex justify-between items-end border-b border-black pb-0.5 mb-1">
          <div className="text-left">
            <h1 className={`${titleSize} font-bold uppercase leading-tight`}>{upload.type} - {type === 'short' ? 'Short Version' : 'Full Version'}</h1>
            <p className={`${branchSize} font-bold leading-tight`}>Branch: {branchName}</p>
          </div>
          <div className="text-right">
            <p className={`${dateSize} font-bold`}>Date: {new Date(upload.date).toLocaleDateString()}</p>
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-400">
              <th className={`px-1 py-0.5 text-left font-bold w-10 ${colHeaderSize}`}>Line</th>
              <th className={`px-1 py-0.5 text-left font-bold ${colHeaderSize}`}>Description</th>
              <th className={`px-1 py-0.5 text-left font-bold ${colHeaderSize}`}>Legacy GL Code</th>
              <th className={`px-1 py-0.5 text-right font-bold ${colHeaderSize}`}>Closing Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tableData.map((item, index) => (
              <tr key={index} className="leading-none">
                <td className="px-1 py-0.5 whitespace-nowrap">{item.lineNo}</td>
                <td className="px-1 py-0.5">{item.description}</td>
                <td className="px-1 py-0.5 whitespace-nowrap">{item.legacyCode}</td>
                <td className={`px-1 py-0.5 text-right font-mono whitespace-nowrap ${!item.legacyCode ? 'font-bold' : ''}`}>
                  {formatInIN(item.closingBalance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tableData.length === 0 && (
          <div className="text-center py-10 text-gray-400 border border-dashed border-gray-200 mt-2">
            No data found starting with "====&gt;".
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            margin: 0.5cm 1cm;
            size: A4;
            @top-right {
              content: "Page " counter(page);
              font-family: serif;
              font-size: 7pt;
              padding-top: 0.2cm;
            }
          }
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact;
            line-height: 1;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          td, th {
            padding-top: 1px !important;
            padding-bottom: 1px !important;
          }
        }
      `}} />
    </div>
  )
}
