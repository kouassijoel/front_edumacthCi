import Link from "next/link";
import Header from "./component/header";
import Footer from "./component/footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full flex flex-col items-center text-center gap-8">

          {/* ── Illustration ── */}
          <div className="relative w-full max-w-sm mx-auto select-none">

            {/* Bureau */}
            <div className="relative flex flex-col items-center">

              {/* Fond décoratif */}
              <div className="absolute inset-0 bg-orange-50 rounded-4xl blur-3xl opacity-60" />

              {/* Grand 404 */}
              <div className="relative flex items-center gap-2 sm:gap-4">
                <span className="text-[110px] sm:text-[140px] font-black text-orange-500 leading-none tracking-tighter">4</span>

                {/* Personnage élève */}
                <div className="relative flex flex-col items-center">
                  {/* Tête */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-300 border-4 border-amber-400 flex items-center justify-center shadow-lg relative">
                    {/* Yeux */}
                    <div className="flex gap-3 mt-1">
                      <div className="w-2.5 h-3 rounded-full bg-zinc-800 flex items-end justify-center pb-0.5">
                        <div className="w-1 h-1 rounded-full bg-white" />
                      </div>
                      <div className="w-2.5 h-3 rounded-full bg-zinc-800 flex items-end justify-center pb-0.5">
                        <div className="w-1 h-1 rounded-full bg-white" />
                      </div>
                    </div>
                    {/* Bouche triste */}
                    <div className="absolute bottom-3.5 w-5 h-2 border-b-2 border-zinc-700 rounded-b-full" />
                    {/* Bonnet */}
                    <div className="absolute -top-5 w-16 sm:w-20">
                      <div className="h-4 bg-orange-500 rounded-t-lg" />
                      <div className="h-1.5 bg-orange-600 rounded" />
                      <div className="absolute -top-3 right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-orange-600" />
                    </div>
                  </div>

                  {/* Corps */}
                  <div className="w-14 sm:w-16 h-12 bg-blue-500 rounded-t-2xl mt-0.5 flex items-center justify-center">
                    <div className="w-8 h-6 bg-white/20 rounded-lg" />
                  </div>
                </div>

                <span className="text-[110px] sm:text-[140px] font-black text-orange-500 leading-none tracking-tighter">4</span>
              </div>

              {/* Livre ouvert sous le personnage */}
              <div className="relative -mt-4 flex items-end gap-1 z-10">
                {/* Livre gauche */}
                <div className="w-24 sm:w-32 h-14 sm:h-16 bg-orange-400 rounded-l-xl rounded-br-xl flex items-center justify-center shadow-md">
                  <div className="flex flex-col gap-1.5 w-16 sm:w-20">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-1.5 bg-orange-200/60 rounded-full" />
                    ))}
                  </div>
                </div>
                {/* Reliure */}
                <div className="w-3 h-16 bg-orange-600 rounded-sm shadow-inner" />
                {/* Livre droit */}
                <div className="w-24 sm:w-32 h-14 sm:h-16 bg-orange-300 rounded-r-xl rounded-bl-xl flex items-center justify-center shadow-md">
                  <div className="flex flex-col gap-1.5 w-16 sm:w-20">
                    {[1,2,3].map(i => (
                      <div key={i} className="h-1.5 bg-orange-100/60 rounded-full" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Objets flottants */}
              <div className="absolute top-4 left-4 text-3xl animate-bounce" style={{ animationDelay: "0s", animationDuration: "3s" }}>📚</div>
              <div className="absolute top-0 right-6 text-2xl animate-bounce" style={{ animationDelay: "0.5s", animationDuration: "2.5s" }}>✏️</div>
              <div className="absolute bottom-10 right-0 text-2xl animate-bounce" style={{ animationDelay: "1s", animationDuration: "3.5s" }}>🎓</div>
              <div className="absolute bottom-8 left-0 text-xl animate-bounce" style={{ animationDelay: "0.8s", animationDuration: "2.8s" }}>📝</div>
            </div>
          </div>

          {/* ── Texte ── */}
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900">
              Oups, cette page n&apos;existe pas !
            </h1>
            <p className="text-zinc-500 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Même nos meilleurs répétiteurs ne peuvent pas t&apos;aider à trouver cette page… Elle semble avoir disparu de nos cahiers 📓
            </p>
          </div>

          {/* ── Actions ── */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto text-center px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-sm transition-colors shadow-lg shadow-orange-200"
            >
              🏠 Retour à l&apos;accueil
            </Link>
            <Link
              href="/repetiteurs"
              className="w-full sm:w-auto text-center px-8 py-4 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-2xl text-sm transition-colors"
            >
              🔍 Trouver un répétiteur
            </Link>
          </div>

          {/* ── Liens rapides ── */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-400">
            <span>Aller vers :</span>
            {[
              { label: "Inscription",   href: "/inscription" },
              { label: "Connexion",     href: "/connexion" },
              { label: "Comment ça marche", href: "/comment-ca-marche" },
            ].map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-orange-500 hover:text-orange-600 font-medium hover:underline transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
