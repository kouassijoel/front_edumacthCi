"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, User, BookOpen, Calendar, MessageCircle, CreditCard, Star, Settings, LogOut, Pencil, Trash2, Camera, AlertTriangle, X, Zap, CheckCircle, Clock } from "lucide-react";
import { authService, type Utilisateur } from "@/lib/services/auth.service";
import { repetiteurService, type RepetiteurDetail } from "@/lib/services/repetiteur.service";
import { boostService, type Forfait, type BoostRead, type MesBoostsData } from "@/lib/services/boost.service";

const NAV = [
  { label: "Tableau de bord", href: "/dashboard",             Icon: Home },
  { label: "Mon profil",       href: "/dashboard/profil",     Icon: User },
  { label: "Mes cours",        href: "/dashboard/cours",      Icon: BookOpen },
  { label: "Agenda",           href: "/dashboard/agenda",     Icon: Calendar },
  { label: "Messages",         href: "/dashboard",            Icon: MessageCircle },
  { label: "Paiements",        href: "/dashboard/paiement",   Icon: CreditCard },
  { label: "Avis reçus",       href: "/dashboard/avis",       Icon: Star },
  { label: "Paramètres",       href: "/dashboard/parametres", Icon: Settings },
];

const MATIERES_SUGGESTIONS = ["Mathématiques","Français","Anglais","Physique-Chimie","SVT","Histoire-Géo","Philosophie","Informatique","Économie","Arabe"];
const NIVEAUX_SUGGESTIONS  = ["CP","CE1","CE2","CM1","CM2","6ème","5ème","4ème","3ème","2nde","1ère","Terminale","Licence","Master"];
const MODALITES_OPTIONS    = ["À domicile","En ligne","Les deux"];

