import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import NotesEditor from "./NotesEditor"
import { redirect } from "next/navigation"

export default async function NotesPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  const appData = await prisma.appData.findUnique({
    where: {
      userId_appName: {
        userId: session.user.id,
        appName: "notes",
      },
    },
  })

  return <NotesEditor initialContent={appData?.content || ""} />
}
