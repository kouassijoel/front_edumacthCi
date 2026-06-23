"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, CheckCircle, XCircle, Clock, FileText, ExternalLink, LogOut } from "lucide-react";
import { authService } from "@/lib/services/auth.service";
import { apiFetch } from "@/lib/api";

type StatutKYC = "en_attente" | "approuve" | "rejete";
type FiltreKYC = "tous" | StatutKYC;

interface DocKYC {
  id: string;
  utilisateur_id: string;
  utilisateur_prenom: string;
  utilisateur_nom: string;
  utilisateur_email: string;
  type_document: string;
  nom_fichier: string;
  url_fichier: string;
  statut: StatutKYC;
  commentaire: string | null;
  created_at: string;
}

const TYPE_LABEL: Record<string, string> = {
  cni: "Carte Nationale d'Identité",
  passeport: "Passeport",
  diplome: "Diplôme / Attestation",
};

const STATUT_CONFIG: Record<StatutKYC, { label: string; cls: string; icon: React.ReactNode }> = {
  en_attente: { label: "En attente",  cls: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: <Clock size={13} /> },
  approuve:   { label: "Approuvé",    cls: "bg-green-100 text-green-700 border-green-200",   icon: <CheckCircle size={13} /> },
  rejete:     { label: "Rejeté",      cls: "bg-red-100 text-red-600 border-red-200",          icon: <XCircle size={13} /> },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";
const BACKEND_BASE = API_BASE.replace("/api/v1", "");

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
}

async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...(options?.headers as Record<string, string>),
    },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.detail || body?.message || "Erreur");
  return body.data;
}

