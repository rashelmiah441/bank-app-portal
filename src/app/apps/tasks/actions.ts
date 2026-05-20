"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getTasks() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
}

export async function createTask(title: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const task = await prisma.task.create({
    data: {
      userId: session.user.id,
      title,
    },
  })
  revalidatePath("/apps/tasks")
  return task
}

export async function updateTask(id: string, data: { title?: string, description?: string, completed?: boolean }) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const task = await prisma.task.update({
    where: { id, userId: session.user.id },
    data,
  })
  revalidatePath("/apps/tasks")
  return task
}

export async function deleteTask(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.task.delete({
    where: { id, userId: session.user.id },
  })
  revalidatePath("/apps/tasks")
}
