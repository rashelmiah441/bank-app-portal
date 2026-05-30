"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function updateCurrentUser(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const branchName = formData.get("branchName") as string
  const branchNameBangla = formData.get("branchNameBangla") as string
  const branchCode = formData.get("branchCode") as string
  const districtName = formData.get("districtName") as string
  const zoneName = formData.get("zoneName") as string

  try {
    const data: any = {}
    if (email) data.email = email
    if (password) {
      data.password = await bcrypt.hash(password, 10)
    }
    
    // Always update these if provided (can be empty strings to clear)
    if (branchName !== null) data.branchName = branchName
    if (branchNameBangla !== null) data.branchNameBangla = branchNameBangla
    if (branchCode !== null) data.branchCode = branchCode
    if (districtName !== null) data.districtName = districtName
    if (zoneName !== null) data.zoneName = zoneName

    await prisma.user.update({
      where: { id: session.user.id },
      data,
    })

    revalidatePath("/apps/settings")
    return { success: true }
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Email already in use" }
    }
    return { error: error.message || "Failed to update profile" }
  }
}

export async function getAllUsers() {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized")

  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  })
}

export async function createUser(formData: FormData) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") return { error: "Unauthorized" }

  const email = formData.get("email") as string
  const name = formData.get("name") as string
  const password = formData.get("password") as string
  const role = formData.get("role") as string || "USER"

  if (!email || !password) return { error: "Email and password are required" }

  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
      },
    })

    revalidatePath("/apps/admin/users")
    return { success: true }
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "Email already in use" }
    }
    return { error: error.message || "Failed to create user" }
  }
}

export async function updateUser(userId: string, formData: FormData) {
  const session = await auth()
  if ((session?.user as any)?.role !== "ADMIN") return { error: "Unauthorized" }

  const password = formData.get("password") as string
  const role = formData.get("role") as string

  try {
    const data: any = {}
    if (password) {
      data.password = await bcrypt.hash(password, 10)
    }
    if (role) {
      data.role = role
    }

    await prisma.user.update({
      where: { id: userId },
      data,
    })

    revalidatePath("/apps/admin/users")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to update user" }
  }
}

export async function deleteUser(userId: string) {
  const session = await auth()
  if (!session?.user?.id || (session.user as any)?.role !== "ADMIN") {
    return { error: "Unauthorized" }
  }

  if (userId === session.user.id) return { error: "Cannot delete yourself" }

  try {
    await prisma.user.delete({
      where: { id: userId },
    })

    revalidatePath("/apps/admin/users")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Failed to delete user" }
  }
}
