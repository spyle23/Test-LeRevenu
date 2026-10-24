"use client";

import { ErrorView } from "@/components/error-view";

export default function FocusError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="w-full max-w-[640px]">
      <ErrorView
        title="Impossible d’afficher cette page"
        message="Le service communautaire ne répond pas pour le moment. Réessayez dans quelques instants."
        onRetry={reset}
      />
    </div>
  );
}
