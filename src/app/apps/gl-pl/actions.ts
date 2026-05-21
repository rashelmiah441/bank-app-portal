"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir, unlink } from "fs/promises"
import path from "path"

export async function uploadFile(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const type = formData.get("type") as string
  const date = formData.get("date") as string
  const branchCode = formData.get("branchCode") as string
  const file = formData.get("file") as File

  if (!file || !type || !date || !branchCode) {
    throw new Error("Missing required fields")
  }

  // Check file size (10MB limit)
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File is too large. Maximum allowed size is 10MB.")
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Check for duplicate upload (same type, date, and branch code)
  const uploadDate = new Date(date)
  const existing = await prisma.fileUpload.findFirst({
    where: {
      type,
      branchCode,
      date: uploadDate,
    },
  })

  if (existing) {
    throw new Error(`${type} file for branch code "${branchCode}" on date ${uploadDate.toLocaleDateString()} has already been uploaded.`)
  }

  // Ensure type is safe for directory name
  const safeType = type === "GL" || type === "PL" ? type.toLowerCase() : "others"
  const uploadDir = path.join(process.cwd(), "uploads", safeType)
  await mkdir(uploadDir, { recursive: true })

  const fileName = `${Date.now()}-${file.name}`
  const filePath = path.join(uploadDir, fileName)

  await writeFile(filePath, buffer)

  await prisma.fileUpload.create({
    data: {
      userId: session.user.id,
      type,
      date: new Date(date),
      branchCode,
      fileName: file.name,
      filePath: path.relative(process.cwd(), filePath),
    },
  })

  revalidatePath("/apps/gl-pl")
}

export async function getUploads() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  console.log("Prisma instance check:", !!prisma)
  if (prisma) {
    console.log("Available Prisma models:", Object.keys(prisma).filter(k => !k.startsWith("$")))
  }

  try {
    return await prisma.fileUpload.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    })
  } catch (error) {
    console.error("Prisma findMany error:", error)
    throw error
  }
}

export async function deleteUpload(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const upload = await prisma.fileUpload.findUnique({
    where: { id, userId: session.user.id }
  })

  if (!upload) throw new Error("File not found")

  try {
    // Delete file from disk
    const filePath = path.join(process.cwd(), upload.filePath)
    await unlink(filePath).catch(err => console.error("File deletion error:", err))

    // Delete from DB
    await prisma.fileUpload.delete({
      where: { id }
    })

    revalidatePath("/apps/gl-pl")
  } catch (error) {
    console.error("Delete upload error:", error)
    throw new Error("Failed to delete upload")
  }
}
