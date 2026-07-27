import Header from "./component/header";
import Footer from "./component/footer";
import Link from "next/link";
import Card from "./component/card";
import HeroSearch from "./component/HeroSearch";
import type { RepetiteurCard } from "@/lib/services/repetiteur.service";
import {
  Calculator, Atom, FlaskConical, Languages, BookOpen,
  Monitor, Map, Leaf, Sigma, Globe,
} from "lucide-react";

/* ─── Fetch ─────────────────────────────────────────────────────────────── */

async function fetchRepetiteurs(limit: number): Promise<{ resultats: RepetiteurCard[]; total: number }> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1"}/repetiteurs?limit=${limit}`,
      { cache: "no-store" }
    );
    if (!res.ok) return { resultats: [], total: 0 };
    const json = await res.json();
    const data = json.data as { total: number; resultats: RepetiteurCard[] } | RepetiteurCard[];
    if (Array.isArray(data)) return { resultats: data, total: data.length };
    return { resultats: data.resultats ?? [], total: data.total ?? 0 };
  } catch {
    return { resultats: [], total: 0 };
  }
}

function toCard(r: RepetiteurCard) {
  return {
    id: r.id,
    nom: `${r.prenom} ${r.nom}`,
    photo: r.photo_url ?? `https://i.pravatar.cc/300?u=${r.id}`,
    prixParHeure: r.prix_par_heure ?? 0,
    description: r.titre_annonce ?? r.bio ?? "",
    note: r.note,
    nbAvis: r.nb_avis,
    ville: r.ville ?? undefined,
    boostBadge: r.boost_badge ?? null,
  };
}

/* ─── Données statiques ─────────────────────────────────────────────────── */

