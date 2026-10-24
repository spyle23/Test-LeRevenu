/** Shapes returned by the community API (see backend/src/api). */

export type DiscussionType = "question" | "discussion";
export type DiscussionSort = "recent" | "oldest" | "active";

export interface Author {
  username: string;
  displayName: string;
  isEditorial: boolean;
  isSubscriber: boolean;
}

export interface CategoryRef {
  documentId: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
}

export interface Category extends CategoryRef {
  description: string | null;
  discussionCount: number;
}

export interface DiscussionSummary {
  documentId: string;
  slug: string;
  title: string;
  excerpt: string;
  type: DiscussionType;
  replyCount: number;
  createdAt: string;
  lastActivityAt: string;
  author: Author | null;
  category: CategoryRef | null;
}

export interface Reply {
  documentId: string;
  content: string;
  createdAt: string;
  author: Author | null;
}

export interface DiscussionDetail extends Omit<DiscussionSummary, "excerpt" | "category"> {
  content: string;
  category: (CategoryRef & { description: string | null }) | null;
  replies: Reply[];
}

export interface Pagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface Paginated<T> {
  data: T[];
  meta: { pagination: Pagination };
}

export interface DiscussionQuery {
  category?: string;
  type?: DiscussionType;
  status?: "unanswered";
  q?: string;
  sort?: DiscussionSort;
  page?: number;
  pageSize?: number;
}

export interface CurrentUser {
  id: number;
  username: string;
  displayName: string;
  isEditorial: boolean;
  isSubscriber: boolean;
}
