import Link from "next/link";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { type FeedState, feedHref, parseFeedParams, toDiscussionQuery } from "@/lib/feed-params";
import { getDiscussions } from "@/lib/strapi/queries";
import { DiscussionList } from "./discussion-card";
import { FeedToolbar } from "./feed-toolbar";
import { Pagination } from "./pagination";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

interface FeedProps {
  searchParams: SearchParams;
  /** Defaults to the space page when the feed is restricted to a space. */
  basePath?: string;
  /** Restricts the feed to one space. */
  category?: Promise<string> | string;
}

/** Server Component: reads the URL, fetches one page from Strapi, renders it. */
export async function DiscussionFeed({ searchParams, basePath: path, category }: FeedProps) {
  const [params, categorySlug] = await Promise.all([searchParams, category]);
  const basePath = path ?? (categorySlug ? `/espaces/${categorySlug}` : "/");
  const state = parseFeedParams(params);
  const { data, meta } = await getDiscussions(toDiscussionQuery(state, categorySlug));

  return (
    <section aria-label="Discussions" className="flex flex-col gap-[18px]">
      <FeedToolbar state={state} basePath={basePath} />
      {data.length ? (
        <DiscussionList discussions={data} />
      ) : (
        <div className="rounded-card border border-hairline bg-surface shadow-card">
          <FeedEmpty state={state} basePath={basePath} category={categorySlug} outOfRange={meta.pagination.total > 0} />
        </div>
      )}
      <Pagination meta={meta.pagination} state={state} basePath={basePath} />
    </section>
  );
}

function FeedEmpty({ state, basePath, category, outOfRange }: { state: FeedState; basePath: string; category?: string; outOfRange: boolean }) {
  if (outOfRange) {
    return (
      <EmptyState title="Cette page n’existe plus" action={<Link className="btn btn-secondary" href={feedHref(basePath, state, { page: 1 })}>Revenir à la première page</Link>}>
        Le fil a changé depuis votre dernière visite.
      </EmptyState>
    );
  }

  const publish = (
    <Link className="btn btn-primary" href={category ? `/publier?espace=${category}` : "/publier"}>
      <Plus size={18} aria-hidden="true" />
      Publier
    </Link>
  );

  if (state.q) {
    const ask = (
      <Link className="btn btn-primary" href={`/publier?titre=${encodeURIComponent(state.q)}`}>
        <Plus size={18} aria-hidden="true" />
        Poser cette question
      </Link>
    );
    return (
      <EmptyState title="Aucune discussion trouvée" action={ask}>
        Posez la question à la communauté : quelqu’un a sûrement vécu la même situation.
      </EmptyState>
    );
  }
  if (state.view === "unanswered") {
    return (
      <EmptyState title="Toutes les questions ont une réponse">
        Bravo à la communauté ! Revenez plus tard ou posez à votre tour une question.
      </EmptyState>
    );
  }
  return (
    <EmptyState title="Rien ici pour l’instant" action={publish}>
      Lancez la première discussion de cet espace.
    </EmptyState>
  );
}
