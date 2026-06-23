"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepte = localStorage.getItem("cookies_acceptes");
    if (!accepte) setVisible(true);
  }, []);

  function accepter() {
    localStorage.setItem("cookies_acceptes", "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 flex justify-center animate-slide-up">
      <div className="w-full max-w-3xl bg-zinc-900 text-white rounded-2xl shadow-2xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">

        {/* Icône */}
        <div className="text-2xl shrink-0">🍪</div>

        {/* Texte */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">
            EduMatch CI utilise des cookies
          </p>
          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
            Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu.
            En continuant à utiliser ce site, vous acceptez nos{" "}
            <Link href="#" className="text-orange-400 hover:underline font-semibold">
              Conditions d&apos;utilisation
            </Link>{" "}
            et notre{" "}
            <Link href="#" className="text-orange-400 hover:underline font-semibold">
              Politique de confidentialité
            </Link>.
          </p>
        </div>

        {/* Boutons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={accepter}
            className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            Accepter
          </button>
          <button
            onClick={accepter}
            className="px-4 py-2 border border-zinc-600 hover:border-zinc-400 text-zinc-300 hover:text-white font-medium rounded-full text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            Refuser
          </button>
        </div>
      </div>
    </div>
  );
}
