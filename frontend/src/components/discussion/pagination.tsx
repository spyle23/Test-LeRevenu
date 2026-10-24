import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type FeedState, feedHref } from "@/lib/feed-params";
import { plural } from "@/lib/format";
import type { Pagination as PaginationMeta } from "@/lib/strapi/types";

interface PaginationProps {
  meta: PaginationMeta;
  state: FeedState;
  basePath: string;
}

export function Pagination({ meta, state, basePath }: PaginationProps) {
  if (meta.pageCount <= 1) return null;

  const hasPrevious = meta.page > 1;
  const hasNext = meta.page < meta.pageCount;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3">
      {hasPrevious ? (
        <Link href={feedHref(basePath, state, { page: meta.page - 1 })} rel="prev" className="btn btn-secondary">
          <ChevronLeft size={18} aria-hidden="true" />
          Précédentes
        </Link>
      ) : (
        <span />
      )}
      <p className="text-center text-[13px] text-ink-3">
        Page <b className="text-ink-2 tabular-nums">{meta.page}</b> sur {meta.pageCount}
        <span className="hidden sm:inline"> · {plural(meta.total, "discussion")}</span>
      </p>
      {hasNext ? (
        <Link href={feedHref(basePath, state, { page: meta.page + 1 })} rel="next" className="btn btn-secondary">
          Suivantes
          <ChevronRight size={18} aria-hidden="true" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
