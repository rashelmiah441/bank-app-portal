"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import * as XLSX from "xlsx"

async function checkAdmin() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }
}

export async function getBranches(page = 1, pageSize = 10, search = "") {
  await checkAdmin()

  const offset = (page - 1) * pageSize
  const searchPattern = `%${search}%`

  // Use raw query for custom sorting (NARSINGDI first)
  // SQLite treats boolean expressions in ORDER BY as 0 or 1
  const branches = await prisma.$queryRawUnsafe(`
    SELECT * FROM Branch 
    WHERE branchName LIKE $1 OR branchCode LIKE $2 OR districtName LIKE $3
    ORDER BY (districtName = 'NARSINGDI') DESC, branchName ASC
    LIMIT $4 OFFSET $5
  `, searchPattern, searchPattern, searchPattern, pageSize, offset)

  const totalResult: any[] = await prisma.$queryRawUnsafe(`
    SELECT COUNT(*) as count FROM Branch 
    WHERE branchName LIKE $1 OR branchCode LIKE $2 OR districtName LIKE $3
  `, searchPattern, searchPattern, searchPattern)

  const total = Number(totalResult[0].count)

  return { 
    branches: branches as any[], 
    total, 
    pages: Math.ceil(total / pageSize) 
  }
}

export async function createBranch(data: {
  districtName: string
  branchName: string
  branchCode: string
  routingNumber?: string
  phoneNumber?: string
}) {
  await checkAdmin()

  const existing = await prisma.branch.findUnique({
    where: { branchCode: data.branchCode }
  })

  if (existing) {
    throw new Error(`Branch with code "${data.branchCode}" already exists.`)
  }

  const branch = await prisma.branch.create({ data })
  revalidatePath("/apps/admin/branches")
  return branch
}

export async function updateBranch(id: string, data: {
  districtName?: string
  branchName?: string
  branchCode?: string
  routingNumber?: string
  phoneNumber?: string
}) {
  await checkAdmin()

  const branch = await prisma.branch.update({
    where: { id },
    data,
  })
  revalidatePath("/apps/admin/branches")
  return branch
}

export async function deleteBranch(id: string) {
  await checkAdmin()

  await prisma.branch.delete({ where: { id } })
  revalidatePath("/apps/admin/branches")
}

export async function uploadBranchesExcel(formData: FormData) {
  await checkAdmin()

  const file = formData.get("file") as File
  if (!file) throw new Error("No file uploaded")

  const bytes = await file.arrayBuffer()
  const workbook = XLSX.read(bytes)
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  const data = XLSX.utils.sheet_to_json(worksheet)

  // Expected headers: District Name, Branch Name, Branch Code, Routing Number, Phone Number
  // Map them to camelCase
  const branchesToCreate = data.map((row: any) => ({
    districtName: String(row["District Name"] || row["districtName"] || ""),
    branchName: String(row["Branch Name"] || row["branchName"] || ""),
    branchCode: String(row["Branch Code"] || row["branchCode"] || ""),
    routingNumber: String(row["Routing Number"] || row["routingNumber"] || ""),
    phoneNumber: String(row["Phone Number"] || row["phoneNumber"] || ""),
  })).filter(b => b.branchName && b.branchCode)

  // Using a transaction to ensure all or nothing, but for SQLite we might want to do it in chunks or handle errors per row
  // For simplicity, we'll use upsert for each to avoid unique constraint errors if some branches already exist
  for (const branch of branchesToCreate) {
    await prisma.branch.upsert({
      where: { branchCode: branch.branchCode },
      update: branch,
      create: branch,
    })
  }

  revalidatePath("/apps/admin/branches")
  return { success: true, count: branchesToCreate.length }
}
