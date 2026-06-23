"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Users, BookOpen, Calendar, MessageCircle, CreditCard, Settings, LogOut, Check, X } from "lucide-react";
import { authService, type Utilisateur } from "@/lib/services/auth.service";
import { dashboardEleveService, type CoursEleveRead, formatDuree } from "@/lib/services/dashboard.service";

const NAV = [
  { label: "Tableau de bord",  href: "/dashboard/eleve",              Icon: Home },
  { label: "Mes répétiteurs",  href: "/dashboard/eleve/repetiteurs",  Icon: Users },
  { label: "Mes cours",        href: "/dashboard/eleve/cours",        Icon: BookOpen },
  { label: "Agenda",           href: "/dashboard/eleve/agenda",       Icon: Calendar },
  { label: "Messages",         href: "/dashboard/eleve",              Icon: MessageCircle },
  { label: "Paiements",        href: "/dashboard/eleve/paiement",     Icon: CreditCard },
  { label: "Paramètres",       href: "/dashboard/eleve/parametres",   Icon: Settings },
];

function groupParJour(cours: CoursEleveRead[]): Map<string, CoursEleveRead[]> {
  const map = new Map<string, CoursEleveRead[]>();
  for (const c of cours) {
    const d = new Date(c.date_heure);
    const key = d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
    map.set(key, [...(map.get(key) ?? []), c]);
  }
  return map;
}

export default function AgendaElevePage() {
  const router = useRouter();
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [cours, setCours] = useState<CoursEleveRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    authService.getMoi()
      .then((u) => {
        setUtilisateur(u);
        dashboardEleveService.charger()
          .then((d) => setCours(d.prochains_cours))
          .catch(() => {})
          .finally(() => setLoading(false));
      })
      .catch(() => router.push("/connexion"));
  }, [router]);

  const initiales = utilisateur ? `${utilisateur.prenom[0]}${utilisateur.nom[0]}`.toUpperCase() : "?";
  const nomComplet = utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "…";
  const groupes = groupParJour(cours);

  async function accepter(coursId: string) {
    setActionEnCours(coursId);
    setErreur(null);
    try {
      await dashboardEleveService.accepterCours(coursId);
      setCours((prev) => prev.map((c) => c.id === coursId ? { ...c, statut: "confirme" } : c));
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur lors de la confirmation");
    } finally {
      setActionEnCours(null);
    }
  }

  async function annuler(coursId: string) {
    setActionEnCours(coursId);
    setErreur(null);
    try {
      await dashboardEleveService.refuserCours(coursId);
      setCours((prev) => prev.map((c) => c.id === coursId ? { ...c, statut: "annule" } : c));
    } catch (e) {
      setErreur(e instanceof Error ? e.message : "Erreur lors de l'annulation");
    } finally {
      setActionEnCours(null);
    }
  }

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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${item.href === "/dashboard/eleve/agenda" ? "bg-orange-500 text-white" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800"}`}>
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
        <header className="bg-white border-b border-zinc-100 px-6 py-4 sticky top-0 z-40 flex items-center gap-3">
          <Link href="/dashboard/eleve" className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors shrink-0">
            <span className="text-lg leading-none">←</span>
          </Link>
          <div>
            <h1 className="text-lg font-extrabold text-zinc-800">Agenda</h1>
            <p className="text-xs text-zinc-400">Vos prochains cours planifiés</p>
          </div>
        </header>
        <main className="flex-1 p-6 flex flex-col gap-4">
          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
              {erreur}
            </div>
          )}
          {loading ? (
            <div className="bg-white rounded-2xl border h-40 animate-pulse" />
          ) : cours.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-12 flex flex-col items-center gap-4">
              <Calendar size={48} className="text-orange-300" />
              <p className="text-sm text-zinc-400">Aucun cours à venir pour le moment</p>
              <Link href="/" className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors">
                Trouver un répétiteur
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {Array.from(groupes.entries()).map(([jour, liste]) => (
                <div key={jour}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px flex-1 bg-zinc-200" />
                    <span className="text-xs font-bold text-zinc-500 capitalize tracking-wide px-2">{jour}</span>
                    <div className="h-px flex-1 bg-zinc-200" />
                  </div>
                  <div className="flex flex-col gap-3">
                    {liste.map((c) => {
                      const heure = new Date(c.date_heure).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                      return (
                        <div key={c.id} className={`bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-4 ${c.statut === "en_attente" ? "border-yellow-200" : c.statut === "annule" ? "border-red-100 opacity-60" : "border-zinc-100"}`}>
                          <div className={`text-center rounded-xl px-3 py-2 shrink-0 min-w-16 ${c.statut === "en_attente" ? "bg-yellow-50" : c.statut === "annule" ? "bg-red-50" : "bg-orange-50"}`}>
                            <p className={`text-lg font-extrabold ${c.statut === "en_attente" ? "text-yellow-600" : c.statut === "annule" ? "text-red-400" : "text-orange-600"}`}>{heure}</p>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-zinc-800">{c.repetiteur.prenom} {c.repetiteur.nom}</p>
                            <p className="text-sm text-zinc-500">{c.matiere} · {formatDuree(c.duree_minutes)}</p>
                          </div>
                          {c.statut === "en_attente" ? (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => accepter(c.id)}
                                disabled={actionEnCours === c.id}
                                className="flex items-center gap-1 text-xs font-bold text-white bg-green-500 hover:bg-green-600 disabled:bg-zinc-300 px-3 py-1.5 rounded-full transition-colors cursor-pointer">
                                <Check size={12} />Confirmer
                              </button>
                              <button
                                onClick={() => annuler(c.id)}
                                disabled={actionEnCours === c.id}
                                className="flex items-center gap-1 text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50 disabled:opacity-40 px-3 py-1.5 rounded-full transition-colors cursor-pointer">
                                <X size={12} />Annuler
                              </button>
                            </div>
                          ) : c.statut === "annule" ? (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 bg-red-50 text-red-500">Annulé</span>
                          ) : (
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 bg-blue-50 text-blue-600">En cours</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
