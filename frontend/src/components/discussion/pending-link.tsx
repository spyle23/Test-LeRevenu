"use client";

import { useLinkStatus } from "next/link";

/** Placed inside a <Link>: dims it while the next page is on its way. */
export function PendingHint() {
  const { pending } = useLinkStatus();
  return pending ? <span aria-hidden="true" className="ml-1 size-1.5 animate-pulse rounded-full bg-brand" /> : null;
}
