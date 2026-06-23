"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import {
  Home, Users, BookOpen, Calendar, MessageCircle, CreditCard, Settings, LogOut,
  Bell, Menu, X, ChevronLeft, ChevronRight, DollarSign, Clock, Star, BarChart2,
  TrendingUp, CheckCircle, Banknote,
} from "lucide-react";
import { authService, type Utilisateur } from "@/lib/services/auth.service";
import { PAIEMENTS_ACTIFS } from "@/lib/config";
import {
  dashboardEleveService,
  type DashboardEleve,
  type MessageRead,
  type MessageReactionRead,
  type MoyenPaiementRead,
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
  { label: "Tableau de bord",  Icon: Home,          href: "/dashboard/eleve" },
  { label: "Mes répétiteurs",  Icon: Users,         href: "/dashboard/eleve/repetiteurs" },
  { label: "Mes cours",        Icon: BookOpen,      href: "/dashboard/eleve/cours" },
  { label: "Agenda",           Icon: Calendar,      href: "/dashboard/eleve/agenda" },
  { label: "Messages",         Icon: MessageCircle, href: null },
  { label: "Paiements",        Icon: CreditCard,    href: "/dashboard/eleve/paiement" },
  { label: "Communauté",       Icon: Users,         href: "/communaute" },
  { label: "Paramètres",       Icon: Settings,      href: "/dashboard/eleve/parametres" },
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

const COULEURS_PAIEMENT: Record<string, string> = {
  "Orange Money": "bg-orange-500",
  "Wave": "bg-blue-500",
  "MTN MoMo": "bg-yellow-400",
  "MTN Mobile Money": "bg-yellow-400",
  "Moov Money": "bg-green-500",
  "Carte bancaire": "bg-zinc-500",
};

export default function DashboardEleve() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [onglet, setOnglet] = useState<"apercu" | "paiements" | "messages">("apercu");
  const [showAddModal, setShowAddModal] = useState(false);
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [data, setData] = useState<DashboardEleve | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<MessageRead[]>([]);
  const [selectedContact, setSelectedContact] = useState<UtilisateurMini | null>(null);
  const [conversation, setConversation] = useState<MessageRead[]>([]);
  const [loadingConv, setLoadingConv] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [editingMsgId, setEditingMsgId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [showEmojiFor, setShowEmojiFor] = useState<string | null>(null);

  useEffect(() => {
    authService.getMoi()
      .then(setUtilisateur)
      .catch(() => router.push("/connexion"));
  }, [router]);

  useEffect(() => {
    if (!utilisateur) return;
    dashboardEleveService.charger()
      .then((d) => { setData(d); setMessages(d.messages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [utilisateur]);

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
      dashboardEleveService.charger()
        .then((d) => setMessages(d.messages))
        .catch(() => {});
    }, 15_000);
    return () => clearInterval(id);
  }, [onglet]);

  // Rafraîchir la conversation active toutes les 5 s
  useEffect(() => {
    if (!selectedContact) return;
    const id = setInterval(() => {
      dashboardEleveService.chargerConversation(selectedContact.id)
        .then((msgs) => setConversation(msgs))
        .catch(() => {});
    }, 5_000);
    return () => clearInterval(id);
  }, [selectedContact]);

  async function ajouterMoyen(type: string) {
    const numero = prompt(`Numéro ${type} (ex: +225 07 00 00 00 00)`);
    if (!numero) return;
    try {
      const nouveau = await dashboardEleveService.ajouterMoyenPaiement({ type, numero });
      setData((prev) => prev ? { ...prev, moyens_paiement: [...prev.moyens_paiement, nouveau] } : prev);
      setShowAddModal(false);
    } catch {}
  }

  function handleDeconnexion() {
    authService.deconnecter();
    router.push("/");
  }

  async function ouvrirConversation(contact: UtilisateurMini) {
    setSelectedContact(contact);
    setLoadingConv(true);
    try {
      const msgs = await dashboardEleveService.chargerConversation(contact.id);
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
      const sent = await dashboardEleveService.envoyerMessage(selectedContact.id, texte);
      setConversation((prev) => [...prev, sent]);
    } catch {
      setNewMsg(texte);
    }
  }

  async function supprimerMsg(msgId: string) {
    try {
      await dashboardEleveService.supprimerMessage(msgId);
      setConversation((prev) => prev.map((m) => m.id === msgId ? { ...m, supprime: true, texte: "" } : m));
    } catch {}
  }

  async function sauvegarderEdit(msgId: string) {
    if (!editingText.trim()) return;
    try {
      const updated = await dashboardEleveService.modifierMessage(msgId, editingText.trim());
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
        await dashboardEleveService.retirerReaction(msgId, emoji);
        setConversation((prev) => prev.map((m) => m.id !== msgId ? m : {
          ...m, reactions: m.reactions.filter((r) => !(r.utilisateur_id === utilisateur?.id && r.emoji === emoji)),
        }));
      } else {
        await dashboardEleveService.ajouterReaction(msgId, emoji);
        setConversation((prev) => prev.map((m) => m.id !== msgId ? m : {
          ...m, reactions: [...m.reactions, { emoji, utilisateur_id: utilisateur!.id }],
        }));
      }
    } catch {}
  }

  const nomComplet = utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "…";
  const prenom = utilisateur?.prenom ?? "…";
  const initiales = utilisateur
    ? `${utilisateur.prenom[0]}${utilisateur.nom[0]}`.toUpperCase()
    : "?";

  const unreadCount = messages.filter((m) => !m.lu).length;

  const stats = data ? [
    { label: "Cours suivis",             value: String(data.stats.cours_suivis),                  Icon: BookOpen,  color: "border-blue-100 bg-blue-50 text-blue-600" },
    { label: "Heures d'apprentissage",   value: `${data.stats.heures_apprentissage} h`,           Icon: Clock,     color: "border-orange-100 bg-orange-50 text-orange-600" },
    { label: "Dépenses ce mois",         value: `${formatMontant(data.stats.depenses_mois)} F`,   Icon: DollarSign, color: "border-green-100 bg-green-50 text-green-600" },
    { label: "Répétiteurs actifs",       value: String(data.stats.repetiteurs_actifs),            Icon: Star,      color: "border-purple-100 bg-purple-50 text-purple-600" },
  ] : [];

  function SidebarContent() {
    return (
      <>
        <div className="flex items-center gap-2 px-4 py-4 border-b border-zinc-100">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-lg font-extrabold text-orange-500">Edu</span>
            <span className="text-lg font-extrabold text-zinc-800">Match</span>
            <span className="ml-1 text-xs font-semibold text-white bg-green-600 rounded px-1 py-0.5">CI</span>
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="ml-auto text-zinc-400 hover:text-zinc-600 cursor-pointer hidden lg:block">
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
          <button onClick={() => setMobileMenuOpen(false)} className="ml-auto text-zinc-400 hover:text-zinc-600 cursor-pointer lg:hidden">
            <X size={20} />
          </button>
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
          {navItems.map((item) => {
            if (item.href === null) {
              const tabKey = item.label === "Messages" ? "messages" : "paiements";
              const isActive = onglet === tabKey;
              return (
                <button key={item.label}
                  onClick={() => { setOnglet(tabKey); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full text-left cursor-pointer ${isActive ? "bg-orange-500 text-white" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800"}`}>
                  <item.Icon size={18} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.label === "Messages" && unreadCount > 0 && (
                    <span className={`ml-auto text-xs font-bold rounded-full px-1.5 py-0.5 min-w-5 text-center ${isActive ? "bg-white text-orange-500" : "bg-red-500 text-white"}`}>{unreadCount}</span>
                  )}
                </button>
              );
            }
            const isActive = item.href === "/dashboard/eleve" && onglet === "apercu";
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
          </button>
        </header>

        <header className="hidden lg:flex bg-white border-b border-zinc-100 px-6 py-4 items-center justify-between sticky top-0 z-40">
          <div>
            <h1 className="text-lg font-extrabold text-zinc-800">Bonjour, {prenom} 👋</h1>
            <p className="text-xs text-zinc-400">{utilisateur?.email ?? ""}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-semibold text-orange-500 border border-orange-300 px-4 py-2 rounded-full hover:bg-orange-50 transition-colors">
              + Trouver un répétiteur
            </Link>
            <button className="relative p-2 rounded-xl hover:bg-zinc-50 text-zinc-500 cursor-pointer">
              <Bell size={18} />
            </button>
            <div className="w-9 h-9 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center cursor-pointer shrink-0">
              <span className="text-sm font-bold text-orange-600">{initiales}</span>
            </div>
          </div>
        </header>

        <div className="lg:hidden px-4 pt-4">
          <h1 className="text-lg font-extrabold text-zinc-800">Bonjour, {prenom} 👋</h1>
          <p className="text-xs text-zinc-400">{utilisateur?.email ?? ""}</p>
        </div>

        <main className="flex-1 p-4 lg:p-6 pb-24 lg:pb-6 flex flex-col gap-4 lg:gap-6">

          <div className="flex gap-1 bg-white border border-zinc-100 rounded-xl p-1 w-fit shadow-sm">
            {([
              { key: "apercu",    label: "Aperçu",    Icon: BarChart2 },
              { key: "messages",  label: "Messages",   Icon: MessageCircle },
              { key: "paiements", label: "Paiements",  Icon: CreditCard },
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

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map((i) => <div key={i} className="bg-white rounded-2xl border h-28 animate-pulse" />)}
            </div>
          ) : (
            <>
              {/* ── ONGLET APERÇU ── */}
              {onglet === "apercu" && (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((s) => (
                      <div key={s.label} className={`bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-2 ${s.color.split(" ")[0]}`}>
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
                          {data?.prochains_cours.map((c) => {
                            const photo = c.repetiteur.photo_url || `https://i.pravatar.cc/300?u=${c.repetiteur.id}`;
                            return (
                              <div key={c.id} className="flex items-center gap-4 py-3">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-orange-100 shrink-0">
                                  <Image src={photo} alt={c.repetiteur.prenom} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-zinc-800">{c.repetiteur.prenom} {c.repetiteur.nom}</p>
                                  <p className="text-xs text-zinc-400">{c.matiere} · {formatDuree(c.duree_minutes)}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-xs font-semibold text-zinc-600">{formatDateCours(c.date_heure)}</p>
                                  <button className="text-xs text-orange-500 hover:underline mt-0.5">Rejoindre</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
                      <h2 className="text-base font-bold text-zinc-800 mb-4">Mes répétiteurs</h2>
                      {data?.repetiteurs_actifs.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-sm text-zinc-400">Aucun répétiteur actif</p>
                          <Link href="/" className="mt-2 inline-block text-xs text-orange-500 font-semibold hover:underline">Trouver un répétiteur →</Link>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {data?.repetiteurs_actifs.map((r) => {
                            const photo = r.photo_url || `https://i.pravatar.cc/300?u=${r.id}`;
                            return (
                              <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 cursor-pointer transition-colors">
                                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-orange-100 shrink-0">
                                  <Image src={photo} alt={r.prenom} fill className="object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-zinc-800 truncate">{r.prenom} {r.nom}</p>
                                  <p className="text-xs text-orange-500">{r.matieres?.[0] ?? ""}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  {r.prochain_cours && <p className="text-xs text-zinc-400">{formatDateCours(r.prochain_cours)}</p>}
                                  <div className="flex justify-end mt-0.5">
                                    {[...Array(Math.round(r.note))].map((_, i) => <span key={i} className="text-orange-400 text-xs">★</span>)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
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
                    <button onClick={() => setOnglet("messages")} className="text-xs font-semibold text-orange-500 hover:underline text-center cursor-pointer">
                      Voir tous les messages →
                    </button>
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

                      {/* ── Liste des conversations — plein écran mobile si aucune conv ouverte ── */}
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

                      {/* ── Zone conversation — plein écran mobile quand une conv est ouverte ── */}
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
                                <p className="text-xs text-zinc-400">{selectedContact.matieres?.[0] ?? "Répétiteur"}</p>
                              </div>
                            </div>
                            {loadingConv ? (
                              <div className="flex-1 flex items-center justify-center text-sm text-zinc-400">Chargement…</div>
                            ) : (
                              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" onClick={() => setShowEmojiFor(null)}>
                                {conversation.map((msg, idx) => {
                                  const isMine = msg.expediteur.id === utilisateur?.id;
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
                            {/* Input message */}
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
                      Réglez directement avec votre répétiteur pour l&apos;instant.
                    </p>
                  </div>
                </div>
              )}
              {onglet === "paiements" && PAIEMENTS_ACTIFS && data && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Dépensé ce mois",   value: `${formatMontant(data.stats.depenses_mois)} FCFA`, Icon: Banknote,     color: "border-orange-100 bg-orange-50 text-orange-600" },
                      { label: "Total cette année",  value: `${formatMontant(data.stats.total_annee)} FCFA`,  Icon: TrendingUp,   color: "border-blue-100 bg-blue-50 text-blue-600" },
                      { label: "Cours payés",        value: String(data.stats.cours_payes),                  Icon: CheckCircle,  color: "border-green-100 bg-green-50 text-green-600" },
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
                        <h2 className="text-base font-bold text-zinc-800">Moyens de paiement</h2>
                        <button onClick={() => setShowAddModal(true)}
                          className="text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-full transition-colors">
                          + Ajouter
                        </button>
                      </div>
                      {data.moyens_paiement.length === 0 ? (
                        <p className="text-sm text-zinc-400 text-center py-4">Aucun moyen enregistré</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {data.moyens_paiement.map((m: MoyenPaiementRead) => (
                            <div key={m.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${m.defaut ? "border-orange-500 bg-orange-50" : "border-zinc-100 hover:border-zinc-300"}`}>
                              <div className={`w-6 h-6 rounded-full shrink-0 ${COULEURS_PAIEMENT[m.type] ?? "bg-zinc-400"}`} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-zinc-800">{m.type}</p>
                                <p className="text-xs text-zinc-400">{m.numero}</p>
                              </div>
                              {m.defaut && <span className="text-xs font-bold text-orange-500 bg-white border border-orange-200 px-2 py-0.5 rounded-full shrink-0">Défaut</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-bold text-zinc-800">Historique des paiements</h2>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs text-zinc-400 font-semibold border-b border-zinc-100">
                              <th className="text-left pb-3">Référence</th>
                              <th className="text-left pb-3">Répétiteur</th>
                              <th className="text-left pb-3 hidden sm:table-cell">Date</th>
                              <th className="text-left pb-3 hidden md:table-cell">Méthode</th>
                              <th className="text-right pb-3">Montant</th>
                              <th className="text-right pb-3">Statut</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-50">
                            {data.transactions.length === 0 ? (
                              <tr><td colSpan={6} className="py-6 text-center text-sm text-zinc-400">Aucune transaction</td></tr>
                            ) : data.transactions.map((t) => (
                              <tr key={t.id} className="hover:bg-zinc-50 transition-colors">
                                <td className="py-3 text-xs text-zinc-400 font-mono truncate max-w-20">{t.id.slice(0, 8)}…</td>
                                <td className="py-3">
                                  <div>
                                    <p className="font-semibold text-zinc-800 text-xs">{t.repetiteur.prenom} {t.repetiteur.nom}</p>
                                    <p className="text-xs text-zinc-400">{t.matiere}</p>
                                  </div>
                                </td>
                                <td className="py-3 text-xs text-zinc-500 hidden sm:table-cell">{new Date(t.created_at).toLocaleDateString("fr-FR")}</td>
                                <td className="py-3 text-xs text-zinc-500 hidden md:table-cell">{t.methode}</td>
                                <td className="py-3 text-right font-bold text-zinc-800 text-xs whitespace-nowrap">{formatMontant(t.montant)} F</td>
                                <td className="py-3 text-right">
                                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                    t.statut === "paye" ? "bg-green-50 text-green-600"
                                    : t.statut === "rembourse" ? "bg-blue-50 text-blue-600"
                                    : "bg-yellow-50 text-yellow-600"
                                  }`}>
                                    {t.statut === "paye" ? "Payé" : t.statut === "rembourse" ? "Remboursé" : "En attente"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
        {/* Répétiteurs */}
        <Link href="/"
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-zinc-500 hover:text-orange-500 transition-colors">
          <Users size={20} />
          <span className="text-[10px] font-medium">Trouver</span>
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
        {/* Cours */}
        <Link href="/dashboard/eleve/cours"
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-zinc-500 hover:text-orange-500 transition-colors">
          <BookOpen size={20} />
          <span className="text-[10px] font-medium">Mes cours</span>
        </Link>
        {/* Paramètres */}
        <Link href="/dashboard/eleve/parametres"
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-zinc-500 hover:text-orange-500 transition-colors">
          <Settings size={20} />
          <span className="text-[10px] font-medium">Paramètres</span>
        </Link>
      </nav>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <h2 className="text-base font-extrabold text-zinc-800">Ajouter un moyen de paiement</h2>
              <button onClick={() => setShowAddModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              {[
                { dot: "bg-orange-500", label: "Orange Money",     color: "border-orange-400 hover:bg-orange-50" },
                { dot: "bg-blue-500",   label: "Wave",              color: "border-blue-400 hover:bg-blue-50" },
                { dot: "bg-yellow-400", label: "MTN Mobile Money",  color: "border-yellow-400 hover:bg-yellow-50" },
                { dot: "bg-green-500",  label: "Moov Money",        color: "border-green-400 hover:bg-green-50" },
                { dot: "bg-zinc-500",   label: "Carte bancaire",    color: "border-zinc-300 hover:bg-zinc-50" },
              ].map((m) => (
                <button key={m.label} onClick={() => ajouterMoyen(m.label)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-sm font-semibold text-zinc-700 transition-all ${m.color}`}>
                  <div className={`w-5 h-5 rounded-full shrink-0 ${m.dot}`} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
