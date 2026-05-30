import { auth } from "@/auth"
import { redirect } from "next/navigation"
import KPIClient from "./KPIClient"
import { getKPIReports, getKPIBaseline } from "./actions"

export default async function KPIPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  const [reports, baseline, dbUser] = await Promise.all([
    getKPIReports(),
    getKPIBaseline(),
    prisma.user.findUnique({ where: { id: session.user.id } })
  ])

  if (!dbUser) {
    redirect("/api/auth/signin")
  }

  return <KPIClient initialReports={reports} initialBaseline={baseline} user={dbUser} />
}
