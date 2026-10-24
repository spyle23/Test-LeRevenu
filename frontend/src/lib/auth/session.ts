import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { StrapiError, strapiFetch } from "@/lib/strapi/client";
import type { CurrentUser } from "@/lib/strapi/types";

const SESSION_COOKIE = "lr_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // aligned with JWT_EXPIRES_IN on Strapi

export async function readSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

export async function startSession(jwt: string) {
  (await cookies()).set(SESSION_COOKIE, jwt, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.SESSION_COOKIE_SECURE !== "false",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

interface StrapiMe {
  id: number;
  username: string;
  displayName?: string | null;
  isEditorial?: boolean;
  isSubscriber?: boolean;
}

/**
 * The signed-in member, resolved once per request. Strapi stays the authority:
 * an expired or revoked token simply yields an anonymous visitor.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = await readSessionToken();
  if (!token) return null;

  try {
    const me = await strapiFetch<StrapiMe>("/users/me", { token });
    return {
      id: me.id,
      username: me.username,
      displayName: me.displayName || me.username,
      isEditorial: Boolean(me.isEditorial),
      isSubscriber: Boolean(me.isSubscriber),
    };
  } catch (error) {
    if (error instanceof StrapiError && error.isAuthError) return null;
    throw error;
  }
});
