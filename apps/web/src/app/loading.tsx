export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-10 max-w-xl space-y-3">
        <div className="h-3 w-28 animate-pulse rounded-md bg-surface" />
        <div className="h-8 w-64 animate-pulse rounded-md bg-surface" />
        <div className="h-4 w-80 animate-pulse rounded-md bg-surface" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-3 rounded-lg border border-line p-5">
            <div className="h-9 w-9 animate-pulse rounded-md bg-surface" />
            <div className="h-4 w-3/4 animate-pulse rounded-md bg-surface" />
            <div className="h-3 w-1/2 animate-pulse rounded-md bg-surface" />
          </div>
        ))}
      </div>
    </main>
  );
}
