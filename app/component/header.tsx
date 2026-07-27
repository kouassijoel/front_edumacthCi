"use client";

import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth.service";

function getRoleFromLocalToken(): "eleve" | "repetiteur" | null {
  try {
    const token = localStorage.getItem("access_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.role ?? null;
  } catch {
    return null;
  }
}

export default function Header() {
  const router = useRouter();
  const [connecte, setConnecte]           = useState(false);
  const [dashboardHref, setDashboardHref] = useState("/dashboard");
  const [mobileOpen, setMobileOpen]       = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setConnecte(true);
      const role = getRoleFromLocalToken();
      setDashboardHref(role === "eleve" ? "/dashboard/eleve" : "/dashboard");
    }
  }, []);

  function closeMobile() {
    setMobileOpen(false);
  }

  function handleDeconnexion() {
    authService.deconnecter();
    setConnecte(false);
    setMobileOpen(false);
    router.push("/");
  }

  return (
    <>
      <header className="w-full bg-white  border-zinc-100  top-0 z-50 ">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer" onClick={closeMobile}>
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shrink-0">
              <GraduationCap size={20} className="text-white" strokeWidth={2.2} />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-extrabold text-zinc-900 tracking-tight">Edu</span>
              <span className="text-xl font-extrabold text-orange-500 tracking-tight">Match</span>
              <span className="ml-1 text-[10px] font-bold text-white bg-green-600 rounded px-1.5 py-0.5 tracking-wide leading-none self-center">CI</span>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-600 font-medium">
            <Link href="/#repetiteurs" className="hover:text-orange-500 transition-colors cursor-pointer">Répétiteurs</Link>
            <Link href="/communaute" className="hover:text-orange-500 transition-colors flex items-center gap-1 cursor-pointer">
              Communauté
              <span className="text-xs font-bold text-white bg-orange-500 px-1.5 py-0.5 rounded-full leading-none">New</span>
            </Link>
            <Link href="/comment-ca-marche" className="hover:text-orange-500 transition-colors cursor-pointer">Comment ça marche</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {connecte ? (
              <>
                <Link href={dashboardHref}
                  className="hidden sm:block text-sm font-medium text-zinc-700 hover:text-orange-500 px-3 py-2 transition-colors cursor-pointer">
                  Mon tableau de bord
                </Link>
                <button onClick={handleDeconnexion}
                  className="hidden sm:block text-sm font-semibold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full transition-colors cursor-pointer">
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link href="/connexion"
                  className="hidden sm:block text-sm font-medium text-zinc-700 border border-zinc-300 hover:border-orange-400 hover:text-orange-500 px-4 py-2 rounded-full transition-colors cursor-pointer">
                  Connexion
                </Link>
                <Link href="/inscription"
                  className="hidden sm:block text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-full transition-colors cursor-pointer">
                  S&apos;inscrire
                </Link>
              </>
            )}

            {/* Bouton hamburger (mobile uniquement) */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-xl hover:bg-zinc-100 transition-colors text-zinc-700 cursor-pointer"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {mobileOpen && (
          <div className="md:hidden border-t border-zinc-100 bg-white px-4 py-4 flex flex-col gap-1">
            <Link href="/#repetiteurs" onClick={closeMobile}
              className="py-3 px-2 text-sm font-medium text-zinc-700 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors">
              Répétiteurs
            </Link>
            <Link href="/communaute" onClick={closeMobile}
              className="py-3 px-2 text-sm font-medium text-zinc-700 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors flex items-center gap-2">
              Communauté
              <span className="text-[10px] font-bold text-white bg-orange-500 px-1.5 py-0.5 rounded-full leading-none">New</span>
            </Link>
            <Link href="/comment-ca-marche" onClick={closeMobile}
              className="py-3 px-2 text-sm font-medium text-zinc-700 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors">
              Comment ça marche
            </Link>

            <div className="border-t border-zinc-100 mt-2 pt-3 flex flex-col gap-2">
              {connecte ? (
                <>
                  <Link href={dashboardHref} onClick={closeMobile}
                    className="py-3 px-2 text-sm font-medium text-zinc-700 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors">
                    Mon tableau de bord
                  </Link>
                  <button onClick={handleDeconnexion}
                    className="text-sm font-semibold text-white bg-red-500 hover:bg-red-600 px-4 py-3 rounded-xl transition-colors cursor-pointer w-full">
                    Déconnexion
                  </button>
                </>
              ) : (
                <>
                  <Link href="#" onClick={closeMobile}
                    className="py-3 px-2 text-sm font-medium text-zinc-700 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-colors">
                    Donner des cours
                  </Link>
                  <Link href="/connexion" onClick={closeMobile}
                    className="text-sm font-medium text-zinc-700 border border-zinc-300 hover:border-orange-400 hover:text-orange-500 px-4 py-3 rounded-xl transition-colors text-center">
                    Connexion
                  </Link>
                  <Link href="/inscription" onClick={closeMobile}
                    className="text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 px-4 py-3 rounded-xl transition-colors text-center">
                    S&apos;inscrire
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
