"use client";

import { ErrorView } from "@/components/error-view";
import { PageMain } from "@/components/layout/page-columns";

export default function CommunityError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <PageMain wide>
      <ErrorView
        title="La communauté est momentanément indisponible"
        message="Nous n’avons pas pu charger cette page. Vérifiez votre connexion ou réessayez dans quelques instants."
        onRetry={reset}
      />
    </PageMain>
  );
}
