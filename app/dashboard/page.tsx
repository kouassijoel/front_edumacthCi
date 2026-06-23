"use client";

import Link from "next/link";
import { useEffect, useState, Fragment } from "react";
import { AvatarDropdown } from "@/app/component/avatar-dropdown";
import { useRouter } from "next/navigation";
import {
  Home, User, BookOpen, Calendar, MessageCircle, CreditCard, Star, Settings, LogOut,
  Bell, Menu, X, ChevronLeft, ChevronRight, DollarSign, Users, Clock,
  BarChart2, Banknote, TrendingUp, Hourglass, ShieldCheck, Zap, Eye, FileText,
} from "lucide-react";
import { authService, type Utilisateur } from "@/lib/services/auth.service";
import { PAIEMENTS_ACTIFS } from "@/lib/config";
import {
  dashboardRepetiteurService,
  type DashboardRepetiteur,
  type ComptePaiementRead,
  type DemandeRead,
  type MessageRead,
  type MessageReactionRead,
  type UtilisateurMini,
  formatDuree, formatDateCours, formatMontant,
} from "@/lib/services/dashboard.service";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "✅"];

function groupReactions(reactions: MessageReactionRead[], myId?: string) {
  const map = new Map<string, { count: number; active: boolean }>();
  for (const r of reactions) {
    const e = map.get(r.emoji) ?? { count: 0, active: false };
    map.set(r.emoji, { count: e.count + 1, active: e.active || r.utilisateur_id === myId });
  }
  return Array.from(map.entries()).map(([emoji, d]) => ({ emoji, ...d }));
}

const navItems = [
  { label: "Tableau de bord",   Icon: Home,          href: "/dashboard" },
  { label: "Mon profil",        Icon: User,          href: "/dashboard/profil" },
  { label: "Vérification KYC",  Icon: ShieldCheck,   href: "/dashboard/kyc" },
  { label: "Mes cours",         Icon: BookOpen,      href: "/dashboard/cours" },
  { label: "Messages",          Icon: MessageCircle, href: null },
  { label: "Paiements",         Icon: CreditCard,    href: "/dashboard/paiement" },
  { label: "Avis reçus",        Icon: Star,          href: "/dashboard/avis" },
  { label: "Booster mon profil",Icon: Zap,           href: "/dashboard/boost" },
  { label: "Communauté",        Icon: Users,         href: "/communaute" },
  { label: "Paramètres",        Icon: Settings,      href: "/dashboard/parametres" },
];

function formatMsgDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function formatDateSep(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

export default function Dashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [onglet, setOnglet] = useState<"apercu" | "paiements" | "messages">("apercu");
  const [showRetrait, setShowRetrait] = useState(false);
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [data, setData] = useState<DashboardRepetiteur | null>(null);
  const [loading, setLoading] = useState(true);
  const [demandes, setDemandes] = useState<DemandeRead[]>([]);
  const [messages, setMessages] = useState<MessageRead[]>([]);
  const [selectedContact, setSelectedContact] = useState<UtilisateurMini | null>(null);
  const [conversation, setConversation] = useState<MessageRead[]>([]);
  const [loadingConv, setLoadingConv] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [showEmojiFor, setShowEmojiFor] = useState<string | null>(null);
  const [demandeReplyId, setDemandeReplyId] = useState<string | null>(null);
  const [demandeReplyTexte, setDemandeReplyTexte] = useState("");
  const [planModal, setPlanModal] = useState<{ eleveId: string; prenom: string; matiere: string } | null>(null);
  const [planDate, setPlanDate] = useState("");
  const [planHeure, setPlanHeure] = useState("");
  const [planDuree, setPlanDuree] = useState(60);
  const [montantRetrait, setMontantRetrait] = useState("");
  const [compteRetraitId, setCompteRetraitId] = useState<string>("");

  useEffect(() => {
    authService.getMoi()
      .then((u) => { setUtilisateur(u); })
      .catch(() => router.push("/connexion"));
  }, [router]);

  useEffect(() => {
    if (!utilisateur) return;
    dashboardRepetiteurService.charger()
      .then((d) => { setData(d); setDemandes(d.demandes); setMessages(d.messages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [utilisateur]);

  useEffect(() => {
    if (data?.comptes?.length) setCompteRetraitId(data.comptes[0].id);
  }, [data]);

  // Synchronisation KYC / stats toutes les 60 s
  useEffect(() => {
    const id = setInterval(() => {
      authService.getMoi().then(setUtilisateur).catch(() => {});
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // Rafraîchir la liste des messages toutes les 15 s (onglet messages actif)
  useEffect(() => {
    if (onglet !== "messages") return;
    const id = setInterval(() => {
      dashboardRepetiteurService.charger()
        .then((d) => setMessages(d.messages))
        .catch(() => {});
    }, 15_000);
    return () => clearInterval(id);
  }, [onglet]);

  // Rafraîchir la conversation active toutes les 5 s
  useEffect(() => {
    if (!selectedContact) return;
    const id = setInterval(() => {
      dashboardRepetiteurService.chargerConversation(selectedContact.id)
        .then((msgs) => setConversation(msgs))
        .catch(() => {});
    }, 5_000);
    return () => clearInterval(id);
  }, [selectedContact]);

  function handleDeconnexion() {
    authService.deconnecter();
    router.push("/");
  }

  async function traiterDemande(id: string, statut: "accepte" | "refuse") {
    try {
      await dashboardRepetiteurService.traiterDemande(id, statut);
      setDemandes((prev) => prev.map((d) => d.id === id ? { ...d, statut } : d));
    } catch {}
  }

  async function ouvrirConversation(contact: UtilisateurMini) {
    setSelectedContact(contact);
    setLoadingConv(true);
    try {
      const msgs = await dashboardRepetiteurService.chargerConversation(contact.id);
      setConversation(msgs);
      setMessages((prev) => prev.map((m) => m.expediteur.id === contact.id ? { ...m, lu: true } : m));
    } catch {
      setConversation([]);
    } finally {
      setLoadingConv(false);
    }
  }

  async function envoyerMsg() {
    if (!newMsg.trim() || !selectedContact) return;
    const texte = newMsg.trim();
    setNewMsg("");
    try {
      const sent = await dashboardRepetiteurService.envoyerMessage(selectedContact.id, texte);
      setConversation((prev) => [...prev, sent]);
    } catch {
      setNewMsg(texte);
    }
  }

  async function supprimerMsg(msgId: string) {
    try {
      await dashboardRepetiteurService.supprimerMessage(msgId);
      setConversation((prev) => prev.map((m) => m.id === msgId ? { ...m, supprime: true, texte: "" } : m));
    } catch {}
  }

  async function sauvegarderEdit(msgId: string) {
    if (!editingText.trim()) return;
    try {
      const updated = await dashboardRepetiteurService.modifierMessage(msgId, editingText.trim());
      setConversation((prev) => prev.map((m) => m.id === msgId ? updated : m));
      setEditingMsgId(null);
    } catch {}
  }

  async function toggleReaction(msgId: string, emoji: string) {
    setShowEmojiFor(null);
    const msg = conversation.find((m) => m.id === msgId);
    if (!msg) return;
    const hasReaction = msg.reactions.some((r) => r.utilisateur_id === utilisateur?.id && r.emoji === emoji);
    try {
      if (hasReaction) {
        await dashboardRepetiteurService.retirerReaction(msgId, emoji);
        setConversation((prev) => prev.map((m) => m.id !== msgId ? m : {
          ...m, reactions: m.reactions.filter((r) => !(r.utilisateur_id === utilisateur?.id && r.emoji === emoji)),
        }));
      } else {
        await dashboardRepetiteurService.ajouterReaction(msgId, emoji);
        setConversation((prev) => prev.map((m) => m.id !== msgId ? m : {
          ...m, reactions: [...m.reactions, { emoji, utilisateur_id: utilisateur!.id }],
        }));
      }
    } catch {}
  }

  async function envoyerReponseDemande(eleveId: string) {
    if (!demandeReplyTexte.trim()) return;
    try {
      await dashboardRepetiteurService.envoyerMessage(eleveId, demandeReplyTexte.trim());
      setDemandeReplyId(null);
      setDemandeReplyTexte("");
    } catch {}
  }

  async function planifierCours() {
    if (!planModal || !planDate || !planHeure) return;
    const date_heure = `${planDate}T${planHeure}:00`;
    try {
      const nouveau = await dashboardRepetiteurService.planifierCours({
        eleve_id: planModal.eleveId,
        matiere: planModal.matiere,
        date_heure,
        duree_minutes: planDuree,
      });
      setData((prev) => prev ? { ...prev, prochains_cours: [...prev.prochains_cours, nouveau] } : prev);
      setPlanModal(null);
      setPlanDate(""); setPlanHeure(""); setPlanDuree(60);
    } catch {}
  }

  async function confirmerRetrait() {
    if (!montantRetrait || !compteRetraitId) return;
    try {
      await dashboardRepetiteurService.demanderRetrait(Number(montantRetrait), compteRetraitId);
      setShowRetrait(false);
    } catch {}
  }

  const nomComplet = utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "…";
  const prenom = utilisateur?.prenom ?? "…";
  const initiales = utilisateur
    ? `${utilisateur.prenom[0]}${utilisateur.nom[0]}`.toUpperCase()
    : "?";

  const stats = data ? [
    { label: "Revenus ce mois",  value: `${formatMontant(data.stats.revenus_mois)} F`, Icon: DollarSign, color: "bg-green-50 text-green-700 border-green-100" },
    { label: "Élèves actifs",    value: String(data.stats.eleves_actifs),              Icon: Users,       color: "bg-blue-50 text-blue-700 border-blue-100" },
    { label: "Heures données",   value: `${data.stats.heures_donnees} h`,              Icon: Clock,       color: "bg-orange-50 text-orange-700 border-orange-100" },
    { label: "Note moyenne",     value: `${data.stats.note_moyenne.toFixed(1)} ★`,    Icon: Star,        color: "bg-yellow-50 text-yellow-700 border-yellow-100" },
    { label: "Vues du profil",   value: String(data.stats.nb_vues),                   Icon: Eye,         color: "bg-purple-50 text-purple-700 border-purple-100" },
  ] : [];

  const unreadCount = data?.messages.filter((m) => !m.lu).length ?? 0;

  function SidebarContent() {
    return (
      <>
        <div className="flex items-center gap-2 px-4 py-4 border-b border-zinc-100">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-lg font-extrabold text-orange-500">Edu</span>
            <span className="text-lg font-extrabold text-zinc-800">Match</span>
            <span className="ml-1 text-xs font-semibold text-white bg-green-600 rounded px-1 py-0.5">CI</span>
          </Link>
          <button onClick={() => { setSidebarOpen(!sidebarOpen); setMobileMenuOpen(false); }} className="ml-auto text-zinc-400 hover:text-zinc-600 cursor-pointer hidden lg:block">
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
          <button onClick={() => setMobileMenuOpen(false)} className="ml-auto text-zinc-400 hover:text-zinc-600 cursor-pointer lg:hidden">
            <X size={20} />
          </button>
        </div>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-100">
          <AvatarDropdown photoUrl={utilisateur?.photo_url ?? null} initiales={initiales} parametresHref="/dashboard/parametres" />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-zinc-800 truncate">{nomComplet}</span>
            <span className="text-xs text-orange-500">Répétiteur</span>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-2 flex-1">
          {navItems.map((item) => {
            if (item.href === null) {
              const tabKey = item.label === "Messages" ? "messages" : "paiements";
              const isActive = onglet === tabKey;
              return (
                <button key={item.label}
                  onClick={() => { setOnglet(tabKey); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative w-full text-left cursor-pointer ${isActive ? "bg-orange-500 text-white" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800"}`}>
                  <item.Icon size={18} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.label === "Messages" && unreadCount > 0 && (
                    <span className={`ml-auto text-xs font-bold rounded-full px-1.5 py-0.5 min-w-5 text-center ${isActive ? "bg-white text-orange-500" : "bg-red-500 text-white"}`}>{unreadCount}</span>
                  )}
                </button>
              );
            }
            const isActive = item.href === "/dashboard" && onglet === "apercu";
            return (
              <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative ${isActive ? "bg-orange-500 text-white" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800"}`}>
                <item.Icon size={18} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-2 border-t border-zinc-100">
          <button onClick={handleDeconnexion} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 w-full transition-colors cursor-pointer">
            <LogOut size={16} className="shrink-0" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-zinc-100 font-sans">

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      <aside className={`hidden lg:flex ${sidebarOpen ? "w-60" : "w-16"} transition-all duration-200 bg-white border-r border-zinc-100 flex-col shrink-0 h-screen sticky top-0`}>
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">

        <header className="lg:hidden bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
          <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-xl hover:bg-zinc-50 text-zinc-600 cursor-pointer">
            <Menu size={20} />
          </button>
          <Link href="/" className="flex items-center gap-1">
            <span className="text-base font-extrabold text-orange-500">Edu</span>
            <span className="text-base font-extrabold text-zinc-800">Match</span>
            <span className="ml-1 text-xs font-semibold text-white bg-green-600 rounded px-1 py-0.5">CI</span>
          </Link>
          <button className="relative p-2 rounded-xl hover:bg-zinc-50 text-zinc-500 cursor-pointer">
            <Bell size={18} />
            {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
          </button>
        </header>

        <header className="hidden lg:flex bg-white border-b border-zinc-100 px-6 py-4 items-center justify-between sticky top-0 z-40">
          <div>
            <h1 className="text-lg font-extrabold text-zinc-800">Bonjour, {prenom} 👋</h1>
            <p className="text-xs text-zinc-400">{utilisateur?.email ?? ""}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-xl hover:bg-zinc-50 text-zinc-500 cursor-pointer">
              <Bell size={18} />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
            <AvatarDropdown photoUrl={utilisateur?.photo_url ?? null} initiales={initiales} parametresHref="/dashboard/parametres" size="sm" />
          </div>
        </header>

        <div className="lg:hidden px-4 pt-4">
          <h1 className="text-lg font-extrabold text-zinc-800">Bonjour, {prenom} 👋</h1>
          <p className="text-xs text-zinc-400">{utilisateur?.email ?? ""}</p>
        </div>

        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 flex flex-col gap-4 lg:gap-6">

          {/* ── Bannière KYC ── */}
          {utilisateur && !utilisateur.is_verifie && (
            <div className={`rounded-2xl border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
              utilisateur.kyc_statut === "rejete"
                ? "bg-red-50 border-red-200"
                : utilisateur.kyc_statut === "en_attente"
                ? "bg-blue-50 border-blue-200"
                : "bg-amber-50 border-amber-300"
            }`}>
              {/* Icône */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                utilisateur.kyc_statut === "rejete" ? "bg-red-100" :
                utilisateur.kyc_statut === "en_attente" ? "bg-blue-100" : "bg-amber-100"
              }`}>
                <ShieldCheck size={22} className={
                  utilisateur.kyc_statut === "rejete" ? "text-red-500" :
                  utilisateur.kyc_statut === "en_attente" ? "text-blue-500" : "text-amber-500"
                } />
              </div>

              {/* Texte */}
              <div className="flex-1 min-w-0">
                {utilisateur.kyc_statut === "non_soumis" && (
                  <>
                    <p className="text-sm font-bold text-amber-800">
                      Votre profil est limité — CNI requise
                    </p>
                    <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                      Sans CNI validée : retraits bloqués, badge vérifié absent, paiements bloqués.
                      Soumettez votre Carte Nationale d&apos;Identité en moins de 2 minutes.
                    </p>
                    <div className="flex flex-wrap gap-3 mt-2">
                      {["Retraits bloqués", "Pas de badge ✓ Vérifié", "Paiements bloqués"].map((l) => (
                        <span key={l} className="text-[11px] font-semibold text-amber-700 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-full">
                          ⚠ {l}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {utilisateur.kyc_statut === "en_attente" && (
                  <>
                    <p className="text-sm font-bold text-blue-800">Vérification en cours</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Vos documents sont en cours d&apos;examen par notre équipe. Délai habituel : 24 à 48h.
                      Vous recevrez une notification dès la validation.
                    </p>
                  </>
                )}
                {utilisateur.kyc_statut === "rejete" && (
                  <>
                    <p className="text-sm font-bold text-red-800">Documents refusés — Action requise</p>
                    <p className="text-xs text-red-700 mt-1">
                      Vos documents KYC ont été rejetés. Veuillez les soumettre à nouveau
                      en vous assurant que les fichiers sont lisibles et valides.
                    </p>
                  </>
                )}
              </div>

              {/* CTA */}
              {utilisateur.kyc_statut !== "en_attente" && (
                <Link
                  href="/dashboard/kyc"
                  className={`shrink-0 px-4 py-2.5 font-bold rounded-xl text-sm transition-colors ${
                    utilisateur.kyc_statut === "rejete"
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-amber-500 hover:bg-amber-600 text-white"
                  }`}
                >
                  {utilisateur.kyc_statut === "rejete" ? "Soumettre à nouveau →" : "Vérifier mon identité →"}
                </Link>
              )}
              {utilisateur.kyc_statut === "en_attente" && (
                <span className="shrink-0 px-4 py-2.5 bg-blue-100 text-blue-700 font-bold rounded-xl text-sm">
                  En attente ⏳
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map((i) => <div key={i} className="bg-white rounded-2xl border h-28 animate-pulse" />)}
            </div>
          ) : (
            <>
              {/* Onglets */}
              <div className="flex gap-1 bg-white border border-zinc-100 rounded-xl p-1 w-fit shadow-sm">
                {([
                  { key: "apercu",    label: "Aperçu",   Icon: BarChart2 },
                  { key: "messages",  label: "Messages",  Icon: MessageCircle },
                  { key: "paiements", label: "Revenus",   Icon: CreditCard },
                ] as const).map((o) => (
                  <button key={o.key} onClick={() => setOnglet(o.key)}
                    className={`relative flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${onglet === o.key ? "bg-orange-500 text-white shadow" : "text-zinc-500 hover:text-zinc-800"}`}>
                    <o.Icon size={14} />
                    {o.label}
                    {o.key === "messages" && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full px-1 min-w-4 text-center">{unreadCount}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* ── ONGLET APERÇU ── */}
              {onglet === "apercu" && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s) => (
                      <div key={s.label} className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-2 ${s.color.split(" ")[2]}`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${s.color}`}>
                          <s.Icon size={20} />
                        </div>
                        <p className="text-2xl font-extrabold text-zinc-800">{s.value}</p>
                        <p className="text-xs text-zinc-400 font-medium">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-zinc-800">Prochains cours</h2>
                        <button className="text-xs text-orange-500 font-semibold hover:underline">Voir l&apos;agenda →</button>
                      </div>
                      {data?.prochains_cours.length === 0 ? (
                        <p className="text-sm text-zinc-400 text-center py-6">Aucun cours à venir</p>
                      ) : (
                        <div className="flex flex-col divide-y divide-zinc-100">
                          {data?.prochains_cours.map((c) => (
                            <div key={c.id} className="flex items-center gap-4 py-3">
                              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                                {c.eleve.prenom[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-zinc-800 truncate">{c.eleve.prenom} {c.eleve.nom}</p>
                                <p className="text-xs text-zinc-400">{c.matiere} · {formatDuree(c.duree_minutes)}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs font-medium text-zinc-600">{formatDateCours(c.date_heure)}</p>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.statut === "confirme" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                                  {c.statut === "confirme" ? "Confirmé" : "En attente"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-zinc-800">Messages</h2>
                        {unreadCount > 0 && <span className="text-xs font-bold text-white bg-red-500 rounded-full px-2 py-0.5">{unreadCount} non lu{unreadCount > 1 ? "s" : ""}</span>}
                      </div>
                      {messages.length === 0 ? (
                        <p className="text-sm text-zinc-400 text-center py-4">Aucun message</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {messages.slice(0, 3).map((m) => (
                            <button key={m.id} onClick={() => { ouvrirConversation(m.expediteur); setOnglet("messages"); }}
                              className={`flex items-center gap-3 p-2 rounded-xl text-left transition-colors w-full ${!m.lu ? "bg-orange-50" : "hover:bg-zinc-50"}`}>
                              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs shrink-0">
                                {m.expediteur.prenom[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-zinc-800 truncate">{m.expediteur.prenom} {m.expediteur.nom}</p>
                                <p className="text-[11px] text-zinc-400 truncate">{m.texte}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <p className="text-[10px] text-zinc-400 whitespace-nowrap">{formatMsgDate(m.created_at)}</p>
                                {!m.lu && <div className="w-2 h-2 bg-orange-500 rounded-full" />}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      <button onClick={() => setOnglet("messages")}
                        className="text-xs font-semibold text-orange-500 hover:underline text-center w-full cursor-pointer">
                        Voir tous les messages →
                      </button>
                    </div>
                  </div>

                  {/* Demandes reçues */}
                  <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-bold text-zinc-800">Demandes reçues</h2>
                      {demandes.filter((d) => d.statut === "en_attente").length > 0 && (
                        <span className="text-xs font-bold text-white bg-orange-500 rounded-full px-2 py-0.5">
                          {demandes.filter((d) => d.statut === "en_attente").length} nouvelle{demandes.filter((d) => d.statut === "en_attente").length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    {demandes.length === 0 ? (
                      <p className="text-sm text-zinc-400 text-center py-6">Aucune demande pour le moment</p>
                    ) : (
                      <div className="flex flex-col divide-y divide-zinc-100">
                        {demandes.map((d) => (
                          <div key={d.id} className={`py-4 flex flex-col gap-2 ${d.statut === "en_attente" ? "" : "opacity-60"}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                                  {d.eleve.prenom[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-zinc-800">{d.eleve.prenom} {d.eleve.nom}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${d.type === "premier_cours" ? "bg-blue-50 text-blue-600" : "bg-zinc-100 text-zinc-500"}`}>
                                      {d.type === "premier_cours" ? "1er cours" : "Contact"}
                                    </span>
                                    {d.niveau && <span className="text-xs text-zinc-400">{d.niveau}</span>}
                                    <span className="text-xs text-zinc-400">{new Date(d.created_at).toLocaleDateString("fr-FR")}</span>
                                  </div>
                                </div>
                              </div>
                              <span className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full ${
                                d.statut === "en_attente" ? "bg-yellow-50 text-yellow-600"
                                : d.statut === "accepte" ? "bg-green-50 text-green-600"
                                : "bg-red-50 text-red-500"
                              }`}>
                                {d.statut === "en_attente" ? "En attente" : d.statut === "accepte" ? "Acceptée" : "Refusée"}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-600 bg-zinc-50 rounded-xl px-4 py-2.5 leading-relaxed ml-12">{d.message}</p>
                            <div className="flex gap-2 ml-12 flex-wrap">
                              {d.statut === "en_attente" && (
                                <>
                                  <button
                                    onClick={() => traiterDemande(d.id, "accepte")}
                                    className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full text-xs transition-colors cursor-pointer"
                                  >
                                    ✓ Accepter
                                  </button>
                                  <button
                                    onClick={() => traiterDemande(d.id, "refuse")}
                                    className="px-4 py-1.5 border border-red-300 text-red-400 hover:bg-red-50 font-bold rounded-full text-xs transition-colors cursor-pointer"
                                  >
                                    ✕ Refuser
                                  </button>
                                </>
                              )}
                              {d.statut === "accepte" && (
                                <button
                                  onClick={() => setPlanModal({ eleveId: d.eleve.id, prenom: d.eleve.prenom, matiere: d.eleve.matieres?.[0] ?? "" })}
                                  className="flex items-center gap-1 px-4 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full text-xs transition-colors cursor-pointer"
                                >
                                  <Calendar size={12} />Planifier un cours
                                </button>
                              )}
                              <button
                                onClick={() => { setDemandeReplyId(demandeReplyId === d.id ? null : d.id); setDemandeReplyTexte(""); }}
                                className="px-4 py-1.5 border border-orange-300 text-orange-500 hover:bg-orange-50 font-bold rounded-full text-xs transition-colors cursor-pointer"
                              >
                                {demandeReplyId === d.id ? "Annuler" : "↩ Répondre"}
                              </button>
                            </div>
                            {demandeReplyId === d.id && (
                              <div className="flex gap-2 ml-12">
                                <textarea
                                  value={demandeReplyTexte}
                                  onChange={(e) => setDemandeReplyTexte(e.target.value)}
                                  placeholder={`Votre message pour ${d.eleve.prenom}…`}
                                  rows={2}
                                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 resize-none focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                                <button
                                  onClick={() => envoyerReponseDemande(d.eleve.id)}
                                  disabled={!demandeReplyTexte.trim()}
                                  className="px-3 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                                >
                                  Envoyer
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── ONGLET MESSAGES ── */}
              {onglet === "messages" && (
                <div className="bg-white overflow-hidden flex flex-col -mx-4 lg:mx-0 lg:rounded-2xl lg:border lg:border-zinc-100 lg:shadow-sm border-t border-b border-zinc-100" style={{ height: "calc(100dvh - 188px)" }}>
                  {messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-sm text-zinc-400">Aucun message pour le moment</div>
                  ) : (
                    <div className="flex flex-1 min-h-0">

                      {/* Liste — plein écran mobile si aucune conv ouverte */}
                      <div className={`${selectedContact ? "hidden lg:flex" : "flex"} w-full lg:w-72 shrink-0 border-r border-zinc-100 overflow-y-auto flex-col`}>
                        <div className="px-4 py-3 border-b border-zinc-100 shrink-0">
                          <p className="text-sm font-bold text-zinc-800">Conversations</p>
                        </div>
                        {Array.from(new Map(messages.map((m) => [m.expediteur.id, m.expediteur])).values()).map((contact) => {
                          const dernierMsg = messages.filter((m) => m.expediteur.id === contact.id).at(-1);
                          const nonLus = messages.filter((m) => m.expediteur.id === contact.id && !m.lu).length;
                          const isSelected = selectedContact?.id === contact.id;
                          return (
                            <button key={contact.id} onClick={() => ouvrirConversation(contact)}
                              className={`flex items-center gap-3 px-4 py-3.5 text-left transition-colors border-b border-zinc-50 cursor-pointer w-full ${isSelected ? "bg-orange-50 border-l-2 border-l-orange-500" : "hover:bg-zinc-50"}`}>
                              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm shrink-0">
                                {contact.prenom[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm truncate ${nonLus > 0 ? "font-bold text-zinc-900" : "font-semibold text-zinc-700"}`}>{contact.prenom} {contact.nom}</p>
                                {dernierMsg && <p className="text-xs text-zinc-400 truncate mt-0.5">{dernierMsg.texte}</p>}
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                                {dernierMsg && <p className="text-[10px] text-zinc-400 whitespace-nowrap">{formatMsgDate(dernierMsg.created_at)}</p>}
                                {nonLus > 0 && <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">{nonLus}</span>}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Conversation — plein écran mobile quand ouverte */}
                      <div className={`${!selectedContact ? "hidden lg:flex" : "flex"} flex-1 flex-col min-w-0`}>
                        {!selectedContact ? (
                          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-zinc-400">
                            <MessageCircle size={48} className="text-zinc-200" />
                            <p className="text-sm">Sélectionnez une conversation</p>
                          </div>
                        ) : (
                          <>
                            {/* Header avec bouton retour (mobile) */}
                            <div className="px-4 py-3 border-b border-zinc-100 flex items-center gap-3 bg-white shrink-0">
                              <button onClick={() => setSelectedContact(null)}
                                className="lg:hidden p-1.5 -ml-1 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer shrink-0">
                                <ChevronLeft size={20} />
                              </button>
                              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm shrink-0">
                                {selectedContact.prenom[0]}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-zinc-800 truncate">{selectedContact.prenom} {selectedContact.nom}</p>
                                <p className="text-xs text-zinc-400">{selectedContact.matieres?.[0] ?? "Élève"}</p>
                              </div>
                            </div>

                            {loadingConv ? (
                              <div className="flex-1 flex items-center justify-center text-sm text-zinc-400">Chargement…</div>
                            ) : (
                              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" onClick={() => setShowEmojiFor(null)}>
                                {conversation.map((msg, idx) => {
                                  const isMine = msg.expediteur.id !== selectedContact.id;
                                  const isEditing = editingMsgId === msg.id;
                                  const msgDay = new Date(msg.created_at).toDateString();
                                  const prevDay = idx > 0 ? new Date(conversation[idx - 1].created_at).toDateString() : null;
                                  const grouped = groupReactions(msg.reactions ?? [], utilisateur?.id);
                                  return (
                                    <Fragment key={msg.id}>
                                      {msgDay !== prevDay && (
                                        <div className="flex items-center gap-3 my-1">
                                          <div className="flex-1 h-px bg-zinc-100" />
                                          <span className="text-[11px] text-zinc-400 font-medium">{formatDateSep(msg.created_at)}</span>
                                          <div className="flex-1 h-px bg-zinc-100" />
                                        </div>
                                      )}
                                      <div className={`flex items-end gap-1.5 ${isMine ? "justify-end" : "justify-start"}`}>
                                        {!isMine && (
                                          <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-xs shrink-0 mb-1">
                                            {selectedContact.prenom[0]}
                                          </div>
                                        )}

                                        {/* Actions propres (gauche de la bulle) */}
                                        {isMine && !isEditing && !msg.supprime && (
                                          <div className="flex gap-0.5 self-end pb-1 shrink-0">
                                            <button onClick={(e) => { e.stopPropagation(); setEditingMsgId(msg.id); setEditingText(msg.texte); }} className="text-sm hover:scale-110 transition-transform leading-none" title="Modifier">✏️</button>
                                            <button onClick={(e) => { e.stopPropagation(); supprimerMsg(msg.id); }} className="text-sm hover:scale-110 transition-transform leading-none" title="Supprimer">🗑️</button>
                                          </div>
                                        )}

                                        <div className={`flex flex-col gap-0.5 max-w-[70%] ${isMine ? "items-end" : "items-start"}`}>
                                          {isEditing ? (
                                            <div className="flex gap-1.5 min-w-50" onClick={(e) => e.stopPropagation()}>
                                              <input
                                                value={editingText}
                                                onChange={(e) => setEditingText(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === "Enter") sauvegarderEdit(msg.id); if (e.key === "Escape") setEditingMsgId(null); }}
                                                autoFocus
                                                className="flex-1 text-sm px-3 py-2 rounded-xl border-2 border-orange-400 bg-white focus:outline-none"
                                              />
                                              <button onClick={() => sauvegarderEdit(msg.id)} className="px-3 py-1.5 bg-orange-500 text-white rounded-xl text-xs font-bold cursor-pointer">✓</button>
                                              <button onClick={() => setEditingMsgId(null)} className="px-2 py-1.5 border border-zinc-200 text-zinc-500 rounded-xl text-xs cursor-pointer">✕</button>
                                            </div>
                                          ) : (
                                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                              msg.supprime
                                                ? "bg-zinc-100 text-zinc-400 italic text-xs"
                                                : isMine
                                                  ? "bg-orange-500 text-white rounded-br-sm"
                                                  : "bg-zinc-100 text-zinc-800 rounded-bl-sm"
                                            }`}>
                                              {msg.supprime ? "Message supprimé" : (
                                                <>
                                                  <p>{msg.texte}</p>
                                                  <p className={`text-[10px] mt-1 ${isMine ? "text-orange-200 text-right" : "text-zinc-400"}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                                  </p>
                                                </>
                                              )}
                                            </div>
                                          )}
                                          {grouped.length > 0 && !isEditing && (
                                            <div className="flex flex-wrap gap-1">
                                              {grouped.map(({ emoji, count, active }) => (
                                                <button key={emoji} onClick={(e) => { e.stopPropagation(); toggleReaction(msg.id, emoji); }}
                                                  className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs border cursor-pointer ${active ? "bg-orange-100 border-orange-300 text-orange-700" : "bg-white border-zinc-200 text-zinc-600"}`}>
                                                  {emoji}<span className="text-[10px]">{count}</span>
                                                </button>
                                              ))}
                                            </div>
                                          )}
                                        </div>

                                        {/* Bouton emoji */}
                                        {!isEditing && !msg.supprime && (
                                          <div className="relative self-end pb-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                                            <button onClick={() => setShowEmojiFor(showEmojiFor === msg.id ? null : msg.id)}
                                              className="text-sm hover:scale-110 transition-transform leading-none cursor-pointer" title="Réagir">😊</button>
                                            {showEmojiFor === msg.id && (
                                              <div className={`absolute bottom-full mb-1 ${isMine ? "right-0" : "left-0"} bg-white border border-zinc-100 rounded-2xl shadow-xl p-2 flex gap-1.5 z-20`}>
                                                {EMOJIS.map((e) => (
                                                  <button key={e} onClick={() => toggleReaction(msg.id, e)}
                                                    className="text-lg hover:scale-125 transition-transform leading-none cursor-pointer">{e}</button>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </Fragment>
                                  );
                                })}
                              </div>
                            )}

                            <div className="border-t border-zinc-100 p-3 flex gap-2 bg-white shrink-0">
                              <input
                                value={newMsg}
                                onChange={(e) => setNewMsg(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && envoyerMsg()}
                                placeholder={`Message à ${selectedContact.prenom}…`}
                                className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                              />
                              <button onClick={envoyerMsg} disabled={!newMsg.trim()}
                                className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors cursor-pointer shrink-0">
                                Envoyer
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── ONGLET PAIEMENTS ── */}
              {onglet === "paiements" && !PAIEMENTS_ACTIFS && (
                <div className="flex flex-col items-center justify-center gap-4 py-20">
                  <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center">
                    <CreditCard size={28} className="text-orange-300" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-zinc-700 mb-1">Paiements — Bientôt disponible</p>
                    <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
                      Le système de paiement en ligne sera activé prochainement.
                      Les règlements se font directement entre vous et l&apos;élève.
                    </p>
                  </div>
                </div>
              )}
              {onglet === "paiements" && PAIEMENTS_ACTIFS && data && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Revenus ce mois",        value: `${formatMontant(data.stats.revenus_mois)} FCFA`,  Icon: DollarSign, color: "border-green-100 bg-green-50 text-green-600" },
                      { label: "En attente de versement", value: `${formatMontant(data.stats.en_attente)} FCFA`,   Icon: Hourglass,  color: "border-yellow-100 bg-yellow-50 text-yellow-600" },
                      { label: "Total reversé",           value: `${formatMontant(data.stats.total_reverse)} FCFA`, Icon: TrendingUp, color: "border-blue-100 bg-blue-50 text-blue-600" },
                    ].map((s) => (
                      <div key={s.label} className={`bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4 ${s.color.split(" ")[0]}`}>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${s.color}`}>
                          <s.Icon size={22} />
                        </div>
                        <div>
                          <p className="text-xl font-extrabold text-zinc-800">{s.value}</p>
                          <p className="text-xs text-zinc-400">{s.label}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-zinc-800">Mes comptes</h2>
                        <button className="text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-full transition-colors">+ Ajouter</button>
                      </div>
                      <div className="flex flex-col gap-3">
                        {data.comptes.length === 0 ? (
                          <p className="text-sm text-zinc-400 text-center py-4">Aucun compte enregistré</p>
                        ) : data.comptes.map((c) => (
                          <div key={c.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 ${c.defaut ? "border-orange-500 bg-orange-50" : "border-zinc-100"}`}>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-zinc-800">{c.type}</p>
                              <p className="text-xs text-zinc-400">{c.numero}</p>
                            </div>
                            {c.defaut && <span className="text-xs font-bold text-orange-500 bg-white border border-orange-200 px-2 py-0.5 rounded-full shrink-0">Défaut</span>}
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-zinc-100 pt-4 flex flex-col gap-2">
                        <p className="text-xs font-semibold text-zinc-600">Solde disponible</p>
                        <p className="text-2xl font-extrabold text-green-600">{formatMontant(data.stats.en_attente)} FCFA</p>
                        <button onClick={() => setShowRetrait(true)}
                          className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-sm transition-colors">
                          Demander un versement
                        </button>
                      </div>
                    </div>

                    <div className="lg:col-span-2 flex flex-col gap-6">
                      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
                        <h2 className="text-base font-bold text-zinc-800 mb-4">Paiements reçus</h2>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-xs text-zinc-400 font-semibold border-b border-zinc-100">
                                <th className="text-left pb-3">Élève</th>
                                <th className="text-left pb-3 hidden sm:table-cell">Date</th>
                                <th className="text-left pb-3 hidden md:table-cell">Méthode</th>
                                <th className="text-right pb-3">Montant</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50">
                              {data.paiements_recus.length === 0 ? (
                                <tr><td colSpan={4} className="py-6 text-center text-sm text-zinc-400">Aucun paiement</td></tr>
                              ) : data.paiements_recus.map((p) => (
                                <tr key={p.id} className="hover:bg-zinc-50 transition-colors">
                                  <td className="py-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs shrink-0">{p.eleve.prenom[0]}</div>
                                      <div>
                                        <p className="text-xs font-semibold text-zinc-800">{p.eleve.prenom} {p.eleve.nom}</p>
                                        <p className="text-xs text-zinc-400">{p.matiere}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 text-xs text-zinc-500 hidden sm:table-cell">{new Date(p.created_at).toLocaleDateString("fr-FR")}</td>
                                  <td className="py-3 text-xs text-zinc-500 hidden md:table-cell">{p.methode}</td>
                                  <td className="py-3 text-right font-bold text-green-600 text-xs whitespace-nowrap">+{formatMontant(p.montant)} F</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
                        <h2 className="text-base font-bold text-zinc-800 mb-4">Historique des versements</h2>
                        {data.retraits.length === 0 ? (
                          <p className="text-sm text-zinc-400 text-center py-6">Aucun versement</p>
                        ) : (
                          <div className="flex flex-col divide-y divide-zinc-100">
                            {data.retraits.map((r) => (
                              <div key={r.id} className="flex items-center justify-between py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                                    <Banknote size={18} className="text-green-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-zinc-800">{r.methode}</p>
                                    <p className="text-xs text-zinc-400">{new Date(r.created_at).toLocaleDateString("fr-FR")}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-extrabold text-zinc-800">{formatMontant(r.montant)} F</p>
                                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.statut === "verse" ? "bg-green-50 text-green-600" : r.statut === "refuse" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"}`}>
                                    {r.statut === "verse" ? "Versé" : r.statut === "refuse" ? "Refusé" : "En attente"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 z-40 flex">
        {/* Accueil */}
        <button onClick={() => { setOnglet("apercu"); window.scrollTo(0,0); }}
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors cursor-pointer ${onglet === "apercu" ? "text-orange-500" : "text-zinc-500 hover:text-orange-500"}`}>
          <Home size={20} />
          <span className="text-[10px] font-medium">Accueil</span>
        </button>
        {/* Cours */}
        <Link href="/dashboard/cours"
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-zinc-500 hover:text-orange-500 transition-colors">
          <BookOpen size={20} />
          <span className="text-[10px] font-medium">Cours</span>
        </Link>
        {/* Messages */}
        <button onClick={() => { setOnglet("messages"); window.scrollTo(0,0); }}
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 relative transition-colors cursor-pointer ${onglet === "messages" ? "text-orange-500" : "text-zinc-500 hover:text-orange-500"}`}>
          <div className="relative">
            <MessageCircle size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>
            )}
          </div>
          <span className="text-[10px] font-medium">Messages</span>
        </button>
        {/* Annonces */}
        <Link href="/dashboard/annonces"
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-zinc-500 hover:text-orange-500 transition-colors">
          <FileText size={20} />
          <span className="text-[10px] font-medium">Annonces</span>
        </Link>
        {/* Paiements */}
        <Link href="/dashboard/paiement"
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-zinc-500 hover:text-orange-500 transition-colors">
          <CreditCard size={20} />
          <span className="text-[10px] font-medium">Paiements</span>
        </Link>
      </nav>

      {planModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <h2 className="text-base font-extrabold text-zinc-800">Planifier un cours</h2>
              <button onClick={() => setPlanModal(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm text-zinc-700">
                Élève : <span className="font-bold">{planModal.prenom}</span>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-zinc-700">Matière</label>
                <input
                  value={planModal.matiere}
                  onChange={(e) => setPlanModal({ ...planModal, matiere: e.target.value })}
                  placeholder="Ex: Mathématiques"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-sm font-semibold text-zinc-700">Date</label>
                  <input type="date" value={planDate} onChange={(e) => setPlanDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-sm font-semibold text-zinc-700">Heure</label>
                  <input type="time" value={planHeure} onChange={(e) => setPlanHeure(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-zinc-700">Durée</label>
                <select value={planDuree} onChange={(e) => setPlanDuree(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 heure</option>
                  <option value={90}>1h30</option>
                  <option value={120}>2 heures</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setPlanModal(null)}
                  className="flex-1 py-2.5 border border-zinc-200 text-zinc-600 font-semibold rounded-xl text-sm hover:bg-zinc-50 transition-colors cursor-pointer">
                  Annuler
                </button>
                <button onClick={planifierCours} disabled={!planDate || !planHeure || !planModal.matiere}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors cursor-pointer">
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRetrait && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <h2 className="text-base font-extrabold text-zinc-800">Demander un versement</h2>
              <button onClick={() => setShowRetrait(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                <p className="text-xs text-zinc-500">Solde disponible</p>
                <p className="text-3xl font-extrabold text-green-600 mt-1">{formatMontant(data?.stats.en_attente ?? 0)} FCFA</p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-zinc-700">Montant à retirer (FCFA)</label>
                <input type="number" value={montantRetrait} onChange={(e) => setMontantRetrait(e.target.value)}
                  placeholder="Ex: 25000" min={1000}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                />
              </div>
              {(data?.comptes.length ?? 0) > 0 && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-zinc-700">Vers le compte</label>
                  <select value={compteRetraitId} onChange={(e) => setCompteRetraitId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400">
                    {data?.comptes.map((c: ComptePaiementRead) => (
                      <option key={c.id} value={c.id}>{c.type} — {c.numero}</option>
                    ))}
                  </select>
                </div>
              )}
              <p className="text-xs text-zinc-400">Le versement est effectué sous 24h ouvrées.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowRetrait(false)}
                  className="flex-1 py-2.5 border border-zinc-200 text-zinc-600 font-semibold rounded-xl text-sm hover:bg-zinc-50 transition-colors">
                  Annuler
                </button>
                <button onClick={confirmerRetrait} disabled={!montantRetrait}
                  className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors">
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
