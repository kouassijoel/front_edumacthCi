"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CreditCard, X, Wallet, ClipboardList, Lock } from "lucide-react";
import { PAIEMENTS_ACTIFS } from "@/lib/config";
import { authService } from "@/lib/services/auth.service";
import {
  paiementService,
  type TransactionRead,
  type WalletRead,
  METHODES,
} from "@/lib/services/paiement.service";
import { dashboardEleveService, type RepetiteurActifRead } from "@/lib/services/dashboard.service";

const COULEURS_METHODE: Record<string, string> = {
  "Orange Money": "bg-orange-500",
  "MTN Mobile Money": "bg-yellow-400",
  "Wave": "bg-blue-500",
  "Moov Money": "bg-green-500",
};

const MOIS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

function moisLabel(mois: string) {
  const [annee, m] = mois.split("-");
  return `${MOIS_FR[parseInt(m) - 1]} ${annee}`;
}

function moisCourant() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMontant(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " FCFA";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function PaiementEleve() {
  const [wallet, setWallet] = useState<WalletRead | null>(null);
  const [transactions, setTransactions] = useState<TransactionRead[]>([]);
  const [repetiteurs, setRepetiteurs] = useState<RepetiteurActifRead[]>([]);
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 5;
  const [pageTx, setPageTx] = useState(0);
  const [pageRch, setPageRch] = useState(0);

  // Modal paiement répétiteur
  const [showPaiement, setShowPaiement] = useState(false);
  const [repChoisi, setRepChoisi] = useState<RepetiteurActifRead | null>(null);
  const [moisChoisi, setMoisChoisi] = useState(moisCourant());
  const [envoiPaiement, setEnvoiPaiement] = useState(false);
  const [erreurPaiement, setErreurPaiement] = useState("");

  // Modal recharge wallet
  const [showRecharge, setShowRecharge] = useState(false);
  const [montantRecharge, setMontantRecharge] = useState("");
  const [methodeRecharge, setMethodeRecharge] = useState(METHODES[0] as string);
  const [envoiRecharge, setEnvoiRecharge] = useState(false);
  const [erreurRecharge, setErreurRecharge] = useState("");

  useEffect(() => {
    authService.getMoi().catch(() => { window.location.href = "/connexion"; });
    Promise.all([
      paiementService.monWallet().then(setWallet).catch(() => {}),
      paiementService.listerTransactions().then(setTransactions).catch(() => {}),
      dashboardEleveService.charger().then((d) => setRepetiteurs(d.repetiteurs_actifs)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const mc = moisCourant();
  const solde = wallet?.solde ?? 0;

  const paiesToMois = new Set(
    transactions
      .filter((t) => t.statut === "paye" && t.mois === mc)
      .map((t) => t.repetiteur?.id)
      .filter(Boolean)
  );

  const aPayerCeMois = repetiteurs.filter(
    (r) => r.prix_mensuel && r.prix_mensuel > 0 && !paiesToMois.has(r.id)
  );

  function ouvrirPaiement(rep: RepetiteurActifRead) {
    setRepChoisi(rep);
    setMoisChoisi(mc);
    setErreurPaiement("");
    setShowPaiement(true);
  }

  async function soumettrePaiement() {
    if (!repChoisi) return;
    setEnvoiPaiement(true);
    setErreurPaiement("");
    try {
      const transactions = await paiementService.creerTransaction(repChoisi.id, moisChoisi, "Portefeuille");
      console.log(transactions);
      
      setTransactions((prev) => [transactions, ...prev]);
      setWallet((w) => w ? { ...w, solde: w.solde - (repChoisi.prix_mensuel ?? 0) } : w);
      setShowPaiement(false);
      setRepChoisi(null);
    } catch (e: unknown) {
      setErreurPaiement((e as { message?: string })?.message ?? "Erreur lors du paiement.");
    } finally {
      setEnvoiPaiement(false);
    }
  }

  async function soumettreRecharge() {
    const montant = parseInt(montantRecharge);
    if (!montant || montant < 200) return;
    setEnvoiRecharge(true);
    setErreurRecharge("");
    try {
      const res = await paiementService.rechargerWallet(montant, methodeRecharge);
      if (res.payment_url) {
        window.location.href = res.payment_url;
      } else {
        setErreurRecharge("URL de paiement introuvable. Réessayez.");
      }
      setShowRecharge(false);
      setMontantRecharge("");
    } catch (e: unknown) {
      setErreurRecharge((e as { message?: string })?.message ?? "Erreur lors de la recharge.");
    } finally {
      setEnvoiRecharge(false);
    }
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
        <Link href="/dashboard/eleve" className="text-sm font-semibold text-orange-500 hover:underline">← Dashboard</Link>
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
            Pour l&apos;instant, réglez directement avec votre répétiteur.
          </p>
        </div>
        <Link href="/dashboard/eleve" className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors">
          Retour au dashboard
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      <header className="bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard/eleve" className="text-sm font-semibold text-orange-500 hover:underline">← Dashboard</Link>
        <h1 className="text-base font-extrabold text-zinc-800 flex items-center gap-2"><CreditCard size={18} className="text-orange-500" />Mes paiements</h1>
        <div />
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* ── Carte Portefeuille ── */}
        <div className="bg-linear-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-orange-100">Mon portefeuille</p>
              <p className="text-3xl font-extrabold mt-1">{formatMontant(solde)}</p>
            </div>
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <Wallet size={28} className="text-white" />
            </div>
          </div>
          <button
            onClick={() => { setShowRecharge(true); setErreurRecharge(""); }}
            className="w-full py-2.5 bg-white text-orange-600 font-extrabold rounded-xl text-sm hover:bg-orange-50 transition-colors cursor-pointer"
          >
            + Recharger le portefeuille
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-zinc-100 rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
            <p className="text-xs text-zinc-500 font-medium">Répétiteurs actifs</p>
            <p className="text-xl font-extrabold text-blue-600">{repetiteurs.length}</p>
          </div>
          <div className="bg-white border border-zinc-100 rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
            <p className="text-xs text-zinc-500 font-medium">À payer ce mois</p>
            <p className={`text-xl font-extrabold ${aPayerCeMois.length > 0 ? "text-orange-600" : "text-zinc-400"}`}>{aPayerCeMois.length}</p>
          </div>
        </div>

        {/* ── Abonnements du mois ── */}
        {repetiteurs.length > 0 && (
          <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-100">
              <h2 className="text-sm font-extrabold text-zinc-800">
                Abonnements — <span className="text-orange-500">{moisLabel(mc)}</span>
              </h2>
            </div>
            <div className="divide-y divide-zinc-100">
              {repetiteurs.map((r) => {
                const photo = r.photo_url ?? `https://i.pravatar.cc/300?u=${r.id}`;
                const nom = `${r.prenom} ${r.nom}`;
                const payeCeMois = paiesToMois.has(r.id);
                const soldeInsuffisant = !payeCeMois && r.prix_mensuel != null && solde < r.prix_mensuel;
                return (
                  <div key={r.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-200 shrink-0">
                      <Image src={photo} alt={nom} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-zinc-800">{nom}</p>
                      <p className="text-xs text-zinc-400">{r.matieres?.[0] ?? "Cours particulier"} · {r.note.toFixed(1)} ★</p>
                      {soldeInsuffisant && (
                        <p className="text-xs text-red-500 font-medium mt-0.5">Solde insuffisant — rechargez votre portefeuille</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {r.prix_mensuel != null && (
                        <span className="text-sm font-extrabold text-zinc-800">{formatMontant(r.prix_mensuel)}</span>
                      )}
                      {payeCeMois ? (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-xl">✓ Payé</span>
                      ) : !r.is_verifie ? (
                        <span className="text-xs font-semibold text-zinc-400 bg-zinc-100 px-3 py-1.5 rounded-xl" title="Ce répétiteur n'a pas encore complété sa vérification KYC">
                          KYC non vérifié
                        </span>
                      ) : r.prix_mensuel ? (
                        <button
                          onClick={() => ouvrirPaiement(r)}
                          disabled={soldeInsuffisant}
                          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          Payer
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-400 italic">Prix non défini</span>
                      )}
                      {!r.is_verifie && (
                        <p className="text-[10px] text-zinc-400">En attente de vérification</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Historique recharges ── */}
        {wallet && wallet.recharges.length > 0 && (() => {
          const totalRch = Math.ceil(wallet.recharges.length / PAGE_SIZE);
          const pageRchData = wallet.recharges.slice(pageRch * PAGE_SIZE, (pageRch + 1) * PAGE_SIZE);
          return (
            <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-100">
                <h2 className="text-sm font-extrabold text-zinc-800">Historique des recharges</h2>
              </div>
              <div className="divide-y divide-zinc-100">
                {pageRchData.map((r) => (
                  <div key={r.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="w-9 h-9 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                      <div className={`w-4 h-4 rounded-full ${COULEURS_METHODE[r.methode] ?? "bg-zinc-400"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-800">{r.methode}</p>
                      <p className="text-xs text-zinc-400">{formatDate(r.created_at)}</p>
                    </div>
                    <p className="text-sm font-extrabold text-orange-600 shrink-0">+{formatMontant(r.montant)}</p>
                  </div>
                ))}
              </div>
              {totalRch > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 bg-zinc-50">
                  <p className="text-xs text-zinc-400">{pageRch * PAGE_SIZE + 1}–{Math.min((pageRch + 1) * PAGE_SIZE, wallet.recharges.length)} sur {wallet.recharges.length}</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPageRch((p) => Math.max(0, p - 1))} disabled={pageRch === 0}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">← Préc.</button>
                    {Array.from({ length: totalRch }, (_, i) => (
                      <button key={i} onClick={() => setPageRch(i)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer ${i === pageRch ? "bg-orange-500 text-white" : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}>{i + 1}</button>
                    ))}
                    <button onClick={() => setPageRch((p) => Math.min(totalRch - 1, p + 1))} disabled={pageRch === totalRch - 1}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">Suiv. →</button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ── Historique paiements ── */}
        {(() => {
          const totalTx = Math.ceil(transactions.length / PAGE_SIZE);
          const pageTxData = transactions.slice(pageTx * PAGE_SIZE, (pageTx + 1) * PAGE_SIZE);
          return (
            <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-zinc-100">
                <h2 className="text-sm font-extrabold text-zinc-800">Historique des paiements</h2>
              </div>
              <div className="divide-y divide-zinc-100">
                {transactions.length === 0 ? (
                  <div className="p-12 text-center text-zinc-400">
                    <ClipboardList size={40} className="text-zinc-200 mx-auto mb-2" />
                    <p className="font-semibold">Aucun paiement effectué</p>
                    <p className="text-sm mt-1">Vos paiements mensuels apparaîtront ici.</p>
                  </div>
                ) : pageTxData.map((t) => {
                  const nom = t.repetiteur ? `${t.repetiteur.prenom} ${t.repetiteur.nom}` : "Répétiteur";
                  const photo = t.repetiteur?.photo_url ?? `https://i.pravatar.cc/300?u=${t.repetiteur?.id}`;
                  return (
                    <div key={t.id} className="flex items-center gap-4 px-5 py-4">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-200 shrink-0">
                        <Image src={photo} alt={nom} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-zinc-800">{nom}</p>
                        <p className="text-xs text-zinc-400">
                          {t.mois ? moisLabel(t.mois) : t.matiere} · {formatDate(t.created_at)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold text-zinc-800">{formatMontant(t.montant)}</p>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Payé</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {totalTx > 1 && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 bg-zinc-50">
                  <p className="text-xs text-zinc-400">{pageTx * PAGE_SIZE + 1}–{Math.min((pageTx + 1) * PAGE_SIZE, transactions.length)} sur {transactions.length}</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPageTx((p) => Math.max(0, p - 1))} disabled={pageTx === 0}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">← Préc.</button>
                    {Array.from({ length: totalTx }, (_, i) => (
                      <button key={i} onClick={() => setPageTx(i)}
                        className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer ${i === pageTx ? "bg-orange-500 text-white" : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}>{i + 1}</button>
                    ))}
                    <button onClick={() => setPageTx((p) => Math.min(totalTx - 1, p + 1))} disabled={pageTx === totalTx - 1}
                      className="px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer">Suiv. →</button>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* ── MODAL Recharge ── */}
      {showRecharge && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <h2 className="text-base font-extrabold text-zinc-800">Recharger mon portefeuille</h2>
              <button onClick={() => setShowRecharge(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 cursor-pointer"><X size={16} /></button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-orange-600 font-medium">Solde actuel</p>
                  <p className="text-lg font-extrabold text-orange-700">{formatMontant(solde)}</p>
                </div>
                <Wallet size={28} className="text-orange-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-2">Opérateur Mobile Money</label>
                <div className="grid grid-cols-2 gap-2">
                  {METHODES.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethodeRecharge(m)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-semibold transition-all cursor-pointer ${
                        methodeRecharge === m ? "border-orange-500 bg-orange-50 text-orange-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full shrink-0 ${COULEURS_METHODE[m] ?? "bg-zinc-400"}`} />
                      <span className="truncate">{m}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide block mb-1.5">Montant à recharger (FCFA)</label>
                <div className="flex gap-2 mb-2">
                  {[5000, 10000, 20000, 50000].map((v) => (
                    <button
                      key={v}
                      onClick={() => setMontantRecharge(String(v))}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        montantRecharge === String(v) ? "border-orange-500 bg-orange-50 text-orange-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      {v.toLocaleString("de-DE", { maximumFractionDigits: 0 })}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={montantRecharge}
                  onChange={(e) => setMontantRecharge(e.target.value)}
                  placeholder="Autre montant..."
                  min={500}
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <p className="text-xs text-zinc-400 mt-1">Mode test — aucun vrai paiement effectué</p>
              </div>
              {erreurRecharge && <p className="text-xs text-red-500 font-medium">{erreurRecharge}</p>}
            </div>
            <div className="px-5 py-4 border-t border-zinc-100 flex gap-3">
              <button onClick={() => setShowRecharge(false)} className="flex-1 py-2.5 border border-zinc-200 text-zinc-600 font-semibold rounded-xl text-sm hover:bg-zinc-50 transition-colors cursor-pointer">Annuler</button>
              <button
                disabled={!montantRecharge || parseInt(montantRecharge) < 200 || envoiRecharge}
                onClick={soumettreRecharge}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                {envoiRecharge ? "Recharge..." : "Recharger"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL Paiement ── */}
      {showPaiement && repChoisi && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <h2 className="text-base font-extrabold text-zinc-800">Confirmer le paiement</h2>
              <button onClick={() => setShowPaiement(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 cursor-pointer"><X size={16} /></button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="bg-zinc-50 rounded-xl px-4 py-3 flex flex-col gap-1">
                <p className="text-xs text-zinc-500 font-medium">Répétiteur</p>
                <p className="text-sm font-bold text-zinc-800">{repChoisi.prenom} {repChoisi.nom}</p>
                <p className="text-xs text-zinc-400">{repChoisi.matieres?.[0] ?? "Cours particulier"}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-zinc-500">Mois :</p>
                  <select
                    value={moisChoisi}
                    onChange={(e) => setMoisChoisi(e.target.value)}
                    className="text-xs font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg px-2 py-1 cursor-pointer"
                  >
                    {[-1, 0, 1].map((offset) => {
                      const d = new Date();
                      d.setMonth(d.getMonth() + offset);
                      const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                      return <option key={val} value={val}>{moisLabel(val)}</option>;
                    })}
                  </select>
                </div>
                {repChoisi.prix_mensuel != null && (
                  <p className="text-base font-extrabold text-orange-600 mt-1">{formatMontant(repChoisi.prix_mensuel)}</p>
                )}
              </div>
              <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex items-center justify-between">
                <p className="text-xs text-orange-700 font-medium">Solde portefeuille</p>
                <p className="text-sm font-extrabold text-orange-700">{formatMontant(solde)}</p>
              </div>
              {erreurPaiement && <p className="text-xs text-red-500 font-medium">{erreurPaiement}</p>}
            </div>
            <div className="px-5 py-4 border-t border-zinc-100 flex gap-3">
              <button onClick={() => setShowPaiement(false)} className="flex-1 py-2.5 border border-zinc-200 text-zinc-600 font-semibold rounded-xl text-sm hover:bg-zinc-50 transition-colors cursor-pointer">Annuler</button>
              <button
                disabled={envoiPaiement}
                onClick={soumettrePaiement}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                {envoiPaiement ? "Traitement..." : "Confirmer le paiement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
