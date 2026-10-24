import { z } from "zod";

// Mirrors the yup schemas of the Strapi APIs (backend/src/api/<name>/validation.ts)
// for instant feedback. Strapi remains the source of truth: its 400 responses are
// mapped back onto the same fields.

export const TITLE_MIN_LENGTH = 10;
export const TITLE_MAX_LENGTH = 160;
export const CONTENT_MAX_LENGTH = 10_000;
export const REPLY_MAX_LENGTH = 5_000;

const collapseSpaces = (value: string) => value.replace(/\s+/g, " ").trim();

const text = () => z.string({ error: "Ce champ est obligatoire." });

export const discussionSchema = z.object({
  title: text()
    .transform(collapseSpaces)
    .pipe(
      z
        .string()
        .min(1, "Le titre est obligatoire.")
        .min(TITLE_MIN_LENGTH, `Le titre doit contenir au moins ${TITLE_MIN_LENGTH} caractères.`)
        .max(TITLE_MAX_LENGTH, `Le titre ne peut pas dépasser ${TITLE_MAX_LENGTH} caractères.`),
    ),
  content: text()
    .trim()
    .min(1, "Le contenu est obligatoire.")
    .max(CONTENT_MAX_LENGTH, `Le contenu ne peut pas dépasser ${CONTENT_MAX_LENGTH} caractères.`),
  type: z.enum(["question", "discussion"], { error: "Choisissez un type de publication." }),
  category: text().trim().min(1, "Choisissez un espace."),
});

export const replySchema = z.object({
  content: text()
    .trim()
    .min(2, "Votre réponse est trop courte.")
    .max(REPLY_MAX_LENGTH, `Votre réponse ne peut pas dépasser ${REPLY_MAX_LENGTH} caractères.`),
});

export const loginSchema = z.object({
  identifier: text().trim().min(1, "Saisissez votre e-mail ou votre identifiant."),
  password: text().min(1, "Saisissez votre mot de passe."),
});

export type DiscussionInput = z.infer<typeof discussionSchema>;

export function firstFieldErrors(error: z.ZodError) {
  const { fieldErrors } = z.flattenError(error);
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([field, messages]) => [field, (messages as string[] | undefined)?.[0]]),
  ) as Partial<Record<string, string>>;
}
