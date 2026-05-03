import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-white">
      <div className="text-center space-y-4 p-8">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Page not found</h2>
        <p className="text-slate-400">The page you are looking for does not exist.</p>
        <Link
          href="/dashboard"
          className="inline-block px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary rounded-lg text-sm font-medium transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  )
}
