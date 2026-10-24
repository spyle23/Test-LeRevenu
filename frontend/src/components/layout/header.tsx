import { Suspense } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { getCurrentUser } from "@/lib/auth/session";
import { Skeleton } from "@/components/ui/skeleton";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";

export function Header() {
  return (
    <header className="glass sticky top-0 z-40 border-b border-hairline">
      <div className="wrap flex h-[62px] items-center gap-5">
        <Link href="/" aria-label="Le Revenu, accueil de la communauté" className="flex shrink-0 flex-col items-start gap-1 md:flex-row md:items-center md:gap-2.5">
          <Logo className="text-[19px] md:text-[22px]" />
          <span aria-hidden="true" className="hidden h-5 w-px bg-line-strong md:block" />
          <span className="text-xs font-semibold text-ink-2 md:text-[15px]">Communauté</span>
        </Link>

        <form action="/recherche" role="search" className="group hidden h-9 max-w-[420px] flex-1 items-center gap-2 rounded-[10px] border border-transparent bg-fill px-3 text-sm text-ink-3 transition focus-within:border-brand focus-within:bg-surface focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_25%,transparent)] nav:flex">
          <Search size={18} aria-hidden="true" />
          <label htmlFor="header-search" className="sr-only">
            Rechercher une discussion
          </label>
          <input id="header-search" name="q" type="search" placeholder="Rechercher une discussion, un sujet…" autoComplete="off" className="h-full min-w-0 flex-1 bg-transparent text-ink outline-none" />
        </form>

        <div className="ml-auto flex items-center gap-2.5">
          <Link href="/recherche" aria-label="Rechercher" className="grid size-9 place-items-center rounded-[9px] text-ink-2 hover:bg-fill hover:text-ink nav:hidden">
            <Search size={18} aria-hidden="true" />
          </Link>
          <Suspense fallback={<Skeleton className="h-9 w-40 rounded-[10px]" />}>
            <HeaderActions />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

async function HeaderActions() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <>
        <Link href="/connexion" className="btn btn-quiet">
          Se connecter
        </Link>
        <Link href="/connexion" className="btn btn-primary hidden nav:inline-flex">
          Rejoindre
        </Link>
      </>
    );
  }

  return (
    <>
      <Link href="/publier" className="btn btn-primary hidden nav:inline-flex">
        <Plus size={18} aria-hidden="true" />
        Publier
      </Link>
      <UserMenu user={user} />
    </>
  );
}
