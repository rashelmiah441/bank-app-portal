"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createInterestRate(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const fromPeriod = new Date(formData.get("fromPeriod") as string);
  const isOngoing = formData.get("isOngoing") === "on";
  const toPeriod = isOngoing ? null : new Date(formData.get("toPeriod") as string);
  
  const smeCcRate = parseFloat(formData.get("smeCcRate") as string);
  const personalLoanRate = parseFloat(formData.get("personalLoanRate") as string);
  const anyPurposeLoanRate = parseFloat(formData.get("anyPurposeLoanRate") as string);
  const staffLoanRate = parseFloat(formData.get("staffLoanRate") as string);
  const ruralCreditCropRate = parseFloat(formData.get("ruralCreditCropRate") as string);
  
  const circularLink = formData.get("circularLink") as string | null;

  if (isOngoing || !toPeriod) {
    const yesterday = new Date(fromPeriod);
    yesterday.setDate(yesterday.getDate() - 1);

    await prisma.interestRateHistory.updateMany({
      where: { 
        userId: session.user.id,
        toPeriod: null 
      },
      data: {
        toPeriod: yesterday
      }
    });
  }

  await prisma.interestRateHistory.create({
    data: {
      userId: session.user.id,
      fromPeriod,
      toPeriod,
      smeCcRate,
      personalLoanRate,
      anyPurposeLoanRate,
      staffLoanRate,
      ruralCreditCropRate,
      circularLink,
    },
  });

  revalidatePath("/apps/interest-calculation/history");
}

export async function deleteInterestRate(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.interestRateHistory.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/apps/interest-calculation/history");
}

export async function updateInterestRate(id: string, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const fromPeriod = new Date(formData.get("fromPeriod") as string);
    const isOngoing = formData.get("isOngoing") === "on";
    const toPeriod = isOngoing ? null : new Date(formData.get("toPeriod") as string);
    
    const smeCcRate = parseFloat(formData.get("smeCcRate") as string);
    const personalLoanRate = parseFloat(formData.get("personalLoanRate") as string);
    const anyPurposeLoanRate = parseFloat(formData.get("anyPurposeLoanRate") as string);
    const staffLoanRate = parseFloat(formData.get("staffLoanRate") as string);
    const ruralCreditCropRate = parseFloat(formData.get("ruralCreditCropRate") as string);

    const circularLink = formData.get("circularLink") as string | null;

    await prisma.interestRateHistory.update({
        where: { id, userId: session.user.id },
        data: {
            fromPeriod,
            toPeriod,
            smeCcRate,
            personalLoanRate,
            anyPurposeLoanRate,
            staffLoanRate,
            ruralCreditCropRate,
            circularLink,
        },
    });

    revalidatePath("/apps/interest-calculation/history");
}
