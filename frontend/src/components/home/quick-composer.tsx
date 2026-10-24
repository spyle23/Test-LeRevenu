import Link from "next/link";
import { CircleHelp, MessageCircle, User } from "lucide-react";

/** A single, always visible entry point for publishing, as in the mock-up. */
export function QuickComposer({ category }: { category?: string }) {
  const href = (type: string) => `/publier?type=${type}${category ? `&espace=${category}` : ""}`;

  return (
    <div className="flex w-full items-center gap-3 rounded-card border border-hairline bg-surface px-3 py-2.5 shadow-card">
      <span aria-hidden="true" className="avatar grid size-10 shrink-0 place-items-center rounded-full text-white [--tile:var(--ink-3)]">
        <User size={18} />
      </span>
      <Link href={href("question")} className="min-w-0 flex-1 truncate rounded-[10px] bg-fill px-3.5 py-[9px] text-ink-3 hover:text-ink-2">
        Posez votre question à la communauté…
      </Link>
      <div className="hidden gap-1 md:flex">
        <Link href={href("question")} className="inline-flex items-center gap-1.5 rounded-control px-2.5 py-[7px] text-[13.5px] font-medium text-ink-2 hover:bg-fill">
          <CircleHelp size={18} aria-hidden="true" />
          Question
        </Link>
        <Link href={href("discussion")} className="inline-flex items-center gap-1.5 rounded-control px-2.5 py-[7px] text-[13.5px] font-medium text-ink-2 hover:bg-fill">
          <MessageCircle size={18} aria-hidden="true" />
          Discussion
        </Link>
      </div>
    </div>
  );
}
