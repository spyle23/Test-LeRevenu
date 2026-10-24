import "server-only";

const STRAPI_URL = process.env.STRAPI_URL ?? "http://localhost:1337";
const TIMEOUT_MS = 8_000;

type FieldErrors = Partial<Record<string, string>>;

interface StrapiErrorPayload {
  error?: {
    status?: number;
    name?: string;
    message?: string;
    details?: { errors?: Array<{ path?: string[]; message?: string }> };
  };
}

export class StrapiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code: string,
    readonly fieldErrors: FieldErrors = {},
  ) {
    super(message);
    this.name = "StrapiError";
  }

  static fromResponse(status: number, payload: StrapiErrorPayload | null) {
    const error = payload?.error;
    const fieldErrors: FieldErrors = {};

    for (const detail of error?.details?.errors ?? []) {
      const field = detail.path?.[0];
      if (field && detail.message && !fieldErrors[field]) fieldErrors[field] = detail.message;
    }

    return new StrapiError(status, error?.message ?? `Erreur ${status}`, error?.name ?? "HttpError", fieldErrors);
  }

  get isAuthError() {
    return this.status === 401 || this.status === 403;
  }
}

interface RequestOptions {
  method?: "GET" | "POST";
  body?: unknown;
  token?: string | null;
  query?: Record<string, string | number | undefined>;
}

/**
 * Single entry point to the Strapi REST API. Server-only: the JWT never reaches the
 * browser, and Strapi's error envelope is turned into a typed StrapiError.
 */
export async function strapiFetch<T>(path: string, { method = "GET", body, token, query }: RequestOptions = {}) {
  const url = new URL(`/api${path}`, STRAPI_URL);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    throw new StrapiError(503, "La communauté est momentanément indisponible. Réessayez dans un instant.", "Unavailable");
  }

  const payload = await response.json().catch(() => null);
  if (!response.ok) throw StrapiError.fromResponse(response.status, payload);

  return payload as T;
}
