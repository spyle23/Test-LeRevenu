import Link from "next/link";
import { cx } from "@/lib/cx";
import { getCategories } from "@/lib/strapi/queries";

const chip = "inline-flex items-center rounded-full border px-[13px] py-1.5 text-[13.5px] font-medium whitespace-nowrap shadow-[0_1px_2px_rgba(0,0,0,0.04)]";
const idle = "border-hairline bg-surface text-ink-2";
const active = "border-brand bg-brand text-white";

/** Phones have no sidebar: spaces become a horizontal strip of chips above the feed. */
export async function CategoryChips({ active: activeSlug }: { active?: string }) {
  const categories = await getCategories();

  return (
    <nav aria-label="Espaces" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 md:hidden">
      <Link href="/" className={cx(chip, activeSlug ? idle : active)} aria-current={activeSlug ? undefined : "page"}>
        Tout
      </Link>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/espaces/${category.slug}`}
          aria-current={activeSlug === category.slug ? "page" : undefined}
          className={cx(chip, activeSlug === category.slug ? active : idle)}
        >
          {category.name}
        </Link>
      ))}
    </nav>
  );
}
