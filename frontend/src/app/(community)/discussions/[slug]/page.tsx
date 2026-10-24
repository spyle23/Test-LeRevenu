import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";
import { AuthorLine } from "@/components/discussion/author-line";
import { CopyLinkButton } from "@/components/discussion/copy-link-button";
import { ReplyCard } from "@/components/discussion/reply-card";
import { ReplyForm } from "@/components/discussion/reply-form";
import { RichText } from "@/components/discussion/rich-text";
import { PageAside, PageMain } from "@/components/layout/page-columns";
import { Avatar } from "@/components/ui/avatar";
import { CardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { SpaceIcon } from "@/components/ui/space-icon";
import { TypeTag } from "@/components/ui/tag";
import { getCurrentUser } from "@/lib/auth/session";
import { formatDate, plural, timeAgo } from "@/lib/format";
import { getDiscussion } from "@/lib/strapi/queries";
import type { DiscussionDetail } from "@/lib/strapi/types";

type Params = PageProps<"/discussions/[slug]">["params"];

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const discussion = await getDiscussion((await params).slug);
  if (!discussion) return { title: "Discussion introuvable" };

  return {
    title: discussion.title,
    description: discussion.content.replace(/\*\*/g, "").replace(/\s+/g, " ").slice(0, 160),
    alternates: { canonical: `/discussions/${discussion.slug}` },
  };
}

export default function DiscussionPage({ params }: PageProps<"/discussions/[slug]">) {
  return (
    <>
      <PageMain>
        <Suspense fallback={<ThreadSkeleton />}>
          <Thread params={params} />
        </Suspense>
      </PageMain>
      <PageAside label="À propos de cette discussion">
        <Suspense fallback={<CardSkeleton lines={4} />}>
          <ThreadFacts params={params} />
        </Suspense>
      </PageAside>
    </>
  );
}

async function loadDiscussion(params: Params) {
  const discussion = await getDiscussion((await params).slug);
  if (!discussion) notFound();
  return discussion;
}

async function Thread({ params }: { params: Params }) {
  const discussion = await loadDiscussion(params);
  const { category, replies } = discussion;

  return (
    <>
      <nav aria-label="Fil d’Ariane" className="flex flex-wrap items-center gap-1.5 text-[13.5px] text-ink-3">
        <Link href="/" className="hover:text-ink">
          Accueil
        </Link>
        {category && (
          <>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href={`/espaces/${category.slug}`} className="hover:text-ink">
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <article className="rounded-card border border-hairline bg-surface px-4 py-4 shadow-card md:px-[22px] md:py-5">
        <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
          {category && (
            <Link href={`/espaces/${category.slug}`} className="font-semibold text-brand-text hover:text-ink">
              {category.name}
            </Link>
          )}
          <TypeTag type={discussion.type} />
        </div>
        <h1 className="mt-1.5 mb-3.5 font-display text-2xl leading-[1.2] font-bold tracking-[-0.01em] md:text-[29px]">
          {discussion.title}
        </h1>
        <AuthorLine author={discussion.author} date={discussion.createdAt} size="md" />
        <RichText text={discussion.content} className="mt-3.5" />
        <div className="mt-4 flex flex-wrap items-center gap-1">
          <CopyLinkButton />
        </div>
      </article>

      <section aria-labelledby="replies-title" className="flex flex-col gap-3">
        <h2 id="replies-title" className="font-display text-[21px] font-bold tracking-[-0.01em]">
          {replies.length ? plural(replies.length, "réponse") : "Aucune réponse pour l’instant"}
        </h2>
        {replies.map((reply) => (
          <ReplyCard key={reply.documentId} reply={reply} />
        ))}
        <Suspense fallback={<Skeleton className="h-[190px] rounded-card" />}>
          <ReplySlot discussion={discussion} />
        </Suspense>
      </section>
    </>
  );
}

async function ReplySlot({ discussion }: { discussion: DiscussionDetail }) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-2.5 rounded-card border border-hairline bg-surface px-5 py-[26px] text-center shadow-card">
        <h3 className="font-display text-[19px] font-bold tracking-[-0.01em]">Vous avez un avis ou une expérience à partager ?</h3>
        <p className="text-ink-3">Rejoignez la communauté avec votre compte lerevenu.com.</p>
        <Link href={`/connexion?redirect=${encodeURIComponent(`/discussions/${discussion.slug}#repondre`)}`} className="btn btn-primary">
          Se connecter pour répondre
        </Link>
      </div>
    );
  }

  const placeholder =
    discussion.type === "question"
      ? `Partagez votre expérience pour aider ${discussion.author?.displayName ?? "ce membre"}…`
      : "Votre avis sur la question…";

  return <ReplyForm slug={discussion.slug} user={user} placeholder={placeholder} />;
}

