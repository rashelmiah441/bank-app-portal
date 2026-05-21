"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { readFile } from "fs/promises"
import path from "path"

export async function getSettings() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const appData = await prisma.appData.findUnique({
    where: {
      userId_appName: {
        userId: session.user.id,
        appName: "branch-position-settings"
      }
    }
  })

  if (!appData) return { gl: [], pl: [] }
  try {
    const content = JSON.parse(appData.content)
    // Migrate old format if necessary
    if (Array.isArray(content)) {
      return {
        gl: content.map(item => ({ description: item.glDescription, amount: item.glAmount })),
        pl: content.map(item => ({ description: item.plDescription, amount: item.plAmount })).filter(item => item.description)
      }
    }
    return content
  } catch (e) {
    return { gl: [], pl: [] }
  }
}

export async function saveSettings(settings: { gl: any[], pl: any[] }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.appData.upsert({
    where: {
      userId_appName: {
        userId: session.user.id,
        appName: "branch-position-settings"
      }
    },
    update: {
      content: JSON.stringify(settings)
    },
    create: {
      userId: session.user.id,
      appName: "branch-position-settings",
      content: JSON.stringify(settings)
    }
  })

  revalidatePath("/apps/branch-position/settings")
}

export async function fetchAmountByDescription(description: string, type: "GL" | "PL", date?: Date) {
  // ... (keep the existing word-based matching logic)
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const where: any = {
    userId: session.user.id,
    type: type
  }

  if (date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    where.date = {
      gte: startOfDay,
      lte: endOfDay
    }
  }

  const upload = await prisma.fileUpload.findFirst({
    where,
    orderBy: {
      date: 'desc'
    }
  })

  if (!upload) return "0.00"

  try {
    const filePath = path.join(process.cwd(), upload.filePath)
    const content = await readFile(filePath, "utf-8")
    const lines = content.split("\n")
    
    for (const line of lines) {
      if (line.startsWith("====>")) {
        const lowerLine = line.toLowerCase()
        const searchWords = description.trim().toLowerCase().split(/\s+/).filter(w => w.length > 0)
        
        // Check if all words from the search description are present in the line
        const allWordsMatch = searchWords.every(word => lowerLine.includes(word))
        
        if (allWordsMatch && searchWords.length > 0) {
          // Find the balance by looking for the last segment of the line that looks like a number
          const segments = line.trim().split(/\s+/)
          const lastSegment = segments[segments.length - 1]
          
          if (/[\d,.-]+/.test(lastSegment)) {
            return lastSegment
          }
          return line.substring(66).trim()
        }
      }
    }
  } catch (error) {
    console.error(`Error fetching ${type} amount:`, error)
  }

  return "0.00"
}

export async function getLatestData() {
  const settings = await getSettings()
  
  const glResults = await Promise.all((settings.gl || []).map(async (row: any) => {
    const amount = row.description ? await fetchAmountByDescription(row.description, "GL") : "0.00"
    return { ...row, amount }
  }))

  const plResults = await Promise.all((settings.pl || []).map(async (row: any) => {
    const amount = row.description ? await fetchAmountByDescription(row.description, "PL") : "0.00"
    return { ...row, amount }
  }))

  return { gl: glResults, pl: plResults }
}

export async function getComparisonData(date1: string, date2: string) {
  const settings = await getSettings()

  const glResults = await Promise.all((settings.gl || []).map(async (row: any) => {
    const amount1 = row.description ? await fetchAmountByDescription(row.description, "GL", new Date(date1)) : "0.00"
    const amount2 = row.description ? await fetchAmountByDescription(row.description, "GL", new Date(date2)) : "0.00"
    return { ...row, date1: amount1, date2: amount2 }
  }))

  const plResults = await Promise.all((settings.pl || []).map(async (row: any) => {
    const amount1 = row.description ? await fetchAmountByDescription(row.description, "PL", new Date(date1)) : "0.00"
    const amount2 = row.description ? await fetchAmountByDescription(row.description, "PL", new Date(date2)) : "0.00"
    return { ...row, date1: amount1, date2: amount2 }
  }))

  return { gl: glResults, pl: plResults }
}
