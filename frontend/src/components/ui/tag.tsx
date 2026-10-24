import type { ReactNode } from "react";
import { Check, CircleHelp } from "lucide-react";
import { cx } from "@/lib/cx";
import type { Author, DiscussionType } from "@/lib/strapi/types";

const VARIANTS = {
  neutral: "bg-fill text-ink-2",
  redac: "bg-redac text-surface",
  sub: "bg-sub text-sub-ink",
  new: "bg-brand text-white",
  ok: "bg-ok-soft text-ok",
};

interface TagProps {
  variant?: keyof typeof VARIANTS;
  children: ReactNode;
}

export function Tag({ variant = "neutral", children }: TagProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2 py-px text-[11.5px] leading-[1.5] font-semibold whitespace-nowrap [&_svg]:size-3",
        VARIANTS[variant],
      )}
    >
      {children}
    </span>
  );
}

export function TypeTag({ type }: { type: DiscussionType }) {
  return type === "question" ? (
    <Tag>
      <CircleHelp aria-hidden="true" />
      Question
    </Tag>
  ) : (
    <Tag>Discussion</Tag>
  );
}

export function AuthorTags({ author }: { author: Author | null }) {
  if (!author) return null;
  if (author.isEditorial) {
    return (
      <Tag variant="redac">
        <Check aria-hidden="true" />
        Rédaction
      </Tag>
    );
  }
  return author.isSubscriber ? <Tag variant="sub">Abonné</Tag> : null;
}
