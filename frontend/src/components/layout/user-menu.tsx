"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { BookOpen, LogOut, Newspaper, PenLine } from "lucide-react";
import { logout } from "@/actions/auth";
import { Avatar } from "@/components/ui/avatar";
import type { CurrentUser } from "@/lib/strapi/types";
import { SITE_URL } from "./site-bar";

const itemClass =
  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-[7px] text-left text-sm hover:bg-brand hover:text-white focus-visible:bg-brand focus-visible:text-white focus-visible:outline-none";

export function UserMenu({ user }: { user: CurrentUser }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-hairline bg-surface py-[3px] pr-2.5 pl-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-surface-2"
      >
        <Avatar author={user} />
        <span className="max-w-[12ch] truncate text-[13px] font-semibold">{user.displayName}</span>
        <span className="sr-only">Mon compte</span>
      </button>

      {open && (
        <div id={menuId} className="absolute top-[calc(100%+8px)] right-0 z-60 w-[270px] overflow-hidden rounded-xl border border-hairline bg-surface shadow-raised">
          <div className="flex items-center gap-2.5 border-b border-hairline px-4 py-3.5">
            <Avatar author={user} size="md" />
            <div className="min-w-0">
              <p className="truncate font-semibold">{user.displayName}</p>
              <p className="truncate text-[13px] text-ink-3">@{user.username}</p>
            </div>
          </div>
          <div className="p-1.5">
            <Link href="/publier" className={itemClass} onClick={() => setOpen(false)}>
              <PenLine size={18} aria-hidden="true" />
              Lancer une discussion
            </Link>
            <Link href="/charte" className={itemClass} onClick={() => setOpen(false)}>
              <BookOpen size={18} aria-hidden="true" />
              Charte de la communauté
            </Link>
            <a href={SITE_URL} target="_blank" rel="noopener" className={itemClass}>
              <Newspaper size={18} aria-hidden="true" />
              Retour sur lerevenu.com
            </a>
            <form action={logout}>
              <button type="submit" className={itemClass}>
                <LogOut size={18} aria-hidden="true" />
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
