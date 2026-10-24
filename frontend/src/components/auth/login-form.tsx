"use client";

import { useActionState, useRef } from "react";
import { login } from "@/actions/auth";
import { Avatar } from "@/components/ui/avatar";
import { Field, FormAlert, describedBy } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { idleState } from "@/lib/form-state";

export interface DemoAccount {
  username: string;
  displayName: string;
  description: string;
  isEditorial?: boolean;
}

interface LoginFormProps {
  redirectTo: string;
  demo?: { accounts: DemoAccount[]; password: string };
}

export function LoginForm({ redirectTo, demo }: LoginFormProps) {
  const [state, formAction] = useActionState(login, idleState);
  const errors = state.fieldErrors ?? {};
  const identifierRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const signInAs = (username: string) => {
    if (!identifierRef.current || !passwordRef.current || !demo) return;
    identifierRef.current.value = username;
    passwordRef.current.value = demo.password;
    passwordRef.current.form?.requestSubmit();
  };

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} noValidate className="flex flex-col gap-4">
        <input type="hidden" name="redirect" value={redirectTo} />
        <FormAlert message={state.message} />

        <Field id="identifier" label="E-mail ou identifiant" error={errors.identifier}>
          <input
            ref={identifierRef}
            id="identifier"
            name="identifier"
            className="input"
            autoComplete="username"
            defaultValue={state.values?.identifier}
            aria-invalid={Boolean(errors.identifier)}
            aria-describedby={describedBy("identifier", errors.identifier)}
            autoFocus
          />
        </Field>
        <Field id="password" label="Mot de passe" error={errors.password}>
          <input
            ref={passwordRef}
            id="password"
            name="password"
            type="password"
            className="input"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={describedBy("password", errors.password)}
          />
        </Field>
        <SubmitButton pendingLabel="Connexion…" className="w-full">
          Continuer
        </SubmitButton>
      </form>

      {demo && (
        <section aria-labelledby="demo-title" className="rounded-control border border-dashed border-line-strong p-3">
          <h2 id="demo-title" className="text-[13px] font-semibold">
            Comptes de démonstration
          </h2>
          <p className="mb-2 text-[12.5px] text-ink-3">
            Mot de passe commun : <code className="font-semibold text-ink-2">{demo.password}</code>
          </p>
          <ul className="flex flex-col gap-1">
            {demo.accounts.map((account) => (
              <li key={account.username}>
                <button
                  type="button"
                  onClick={() => signInAs(account.username)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-fill"
                >
                  <Avatar author={{ ...account, isEditorial: Boolean(account.isEditorial) }} />
                  <span className="min-w-0">
                    <b className="block text-sm">{account.displayName}</b>
                    <small className="block truncate text-xs text-ink-3">
                      @{account.username} · {account.description}
                    </small>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
