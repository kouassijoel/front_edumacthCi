"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";
import { apiFetch } from "@/lib/api";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [mdp, setMdp] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [afficher, setAfficher] = useState(false);
  const [loading, setLoading] = useState(false);
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!token) setErreur("Lien invalide ou expiré.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mdp !== confirmation) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }
    if (mdp.length < 8) {
      setErreur("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setErreur(null);
    setLoading(true);
    try {
      await apiFetch("/auth/reinitialiser-mot-de-passe", {
        method: "POST",
        body: JSON.stringify({ token, nouveau_mot_de_passe: mdp }),
        auth: false,
      });
      setSucces(true);
      setTimeout(() => router.push("/connexion"), 3000);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Lien invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {succes ? (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle size={28} className="text-green-500" />
          </div>
          <h1 className="text-lg font-extrabold text-zinc-800">Mot de passe modifié !</h1>
          <p className="text-sm text-zinc-500">Redirection vers la connexion…</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8">
          <h1 className="text-xl font-extrabold text-zinc-800 mb-1">Nouveau mot de passe</h1>
          <p className="text-sm text-zinc-400 mb-6">Choisissez un mot de passe sécurisé d'au moins 8 caractères.</p>

          {erreur && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0" />{erreur}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-zinc-700">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={afficher ? "text" : "password"}
                  value={mdp}
                  onChange={(e) => setMdp(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                />
                <button type="button" onClick={() => setAfficher(!afficher)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 cursor-pointer">
                  {afficher ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-zinc-700">Confirmer le mot de passe</label>
              <input
                type={afficher ? "text" : "password"}
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer">
              {loading ? "Enregistrement…" : "Enregistrer le mot de passe"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function ReinitialiserMotDePassePage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans">
      <div className="w-full bg-white border-b border-zinc-100 px-6 py-3 flex items-center">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-xl font-extrabold text-orange-500">Edu</span>
          <span className="text-xl font-extrabold text-zinc-800">Match</span>
          <span className="ml-1 text-xs font-semibold text-white bg-green-600 rounded px-1.5 py-0.5">CI</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <Suspense fallback={<div className="text-sm text-zinc-400">Chargement…</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
