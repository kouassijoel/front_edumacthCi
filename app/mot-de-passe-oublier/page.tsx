"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function MotDePasseOublierPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setLoading(true);
    try {
      await apiFetch("/auth/mot-de-passe-oublier", {
        method: "POST",
        body: JSON.stringify({ email }),
        auth: false,
      });
      setEnvoye(true);
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

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
        <div className="w-full max-w-sm">
          <Link href="/connexion" className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 mb-6">
            <ArrowLeft size={15} />Retour à la connexion
          </Link>

          {envoye ? (
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle size={28} className="text-green-500" />
              </div>
              <h1 className="text-lg font-extrabold text-zinc-800">Email envoyé !</h1>
              <p className="text-sm text-zinc-500">
                Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques minutes.
              </p>
              <p className="text-xs text-zinc-400">Vérifiez aussi vos spams.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8">
              <h1 className="text-xl font-extrabold text-zinc-800 mb-1">Mot de passe oublié</h1>
              <p className="text-sm text-zinc-400 mb-6">Entrez votre email pour recevoir un lien de réinitialisation.</p>

              {erreur && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
                  {erreur}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-zinc-700">Adresse email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      required
                      className="w-full pl-9 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer">
                  {loading ? "Envoi…" : "Envoyer le lien"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