const MATIERES = [
  { label: "Mathématiques", Icon: Calculator,  slug: "Math%C3%A9matiques", couleur: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100" },
  { label: "Physique",      Icon: Atom,         slug: "Physique",           couleur: "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100" },
  { label: "Chimie",        Icon: FlaskConical, slug: "Chimie",             couleur: "bg-green-50 text-green-600 border-green-100 hover:bg-green-100" },
  { label: "Anglais",       Icon: Languages,   slug: "Anglais",             couleur: "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100" },
  { label: "Français",      Icon: BookOpen,    slug: "Fran%C3%A7ais",       couleur: "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100" },
  { label: "Informatique",  Icon: Monitor,     slug: "Informatique",        couleur: "bg-cyan-50 text-cyan-600 border-cyan-100 hover:bg-cyan-100" },
  { label: "Histoire-Géo",  Icon: Map,         slug: "Histoire-G%C3%A9o",   couleur: "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100" },
  { label: "SVT",           Icon: Leaf,        slug: "SVT",                 couleur: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" },
  { label: "Économie",      Icon: Sigma,       slug: "%C3%89conomie",       couleur: "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100" },
  { label: "Philosophie",   Icon: Globe,       slug: "Philosophie",         couleur: "bg-pink-50 text-pink-600 border-pink-100 hover:bg-pink-100" },
];

const TEMOIGNAGES = [
  {
    nom: "Aminata K.",
    ville: "Abidjan",
    note: 5,
    texte: "Grâce à EduMatch CI, mon fils a trouvé un excellent répétiteur en Maths en moins d'une journée. Ses notes ont vraiment progressé !",
    avatar: "AK",
    couleur: "bg-orange-500",
  },
  {
    nom: "Kofi M.",
    ville: "Bouaké",
    note: 5,
    texte: "La plateforme est très simple à utiliser. J'ai comparé plusieurs profils et j'ai choisi le répétiteur qui correspondait le mieux à mes besoins.",
    avatar: "KM",
    couleur: "bg-blue-500",
  },
  {
    nom: "Fatou D.",
    ville: "Yamoussoukro",
    note: 5,
    texte: "Mon répétiteur en Anglais est très patient et pédagogue. Je recommande vivement EduMatch CI à tous les parents !",
    avatar: "FD",
    couleur: "bg-emerald-500",
  },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function Home() {
  const { resultats, total } = await fetchRepetiteurs(12);
  const boosted = resultats.filter((r) => r.boost_badge !== null);
  const enVedette = boosted.length >= 4 ? boosted : resultats.slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header />

      {/* ══════════ 1. HERO ══════════ */}
      <section className="relative overflow-hidden bg-linear-to-br from-orange-600 via-orange-500 to-amber-500 py-20 sm:py-28 px-4 rounded-b-4xl">
        {/* Pattern grille */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)," +
              "repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)",
          }}
        />
        <div aria-hidden className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-amber-300/20 blur-3xl pointer-events-none" />
        <div aria-hidden className="absolute bottom-0 -left-20 w-80 h-80 rounded-full bg-orange-700/25 blur-2xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto flex flex-col items-center text-center gap-8">
          <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full border border-white/25">
            🇨🇮 &nbsp;Plateforme N°1 de cours particuliers en Côte d&apos;Ivoire
          </span>

          <div className="flex flex-col gap-3">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-[1.05] tracking-tight">
              Trouvez votre<br />
              <span className="text-amber-200">répétiteur idéal</span><br />
              en Côte d&apos;Ivoire
            </h1>
            <p className="text-white/80 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Des répétiteurs qualifiés, vérifiés et disponibles près de chez vous — à domicile ou en ligne.
            </p>
          </div>

          {/* Barre de recherche */}
          <HeroSearch />

          {/* Chiffres de confiance */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-4 border-t border-white/20 w-full max-w-2xl">
            {[
              { val: total > 5 ? `${total}+` : "100+", label: "Répétiteurs" },
              { val: "10",   label: "Matières" },
              { val: "8",    label: "Villes CI" },
              { val: "4.8★", label: "Note moyenne" },
            ].map(({ val, label }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <span className="text-2xl font-black text-white">{val}</span>
                <span className="text-xs text-white/70 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

     

      {/* ══════════ 3. PROFILS EN VEDETTE ══════════ */}
      {enVedette.length > 0 && (
        <section className="py-16 px-4 ">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-black text-orange-500 uppercase tracking-widest bg-orange-100 px-3 py-1.5 rounded-full">
                  ✨ En vedette
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-3">
                  {boosted.length > 0 ? "Profils mis en avant" : "Nos meilleurs répétiteurs"}
                </h2>
                <p className="text-zinc-500 text-sm mt-1">
                  {boosted.length > 0
                    ? "Certifiés et recommandés par EduMatch CI"
                    : "Découvrez nos répétiteurs les mieux notés"}
                </p>
              </div>
              <Link
                href="/repetiteurs"
                className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-orange-500 hover:text-orange-600 transition-colors whitespace-nowrap shrink-0"
              >
                Voir tous les répétiteurs →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4">
              {enVedette.map((r) => (
                <Card key={r.id} {...toCard(r)} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <Link
                href="/repetiteurs"
                className="px-10 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-sm transition-colors shadow-lg shadow-orange-200 flex items-center gap-2"
              >
                Voir tous les répétiteurs &rarr;
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ══════════ 4. COMMENT ÇA MARCHE ══════════ */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-black text-orange-500 uppercase tracking-widest bg-orange-100 px-3 py-1.5 rounded-full">
              Simple &amp; Rapide
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-3">Comment ça marche ?</h2>
            <p className="text-zinc-500 text-sm mt-2">En 3 étapes, trouvez et démarrez vos cours</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                num: "01", icon: "🔍", titre: "Recherchez",
                desc: "Filtrez par matière, niveau ou ville. Comparez les profils, les notes et les tarifs en quelques secondes.",
              },
              {
                num: "02", icon: "💬", titre: "Contactez",
                desc: "Envoyez un message directement au répétiteur. Le premier échange est toujours gratuit.",
              },
              {
                num: "03", icon: "📚", titre: "Commencez",
                desc: "Convenez d'un créneau et démarrez vos cours. Payez en toute sécurité via la plateforme.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="relative flex flex-col items-center text-center gap-4 p-8 rounded-3xl bg-zinc-50 border border-zinc-100 hover:border-orange-200 hover:bg-orange-50/40 transition-colors group"
              >
                <span className="absolute top-4 right-5 text-6xl font-black text-zinc-100 leading-none select-none group-hover:text-orange-100 transition-colors">
                  {step.num}
                </span>
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-orange-500 to-amber-400 flex items-center justify-center text-3xl shadow-lg shadow-orange-200">
                  {step.icon}
                </div>
                <h3 className="font-black text-zinc-900 text-xl">{step.titre}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/repetiteurs"
              className="px-10 py-4 bg-zinc-900 hover:bg-zinc-700 text-white font-bold rounded-2xl text-sm transition-colors"
            >
              Trouver un répétiteur maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ 5. TÉMOIGNAGES ══════════ */}
      <section className="py-16 px-4 bg-linear-to-b from-orange-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-black text-orange-500 uppercase tracking-widest bg-orange-100 px-3 py-1.5 rounded-full">
              Avis vérifiés
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 mt-3">Ce que disent nos élèves</h2>
            <p className="text-zinc-500 text-sm mt-2">Des familles nous font confiance partout en Côte d&apos;Ivoire</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TEMOIGNAGES.map((t) => (
              <div
                key={t.nom}
                className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-7 flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.note }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-zinc-600 text-sm leading-relaxed flex-1 italic">
                  &ldquo;{t.texte}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2 border-t border-zinc-50">
                  <div className={`w-10 h-10 rounded-full ${t.couleur} flex items-center justify-center text-white text-xs font-black shrink-0`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900 text-sm">{t.nom}</p>
                    <p className="text-xs text-zinc-400">📍 {t.ville}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ 6. CTA RÉPÉTITEURS ══════════ */}
      <section className="py-16 px-4 bg-zinc-900">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-black text-orange-400 uppercase tracking-widest bg-orange-500/10 px-3 py-1.5 rounded-full self-center md:self-start">
              Rejoignez-nous
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Vous êtes répétiteur ?</h2>
            <p className="text-zinc-400 text-sm max-w-md leading-relaxed">
              Publiez votre annonce gratuitement, définissez vos tarifs et trouvez vos premiers élèves dès aujourd&apos;hui.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2 justify-center md:justify-start">
              <Link
                href="/inscription"
                className="px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white font-black rounded-2xl text-sm transition-colors shadow-lg shadow-orange-900/30"
              >
                Déposer mon annonce gratuite
              </Link>
              <Link
                href="/comment-ca-marche"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-sm transition-colors border border-white/20"
              >
                En savoir plus
              </Link>
            </div>
          </div>

          <div className="shrink-0 bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-4 min-w-52">
            {[
              { val: "100%", label: "Gratuit pour publier" },
              { val: "0%",   label: "Commission sur 1er mois" },
              { val: "24h",  label: "Premiers contacts" },
            ].map(({ val, label }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-3xl font-black text-orange-400">{val}</span>
                <span className="text-xs text-zinc-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
