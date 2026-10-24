"use client";

import { useEffect, useState } from "react";
import { Check, Link2 } from "lucide-react";

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href.split("#")[0]);
      setCopied(true);
    } catch {
      // Clipboard can be denied (insecure context, permissions): the URL bar remains.
    }
  };

  return (
    <button type="button" onClick={copy} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-[11px] text-[13.5px] font-medium text-ink-2 hover:bg-fill hover:text-ink">
      {copied ? <Check size={18} aria-hidden="true" /> : <Link2 size={18} aria-hidden="true" />}
      <span aria-live="polite">{copied ? "Lien copié" : "Copier le lien"}</span>
    </button>
  );
}
