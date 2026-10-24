"use server";

import { redirect } from "next/navigation";
import { endSession, startSession } from "@/lib/auth/session";
import { type FormState, readFields, safeRedirectPath } from "@/lib/form-state";
import { StrapiError, strapiFetch } from "@/lib/strapi/client";
import { firstFieldErrors, loginSchema } from "@/lib/validation";

type LoginField = "identifier" | "password";

export async function login(_previous: FormState<LoginField>, formData: FormData): Promise<FormState<LoginField>> {
  const fields = readFields(formData, ["identifier", "password"] as const);
  const values = { identifier: fields.identifier ?? "" };

  const parsed = loginSchema.safeParse(fields);
  if (!parsed.success) {
    return { status: "error", fieldErrors: firstFieldErrors(parsed.error), values };
  }

  try {
    const { jwt } = await strapiFetch<{ jwt: string }>("/auth/local", { method: "POST", body: parsed.data });
    await startSession(jwt);
  } catch (error) {
    if (!(error instanceof StrapiError)) throw error;
    const message =
      error.status === 400
        ? "Identifiant ou mot de passe incorrect."
        : error.status === 429
          ? "Trop de tentatives. Patientez quelques minutes avant de réessayer."
          : error.message;
    return { status: "error", message, values };
  }

  redirect(safeRedirectPath(formData.get("redirect")));
}

export async function logout() {
  await endSession();
  redirect("/");
}
