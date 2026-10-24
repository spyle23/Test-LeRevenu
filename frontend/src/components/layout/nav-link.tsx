"use client";

import { type ReactNode, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  /** Highlight the link for every path under this prefix. */
  matchPrefix?: string;
}

const base =
  "flex items-center gap-[11px] rounded-control px-2.5 py-[7px] text-sm font-medium text-ink-2 hover:bg-fill hover:text-ink aria-[current=page]:bg-fill-2 aria-[current=page]:font-semibold aria-[current=page]:text-ink [&[aria-current=page]>svg]:text-brand-text";

/**
 * The pathname of a dynamic route is only known at request time, so the highlighted
 * state streams in; the plain link is part of the prerendered shell.
 */
export function NavLink(props: NavLinkProps) {
  return (
    <Suspense fallback={<NavAnchor {...props} active={false} />}>
      <ActiveNavLink {...props} />
    </Suspense>
  );
}

function ActiveNavLink({ matchPrefix, ...props }: NavLinkProps) {
  const pathname = usePathname();
  return <NavAnchor {...props} active={matchPrefix ? pathname.startsWith(matchPrefix) : pathname === props.href} />;
}

function NavAnchor({ href, children, className, active }: Omit<NavLinkProps, "matchPrefix"> & { active: boolean }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={className ?? base}>
      {children}
    </Link>
  );
}
