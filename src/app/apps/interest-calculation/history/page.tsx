import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import HistoryClient from "./HistoryClient";

export default async function InterestRateHistoryPage() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");

  const history = await prisma.interestRateHistory.findMany({
    where: { userId: session.user?.id },
    orderBy: { fromPeriod: "desc" },
  });

  return <HistoryClient initialData={history} />;
}
