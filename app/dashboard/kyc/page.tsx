"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ShieldCheck, Upload, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { repetiteurService, type KYCStatus, type DocumentKYC } from "@/lib/services/repetiteur.service";

const TYPES_DOCUMENT = [
  { value: "cni",       label: "Carte Nationale d'Identité (CNI) — Obligatoire" },
  { value: "passeport", label: "Passeport" },
  { value: "diplome",   label: "Diplôme / Attestation" },
];

function BadgeStatut({ statut }: { statut: string }) {
  const configs: Record<string, { icon: ReactNode; label: string; cls: string }> = {
    non_soumis: { icon: <AlertCircle size={15} />, label: "Non soumis",       cls: "bg-zinc-100 text-zinc-600" },
    en_attente: { icon: <Clock size={15} />,        label: "En cours de vérification", cls: "bg-yellow-100 text-yellow-700" },
    approuve:   { icon: <CheckCircle size={15} />,  label: "Profil vérifié ✓",  cls: "bg-green-100 text-green-700" },
    rejete:     { icon: <XCircle size={15} />,      label: "Rejeté",           cls: "bg-red-100 text-red-600" },
  };
  const c = configs[statut] ?? configs.non_soumis;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${c.cls}`}>
      {c.icon}{c.label}
    </span>
  );
}

function BadgeDocStatut({ statut }: { statut: string }) {
  if (statut === "approuve") return <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Approuvé</span>;
  if (statut === "rejete")   return <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Rejeté</span>;
  return <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">En attente</span>;
}

export default function KYCPage() {
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [erreur, setErreur] = useState("");

  const [typeDoc, setTypeDoc] = useState("cni");
  const [fichier, setFichier] = useState<File | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const [succes, setSucces] = useState("");
  const [erreurEnvoi, setErreurEnvoi] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    repetiteurService.getKYCStatus()
      .then(setKycStatus)
      .catch(() => setErreur("Impossible de charger le statut KYC."))
      .finally(() => setLoading(false));
  }, []);

  async function soumettre(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!fichier) { setErreurEnvoi("Veuillez sélectionner un fichier."); return; }
    setEnvoi(true);
    setErreurEnvoi("");
    setSucces("");
    try {
      const fd = new FormData();
      fd.append("type_document", typeDoc);
      fd.append("fichier", fichier);
      const doc = await repetiteurService.soumettreDocument(fd);
      setSucces("Document soumis avec succès. Votre profil est en cours de vérification.");
      setFichier(null);
      if (inputRef.current) inputRef.current.value = "";
      setKycStatus((prev) => prev
        ? { kyc_statut: "en_attente", documents: [doc, ...prev.documents] }
        : { kyc_statut: "en_attente", documents: [doc] }
      );
    } catch (err) {
      setErreurEnvoi(err instanceof Error ? err.message : "Erreur lors de l'envoi.");
    } finally {
      setEnvoi(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shrink-0">
          <ShieldCheck size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-zinc-900">Vérification d'identité (KYC)</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Vérifiez votre profil pour gagner la confiance des élèves</p>
        </div>
      </div>

      {/* Encart CNI obligatoire */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
        <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 leading-relaxed">
          <p className="font-bold mb-0.5">CNI obligatoire pour les opérations financières</p>
          <p>
            Seule l'approbation de votre <strong>Carte Nationale d'Identité (CNI)</strong> débloque les
            retraits et la réception de paiements. Les autres documents (passeport, diplôme) peuvent être
            soumis à titre complémentaire mais ne remplacent pas la CNI.
          </p>
        </div>
      </div>

      {/* Statut actuel */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-5 flex flex-col gap-3">
        <p className="text-sm font-bold text-zinc-700">Statut actuel</p>
        <BadgeStatut statut={kycStatus?.kyc_statut ?? "non_soumis"} />
        {kycStatus?.kyc_statut === "non_soumis" && (
          <p className="text-sm text-zinc-500 leading-relaxed">
            Soumettez votre <strong>CNI</strong> pour obtenir le badge <strong>Profil vérifié ✓</strong>,
            débloquer les retraits et recevoir des paiements.
          </p>
        )}
        {kycStatus?.kyc_statut === "en_attente" && (
          <p className="text-sm text-zinc-500">Votre document est en cours d'examen. Vous serez notifié par email.</p>
        )}
        {kycStatus?.kyc_statut === "approuve" && (
          <p className="text-sm text-green-600">Félicitations ! Votre identité a été vérifiée. Le badge apparaît sur votre profil.</p>
        )}
        {kycStatus?.kyc_statut === "rejete" && (
          <p className="text-sm text-red-600">Votre document a été rejeté. Soumettez un nouveau document valide.</p>
        )}
      </div>

      {erreur && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{erreur}</p>}

      {/* Formulaire d'upload */}
      {kycStatus?.kyc_statut !== "approuve" && (
        <form onSubmit={soumettre} className="bg-white border border-zinc-100 rounded-2xl p-5 flex flex-col gap-4">
          <p className="text-sm font-bold text-zinc-700">Soumettre un document</p>

          {/* Type de document */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Type de document</label>
            <select
              value={typeDoc}
              onChange={(e) => setTypeDoc(e.target.value)}
              className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-700 focus:outline-none focus:border-orange-400 bg-white"
            >
              {TYPES_DOCUMENT.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Upload fichier */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Fichier (JPG, PNG ou PDF)</label>
            <div
              onClick={() => inputRef.current?.click()}
              className="w-full border-2 border-dashed border-zinc-200 hover:border-orange-400 rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors group"
            >
              <Upload size={24} className="text-zinc-400 group-hover:text-orange-500 transition-colors" />
              {fichier ? (
                <span className="text-sm font-semibold text-orange-500">{fichier.name}</span>
              ) : (
                <span className="text-sm text-zinc-400">Cliquez pour sélectionner un fichier</span>
              )}
              <span className="text-xs text-zinc-400">Max 5 Mo — JPG, PNG, PDF</span>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
              onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
            />
          </div>

          {erreurEnvoi && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{erreurEnvoi}</p>}
          {succes && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">{succes}</p>}

          <button
            type="submit"
            disabled={envoi || !fichier}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
          >
            {envoi ? "Envoi en cours…" : "Soumettre le document"}
          </button>
        </form>
      )}

      {/* Historique des documents */}
      {(kycStatus?.documents?.length ?? 0) > 0 && (
        <div className="bg-white border border-zinc-100 rounded-2xl p-5 flex flex-col gap-3">
          <p className="text-sm font-bold text-zinc-700">Documents soumis</p>
          <div className="flex flex-col gap-2">
            {kycStatus!.documents.map((doc: DocumentKYC) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-zinc-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-zinc-700">{doc.nom_fichier}</p>
                    <p className="text-xs text-zinc-400">
                      {TYPES_DOCUMENT.find((t) => t.value === doc.type_document)?.label ?? doc.type_document}
                      {" · "}
                      {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                    </p>
                    {doc.commentaire && (
                      <p className="text-xs text-red-500 mt-0.5">{doc.commentaire}</p>
                    )}
                  </div>
                </div>
                <BadgeDocStatut statut={doc.statut} />
              </div>
            ))}
          </div>
        </div>
      )}

      <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-600 text-center transition-colors">
        ← Retour au tableau de bord
      </Link>
    </div>
  );
}
