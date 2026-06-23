"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, User, BookOpen, Calendar, MessageCircle, CreditCard, Star, Settings, LogOut, X, Eye, EyeOff, CheckCircle, AlertTriangle, Phone } from "lucide-react";
import { AvatarDropdown } from "@/app/component/avatar-dropdown";
import { authService, type Utilisateur } from "@/lib/services/auth.service";
import { apiFetch } from "@/lib/api";

const NAV = [
  { label: "Tableau de bord", href: "/dashboard",             Icon: Home },
  { label: "Mon profil",       href: "/dashboard/profil",     Icon: User },
  { label: "Mes cours",        href: "/dashboard/cours",      Icon: BookOpen },
  { label: "Agenda",           href: "/dashboard/agenda",     Icon: Calendar },
  { label: "Messages",         href: "/dashboard",            Icon: MessageCircle },
  { label: "Paiements",        href: "/dashboard/paiement",   Icon: CreditCard },
  { label: "Avis reçus",       href: "/dashboard/avis",       Icon: Star },
  { label: "Paramètres",       href: "/dashboard/parametres", Icon: Settings },
];

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="cursor-pointer shrink-0">
      <div className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${on ? "bg-orange-500" : "bg-zinc-200"}`}>
        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${on ? "translate-x-4" : "translate-x-0"}`} />
      </div>
    </button>
  );
}

