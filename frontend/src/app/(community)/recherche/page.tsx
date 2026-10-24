import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { DiscussionFeed } from "@/components/discussion/discussion-feed";
import { PageMain } from "@/components/layout/page-columns";
import { FeedSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Rechercher", robots: { index: false } };

const SUGGESTIONS = ["PEA", "assurance-vie", "donation", "SCPI", "PER", "frais réels"];

type SearchParams = PageProps<"/recherche">["searchParams"];

export default function SearchPage({ searchParams }: PageProps<"/recherche">) {
  return (
    <PageMain wide>
      <header>
        <h1 className="font-display text-[28px] font-bold tracking-[-0.01em]">Rechercher</h1>
      </header>
      <Suspense fallback={<SearchForm />}>
        <SearchFormWithQuery searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<FeedSkeleton rows={3} />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </PageMain>
  );
}

function SearchForm({ query = "" }: { query?: string }) {
  return (
    <form action="/recherche" role="search" className="flex h-11 items-center gap-2 rounded-[10px] border border-line bg-surface px-3 text-ink-3 focus-within:border-brand focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_25%,transparent)]">
      <Search size={18} aria-hidden="true" />
      <label htmlFor="search-q" className="sr-only">
        Mots-clés
      </label>
      <input id="search-q" name="q" type="search" defaultValue={query} placeholder="PEA, donation, SCPI…" autoComplete="off" className="h-full min-w-0 flex-1 bg-transparent text-ink outline-none" />
      <button type="submit" className="btn btn-primary btn-sm">
        Rechercher
      </button>
    </form>
  );
}

async function SearchFormWithQuery({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;
  return <SearchForm key={String(q ?? "")} query={typeof q === "string" ? q : ""} />;
}

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;

  if (typeof q !== "string" || !q.trim()) {
    return (
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <Link key={suggestion} href={`/recherche?q=${encodeURIComponent(suggestion)}`} className="rounded-full border border-hairline bg-surface px-[13px] py-1.5 text-[13.5px] font-medium text-ink-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:text-ink">
            {suggestion}
          </Link>
        ))}
      </div>
    );
  }

  return <DiscussionFeed searchParams={searchParams} basePath="/recherche" />;
}
