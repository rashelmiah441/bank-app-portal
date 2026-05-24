import { auth } from "@/auth"
import { getLetters, getUserLogo, getSavedRecipients } from "./actions"
import LettersList from "./LettersList"
import { redirect } from "next/navigation"

export default async function LettersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/api/auth/signin")
  }

  const { q } = await searchParams
  const [letters, logo, savedRecipients] = await Promise.all([
    getLetters(q),
    getUserLogo(),
    getSavedRecipients()
  ])

  return <LettersList initialLetters={letters} initialLogo={logo} initialRecipients={savedRecipients} />
}
