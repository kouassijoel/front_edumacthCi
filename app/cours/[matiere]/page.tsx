import Link from "next/link";
import Header from "@/app/component/header";
import Footer from "@/app/component/footer";
import RepetiteursSection from "@/app/component/RepetiteursSection";
import type { RepetiteurCard } from "@/lib/services/repetiteur.service";

/* ─── Fetch ─────────────────────────────────────────────────────────────── */

async function fetchParMatiere(
  matiere: string,
): Promise<{ resultats: RepetiteurCard[]; total: number }> {
  try {
    const qs = new URLSearchParams({ matiere, limit: "50" });
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";
    const res = await fetch(`${apiBase}/repetiteurs?${qs}`, {
      cache: "no-store",
    });
    if (!res.ok) return { resultats: [], total: 0 };
    const json = await res.json();
    const data = json.data as
      | { resultats: RepetiteurCard[]; total: number }
      | RepetiteurCard[];
    if (Array.isArray(data)) return { resultats: data, total: data.length };
    return { resultats: data.resultats ?? [], total: data.total ?? 0 };
  } catch {
    return { resultats: [], total: 0 };
  }
}

/* ─── Config par matière ────────────────────────────────────────────────── */

const CONFIGS: Record<
  string,
  { emoji: string; from: string; to: string; description: string }
> = {
  "Mathématiques": {
    emoji: "🧮",
    from: "#1d4ed8",
    to: "#1e40af",
    description:
      "Algèbre, géométrie, analyse, probabilités… Nos répétiteurs en Maths couvrent tous les niveaux du primaire au supérieur.",
  },
  "Physique": {
    emoji: "⚛️",
    from: "#7c3aed",
    to: "#4c1d95",
    description:
      "Mécanique, électricité, optique, thermodynamique… Maîtrisez la physique avec des experts passionnés.",
  },
  "Chimie": {
    emoji: "🧪",
    from: "#059669",
    to: "#065f46",
    description:
      "Chimie organique, minérale, équations… Progressez rapidement avec des répétiteurs spécialisés.",
  },
  "Anglais": {
    emoji: "🌍",
    from: "#ea580c",
    to: "#9a3412",
    description:
      "Expression orale, grammaire, TOEFL, IELTS… Parlez anglais avec confiance grâce à nos répétiteurs.",
  },
  "Français": {
    emoji: "📖",
    from: "#e11d48",
    to: "#9f1239",
    description:
      "Rédaction, grammaire, littérature, dissertation… Améliorez votre français avec des professeurs expérimentés.",
  },
  "Informatique": {
    emoji: "💻",
    from: "#0891b2",
    to: "#0c4a6e",
    description:
      "Python, algorithmique, bases de données, web… Apprenez l'informatique avec des experts du domaine.",
  },
  "Histoire-Géo": {
    emoji: "🗺️",
    from: "#d97706",
    to: "#78350f",
    description:
      "Histoire, géographie, éducation civique… Réviser les grandes dates et les enjeux du monde avec nos répétiteurs.",
  },
  "SVT": {
    emoji: "🌿",
    from: "#16a34a",
    to: "#14532d",
    description:
      "Biologie, géologie, écologie… Explorez les sciences du vivant avec des répétiteurs passionnés par la nature.",
  },
  "Économie": {
    emoji: "📊",
    from: "#4f46e5",
    to: "#312e81",
    description:
      "Microéconomie, macroéconomie, comptabilité, finance… Maîtrisez l'économie avec des professionnels.",
  },
  "Philosophie": {
    emoji: "🤔",
    from: "#db2777",
    to: "#831843",
    description:
      "Dissertation, auteurs, raisonnement logique… Développez votre sens critique avec nos répétiteurs en philosophie.",
  },
};

const DEFAULT_CONFIG = {
  emoji: "📚",
  from: "#f97316",
  to: "#c2410c",
  description:
    "Trouvez le répétiteur idéal pour cette matière parmi nos professeurs vérifiés en Côte d'Ivoire.",
};

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default async function CoursMatierePage({
  params,
}: {
  params: Promise<{ matiere: string }>;
}) {
  const { matiere: slug } = await params;
  const matiere = decodeURIComponent(slug);
  const { resultats, total } = await fetchParMatiere(matiere);

  const cfg = CONFIGS[matiere] ?? DEFAULT_CONFIG;

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Header />

      {/* ══════════ HERO MATIÈRE ══════════ */}
      <section
        className="relative overflow-hidden py-14 sm:py-20 px-4 rounded-b-4xl"
        style={{
          background: `linear-gradient(135deg, ${cfg.from} 0%, ${cfg.to} 100%)`,
        }}
      >
        {/* Pattern décoratif */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 36px)," +
              "repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 36px)",
          }}
        />
        {/* Blob décoratif */}
        <div
          aria-hidden
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "#ffffff" }}
        />

        <div className="relative max-w-5xl mx-auto flex flex-col gap-6">
          {/* Fil d'Ariane */}
          <nav className="flex items-center gap-1.5 text-white/70 text-xs font-medium">
            <Link href="/" className="hover:text-white transition-colors">
              Accueil
            </Link>
            <span>›</span>
            <Link
              href="/repetiteurs"
              className="hover:text-white transition-colors"
            >
              Répétiteurs
            </Link>
            <span>›</span>
            <span className="text-white font-bold">{matiere}</span>
          </nav>

          {/* Contenu principal */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Icône matière */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/15 backdrop-blur border border-white/25 flex items-center justify-center text-4xl sm:text-5xl shadow-lg shrink-0">
              {cfg.emoji}
            </div>

            <div className="flex flex-col gap-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
                Répétiteurs en<br className="hidden sm:block" />{" "}
                <span className="text-white/90">{matiere}</span>
              </h1>
              <p className="text-white/75 text-sm sm:text-base max-w-xl leading-relaxed">
                {cfg.description}
              </p>
            </div>
          </div>

          {/* Stats + badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Nombre de résultats */}
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur border border-white/25 rounded-full px-4 py-2">
              <span className="text-white font-black text-lg">{total > 0 ? total : resultats.length}</span>
              <span className="text-white/80 text-sm font-medium">
                répétiteur{(total > 1 || resultats.length > 1) ? "s" : ""} disponible{(total > 1 || resultats.length > 1) ? "s" : ""}
              </span>
            </div>
            {["À domicile", "En ligne", "Profils vérifiés"].map((tag) => (
              <span
                key={tag}
                className="text-xs font-semibold text-white/90 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full"
              >
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ LISTE DES RÉPÉTITEURS ══════════ */}
      <RepetiteursSection initial={resultats} initialMatiere={matiere} />

      <Footer />
    </div>
  );
}
