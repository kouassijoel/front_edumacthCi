"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home, User, BookOpen, Calendar, MessageCircle, CreditCard,
  Star, Settings, LogOut, ShieldCheck, Zap, CheckCircle, Clock, AlertCircle,
} from "lucide-react";
import { authService, type Utilisateur } from "@/lib/services/auth.service";
import { boostService, type Forfait, type BoostRead, type MesBoostsData } from "@/lib/services/boost.service";

const NAV = [
  { label: "Tableau de bord",   href: "/dashboard",         Icon: Home },
  { label: "Mon profil",         href: "/dashboard/profil",  Icon: User },
  { label: "Vérification KYC",   href: "/dashboard/kyc",     Icon: ShieldCheck },
  { label: "Mes cours",          href: "/dashboard/cours",   Icon: BookOpen },
  { label: "Agenda",             href: "/dashboard/agenda",  Icon: Calendar },
  { label: "Messages",           href: "/dashboard",         Icon: MessageCircle },
  { label: "Paiements",          href: "/dashboard/paiement",Icon: CreditCard },
  { label: "Avis reçus",         href: "/dashboard/avis",    Icon: Star },
  { label: "Booster mon profil", href: "/dashboard/boost",   Icon: Zap },
  { label: "Paramètres",         href: "/dashboard/parametres", Icon: Settings },
];

