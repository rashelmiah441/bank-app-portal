import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SmeCcChoiceHub from "./SmeCcChoiceHub";

export default async function SmeCcCalculatorPage() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");

  const history = await prisma.interestRateHistory.findMany({
    where: { userId: session.user?.id },
    orderBy: { fromPeriod: "desc" },
  });

  const savedLedgers = await prisma.savedSmeCc.findMany({
    where: { userId: session.user?.id },
    orderBy: { updatedAt: "desc" },
  });

  return <SmeCcChoiceHub history={history} savedLedgers={savedLedgers} />;
}
