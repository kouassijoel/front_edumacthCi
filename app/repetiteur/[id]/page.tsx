"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useState, useEffect, useRef } from "react";
import { Share2, Link2, Check, MessageCircle, Heart } from "lucide-react";
import Footer from "@/app/component/footer";
import { repetiteurService, type RepetiteurDetail, type RepetiteurCard, type AvisPublic } from "@/lib/services/repetiteur.service";
import { favoriService } from "@/lib/services/dashboard.service";
import { authService, type Utilisateur } from "@/lib/services/auth.service";
import Header from "@/app/component/header";

function Etoiles({ note, size = "base" }: { note: number; size?: "sm" | "base" | "lg" }) {
  const cls = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base";
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`${cls} ${i <= note ? "text-orange-400" : "text-zinc-200"}`}>★</span>
      ))}
    </div>
  );
}

function ModalAuthRequise({ nom, onClose }: { nom: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm p-8 flex flex-col items-center gap-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-3xl">🔒</div>
        <h2 className="text-xl font-extrabold text-zinc-800 text-center">Connexion requise</h2>
        <p className="text-sm text-zinc-500 text-center leading-relaxed">
          Connectez-vous pour contacter <span className="font-semibold text-zinc-700">{nom}</span> et accéder à ses coordonnées.
        </p>
        <div className="flex flex-col gap-2 w-full mt-2">
          <Link href="/connexion" className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm text-center transition-colors">Se connecter</Link>
          <Link href="/inscription" className="w-full py-2.5 border border-orange-400 text-orange-500 hover:bg-orange-50 font-semibold rounded-xl text-sm text-center transition-colors">Créer un compte gratuit</Link>
          <button onClick={onClose} className="text-xs text-zinc-400 hover:text-zinc-600 mt-1 cursor-pointer">Annuler</button>
        </div>
      </div>
    </div>
  );
}

