import { Suspense } from "react";
import { BookOpen, ExternalLink, House, LayoutGrid } from "lucide-react";
import { SpaceIcon } from "@/components/ui/space-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategories } from "@/lib/strapi/queries";
import { NavLink } from "./nav-link";
import { SITE_URL } from "./site-bar";

export function SideNav() {
  return (
    <nav aria-label="Navigation principale" className="sticky top-[86px] hidden flex-col gap-0.5 md:flex">
      <NavLink href="/">
        <House size={18} aria-hidden="true" />
        Accueil
      </NavLink>
      <NavLink href="/espaces">
        <LayoutGrid size={18} aria-hidden="true" />
        Tous les espaces
      </NavLink>
      <NavLink href="/charte">
        <BookOpen size={18} aria-hidden="true" />
        Charte
      </NavLink>

      <p className="flex items-center gap-1.5 px-2.5 pt-[18px] pb-1.5 text-[11.5px] font-semibold text-ink-3">Espaces</p>
      <Suspense fallback={<SpaceLinksSkeleton />}>
        <SpaceLinks />
      </Suspense>

      <a href={SITE_URL} target="_blank" rel="noopener" className="mt-[18px] flex items-center gap-2 border-t border-hairline px-2.5 pt-3 text-[13px] text-ink-3 hover:text-brand-text">
        Retour sur lerevenu.com
        <ExternalLink size={13} aria-hidden="true" className="ml-auto" />
      </a>
    </nav>
  );
}

async function SpaceLinks() {
  const categories = await getCategories();

  return categories.map((category) => (
    <NavLink key={category.slug} href={`/espaces/${category.slug}`}>
      <SpaceIcon category={category} />
      <span className="truncate">{category.name}</span>
    </NavLink>
  ));
}

function SpaceLinksSkeleton() {
  return Array.from({ length: 8 }, (_, index) => (
    <span key={index} className="flex items-center gap-[11px] px-2.5 py-[7px]">
      <Skeleton className="size-[22px] rounded-[6px]" />
      <Skeleton className="h-3.5 w-28" />
    </span>
  ));
}
