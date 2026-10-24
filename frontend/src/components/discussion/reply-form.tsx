"use client";

import { type KeyboardEvent, useActionState } from "react";
import { createReply } from "@/actions/community";
import { Avatar } from "@/components/ui/avatar";
import { FormAlert } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { idleState } from "@/lib/form-state";
import type { CurrentUser } from "@/lib/strapi/types";
import { REPLY_MAX_LENGTH } from "@/lib/validation";

interface ReplyFormProps {
  slug: string;
  user: CurrentUser;
  placeholder: string;
}

export function ReplyForm({ slug, user, placeholder }: ReplyFormProps) {
  const [state, formAction] = useActionState(createReply.bind(null, slug), idleState);
  const error = state.fieldErrors?.content;

  const submitOnCtrlEnter = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) event.currentTarget.form?.requestSubmit();
  };

  return (
    <form id="repondre" action={formAction} className="flex scroll-mt-[90px] flex-col gap-2.5 rounded-card border border-hairline bg-surface px-4 py-4 shadow-card md:px-5">
      <div className="flex items-center gap-[11px]">
        <Avatar author={user} />
        <p className="text-[12.5px] text-ink-3">
          Répondre en tant que <b className="text-ink">{user.displayName}</b>
        </p>
      </div>

      <FormAlert message={state.message && state.status === "error" ? state.message : undefined} />

      <label htmlFor="reply-content" className="sr-only">
        Votre réponse
      </label>
      <textarea
        id="reply-content"
        name="content"
        required
        maxLength={REPLY_MAX_LENGTH}
        defaultValue={state.values?.content}
        placeholder={placeholder}
        onKeyDown={submitOnCtrlEnter}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "reply-content-error" : undefined}
        className="input min-h-[110px]"
      />
      {error && (
        <p id="reply-content-error" className="text-[13px] text-alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <p role="status" className="text-[12.5px] text-ink-3">
          {state.status === "success" ? <span className="font-semibold text-ok">{state.message}</span> : "Ctrl + Entrée pour publier"}
        </p>
        <SubmitButton pendingLabel="Publication…">Publier ma réponse</SubmitButton>
      </div>
    </form>
  );
}
