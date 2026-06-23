"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home, Users, BookOpen, Calendar, CreditCard, Settings,
  LogOut, Star, X, CheckCircle,
} from "lucide-react";
import { authService, type Utilisateur } from "@/lib/services/auth.service";
import {
  dashboardEleveService,
  type CoursEleveRead,
  formatDuree, formatDateCours,
} from "@/lib/services/dashboard.service";

const NAV = [
  { label: "Tableau de bord",  href: "/dashboard/eleve",             Icon: Home },
  { label: "Mes répétiteurs",  href: "/dashboard/eleve/repetiteurs", Icon: Users },
  { label: "Mes cours",        href: "/dashboard/eleve/cours",        Icon: BookOpen },
  { label: "Agenda",           href: "/dashboard/eleve/agenda",       Icon: Calendar },
  { label: "Paiements",        href: "/dashboard/eleve/paiement",     Icon: CreditCard },
  { label: "Paramètres",       href: "/dashboard/eleve/parametres",   Icon: Settings },
];

const STATUT_LABEL: Record<string, string> = {
  en_attente: "En attente", confirme: "Confirmé", annule: "Annulé", termine: "Terminé",
};
const STATUT_COLOR: Record<string, string> = {
  en_attente: "bg-yellow-50 text-yellow-600",
  confirme:   "bg-green-50 text-green-600",
  annule:     "bg-red-50 text-red-500",
  termine:    "bg-zinc-100 text-zinc-500",
};

