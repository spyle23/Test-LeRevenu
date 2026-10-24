import type { ReactNode } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { cx } from "@/lib/cx";

interface PanelProps {
  title: string;
  children: ReactNode;
  size?: "sm" | "md";
  closeHref?: string;
}

export function Panel({ title, children, size = "md", closeHref = "/" }: PanelProps) {
  return (
    <section className={cx("w-full rounded-2xl bg-surface shadow-raised", size === "sm" ? "max-w-[440px]" : "max-w-[640px]")}>
      <div className="flex items-center justify-between px-4 pt-[18px] md:px-[22px]">
        <h1 className="font-display text-[23px] font-bold tracking-[-0.01em]">{title}</h1>
        <Link href={closeHref} aria-label="Fermer" className="grid size-9 place-items-center rounded-[9px] text-ink-2 hover:bg-fill hover:text-ink">
          <X size={18} aria-hidden="true" />
        </Link>
      </div>
      {children}
    </section>
  );
}
