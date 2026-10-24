export interface FormState<Field extends string = string> {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<Field, string>>;
  /** Submitted values, sent back so a failed submission keeps what the member typed. */
  values?: Partial<Record<Field, string>>;
}

export const idleState: FormState = { status: "idle" };

export function readFields<Field extends string>(formData: FormData, fields: readonly Field[]) {
  return Object.fromEntries(
    fields.map((field) => {
      const value = formData.get(field);
      return [field, typeof value === "string" ? value : undefined];
    }),
  ) as Record<Field, string | undefined>;
}

/** Only same-site relative paths: never redirect a member to another origin after login. */
export function safeRedirectPath(value: FormDataEntryValue | string | null | undefined, fallback = "/") {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")
    ? value
    : fallback;
}
