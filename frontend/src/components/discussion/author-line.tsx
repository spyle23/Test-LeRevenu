import { Avatar } from "@/components/ui/avatar";
import { AuthorTags } from "@/components/ui/tag";
import { formatDateTime, timeAgo } from "@/lib/format";
import type { Author } from "@/lib/strapi/types";

interface AuthorLineProps {
  author: Author | null;
  date: string;
  size?: "sm" | "md";
}

export function AuthorLine({ author, date, size = "sm" }: AuthorLineProps) {
  return (
    <div className="flex items-center gap-[11px]">
      <Avatar author={author} size={size} />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-[7px] font-semibold">
          {author?.displayName ?? "Membre supprimé"}
          <AuthorTags author={author} />
        </div>
        <p className="text-[12.5px] text-ink-3">
          <time dateTime={date} title={formatDateTime(date)}>
            {timeAgo(date)}
          </time>
        </p>
      </div>
    </div>
  );
}
