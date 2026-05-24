import { getLetterById, getUserLogo, getSavedRecipients } from "../actions"
import LetterForm from "../LetterForm"
import { notFound } from "next/navigation"

export default async function EditLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [letter, logo, savedRecipients] = await Promise.all([
    getLetterById(id),
    getUserLogo(),
    getSavedRecipients()
  ])

  if (!letter) {
    notFound()
  }

  return <LetterForm letter={letter} logo={logo} savedRecipients={savedRecipients} />
}
