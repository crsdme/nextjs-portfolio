import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/AdminSidebar'
import { Toaster } from '@/components/ui'
import { SidebarInset, SidebarProvider } from '@/components/ui/'
import { requireUser } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Admin | Portfolio',
  description: 'Admin | Portfolio',
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Admin | Portfolio',
    description: 'Admin | Portfolio',
    siteName: 'Admin | Portfolio',
    images: [
      { url: '/og.jpg', width: 1200, height: 630, alt: 'Portfolio' },
    ],
  },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    await requireUser(['admin'])
  }
  catch {
    redirect('/auth/login')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
