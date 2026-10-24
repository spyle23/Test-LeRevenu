import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DiscussionForm } from "@/components/discussion/discussion-form";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth/session";
import { getCategories } from "@/lib/strapi/queries";
import { TITLE_MAX_LENGTH } from "@/lib/validation";

export const metadata: Metadata = { title: "Nouvelle publication", robots: { index: false } };

export default function PublishPage({ searchParams }: PageProps<"/publier">) {
  return (
    <Panel title="Nouvelle publication">
      <Suspense fallback={<FormSkeleton />}>
        <Composer searchParams={searchParams} />
      </Suspense>
    </Panel>
  );
}

async function Composer({ searchParams }: { searchParams: PageProps<"/publier">["searchParams"] }) {
  const params = await searchParams;
  const param = (name: string) => (typeof params[name] === "string" ? params[name] : undefined);
  const space = param("espace");

  // The UI gate is for comfort; Strapi refuses anonymous writes on its own.
  const user = await getCurrentUser();
  if (!user) {
    const back = new URLSearchParams();
    for (const name of ["type", "espace", "titre"]) {
      const value = param(name);
      if (value) back.set(name, value);
    }
    redirect(`/connexion?redirect=${encodeURIComponent(back.size ? `/publier?${back}` : "/publier")}`);
  }

  const categories = await getCategories();

  return (
    <DiscussionForm
      categories={categories}
      defaultType={params.type === "discussion" ? "discussion" : "question"}
      defaultTitle={param("titre")?.slice(0, TITLE_MAX_LENGTH)}
      defaultCategory={categories.some((category) => category.slug === space) ? space : undefined}
    />
  );
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-[22px] md:px-[22px]" role="status" aria-label="Chargement du formulaire">
      <div className="grid gap-2.5 sm:grid-cols-2">
        <Skeleton className="h-[92px] rounded-xl" />
        <Skeleton className="h-[92px] rounded-xl" />
      </div>
      <Skeleton className="h-10 rounded-control" />
      <Skeleton className="h-10 rounded-control" />
      <Skeleton className="h-36 rounded-control" />
    </div>
  );
}