export default function ParametresPage() {
  const router = useRouter();
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [prefs, setPrefs] = useState({
    notif_rappel_cours: true,
    notif_nouveau_cours: true,
    notif_messages: true,
    notif_paiements: false,
    disponible: true,
    mode_vacances: false,
    afficher_telephone: false,
    afficher_ville: true,
  });
  const [sauvegarde, setSauvegarde] = useState(false);

  const [suppressionModal, setSuppressionModal] = useState(false);
  const [suppressionConfirm, setSuppressionConfirm] = useState("");
  const [suppressionLoading, setSuppressionLoading] = useState(false);
  const [suppressionErreur, setSuppressionErreur] = useState<string | null>(null);

  const [mdpModal, setMdpModal] = useState(false);
  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [afficherMdp, setAfficherMdp] = useState(false);
  const [mdpLoading, setMdpLoading] = useState(false);
  const [mdpErreur, setMdpErreur] = useState<string | null>(null);
  const [mdpSucces, setMdpSucces] = useState(false);

  useEffect(() => {
    authService.getMoi()
      .then((u) => {
        setUtilisateur(u);
        setPrefs({
          notif_rappel_cours: u.notif_rappel_cours ?? true,
          notif_nouveau_cours: u.notif_nouveau_cours ?? true,
          notif_messages: u.notif_messages ?? true,
          notif_paiements: u.notif_paiements ?? false,
          disponible: u.disponible ?? true,
          mode_vacances: u.mode_vacances ?? false,
          afficher_telephone: u.afficher_telephone ?? false,
          afficher_ville: u.afficher_ville ?? true,
        });
      })
      .catch(() => router.push("/connexion"));
  }, [router]);

  const initiales = utilisateur ? `${utilisateur.prenom[0]}${utilisateur.nom[0]}`.toUpperCase() : "?";
  const nomComplet = utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "…";

  async function togglePref(cle: keyof typeof prefs) {
    const nouvellesPrefs = { ...prefs, [cle]: !prefs[cle] };
    setPrefs(nouvellesPrefs);
    try {
      await apiFetch("/auth/parametres/notifications", {
        method: "PATCH",
        body: JSON.stringify({ [cle]: nouvellesPrefs[cle] }),
      });
      setSauvegarde(true);
      setTimeout(() => setSauvegarde(false), 2000);
    } catch {
      setPrefs(prefs);
    }
  }

  async function supprimerCompte() {
    if (suppressionConfirm !== "SUPPRIMER") return;
    setSuppressionLoading(true);
    setSuppressionErreur(null);
    try {
      await apiFetch("/auth/compte", { method: "DELETE" });
      authService.deconnecter();
      router.push("/");
    } catch (err) {
      setSuppressionErreur(err instanceof Error ? err.message : "Erreur lors de la suppression.");
    } finally {
      setSuppressionLoading(false);
    }
  }

  async function changerMotDePasse(e: { preventDefault(): void }) {
    e.preventDefault();
    setMdpErreur(null);
    if (nouveauMdp.length < 8) {
      setMdpErreur("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setMdpLoading(true);
    try {
      await apiFetch("/auth/changer-mot-de-passe", {
        method: "POST",
        body: JSON.stringify({ ancien_mot_de_passe: ancienMdp, nouveau_mot_de_passe: nouveauMdp }),
      });
      setMdpSucces(true);
      setTimeout(() => { setMdpModal(false); setMdpSucces(false); setAncienMdp(""); setNouveauMdp(""); }, 2000);
    } catch (err) {
      setMdpErreur(err instanceof Error ? err.message : "Erreur");
    } finally {
      setMdpLoading(false);
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
          <AvatarDropdown photoUrl={utilisateur?.photo_url ?? null} initiales={initiales} parametresHref="/dashboard/parametres" />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-zinc-800 truncate">{nomComplet}</span>
            <span className="text-xs text-orange-500">Répétiteur</span>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-2 flex-1">
          {NAV.map((item) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${item.href === "/dashboard/parametres" ? "bg-orange-500 text-white" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800"}`}>
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

  const sections = [
    {
      title: "Notifications",
      items: [
        { label: "Nouvelles demandes de contact", desc: "Recevoir une alerte à chaque nouvelle demande", cle: "notif_nouveau_cours" as const },
        { label: "Rappels de cours",              desc: "Email 30 minutes avant chaque cours planifié",  cle: "notif_rappel_cours" as const },
        { label: "Nouveaux messages",             desc: "Notification pour chaque message reçu",         cle: "notif_messages" as const },
        { label: "Versements effectués",          desc: "Confirmation de chaque paiement reçu",          cle: "notif_paiements" as const },
      ],
    },
    {
      title: "Disponibilité",
      items: [
        { label: "Accepter de nouveaux élèves", desc: "Votre profil apparaît dans les recherches",  cle: "disponible" as const },
        { label: "Mode vacances",               desc: "Suspendre temporairement les demandes",       cle: "mode_vacances" as const },
      ],
    },
    {
      title: "Confidentialité",
      items: [
        { label: "Afficher mon numéro de téléphone", desc: "Visible sur votre fiche publique", cle: "afficher_telephone" as const },
        { label: "Afficher ma ville",                desc: "Visible sur votre fiche publique", cle: "afficher_ville" as const },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-100 font-sans">
      <aside className="hidden lg:flex w-60 bg-white border-r border-zinc-100 flex-col shrink-0 h-screen sticky top-0">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-zinc-100 px-6 py-4 sticky top-0 z-40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors shrink-0">
              <span className="text-lg leading-none">←</span>
            </Link>
            <div>
              <h1 className="text-lg font-extrabold text-zinc-800">Paramètres</h1>
              <p className="text-xs text-zinc-400">Gérez vos préférences et votre compte</p>
            </div>
          </div>
          {sauvegarde && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
              <CheckCircle size={13} />Sauvegardé
            </span>
          )}
        </header>

        <main className="flex-1 p-6 flex flex-col gap-4 max-w-2xl">
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-zinc-800 mb-4">Compte</h2>
            <div className="flex flex-col divide-y divide-zinc-50">
              <div className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-semibold text-zinc-700">Nom complet</p>
                  <p className="text-xs text-zinc-400">{utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "…"}</p>
                </div>
                <Link href="/dashboard/profil" className="text-xs font-semibold text-orange-500 hover:underline">Modifier</Link>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-semibold text-zinc-700">Email</p>
                  <p className="text-xs text-zinc-400">{utilisateur?.email ?? "…"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-zinc-400" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-700">Téléphone</p>
                    <p className="text-xs text-zinc-400">{utilisateur?.telephone ?? "Non renseigné"}</p>
                  </div>
                </div>
                <Link href="/dashboard/profil" className="text-xs font-semibold text-orange-500 hover:underline">
                  {utilisateur?.telephone ? "Modifier" : "Ajouter"}
                </Link>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-semibold text-zinc-700">Mot de passe</p>
                  <p className="text-xs text-zinc-400">Modifier votre mot de passe</p>
                </div>
                <button onClick={() => setMdpModal(true)} className="text-xs font-semibold text-orange-500 hover:underline cursor-pointer">
                  Modifier
                </button>
              </div>
            </div>
          </div>

          {sections.map((section) => (
            <div key={section.title} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <h2 className="text-sm font-bold text-zinc-800 mb-4">{section.title}</h2>
              <div className="flex flex-col divide-y divide-zinc-50">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-semibold text-zinc-700">{item.label}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle on={prefs[item.cle]} onChange={() => togglePref(item.cle)} />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-red-500 mb-1">Zone dangereuse</h2>
            <p className="text-xs text-zinc-400 mb-4">Cette action est irréversible. Votre compte sera désactivé et vos données anonymisées.</p>
            <button
              onClick={() => { setSuppressionModal(true); setSuppressionConfirm(""); setSuppressionErreur(null); }}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-500 hover:bg-red-50 font-semibold rounded-xl text-sm transition-colors cursor-pointer">
              <AlertTriangle size={14} />
              Supprimer mon compte
            </button>
          </div>
        </main>
      </div>

      {suppressionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <h2 className="text-base font-extrabold text-red-600">Supprimer mon compte</h2>
              <button onClick={() => setSuppressionModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3">
                <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">Votre compte sera <strong>définitivement désactivé</strong>. Vos données personnelles seront anonymisées et vous ne pourrez plus vous connecter.</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-zinc-700">
                  Tapez <span className="font-mono text-red-600 bg-red-50 px-1 rounded">SUPPRIMER</span> pour confirmer
                </label>
                <input
                  type="text"
                  value={suppressionConfirm}
                  onChange={(e) => setSuppressionConfirm(e.target.value)}
                  placeholder="SUPPRIMER"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition"
                />
              </div>
              {suppressionErreur && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{suppressionErreur}</div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setSuppressionModal(false)}
                  className="flex-1 py-2.5 border border-zinc-200 text-zinc-600 font-semibold rounded-xl text-sm hover:bg-zinc-50 transition-colors cursor-pointer">
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={supprimerCompte}
                  disabled={suppressionConfirm !== "SUPPRIMER" || suppressionLoading}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors cursor-pointer">
                  {suppressionLoading ? "Suppression…" : "Confirmer la suppression"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {mdpModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <h2 className="text-base font-extrabold text-zinc-800">Changer le mot de passe</h2>
              <button onClick={() => { setMdpModal(false); setMdpErreur(null); setAncienMdp(""); setNouveauMdp(""); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={changerMotDePasse} className="p-5 flex flex-col gap-4">
              {mdpSucces ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <CheckCircle size={32} className="text-green-500" />
                  <p className="text-sm font-semibold text-zinc-700">Mot de passe modifié !</p>
                </div>
              ) : (
                <>
                  {mdpErreur && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">{mdpErreur}</div>
                  )}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-zinc-700">Ancien mot de passe</label>
                    <div className="relative">
                      <input type={afficherMdp ? "text" : "password"} value={ancienMdp}
                        onChange={(e) => setAncienMdp(e.target.value)} required
                        className="w-full px-4 py-3 pr-10 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
                      <button type="button" onClick={() => setAfficherMdp(!afficherMdp)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 cursor-pointer">
                        {afficherMdp ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-zinc-700">Nouveau mot de passe</label>
                    <input type={afficherMdp ? "text" : "password"} value={nouveauMdp}
                      onChange={(e) => setNouveauMdp(e.target.value)} required
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition" />
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setMdpModal(false)}
                      className="flex-1 py-2.5 border border-zinc-200 text-zinc-600 font-semibold rounded-xl text-sm hover:bg-zinc-50 transition-colors cursor-pointer">
                      Annuler
                    </button>
                    <button type="submit" disabled={mdpLoading}
                      className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer">
                      {mdpLoading ? "…" : "Enregistrer"}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
