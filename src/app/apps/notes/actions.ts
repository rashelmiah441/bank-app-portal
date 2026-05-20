"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function saveNote(content: string) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    throw new Error("Unauthorized")
  }

  return await prisma.appData.upsert({
    where: {
      userId_appName: {
        userId: userId,
        appName: "notes",
      },
    },
    update: { content },
    create: {
      userId: userId,
      appName: "notes",
      content,
    },
  })
}
