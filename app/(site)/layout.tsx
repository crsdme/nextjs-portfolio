import { AuthorsList } from '@/components/AuthorsList'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuthorsList />
      {children}
    </>
  )
}
