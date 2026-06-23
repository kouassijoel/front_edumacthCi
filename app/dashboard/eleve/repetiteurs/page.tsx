"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Users, BookOpen, Calendar, MessageCircle, CreditCard, Settings, LogOut } from "lucide-react";
import { Heart } from "lucide-react";
import { authService, type Utilisateur } from "@/lib/services/auth.service";
import { dashboardEleveService, favoriService, type RepetiteurActifRead, type FavoriRepetiteur, formatDateCours } from "@/lib/services/dashboard.service";

const NAV = [
  { label: "Tableau de bord",  href: "/dashboard/eleve",              Icon: Home },
  { label: "Mes répétiteurs",  href: "/dashboard/eleve/repetiteurs",  Icon: Users },
  { label: "Mes cours",        href: "/dashboard/eleve/cours",        Icon: BookOpen },
  { label: "Agenda",           href: "/dashboard/eleve/agenda",       Icon: Calendar },
  { label: "Messages",         href: "/dashboard/eleve",              Icon: MessageCircle },
  { label: "Paiements",        href: "/dashboard/eleve/paiement",     Icon: CreditCard },
  { label: "Paramètres",       href: "/dashboard/eleve/parametres",   Icon: Settings },
];

export default function RepetiteursPage() {
  const router = useRouter();
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [repetiteurs, setRepetiteurs] = useState<RepetiteurActifRead[]>([]);
  const [favoris, setFavoris] = useState<FavoriRepetiteur[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getMoi()
      .then((u) => {
        setUtilisateur(u);
        Promise.all([
          dashboardEleveService.charger(),
          favoriService.lister(),
        ])
          .then(([d, favs]) => { setRepetiteurs(d.repetiteurs_actifs); setFavoris(favs); })
          .catch(() => {})
          .finally(() => setLoading(false));
      })
      .catch(() => router.push("/connexion"));
  }, [router]);

  async function retirerFavori(repetiteurId: string) {
    try {
      await favoriService.retirer(repetiteurId);
      setFavoris((prev) => prev.filter((f) => f.repetiteur_id !== repetiteurId));
    } catch {}
  }

  const initiales = utilisateur ? `${utilisateur.prenom[0]}${utilisateur.nom[0]}`.toUpperCase() : "?";
  const nomComplet = utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "…";

  function Sidebar() {
    return (
      <>
        <div className="flex items-center gap-2 px-4 py-4 border-b border-zinc-100">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-lg font-extrabold text-orange-500">Edu</span>
            <span className="text-lg font-extrabold text-zinc-800">Match</span>
            <span className="ml-1 text-xs font-semibold text-white bg-green-600 rounded px-1 py-0.5">CI</span>
          </Link>
        </div>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-100">
          <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center shrink-0 overflow-hidden">
            {utilisateur?.photo_url ? (
              <img src={utilisateur.photo_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-orange-600">{initiales}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-zinc-800 truncate">{nomComplet}</span>
            <span className="text-xs text-blue-500">Élève</span>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-2 flex-1">
          {NAV.map((item) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${item.href === "/dashboard/eleve/repetiteurs" ? "bg-orange-500 text-white" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800"}`}>
              <item.Icon size={18} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-zinc-100">
          <button onClick={() => { authService.deconnecter(); router.push("/"); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 w-full cursor-pointer">
            <LogOut size={16} /><span>Se déconnecter</span>
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-zinc-100 font-sans">
      <aside className="hidden lg:flex w-60 bg-white border-r border-zinc-100 flex-col shrink-0 h-screen sticky top-0">
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-zinc-100 px-6 py-4 sticky top-0 z-40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/eleve" className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors shrink-0">
              <span className="text-lg leading-none">←</span>
            </Link>
            <div>
              <h1 className="text-lg font-extrabold text-zinc-800">Mes répétiteurs</h1>
              <p className="text-xs text-zinc-400">Vos répétiteurs actifs</p>
            </div>
          </div>
          <Link href="/" className="text-sm font-semibold text-orange-500 border border-orange-300 px-4 py-2 rounded-full hover:bg-orange-50 transition-colors">
            + Trouver un répétiteur
          </Link>
        </header>
        <main className="flex-1 p-6 flex flex-col gap-8">

          {/* ── Favoris sauvegardés ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart size={16} className="text-red-400 fill-red-400" />
              <h2 className="text-sm font-bold text-zinc-700">Favoris sauvegardés</h2>
              {favoris.length > 0 && (
                <span className="text-xs bg-red-100 text-red-500 font-bold px-2 py-0.5 rounded-full">{favoris.length}</span>
              )}
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1,2].map((i) => <div key={i} className="bg-white rounded-2xl border h-32 animate-pulse" />)}
              </div>
            ) : favoris.length === 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-100 p-6 text-center text-sm text-zinc-400">
                Aucun répétiteur en favoris. Cliquez sur ❤ sur une fiche pour en sauvegarder un.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoris.map((f) => {
                  const photo = f.photo_url || `https://i.pravatar.cc/300?u=${f.repetiteur_id}`;
                  return (
                    <div key={f.repetiteur_id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-red-100 shrink-0">
                          <Image src={photo} alt={f.prenom} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-zinc-800 truncate">{f.prenom} {f.nom}</p>
                          <p className="text-xs text-zinc-400">{f.ville ?? "—"}</p>
                        </div>
                        <button onClick={() => retirerFavori(f.repetiteur_id)}
                          className="text-red-300 hover:text-red-500 transition-colors cursor-pointer" title="Retirer des favoris">
                          <Heart size={16} className="fill-red-400 text-red-400" />
                        </button>
                      </div>
                      {f.matieres && f.matieres.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {f.matieres.slice(0, 3).map((m) => (
                            <span key={m} className="text-xs bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full font-medium">{m}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500">
                          {f.prix_par_heure ? `${f.prix_par_heure.toLocaleString("fr-FR")} F/h` : "—"}
                        </span>
                        <span className="text-xs font-bold text-yellow-600">★ {f.note.toFixed(1)}</span>
                      </div>
                      <Link href={`/repetiteur/${f.repetiteur_id}`}
                        className="w-full py-2 text-center text-xs font-bold text-orange-500 border border-orange-200 hover:bg-orange-50 rounded-xl transition-colors">
                        Voir le profil
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Répétiteurs actifs ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-blue-400" />
              <h2 className="text-sm font-bold text-zinc-700">Répétiteurs actifs</h2>
            </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map((i) => <div key={i} className="bg-white rounded-2xl border h-40 animate-pulse" />)}
            </div>
          ) : repetiteurs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-12 flex flex-col items-center gap-4">
              <Users size={48} className="text-orange-300" />
              <p className="text-base font-bold text-zinc-700">Aucun répétiteur actif</p>
              <p className="text-sm text-zinc-400 text-center max-w-xs">Commencez par trouver un répétiteur et planifier un cours.</p>
              <Link href="/" className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors">
                Trouver un répétiteur
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {repetiteurs.map((r) => {
                const photo = r.photo_url || `https://i.pravatar.cc/300?u=${r.id}`;
                return (
                  <div key={r.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-orange-100 shrink-0">
                        <Image src={photo} alt={r.prenom} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-800 truncate">{r.prenom} {r.nom}</p>
                        <p className="text-xs text-orange-500">{r.matieres?.[0] ?? ""}</p>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <span className="text-orange-400 text-sm">★</span>
                        <span className="text-xs font-bold text-zinc-700">{r.note.toFixed(1)}</span>
                      </div>
                    </div>
                    {r.matieres && r.matieres.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {r.matieres.slice(0, 3).map((m) => (
                          <span key={m} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{m}</span>
                        ))}
                      </div>
                    )}
                    {r.prochain_cours && (
                      <div className="bg-orange-50 rounded-xl px-3 py-2 flex items-center gap-2">
                        <Calendar size={14} className="text-orange-500 shrink-0" />
                        <div>
                          <p className="text-xs text-zinc-500">Prochain cours</p>
                          <p className="text-xs font-bold text-zinc-800">{formatDateCours(r.prochain_cours)}</p>
                        </div>
                      </div>
                    )}
                    <Link href={`/repetiteur/${r.id}`}
                      className="w-full py-2 text-center text-sm font-bold text-orange-500 border border-orange-300 hover:bg-orange-50 rounded-xl transition-colors">
                      Voir le profil
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}
