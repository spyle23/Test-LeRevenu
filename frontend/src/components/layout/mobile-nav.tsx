import Link from "next/link";
import { BookOpen, House, LayoutGrid, Plus, Search } from "lucide-react";
import { NavLink } from "./nav-link";

const item =
  "flex min-w-14 flex-col items-center gap-0.5 px-2 py-1 text-[11px] text-ink-3 aria-[current=page]:font-semibold aria-[current=page]:text-brand-text";

/** Bottom bar on phones, with the central "publish" button from the mock-up. */
export function MobileNav() {
  return (
    <nav
      aria-label="Navigation mobile"
      className="glass fixed inset-x-0 bottom-0 z-45 flex items-center justify-around border-t border-hairline px-2 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom,0px))] md:hidden"
    >
      <NavLink href="/" className={item}>
        <House size={20} aria-hidden="true" />
        Accueil
      </NavLink>
      <NavLink href="/espaces" className={item} matchPrefix="/espaces">
        <LayoutGrid size={20} aria-hidden="true" />
        Espaces
      </NavLink>
      <Link
        href="/publier"
        aria-label="Publier"
        className="btn-primary -mt-[18px] grid size-12 place-items-center rounded-full shadow-[0_6px_16px_color-mix(in_srgb,var(--brand)_40%,transparent)]"
      >
        <Plus size={24} aria-hidden="true" />
      </Link>
      <NavLink href="/recherche" className={item}>
        <Search size={20} aria-hidden="true" />
        Recherche
      </NavLink>
      <NavLink href="/charte" className={item}>
        <BookOpen size={20} aria-hidden="true" />
        Charte
      </NavLink>
    </nav>
  );
}
