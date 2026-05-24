"use server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getLetters(query?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return await prisma.letter.findMany({
    where: {
      userId: session.user.id,
      OR: query ? [
        { title: { contains: query } },
        { content: { contains: query } },
      ] : undefined,
    },
    orderBy: { date: "desc" },
  })
}

export async function getLetterById(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return await prisma.letter.findUnique({
    where: { id, userId: session.user.id },
  })
}

export async function createLetter(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const letterNo = formData.get("letterNo") as string
  const recipient = formData.get("recipient") as string
  const language = formData.get("language") as string
  const dateStr = formData.get("date") as string
  const date = dateStr ? new Date(dateStr) : new Date()

  await prisma.letter.create({
    data: {
      userId: session.user.id,
      title,
      content,
      letterNo,
      recipient,
      language,
      date,
    },
  })

  revalidatePath("/apps/letters")
  redirect("/apps/letters")
}

export async function updateLetter(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const title = formData.get("title") as string
  const content = formData.get("content") as string
  const letterNo = formData.get("letterNo") as string
  const recipient = formData.get("recipient") as string
  const language = formData.get("language") as string
  const dateStr = formData.get("date") as string
  const date = dateStr ? new Date(dateStr) : undefined

  await prisma.letter.update({
    where: { id, userId: session.user.id },
    data: {
      title,
      content,
      letterNo,
      recipient,
      language,
      date,
    },
  })

  revalidatePath("/apps/letters")
  redirect("/apps/letters")
}

export async function deleteLetter(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.letter.delete({
    where: { id, userId: session.user.id },
  })

  revalidatePath("/apps/letters")
  redirect("/apps/letters")
}

export async function getUserLogo() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const appData = await prisma.appData.findUnique({
    where: {
      userId_appName: {
        userId: session.user.id,
        appName: "LettersLogo",
      },
    },
  })

  return appData?.content || null
}

export async function saveUserLogo(base64Image: string | null) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  if (base64Image === null) {
    await prisma.appData.deleteMany({
      where: {
        userId: session.user.id,
        appName: "LettersLogo",
      },
    })
  } else {
    await prisma.appData.upsert({
      where: {
        userId_appName: {
          userId: session.user.id,
          appName: "LettersLogo",
        },
      },
      update: { content: base64Image },
      create: {
        userId: session.user.id,
        appName: "LettersLogo",
        content: base64Image,
      },
    })
  }

  revalidatePath("/apps/letters")
}

export async function getSavedRecipients() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  return await prisma.savedRecipient.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
  })
}

export async function createSavedRecipient(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const address = formData.get("address") as string

  await prisma.savedRecipient.create({
    data: {
      userId: session.user.id,
      name,
      address,
    },
  })

  revalidatePath("/apps/letters")
}

export async function updateSavedRecipient(id: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  const name = formData.get("name") as string
  const address = formData.get("address") as string

  await prisma.savedRecipient.update({
    where: { id, userId: session.user.id },
    data: {
      name,
      address,
    },
  })

  revalidatePath("/apps/letters")
}

export async function deleteSavedRecipient(id: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.savedRecipient.delete({
    where: { id, userId: session.user.id },
  })

  revalidatePath("/apps/letters")
}
