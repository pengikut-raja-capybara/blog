export function SkeletonCard() {
  return (
    <article className="h-full overflow-hidden rounded-2xl border border-tan/20 dark:border-dark-bg-light/30 bg-gradient-to-b from-cream to-cream/80 dark:from-dark-bg-light dark:to-dark-bg shadow-sm">
      <div className="animate-pulse">
        <div className="h-52 bg-tan/20 dark:bg-dark-bg-light/30" />

        <div className="flex min-h-[260px] flex-col space-y-4 p-5">
          <div className="space-y-2">
            <div className="h-5 w-5/6 rounded bg-tan/20 dark:bg-dark-bg-light/30" />
            <div className="h-5 w-3/5 rounded bg-tan/20 dark:bg-dark-bg-light/30" />
          </div>

          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-tan/20 dark:bg-dark-bg-light/30" />
            <div className="h-4 w-11/12 rounded bg-tan/20 dark:bg-dark-bg-light/30" />
            <div className="h-4 w-4/5 rounded bg-tan/20 dark:bg-dark-bg-light/30" />
          </div>

          <div className="flex gap-1.5 overflow-hidden max-h-[22px]">
            <div className="h-[20px] w-14 rounded-full bg-tan/20 dark:bg-dark-bg-light/30" />
            <div className="h-[20px] w-16 rounded-full bg-tan/20 dark:bg-dark-bg-light/30" />
            <div className="h-[20px] w-12 rounded-full bg-tan/20 dark:bg-dark-bg-light/30" />
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-tan/20 dark:border-dark-bg-light/30 pt-3">
            <div className="h-4 w-24 rounded bg-tan/20 dark:bg-dark-bg-light/30" />
            <div className="h-4 w-20 rounded bg-tan/20 dark:bg-dark-bg-light/30" />
          </div>
        </div>
      </div>
    </article>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-full">
          <SkeletonCard />
        </div>
      ))}
    </div>
  );
}