async function ThreadFacts({ params }: { params: Params }) {
  const discussion = await loadDiscussion(params);
  const { category } = discussion;
  const participants = [
    ...new Map(
      [discussion.author, ...discussion.replies.map((reply) => reply.author)]
        .filter((author) => author !== null)
        .map((author) => [author.username, author]),
    ).values(),
  ];

  return (
    <>
      {discussion.replyCount === 0 && (
        <Suspense fallback={null}>
          <FirstReplyInvite discussion={discussion} />
        </Suspense>
      )}

      <section className="card">
        <h2 className="mb-3 text-[13px] font-semibold">Cette discussion</h2>
        <dl className="grid grid-cols-2 gap-x-2.5 gap-y-3">
          <Fact label="Réponses" value={String(discussion.replyCount)} />
          <Fact label="Publiée le" value={formatDate(discussion.createdAt)} small />
          <Fact label="Dernière activité" value={timeAgo(discussion.lastActivityAt)} small />
          <Fact label="Participants" value={String(participants.length)} />
        </dl>
        <div className="mt-3.5 flex">
          {participants.slice(0, 8).map((author) => (
            <Avatar key={author.username} author={author} className="-ml-[7px] border-2 border-surface first:ml-0" />
          ))}
        </div>
      </section>

      {category && (
        <section className="card">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-[-0.01em]">
            <SpaceIcon category={category} />
            {category.name}
          </h2>
          {category.description && <p className="mt-1.5 mb-3 text-sm text-ink-2">{category.description}</p>}
          <Link href={`/publier?espace=${category.slug}`} className="btn btn-secondary btn-sm">
            <Plus size={16} aria-hidden="true" />
            Publier dans cet espace
          </Link>
        </section>
      )}
    </>
  );
}

/** Nudges readers towards unanswered threads, but not the member who asked. */
async function FirstReplyInvite({ discussion }: { discussion: DiscussionDetail }) {
  const user = await getCurrentUser();
  if (user && user.username === discussion.author?.username) return null;

  const replyAnchor = `/discussions/${discussion.slug}#repondre`;
  return (
    <section className="card border-transparent bg-surface-3">
      <h2 className="mb-1 text-[15.5px] font-semibold">Soyez le premier à aider {discussion.author?.displayName ?? "ce membre"}</h2>
      <p className="mb-3 text-[13.5px] text-ink-2">Votre expérience compte, même partielle.</p>
      <Link href={user ? replyAnchor : `/connexion?redirect=${encodeURIComponent(replyAnchor)}`} className="btn btn-primary btn-sm">
        Répondre
      </Link>
    </section>
  );
}

function Fact({ label, value, small = false }: { label: string; value: string; small?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-ink-3">{label}</dt>
      <dd className={small ? "text-[13.5px] font-semibold" : "text-base font-semibold tabular-nums"}>{value}</dd>
    </div>
  );
}

function ThreadSkeleton() {
  return (
    <div className="flex flex-col gap-[18px]" role="status" aria-label="Chargement de la discussion">
      <Skeleton className="h-4 w-48" />
      <div className="card flex flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-4/5" />
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
      </div>
      <Skeleton className="h-28 rounded-card" />
    </div>
  );
}
