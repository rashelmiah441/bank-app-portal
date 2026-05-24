import { getUserLogo, getSavedRecipients } from "../actions"
import LetterForm from "../LetterForm"

export default async function NewLetterPage() {
  const [logo, savedRecipients] = await Promise.all([
    getUserLogo(),
    getSavedRecipients()
  ])
  return <LetterForm logo={logo} savedRecipients={savedRecipients} />
}
