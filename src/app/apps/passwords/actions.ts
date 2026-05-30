"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const url = formData.get("url") as string;
  const notes = formData.get("notes") as string;

  await prisma.savedPassword.create({
    data: {
      userId: session.user.id,
      title,
      username,
      password,
      url,
      notes,
    },
  });

  revalidatePath("/apps/passwords");
}

export async function deletePassword(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.savedPassword.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/apps/passwords");
}

export async function updatePassword(id: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const title = formData.get("title") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const url = formData.get("url") as string;
    const notes = formData.get("notes") as string;

    await prisma.savedPassword.update({
        where: { id, userId: session.user.id },
        data: {
            title,
            username,
            password,
            url,
            notes,
        },
    });

    revalidatePath("/apps/passwords");
}
