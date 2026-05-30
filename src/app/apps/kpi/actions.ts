"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { readFile } from "fs/promises"
import path from "path"

export async function getKPIReports() {
  const session = await auth()
  if (!session?.user?.id) return []

  return await prisma.kpiReport.findMany({
    where: { userId: session.user.id as string },
    orderBy: { month: "desc" }
  })
}

export async function saveKPIReport(month: string, data: any) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const report = await prisma.kpiReport.upsert({
    where: {
      userId_month: {
        userId: session.user.id as string,
        month
      }
    },
    update: {
      data: JSON.stringify(data)
    },
    create: {
      userId: session.user.id as string,
      month,
      data: JSON.stringify(data)
    }
  })

  revalidatePath("/apps/kpi")
  return report
}

export async function deleteKPIReport(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.kpiReport.delete({
    where: {
      id,
      userId: session.user.id as string
    }
  })

  revalidatePath("/apps/kpi")
}

export async function fetchGLPLData(monthStr: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string }
  })

  if (!user?.branchCode) {
    throw new Error("Branch code not set in profile")
  }

  const [year, month] = monthStr.split("-").map(Number)
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0))
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

  // Find the latest GL and PL uploads
  const [glUpload, plUpload] = await Promise.all([
    prisma.fileUpload.findFirst({
      where: { branchCode: user.branchCode, type: "GL", date: { gte: startDate, lte: endDate } },
      orderBy: { date: "desc" }
    }),
    prisma.fileUpload.findFirst({
      where: { branchCode: user.branchCode, type: "PL", date: { gte: startDate, lte: endDate } },
      orderBy: { date: "desc" }
    })
  ])

  if (!glUpload && !plUpload) {
    throw new Error(`No GL or PL reports found for branch ${user.branchCode} in ${monthStr}`)
  }

  const results: any = { deposit: "0.00", loans: "0.00", profit: "0.00", nonInterestIncome: "0.00" }

  // Parse GL if found
  if (glUpload) {
    try {
      const content = await readFile(path.join(process.cwd(), glUpload.filePath), "utf-8")
      const extractValue = (pattern: RegExp) => {
        const match = content.match(pattern)
        return match && match[1] ? parseFloat(match[1].trim().replace(/,/g, "")) : 0
      }
      const totalDeposits = extractValue(/SBTL 4\s*:\s*Total Deposits\s+([\d,.-]+)/i)
      const billsPayable = extractValue(/SBTL 4\s*:\s*Bills Payable\s+([\d,.-]+)/i)
      const loansAdvances = Math.abs(extractValue(/SBTL 3\s*:\s*Loans & Advances\s+([\d,.-]+)/i))
      
      results.deposit = ((totalDeposits + billsPayable) / 10000000).toFixed(2)
      results.loans = (loansAdvances / 10000000).toFixed(2)
    } catch (e) { console.error("GL parse error", e) }
  }

  // Parse PL if found
  if (plUpload) {
    try {
      const content = await readFile(path.join(process.cwd(), plUpload.filePath), "utf-8")
      const extractValue = (pattern: RegExp) => {
        const match = content.match(pattern)
        return match && match[1] ? parseFloat(match[1].trim().replace(/,/g, "")) : 0
      }

      // Net Profit
      const match = content.match(/Net Income\/Loss\s+([\d,.-]+)/i)
      if (match && match[1]) {
        const profit = parseFloat(match[1].trim().replace(/,/g, ""))
        results.profit = (profit / 10000000).toFixed(2)
      }

      // Non Interest Income Calculation: (SBTL 2 : Total Income - SBTL 3 : Interest Income)
      const totalIncome = extractValue(/SBTL 2\s*:\s*Total Income\s+([\d,.-]+)/i)
      const interestIncome = extractValue(/SBTL 3\s*:\s*Interest Income\s+([\d,.-]+)/i)
      
      const nonInterestIncome = totalIncome - interestIncome
      results.nonInterestIncome = (nonInterestIncome / 10000000).toFixed(2)

    } catch (e) { console.error("PL parse error", e) }
  }

  return {
    success: true,
    data: results,
    glDate: glUpload?.date.toLocaleDateString(),
    plDate: plUpload?.date.toLocaleDateString()
  }
}

export async function getKPIBaseline() {
  const session = await auth()
  if (!session?.user?.id) return null

  const baseline = await prisma.appData.findUnique({
    where: {
      userId_appName: {
        userId: session.user.id as string,
        appName: "kpi-baseline"
      }
    }
  })

  return baseline ? JSON.parse(baseline.content) : null
}

export async function updateKPIBaseline(data: any) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  // 1. Extract only the baseline fields from the provided data
  const baseline: Record<string, any> = {}
  Object.keys(data).forEach(topic => {
    baseline[topic] = {
      "Branch Achievement 2025": data[topic]["Branch Achievement 2025"],
      "Branch Target 2026": data[topic]["Branch Target 2026"]
    }
  })

  // 2. Update the global baseline record
  await prisma.appData.upsert({
    where: {
      userId_appName: {
        userId: session.user.id as string,
        appName: "kpi-baseline"
      }
    },
    update: { content: JSON.stringify(baseline) },
    create: {
      userId: session.user.id as string,
      appName: "kpi-baseline",
      content: JSON.stringify(baseline)
    }
  })

  // 3. Sync these baseline figures to ALL existing monthly reports for this user
  const allReports = await prisma.kpiReport.findMany({
    where: { userId: session.user.id as string }
  })

  for (const report of allReports) {
    const reportData = JSON.parse(report.data)
    let hasChanged = false

    Object.keys(baseline).forEach(topic => {
      if (reportData[topic]) {
        if (
          reportData[topic]["Branch Achievement 2025"] !== baseline[topic]["Branch Achievement 2025"] ||
          reportData[topic]["Branch Target 2026"] !== baseline[topic]["Branch Target 2026"]
        ) {
          reportData[topic]["Branch Achievement 2025"] = baseline[topic]["Branch Achievement 2025"]
          reportData[topic]["Branch Target 2026"] = baseline[topic]["Branch Target 2026"]
          hasChanged = true
        }
      }
    })

    if (hasChanged) {
      await prisma.kpiReport.update({
        where: { id: report.id },
        data: { data: JSON.stringify(reportData) }
      })
    }
  }

  revalidatePath("/apps/kpi")
}
