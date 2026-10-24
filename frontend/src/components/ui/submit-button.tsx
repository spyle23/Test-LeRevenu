"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cx } from "@/lib/cx";

interface SubmitButtonProps {
  children: ReactNode;
  pendingLabel: string;
  className?: string;
}

export function SubmitButton({ children, pendingLabel, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={cx("btn btn-primary", className)} disabled={pending} aria-disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}
