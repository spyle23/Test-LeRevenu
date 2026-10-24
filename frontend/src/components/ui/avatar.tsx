import type { CSSProperties } from "react";
import { cx } from "@/lib/cx";
import { initials } from "@/lib/format";
import type { Author } from "@/lib/strapi/types";

const PALETTE = ["var(--av-1)", "var(--av-2)", "var(--av-3)", "var(--av-4)", "var(--av-5)"];

const SIZES = {
  xs: "size-[22px] text-[9.5px]",
  sm: "size-[30px] text-[11.5px]",
  md: "size-10 text-sm",
  lg: "size-14 text-xl",
};

/** Stable colour per member, so the same person is recognisable across the forum. */
export const avatarColor = (username: string) =>
  PALETTE[[...username].reduce((sum, char) => sum + char.charCodeAt(0), 0) % PALETTE.length];

interface AvatarProps {
  author: Pick<Author, "username" | "displayName" | "isEditorial"> | null;
  size?: keyof typeof SIZES;
  className?: string;
}

export function Avatar({ author, size = "sm", className }: AvatarProps) {
  const editorial = author?.isEditorial;
  const label = editorial ? "R" : author ? initials(author.displayName) : "?";

  return (
    <span
      aria-hidden="true"
      className={cx(
        "avatar inline-grid shrink-0 place-items-center font-semibold tracking-[0.02em] text-white select-none",
        SIZES[size],
        editorial ? "rounded-[28%] font-display font-black" : "rounded-full",
        className,
      )}
      style={{ "--tile": editorial ? "var(--brand)" : author ? avatarColor(author.username) : "var(--ink-3)" } as CSSProperties}
    >
      {size === "xs" ? label[0] : label}
    </span>
  );
}
