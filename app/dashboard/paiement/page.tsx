"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, X, ArrowUpRight, Smartphone, Lock } from "lucide-react";
import { PAIEMENTS_ACTIFS } from "@/lib/config";
import { authService, type Utilisateur } from "@/lib/services/auth.service";
import {
  paiementService,
  type SoldeRead,
  type TransactionRead,
  type RetraitRead,
  type ComptePaiementRead,
  METHODES,
} from "@/lib/services/paiement.service";

type Onglet = "transactions" | "retraits" | "comptes";

const COULEURS_METHODE: Record<string, string> = {
  "Orange Money": "bg-orange-500",
  "MTN Mobile Money": "bg-yellow-400",
  "Wave": "bg-blue-500",
  "Moov Money": "bg-green-500",
};

function badgeRetrait(statut: RetraitRead["statut"]) {
  if (statut === "verse") return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Versé</span>;
  if (statut === "refuse") return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Refusé</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700">En attente</span>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function formatMontant(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " FCFA";
}

export default function PaiementRepetiteur() {
  const [onglet, setOnglet] = useState<Onglet>("transactions");
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [solde, setSolde] = useState<SoldeRead | null>(null);
  const [transactions, setTransactions] = useState<TransactionRead[]>([]);
  const [retraits, setRetraits] = useState<RetraitRead[]>([]);
  const [comptes, setComptes] = useState<ComptePaiementRead[]>([]);
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 5;
  const [pageTx, setPageTx] = useState(0);
  const [pageRe, setPageRe] = useState(0);

  // Modal retrait
  const [showRetrait, setShowRetrait] = useState(false);
  const [montantRetrait, setMontantRetrait] = useState("");
  const [methodeRetrait, setMethodeRetrait] = useState(METHODES[0] as string);
  const [numeroRetrait, setNumeroRetrait] = useState("");
  const [envoiRetrait, setEnvoiRetrait] = useState(false);
  const [erreurRetrait, setErreurRetrait] = useState("");

  // Modal compte
  const [showCompte, setShowCompte] = useState(false);
  const [typeCompte, setTypeCompte] = useState<typeof METHODES[number]>(METHODES[0]);
  const [numeroCompte, setNumeroCompte] = useState("");
  const [defautCompte, setDefautCompte] = useState(false);
  const [envoiCompte, setEnvoiCompte] = useState(false);

  useEffect(() => {
    authService.getMoi().then(setUtilisateur).catch(() => { window.location.href = "/connexion"; });
    Promise.all([
      paiementService.monSolde().then(setSolde).catch(() => {}),
      paiementService.listerTransactions().then(setTransactions).catch(() => {}),
      paiementService.listerRetraits().then(setRetraits).catch(() => {}),
      paiementService.listerComptes().then(setComptes).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  // Synchronisation temps réel — toutes les 30 s
  useEffect(() => {
    const tick = () => {
      authService.getMoi().then(setUtilisateur).catch(() => {});
      paiementService.monSolde().then(setSolde).catch(() => {});
      paiementService.listerRetraits().then(setRetraits).catch(() => {});
      paiementService.listerTransactions().then(setTransactions).catch(() => {});
    };
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  async function soumettrRetrait() {
    const montant = parseInt(montantRetrait);
    if (!montant || !numeroRetrait.trim()) return;
    setEnvoiRetrait(true);
    setErreurRetrait("");
    try {
      const r = await paiementService.demanderRetrait(montant, methodeRetrait, numeroRetrait.trim());
      setRetraits((prev) => [r, ...prev]);
      setSolde((s) => s ? { ...s, solde_disponible: s.solde_disponible - montant } : s);
      setShowRetrait(false);
      setMontantRetrait("");
      setNumeroRetrait("");
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? "Erreur lors du retrait.";
      setErreurRetrait(msg);
    } finally {
      setEnvoiRetrait(false);
    }
  }

  async function soumettreCompte() {
    if (!numeroCompte.trim()) return;
    setEnvoiCompte(true);
    try {
      const c = await paiementService.ajouterCompte(typeCompte, numeroCompte.trim(), defautCompte);
      setComptes((prev) => defautCompte ? [c, ...prev.map((p) => ({ ...p, defaut: false }))] : [...prev, c]);
      setShowCompte(false);
      setNumeroCompte("");
      setDefautCompte(false);
    } catch {} finally {
      setEnvoiCompte(false);
    }
  }

  async function supprimerCompte(id: string) {
    await paiementService.supprimerCompte(id).catch(() => {});
    setComptes((prev) => prev.filter((c) => c.id !== id));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-zinc-400 text-sm">Chargement...</div>
      </div>
    );
  }

  if (!PAIEMENTS_ACTIFS) return (
    <div className="min-h-screen bg-zinc-50 font-sans flex flex-col">
      <header className="bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm font-semibold text-orange-500 hover:underline">← Dashboard</Link>
        <h1 className="flex items-center gap-2 text-base font-extrabold text-zinc-800"><CreditCard size={18} className="text-orange-500" />Paiements</h1>
        <div />
      </header>
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4">
        <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center">
          <Lock size={32} className="text-orange-400" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-extrabold text-zinc-800 mb-2">Paiements — Bientôt disponible</h2>
          <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
            Le système de paiement en ligne sera activé prochainement.
            Pour l&apos;instant, les règlements se font directement entre l&apos;élève et le répétiteur.
          </p>
        </div>
        <Link href="/dashboard" className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors">
          Retour au dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <header className="bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-sm font-semibold text-orange-500 hover:underline">← Dashboard</Link>
        <h1 className="flex items-center gap-2 text-base font-extrabold text-zinc-800"><CreditCard size={18} className="text-orange-500" />Gestion des paiements</h1>
        <div />
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* ── Stats solde ── */}
        {solde && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Solde disponible", val: formatMontant(solde.solde_disponible), color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
              { label: "Total brut reçu", val: formatMontant(solde.total_brut), color: "text-zinc-800", bg: "bg-white", border: "border-zinc-100" },
              { label: `Commission (${Math.round(solde.taux_commission * 100)}%)`, val: formatMontant(solde.commission), color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
              { label: "Total retiré", val: formatMontant(solde.total_retire), color: "text-zinc-600", bg: "bg-white", border: "border-zinc-100" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4 flex flex-col gap-1`}>
                <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
                <p className={`text-lg font-extrabold ${s.color} leading-tight`}>{s.val}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Onglets ── */}
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-zinc-100">
            {([
              { id: "transactions", label: `Transactions (${transactions.length})` },
              { id: "retraits", label: `Retraits (${retraits.length})` },
              { id: "comptes", label: `Comptes (${comptes.length})` },
            ] as { id: Onglet; label: string }[]).map((t) => (
              <button
                key={t.id}
                onClick={() => { setOnglet(t.id); setPageTx(0); setPageRe(0); }}
                className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                  onglet === t.id
                    ? "text-orange-500 border-b-2 border-orange-500 bg-orange-50/50"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── TRANSACTIONS ── */}
          {onglet === "transactions" && (() => {
            const totalTx = Math.ceil(transactions.length / PAGE_SIZE);
            const pageTxData = transactions.slice(pageTx * PAGE_SIZE, (pageTx + 1) * PAGE_SIZE);
            return (
              <>
                <div className="divide-y divide-zinc-100">
                  {transactions.length === 0 ? (
                    <div className="p-12 text-center text-zinc-400 flex flex-col items-center gap-2">
                      <CreditCard size={40} className="text-zinc-200" />
                      <p className="font-semibold">Aucune transaction</p>
                      <p className="text-sm mt-1">Vos paiements reçus apparaîtront ici.</p>
                    </div>
                  ) : pageTxData.map((t) => (
                    <div key={t.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 border border-green-200 flex items-center justify-center shrink-0">
                        <div className={`w-5 h-5 rounded-full ${COULEURS_METHODE[t.methode] ?? "bg-zinc-400"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-zinc-800">
                          {t.eleve ? `${t.eleve.prenom} ${t.eleve.nom}` : "Élève"}
                        </p>
                        <p className="text-xs text-zinc-400">{t.matiere} · {t.methode} · {formatDate(t.created_at)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold text-green-600">+{formatMontant(t.montant)}</p>
                        <p className="text-xs text-zinc-400">net : {formatMontant(Math.round(t.montant * 0.9))}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {totalTx > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 bg-zinc-50">
                    <p className="text-xs text-zinc-400">{pageTx * PAGE_SIZE + 1}–{Math.min((pageTx + 1) * PAGE_SIZE, transactions.length)} sur {transactions.length}</p>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setPageTx((p) => Math.max(0, p - 1))} disabled={pageTx === 0}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">← Préc.</button>
                      {Array.from({ length: totalTx }, (_, i) => (
                        <button key={i} onClick={() => setPageTx(i)}
                          className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer ${i === pageTx ? "bg-orange-500 text-white" : "border border-zinc-200 text-zinc-600 hover:bg-white"}`}>{i + 1}</button>
                      ))}
                      <button onClick={() => setPageTx((p) => Math.min(totalTx - 1, p + 1))} disabled={pageTx === totalTx - 1}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">Suiv. →</button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* ── RETRAITS ── */}
          {onglet === "retraits" && (
            <>
              {(() => {
                const kycOk = utilisateur?.is_verifie ?? false;
                const retraitEnAttente = retraits.find((r) => r.statut === "en_attente");
                const bloque = !kycOk || !!retraitEnAttente;
                return (
                  <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-zinc-500">Demandez un virement vers votre Mobile Money</p>
                      <button
                        onClick={() => setShowRetrait(true)}
                        disabled={bloque}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        + Demander un retrait
                      </button>
                    </div>
                    {!kycOk && utilisateur?.kyc_statut === "en_attente" && (
                      <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2">
                        <span className="text-blue-500 text-sm">⏳</span>
                        <p className="text-xs text-blue-800 font-medium flex-1">
                          Votre CNI est en cours de vérification. Les retraits seront débloqués après approbation.
                        </p>
                        <button
                          onClick={() => authService.getMoi().then(setUtilisateur).catch(() => {})}
                          className="text-xs font-bold text-blue-700 underline whitespace-nowrap cursor-pointer"
                        >
                          Actualiser
                        </button>
                      </div>
                    )}
                    {!kycOk && utilisateur?.kyc_statut === "rejete" && (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                        <span className="text-red-500 text-sm">🔒</span>
                        <p className="text-xs text-red-800 font-medium flex-1">
                          Votre CNI a été rejetée. Soumettez-en une nouvelle pour débloquer les retraits.
                        </p>
                        <Link href="/dashboard/kyc" className="text-xs font-bold text-red-700 underline whitespace-nowrap">
                          Resoumettre →
                        </Link>
                      </div>
                    )}
                    {!kycOk && (utilisateur?.kyc_statut === "non_soumis" || !utilisateur?.kyc_statut) && (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                        <span className="text-amber-500 text-sm">🔒</span>
                        <p className="text-xs text-amber-800 font-medium flex-1">
                          Soumettez votre CNI (Carte Nationale d&apos;Identité) pour débloquer les retraits.
                        </p>
                        <Link href="/dashboard/kyc" className="text-xs font-bold text-amber-700 underline whitespace-nowrap">
                          Soumettre →
                        </Link>
                      </div>
                    )}
                    {kycOk && retraitEnAttente && (
                      <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2">
                        <span className="text-yellow-500 text-sm">⏳</span>
                        <p className="text-xs text-yellow-700 font-medium">
                          Une demande de retrait est déjà en cours. Vous pourrez en soumettre une nouvelle après validation.
                        </p>
                      </div>
                    )}
                    {kycOk && !retraitEnAttente && solde && solde.solde_disponible < 2000 && (
                      <div className="flex items-center gap-2 bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2">
                        <span className="text-zinc-400 text-sm">💰</span>
                        <p className="text-xs text-zinc-600 font-medium">
                          Solde insuffisant pour un retrait. Minimum : <strong>2 000 FCFA</strong> — disponible : <strong>{formatMontant(solde.solde_disponible)}</strong>.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
              {(() => {
                const totalRe = Math.ceil(retraits.length / PAGE_SIZE);
                const pageReData = retraits.slice(pageRe * PAGE_SIZE, (pageRe + 1) * PAGE_SIZE);
                return (
                  <>
                    <div className="divide-y divide-zinc-100">
                      {retraits.length === 0 ? (
                        <div className="p-12 text-center text-zinc-400 flex flex-col items-center gap-2">
                          <ArrowUpRight size={40} className="text-zinc-200" />
                          <p className="font-semibold">Aucune demande de retrait</p>
                        </div>
                      ) : pageReData.map((r) => (
                        <div key={r.id} className="flex items-center gap-4 px-5 py-4">
                          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            <div className={`w-5 h-5 rounded-full ${COULEURS_METHODE[r.methode] ?? "bg-zinc-400"}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-zinc-800">{r.methode}</p>
                            <p className="text-xs text-zinc-400">{formatDate(r.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {badgeRetrait(r.statut)}
                            <p className="text-sm font-extrabold text-zinc-800">{formatMontant(r.montant)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {totalRe > 1 && (
                      <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 bg-zinc-50">
                        <p className="text-xs text-zinc-400">{pageRe * PAGE_SIZE + 1}–{Math.min((pageRe + 1) * PAGE_SIZE, retraits.length)} sur {retraits.length}</p>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setPageRe((p) => Math.max(0, p - 1))} disabled={pageRe === 0}
                            className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">← Préc.</button>
                          {Array.from({ length: totalRe }, (_, i) => (
                            <button key={i} onClick={() => setPageRe(i)}
                              className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer ${i === pageRe ? "bg-orange-500 text-white" : "border border-zinc-200 text-zinc-600 hover:bg-white"}`}>{i + 1}</button>
                          ))}
                          <button onClick={() => setPageRe((p) => Math.min(totalRe - 1, p + 1))} disabled={pageRe === totalRe - 1}
                            className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">Suiv. →</button>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}

          {/* ── COMPTES ── */}
          {onglet === "comptes" && (
            <>
              <div className="px-5 py-3 flex items-center justify-between border-b border-zinc-100 bg-zinc-50">
                <p className="text-xs text-zinc-500">Vos comptes Mobile Money pour recevoir vos retraits</p>
                <button
                  onClick={() => setShowCompte(true)}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  + Ajouter un compte
                </button>
              </div>
              <div className="divide-y divide-zinc-100">
                {comptes.length === 0 ? (
                  <div className="p-12 text-center text-zinc-400 flex flex-col items-center gap-2">
                    <Smartphone size={40} className="text-zinc-200" />
                    <p className="font-semibold">Aucun compte enregistré</p>
                    <p className="text-sm mt-1">Ajoutez Orange Money, Wave, MTN ou Moov Money.</p>
                  </div>
                ) : comptes.map((c) => (
                  <div key={c.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                      <div className={`w-5 h-5 rounded-full ${COULEURS_METHODE[c.type] ?? "bg-zinc-400"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-zinc-800">{c.type}</p>
                        {c.defaut && (
                          <span className="text-xs font-bold text-white bg-orange-500 px-2 py-0.5 rounded-full">Par défaut</span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 font-mono">{c.numero}</p>
                    </div>
                    <button
                      onClick={() => supprimerCompte(c.id)}
                      className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors cursor-pointer"
                    >
                      Supprimer
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── MODAL Retrait ── */}
      {showRetrait && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <h2 className="text-base font-extrabold text-zinc-800">Demander un virement</h2>
              <button onClick={() => { setShowRetrait(false); setErreurRetrait(""); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 cursor-pointer"><X size={16} /></button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {solde && (
                <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-green-600 font-medium">Solde disponible</p>
                  <p className="text-xl font-extrabold text-green-700">{formatMontant(solde.solde_disponible)}</p>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-2">Opérateur Mobile Money</label>
                <div className="grid grid-cols-2 gap-2">
                  {METHODES.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethodeRetrait(m)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all cursor-pointer ${
                        methodeRetrait === m ? "border-orange-500 bg-orange-50 text-orange-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full shrink-0 ${COULEURS_METHODE[m] ?? "bg-zinc-400"}`} />
                      <span className="truncate">{m}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-1.5">Numéro de téléphone</label>
                <input
                  type="tel"
                  value={numeroRetrait}
                  onChange={(e) => setNumeroRetrait(e.target.value)}
                  placeholder="Ex : 07 XX XX XX XX"
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-1.5">Montant (min. 2 000 FCFA)</label>
                <input
                  type="number"
                  value={montantRetrait}
                  onChange={(e) => setMontantRetrait(e.target.value)}
                  placeholder="Ex : 10000"
                  min={2000}
                  max={solde?.solde_disponible}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              {erreurRetrait && <p className="text-xs text-red-500 font-medium">{erreurRetrait}</p>}
            </div>
            <div className="px-5 py-4 border-t border-zinc-100 flex gap-3">
              <button onClick={() => { setShowRetrait(false); setErreurRetrait(""); }} className="flex-1 py-2.5 border border-zinc-200 text-zinc-600 font-semibold rounded-xl text-sm hover:bg-zinc-50 transition-colors cursor-pointer">Annuler</button>
              <button
                disabled={!numeroRetrait.trim() || !montantRetrait || parseInt(montantRetrait) < 2000 || envoiRetrait}
                onClick={soumettrRetrait}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                {envoiRetrait ? "Envoi..." : "Confirmer le virement"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL Ajouter compte ── */}
      {showCompte && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <h2 className="text-base font-extrabold text-zinc-800">Ajouter un compte Mobile Money</h2>
              <button onClick={() => setShowCompte(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 cursor-pointer"><X size={16} /></button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-1.5">Opérateur</label>
                <div className="grid grid-cols-2 gap-2">
                  {METHODES.map((m) => (
                    <button
                      key={m}
                      onClick={() => setTypeCompte(m)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer ${
                        typeCompte === m ? "border-orange-500 bg-orange-50 text-orange-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full shrink-0 ${COULEURS_METHODE[m] ?? "bg-zinc-400"}`} />
                      <span className="truncate">{m}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-1.5">Numéro de téléphone</label>
                <input
                  type="tel"
                  value={numeroCompte}
                  onChange={(e) => setNumeroCompte(e.target.value)}
                  placeholder="Ex : 07 XX XX XX XX"
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={defautCompte}
                  onChange={(e) => setDefautCompte(e.target.checked)}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm text-zinc-600 font-medium">Définir comme compte par défaut</span>
              </label>
            </div>
            <div className="px-5 py-4 border-t border-zinc-100 flex gap-3">
              <button onClick={() => setShowCompte(false)} className="flex-1 py-2.5 border border-zinc-200 text-zinc-600 font-semibold rounded-xl text-sm hover:bg-zinc-50 transition-colors cursor-pointer">Annuler</button>
              <button
                disabled={!numeroCompte.trim() || envoiCompte}
                onClick={soumettreCompte}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                {envoiCompte ? "Ajout..." : "Ajouter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
