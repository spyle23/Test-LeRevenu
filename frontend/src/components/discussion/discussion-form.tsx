"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { CircleHelp, type LucideIcon, MessageCircle, ShieldCheck } from "lucide-react";
import { createDiscussion } from "@/actions/community";
import { Field, FormAlert, describedBy } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { cx } from "@/lib/cx";
import { idleState } from "@/lib/form-state";
import type { Category, DiscussionType } from "@/lib/strapi/types";
import { CONTENT_MAX_LENGTH, TITLE_MAX_LENGTH, TITLE_MIN_LENGTH } from "@/lib/validation";

const TYPES: Array<[DiscussionType, LucideIcon, string, string]> = [
  ["question", CircleHelp, "Poser une question", "Obtenez l’aide des membres et de la rédaction"],
  ["discussion", MessageCircle, "Lancer une discussion", "Partagez une expérience, un avis, une actualité"],
];

const PLACEHOLDERS: Record<DiscussionType, string> = {
  question: "Ex. : Faut-il ouvrir un PER à 45 ans ?",
  discussion: "Ex. : Mon retour d’expérience sur la renégociation de mon crédit",
};

/** Same normalisation as the server before checking the 10-character minimum. */
const normalizedLength = (title: string) => title.replace(/\s+/g, " ").trim().length;

interface DiscussionFormProps {
  categories: Pick<Category, "slug" | "name">[];
  defaultType: DiscussionType;
  defaultCategory?: string;
  defaultTitle?: string;
}

export function DiscussionForm({ categories, defaultType, defaultCategory, defaultTitle = "" }: DiscussionFormProps) {
  const [state, formAction] = useActionState(createDiscussion, idleState);
  const values = state.values ?? {};
  const errors = state.fieldErrors ?? {};

  const [type, setType] = useState<DiscussionType>(defaultType);
  const [titleLength, setTitleLength] = useState(() => normalizedLength(defaultTitle));
  const titleOk = titleLength >= TITLE_MIN_LENGTH;

  return (
    <form action={formAction} noValidate className="flex flex-col">
      <div className="flex flex-col gap-4 px-4 pt-4 pb-[22px] md:px-[22px]">
        <FormAlert message={state.message} />

        <fieldset>
          <legend className="sr-only">Type de publication</legend>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {TYPES.map(([value, Icon, label, description]) => (
              <label
                key={value}
                className="relative flex cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] border-line px-3 py-[11px] hover:border-line-strong has-checked:border-brand has-checked:bg-brand-soft has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand sm:flex-col sm:items-start sm:gap-1 sm:px-3 sm:py-3.5"
              >
                <input
                  type="radio"
                  name="type"
                  value={value}
                  defaultChecked={(values.type || defaultType) === value}
                  onChange={() => setType(value)}
                  className="pointer-events-none absolute opacity-0"
                />
                <Icon size={22} aria-hidden="true" className="text-brand-text sm:mb-1" />
                <b className="text-[14.5px]">{label}</b>
                <small className="hidden text-[12.5px] leading-[1.35] text-ink-3 sm:block">{description}</small>
              </label>
            ))}
          </div>
          {errors.type && <p className="mt-1.5 text-[13px] text-alert">{errors.type}</p>}
        </fieldset>

        <Field
          id="title"
          label="Titre"
          error={errors.title}
          hint={
            <>
              Un titre clair, formulé comme une question, obtient plus vite des réponses.{" "}
              <span className={cx("tabular-nums", titleLength > 0 && (titleOk ? "text-ok" : "text-alert"))}>
                {titleOk ? `${titleLength}/${TITLE_MAX_LENGTH}` : `${titleLength}/${TITLE_MIN_LENGTH} caractères minimum`}
              </span>
            </>
          }
        >
          <input
            id="title"
            name="title"
            className="input"
            autoComplete="off"
            maxLength={TITLE_MAX_LENGTH}
            defaultValue={values.title ?? defaultTitle}
            placeholder={PLACEHOLDERS[type]}
            onInput={(event) => setTitleLength(normalizedLength(event.currentTarget.value))}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={describedBy("title", errors.title, true)}
          />
        </Field>

        <Field id="category" label="Espace" error={errors.category}>
          <select
            id="category"
            name="category"
            className="input"
            defaultValue={values.category || defaultCategory || ""}
            aria-invalid={Boolean(errors.category)}
            aria-describedby={describedBy("category", errors.category)}
          >
            <option value="">Choisissez un espace…</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field id="content" label="Détails" error={errors.content}>
          <textarea
            id="content"
            name="content"
            rows={7}
            className="input"
            maxLength={CONTENT_MAX_LENGTH}
            defaultValue={values.content}
            placeholder="Votre situation, ce que vous avez déjà envisagé… Plus le contexte est précis, meilleures sont les réponses."
            aria-invalid={Boolean(errors.content)}
            aria-describedby={describedBy("content", errors.content)}
          />
        </Field>

        <p className="flex items-start gap-2.5 rounded-control bg-surface-2 px-3 py-2.5 text-[13px] text-ink-2">
          <ShieldCheck size={16} aria-hidden="true" className="mt-px shrink-0 text-ink-3" />
          <span>
            Partagez votre expérience : pas de conseil personnalisé ni de sollicitation.{" "}
            <Link href="/charte" className="font-semibold text-brand-text">
              Lire la charte
            </Link>
          </span>
        </p>
      </div>

      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-2.5 rounded-b-2xl border-t border-hairline bg-surface px-4 py-3.5 md:px-[22px]">
        <span className="text-[12.5px] text-ink-3">**gras** · une ligne commençant par « - » crée une liste</span>
        <SubmitButton pendingLabel="Publication…">Publier</SubmitButton>
      </div>
    </form>
  );
}
