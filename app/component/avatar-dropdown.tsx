"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { authService } from "@/lib/services/auth.service";

interface Props {
  photoUrl: string | null;
  initiales: string;
  parametresHref: string;
  size?: "sm" | "md";
}

export function AvatarDropdown({ photoUrl, initiales, parametresHref, size = "md" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  function deconnecter() {
    authService.deconnecter();
    router.push("/");
  }

  const dim = size === "sm" ? "w-9 h-9" : "w-10 h-10";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`${dim} rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-orange-300 transition-all`}
      >
        {photoUrl ? (
          <img src={photoUrl} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <span className={`${textSize} font-bold text-orange-600`}>{initiales}</span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden min-w-[172px]"
          style={{ animation: "fadeSlideDown 0.15s ease-out" }}>
          <style>{`
            @keyframes fadeSlideDown {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          <Link
            href={parametresHref}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <Settings size={15} className="text-zinc-400 shrink-0" />
            Paramètres
          </Link>
          <div className="h-px bg-zinc-100 mx-3" />
          <button
            onClick={deconnecter}
            className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full cursor-pointer"
          >
            <LogOut size={15} className="shrink-0" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
