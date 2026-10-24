import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap py-16">
      <div className="card mx-auto max-w-xl px-5 py-10 text-center">
        <p className="font-display text-5xl font-black text-brand-text">404</p>
        <h1 className="mt-2 mb-1.5 font-display text-[22px] font-bold tracking-[-0.01em]">Cette page est introuvable</h1>
        <p className="text-ink-2">La discussion a peut-être été supprimée, ou le lien est incomplet.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Link href="/" className="btn btn-primary">
            Retour à l’accueil
          </Link>
          <Link href="/recherche" className="btn btn-secondary">
            Rechercher
          </Link>
        </div>
      </div>
    </main>
  );
}
