'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Bell, LogOut, Settings, Shield, ChevronRight, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'

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
    <div className="hidden md:flex items-center gap-1.5 text-sm">
      <Home className="w-3.5 h-3.5 text-muted-foreground" />
      {segments.slice(1).map((seg, i) => {
        const path = '/' + segments.slice(0, i + 2).join('/')
        const label = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        const isLast = i === segments.slice(1).length - 1
        return (
          <span key={path} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40" />
            <span className={cn(isLast ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground transition-colors')}>
              {label}
            </span>
          </span>
        )
      })}
    </div>
  )
}

export function Topbar({ user }: { user: TopbarUser }) {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [bellOpen, setBellOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

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
    <header className="h-topbar flex items-center justify-between px-6 bg-card/80 backdrop-blur-xl border-b border-border flex-shrink-0 z-10">
      <Breadcrumbs />

      <div className="flex items-center gap-2 ml-auto">
        {/* Notification bell */}
        <div className="relative" ref={bellRef}>
          <button
            id="btn-notifications"
            onClick={() => {
              setBellOpen(!bellOpen)
              setProfileOpen(false)
            }}
            className={cn(
              'relative p-2 rounded-xl transition-all duration-200',
              bellOpen
                ? 'bg-white/[0.06] text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
            )}
          >
            <Bell className="w-[18px] h-[18px]" />
            {unread > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center p-0 text-[9px] min-w-[16px] min-h-[16px]"
              >
                {unread > 9 ? '9+' : unread}
              </Badge>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-12 w-[360px] bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-down">
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                <p className="text-foreground font-semibold text-sm">Notifications</p>
                {unread > 0 && <Badge variant="secondary" className="text-[10px]">{unread} new</Badge>}
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="w-2 h-2 rounded-full mt-2 flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifs.length === 0 ? (
                  <div className="px-5 py-10 text-center">
                    <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No notifications yet</p>
                  </div>
                ) : (
                  notifs.map((n) => (
                    <button
                      key={n.id}
                      id={`notif-${n.id}`}
                      onClick={() => markRead(n.id)}
                      className={cn(
                        'w-full text-left px-5 py-3.5 border-b border-border/50 hover:bg-white/[0.03] transition-colors group',
                        !n.readAt && 'bg-primary/[0.03]'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full mt-2 flex-shrink-0 transition-colors',
                            !n.readAt ? 'bg-primary animate-pulse' : 'bg-transparent'
                          )}
                        />
                        <div className="min-w-0">
                          <p className={cn('text-sm font-medium group-hover:text-foreground transition-colors', !n.readAt ? 'text-foreground' : 'text-muted-foreground')}>
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-2">{n.body}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            id="btn-profile"
            onClick={() => {
              setProfileOpen(!profileOpen)
              setBellOpen(false)
            }}
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all duration-200',
              profileOpen
                ? 'bg-white/[0.06]'
                : 'hover:bg-white/[0.04]'
            )}
          >
            <Avatar className="w-8 h-8 ring-2 ring-border">
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-emerald-500/30 text-[11px]">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-left hidden sm:block">
              <p className="text-foreground text-xs font-semibold leading-tight">{displayName}</p>
              <p className="text-muted-foreground text-[11px] capitalize leading-tight">{role}</p>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-56 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-down">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-foreground text-sm font-semibold">{displayName}</p>
                <p className="text-muted-foreground text-xs truncate">{user?.email}</p>
              </div>
              <div className="p-1.5 space-y-0.5">
                <button
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors text-sm"
                >
                  <Settings className="w-4 h-4" />
                  Account Settings
                </button>
                <button
                  onClick={() => setProfileOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition-colors text-sm"
                >
                  <Shield className="w-4 h-4" />
                  Privacy
                </button>
                <button
                  id="btn-signout"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}