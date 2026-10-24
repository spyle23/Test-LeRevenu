/** Rebuilt from lerevenu.com: "LE" knocked out on black, "REVENU" on the brand red. */
export function Logo({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`inline-flex items-stretch bg-[var(--rev-red)] p-[0.1em] ${className ?? ""}`}>
      <span className="mr-[0.12em] bg-black px-[0.1em] pt-[0.1em] pb-[0.12em] font-sans text-[1em] leading-none font-black tracking-[-0.02em] text-white">
        LE
      </span>
      <span className="px-[0.1em] pt-[0.1em] pb-[0.12em] font-sans text-[1em] leading-none font-black tracking-[-0.02em] text-white">
        REVENU
      </span>
    </span>
  );
}
