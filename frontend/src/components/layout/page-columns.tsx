import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/*
 * The community layout is a three-column grid (spaces | feed | widgets). Pages only
 * render these two slots; below 1184px the widgets move under the feed, below 768px
 * everything stacks and the sidebar gives way to the bottom bar.
 */

export function PageMain({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <main className={cx("flex min-w-0 flex-col gap-[18px]", wide && "wide:col-span-2")}>
      {children}
    </main>
  );
}

export function PageAside({ children, label }: { children: ReactNode; label: string }) {
  return (
    <aside aria-label={label} className="flex min-w-0 flex-col gap-[18px] md:col-start-2 wide:col-start-3 wide:row-start-1">
      {children}
    </aside>
  );
}
