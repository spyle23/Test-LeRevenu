import type { ReactNode } from "react";

interface FieldProps {
  id: string;
  label: ReactNode;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}

/** Label, control and messages wired together for screen readers (aria-describedby is set by the caller). */
export function Field({ id, label, error, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[13px] text-alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-[12.5px] text-ink-3">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export const describedBy = (id: string, error?: string, hasHint = false) =>
  error ? `${id}-error` : hasHint ? `${id}-hint` : undefined;

export function FormAlert({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-control bg-alert-soft px-3 py-2.5 text-sm text-ink">
      {message}
    </p>
  );
}
