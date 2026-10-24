import Link from "next/link";
import { BookOpen, Check, PenLine, TrendingUp } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { getCurrentUser } from "@/lib/auth/session";
import { plural } from "@/lib/format";
import { getDiscussions } from "@/lib/strapi/queries";

const cardTitle = "mb-3 flex items-center gap-2 text-[13px] font-semibold text-ink [&>svg]:text-brand-text";

export function JoinCard() {
  return (
    <section className="card bg-[linear-gradient(180deg,var(--brand-soft),var(--surface)_70%)]">
      <h2 className="mb-1.5 font-display text-[19px] font-bold tracking-[-0.01em]">Rejoignez la communauté</h2>
      <p className="text-sm text-ink-2">Avec votre compte lerevenu.com, gratuitement.</p>
      <ul className="mt-2.5 mb-3.5 flex flex-col gap-1.5 text-sm text-ink-2">
        {["Posez vos questions d’argent à des milliers de lecteurs", "Recevez les réponses de la rédaction", "Aidez les autres membres grâce à votre expérience"].map(
          (benefit) => (
            <li key={benefit} className="flex items-start gap-2">
              <Check size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-brand-text" />
              {benefit}
            </li>
          ),
        )}
      </ul>
      <Link href="/connexion" className="btn btn-primary w-full">
        Rejoindre la communauté
      </Link>
    </section>
  );
}

/** Join pitch for visitors, a shortcut to publish for members. */
export async function AccountCard() {
  const user = await getCurrentUser();
  if (!user) return <JoinCard />;

  return (
    <section className="card">
      <div className="mb-3.5 flex items-center gap-3">
        <Avatar author={user} size="md" />
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold">{user.displayName}</h2>
          <p className="text-[13px] text-ink-3">{user.isEditorial ? "Compte de la rédaction" : user.isSubscriber ? "Abonné au Revenu" : "Membre de la communauté"}</p>
        </div>
      </div>
      <Link href="/publier" className="btn btn-secondary btn-sm w-full">
        <PenLine size={16} aria-hidden="true" />
        Lancer une discussion
      </Link>
    </section>
  );
}

export async function ActiveDiscussions() {
  const { data } = await getDiscussions({ sort: "active", pageSize: 5 });
  if (!data.length) return null;

  return (
    <section className="card">
      <h2 className={cardTitle}>
        <TrendingUp size={18} aria-hidden="true" />
        Les plus actives
      </h2>
      <ol className="flex flex-col">
        {data.map((discussion) => (
          <li key={discussion.documentId} className="border-t border-line py-3 first:border-t-0 first:pt-0 last:pb-0">
            <Link href={`/discussions/${discussion.slug}`} className="group block">
              <b className="text-[14.5px] font-semibold group-hover:text-brand-text">{discussion.title}</b>
              <p className="mt-0.5 text-[13px] text-ink-3">
                {discussion.category?.name} · {plural(discussion.replyCount, "réponse")}
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function CharterCard() {
  return (
    <section className="card border-transparent bg-surface-3">
      <h2 className={cardTitle}>
        <BookOpen size={18} aria-hidden="true" />
        La charte en bref
      </h2>
      <p className="mb-3 text-[13.5px] text-ink-2">
        On partage son expérience, pas de conseil personnalisé ni de sollicitation. Bienveillance de rigueur : aucune
        question n’est bête.
      </p>
      <Link href="/charte" className="btn btn-secondary btn-sm">
        Lire la charte
      </Link>
    </section>
  );
}