export default function EleveCoursPage() {
  const router = useRouter();
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [cours, setCours] = useState<CoursEleveRead[]>([]);
  const [filtre, setFiltre] = useState<"tous" | "confirme" | "en_attente" | "termine" | "annule">("tous");
  const [loading, setLoading] = useState(true);
  const [enCours, setEnCours] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;
  const [avisModal, setAvisModal] = useState<CoursEleveRead | null>(null);
  const [avisNote, setAvisNote] = useState(0);
  const [avisCommentaire, setAvisCommentaire] = useState("");
  const [avisEnvoi, setAvisEnvoi] = useState(false);
  const [avisEnvoyes, setAvisEnvoyes] = useState<Set<string>>(new Set());

  useEffect(() => {
    authService.getMoi()
      .then((u) => {
        setUtilisateur(u);
        return dashboardEleveService.chargerTousCours();
      })
      .then(setCours)
      .catch(() => router.push("/connexion"))
      .finally(() => setLoading(false));
  }, [router]);

  const initiales = utilisateur ? `${utilisateur.prenom[0]}${utilisateur.nom[0]}`.toUpperCase() : "?";
  const nomComplet = utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "…";
  const filtered = filtre === "tous" ? cours : cours.filter((c) => c.statut === filtre);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  async function accepter(id: string) {
    setEnCours(id);
    try {
      await dashboardEleveService.accepterCours(id);
      setCours((prev) => prev.map((c) => c.id === id ? { ...c, statut: "confirme" } : c));
    } catch {}
    finally { setEnCours(null); }
  }

  async function refuser(id: string) {
    setEnCours(id + "_refus");
    try {
      await dashboardEleveService.refuserCours(id);
      setCours((prev) => prev.map((c) => c.id === id ? { ...c, statut: "annule" } : c));
    } catch {}
    finally { setEnCours(null); }
  }

  async function envoyerAvis() {
    if (!avisModal || avisNote === 0 || !avisCommentaire.trim()) return;
    setAvisEnvoi(true);
    try {
      await dashboardEleveService.laisserAvis({
        cours_id: avisModal.id,
        note: avisNote,
        commentaire: avisCommentaire.trim(),
      });
      setAvisEnvoyes((prev) => new Set([...prev, avisModal.id]));
      setAvisModal(null);
      setAvisNote(0);
      setAvisCommentaire("");
    } catch {}
    finally { setAvisEnvoi(false); }
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
          <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center shrink-0 overflow-hidden">
            {utilisateur?.photo_url ? (
              <img src={utilisateur.photo_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-bold text-blue-600">{initiales}</span>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                item.href === "/dashboard/eleve/cours"
                  ? "bg-orange-500 text-white"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800"
              }`}>
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
        <header className="bg-white border-b border-zinc-100 px-6 py-4 sticky top-0 z-40">
          <h1 className="text-lg font-extrabold text-zinc-800">Mes cours</h1>
          <p className="text-xs text-zinc-400">Gérez vos sessions avec vos répétiteurs</p>
        </header>

        <main className="flex-1 p-6 flex flex-col gap-4">
          <div className="flex gap-2 flex-wrap">
            {(["tous", "confirme", "en_attente", "termine", "annule"] as const).map((f) => (
              <button key={f} onClick={() => { setFiltre(f); setPage(0); }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border ${filtre === f ? "bg-orange-500 text-white border-orange-500" : "bg-white text-zinc-600 border-zinc-200 hover:border-orange-300"}`}>
                {f === "tous" ? "Tous" : STATUT_LABEL[f]}
                <span className="ml-1.5 text-[10px] opacity-70">
                  {f === "tous" ? cours.length : cours.filter((c) => c.statut === f).length}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-sm text-zinc-400">Chargement…</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center gap-3">
                <BookOpen size={40} className="text-orange-200" />
                <p className="text-sm text-zinc-400">Aucun cours trouvé</p>
                <Link href="/" className="text-sm text-orange-500 font-semibold hover:underline">
                  Trouver un répétiteur →
                </Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-zinc-400 font-semibold border-b border-zinc-100 bg-zinc-50">
                    <th className="text-left px-5 py-3">Répétiteur</th>
                    <th className="text-left px-5 py-3 hidden sm:table-cell">Matière</th>
                    <th className="text-left px-5 py-3 hidden md:table-cell">Date & heure</th>
                    <th className="text-left px-5 py-3 hidden lg:table-cell">Durée</th>
                    <th className="text-left px-5 py-3">Statut</th>
                    <th className="text-left px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {paginated.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs shrink-0">
                            {c.repetiteur.prenom[0]}
                          </div>
                          <p className="font-semibold text-zinc-800 text-sm truncate max-w-30">
                            {c.repetiteur.prenom} {c.repetiteur.nom}
                          </p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-zinc-600 hidden sm:table-cell">{c.matiere}</td>
                      <td className="px-5 py-3.5 text-zinc-600 hidden md:table-cell">{formatDateCours(c.date_heure)}</td>
                      <td className="px-5 py-3.5 text-zinc-600 hidden lg:table-cell">{formatDuree(c.duree_minutes)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUT_COLOR[c.statut] ?? "bg-zinc-100 text-zinc-500"}`}>
                          {STATUT_LABEL[c.statut] ?? c.statut}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {c.statut === "en_attente" && (
                          <div className="flex gap-2">
                            <button onClick={() => accepter(c.id)} disabled={enCours === c.id}
                              className="text-xs font-semibold text-green-600 border border-green-200 hover:bg-green-50 disabled:opacity-50 px-3 py-1 rounded-full transition-colors cursor-pointer">
                              {enCours === c.id ? "…" : "✓ Accepter"}
                            </button>
                            <button onClick={() => refuser(c.id)} disabled={enCours === c.id + "_refus"}
                              className="text-xs font-semibold text-red-500 border border-red-200 hover:bg-red-50 disabled:opacity-50 px-3 py-1 rounded-full transition-colors cursor-pointer">
                              ✕ Refuser
                            </button>
                          </div>
                        )}
                        {c.statut === "termine" && !avisEnvoyes.has(c.id) && (
                          <button onClick={() => setAvisModal(c)}
                            className="flex items-center gap-1 text-xs font-semibold text-orange-500 border border-orange-200 hover:bg-orange-50 px-3 py-1 rounded-full transition-colors cursor-pointer">
                            <Star size={12} /> Évaluer
                          </button>
                        )}
                        {c.statut === "termine" && avisEnvoyes.has(c.id) && (
                          <span className="flex items-center gap-1 text-xs text-green-500 font-semibold">
                            <CheckCircle size={12} /> Évalué
                          </span>
                        )}
                        {(c.statut === "confirme" || c.statut === "annule") && (
                          <span className="text-xs text-zinc-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-400">
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} sur {filtered.length} cours
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                  ← Précédent
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${i === page ? "bg-orange-500 text-white" : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}>
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
                  Suivant →
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {avisModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <div>
                <h2 className="text-base font-extrabold text-zinc-800">Évaluer le cours</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {avisModal.matiere} avec {avisModal.repetiteur.prenom} {avisModal.repetiteur.nom}
                </p>
              </div>
              <button onClick={() => setAvisModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-zinc-700">Votre note</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setAvisNote(n)}
                      className={`text-3xl transition-transform hover:scale-110 cursor-pointer ${n <= avisNote ? "text-orange-400" : "text-zinc-200"}`}>
                      ★
                    </button>
                  ))}
                </div>
                {avisNote > 0 && (
                  <p className="text-xs text-zinc-400">
                    {["", "Très insuffisant", "Insuffisant", "Bien", "Très bien", "Excellent !"][avisNote]}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-zinc-700">Votre commentaire</label>
                <textarea
                  value={avisCommentaire}
                  onChange={(e) => setAvisCommentaire(e.target.value)}
                  placeholder="Décrivez votre expérience avec ce répétiteur…"
                  rows={4}
                  className="px-4 py-3 rounded-xl border border-zinc-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setAvisModal(null)}
                  className="px-5 py-2.5 border border-zinc-200 text-zinc-600 font-semibold rounded-xl text-sm hover:bg-zinc-50 transition-colors cursor-pointer">
                  Annuler
                </button>
                <button onClick={envoyerAvis}
                  disabled={avisNote === 0 || !avisCommentaire.trim() || avisEnvoi}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors cursor-pointer">
                  {avisEnvoi ? "Envoi…" : "Publier l'évaluation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