const BADGE_STYLES: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  "Top répétiteur": { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-300", ring: "ring-amber-400" },
  "Populaire":      { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-300", ring: "ring-orange-400" },
  "Mis en avant":   { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-300",  ring: "ring-blue-400" },
};

function joursRestants(dateFin: string): number {
  const fin = new Date(dateFin);
  const now = new Date();
  return Math.max(0, Math.ceil((fin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function TagInput({ values, onChange, suggestions, placeholder }: {
  values: string[];
  onChange: (v: string[]) => void;
  suggestions: string[];
  placeholder: string;
}) {
  const [input, setInput] = useState("");
  const add = (v: string) => {
    const trimmed = v.trim();
    if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed]);
    setInput("");
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <span key={v} className="flex items-center gap-1 text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 px-2 py-1 rounded-full">
            {v}
            <button onClick={() => onChange(values.filter((x) => x !== v))} className="text-orange-400 hover:text-orange-600 cursor-pointer leading-none"><X size={10} /></button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(input); } }}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
      <div className="flex flex-wrap gap-1">
        {suggestions.filter((s) => !values.includes(s)).slice(0, 6).map((s) => (
          <button key={s} onClick={() => add(s)}
            className="text-xs text-zinc-500 hover:text-orange-600 border border-zinc-200 hover:border-orange-300 px-2 py-0.5 rounded-full cursor-pointer transition-colors">
            + {s}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Section Boost ─────────────────────────────────────────────────────────────

function BoostSection({ userId }: { userId: string }) {
  const [forfaits, setForfaits] = useState<Forfait[]>([]);
  const [boostData, setBoostData] = useState<MesBoostsData | null>(null);
  const [boostActif, setBoostActif] = useState<BoostRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [achat, setAchat] = useState(false);
  const [selectedForfait, setSelectedForfait] = useState<string>("");
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");

  useEffect(() => {
    Promise.all([
      boostService.getForfaits(),
      boostService.mesBoosts(),
      boostService.monBoostActif(),
    ]).then(([f, d, a]) => {
      setForfaits(f);
      setBoostData(d);
      setBoostActif(a);
    }).catch(() => {}).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function acheterBoost() {
    if (!selectedForfait) return;
    setAchat(true);
    setErreur("");
    setSucces("");
    try {
      const boost = await boostService.acheter(selectedForfait);
      setBoostActif(boost);
      const data = await boostService.mesBoosts();
      setBoostData(data);
      setSucces(`Boost "${boost.badge}" activé avec succès !`);
      setSelectedForfait("");
    } catch (e: unknown) {
      setErreur((e as { message?: string })?.message ?? "Erreur lors de l'achat.");
    } finally {
      setAchat(false);
    }
  }

  if (loading) {
    return <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 h-40 animate-pulse" />;
  }

  const style = boostActif?.badge ? (BADGE_STYLES[boostActif.badge] ?? BADGE_STYLES["Mis en avant"]) : null;
  const jours = boostActif?.date_fin ? joursRestants(boostActif.date_fin) : 0;

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col gap-5">
      {/* En-tête */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
          <Zap size={16} className="text-orange-500" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-zinc-800">Booster mon profil</h3>
          <p className="text-xs text-zinc-400">Apparaissez en tête des résultats de recherche</p>
        </div>
        {boostData && (
          <span className="ml-auto text-xs font-semibold text-zinc-500 bg-zinc-50 border border-zinc-200 px-3 py-1 rounded-full">
            Solde : <span className="text-zinc-800 font-extrabold">{boostData.solde_disponible.toLocaleString("de-DE", { maximumFractionDigits: 0 })} FCFA</span>
          </span>
        )}
      </div>

      {/* Boost actif */}
      {boostActif && style ? (
        <div className={`rounded-2xl border-2 ${style.border} ${style.bg} p-4 flex items-center gap-4`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
            <CheckCircle size={22} className={style.text} />
          </div>
          <div className="flex-1">
            <p className={`text-sm font-extrabold ${style.text}`}>
              ⚡ {boostActif.badge} — actif
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Forfait <span className="font-semibold">{boostActif.forfait}</span> · encore{" "}
              <span className="font-bold text-zinc-700">{jours} jour{jours > 1 ? "s" : ""}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-400">Expire le</p>
            <p className="text-xs font-semibold text-zinc-700">
              {boostActif.date_fin
                ? new Date(boostActif.date_fin).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                : "—"}
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4 text-center">
          <p className="text-sm text-zinc-500">Aucun boost actif. Choisissez un forfait ci-dessous.</p>
        </div>
      )}

      {/* Forfaits */}
      {!boostActif && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Choisir un forfait</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {forfaits.map((f) => {
              const s = BADGE_STYLES[f.badge] ?? BADGE_STYLES["Mis en avant"];
              const isSelected = selectedForfait === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setSelectedForfait(isSelected ? "" : f.key)}
                  className={`flex flex-col gap-2 p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? `${s.border} ${s.bg} ring-2 ${s.ring}`
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                  }`}
                >
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full self-start ${s.bg} ${s.text} border ${s.border}`}>
                    ⚡ {f.badge}
                  </span>
                  <p className="text-sm font-extrabold text-zinc-800">{f.label}</p>
                  <p className="text-xs text-zinc-500">{f.duree_jours} jours de visibilité</p>
                  <p className={`text-base font-extrabold mt-auto ${s.text}`}>
                    {f.prix.toLocaleString("de-DE", { maximumFractionDigits: 0 })} <span className="text-xs font-semibold text-zinc-400">FCFA</span>
                  </p>
                </button>
              );
            })}
          </div>

          {selectedForfait && (
            <div className="flex flex-col gap-2 pt-1">
              {erreur && <p className="text-sm text-red-500 font-medium">{erreur}</p>}
              <button
                onClick={acheterBoost}
                disabled={achat}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 text-white font-extrabold rounded-xl text-sm transition-colors cursor-pointer"
              >
                {achat ? "Activation en cours…" : `Activer le boost ${forfaits.find(f => f.key === selectedForfait)?.label}`}
              </button>
            </div>
          )}
        </div>
      )}

      {succes && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
          <CheckCircle size={16} className="text-green-500 shrink-0" />
          <p className="text-sm font-semibold text-green-700">{succes}</p>
        </div>
      )}

      {/* Historique des boosts */}
      {boostData && boostData.boosts.length > 0 && (
        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-100">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Historique</p>
          <div className="flex flex-col gap-2">
            {boostData.boosts.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center justify-between text-xs text-zinc-500 py-1.5 border-b border-zinc-50 last:border-0">
                <div className="flex items-center gap-2">
                  {b.statut === "actif" ? (
                    <Zap size={12} className="text-orange-500" />
                  ) : (
                    <Clock size={12} className="text-zinc-300" />
                  )}
                  <span className="font-semibold text-zinc-700">{b.badge ?? b.forfait}</span>
                  <span>· {b.duree_jours} jours</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-zinc-700">{b.prix.toLocaleString("de-DE", { maximumFractionDigits: 0 })} FCFA</span>
                  <span className={`px-2 py-0.5 rounded-full font-semibold ${
                    b.statut === "actif"   ? "bg-green-50 text-green-600" :
                    b.statut === "expire"  ? "bg-zinc-100 text-zinc-400" :
                    "bg-red-50 text-red-400"
                  }`}>
                    {b.statut}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function ProfilPage() {
  const router = useRouter();
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [profil, setProfil] = useState<RepetiteurDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [erreur, setErreur] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [fNom, setFNom] = useState("");
  const [fPrenom, setFPrenom] = useState("");
  const [fTel, setFTel] = useState("");
  const [fTitre, setFTitre] = useState("");
  const [fBio, setFBio] = useState("");
  const [fVille, setFVille] = useState("");
  const [fPrix, setFPrix] = useState("");
  const [fExp, setFExp] = useState("");
  const [fMatieres, setFMatieres] = useState<string[]>([]);
  const [fNiveaux, setFNiveaux] = useState<string[]>([]);
  const [fModalites, setFModalites] = useState<string[]>([]);
  const [fPhoto, setFPhoto] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    authService.getMoi()
      .then((u) => {
        setUtilisateur(u);
        repetiteurService.getById(u.id)
          .then(setProfil)
          .catch(() => {})
          .finally(() => setLoading(false));
      })
      .catch(() => router.push("/connexion"));
  }, [router]);

  function ouvrirEdition() {
    if (!profil || !utilisateur) return;
    setFNom(utilisateur.nom);
    setFPrenom(utilisateur.prenom);
    setFTel(utilisateur.telephone ?? "");
    setFTitre(profil.titre_annonce ?? "");
    setFBio(profil.bio ?? "");
    setFVille(profil.ville ?? "");
    setFPrix(profil.prix_par_heure ? String(profil.prix_par_heure) : "");
    setFExp(String(profil.annees_experience));
    setFMatieres(profil.matieres ?? []);
    setFNiveaux(profil.niveaux ?? []);
    setFModalites(profil.modalites ?? []);
    setFPhoto(utilisateur.photo_url ?? "");
    setErreur("");
    setEditing(true);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setErreur("Image trop lourde (max 2 Mo)."); return; }
    const reader = new FileReader();
    reader.onload = () => setFPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function sauvegarder() {
    setSaving(true);
    setErreur("");
    try {
      const updated = await repetiteurService.modifierProfil({
        nom: fNom || undefined,
        prenom: fPrenom || undefined,
        telephone: fTel || undefined,
        titre_annonce: fTitre || undefined,
        bio: fBio || undefined,
        ville: fVille || undefined,
        prix_par_heure: fPrix ? parseInt(fPrix) : undefined,
        annees_experience: fExp ? parseInt(fExp) : undefined,
        matieres: fMatieres.length ? fMatieres : undefined,
        niveaux: fNiveaux.length ? fNiveaux : undefined,
        modalites: fModalites.length ? fModalites : undefined,
        photo_url: fPhoto || undefined,
      });
      setProfil(updated);
      setUtilisateur((u) => u ? {
        ...u,
        nom: fNom || u.nom,
        prenom: fPrenom || u.prenom,
        photo_url: fPhoto || u.photo_url,
      } : u);
      setEditing(false);
    } catch (e: unknown) {
      setErreur((e as { message?: string })?.message ?? "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  async function supprimerAnnonce() {
    setDeleting(true);
    try {
      await repetiteurService.supprimerAnnonce();
      authService.deconnecter();
      router.push("/");
    } catch {
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  }

  const initiales = utilisateur ? `${utilisateur.prenom[0]}${utilisateur.nom[0]}`.toUpperCase() : "?";
  const nomComplet = utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "…";

  function Sidebar() {
    return (
      <>
        <div className="flex items-center gap-2 px-4 py-4 border-b border-zinc-100">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-lg font-extrabold text-orange-500">Edu</span>
            <span className="text-lg font-extrabold text-zinc-800">Match</span>
            <span className="ml-1 text-xs font-semibold text-white bg-green-600 rounded px-1 py-0.5">CI</span>
          </Link>
        </div>
        <div className="flex items-center gap-3 px-4 py-4 border-b border-zinc-100">
          <div className="relative w-10 h-10 rounded-full bg-orange-100 border-2 border-orange-200 overflow-hidden flex items-center justify-center shrink-0">
            {utilisateur?.photo_url ? (
              <Image src={utilisateur.photo_url} alt={nomComplet} fill className="object-cover" unoptimized />
            ) : (
              <span className="text-sm font-bold text-orange-600">{initiales}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-zinc-800 truncate">{nomComplet}</span>
            <span className="text-xs text-orange-500">Répétiteur</span>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-2 flex-1">
          {NAV.map((item) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${item.href === "/dashboard/profil" ? "bg-orange-500 text-white" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800"}`}>
              <item.Icon size={18} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-2 border-t border-zinc-100">
          <button onClick={() => { authService.deconnecter(); router.push("/"); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 w-full cursor-pointer">
            <LogOut size={16} /><span>Se déconnecter</span>
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-zinc-100 font-sans">
      <aside className="hidden lg:flex w-60 bg-white border-r border-zinc-100 flex-col shrink-0 h-screen sticky top-0">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-zinc-100 px-6 py-4 sticky top-0 z-40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors shrink-0">
              <span className="text-lg leading-none">←</span>
            </Link>
            <div>
              <h1 className="text-lg font-extrabold text-zinc-800">Mon profil</h1>
              <p className="text-xs text-zinc-400">Vos informations personnelles et professionnelles</p>
            </div>
          </div>
          {!editing && !loading && (
            <div className="flex gap-2">
              <button onClick={ouvrirEdition}
                className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer">
                <Pencil size={14} />Modifier
              </button>
              <button onClick={() => setShowConfirmDelete(true)}
                className="flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 font-semibold rounded-xl text-sm transition-colors cursor-pointer">
                <Trash2 size={14} />Supprimer l&apos;annonce
              </button>
            </div>
          )}
          {editing && (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)}
                className="px-4 py-2 border border-zinc-200 text-zinc-600 font-semibold rounded-xl text-sm hover:bg-zinc-50 cursor-pointer">
                Annuler
              </button>
              <button onClick={sauvegarder} disabled={saving}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer">
                {saving ? "Sauvegarde..." : "Enregistrer"}
              </button>
            </div>
          )}
        </header>

        <main className="flex-1 p-6 flex flex-col gap-6">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl border h-48 animate-pulse" />)}
            </div>
          ) : editing ? (
            /* ── FORMULAIRE EDITION ── */
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col gap-6 max-w-2xl">
              <h2 className="text-base font-extrabold text-zinc-800">Modifier mon profil / annonce</h2>

              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-orange-200 shrink-0 bg-orange-100 flex items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}>
                  {fPhoto ? (
                    <Image src={fPhoto} alt="photo" fill className="object-cover" unoptimized />
                  ) : (
                    <span className="text-3xl font-extrabold text-orange-600">{initiales}</span>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full">
                    <Camera size={20} className="text-white" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm cursor-pointer transition-colors">
                    Changer la photo
                  </button>
                  {fPhoto && (
                    <button type="button" onClick={() => setFPhoto("")}
                      className="px-4 py-2 border border-zinc-200 text-zinc-500 hover:bg-zinc-50 font-semibold rounded-xl text-sm cursor-pointer">
                      Supprimer la photo
                    </button>
                  )}
                  <p className="text-xs text-zinc-400">JPG, PNG · max 2 Mo</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Prénom</label>
                  <input value={fPrenom} onChange={(e) => setFPrenom(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Nom</label>
                  <input value={fNom} onChange={(e) => setFNom(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Téléphone</label>
                  <input value={fTel} onChange={(e) => setFTel(e.target.value)} placeholder="07 XX XX XX XX"
                    className="px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Ville</label>
                  <input value={fVille} onChange={(e) => setFVille(e.target.value)} placeholder="Ex: Abidjan"
                    className="px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Prix mensuel (FCFA)</label>
                  <input type="number" value={fPrix} onChange={(e) => setFPrix(e.target.value)} placeholder="Ex: 15000" min={0}
                    className="px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                  <p className="text-xs text-zinc-400">Ce montant est payé par l&apos;élève chaque mois</p>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Années d&apos;expérience</label>
                  <input type="number" value={fExp} onChange={(e) => setFExp(e.target.value)} min={0}
                    className="px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Titre de l&apos;annonce</label>
                <input value={fTitre} onChange={(e) => setFTitre(e.target.value)}
                  placeholder="Ex : Professeur de maths patient, spécialisé lycée"
                  maxLength={120}
                  className="px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                <p className="text-xs text-zinc-400">Courte accroche affichée en tête de votre profil ({fTitre.length}/120)</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Biographie</label>
                <textarea value={fBio} onChange={(e) => setFBio(e.target.value)} rows={3} placeholder="Décrivez votre expérience, vos méthodes..."
                  className="px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Matières enseignées</label>
                <TagInput values={fMatieres} onChange={setFMatieres} suggestions={MATIERES_SUGGESTIONS} placeholder="Ajouter une matière..." />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Niveaux</label>
                <TagInput values={fNiveaux} onChange={setFNiveaux} suggestions={NIVEAUX_SUGGESTIONS} placeholder="Ajouter un niveau..." />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Modalités de cours</label>
                <div className="flex gap-2">
                  {MODALITES_OPTIONS.map((m) => (
                    <button key={m} onClick={() => setFModalites(fModalites.includes(m) ? fModalites.filter((x) => x !== m) : [...fModalites, m])}
                      className={`px-3 py-2 rounded-xl border-2 text-sm font-semibold cursor-pointer transition-all ${fModalites.includes(m) ? "border-orange-500 bg-orange-50 text-orange-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"}`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {erreur && <p className="text-sm text-red-500 font-medium">{erreur}</p>}
            </div>
          ) : (
            /* ── VUE PROFIL ── */
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Carte identité */}
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="relative w-20 h-20 rounded-full border-4 border-orange-200 overflow-hidden bg-orange-100 flex items-center justify-center shrink-0">
                      {profil?.photo_url ? (
                        <Image src={profil.photo_url} alt={nomComplet} fill className="object-cover" unoptimized />
                      ) : (
                        <span className="text-3xl font-extrabold text-orange-600">{initiales}</span>
                      )}
                    </div>
                    {profil?.boost_badge && (
                      <span className="absolute -top-1 -right-1 text-xs font-extrabold bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full shadow">
                        ⚡
                      </span>
                    )}
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-extrabold text-zinc-800">{nomComplet}</h2>
                    <p className="text-sm text-orange-500 font-semibold mt-1">Répétiteur</p>
                    {profil?.boost_badge && (
                      <span className="inline-block mt-1.5 text-xs font-extrabold px-3 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        ⚡ {profil.boost_badge}
                      </span>
                    )}
                    <p className="text-xs text-zinc-400 mt-1">{utilisateur?.email}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-xl ${i < Math.round(profil?.note ?? 0) ? "text-orange-400" : "text-zinc-200"}`}>★</span>
                    ))}
                    <span className="text-sm font-bold text-zinc-700 ml-1">{profil?.note?.toFixed(1)}</span>
                  </div>
                  <div className="flex gap-4 text-center">
                    <div><p className="text-lg font-extrabold text-zinc-800">{profil?.nb_eleves ?? 0}</p><p className="text-xs text-zinc-400">Élèves</p></div>
                    <div className="w-px bg-zinc-100" />
                    <div><p className="text-lg font-extrabold text-zinc-800">{profil?.nb_avis ?? 0}</p><p className="text-xs text-zinc-400">Avis</p></div>
                    <div className="w-px bg-zinc-100" />
                    <div><p className="text-lg font-extrabold text-zinc-800">{profil?.annees_experience ?? 0}</p><p className="text-xs text-zinc-400">Ans exp.</p></div>
                  </div>
                </div>

                {/* Infos professionnelles */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-zinc-800">Informations professionnelles</h3>
                    <span className="text-xs bg-orange-50 text-orange-600 font-semibold px-3 py-1 rounded-full border border-orange-100">
                      {profil?.prix_par_heure ? `${profil.prix_par_heure.toLocaleString("de-DE", { maximumFractionDigits: 0 })} FCFA/mois` : "Prix non défini"}
                    </span>
                  </div>
                  {profil?.bio && (
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">Biographie</p>
                      <p className="text-sm text-zinc-700 leading-relaxed">{profil.bio}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Matières</p>
                      <div className="flex flex-wrap gap-2">
                        {profil?.matieres?.map((m) => <span key={m} className="text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">{m}</span>)
                          ?? <span className="text-xs text-zinc-400">Non renseigné</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Niveaux</p>
                      <div className="flex flex-wrap gap-2">
                        {profil?.niveaux?.map((n) => <span key={n} className="text-xs font-semibold bg-green-50 text-green-600 px-3 py-1 rounded-full border border-green-100">{n}</span>)
                          ?? <span className="text-xs text-zinc-400">Non renseigné</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Modalités</p>
                      <div className="flex flex-wrap gap-2">
                        {profil?.modalites?.map((mo) => <span key={mo} className="text-xs font-semibold bg-purple-50 text-purple-600 px-3 py-1 rounded-full border border-purple-100">{mo}</span>)
                          ?? <span className="text-xs text-zinc-400">Non renseigné</span>}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Ville</p>
                      <p className="text-sm text-zinc-700">{profil?.ville ?? <span className="text-zinc-400">Non renseigné</span>}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-zinc-100">
                    <Link href={`/repetiteur/${utilisateur?.id}`} className="text-xs font-semibold text-orange-500 hover:underline">
                      Voir ma fiche publique →
                    </Link>
                  </div>
                </div>
              </div>

              {/* ── Section Boost ── */}
              {utilisateur && <BoostSection userId={utilisateur.id} />}
            </div>
          )}
        </main>
      </div>

      {/* ── MODAL Supprimer annonce ── */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="text-center">
              <AlertTriangle size={40} className="text-red-500 mx-auto mb-3" />
              <h2 className="text-base font-extrabold text-zinc-800">Supprimer mon annonce</h2>
              <p className="text-sm text-zinc-500 mt-2">Votre profil sera retiré des résultats de recherche. Les élèves ne pourront plus vous contacter. Cette action est réversible en contactant le support.</p>
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setShowConfirmDelete(false)}
                className="flex-1 py-2.5 border border-zinc-200 text-zinc-600 font-semibold rounded-xl text-sm hover:bg-zinc-50 cursor-pointer">
                Annuler
              </button>
              <button onClick={supprimerAnnonce} disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-zinc-300 text-white font-bold rounded-xl text-sm cursor-pointer">
                {deleting ? "Suppression..." : "Oui, supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
