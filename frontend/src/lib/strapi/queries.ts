import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { StrapiError, strapiFetch } from "./client";
import type { Category, DiscussionDetail, DiscussionQuery, DiscussionSummary, Paginated } from "./types";

export const cacheTags = {
  categories: "categories",
  discussions: "discussions",
  discussion: (slug: string) => `discussion:${slug}`,
};

/*
 * Each public read is split in two:
 * - the exported function waits for a real request (connection()), so `next build`
 *   never needs Strapi to be up and pages are not frozen at build time;
 * - the inner "use cache" function keeps the response on the server, keyed by its
 *   arguments and tagged so Server Actions can expire it right after a write.
 */

export async function getCategories() {
  await connection();
  return fetchCategories();
}

async function fetchCategories() {
  "use cache";
  cacheTag(cacheTags.categories);
  cacheLife("reference");

  const { data } = await strapiFetch<{ data: Category[] }>("/categories");
  return data;
}

export async function getCategory(slug: string) {
  await connection();
  return fetchCategory(slug);
}

async function fetchCategory(slug: string) {
  "use cache";
  cacheTag(cacheTags.categories);
  cacheLife("reference");

  return nullIfNotFound(strapiFetch<{ data: Category }>(`/categories/${encodeURIComponent(slug)}`));
}

export async function getDiscussions(query: DiscussionQuery) {
  await connection();
  return fetchDiscussions(normalize(query));
}

async function fetchDiscussions(query: DiscussionQuery) {
  "use cache";
  cacheTag(cacheTags.discussions);
  cacheLife("feed");

  return strapiFetch<Paginated<DiscussionSummary>>("/discussions", { query: { ...query } });
}

export async function getDiscussion(slug: string) {
  await connection();
  return fetchDiscussion(slug);
}

async function fetchDiscussion(slug: string) {
  "use cache";
  cacheTag(cacheTags.discussion(slug));
  cacheLife("feed");

  return nullIfNotFound(strapiFetch<{ data: DiscussionDetail }>(`/discussions/${encodeURIComponent(slug)}`));
}

async function nullIfNotFound<T>(request: Promise<{ data: T }>) {
  try {
    return (await request).data;
  } catch (error) {
    if (error instanceof StrapiError && error.status === 404) return null;
    throw error;
  }
}

/** Same filters, same cache entry: drop empty values and default ones. */
function normalize(query: DiscussionQuery): DiscussionQuery {
  return Object.fromEntries(
    Object.entries({ ...query, sort: query.sort ?? "recent", page: query.page ?? 1 }).filter(
      ([, value]) => value !== undefined && value !== "",
    ),
  );
}
