import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, children, action }: EmptyStateProps) {
  return (
    <div className="px-5 py-10 text-center text-ink-2">
      <h3 className="mb-1.5 font-display text-xl font-bold tracking-[-0.01em] text-ink">{title}</h3>
      {children && <p className="mx-auto max-w-[52ch]">{children}</p>}
      {action && <div className="mt-3.5">{action}</div>}
    </div>
  );
}
