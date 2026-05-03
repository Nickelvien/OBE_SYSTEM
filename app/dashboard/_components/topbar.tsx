// app/dashboard/_components/topbar.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, LogOut, Settings, Shield, ChevronRight, Home, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { navItems, groupOrder } from './sidebar'
import Image from 'next/image'
import Link from 'next/link'

interface Notification {
  id: string; title: string; body: string; type: string; readAt: string | null; createdAt: string
}

interface TopbarUser {
  name?: string
  firstName?: string
  email?: string
  role?: string
}

function Breadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length <= 1) return null

  return (
    <div className="hidden md:flex items-center gap-2 text-[13px]">
      <Home className="w-3.5 h-3.5 text-app-muted" />
      {segments.slice(1).map((seg, i) => {
        const path = '/' + segments.slice(0, i + 2).join('/')
        const label = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        const isLast = i === segments.slice(1).length - 1
        return (
          <span key={path} className="flex items-center gap-2">
            <ChevronRight className="w-3.5 h-3.5 text-app-muted/30" />
            <span className={cn(isLast ? 'text-brand font-bold font-mono tracking-tight' : 'text-app-muted hover:text-app-text transition-colors')}>
              {label}
            </span>
          </span>
        )
      })}
    </div>
  )
}

function MobileNav({ role, pathname }: { role: string; pathname: string }) {
  const visible = navItems.filter((item) => item.roles.includes(role))
  const groups = groupOrder.filter((g) => visible.some((i) => i.group === g))

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="md:hidden p-2 -ml-2 mr-3 text-app-muted hover:text-brand rounded-xl hover:bg-brand/10 transition-all">
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0 flex flex-col bg-app-surface border-r-app-border">
        <div className="flex items-center gap-3 p-6 border-b border-app-border">
          <div className="w-12 h-12 rounded-2xl bg-app-bg border border-brand/30 flex items-center justify-center p-2">
            <Image src="/aceslogo.png" alt="ACES" width={32} height={32} className="object-contain" priority />
          </div>
          <div>
            <p className="text-base font-bold text-app-text leading-tight tracking-tight">OBE System</p>
            <p className="text-[10px] text-brand font-mono font-bold tracking-widest uppercase mt-0.5">ACES Panabo</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-6 space-y-6 px-4">
          {groups.map((group) => {
            const items = visible.filter((i) => i.group === group)
            return (
              <div key={group} className="space-y-1">
                {group !== 'Main' && (
                  <p className="text-[10px] font-bold text-app-muted uppercase tracking-[0.2em] px-4 mb-3 opacity-60 font-mono">{group}</p>
                )}
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
                    return (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            'flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-medium transition-all',
                            isActive
                              ? 'bg-brand/10 text-brand border border-brand/20'
                              : 'text-app-muted hover:text-app-text hover:bg-white/[0.03]'
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          {item.label}
                        </Link>
                      </SheetClose>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function Topbar({ user }: { user: TopbarUser }) {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [bellOpen, setBellOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => (r.ok ? r.json() : []))
      .then(setNotifs)
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unread = notifs.filter((n) => !n.readAt).length

  const markRead = async (id: string) => {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setNotifs((ns) => ns.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)))
  }

  const displayName = user?.name || user?.firstName || 'User'
  const role = user?.role?.replace(/_/g, ' ') ?? ''
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="h-topbar flex items-center px-6 bg-app-bg border-b border-app-border flex-shrink-0 z-40 sticky top-0">
      <MobileNav role={user?.role ?? ''} pathname={pathname} />
      <Breadcrumbs />

      <div className="flex items-center gap-3 ml-auto">
        {/* Notification bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => {
              setBellOpen(!bellOpen)
              setProfileOpen(false)
            }}
            className={cn(
              'relative p-2.5 rounded-xl transition-all',
              bellOpen
                ? 'bg-brand/10 text-brand'
                : 'text-app-muted hover:text-brand hover:bg-brand/10'
            )}
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand rounded-full border-2 border-app-bg animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {bellOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-14 w-[380px] bg-app-surface border border-app-border rounded-3xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-app-border flex items-center justify-between bg-app-surface/50 backdrop-blur-md">
                  <p className="text-app-text font-bold text-sm tracking-tight">Notifications</p>
                  {unread > 0 && <Badge className="bg-brand text-app-bg font-bold font-mono text-[9px] uppercase tracking-widest">{unread} NEW</Badge>}
                </div>
                <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
                  {loading ? (
                    <div className="p-4 space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4">
                          <Skeleton className="w-2.5 h-2.5 rounded-full mt-2 bg-app-border flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4 bg-app-border" />
                            <Skeleton className="h-3 w-full bg-app-border/50" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : notifs.length === 0 ? (
                    <div className="py-16 text-center">
                      <Bell className="w-12 h-12 text-app-muted/10 mx-auto mb-4" />
                      <p className="text-sm text-app-muted font-mono uppercase tracking-widest">No active alerts</p>
                    </div>
                  ) : (
                    notifs.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={cn(
                          'w-full text-left px-4 py-4 rounded-2xl transition-all group',
                          !n.readAt ? 'bg-brand/5' : 'hover:bg-white/[0.02]'
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <span
                            className={cn(
                              'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                              !n.readAt ? 'bg-brand shadow-[0_0_8px_#10B981]' : 'bg-app-border'
                            )}
                          />
                          <div className="min-w-0">
                            <p className={cn('text-[13px] font-bold transition-colors', !n.readAt ? 'text-app-text' : 'text-app-muted')}>
                              {n.title}
                            </p>
                            <p className="text-xs text-app-muted/60 mt-1 line-clamp-2 leading-relaxed tracking-tight">{n.body}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setProfileOpen(!profileOpen)
              setBellOpen(false)
            }}
            className={cn(
              'flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-2xl transition-all',
              profileOpen ? 'bg-brand/10 border-brand/20' : 'hover:bg-brand/5'
            )}
          >
            <div className="text-right hidden sm:block">
              <p className="text-app-text text-[13px] font-bold leading-tight tracking-tight">{displayName}</p>
              <p className="text-brand text-[10px] font-bold font-mono uppercase tracking-[0.1em] mt-0.5">{role}</p>
            </div>
            <Avatar className="w-9 h-9 ring-2 ring-brand/10 group-hover:ring-brand/30 transition-all">
              <AvatarFallback className="bg-app-surface text-brand text-xs font-bold font-mono">{initials}</AvatarFallback>
            </Avatar>
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-14 w-64 bg-app-surface border border-app-border rounded-3xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="px-6 py-5 border-b border-app-border bg-app-surface/50 backdrop-blur-md">
                  <p className="text-app-text text-sm font-bold tracking-tight">{displayName}</p>
                  <p className="text-app-muted text-[11px] font-mono truncate mt-1">{user?.email}</p>
                </div>
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-app-muted hover:text-app-text hover:bg-white/[0.03] transition-all text-sm font-medium"
                  >
                    <Settings className="w-4 h-4" />
                    System Settings
                  </button>
                  <button
                    onClick={() => setProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-app-muted hover:text-app-text hover:bg-white/[0.03] transition-all text-sm font-medium"
                  >
                    <Shield className="w-4 h-4" />
                    Access Security
                  </button>
                  <Separator className="my-2 bg-app-border/50" />
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-sm font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out System
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}