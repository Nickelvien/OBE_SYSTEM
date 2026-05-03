// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'OBE Cycle Management System | ACES Panabo',
  description: 'Outcomes-Based Education Cycle Management System for ACES Polytechnic College, Panabo Campus, Davao Region XI, Philippines.',
  keywords: ['OBE', 'CHED', 'TESDA', 'ACES Panabo', 'Polytechnic College'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${inter.variable} font-sans bg-background text-foreground antialiased`}>
        {children}
      </body>
    </html>
  )
}