"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Calculator,
  Atom,
  FlaskConical,
  Globe,
  BookOpen,
  Monitor,
  Map,
  Leaf,
  Sigma,
  Languages,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

const MATIERES = [
  { label: "Mathématiques", Icon: Calculator,  slug: "Math%C3%A9matiques" },
  { label: "Physique",      Icon: Atom,         slug: "Physique" },
  { label: "Chimie",        Icon: FlaskConical, slug: "Chimie" },
  { label: "Anglais",       Icon: Languages,    slug: "Anglais" },
  { label: "Français",      Icon: BookOpen,     slug: "Fran%C3%A7ais" },
  { label: "Informatique",  Icon: Monitor,      slug: "Informatique" },
  { label: "Histoire-Géo",  Icon: Map,          slug: "Histoire-G%C3%A9o" },
  { label: "SVT",           Icon: Leaf,         slug: "SVT" },
  { label: "Économie",      Icon: Sigma,        slug: "%C3%89conomie" },
  { label: "Philosophie",   Icon: Globe,        slug: "Philosophie" },
];

export default function HeroSearch() {
  const router = useRouter();
  const [matiere, setMatiere] = useState("");
  const [saisie, setSaisie] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function rechercher(e?: React.SyntheticEvent) {
    e?.preventDefault();
    if (matiere.trim()) {
      router.push(`/cours/${encodeURIComponent(matiere.trim())}`);
    }
  }

  function scrollSuivant() {
    scrollRef.current?.scrollBy({ left: 220, behavior: "smooth" });
    setScrolled(true);
  }

  function scrollPrecedent() {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: -220, behavior: "smooth" });
    setTimeout(() => setScrolled(el.scrollLeft - 220 > 0), 300);
  }

  return (
    <div className="w-full flex flex-col  items-center gap-6">
      {/* Barre de recherche */}
      <form
        onSubmit={rechercher}
        className="w-full max-w-xl border-4 border-red-50 bg-white rounded-4xl shadow-sm   flex items-center pl-5 pr-2 py-2 gap-2"
      >
        <Search size={18} className="text-orange-400 shrink-0" strokeWidth={2} />
        <input
          type="text"
          value={matiere}
          onChange={(e) => { setMatiere(e.target.value); setSaisie(e.target.value); }}
          placeholder='Essayez "Mathématiques", "Anglais"…'
          className="flex-1 text-zinc-700 placeholder-zinc-400 focus:outline-none text-sm bg-transparent"
        />
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-4 rounded-4xl transition-colors text-sm cursor-pointer shrink-0"
        >
          Rechercher
        </button>
      </form>

      {/* Capsule matières */}
      <div className="w-full max-w-3xl relative">
        {/* Bouton précédent */}
        {scrolled && (
          <button
            onClick={scrollPrecedent}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors cursor-pointer z-10"
          >
            <ChevronLeft size={18} className="text-zinc-600" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="w-full bg-orange-100 shadow-sm rounded-4xl flex items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-2"
        >
          {MATIERES.map((m) => (
            <Link
              key={m.label}
              href={`/cours/${m.slug}`}
              onMouseEnter={() => setMatiere(m.label)}
              onMouseLeave={() => setMatiere(saisie)}
              className="flex flex-col items-center gap-2 my-4 px-6 py-2 hover:bg-orange-50 transition-colors shrink-0 group rounded-2xl"
            >
              <m.Icon
                size={26}
                className="text-zinc-700 group-hover:text-orange-500 transition-colors"
                strokeWidth={1.5}
              />
              <span className="text-xs font-medium text-zinc-600 whitespace-nowrap group-hover:text-orange-500 transition-colors">
                {m.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Bouton suivant */}
        <button
          onClick={scrollSuivant}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors cursor-pointer z-10"
        >
          <ChevronRight size={18} className="text-zinc-600" />
        </button>
      </div>
    </div>
  );
}