function AnimationContact({
  rep,
  utilisateur,
  premierCours,
  onContinuer,
}: {
  rep: RepetiteurDetail;
  utilisateur: Utilisateur | null;
  premierCours: boolean;
  onContinuer: () => void;
}) {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 80);
    const t2 = setTimeout(() => setPhase(2), 650);
    const t3 = setTimeout(() => setPhase(3), 1200);
    const t4 = setTimeout(() => onContinuer(), 3200);
    timerRef.current = t4;

    let start = Date.now();
    const duration = 3200;
    const tick = setInterval(() => {
      setProgress(Math.min(100, ((Date.now() - start) / duration) * 100));
    }, 30);

    return () => { [t1, t2, t3, t4].forEach(clearTimeout); clearInterval(tick); };
  }, [onContinuer]);

  const initEleve = utilisateur ? `${utilisateur.prenom[0]}${utilisateur.nom[0]}`.toUpperCase() : "?";
  const initRep = `${rep.prenom[0]}${rep.nom[0]}`.toUpperCase();

  const PARTICULES = ["✨", "⭐", "🌟", "💫", "✨", "⭐", "💫", "🌟"];

  return (
    <div className="relative overflow-hidden rounded-b-2xl bg-linear-to-br from-orange-500 via-rose-500 to-pink-600">
      {/* particules flottantes */}
      {PARTICULES.map((p, i) => (
        <span
          key={i}
          className="absolute text-lg select-none pointer-events-none animate-bounce"
          style={{
            left: `${10 + i * 11}%`,
            top: `${10 + (i % 3) * 20}%`,
            animationDelay: `${i * 0.18}s`,
            animationDuration: `${1.2 + (i % 3) * 0.4}s`,
            opacity: phase >= 2 ? 0.7 : 0,
            transition: "opacity 0.5s",
          }}
        >
          {p}
        </span>
      ))}

      <div className="relative z-10 px-6 pt-8 pb-6 flex flex-col items-center gap-5">
        {/* Avatars */}
        <div className="flex items-center justify-center gap-0 w-full">
          {/* Élève */}
          <div
            className="transition-all duration-700 ease-out"
            style={{ opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? "translateX(0)" : "translateX(-60px)" }}
          >
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-orange-200 flex items-center justify-center">
              {utilisateur?.photo_url ? (
                <img src={utilisateur.photo_url} alt="vous" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-extrabold text-orange-600">{initEleve}</span>
              )}
            </div>
            <p className="text-center text-xs font-semibold text-white/80 mt-1.5">Vous</p>
          </div>

          {/* Icône centrale */}
          <div
            className="mx-4 flex flex-col items-center gap-1 transition-all duration-500"
            style={{ opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? "scale(1)" : "scale(0)" }}
          >
            <span className="text-4xl" style={{ animation: phase >= 2 ? "pulse 1s ease-in-out infinite" : "none" }}>❤️</span>
            <div className="h-0.5 w-10 bg-white/40 rounded-full" />
          </div>

          {/* Répétiteur */}
          <div
            className="transition-all duration-700 ease-out"
            style={{ opacity: phase >= 1 ? 1 : 0, transform: phase >= 1 ? "translateX(0)" : "translateX(60px)" }}
          >
            <div className="w-20 h-20 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-orange-200 flex items-center justify-center">
              {rep.photo_url ? (
                <img src={rep.photo_url} alt={rep.prenom} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-extrabold text-orange-600">{initRep}</span>
              )}
            </div>
            <p className="text-center text-xs font-semibold text-white/80 mt-1.5">{rep.prenom}</p>
          </div>
        </div>

        {/* Texte */}
        <div
          className="text-center transition-all duration-500"
          style={{ opacity: phase >= 3 ? 1 : 0, transform: phase >= 3 ? "translateY(0)" : "translateY(16px)" }}
        >
          <p className="text-2xl font-extrabold text-white">
            {premierCours ? "1er cours gratuit 🎉" : "Nouvelle mise en contact !"}
          </p>
          <p className="text-white/80 text-sm mt-1">
            Envoyez un message à <span className="font-bold text-white">{rep.prenom}</span>
          </p>
        </div>

        {/* Bouton */}
        <div
          className="w-full transition-all duration-500"
          style={{ opacity: phase >= 3 ? 1 : 0, transform: phase >= 3 ? "translateY(0)" : "translateY(16px)" }}
        >
          <button
            onClick={onContinuer}
            className="w-full py-3 bg-white text-orange-600 font-extrabold rounded-xl text-sm hover:bg-orange-50 transition-colors cursor-pointer shadow-lg"
          >
            Écrire un message →
          </button>
        </div>

        {/* Barre de progression */}
        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/60 rounded-full transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function AnimationSucces({
  rep,
  utilisateur,
  nomComplet,
  premierCours,
  onClose,
}: {
  rep: RepetiteurDetail;
  utilisateur: Utilisateur | null;
  nomComplet: string;
  premierCours: boolean;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 80);
    const t2 = setTimeout(() => setPhase(2), 550);
    const t3 = setTimeout(() => setPhase(3), 1050);
    const t4 = setTimeout(() => setPhase(4), 1500);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  const initEleve = utilisateur ? `${utilisateur.prenom[0]}${utilisateur.nom[0]}`.toUpperCase() : "?";
  const initRep = `${rep.prenom[0]}${rep.nom[0]}`.toUpperCase();

  const CONFETTI = [
    { e: "🎉", x: -90, y: -70, d: 0 },
    { e: "⭐", x: 90,  y: -70, d: 0.06 },
    { e: "🎊", x: -110, y: -10, d: 0.1 },
    { e: "✨", x: 110,  y: -10, d: 0.04 },
    { e: "🌟", x: -60,  y: 70,  d: 0.08 },
    { e: "💫", x: 60,   y: 70,  d: 0.12 },
    { e: "🎈", x: 0,    y: -100, d: 0.03 },
    { e: "🎊", x: -30,  y: 90,  d: 0.14 },
    { e: "⭐", x: 30,   y: 90,  d: 0.09 },
  ];

  return (
    <div className="relative overflow-hidden rounded-b-2xl bg-linear-to-br from-green-400 via-emerald-500 to-teal-600">
      {/* Confetti volants */}
      <div className="absolute inset-0 pointer-events-none" style={{ perspective: "400px" }}>
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            className="absolute text-2xl select-none"
            style={{
              left: "50%",
              top: "38%",
              transform: phase >= 2
                ? `translate(calc(-50% + ${c.x}px), calc(-50% + ${c.y}px)) scale(1)`
                : "translate(-50%, -50%) scale(0)",
              opacity: phase >= 2 ? 1 : 0,
              transition: `transform 0.7s cubic-bezier(0.22,1,0.36,1) ${c.d}s, opacity 0.3s ${c.d}s`,
            }}
          >
            {c.e}
          </span>
        ))}
      </div>

      <div className="relative z-10 px-6 pt-10 pb-6 flex flex-col items-center gap-5">
        {/* Avatars qui se rejoignent + checkmark */}
        <div className="relative flex items-center justify-center" style={{ width: 140, height: 80 }}>
          {/* Élève */}
          <div
            className="absolute"
            style={{
              left: 0,
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1 ? "translateX(0)" : "translateX(-55px)",
              transition: "all 0.55s cubic-bezier(0.34,1.56,0.64,1)",
              zIndex: 2,
            }}
          >
            <div className="w-17 h-17 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-green-200 flex items-center justify-center">
              {utilisateur?.photo_url ? (
                <img src={utilisateur.photo_url} alt="vous" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-extrabold text-green-700">{initEleve}</span>
              )}
            </div>
          </div>

          {/* Checkmark central */}
          <div
            className="absolute z-10 flex items-center justify-center"
            style={{
              left: "50%",
              top: "50%",
              transform: phase >= 3
                ? "translate(-50%, -50%) scale(1)"
                : "translate(-50%, -50%) scale(0)",
              transition: "transform 0.45s cubic-bezier(0.175,0.885,0.32,1.6)",
            }}
          >
            <div className="w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-xl">
              ✅
            </div>
          </div>

          {/* Répétiteur */}
          <div
            className="absolute"
            style={{
              right: 0,
              opacity: phase >= 1 ? 1 : 0,
              transform: phase >= 1 ? "translateX(0)" : "translateX(55px)",
              transition: "all 0.55s cubic-bezier(0.34,1.56,0.64,1)",
              zIndex: 2,
            }}
          >
            <div className="w-17 h-17 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-green-200 flex items-center justify-center">
              {rep.photo_url ? (
                <img src={rep.photo_url} alt={rep.prenom} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-extrabold text-green-700">{initRep}</span>
              )}
            </div>
          </div>
        </div>

        {/* Texte */}
        <div
          className="text-center transition-all duration-500"
          style={{
            opacity: phase >= 3 ? 1 : 0,
            transform: phase >= 3 ? "translateY(0)" : "translateY(16px)",
          }}
        >
          <p className="text-2xl font-extrabold text-white">
            {premierCours ? "Cours d'essai demandé ! 🎉" : "Message envoyé ! 🎊"}
          </p>
          <p className="text-white/80 text-sm mt-2 leading-relaxed">
            <span className="font-bold text-white">{nomComplet}</span> vous répondra sous{" "}
            <span className="font-bold text-white">24 heures</span>.
          </p>
        </div>

        {/* Bouton */}
        <div
          className="w-full transition-all duration-500"
          style={{
            opacity: phase >= 4 ? 1 : 0,
            transform: phase >= 4 ? "translateY(0)" : "translateY(16px)",
          }}
        >
          <button
            onClick={onClose}
            className="w-full py-3 bg-white text-emerald-600 font-extrabold rounded-xl text-sm hover:bg-green-50 transition-colors cursor-pointer shadow-lg"
          >
            Parfait ! 🎊
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalContact({
  rep,
  utilisateur,
  premierCours,
  onClose,
}: {
  rep: RepetiteurDetail;
  utilisateur: Utilisateur | null;
  premierCours: boolean;
  onClose: () => void;
}) {
  const messageInitial = premierCours
    ? `Bonjour ${rep.prenom},\n\nJe souhaite bénéficier d'un premier cours d'essai gratuit. Pouvez-vous me contacter pour convenir d'un créneau ?`
    : `Bonjour ${rep.prenom},\n\nJe souhaite prendre des cours. Seriez-vous disponible pour une séance prochainement ?`;

  const [etape, setEtape] = useState<"intro" | "form" | "succes">("intro");
  const [message, setMessage] = useState(messageInitial);
  const [niveau, setNiveau] = useState("");
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(false);

  async function envoyer() {
    if (!niveau) { setErreur("Veuillez sélectionner votre niveau."); return; }
    if (!message.trim()) { setErreur("Le message ne peut pas être vide."); return; }
    setLoading(true);
    try {
      await repetiteurService.envoyerDemande(rep.id, {
        type: premierCours ? "premier_cours" : "contact",
        niveau,
        message,
      });
      setEtape("succes");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Erreur lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  }

  const nomComplet = `${rep.prenom} ${rep.nom}`;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="bg-orange-500 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-xs font-medium">{premierCours ? "1er cours gratuit" : "Demande de contact"}</p>
            <h2 className="text-white font-extrabold text-lg">Contacter {rep.prenom}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg cursor-pointer transition-colors">×</button>
        </div>

        {etape === "intro" && (
          <AnimationContact
            rep={rep}
            utilisateur={utilisateur}
            premierCours={premierCours}
            onContinuer={() => setEtape("form")}
          />
        )}

        {etape === "form" && (
          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
              {rep.photo_url && (
                <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                  <Image src={rep.photo_url} alt={nomComplet} fill className="object-cover" />
                </div>
              )}
              <div>
                <p className="text-sm font-bold text-zinc-800">{nomComplet}</p>
                <p className="text-xs text-zinc-500">{rep.matieres?.[0]} · {rep.prix_par_heure?.toLocaleString("de-DE", { maximumFractionDigits: 0 })} FCFA/h</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Niveau <span className="text-orange-500">*</span></label>
              <select value={niveau} onChange={(e) => { setNiveau(e.target.value); setErreur(""); }}
                className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-sm text-zinc-700 focus:outline-none focus:border-orange-400 bg-white">
                <option value="">Sélectionner un niveau</option>
                <option>Primaire (CE1 – CM2)</option>
                <option>Collège (6e – 3e)</option>
                <option>Lycée (2nde – 1ère)</option>
                <option>Terminale / BAC</option>
                <option>BTS / Université</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Message <span className="text-orange-500">*</span></label>
              <textarea value={message} onChange={(e) => { setMessage(e.target.value); setErreur(""); }}
                rows={5} className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-700 focus:outline-none focus:border-orange-400 resize-none" />
            </div>
            {erreur && <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{erreur}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 border border-zinc-200 text-zinc-600 hover:border-zinc-400 font-medium rounded-xl text-sm transition-colors cursor-pointer">Annuler</button>
              <button onClick={envoyer} disabled={loading}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer">
                {loading ? "Envoi…" : "Envoyer"}
              </button>
            </div>
          </div>
        )}

        {etape === "succes" && (
          <AnimationSucces
            rep={rep}
            utilisateur={utilisateur}
            nomComplet={nomComplet}
            premierCours={premierCours}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

export default function DetailRepetiteur({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [rep, setRep] = useState<RepetiteurDetail | null>(null);
  const [avis, setAvis] = useState<AvisPublic[]>([]);
  const [similaires, setSimilaires] = useState<RepetiteurCard[]>([]);
  const [erreur, setErreur] = useState(false);
  const [connecte, setConnecte] = useState(false);
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [modal, setModal] = useState<null | "contact" | "premierCours" | "auth">(null);
  const [lienCopie, setLienCopie] = useState(false);
  const [isFavori, setIsFavori] = useState(false);
  const [favoriLoading, setFavoriLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setConnecte(!!token);
    if (token) {
      favoriService.lister()
        .then((favs) => setIsFavori(favs.some((f) => f.repetiteur_id === id)))
        .catch(() => {});
      authService.getMoi().then(setUtilisateur).catch(() => {});
    }
    repetiteurService.getById(id)
      .then(setRep)
      .catch(() => setErreur(true));
    repetiteurService.getAvis(id)
      .then((r) => setAvis(r.avis))
      .catch(() => {});
    repetiteurService.getSimilaires(id)
      .then(setSimilaires)
      .catch(() => {});
  }, [id]);

  async function toggleFavori() {
    if (!connecte) { window.location.href = "/connexion"; return; }
    setFavoriLoading(true);
    try {
      if (isFavori) {
        await favoriService.retirer(id);
        setIsFavori(false);
      } else {
        await favoriService.ajouter(id);
        setIsFavori(true);
      }
    } catch {} finally {
      setFavoriLoading(false);
    }
  }

  function ouvrirContact(type: "contact" | "premierCours") {
    if (!connecte) { setModal("auth"); return; }
    setModal(type);
  }

  function partagerWhatsApp() {
    if (!rep) return;
    const url = window.location.href;
    const texte = `Découvrez ${rep.prenom} ${rep.nom} sur EduMatch CI ! Cours de ${rep.matieres?.[0] ?? "cours"} à ${rep.prix_par_heure?.toLocaleString("fr-FR") ?? "—"} FCFA/h. 👉 ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texte)}`, "_blank");
  }

  function partagerFacebook() {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank", "width=600,height=400");
  }

  async function copierLien() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLienCopie(true);
      setTimeout(() => setLienCopie(false), 2000);
    } catch {
      prompt("Copiez ce lien :", window.location.href);
    }
  }

  async function partagerNatif() {
    if (!rep) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${rep.prenom} ${rep.nom} — EduMatch CI`,
          text: `Cours de ${rep.matieres?.[0] ?? "cours particuliers"} avec ${rep.prenom} ${rep.nom}`,
          url: window.location.href,
        });
      } catch { /* annulé */ }
    } else {
      copierLien();
    }
  }


  if (erreur) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="text-center">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-zinc-600 font-semibold">Répétiteur introuvable.</p>
        <Link href="/" className="mt-4 inline-block text-orange-500 hover:underline text-sm">Retour à l&apos;accueil</Link>
      </div>
    </div>
  );

  if (!rep) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const nomComplet = `${rep.prenom} ${rep.nom}`;

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header></Header>
      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <aside className="lg:col-span-1 order-1 lg:order-2 flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
          <div className="bg-white rounded-3xl text-shadow-2xs drop-shadow-sm border-gray-300 p-6 flex flex-col items-center gap-4">
            <div className="relative w-50 h-50 px-5  overflow-hidden rounded-4xl">
              <Image src={rep.photo_url ?? "https://i.pravatar.cc/300"} alt={nomComplet} fill className="object-cover" />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <div className="flex items-center gap-2 justify-center flex-wrap">
                <h1 className="text-xl font-extrabold text-zinc-800">{nomComplet}</h1>
                {rep.is_verifie && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    ✓ Vérifié
                  </span>
                )}
              </div>
           
              <div className="flex items-center gap-2 mt-1">
                <Etoiles note={Math.round(rep.note)} />
                <span className="text-sm text-zinc-400">({rep.nb_avis} avis)</span>
              </div>
              {rep.ville && <p className="text-xs text-zinc-400 mt-1">📍 {rep.ville}</p>}
            </div>
            <div className="w-full border-t border-zinc-100 pt-4 flex items-center justify-between">
              <span className="text-sm text-zinc-500">Tarif horaire</span>
              <span className="text-2xl font-extrabold text-zinc-800">
                {rep.prix_par_heure?.toLocaleString("de-DE", { maximumFractionDigits: 0 }) ?? "—"}
                <span className="text-sm font-normal text-zinc-400"> F/Mois</span>
              </span>
            </div>
            <div className="flex gap-2 w-full">
              <button onClick={() => ouvrirContact("contact")} className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-sm cursor-pointer">
                Contacter {rep.prenom}
              </button>
              <button
                onClick={toggleFavori}
                disabled={favoriLoading}
                title={isFavori ? "Retirer des favoris" : "Ajouter aux favoris"}
                className={`w-12 shrink-0 flex items-center justify-center rounded-xl border-2 transition-all cursor-pointer ${
                  isFavori
                    ? "bg-red-50 border-red-400 text-red-500 hover:bg-red-100"
                    : "bg-white border-zinc-200 text-zinc-400 hover:border-red-300 hover:text-red-400"
                }`}
              >
                <Heart size={18} className={isFavori ? "fill-red-500 text-red-500" : ""} />
              </button>
            </div>

            {/* ── Partage ── */}
            <div className="w-full border-t border-zinc-100 pt-4 flex flex-col gap-2">
              <p className="text-xs text-zinc-400 text-center font-medium flex items-center justify-center gap-1.5">
                <Share2 size={11} /> Partager ce profil
              </p>
              <div className="flex gap-2">
                {/* WhatsApp */}
                <button onClick={partagerWhatsApp}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-colors cursor-pointer">
                  <MessageCircle size={14} />
                  WhatsApp
                </button>
                {/* Facebook */}
                <button onClick={partagerFacebook}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  Facebook
                </button>
                {/* Copier lien */}
                <button onClick={copierLien}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${lienCopie ? "bg-green-50 border-green-400 text-green-600" : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-orange-300 hover:text-orange-500"}`}>
                  {lienCopie ? <Check size={14} /> : <Link2 size={14} />}
                  {lienCopie ? "Copié !" : "Lien"}
                </button>
              </div>
              {/* Partage natif (mobile) */}
              <button onClick={partagerNatif}
                className="w-full py-2.5 border border-zinc-200 hover:border-orange-300 text-zinc-500 hover:text-orange-500 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2">
                <Share2 size={13} />
                Plus d&apos;options de partage
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 grid grid-cols-3 gap-3 text-center">
            {[
              { val: rep.nb_eleves, label: "Élèves" },
              { val: `${rep.annees_experience} ans`, label: "Expérience" },
              { val: `${rep.note.toFixed(1)}/5`, label: "Note" },
            ].map((s) => (
              <div key={s.label} className="flex flex-col gap-0.5">
                <span className="text-xl font-extrabold text-zinc-800">{s.val}</span>
                <span className="text-xs text-zinc-400">{s.label}</span>
              </div>
            ))}
          </div>

         

          
        </aside>

        <div className="lg:col-span-2 order-2 lg:order-1 flex flex-col gap-6">
          {rep.matieres && rep.matieres.length > 0 && (
            <div className=" rounded-2xl  border-zinc-100">
              
              <div className="flex flex-wrap gap-2">
                {rep.matieres.map((m) => (
                  <span key={m} className="text-sm bg-orange-50  text-orange-600 border border-orange-100 px-4 py-1.5 rounded-full font-medium">{m}</span>
                ))}
              </div>
            </div>
          )}

          {rep.titre_annonce && (
            <div className="rounded-2xl border-zinc-100 p-6">
              <p className="text-4xl font-bold text-gray-700 leading-relaxed">{rep.titre_annonce}</p>
            </div>
          )}

           {rep.modalites && (
            <div className=" rounded-2xl  border-zinc-100">
              <h2 className="text-xl font-bold text-zinc-800 mb-4">Lieux du cours</h2>
             <div className="flex flex-wrap gap-2">
               {rep.modalites?.map((m) => (<span key={m} className="text-sm text-gray-600 border border-gray-400 px-4 py-1.5 rounded-full font-medium">{m}</span>))}
             </div>
            </div>
          )}

          <div className="rounded-2xl p-5 my-6 bg-orange-50 border border-orange-100">
            <p className="text-lg font-black mb-2 text-orange-400">⭐ Ambassadeur</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              C&apos;est le nec plus ultra des professeurs. Qualité du profil, excellence du diplôme, réponse garantie. {rep.nom} organisera avec soin votre premier cours.
            </p>
          </div>
           {rep.niveaux && rep.niveaux.length > 0 && (
            <div className="bg-white  p-5 ">
              <h3 className="text-2xl  text-zinc-700 font-bold mb-3">À propos du cours</h3>
              <div className="flex gap-5">
                <div className="flex flex-wrap gap-2  rounded-2xl p-2">
                {rep.niveaux.map((n) => (
                  <span key={n} className="text-xs font-medium bg-gray-50 text-gray-500 border  py-2  px-6 rounded-full">{n}</span>
                ))}
              </div>
             
              </div>
            </div>
          )}

          {rep.bio && (
            <div className=" border-zinc-100 p-6">
              <p className="text-2xl font-bold mb-4">À propos de {rep.nom}</p>
              <p className=" text-xl font-extralight leading-relaxed">{rep.bio}</p>
            </div>
          )}

          <div className="lg:hidden bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">Tarif horaire</span>
              <span className="text-2xl font-extrabold text-zinc-800">
                {rep.prix_par_heure?.toLocaleString("de-DE", { maximumFractionDigits: 0 }) ?? "—"}
                <span className="text-sm font-normal text-zinc-400"> FCFA/h</span>
              </span>
            </div>
            <button onClick={() => ouvrirContact("contact")} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm cursor-pointer transition-colors">
              Contacter {rep.prenom}
            </button>
          </div>

          {/* ── AVIS ─────────────────────────────────────────────────────── */}
          <div className=" p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-zinc-800">Avis</h2>
              <div className="flex items-center gap-2">
               
                <span className="text-sm font-bold text-zinc-700"> ★ {rep.note.toFixed(1)}</span>
                <span className="text-xs text-zinc-400"> ({rep.nb_avis})</span>
              </div>
            </div>
            {avis.length === 0 ? (
              <div className="text-center py-8 flex flex-col items-center gap-2">
                <span className="text-4xl">⭐</span>
                <p className="text-sm text-zinc-400">Aucun avis pour le moment.</p>
                <p className="text-xs text-zinc-300">Soyez le premier à laisser un commentaire !</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 ">
                {avis.map((a) => (
                  <div key={a.id} className=" pb-4 last:pb-0 ">
                   <div className="border rounded-2xl p-5">
                     <div className="flex items-center justify-between mb-2  ">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm shrink-0">
                          {a.eleve.prenom[0]}
                        </div>
                        <div className="flex gap-2.5">
                          <div><p className="text-sm font-bold text-zinc-800">{a.eleve.prenom} {a.eleve.nom}</p></div>
                          <div>
                            <p className="text-xs text-gray-500 font-bold">
                            {new Date(a.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((i) => (
                          <span key={i} className={`text-sm ${i <= a.note ? "text-orange-400" : "text-zinc-200"}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-zinc-900 leading-relaxed px-4 py-3 ml-12">
                      {a.commentaire}
                    </p>
                   </div>

                    {a.reponse && (
                      <div className="ml-12 bg-orange-50 border border-orange-100 p-4 rounded-2xl my-4">
                        <div className="rounded-2xl p-4 flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-0.5">
                            {rep.prenom[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-bold text-orange-600">{rep.prenom} {rep.nom}</p>
                              <span className="text-xs text-orange-400">· Répétiteur</span>
                              {a.reponse_at && (
                                <span className="text-xs text-zinc-400 ml-auto">
                                  {new Date(a.reponse_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-zinc-700 leading-relaxed">{a.reponse}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  
                ))}
                
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ── SUGGESTIONS ──────────────────────────────────────────────────── */}
      {similaires.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <h2 className="text-xl font-extrabold text-zinc-800 mb-5">Répétiteurs similaires</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-5 lg:overflow-x-visible">
            {similaires.map((s) => (
              <Link key={s.id} href={`/repetiteur/${s.id}`}
                className="group flex flex-col overflow-hidden  transition-shadow shrink-0 w-44 sm:w-52 lg:w-auto lg:shrink">

                {/* Photo + infos superposées */}
                <div className="relative h-56 w-full">
                  <Image
                    src={s.photo_url ?? `https://i.pravatar.cc/300?u=${s.id}`}
                    alt={`${s.prenom} ${s.nom}`}
                    fill
                    loading="lazy"
                    className="object-cover  group-hover:scale-105 w-100 transition-transform duration-500"
                  />
                  
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-extrabold text-sm leading-tight drop-shadow">
                      {s.prenom} {s.nom}
                    </p>
                    {s.matieres?.[0] && (
                      <span className="inline-block mt-1 text-[10px] font-semibold bg-orange-500/90 text-white px-2 py-0.5 rounded-full">
                        {s.matieres[0]}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Bas de carte */}
                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="flex items-center gap-1 text-xs font-bold text-zinc-700">
                    <span className="text-orange-400">★</span>
                    {s.note.toFixed(1)}
                    <span className="text-zinc-400 font-normal">({s.nb_avis})</span>
                  </span>
                  <span className="text-xs font-extrabold text-orange-500">
                    {s.prix_par_heure?.toLocaleString("fr-FR") ?? "—"}
                    <span className="font-normal text-zinc-400"> F/Mois</span>
                  </span>
                 
                </div>
                
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />

      {modal === "auth" && <ModalAuthRequise nom={nomComplet} onClose={() => setModal(null)} />}
      {(modal === "contact" || modal === "premierCours") && (
        <ModalContact rep={rep} utilisateur={utilisateur} premierCours={modal === "premierCours"} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
