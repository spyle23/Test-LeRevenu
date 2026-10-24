import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { DiscussionFeed } from "@/components/discussion/discussion-feed";
import { CategoryChips } from "@/components/home/category-chips";
import { AccountCard, CharterCard, JoinCard } from "@/components/home/sidebar-cards";
import { PageAside, PageMain } from "@/components/layout/page-columns";
import { FeedSkeleton, Skeleton } from "@/components/ui/skeleton";
import { SpaceIcon } from "@/components/ui/space-icon";
import { plural } from "@/lib/format";
import { getCategory } from "@/lib/strapi/queries";

type Params = PageProps<"/espaces/[slug]">["params"];

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const category = await getCategory((await params).slug);
  return category ? { title: category.name, description: category.description ?? undefined } : { title: "Espace introuvable" };
}

export default function SpacePage({ params, searchParams }: PageProps<"/espaces/[slug]">) {
  const slug = params.then((value) => value.slug);

  return (
    <>
      <PageMain>
        <Suspense fallback={<Skeleton className="h-[132px] rounded-card" />}>
          <SpaceHeader params={params} />
        </Suspense>
        <Suspense fallback={null}>
          <ActiveChips params={params} />
        </Suspense>
        <Suspense fallback={<FeedSkeleton />}>
          <DiscussionFeed searchParams={searchParams} category={slug} />
        </Suspense>
      </PageMain>
      <PageAside label="À propos de cet espace">
        <Suspense fallback={<JoinCard />}>
          <AccountCard />
        </Suspense>
        <CharterCard />
      </PageAside>
    </>
  );
}

async function SpaceHeader({ params }: { params: Params }) {
  const category = await getCategory((await params).slug);
  if (!category) notFound();

  return (
    <section className="flex flex-wrap items-center gap-[18px] rounded-card border border-hairline bg-surface p-[22px] shadow-card">
      <SpaceIcon category={category} size={56} />
      <div className="min-w-[220px] flex-1">
        <h1 className="font-display text-[28px] font-bold tracking-[-0.01em]">{category.name}</h1>
        {category.description && <p className="mt-1 max-w-[60ch] text-ink-2">{category.description}</p>}
        <p className="mt-2 text-[13px] text-ink-3">{plural(category.discussionCount, "discussion")}</p>
      </div>
      <Link href={`/publier?espace=${category.slug}`} className="btn btn-primary">
        <Plus size={18} aria-hidden="true" />
        Publier ici
      </Link>
    </section>
  );
}

async function ActiveChips({ params }: { params: Params }) {
  return <CategoryChips active={(await params).slug} />;
}
