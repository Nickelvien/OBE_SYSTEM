// app/dashboard/layout.tsx
import type { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from './_components/sidebar'
import { Topbar } from './_components/topbar'
import { ToastProvider } from '@/components/ui/toast'
import { TooltipProvider } from '@/components/ui/tooltip'

export const metadata: Metadata = {
  title: 'Dashboard — OBE Cycle Management System | ACES Panabo',
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <TooltipProvider delayDuration={200}>
      <ToastProvider>
        <div className="flex h-screen bg-background overflow-hidden">
          <Sidebar role={session.user.role} userName={session.user.name || session.user.firstName || 'User'} userEmail={session.user.email || ''} />
          <div className="flex flex-col flex-1 overflow-hidden min-w-0">
            <Topbar user={session.user} />
            <main className="flex-1 overflow-y-auto p-6 md:p-8 animate-page-in bg-grid">
              <div className="max-w-[1440px] mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </ToastProvider>
    </TooltipProvider>
  )
}