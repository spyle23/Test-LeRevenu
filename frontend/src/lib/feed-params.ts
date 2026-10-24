import type { DiscussionQuery, DiscussionSort } from "@/lib/strapi/types";

/** Feed state lives in the URL: shareable, back-button friendly, rendered on the server. */

export const FEED_VIEWS = ["all", "question", "discussion", "unanswered"] as const;
export type FeedView = (typeof FEED_VIEWS)[number];

const SORTS: DiscussionSort[] = ["recent", "oldest", "active"];

export const PAGE_SIZE = 10;

type RawParams = Record<string, string | string[] | undefined>;

export interface FeedState {
  view: FeedView;
  sort: DiscussionSort;
  page: number;
  q: string;
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

export function parseFeedParams(params: RawParams): FeedState {
  const view = first(params.vue) as FeedView;
  const sort = first(params.tri) as DiscussionSort;
  const page = Number.parseInt(first(params.page), 10);

  return {
    view: FEED_VIEWS.includes(view) ? view : "all",
    sort: SORTS.includes(sort) ? sort : "recent",
    page: Number.isInteger(page) && page > 0 ? Math.min(page, 1000) : 1,
    q: first(params.q).trim().slice(0, 100),
  };
}

export function toDiscussionQuery(state: FeedState, category?: string): DiscussionQuery {
  return {
    category,
    q: state.q || undefined,
    sort: state.sort,
    page: state.page,
    pageSize: PAGE_SIZE,
    ...(state.view === "question" || state.view === "discussion" ? { type: state.view } : {}),
    ...(state.view === "unanswered" ? { status: "unanswered" as const } : {}),
  };
}

/** Builds a feed URL, dropping default values so canonical URLs stay short. */
export function feedHref(pathname: string, state: FeedState, changes: Partial<FeedState>) {
  const next = { ...state, page: 1, ...changes };
  const params = new URLSearchParams();

  if (next.q) params.set("q", next.q);
  if (next.view !== "all") params.set("vue", next.view);
  if (next.sort !== "recent") params.set("tri", next.sort);
  if (next.page > 1) params.set("page", String(next.page));

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
