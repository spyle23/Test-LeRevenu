import { Suspense } from "react";
import { DiscussionFeed } from "@/components/discussion/discussion-feed";
import { CategoryChips } from "@/components/home/category-chips";
import { QuickComposer } from "@/components/home/quick-composer";
import { AccountCard, ActiveDiscussions, CharterCard, JoinCard } from "@/components/home/sidebar-cards";
import { Welcome } from "@/components/home/welcome";
import { PageAside, PageMain } from "@/components/layout/page-columns";
import { CardSkeleton, FeedSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function HomePage({ searchParams }: PageProps<"/">) {
  return (
    <>
      <PageMain>
        <Suspense fallback={<Skeleton className="h-[196px] rounded-[18px]" />}>
          <Welcome />
        </Suspense>
        <QuickComposer />
        <Suspense fallback={null}>
          <CategoryChips />
        </Suspense>
        <Suspense fallback={<FeedSkeleton />}>
          <DiscussionFeed searchParams={searchParams} basePath="/" />
        </Suspense>
      </PageMain>

      <PageAside label="À la une de la communauté">
        <Suspense fallback={<JoinCard />}>
          <AccountCard />
        </Suspense>
        <Suspense fallback={<CardSkeleton lines={5} />}>
          <ActiveDiscussions />
        </Suspense>
        <CharterCard />
      </PageAside>
    </>
  );
}
