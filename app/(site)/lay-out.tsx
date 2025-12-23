import { AuthorsList } from '@/components/AuthorsList'
import { Header } from '@/components/HeaderMain'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex flex-wrap gap-2 p-2 sm:gap-4 sm:p-4 max-w-2xl mx-auto">
        <Header />
        <AuthorsList />
      </div>
      {children}
    </>
  )
}
