"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Search, MapPin, SlidersHorizontal, X, CheckCircle,
  LocateFixed, Calculator, Atom, FlaskConical, Globe,
  BookOpen, Monitor, Map, Leaf, Sigma, Languages, ChevronDown,
} from "lucide-react";
import Card from "./card";
import type { RepetiteurCard } from "@/lib/services/repetiteur.service";
import { favoriService } from "@/lib/services/dashboard.service";

const MATIERES_ICONES = [
  { label: "Maths",        Icon: Calculator,  slug: "Mathématiques" },
  { label: "Physique",     Icon: Atom,         slug: "Physique" },
  { label: "Chimie",       Icon: FlaskConical, slug: "Chimie" },
  { label: "Anglais",      Icon: Languages,    slug: "Anglais" },
  { label: "Français",     Icon: BookOpen,     slug: "Français" },
  { label: "Informatique", Icon: Monitor,      slug: "Informatique" },
  { label: "Histoire-Géo", Icon: Map,          slug: "Histoire-Géo" },
  { label: "SVT",          Icon: Leaf,         slug: "SVT" },
  { label: "Économie",     Icon: Sigma,        slug: "Économie" },
  { label: "Philosophie",  Icon: Globe,        slug: "Philosophie" },
];

const VILLES_CI = [
  "Abidjan", "Bouaké", "Daloa", "San-Pédro", "Yamoussoukro",
  "Korhogo", "Man", "Gagnoa", "Divo", "Abengourou",
];

const MODALITES = [
  { val: "domicile_eleve", label: "À domicile", icon: "🏠" },
  { val: "en_ligne",       label: "En ligne",   icon: "💻" },
  { val: "domicile_prof",  label: "Présentiel", icon: "🏫" },
];

const TRIS = [
  { val: "",           label: "Pertinence" },
  { val: "note_desc",  label: "Meilleures notes" },
  { val: "prix_asc",   label: "Prix croissant" },
  { val: "prix_desc",  label: "Prix décroissant" },
  { val: "experience", label: "Expérience" },
];

function toCardProps(r: RepetiteurCard) {
  return {
    id: r.id,
    nom: `${r.prenom} ${r.nom}`,
    matiere: r.matieres?.[0] ?? "—",
    photo: r.photo_url ?? `https://i.pravatar.cc/300?u=${r.id}`,
    prixParHeure: r.prix_par_heure ?? 0,
    description: r.titre_annonce ?? r.bio ?? "",
    note: r.note,
    nbAvis: r.nb_avis,
    ville: r.ville ?? undefined,
    boostBadge: r.boost_badge ?? null,
  };
}

const PAGE_SIZE = 10;

async function fetchRepetiteurs(
  params: Record<string, string | number | boolean | undefined>,
  offset = 0,
) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && v !== false) qs.set(k, String(v));
  }
  qs.set("limit", String(PAGE_SIZE));
  qs.set("offset", String(offset));
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";
    const res = await fetch(`${apiBase}/repetiteurs?${qs}`, { cache: "no-store" });
    if (!res.ok) return { total: 0, resultats: [] as RepetiteurCard[] };
    const json = await res.json();
    const data = json.data as { total: number; resultats: RepetiteurCard[] } | RepetiteurCard[];
    if (Array.isArray(data)) return { total: data.length, resultats: data };
    return data;
  } catch {
    return { total: 0, resultats: [] as RepetiteurCard[] };
  }
}

