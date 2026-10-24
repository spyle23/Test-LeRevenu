/** Publishing and signing in: one centred panel, like the dialogs of the mock-up. */
export default function FocusLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="wrap flex justify-center pt-6 pb-[100px] md:pt-10 md:pb-24">
      {children}
    </main>
  );
}
