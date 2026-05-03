'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-white w-full">
      <div className="text-center space-y-4 p-8">
        <h2 className="text-2xl font-bold text-red-400">Something went wrong</h2>
        <p className="text-slate-400 text-sm">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary rounded-lg text-sm font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