// ── Panneau filtres (partagé desktop sidebar + mobile drawer) ──────────────
function PanneauFiltres({
  ville, setVille,
  modalite, setModalite,
  prixMax, setPrixMax,
  noteMin, setNoteMin,
  tri, setTri,
  nbFiltresActifs, resetFiltres,
  geoLoading, detecterVille,
  onClose,
}: {
  ville: string; setVille: (v: string) => void;
  modalite: string; setModalite: (m: string) => void;
  prixMax: number | ""; setPrixMax: (v: number | "") => void;
  noteMin: number | ""; setNoteMin: (v: number | "") => void;
  tri: string; setTri: (v: string) => void;
  nbFiltresActifs: number; resetFiltres: () => void;
  geoLoading: boolean; detecterVille: () => void;
  onClose?: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-800 flex items-center gap-2">
          <SlidersHorizontal size={14} className="text-orange-500" />
          Filtres
          {nbFiltresActifs > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {nbFiltresActifs}
            </span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {nbFiltresActifs > 0 && (
            <button onClick={resetFiltres} className="text-xs text-red-400 hover:text-red-600 font-medium cursor-pointer">
              Effacer
            </button>
          )}
          {onClose != null && (
            <button onClick={onClose} className="text-zinc-400 hover:text-zinc-700 cursor-pointer p-1">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Ville */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Ville</label>
        <div className="flex items-center gap-2 border border-zinc-200 rounded-xl px-3 py-2.5 bg-zinc-50">
          <MapPin size={13} className="text-zinc-400 shrink-0" />
          <select value={ville} onChange={(e) => setVille(e.target.value)}
            className="flex-1 text-sm bg-transparent focus:outline-none cursor-pointer text-zinc-700">
            <option value="">Toutes les villes</option>
            {VILLES_CI.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <button onClick={detecterVille} disabled={geoLoading}
            className="text-orange-400 hover:text-orange-600 cursor-pointer shrink-0" title="Détecter ma position">
            <LocateFixed size={14} className={geoLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Mode de cours */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Mode</label>
        <div className="flex flex-col gap-1.5">
          {MODALITES.map((m) => (
            <button key={m.val} onClick={() => setModalite(modalite === m.val ? "" : m.val)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                modalite === m.val ? "bg-orange-50 border-orange-400 text-orange-600" : "bg-white border-zinc-200 text-zinc-600 hover:border-orange-200"
              }`}>
              <span>{m.icon}</span>
              <span className="text-xs">{m.label}</span>
              {modalite === m.val && <CheckCircle size={13} className="ml-auto text-orange-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* Budget max */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Budget max (F/h)</label>
        <input type="number" min={0} placeholder="Ex : 25 000" value={prixMax}
          onChange={(e) => setPrixMax(e.target.value ? Number(e.target.value) : "")}
          className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-zinc-50" />
        <div className="flex gap-1.5 flex-wrap">
          {[[10000,"10.000"],[25000,"25.000"],[50000,"50.000"]].map(([v, l]) => (
            <button key={v} onClick={() => setPrixMax(prixMax === v ? "" : v as number)}
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors cursor-pointer ${
                prixMax === v ? "bg-orange-500 text-white border-orange-500" : "bg-white text-zinc-500 border-zinc-200 hover:border-orange-300"
              }`}>
              ≤ {l} F
            </button>
          ))}
        </div>
      </div>

      {/* Note minimum */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Note minimum</label>
        <div className="flex gap-1.5 flex-wrap">
          {[["", "Tous"], ["3", "3★+"], ["4", "4★+"], ["4.5", "4.5★+"]].map(([val, label]) => (
            <button key={val} onClick={() => setNoteMin(val === "" ? "" : Number(val))}
              className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
                noteMin === (val === "" ? "" : Number(val)) ? "bg-orange-500 text-white border-orange-500" : "bg-white text-zinc-600 border-zinc-200 hover:border-orange-300"
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Trier par */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Trier par</label>
        <div className="relative">
          <select value={tri} onChange={(e) => setTri(e.target.value)}
            className="w-full appearance-none px-3 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-zinc-50 cursor-pointer pr-8">
            {TRIS.map((t) => <option key={t.val} value={t.val}>{t.label}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

// ── Composant principal ────────────────────────────────────────────────────
interface Props { initial: RepetiteurCard[]; initialTotal?: number }

export default function SearchSection({ initial, initialTotal }: Props) {
  const resultatsRef = useRef<HTMLDivElement>(null);
  const premierMontage = useRef(true);
  const [favorisIds, setFavorisIds] = useState<Set<string>>(new Set());

  const [repetiteurs, setRepetiteurs] = useState<RepetiteurCard[]>(initial);
  const [total, setTotal] = useState(initialTotal ?? initial.length);
  const [offset, setOffset] = useState(initial.length);
  const [loading, setLoading] = useState(false);
  const [loadingPlus, setLoadingPlus] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [drawerOuvert, setDrawerOuvert] = useState(false);

  const [matiere, setMatiere] = useState("");
  const [matiereInput, setMatiereInput] = useState("");
  const [ville, setVille] = useState("");
  const [prixMax, setPrixMax] = useState<number | "">("");
  const [noteMin, setNoteMin] = useState<number | "">("");
  const [modalite, setModalite] = useState("");
  const [tri, setTri] = useState("");

  const buildParams = useCallback((matiereOverride?: string) => ({
    matiere: (matiereOverride !== undefined ? matiereOverride : matiere) || undefined,
    ville: ville || undefined,
    prix_max: prixMax !== "" ? prixMax : undefined,
    note_min: noteMin !== "" ? noteMin : undefined,
    modalite: modalite || undefined,
    tri: tri || undefined,
  }), [matiere, ville, prixMax, noteMin, modalite, tri]);

  const chercher = useCallback(async (matiereOverride?: string) => {
    setLoading(true);
    const res = await fetchRepetiteurs(buildParams(matiereOverride), 0);
    setRepetiteurs(res.resultats);
    setTotal(res.total);
    setOffset(PAGE_SIZE);
    setLoading(false);
  }, [buildParams]);

  async function chargerPlus() {
    setLoadingPlus(true);
    const res = await fetchRepetiteurs(buildParams(), offset);
    setRepetiteurs((prev) => [...prev, ...res.resultats]);
    setOffset((o) => o + PAGE_SIZE);
    setLoadingPlus(false);
  }

  useEffect(() => {
    if (premierMontage.current) { premierMontage.current = false; return; }
    chercher();
  }, [chercher]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) return;
    favoriService.lister()
      .then((favs) => setFavorisIds(new Set(favs.map((f) => f.repetiteur_id))))
      .catch(() => {});
  }, []);

  async function toggleFavori(repetiteurId: string) {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (!token) { window.location.href = "/connexion"; return; }
    try {
      if (favorisIds.has(repetiteurId)) {
        await favoriService.retirer(repetiteurId);
        setFavorisIds((prev) => { const next = new Set(prev); next.delete(repetiteurId); return next; });
      } else {
        await favoriService.ajouter(repetiteurId);
        setFavorisIds((prev) => new Set([...prev, repetiteurId]));
      }
    } catch {}
  }

  function lancerRecherche() {
    setMatiere(matiereInput);
    resultatsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectionnerMatiere(slug: string) {
    const val = matiere === slug ? "" : slug;
    setMatiere(val);
    setMatiereInput(val === slug ? "" : slug);
    setTimeout(() => resultatsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  }

  function detecterVille() {
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const villes = [
          { nom: "Abidjan",      lat: 5.36,  lng: -4.00 },
          { nom: "Bouaké",       lat: 7.69,  lng: -5.03 },
          { nom: "Yamoussoukro", lat: 6.82,  lng: -5.27 },
          { nom: "Daloa",        lat: 6.87,  lng: -6.45 },
          { nom: "San-Pédro",    lat: 4.74,  lng: -6.64 },
          { nom: "Korhogo",      lat: 9.46,  lng: -5.62 },
          { nom: "Man",          lat: 7.41,  lng: -7.55 },
          { nom: "Gagnoa",       lat: 6.13,  lng: -5.95 },
        ];
        let proche = villes[0];
        let dMin = Infinity;
        for (const v of villes) {
          const d = Math.hypot(latitude - v.lat, longitude - v.lng);
          if (d < dMin) { dMin = d; proche = v; }
        }
        setVille(proche.nom);
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { timeout: 8000 }
    );
  }

  function resetFiltres() {
    setMatiere(""); setMatiereInput(""); setVille("");
    setPrixMax(""); setNoteMin(""); setModalite(""); setTri("");
    setOffset(PAGE_SIZE);
  }

  const nbFiltresActifs = [
    ville, prixMax !== "", noteMin !== "", modalite,
  ].filter(Boolean).length;

  const cartes = repetiteurs.map(toCardProps);

  const filtresProps = {
    ville, setVille, modalite, setModalite,
    prixMax, setPrixMax, noteMin, setNoteMin,
    tri, setTri,
    nbFiltresActifs, resetFiltres, geoLoading, detecterVille,
  };

  return (
    <>
      {/* ── HERO ── */}
      <section className="w-full bg-orange-50 py-10 sm:py-16 px-4 rounded-b-lg">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6 sm:gap-8 text-center">

          <div className="flex flex-col gap-2 sm:gap-3">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-zinc-900 leading-[1.1] tracking-tight">
              Trouvez le<br />répétiteur parfait
            </h1>
            <p className="text-zinc-500 text-sm sm:text-base">
              Des répétiteurs qualifiés partout en Côte d&apos;Ivoire
            </p>
          </div>

          {/* Barre de recherche */}
          <div className="w-full max-w-2xl flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center gap-2 bg-white rounded-2xl shadow-md border border-zinc-100 px-4 py-3 sm:px-5">
              <Search size={18} className="text-orange-400 shrink-0" />
              <input
                type="text"
                value={matiereInput}
                onChange={(e) => setMatiereInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lancerRecherche()}
                placeholder='Matière… "Maths Terminale"'
                className="flex-1 text-zinc-700 placeholder-zinc-400 focus:outline-none text-sm bg-transparent min-w-0"
              />
              {matiereInput && (
                <button onClick={() => { setMatiereInput(""); setMatiere(""); }}
                  className="text-zinc-400 hover:text-zinc-600 cursor-pointer shrink-0">
                  <X size={14} />
                </button>
              )}
              <button onClick={lancerRecherche}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-colors text-sm cursor-pointer shrink-0">
                Chercher
              </button>
            </div>

            {/* Géolocalisation */}
            <div className="flex items-center justify-center gap-2">
              <button onClick={detecterVille} disabled={geoLoading}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-orange-500 transition-colors cursor-pointer">
                <LocateFixed size={13} className={geoLoading ? "animate-spin text-orange-400" : ""} />
                {geoLoading ? "Détection…" : ville ? `📍 ${ville}` : "Détecter ma ville"}
              </button>
              {ville && (
                <button onClick={() => setVille("")} className="text-zinc-300 hover:text-red-400 cursor-pointer">
                  <X size={11} />
                </button>
              )}
            </div>
          </div>

          {/* Matières rapides — scroll horizontal */}
          
        </div>
      </section>

      {/* ── RÉSULTATS ── */}
      <section ref={resultatsRef} id="repetiteurs" className="max-w-7xl mx-auto w-full px-4 py-6 sm:py-8">

        {/* Barre de contrôle mobile */}
        <div className="flex items-center justify-between mb-4 gap-3">
          <p className="text-sm text-zinc-500 min-w-0 truncate">
            {loading ? "Recherche…" : (
              <>
                <strong className="text-zinc-800">{total}</strong> répétiteur{total !== 1 ? "s" : ""}
                {matiere && <> — <span className="text-orange-500 truncate">{matiere}</span></>}
                {ville && <> à <strong>{ville}</strong></>}
              </>
            )}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            {nbFiltresActifs > 0 && (
              <button onClick={resetFiltres}
                className="hidden sm:flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-medium cursor-pointer">
                <X size={11} /> Effacer
              </button>
            )}
            {/* Bouton filtres — mobile + desktop */}
            <button
              onClick={() => setDrawerOuvert(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-colors cursor-pointer lg:hidden ${
                nbFiltresActifs > 0 ? "bg-orange-500 text-white border-orange-500" : "bg-white text-zinc-600 border-zinc-200"
              }`}>
              <SlidersHorizontal size={15} />
              Filtres{nbFiltresActifs > 0 && ` · ${nbFiltresActifs}`}
            </button>
          </div>
        </div>

        {/* Layout desktop : sidebar + grille */}
        <div className="flex gap-6">

          {/* Sidebar desktop */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 sticky top-20">
              <PanneauFiltres {...filtresProps} />
            </div>
          </aside>

          {/* Grille résultats */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-zinc-100 h-72 animate-pulse" />
                ))}
              </div>
            ) : cartes.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {cartes.map((r) => (
                    <Card
                      key={r.id}
                      {...r}
                      isFavori={favorisIds.has(r.id)}
                      onFavoriToggle={() => toggleFavori(r.id)}
                    />
                  ))}
                </div>

                {total > cartes.length && (
                  <div className="mt-8 flex flex-col items-center gap-3">
                    <button
                      onClick={chargerPlus}
                      disabled={loadingPlus}
                      className="px-8 py-3 bg-white border-2 border-orange-400 text-orange-500 hover:bg-orange-500 hover:text-white disabled:opacity-50 font-bold rounded-2xl text-sm transition-all cursor-pointer flex items-center gap-2 shadow-sm"
                    >
                      {loadingPlus ? (
                        <>
                          <span className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                          Chargement…
                        </>
                      ) : (
                        <>Voir plus de répétiteurs</>
                      )}
                    </button>
                    <p className="text-xs text-zinc-400">
                      {cartes.length} sur {total} répétiteurs
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-zinc-100 p-12 sm:p-16 text-center flex flex-col items-center gap-4">
                <span className="text-5xl">🔍</span>
                <div>
                  <p className="text-base font-bold text-zinc-800">Aucun répétiteur trouvé</p>
                  <p className="text-sm text-zinc-400 mt-1">Essayez d&apos;élargir vos critères.</p>
                </div>
                <button onClick={resetFiltres}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer">
                  Réinitialiser les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── DRAWER MOBILE (bottom sheet) ── */}
      {drawerOuvert && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setDrawerOuvert(false)}
          />
          {/* Panneau */}
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col">
            {/* Poignée */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-zinc-200 rounded-full" />
            </div>
            {/* Contenu scrollable */}
            <div className="overflow-y-auto flex-1 px-5 pb-6 pt-2">
              <PanneauFiltres
                {...filtresProps}
                onClose={() => setDrawerOuvert(false)}
              />
            </div>
            {/* Bouton appliquer */}
            <div className="px-5 pb-6 pt-3 border-t border-zinc-100 bg-white shrink-0">
              <button
                onClick={() => setDrawerOuvert(false)}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-sm transition-colors cursor-pointer">
                Voir {total} répétiteur{total !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
