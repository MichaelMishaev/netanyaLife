import { redirect } from 'next/navigation'

export default function AddBusinessPage({ params }: { params: { locale: string } }) {
  // Temporarily redirect to the public form
  // TODO: Create dedicated owner form that uses createOwnerBusiness action
  redirect(`/${params.locale}/add-business`)
}
