"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCheck, Dot } from "lucide-react";
import { notificationService, type UserNotification } from "@/lib/services/notification.service";

export default function NotificationsPage() {
  const [notifs, setNotifs]       = useState<UserNotification[]>([]);
  const [nonLues, setNonLues]     = useState(0);
  const [loading, setLoading]     = useState(true);
  const [erreur, setErreur]       = useState("");

  async function charger() {
    try {
      const data = await notificationService.getMesNotifications();
      setNotifs(data.notifications);
      setNonLues(data.non_lues);
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { charger(); }, []);

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
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
            <Bell size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-zinc-900">Notifications</h1>
            {nonLues > 0 && (
              <p className="text-xs text-orange-600 font-medium">{nonLues} non lue(s)</p>
            )}
          </div>
        </div>
        {nonLues > 0 && (
          <button
            onClick={toutLire}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-orange-600 transition-colors cursor-pointer"
          >
            <CheckCheck size={14} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {erreur && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{erreur}</p>
      )}

      {/* Liste */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-zinc-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : notifs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center">
            <Bell size={28} className="text-zinc-300" />
          </div>
          <p className="text-zinc-400 font-medium">Aucune notification</p>
          <p className="text-sm text-zinc-300">Vous n&apos;avez pas encore reçu de notifications.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifs.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.lu && lireUne(n.id)}
              className={`relative flex gap-4 p-4 rounded-2xl border transition-colors cursor-pointer ${
                n.lu
                  ? "bg-white border-zinc-100 hover:bg-zinc-50"
                  : "bg-orange-50 border-orange-100 hover:bg-orange-100/60"
              }`}
            >
              {/* Indicateur non lu */}
              {!n.lu && (
                <span className="absolute top-3 right-3">
                  <Dot size={20} className="text-orange-500" />
                </span>
              )}
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${n.lu ? "bg-zinc-100" : "bg-orange-200"}`}>
                <Bell size={16} className={n.lu ? "text-zinc-400" : "text-orange-600"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold leading-snug ${n.lu ? "text-zinc-600" : "text-zinc-900"}`}>
                  {n.titre}
                </p>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{n.message}</p>
                <p className="text-xs text-zinc-300 mt-1.5">
                  {new Date(n.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