export default function AdminKYCPage() {
  const [docs, setDocs] = useState<DocKYC[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState<FiltreKYC>("en_attente");
  const [erreurAcces, setErreurAcces] = useState(false);

  // État par document : { [docId]: { commentaire, loading, erreur } }
  const [etats, setEtats] = useState<Record<string, { commentaire: string; loading: boolean; erreur: string }>>({});

  useEffect(() => {
    authService.getMoi()
      .then((u) => {
        if (u.role !== "admin") setErreurAcces(true);
      })
      .catch(() => { window.location.href = "/connexion"; });
  }, []);

  useEffect(() => {
    charger();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtre]);

  async function charger() {
    setLoading(true);
    try {
      const params = filtre !== "tous" ? `?statut=${filtre}` : "";
      const data = await adminFetch<DocKYC[]>(`/admin/kyc${params}`);
      setDocs(data);
      // Initialiser les états manquants
      setEtats((prev) => {
        const next = { ...prev };
        data.forEach((d) => {
          if (!next[d.id]) next[d.id] = { commentaire: "", loading: false, erreur: "" };
        });
        return next;
      });
    } catch {
      setErreurAcces(true);
    } finally {
      setLoading(false);
    }
  }

  async function traiter(docId: string, statut: "approuve" | "rejete") {
    setEtats((prev) => ({ ...prev, [docId]: { ...prev[docId], loading: true, erreur: "" } }));
    try {
      await adminFetch(`/admin/kyc/${docId}`, {
        method: "PATCH",
        body: JSON.stringify({ statut, commentaire: etats[docId]?.commentaire || "" }),
      });
      setDocs((prev) => prev.map((d) => d.id === docId ? { ...d, statut } : d));
    } catch (e) {
      setEtats((prev) => ({
        ...prev,
        [docId]: { ...prev[docId], erreur: e instanceof Error ? e.message : "Erreur" },
      }));
    } finally {
      setEtats((prev) => ({ ...prev, [docId]: { ...prev[docId], loading: false } }));
    }
  }

  const comptes = {
    tous: docs.length,
    en_attente: docs.filter((d) => d.statut === "en_attente").length,
    approuve: docs.filter((d) => d.statut === "approuve").length,
    rejete: docs.filter((d) => d.statut === "rejete").length,
  };

  if (erreurAcces) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center flex flex-col items-center gap-4">
          <XCircle size={48} className="text-red-400" />
          <p className="text-lg font-bold text-zinc-700">Accès refusé</p>
          <p className="text-sm text-zinc-400">Cette page est réservée aux administrateurs.</p>
          <Link href="/" className="text-sm text-orange-500 font-semibold hover:underline">← Retour à l&apos;accueil</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-zinc-100 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-zinc-800">EduMatch — Admin KYC</p>
            <p className="text-xs text-zinc-400">Vérification des identités</p>
          </div>
        </div>
        <button
          onClick={() => { authService.deconnecter(); window.location.href = "/"; }}
          className="flex items-center gap-2 text-sm font-semibold text-red-400 hover:text-red-600 cursor-pointer"
        >
          <LogOut size={15} /> Déconnexion
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {([
            { key: "en_attente", label: "En attente",  color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-100" },
            { key: "approuve",   label: "Approuvés",   color: "text-green-600",  bg: "bg-green-50 border-green-100" },
            { key: "rejete",     label: "Rejetés",     color: "text-red-600",    bg: "bg-red-50 border-red-100" },
            { key: "tous",       label: "Total",       color: "text-zinc-700",   bg: "bg-white border-zinc-100" },
          ] as const).map((s) => (
            <div key={s.key} className={`${s.bg} border rounded-2xl p-4 flex flex-col gap-1`}>
              <p className="text-xs text-zinc-500 font-medium">{s.label}</p>
              <p className={`text-2xl font-extrabold ${s.color}`}>{comptes[s.key]}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex gap-2 flex-wrap">
          {([
            { key: "en_attente", label: "En attente" },
            { key: "approuve",   label: "Approuvés" },
            { key: "rejete",     label: "Rejetés" },
            { key: "tous",       label: "Tous" },
          ] as { key: FiltreKYC; label: string }[]).map((f) => (
            <button
              key={f.key}
              onClick={() => setFiltre(f.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors border cursor-pointer ${
                filtre === f.key
                  ? "bg-orange-500 text-white border-orange-500"
                  : "bg-white text-zinc-600 border-zinc-200 hover:border-orange-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Liste */}
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-zinc-100 h-40 animate-pulse" />
            ))}
          </div>
        ) : docs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-zinc-100 p-16 flex flex-col items-center gap-3">
            <ShieldCheck size={48} className="text-zinc-200" />
            <p className="text-sm font-bold text-zinc-500">Aucun document dans cette catégorie</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {docs.map((doc) => {
              const cfg = STATUT_CONFIG[doc.statut];
              const etat = etats[doc.id] ?? { commentaire: "", loading: false, erreur: "" };
              const traite = doc.statut !== "en_attente";
              return (
                <div key={doc.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                  {/* En-tête du document */}
                  <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-orange-600">
                          {doc.utilisateur_prenom[0]}{doc.utilisateur_nom[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-800">
                          {doc.utilisateur_prenom} {doc.utilisateur_nom}
                        </p>
                        <p className="text-xs text-zinc-400">{doc.utilisateur_email}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>

                  <div className="px-5 py-4 flex flex-col gap-4">
                    {/* Infos document */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-zinc-400" />
                        <div>
                          <p className="text-sm font-semibold text-zinc-700">
                            {TYPE_LABEL[doc.type_document] ?? doc.type_document}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {doc.nom_fichier} · soumis le {new Date(doc.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <a
                        href={`${BACKEND_BASE}${doc.url_fichier}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold text-orange-500 border border-orange-200 hover:bg-orange-50 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <ExternalLink size={13} /> Voir le fichier
                      </a>
                    </div>

                    {/* Commentaire existant */}
                    {traite && doc.commentaire && (
                      <div className="bg-zinc-50 rounded-xl px-4 py-2.5">
                        <p className="text-xs text-zinc-500 font-medium mb-0.5">Commentaire admin</p>
                        <p className="text-sm text-zinc-700">{doc.commentaire}</p>
                      </div>
                    )}

                    {/* Actions (seulement si en attente) */}
                    {!traite && (
                      <div className="flex flex-col gap-3">
                        <input
                          type="text"
                          value={etat.commentaire}
                          onChange={(e) =>
                            setEtats((prev) => ({ ...prev, [doc.id]: { ...prev[doc.id], commentaire: e.target.value } }))
                          }
                          placeholder="Commentaire (optionnel pour approbation, recommandé pour rejet)"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                        />
                        {etat.erreur && (
                          <p className="text-xs text-red-500 font-medium">{etat.erreur}</p>
                        )}
                        <div className="flex gap-3">
                          <button
                            onClick={() => traiter(doc.id, "rejete")}
                            disabled={etat.loading}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-red-300 text-red-500 hover:bg-red-50 disabled:opacity-50 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                          >
                            <XCircle size={15} />
                            {etat.loading ? "…" : "Rejeter"}
                          </button>
                          <button
                            onClick={() => traiter(doc.id, "approuve")}
                            disabled={etat.loading}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500 hover:bg-green-600 disabled:bg-zinc-300 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
                          >
                            <CheckCircle size={15} />
                            {etat.loading ? "…" : "Approuver"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
