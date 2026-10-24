import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { type DemoAccount, LoginForm } from "@/components/auth/login-form";
import { Panel } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth/session";
import { safeRedirectPath } from "@/lib/form-state";

export const metadata: Metadata = { title: "Connexion", robots: { index: false } };

const DEMO_ACCOUNTS: DemoAccount[] = [
  { username: "Camille_B", displayName: "Camille", description: "membre abonnée" },
  { username: "Vincent_ETF", displayName: "Vincent", description: "membre très actif" },
  { username: "LaRedaction", displayName: "La rédaction du Revenu", description: "compte de la rédaction", isEditorial: true },
];

export default function LoginPage({ searchParams }: PageProps<"/connexion">) {
  return (
    <Panel title="Rejoindre la communauté" size="sm">
      <div className="flex flex-col gap-4 px-4 pt-4 pb-[22px] md:px-[22px]">
        <ul className="flex flex-col gap-[7px] text-sm text-ink-2">
          {["Posez vos questions d’argent aux lecteurs et à la rédaction", "Suivez les discussions qui vous concernent"].map((benefit) => (
            <li key={benefit} className="flex gap-2">
              <Check size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-ok" />
              {benefit}
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-3 rounded-control border border-line bg-surface-2 px-3.5 py-3">
          <span aria-hidden="true" className="grid size-[38px] shrink-0 place-items-center rounded-[9px] bg-[var(--rev-red)] text-xl font-black text-white">
            R
          </span>
          <div>
            <b className="block">Votre compte lerevenu.com</b>
            <small className="block text-[12.5px] text-ink-3">Le même identifiant que pour le site et le magazine</small>
          </div>
        </div>
        <Suspense fallback={<Skeleton className="h-[220px] rounded-control" />}>
          <LoginGate searchParams={searchParams} />
        </Suspense>
      </div>
    </Panel>
  );
}

async function LoginGate({ searchParams }: { searchParams: PageProps<"/connexion">["searchParams"] }) {
  const { redirect: target } = await searchParams;
  const redirectTo = safeRedirectPath(typeof target === "string" ? target : undefined);

  if (await getCurrentUser()) redirect(redirectTo);

  // Demo accounts are only advertised when the seed password is configured.
  const password = process.env.DEMO_USERS_PASSWORD;
  return <LoginForm redirectTo={redirectTo} demo={password ? { accounts: DEMO_ACCOUNTS, password } : undefined} />;
}
