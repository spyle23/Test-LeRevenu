"use client";

import Link from "next/link";

interface ErrorViewProps {
  title: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorView({ title, message, onRetry }: ErrorViewProps) {
  return (
    <div role="alert" className="card px-5 py-10 text-center">
      <h1 className="mb-1.5 font-display text-[22px] font-bold tracking-[-0.01em]">{title}</h1>
      <p className="mx-auto max-w-[52ch] text-ink-2">{message}</p>
      <div className="mt-4 flex justify-center gap-2">
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn btn-primary">
            Réessayer
          </button>
        )}
        <Link href="/" className="btn btn-secondary">
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
