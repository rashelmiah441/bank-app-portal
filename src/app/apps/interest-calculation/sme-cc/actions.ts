"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function saveSmeCc(data: {
    id?: string;
    title: string;
    bankName: string;
    branchName: string;
    customerName: string;
    accountNumber: string;
    calculateUpTo: string;
    transactions: any[];
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const payload = {
        userId: session.user.id,
        title: data.title,
        bankName: data.bankName,
        branchName: data.branchName,
        customerName: data.customerName,
        accountNumber: data.accountNumber,
        calculateUpTo: data.calculateUpTo,
        transactions: JSON.stringify(data.transactions),
    };

    if (data.id) {
        await prisma.savedSmeCc.update({
            where: { id: data.id, userId: session.user.id },
            data: payload,
        });
    } else {
        await prisma.savedSmeCc.create({
            data: payload,
        });
    }

    revalidatePath("/apps/interest-calculation/sme-cc");
}

export async function getSavedSmeCcList() {
    const session = await auth();
    if (!session?.user?.id) return [];

    return await prisma.savedSmeCc.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: "desc" },
    });
}

export async function deleteSavedSmeCc(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await prisma.savedSmeCc.delete({
        where: { id, userId: session.user.id },
    });

    revalidatePath("/apps/interest-calculation/sme-cc");
}
