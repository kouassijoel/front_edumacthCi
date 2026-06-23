"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

type CardProps = {
  id: string;
  nom: string;
  photo: string;
  prixParHeure: number;
  description: string;
  note: number;
  nbAvis: number;
  ville?: string;
  boostBadge?: string | null;
  isFavori?: boolean;
  onFavoriToggle?: () => void;
};

function formatPrix(n: number): string {
  return n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const BADGE_STYLES: Record<string, string> = {
  "Top répétiteur": "bg-amber-400 text-amber-900",
  "Populaire":      "bg-orange-500 text-white",
  "Mis en avant":   "bg-blue-500 text-white",
};

export default function Card({ id, nom, photo, prixParHeure, description, note, nbAvis, ville, boostBadge, isFavori, onFavoriToggle }: CardProps) {
  const badgeStyle = boostBadge ? (BADGE_STYLES[boostBadge] ?? "bg-orange-500 text-white") : null;

  return (
    <div className="relative bg-white border-zinc-100 overflow-visible flex flex-col group">

      {/* Bouton favori — EN DEHORS du Link pour éviter la navigation */}
      <button
        onClick={() => onFavoriToggle ? onFavoriToggle() : (window.location.href = "/connexion")}
        className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors cursor-pointer"
        title={isFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        <Heart size={15} className={isFavori ? "fill-red-500 text-red-500" : "text-white"} />
      </button>

      <Link href={`/repetiteur/${id}`} className="flex flex-col flex-1">
        {/* Photo + dégradé */}
        <div className="relative h-80 w-full rounded-4xl overflow-hidden">
          {photo.startsWith("data:image") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt={`Photo de ${nom}`}
              className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <Image
              src={photo}
              alt={`Photo de ${nom}`}
              fill
              className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent" />

          {/* Badge boost */}
          

          {/* Nom + ville sur la photo */}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white font-extrabold text-base leading-tight drop-shadow">{nom}</p>
            {ville && (
              <p className="text-white/75 text-xs mt-0.5">📍 {ville}</p>
            )}
          </div>
        </div>

        {/* Corps */}
        <div className="flex flex-col gap-2 flex-1 pt-3">
          <div className="flex items-center gap-1.5 justify-between">
           <div className="flex items-center gap-1.5">
             <span className="text-yellow-400 text-xl">★</span>
            <span className="text-xs font-bold text-zinc-700">{note.toFixed(1)}</span>
            <span className="text-xs text-zinc-400">({nbAvis} avis)</span>
           </div>
            {boostBadge && badgeStyle && (
            <div >
              <span className={`flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-full shadow-lg ${badgeStyle}`}>
                <span>⚡</span>
                {boostBadge}
              </span>
            </div>
          )}
          </div>

          {description && (
            <p className="text-sm text-zinc-900 line-clamp-2 leading-relaxed flex-1">{description}</p>
          )}

          <div className="flex items-baseline gap-0.5 mt-auto border-zinc-100">
            <span className="text-lg font-extrabold text-zinc-800">{formatPrix(prixParHeure)}</span>
            <span className="text-xs text-zinc-400"> F/mois</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
