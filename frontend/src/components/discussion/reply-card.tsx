import { Check } from "lucide-react";
import { cx } from "@/lib/cx";
import type { Reply } from "@/lib/strapi/types";
import { AuthorLine } from "./author-line";
import { RichText } from "./rich-text";

/** Editorial answers get their own background: expert voices stand out in the thread. */
export function ReplyCard({ reply }: { reply: Reply }) {
  const editorial = reply.author?.isEditorial;

  return (
    <article
      id={`reponse-${reply.documentId}`}
      className={cx(
        "scroll-mt-[90px] rounded-card border px-4 py-4 shadow-card md:px-5",
        editorial ? "border-[color-mix(in_srgb,var(--redac)_35%,var(--line))] bg-redac-soft" : "border-hairline bg-surface",
      )}
    >
      {editorial && (
        <p className="mb-2.5 inline-flex items-center gap-[5px] text-[12.5px] font-semibold text-redac">
          <Check size={14} aria-hidden="true" />
          Réponse de la rédaction
        </p>
      )}
      <AuthorLine author={reply.author} date={reply.createdAt} />
      <RichText text={reply.content} className="mt-2.5 text-[15px]" />
    </article>
  );
}
