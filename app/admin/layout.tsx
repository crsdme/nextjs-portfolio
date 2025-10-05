import { redirect } from 'next/navigation'
import { requireUser } from '@/lib/auth'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireUser(['admin'])
  }
  catch {
    redirect('/auth/login')
  }
  return <>{children}</>
}
