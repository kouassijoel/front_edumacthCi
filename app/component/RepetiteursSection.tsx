"use client";

import { useState, useCallback, useEffect } from "react";
import { SlidersHorizontal, X, MapPin, Star } from "lucide-react";
import Card from "./card";
import type { RepetiteurCard } from "@/lib/services/repetiteur.service";

const VILLES = ["Abidjan", "Bouaké", "Yamoussoukro", "Daloa", "San-Pédro", "Korhogo"];

function toCardProps(r: RepetiteurCard) {
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

async function fetchRepetiteurs(params: {
  matiere?: string;
  ville?: string;
  prix_max?: number;
  note_min?: number;
}): Promise<RepetiteurCard[]> {
  const qs = new URLSearchParams();
  if (params.matiere)  qs.set("matiere",   params.matiere);
  if (params.ville)    qs.set("ville",      params.ville);
  if (params.prix_max) qs.set("prix_max",   String(params.prix_max));
  if (params.note_min) qs.set("note_min",   String(params.note_min));
  qs.set("limit", "50");

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";
    const res = await fetch(`${apiBase}/repetiteurs?${qs}`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data as { resultats: RepetiteurCard[] } | RepetiteurCard[];
    return Array.isArray(data) ? data : (data.resultats ?? []);
  } catch {
    return [];
  }
}

interface Props {
  initial: RepetiteurCard[];
  initialMatiere?: string;
  initialVille?: string;
}

export default function RepetiteursSection({
  initial,
  initialMatiere = "",
  initialVille = "",
}: Props) {
  const [repetiteurs, setRepetiteurs] = useState<RepetiteurCard[]>(initial);
  const [loading, setLoading]         = useState(false);
  const [showFiltres, setShowFiltres] = useState(false);

  const [ville,   setVille]   = useState(initialVille);
  const [prixMax, setPrixMax] = useState<number | "">("");
  const [noteMin, setNoteMin] = useState<number | "">("");

  const filtresActifs = !!ville || prixMax !== "" || noteMin !== "";

  /* Sync si `initial` change (nouvelle matière depuis le serveur) */
  useEffect(() => {
    setRepetiteurs(initial);
  }, [initial]);

  const appliquer = useCallback(async () => {
    setLoading(true);
    const data = await fetchRepetiteurs({
      matiere:   initialMatiere || undefined,
      ville:     ville.trim()   || undefined,
      prix_max:  prixMax !== "" ? prixMax : undefined,
      note_min:  noteMin !== "" ? noteMin : undefined,
    });
    setRepetiteurs(data);
    setLoading(false);
    setShowFiltres(false);
  }, [initialMatiere, ville, prixMax, noteMin]);

  function reinitialiser() {
    setVille("");
    setPrixMax("");
    setNoteMin("");
    setRepetiteurs(initial);
    setShowFiltres(false);
  }

  const cartes = repetiteurs.map(toCardProps);

  return (
    <section id="repetiteurs" className="max-w-7xl mx-auto w-full px-4 pb-16 pt-6">

      {/* ── Barre de contrôle ── */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <p className="text-sm text-zinc-500">
          {loading ? (
            "Recherche en cours…"
          ) : (
            <>
              <strong className="text-zinc-900 text-base">{cartes.length}</strong>{" "}
              répétiteur{cartes.length !== 1 ? "s" : ""}
              {initialMatiere && (
                <> en{" "}
                  <span className="text-orange-500 font-semibold">{initialMatiere}</span>
                </>
              )}
            </>
          )}
        </p>

        <div className="flex items-center gap-2">
          {filtresActifs && (
            <button
              onClick={reinitialiser}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 font-semibold cursor-pointer"
            >
              <X size={11} /> Effacer les filtres
            </button>
          )}
          <button
            onClick={() => setShowFiltres((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-colors cursor-pointer ${
              showFiltres || filtresActifs
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-white text-zinc-600 border-zinc-200 hover:border-orange-300"
            }`}
          >
            <SlidersHorizontal size={14} />
            Filtres
            {filtresActifs && (
              <span className="bg-white/30 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {[ville, prixMax !== "", noteMin !== ""].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Panneau filtres ── */}
      {showFiltres && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 mb-6 flex flex-col gap-5">

          {/* Ville */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wide">
              <MapPin size={12} /> Ville
            </label>
            <div className="flex flex-wrap gap-2">
              {VILLES.map((v) => (
                <button
                  key={v}
                  onClick={() => setVille(ville === v ? "" : v)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                    ville === v
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-white border-zinc-200 text-zinc-500 hover:border-orange-400 hover:text-orange-500"
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Budget max */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
              Budget max (F/mois)
            </label>
            <div className="flex gap-2 flex-wrap">
              {[10000, 25000, 50000].map((p) => (
                <button
                  key={p}
                  onClick={() => setPrixMax(prixMax === p ? "" : p)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
                    prixMax === p
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-white border-zinc-200 text-zinc-500 hover:border-orange-300"
                  }`}
                >
                  ≤ {p.toLocaleString("fr-FR")} F
                </button>
              ))}
            </div>
          </div>

          {/* Note minimum */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 uppercase tracking-wide">
              <Star size={12} /> Note minimum
            </label>
            <div className="flex gap-2">
              {[["", "Tous"], ["3", "3★+"], ["4", "4★+"], ["4.5", "4.5★+"]].map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setNoteMin(val === "" ? "" : Number(val))}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-all ${
                    noteMin === (val === "" ? "" : Number(val))
                      ? "bg-orange-500 border-orange-500 text-white"
                      : "bg-white border-zinc-200 text-zinc-500 hover:border-orange-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
            <button
              onClick={reinitialiser}
              className="text-sm text-zinc-400 hover:text-zinc-600 font-medium cursor-pointer"
            >
              Réinitialiser
            </button>
            <button
              onClick={appliquer}
              disabled={loading}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              {loading ? "Recherche…" : "Appliquer"}
            </button>
          </div>
        </div>
      )}

      {/* ── Grille ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-zinc-100 rounded-3xl h-80 animate-pulse" />
          ))}
        </div>
      ) : cartes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {cartes.map((r) => (
            <Card key={r.id} {...r} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-zinc-100 p-16 text-center flex flex-col items-center gap-4">
          <span className="text-5xl">🔍</span>
          <div>
            <p className="text-base font-bold text-zinc-800">Aucun répétiteur trouvé</p>
            <p className="text-sm text-zinc-400 mt-1">
              Essayez d&apos;élargir vos critères de recherche.
            </p>
          </div>
          <button
            onClick={reinitialiser}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </section>
  );
}