const FORFAIT_STYLES: Record<string, { bg: string; border: string; text: string; ring: string; badgeBg: string }> = {
  premium:  { bg: "bg-amber-50",  border: "border-amber-300",  text: "text-amber-700",  ring: "ring-amber-400",  badgeBg: "bg-amber-400 text-amber-900" },
  standard: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-600", ring: "ring-orange-400", badgeBg: "bg-orange-500 text-white" },
  basique:  { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-600",   ring: "ring-blue-400",   badgeBg: "bg-blue-500 text-white" },
};

function joursRestants(dateFin: string): number {
  return Math.max(0, Math.ceil((new Date(dateFin).getTime() - Date.now()) / 86400000));
}

function ProgressBar({ jours, total }: { jours: number; total: number }) {
  const pct = total > 0 ? Math.round((jours / total) * 100) : 0;
  return (
    <div className="w-full bg-zinc-100 rounded-full h-2">
      <div
        className="h-2 rounded-full bg-orange-500 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function BoostPage() {
  const router = useRouter();
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [forfaits, setForfaits] = useState<Forfait[]>([]);
  const [boostData, setBoostData] = useState<MesBoostsData | null>(null);
  const [boostActif, setBoostActif] = useState<BoostRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedForfait, setSelectedForfait] = useState<string>("");
  const [achat, setAchat] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");

  useEffect(() => {
    authService.getMoi()
      .then((u) => {
        setUtilisateur(u);
        return Promise.all([
          boostService.getForfaits(),
          boostService.mesBoosts(),
          boostService.monBoostActif(),
        ]);
      })
      .then(([f, d, a]) => {
        setForfaits(f);
        setBoostData(d);
        setBoostActif(a);
      })
      .catch(() => router.push("/connexion"))
      .finally(() => setLoading(false));
  }, [router]);

  async function acheterBoost() {
    if (!selectedForfait) return;
    setAchat(true);
    setErreur("");
    setSucces("");
    try {
      const boost = await boostService.acheter(selectedForfait);
      setBoostActif(boost);
      const data = await boostService.mesBoosts();
      setBoostData(data);
      setSucces(`Boost « ${boost.badge} » activé avec succès ! Votre profil apparaît maintenant en tête des résultats.`);
      setSelectedForfait("");
    } catch (e: unknown) {
      setErreur((e as { message?: string })?.message ?? "Erreur lors de l'achat.");
    } finally {
      setAchat(false);
    }
  }

  const nomComplet = utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "…";
  const initiales = utilisateur ? `${utilisateur.prenom[0]}${utilisateur.nom[0]}`.toUpperCase() : "?";
  const selectedInfo = forfaits.find(f => f.key === selectedForfait);
  const canAfford = boostData && selectedInfo ? boostData.solde_disponible >= selectedInfo.prix : false;

  return (
    <div className="min-h-screen flex bg-zinc-100 font-sans">

      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-zinc-100 flex-col shrink-0 h-screen sticky top-0">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-zinc-100">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-lg font-extrabold text-orange-500">Edu</span>
            <span className="text-lg font-extrabold text-zinc-800">Match</span>
            <span className="ml-1 text-xs font-semibold text-white bg-green-600 rounded px-1 py-0.5">CI</span>
          </Link>
        </div>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-100">
          <div className="relative w-10 h-10 rounded-full bg-orange-100 border-2 border-orange-200 overflow-hidden flex items-center justify-center shrink-0">
            {utilisateur?.photo_url ? (
              <Image src={utilisateur.photo_url} alt={nomComplet} fill className="object-cover" unoptimized />
            ) : (
              <span className="text-sm font-bold text-orange-600">{initiales}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-zinc-800 truncate">{nomComplet}</span>
            <span className="text-xs text-orange-500">Répétiteur</span>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-2 flex-1">
          {NAV.map((item) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                item.href === "/dashboard/boost"
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
      </aside>

      {/* Contenu */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-zinc-100 px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors shrink-0">
              <span className="text-lg leading-none">←</span>
            </Link>
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <Zap size={18} className="text-orange-500" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-zinc-800">Booster mon profil</h1>
              <p className="text-xs text-zinc-400">Gagnez en visibilité et attirez plus d&apos;élèves</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 flex flex-col gap-6 max-w-3xl w-full">

          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-2xl border h-32 animate-pulse" />)}
            </div>
          ) : (
            <>
              {/* Solde disponible */}
              <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Solde disponible pour un boost</p>
                  <p className="text-3xl font-extrabold text-zinc-800 mt-1">
                    {boostData?.solde_disponible.toLocaleString("de-DE", { maximumFractionDigits: 0 }) ?? "0"}
                    <span className="text-base font-semibold text-zinc-400 ml-1">FCFA</span>
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">Calculé depuis vos gains nets sur la plateforme</p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                  <Zap size={28} className="text-orange-500" />
                </div>
              </div>

              {/* Boost actif */}
              {boostActif && boostActif.statut === "actif" ? (() => {
                const s = FORFAIT_STYLES[boostActif.forfait] ?? FORFAIT_STYLES.basique;
                const jours = boostActif.date_fin ? joursRestants(boostActif.date_fin) : 0;
                return (
                  <div className={`rounded-2xl border-2 ${s.border} ${s.bg} p-5`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${s.badgeBg}`}>
                        <Zap size={22} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`text-base font-extrabold ${s.text}`}>⚡ {boostActif.badge}</p>
                          <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Actif</span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          Forfait <span className="font-semibold capitalize">{boostActif.forfait}</span> ·{" "}
                          Expire le <span className="font-semibold text-zinc-700">
                            {boostActif.date_fin
                              ? new Date(boostActif.date_fin).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
                              : "—"}
                          </span>
                        </p>
                        <div className="mt-3 flex flex-col gap-1.5">
                          <div className="flex justify-between text-xs text-zinc-500">
                            <span>{jours} jour{jours > 1 ? "s" : ""} restant{jours > 1 ? "s" : ""}</span>
                            <span>{boostActif.duree_jours} jours au total</span>
                          </div>
                          <ProgressBar jours={jours} total={boostActif.duree_jours} />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/50 flex items-center gap-2 text-xs text-zinc-500">
                      <CheckCircle size={14} className="text-green-500 shrink-0" />
                      Votre profil est mis en avant dans les résultats de recherche jusqu&apos;à expiration.
                    </div>
                  </div>
                );
              })() : (
                <div className="bg-white rounded-2xl border border-dashed border-zinc-200 p-5 flex items-center gap-4">
                  <AlertCircle size={22} className="text-zinc-300 shrink-0" />
                  <p className="text-sm text-zinc-400">Aucun boost actif. Choisissez un forfait ci-dessous pour apparaître en tête des résultats.</p>
                </div>
              )}

              {/* Message succès */}
              {succes && (
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-2xl px-5 py-4">
                  <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-green-700">{succes}</p>
                </div>
              )}

              {/* Choix du forfait — affiché seulement si pas de boost actif */}
              {(!boostActif || boostActif.statut !== "actif") && (
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex flex-col gap-5">
                  <h2 className="text-base font-extrabold text-zinc-800">Choisir un forfait</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {forfaits.map((f) => {
                      const s = FORFAIT_STYLES[f.key] ?? FORFAIT_STYLES.basique;
                      const isSelected = selectedForfait === f.key;
                      const peutPayer = boostData ? boostData.solde_disponible >= f.prix : false;
                      return (
                        <button
                          key={f.key}
                          onClick={() => { if (peutPayer) setSelectedForfait(isSelected ? "" : f.key); }}
                          disabled={!peutPayer}
                          className={`relative flex flex-col gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                            isSelected
                              ? `${s.border} ${s.bg} ring-2 ${s.ring}`
                              : peutPayer
                              ? "border-zinc-200 bg-white hover:border-zinc-300 cursor-pointer"
                              : "border-zinc-100 bg-zinc-50 opacity-50 cursor-not-allowed"
                          }`}
                        >
                          {/* Badge */}
                          <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full self-start ${s.badgeBg}`}>
                            ⚡ {f.badge}
                          </span>

                          <div>
                            <p className="text-sm font-extrabold text-zinc-800">{f.label}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{f.duree_jours} jours de visibilité boostée</p>
                          </div>

                          <p className={`text-xl font-extrabold ${s.text}`}>
                            {f.prix.toLocaleString("de-DE", { maximumFractionDigits: 0 })}
                            <span className="text-xs font-semibold text-zinc-400 ml-1">FCFA</span>
                          </p>

                          {!peutPayer && (
                            <p className="text-[10px] text-red-400 font-semibold">Solde insuffisant</p>
                          )}
                          {isSelected && (
                            <div className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${s.badgeBg}`}>
                              <CheckCircle size={12} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Récap + bouton achat */}
                  {selectedForfait && selectedInfo && (
                    <div className={`rounded-2xl border p-4 flex flex-col gap-3 ${FORFAIT_STYLES[selectedForfait]?.bg} ${FORFAIT_STYLES[selectedForfait]?.border}`}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-zinc-800">Récapitulatif</p>
                        <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${FORFAIT_STYLES[selectedForfait]?.badgeBg}`}>
                          ⚡ {selectedInfo.badge}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-sm text-zinc-600">
                        <div className="flex justify-between">
                          <span>Forfait</span>
                          <span className="font-semibold">{selectedInfo.label}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Durée</span>
                          <span className="font-semibold">{selectedInfo.duree_jours} jours</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Prix</span>
                          <span className={`font-extrabold ${FORFAIT_STYLES[selectedForfait]?.text}`}>
                            {selectedInfo.prix.toLocaleString("de-DE", { maximumFractionDigits: 0 })} FCFA
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-white/50 pt-1 mt-1">
                          <span>Solde après achat</span>
                          <span className="font-bold text-zinc-800">
                            {((boostData?.solde_disponible ?? 0) - selectedInfo.prix).toLocaleString("de-DE", { maximumFractionDigits: 0 })} FCFA
                          </span>
                        </div>
                      </div>

                      {erreur && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                          <AlertCircle size={14} className="text-red-500 shrink-0" />
                          <p className="text-xs font-semibold text-red-600">{erreur}</p>
                        </div>
                      )}

                      <button
                        onClick={acheterBoost}
                        disabled={achat || !canAfford}
                        className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-extrabold rounded-xl text-sm transition-colors cursor-pointer"
                      >
                        {achat ? "Activation en cours…" : `⚡ Activer le boost ${selectedInfo.label}`}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Historique */}
              {boostData && boostData.boosts.length > 0 && (
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex flex-col gap-4">
                  <h2 className="text-base font-extrabold text-zinc-800">Historique des boosts</h2>
                  <div className="flex flex-col divide-y divide-zinc-50">
                    {boostData.boosts.map((b) => {
                      const s = FORFAIT_STYLES[b.forfait] ?? FORFAIT_STYLES.basique;
                      return (
                        <div key={b.id} className="flex items-center gap-4 py-3.5">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${b.statut === "actif" ? s.badgeBg : "bg-zinc-100 text-zinc-400"}`}>
                            {b.statut === "actif" ? <Zap size={16} /> : <Clock size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-zinc-800">{b.badge ?? b.forfait}</p>
                            <p className="text-xs text-zinc-400">
                              {b.date_debut
                                ? new Date(b.date_debut).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
                                : "—"}
                              {" → "}
                              {b.date_fin
                                ? new Date(b.date_fin).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
                                : "—"}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-extrabold text-zinc-800">{b.prix.toLocaleString("de-DE", { maximumFractionDigits: 0 })} FCFA</p>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              b.statut === "actif"  ? "bg-green-50 text-green-600" :
                              b.statut === "expire" ? "bg-zinc-100 text-zinc-400" :
                              "bg-red-50 text-red-400"
                            }`}>
                              {b.statut === "actif" ? "Actif" : b.statut === "expire" ? "Expiré" : "Refusé"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
