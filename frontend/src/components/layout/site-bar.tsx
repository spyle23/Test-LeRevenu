import { BookOpen, ChevronLeft } from "lucide-react";

export const SITE_URL = "https://www.lerevenu.com";

const SECTIONS = ["Bourse", "Économie", "Placements", "Immobilier", "Impôts", "Succession", "Vie pratique"];

/** Thin link back to lerevenu.com: the community feeds the site audience instead of capturing it. */
export function SiteBar() {
  return (
    <div className="border-b border-hairline bg-surface text-[13px] text-ink-2">
      <div className="wrap flex h-[38px] items-center gap-5">
        <a href={SITE_URL} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 font-semibold whitespace-nowrap text-ink hover:text-brand-text">
          <ChevronLeft size={15} aria-hidden="true" />
          Retour sur lerevenu.com
        </a>
        <nav aria-label="Rubriques de lerevenu.com" className="hidden min-w-0 gap-4 overflow-hidden border-l border-line pl-5 wide:flex">
          {SECTIONS.map((section) => (
            <a key={section} href={SITE_URL} target="_blank" rel="noopener" className="whitespace-nowrap hover:text-brand-text">
              {section}
            </a>
          ))}
        </nav>
        <span className="ml-auto flex items-center gap-4">
          <a href={SITE_URL} target="_blank" rel="noopener" className="hidden items-center gap-1.5 whitespace-nowrap hover:text-brand-text md:inline-flex">
            <BookOpen size={15} aria-hidden="true" />
            Le magazine
          </a>
          <a href={SITE_URL} target="_blank" rel="noopener" className="rounded-full bg-brand px-[11px] py-[3px] font-semibold whitespace-nowrap text-white hover:brightness-[0.93]">
            S’abonner
          </a>
        </span>
      </div>
    </div>
  );
}
