import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PasswordClient from "./PasswordClient";

export default async function PasswordsPage() {
  const session = await auth();
  if (!session) redirect("/api/auth/signin");

  const passwords = await prisma.savedPassword.findMany({
    where: { userId: session.user?.id },
    orderBy: { updatedAt: "desc" },
  });

  return <PasswordClient initialHistory={passwords} />;
}
