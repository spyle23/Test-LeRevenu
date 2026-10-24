import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { formatNumber } from "@/lib/format";
import { getCategories, getDiscussions } from "@/lib/strapi/queries";

/** Visitors get the pitch; members get straight to the feed. */
export async function Welcome() {
  const [user, categories, unanswered] = await Promise.all([
    getCurrentUser(),
    getCategories(),
    getDiscussions({ status: "unanswered", pageSize: 1 }),
  ]);

  if (user) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[26px] font-bold tracking-[-0.01em]">Bonjour {user.displayName}</h1>
      </div>
    );
  }

  const discussions = categories.reduce((total, category) => total + category.discussionCount, 0);

  return (
    <section className="hero relative grid items-end gap-x-6 gap-y-[18px] overflow-hidden rounded-2xl px-5 pt-[22px] pb-6 text-white shadow-raised md:grid-cols-[minmax(0,1fr)_auto] md:rounded-[18px] md:px-7 md:pt-7">
      <div>
        <h1 className="max-w-[22ch] font-display text-[25px] leading-[1.12] font-bold tracking-[-0.01em] md:text-[32px]">
          La communauté des lecteurs du Revenu
        </h1>
        <p className="mt-2 max-w-[52ch] text-white/78">
          Posez vos questions d’argent, partagez vos expériences et échangez avec la rédaction. Bourse, épargne,
          impôts, retraite, transmission.
        </p>
        <dl className="mt-4 flex flex-wrap gap-[22px] text-[13px] opacity-90">
          <Stat value={formatNumber(discussions)} label="discussions" />
          <Stat value={formatNumber(categories.length)} label="espaces thématiques" />
          <Stat value={formatNumber(unanswered.meta.pagination.total)} label="sujets attendent une réponse" />
        </dl>
      </div>
      <div className="flex flex-row flex-wrap gap-2 md:flex-col">
        <Link href="/connexion" className="btn btn-primary hover:brightness-[1.08]">
          Rejoindre gratuitement
        </Link>
        <Link href="/espaces" className="btn border-white/18 bg-white/14 text-white backdrop-blur-[10px] hover:bg-white/24">
          Explorer les espaces
        </Link>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt>{label}</dt>
      <dd className="text-xl font-bold text-white tabular-nums">{value}</dd>
    </div>
  );
}
