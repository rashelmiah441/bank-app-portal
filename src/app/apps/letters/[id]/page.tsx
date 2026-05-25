import { getLetterById, getUserLogo, getSavedRecipients, getSavedCCs } from "../actions"
import LetterForm from "../LetterForm"
import { notFound } from "next/navigation"

export default async function EditLetterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [letter, logo, savedRecipients, savedCCs] = await Promise.all([
    getLetterById(id),
    getUserLogo(),
    getSavedRecipients(),
    getSavedCCs()
  ])

  if (!letter) {
    notFound()
  }

  return (
    <LetterForm 
      letter={letter} 
      logo={logo} 
      savedRecipients={savedRecipients} 
      savedCCs={savedCCs}
    />
  )
}
