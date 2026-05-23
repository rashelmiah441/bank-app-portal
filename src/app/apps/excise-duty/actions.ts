"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getExciseDuties() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return await prisma.exciseDuty.findMany({
    where: { userId: session.user.id },
    orderBy: { fromAmount: "asc" },
  });
}

export async function createExciseDuty(data: { fromAmount: number; toAmount: number; dutyAmount: number }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const duty = await prisma.exciseDuty.create({
    data: {
      userId: session.user.id,
      ...data,
    },
  });
  revalidatePath("/apps/excise-duty");
  return duty;
}

export async function updateExciseDuty(id: string, data: { fromAmount: number; toAmount: number; dutyAmount: number }) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const duty = await prisma.exciseDuty.update({
    where: { id, userId: session.user.id },
    data,
  });
  revalidatePath("/apps/excise-duty");
  return duty;
}

export async function deleteExciseDuty(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.exciseDuty.delete({
    where: { id, userId: session.user.id },
  });
  revalidatePath("/apps/excise-duty");
}
