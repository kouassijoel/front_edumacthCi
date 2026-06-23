"use client";

import Link from "next/link";
import { GraduationCap, Bell } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth.service";
import { notificationService, type UserNotification } from "@/lib/services/notification.service";

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
  const [connecte, setConnecte]       = useState(false);
  const [dashboardHref, setDashboardHref] = useState("/dashboard");
  const [nonLues, setNonLues]         = useState(0);
  const [notifs, setNotifs]           = useState<UserNotification[]>([]);
  const [dropdown, setDropdown]       = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      setConnecte(true);
      const role = getRoleFromLocalToken();
      setDashboardHref(role === "eleve" ? "/dashboard/eleve" : "/dashboard");
      // Charger les notifications
      notificationService.getMesNotifications()
        .then((data) => {
          setNonLues(data.non_lues);
          setNotifs(data.notifications.slice(0, 5));
        })
        .catch(() => {});
    }
  }, []);

  // Fermer le dropdown en cliquant ailleurs
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleDeconnexion() {
    authService.deconnecter();
    setConnecte(false);
    router.push("/");
  }

  async function lireUne(id: string) {
    await notificationService.marquerLue(id);
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, lu: true } : n));
    setNonLues((prev) => Math.max(0, prev - 1));
  }

  async function toutLire() {
    await notificationService.marquerToutLu();
    setNotifs((prev) => prev.map((n) => ({ ...n, lu: true })));
    setNonLues(0);
  }

  return (
    <header className="w-full bg-white border-b border-zinc-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
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

        {/* Lien Communauté mobile (visible entre logo et boutons auth) */}
        <Link href="/communaute"
          className="md:hidden flex items-center gap-1 text-sm font-semibold text-zinc-700 hover:text-orange-500 transition-colors cursor-pointer">
          Communauté
          <span className="text-[10px] font-bold text-white bg-orange-500 px-1.5 py-0.5 rounded-full leading-none">New</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {connecte ? (
            <>
              {/* Cloche notifications */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdown((v) => !v)}
                  className="relative p-2 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer text-zinc-600"
                >
                  <Bell size={20} />
                  {nonLues > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 bg-orange-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {nonLues > 99 ? "99+" : nonLues}
                    </span>
                  )}
                </button>

                {/* Dropdown */}
                {dropdown && (
                  <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-zinc-100 z-50 overflow-hidden">
                    {/* Header dropdown */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                      <p className="text-sm font-bold text-zinc-800">Notifications</p>
                      {nonLues > 0 && (
                        <button onClick={toutLire}
                          className="text-xs text-orange-500 hover:text-orange-600 font-semibold cursor-pointer transition-colors">
                          Tout lire
                        </button>
                      )}
                    </div>

                    {/* Liste */}
                    <div className="max-h-72 overflow-y-auto divide-y divide-zinc-50">
                      {notifs.length === 0 ? (
                        <div className="py-8 text-center">
                          <Bell size={24} className="text-zinc-200 mx-auto mb-2" />
                          <p className="text-xs text-zinc-400">Aucune notification</p>
                        </div>
                      ) : notifs.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => !n.lu && lireUne(n.id)}
                          className={`px-4 py-3 flex gap-3 cursor-pointer transition-colors ${n.lu ? "hover:bg-zinc-50" : "bg-orange-50 hover:bg-orange-100/60"}`}
                        >
                          <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.lu ? "bg-zinc-200" : "bg-orange-500"}`} />
                          <div className="min-w-0">
                            <p className={`text-xs font-semibold truncate ${n.lu ? "text-zinc-600" : "text-zinc-900"}`}>{n.titre}</p>
                            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                            <p className="text-[10px] text-zinc-300 mt-1">
                              {new Date(n.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-zinc-100 px-4 py-2.5">
                      <Link
                        href="/dashboard/notifications"
                        onClick={() => setDropdown(false)}
                        className="text-xs text-orange-500 hover:text-orange-600 font-semibold cursor-pointer transition-colors"
                      >
                        Voir toutes les notifications →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link href={dashboardHref}
                className="hidden sm:block text-sm font-medium text-zinc-700 hover:text-orange-500 px-3 py-2 transition-colors cursor-pointer">
                Mon tableau de bord
              </Link>
              <button onClick={handleDeconnexion}
                className="text-sm font-semibold text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full transition-colors cursor-pointer">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link href="#"
                className="hidden sm:block text-sm font-medium text-zinc-700 hover:text-orange-500 px-3 py-2 transition-colors cursor-pointer">
                Donner des cours
              </Link>
              <Link href="/connexion"
                className="text-sm font-medium text-zinc-700 border border-zinc-300 hover:border-orange-400 hover:text-orange-500 px-4 py-2 rounded-full transition-colors cursor-pointer">
                Connexion
              </Link>
              <Link href="/inscription"
                className="text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-full transition-colors cursor-pointer">
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
