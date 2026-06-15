export default function Loading() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--wa-bg)' }}>
      <div className="h-14" style={{ background: 'var(--wa-teal)' }} />
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4 animate-pulse">
        {/* Header skeleton */}
        <div className="h-7 w-48 rounded-lg" style={{ background: 'var(--wa-border)' }} />

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 h-24" style={{ background: '#f5f5f5' }} />
          ))}
        </div>

        {/* Chart skeleton */}
        <div className="card p-5 h-64" style={{ background: '#f5f5f5' }} />

        {/* Health + personality skeletons */}
        <div className="card p-5 h-40" style={{ background: '#f5f5f5' }} />
        <div className="card p-5 h-48" style={{ background: '#f5f5f5' }} />
      </div>
    </div>
  )
}
