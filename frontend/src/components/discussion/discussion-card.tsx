import Link from "next/link";
import { Clock } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { AuthorTags, Tag, TypeTag } from "@/components/ui/tag";
import { cx } from "@/lib/cx";
import { formatDateTime, timeAgo } from "@/lib/format";
import type { DiscussionSummary } from "@/lib/strapi/types";

const NEW_THRESHOLD_MS = 6 * 60 * 60 * 1000;

/**
 * Reply counter on the left, as in the mock-up: dashed and red while nobody has
 * answered, so members spot at once the threads where they can help.
 */
function ReplyCount({ count }: { count: number }) {
  return (
    <div
      className={cx(
        "hidden h-[58px] w-[62px] flex-col items-center justify-center rounded-control border leading-[1.1] md:flex",
        count ? "border-line text-ink-2" : "border-dashed border-line text-alert",
      )}
    >
      <b className={cx("text-[19px] font-semibold tabular-nums", count ? "text-ink" : "text-alert")}>{count}</b>
      <span className="text-[10.5px] tracking-[0.02em]">réponse{count > 1 ? "s" : ""}</span>
    </div>
  );
}

export function DiscussionCard({ discussion, now = new Date() }: { discussion: DiscussionSummary; now?: Date }) {
  const { author, category } = discussion;
  const isNew = !discussion.replyCount && now.getTime() - new Date(discussion.createdAt).getTime() < NEW_THRESHOLD_MS;
  const href = `/discussions/${discussion.slug}`;

  return (
    <article className="group relative grid grid-cols-1 gap-2 border-t border-line px-4 py-3.5 transition-colors first:border-t-0 hover:bg-[color-mix(in_srgb,var(--surface-2)_70%,var(--surface))] md:grid-cols-[62px_minmax(0,1fr)] md:gap-4 md:px-[18px] md:py-4">
      <ReplyCount count={discussion.replyCount} />

      <div className="min-w-0">
        <div className="mb-[5px] flex flex-wrap items-center gap-2 text-[12.5px]">
          {category && (
            <Link href={`/espaces/${category.slug}`} className="relative z-10 font-semibold text-brand-text hover:text-ink">
              {category.name}
            </Link>
          )}
          <TypeTag type={discussion.type} />
          {isNew && <Tag variant="new">Nouveau</Tag>}
        </div>

        <h3 className="font-display text-[18.5px] leading-[1.3] font-bold tracking-[-0.01em] text-ink group-hover:text-brand-text">
          {/* Stretched link: the whole card is clickable, the space link above stays reachable. */}
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {discussion.title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-2">{discussion.excerpt}</p>

        <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-[13px] text-ink-3">
          <span className="inline-flex items-center gap-[7px]">
            <Avatar author={author} size="xs" />
            <b className="font-semibold text-ink-2">{author?.displayName ?? "Membre supprimé"}</b>
            {author?.isEditorial && <AuthorTags author={author} />}
            <span>
              ·{" "}
              <time dateTime={discussion.createdAt} title={formatDateTime(discussion.createdAt)}>
                {timeAgo(discussion.createdAt, now)}
              </time>
            </span>
          </span>
          <span className="ml-auto inline-flex items-center gap-1 md:hidden">{discussion.replyCount} rép.</span>
          {discussion.replyCount > 0 && (
            <span className="ml-auto hidden items-center gap-1 md:inline-flex" title="Dernière activité">
              <Clock size={15} aria-hidden="true" />
              <time dateTime={discussion.lastActivityAt}>{timeAgo(discussion.lastActivityAt, now)}</time>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function DiscussionList({ discussions, now }: { discussions: DiscussionSummary[]; now?: Date }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-hairline bg-surface shadow-card">
      {discussions.map((discussion) => (
        <DiscussionCard key={discussion.documentId} discussion={discussion} now={now} />
      ))}
    </div>
  );
}
