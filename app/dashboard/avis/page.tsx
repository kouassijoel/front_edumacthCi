"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, User, BookOpen, MessageCircle, CreditCard, Star, Settings, LogOut, Pencil } from "lucide-react";
import { AvatarDropdown } from "@/app/component/avatar-dropdown";
import { authService, type Utilisateur } from "@/lib/services/auth.service";
import { dashboardRepetiteurService, type AvisRead } from "@/lib/services/dashboard.service";

const NAV = [
  { label: "Tableau de bord", href: "/dashboard",             Icon: Home },
  { label: "Mon profil",       href: "/dashboard/profil",     Icon: User },
  { label: "Mes cours",        href: "/dashboard/cours",      Icon: BookOpen },
  { label: "Messages",         href: "/dashboard",            Icon: MessageCircle },
  { label: "Paiements",        href: "/dashboard/paiement",   Icon: CreditCard },
  { label: "Avis reçus",       href: "/dashboard/avis",       Icon: Star },
  { label: "Paramètres",       href: "/dashboard/parametres", Icon: Settings },
];

export default function AvisPage() {
  const router = useRouter();
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [note, setNote] = useState(0);
  const [nbAvis, setNbAvis] = useState(0);
  const [avis, setAvis] = useState<AvisRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyTexte, setReplyTexte] = useState("");
  const [replyEnvoi, setReplyEnvoi] = useState(false);

  useEffect(() => {
    authService.getMoi()
      .then((u) => {
        setUtilisateur(u);
        dashboardRepetiteurService.chargerAvis()
          .then((d) => { setNote(d.note_moyenne); setNbAvis(d.nb_avis); setAvis(d.avis); })
          .catch(() => {})
          .finally(() => setLoading(false));
      })
      .catch(() => router.push("/connexion"));
  }, [router]);

  const initiales = utilisateur ? `${utilisateur.prenom[0]}${utilisateur.nom[0]}`.toUpperCase() : "?";
  const nomComplet = utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "…";

  async function repondre(avisId: string) {
    if (!replyTexte.trim()) return;
    setReplyEnvoi(true);
    try {
      const updated = await dashboardRepetiteurService.repondreAvis(avisId, replyTexte.trim());
      setAvis((prev) => prev.map((a) => a.id === avisId ? updated : a));
      setReplyId(null);
      setReplyTexte("");
    } catch {
    } finally {
      setReplyEnvoi(false);
    }
  }

  const distribution = [5, 4, 3, 2, 1].map((n) => ({
    n,
    count: avis.filter((a) => a.note === n).length,
    pct: nbAvis > 0 ? Math.round((avis.filter((a) => a.note === n).length / nbAvis) * 100) : 0,
  }));

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
          <AvatarDropdown photoUrl={utilisateur?.photo_url ?? null} initiales={initiales} parametresHref="/dashboard/parametres" />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-zinc-800 truncate">{nomComplet}</span>
            <span className="text-xs text-orange-500">Répétiteur</span>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-2 flex-1">
          {NAV.map((item) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${item.href === "/dashboard/avis" ? "bg-orange-500 text-white" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800"}`}>
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
          <Link href="/dashboard" className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors shrink-0">
            <span className="text-lg leading-none">←</span>
          </Link>
          <div>
            <h1 className="text-lg font-extrabold text-zinc-800">Avis reçus</h1>
            <p className="text-xs text-zinc-400">Ce que vos élèves pensent de vous</p>
          </div>
        </header>

        <main className="flex-1 p-6 flex flex-col gap-6 max-w-3xl">
          {loading ? (
            <div className="bg-white rounded-2xl border h-40 animate-pulse" />
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col sm:flex-row gap-8 items-center">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <p className="text-6xl font-extrabold text-zinc-800">{note.toFixed(1)}</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((i) => (
                      <span key={i} className={`text-2xl ${i <= Math.round(note) ? "text-orange-400" : "text-zinc-200"}`}>★</span>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">{nbAvis} avis au total</p>
                </div>
                <div className="flex-1 w-full flex flex-col gap-1.5">
                  {distribution.map(({ n, count, pct }) => (
                    <div key={n} className="flex items-center gap-3">
                      <span className="text-xs text-zinc-500 w-4 text-right">{n}</span>
                      <span className="text-orange-400 text-xs">★</span>
                      <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-zinc-400 w-8 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {avis.length === 0 ? (
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-10 flex flex-col items-center gap-3">
                  <Star size={48} className="text-orange-300" />
                  <p className="text-base font-bold text-zinc-700">Aucun avis pour l&apos;instant</p>
                  <p className="text-sm text-zinc-400 text-center max-w-xs">
                    Vos avis apparaîtront ici après chaque cours terminé.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {avis.map((a) => (
                    <div key={a.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                            {a.eleve.prenom[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-800">{a.eleve.prenom} {a.eleve.nom}</p>
                            <p className="text-xs text-zinc-400">{new Date(a.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((i) => (
                            <span key={i} className={`text-base ${i <= a.note ? "text-orange-400" : "text-zinc-200"}`}>★</span>
                          ))}
                        </div>
                      </div>

                      <p className="text-sm text-zinc-600 leading-relaxed bg-zinc-50 rounded-xl px-4 py-3">
                        &ldquo;{a.commentaire}&rdquo;
                      </p>

                      {a.reponse && (
                        <div className="ml-4 border-l-2 border-orange-300 pl-4 flex flex-col gap-1">
                          <p className="text-xs font-bold text-orange-600">Votre réponse</p>
                          <p className="text-sm text-zinc-600 leading-relaxed">{a.reponse}</p>
                          {a.reponse_at && (
                            <p className="text-xs text-zinc-400">{new Date(a.reponse_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</p>
                          )}
                        </div>
                      )}

                      {replyId === a.id ? (
                        <div className="flex flex-col gap-2 ml-4">
                          <textarea
                            value={replyTexte}
                            onChange={(e) => setReplyTexte(e.target.value)}
                            placeholder="Votre réponse à cet avis…"
                            rows={3}
                            className="w-full text-sm px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => { setReplyId(null); setReplyTexte(""); }}
                              className="px-4 py-2 border border-zinc-200 text-zinc-600 font-semibold rounded-xl text-xs hover:bg-zinc-50 transition-colors">
                              Annuler
                            </button>
                            <button
                              onClick={() => repondre(a.id)}
                              disabled={!replyTexte.trim() || replyEnvoi}
                              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-colors">
                              {replyEnvoi ? "Envoi…" : "Publier la réponse"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setReplyId(a.id); setReplyTexte(a.reponse ?? ""); }}
                          className="self-start flex items-center gap-1 text-xs font-semibold text-orange-500 border border-orange-200 hover:bg-orange-50 px-3 py-1.5 rounded-full transition-colors cursor-pointer">
                          {a.reponse ? <><Pencil size={12} />Modifier la réponse</> : "↩ Répondre"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
