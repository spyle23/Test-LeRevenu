"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { endSession, readSessionToken } from "@/lib/auth/session";
import { type FormState, readFields } from "@/lib/form-state";
import { StrapiError, strapiFetch } from "@/lib/strapi/client";
import { cacheTags } from "@/lib/strapi/queries";
import type { DiscussionSummary } from "@/lib/strapi/types";
import { discussionSchema, firstFieldErrors, replySchema } from "@/lib/validation";

type DiscussionField = "title" | "content" | "type" | "category";
type ReplyField = "content";

const DISCUSSION_FIELDS = ["title", "content", "type", "category"] as const;

export async function createDiscussion(
  _previous: FormState<DiscussionField>,
  formData: FormData,
): Promise<FormState<DiscussionField>> {
  const fields = readFields(formData, DISCUSSION_FIELDS);
  const values = Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, value ?? ""]));

  const parsed = discussionSchema.safeParse(fields);
  if (!parsed.success) {
    return { status: "error", fieldErrors: firstFieldErrors(parsed.error), values };
  }

  const token = await requireToken("/publier");
  let slug: string;
  try {
    const { data } = await strapiFetch<{ data: DiscussionSummary }>("/discussions", {
      method: "POST",
      body: { data: parsed.data },
      token,
    });
    slug = data.slug;
  } catch (error) {
    return toFormError(error, values);
  }

  updateTag(cacheTags.discussions);
  updateTag(cacheTags.categories);
  redirect(`/discussions/${slug}`);
}

export async function createReply(
  slug: string,
  _previous: FormState<ReplyField>,
  formData: FormData,
): Promise<FormState<ReplyField>> {
  const fields = readFields(formData, ["content"] as const);
  const values = { content: fields.content ?? "" };

  const parsed = replySchema.safeParse(fields);
  if (!parsed.success) {
    return { status: "error", fieldErrors: firstFieldErrors(parsed.error), values };
  }

  const token = await requireToken(`/discussions/${slug}#repondre`);
  try {
    await strapiFetch(`/discussions/${encodeURIComponent(slug)}/replies`, {
      method: "POST",
      body: { data: parsed.data },
      token,
    });
  } catch (error) {
    return toFormError(error, values);
  }

  updateTag(cacheTags.discussion(slug));
  updateTag(cacheTags.discussions);
  return { status: "success", message: "Votre réponse est publiée." };
}

async function requireToken(returnTo: string) {
  const token = await readSessionToken();
  if (!token) redirect(`/connexion?redirect=${encodeURIComponent(returnTo)}`);
  return token;
}

async function toFormError<Field extends string>(
  error: unknown,
  values: Partial<Record<Field, string>>,
): Promise<FormState<Field>> {
  if (!(error instanceof StrapiError)) throw error;

  if (error.status === 401) {
    await endSession();
    return { status: "error", message: "Votre session a expiré. Reconnectez-vous pour publier.", values };
  }
  if (error.status === 400 && Object.keys(error.fieldErrors).length) {
    return { status: "error", fieldErrors: error.fieldErrors as Partial<Record<Field, string>>, values };
  }
  if (error.status >= 500) {
    return { status: "error", message: "Le service est momentanément indisponible. Réessayez dans un instant.", values };
  }
  return { status: "error", message: error.message, values };
}
