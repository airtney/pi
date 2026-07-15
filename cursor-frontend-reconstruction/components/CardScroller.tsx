import type { ReactNode } from "react";

/**
 * Horizontal snap scroller that becomes a 3/4-column grid at `lg`/`xl`,
 * shared by the "Changelog" card row (inline markup in module 924561) and
 * the server-rendered "Recent highlights" row, which emit identical markup.
 * Items sized to 18/16/14 of the 24-column grid at base/sm/md; the fourth
 * and later cards are hidden between `lg` and `xl` where only three columns
 * fit.
 */

const ITEM_WIDTH_CLASS =
  "w-[calc((((100vw-(2*var(--spacing-g2)))-(23*var(--spacing-g1)))/24)*18+(17*var(--spacing-g1)))] shrink-0 snap-start sm:w-[calc((((100vw-(2*var(--spacing-g2)))-(23*var(--spacing-g1)))/24)*16+(15*var(--spacing-g1)))] md:w-[calc((((100vw-(2*var(--spacing-g2)))-(23*var(--spacing-g1)))/24)*14+(13*var(--spacing-g1)))] lg:w-auto lg:shrink";

export function CardScroller({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-g2 no-scrollbar snap-x snap-mandatory scroll-px-g2 overflow-x-auto lg:mx-0 lg:snap-none lg:scroll-px-0 lg:overflow-visible">
      <div className="flex w-max gap-g1 px-g2 lg:grid lg:w-full lg:grid-cols-3 lg:px-0 xl:grid-cols-4">
        {children}
      </div>
    </div>
  );
}

export function CardScrollerItem({ index, children }: { index: number; children: ReactNode }) {
  return (
    <div className={`${ITEM_WIDTH_CLASS}${index >= 3 ? " lg:hidden xl:block" : ""}`}>
      {children}
    </div>
  );
}
