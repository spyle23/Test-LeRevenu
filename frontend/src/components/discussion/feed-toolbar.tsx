import Link from "next/link";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  CircleHelp,
  Inbox,
  type LucideIcon,
  MessageCircle,
  MessagesSquare,
  TrendingUp,
} from "lucide-react";
import { cx } from "@/lib/cx";
import { type FeedState, type FeedView, feedHref } from "@/lib/feed-params";
import type { DiscussionSort } from "@/lib/strapi/types";
import { PendingHint } from "./pending-link";

const VIEWS: Array<[FeedView, LucideIcon, string]> = [
  ["all", MessagesSquare, "Toutes"],
  ["question", CircleHelp, "Questions"],
  ["discussion", MessageCircle, "Discussions"],
  ["unanswered", Inbox, "Sans réponse"],
];

const SORTS: Array<[DiscussionSort, LucideIcon, string]> = [
  ["recent", ArrowDownWideNarrow, "Plus récentes"],
  ["oldest", ArrowUpNarrowWide, "Plus anciennes"],
  ["active", TrendingUp, "Plus actives"],
];

interface FeedToolbarProps {
  state: FeedState;
  basePath: string;
}

/** macOS-style segmented controls; every state is a plain link, so it works without JavaScript. */
export function FeedToolbar({ state, basePath }: FeedToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <nav aria-label="Filtrer les discussions" className="no-scrollbar inline-flex max-w-full gap-0.5 overflow-x-auto rounded-[10px] bg-fill p-[3px]">
        {VIEWS.map(([view, Icon, label]) => (
          <Link
            key={view}
            href={feedHref(basePath, state, { view })}
            scroll={false}
            aria-current={state.view === view ? "page" : undefined}
            className={cx(
              "inline-flex items-center gap-[7px] rounded-lg px-3.5 py-1.5 text-sm font-medium whitespace-nowrap text-ink-2 transition hover:text-ink",
              state.view === view && "bg-surface font-semibold text-ink shadow-[0_1px_3px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.04)]",
            )}
          >
            <Icon size={18} aria-hidden="true" />
            {label}
            <PendingHint />
          </Link>
        ))}
      </nav>

      <nav aria-label="Trier par date de publication" className="inline-flex shrink-0 gap-0.5 rounded-[10px] bg-fill p-[3px]">
        {SORTS.map(([sort, Icon, label]) => (
          <Link
            key={sort}
            href={feedHref(basePath, state, { sort })}
            scroll={false}
            title={label}
            aria-label={label}
            aria-current={state.sort === sort ? "true" : undefined}
            className={cx(
              "grid h-[30px] w-[34px] place-items-center rounded-lg text-ink-3 transition hover:text-ink",
              state.sort === sort && "bg-surface text-ink shadow-[0_1px_3px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.04)]",
            )}
          >
            <Icon size={17} aria-hidden="true" />
          </Link>
        ))}
      </nav>
    </div>
  );
}
