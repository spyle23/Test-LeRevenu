import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageMain } from "@/components/layout/page-columns";
import { Skeleton } from "@/components/ui/skeleton";
import { SpaceIcon } from "@/components/ui/space-icon";
import { plural } from "@/lib/format";
import { getCategories } from "@/lib/strapi/queries";

export const metadata: Metadata = { title: "Tous les espaces" };

export default function SpacesPage() {
  return (
    <PageMain wide>
      <header>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.01em]">Tous les espaces</h1>
        <p className="mt-1.5 max-w-[62ch] text-ink-2">Des espaces thématiques, calqués sur les grandes rubriques du Revenu.</p>
      </header>
      <Suspense fallback={<SpacesSkeleton />}>
        <SpacesGrid />
      </Suspense>
    </PageMain>
  );
}

async function SpacesGrid() {
  const categories = await getCategories();

  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3.5">
      {categories.map((category) => (
        <li key={category.slug}>
          <Link
            href={`/espaces/${category.slug}`}
            className="flex h-full flex-col gap-1.5 rounded-card border border-hairline bg-surface p-[18px] shadow-card transition hover:-translate-y-0.5 hover:shadow-raised"
          >
            <span className="mb-1.5">
              <SpaceIcon category={category} size={40} />
            </span>
            <h2 className="font-display text-lg font-bold tracking-[-0.01em]">{category.name}</h2>
            <p className="flex-1 text-[13.5px] text-ink-2">{category.description}</p>
            <small className="text-[12.5px] text-ink-3">{plural(category.discussionCount, "discussion")}</small>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SpacesSkeleton() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3.5">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-[170px] rounded-card" />
      ))}
    </div>
  );
}
