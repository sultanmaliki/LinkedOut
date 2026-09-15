export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-10 max-w-xl space-y-3">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-surface" />
        <div className="h-4 w-72 animate-pulse rounded-lg bg-surface" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl bg-surface" />
        ))}
      </div>
    </main>
  );
}
