"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AvatarDropdown } from "@/app/component/avatar-dropdown";
import { useRouter } from "next/navigation";
import {
  Home, User, BookOpen, Calendar, MessageCircle, CreditCard, Star,
  Settings, LogOut, Plus, Pencil, Trash2, X, FileText,
} from "lucide-react";
import { authService, type Utilisateur } from "@/lib/services/auth.service";
import {
  dashboardRepetiteurService,
  type AnnonceRead, type AnnonceCreate,
} from "@/lib/services/dashboard.service";

const NAV = [
  { label: "Tableau de bord", href: "/dashboard",             Icon: Home },
  { label: "Mon profil",       href: "/dashboard/profil",     Icon: User },
  { label: "Mes annonces",     href: "/dashboard/annonces",   Icon: FileText },
  { label: "Mes cours",        href: "/dashboard/cours",      Icon: BookOpen },
  { label: "Agenda",           href: "/dashboard/agenda",     Icon: Calendar },
  { label: "Messages",         href: "/dashboard",            Icon: MessageCircle },
  { label: "Paiements",        href: "/dashboard/paiement",   Icon: CreditCard },
  { label: "Avis reçus",       href: "/dashboard/avis",       Icon: Star },
  { label: "Paramètres",       href: "/dashboard/parametres", Icon: Settings },
];

const MODES = [
  { value: "domicile", label: "À domicile" },
  { value: "webcam",   label: "Webcam / En ligne" },
  { value: "en_salle", label: "En salle" },
  { value: "mixte",    label: "Mixte" },
];

const STATUT_LABEL: Record<string, string> = {
  actif:    "Active",
  suspendu: "Suspendue",
  archive:  "Archivée",
};

const STATUT_COLOR: Record<string, string> = {
  actif:    "bg-green-50 text-green-600",
  suspendu: "bg-yellow-50 text-yellow-600",
  archive:  "bg-zinc-100 text-zinc-400",
};

// ── Éditeur texte enrichi ────────────────────────────────────────────────────
function RichEditor({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value || "";
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // initialiser une seule fois au montage

  function cmd(command: string, val?: string) {
    ref.current?.focus();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (document as any).execCommand(command, false, val ?? "");
    if (ref.current) onChange(ref.current.innerHTML);
  }

  const tools = [
    { label: "G",  title: "Gras",      action: () => cmd("bold"),                  cls: "font-bold" },
    { label: "I",  title: "Italique",   action: () => cmd("italic"),                cls: "italic" },
    { label: "S",  title: "Souligné",   action: () => cmd("underline"),             cls: "underline" },
    { label: "•",  title: "Liste",      action: () => cmd("insertUnorderedList"),   cls: "" },
    { label: "H",  title: "Titre",      action: () => cmd("formatBlock", "h3"),     cls: "font-bold text-xs" },
    { label: "¶",  title: "Paragraphe", action: () => cmd("formatBlock", "p"),      cls: "text-xs" },
  ];

  return (
    <div className="border border-zinc-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-orange-400 transition-all">
      {/* Barre d'outils */}
      <div className="flex items-center gap-1 px-3 py-2 bg-zinc-50 border-b border-zinc-200 flex-wrap">
        {tools.map((t) => (
          <button
            key={t.title}
            type="button"
            title={t.title}
            onMouseDown={(e) => { e.preventDefault(); t.action(); }}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-sm text-zinc-600 hover:bg-white hover:text-zinc-900 hover:shadow-sm border border-transparent hover:border-zinc-200 transition-all cursor-pointer ${t.cls}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Zone de saisie */}
      <div className="relative">
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={() => { if (ref.current) onChange(ref.current.innerHTML); }}
          className={[
            "px-4 py-3 min-h-30 text-sm text-zinc-700 focus:outline-none",
            "[&_h3]:font-bold [&_h3]:text-zinc-800 [&_h3]:text-base [&_h3]:mb-1",
            "[&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-0.5",
            "[&_strong]:font-bold [&_em]:italic [&_u]:underline",
          ].join(" ")}
          style={{ lineHeight: "1.7" }}
        />
        {!value && (
          <p className="absolute top-3 left-4 text-sm text-zinc-400 pointer-events-none select-none">
            {placeholder}
          </p>
        )}
      </div>
    </div>
  );
}

const BLANK: AnnonceCreate = {
  titre: "", matiere_nom: "", tarif_horaire: 0,
  mode_cours: "domicile", ville: "", zone: "", description: "",
};

export default function AnnoncesPage() {
  const router = useRouter();
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [annonces, setAnnonces] = useState<AnnonceRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<AnnonceCreate>(BLANK);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    authService.getMoi()
      .then((u) => {
        setUtilisateur(u);
        return dashboardRepetiteurService.listerAnnonces();
      })
      .then(setAnnonces)
      .catch(() => router.push("/connexion"))
      .finally(() => setLoading(false));
  }, [router]);

  const initiales = utilisateur ? `${utilisateur.prenom[0]}${utilisateur.nom[0]}`.toUpperCase() : "?";
  const nomComplet = utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "…";

  function openCreate() {
    setEditId(null);
    setForm(BLANK);
    setShowForm(true);
  }

  function openEdit(a: AnnonceRead) {
    setEditId(a.id);
    setForm({
      titre: a.titre,
      matiere_nom: a.matiere_nom,
      tarif_horaire: a.tarif_horaire,
      mode_cours: a.mode_cours,
      ville: a.ville ?? "",
      zone: a.zone ?? "",
      description: a.description ?? "",
    });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.titre.trim() || !form.matiere_nom.trim() || !form.tarif_horaire) return;
    setSaving(true);
    try {
      if (editId) {
        const updated = await dashboardRepetiteurService.modifierAnnonce(editId, form);
        setAnnonces((prev) => prev.map((a) => a.id === editId ? updated : a));
      } else {
        const created = await dashboardRepetiteurService.creerAnnonce(form);
        setAnnonces((prev) => [created, ...prev]);
      }
      setShowForm(false);
    } catch {}
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    setDeleteId(id);
    try {
      await dashboardRepetiteurService.supprimerAnnonce(id);
      setAnnonces((prev) => prev.filter((a) => a.id !== id));
    } catch {}
    finally { setDeleteId(null); }
  }

  async function toggleStatut(a: AnnonceRead) {
    const newStatut = a.statut === "actif" ? "suspendu" : "actif";
    try {
      const updated = await dashboardRepetiteurService.modifierAnnonce(a.id, { statut: newStatut });
      setAnnonces((prev) => prev.map((x) => x.id === a.id ? updated : x));
    } catch {}
  }

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
          <AvatarDropdown photoUrl={utilisateur?.photo_url ?? null} initiales={initiales} parametresHref="/dashboard/parametres" />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-zinc-800 truncate">{nomComplet}</span>
            <span className="text-xs text-orange-500">Répétiteur</span>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-2 flex-1">
          {NAV.map((item) => (
            <Link key={item.label} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                item.href === "/dashboard/annonces"
                  ? "bg-orange-500 text-white"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800"
              }`}>
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
              <h1 className="text-lg font-extrabold text-zinc-800">Mes annonces</h1>
              <p className="text-xs text-zinc-400">Gérez vos offres de cours publiées</p>
            </div>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer">
            <Plus size={16} /> Nouvelle annonce
          </button>
        </header>

        <main className="flex-1 p-6 flex flex-col gap-4 max-w-4xl">
          {loading ? (
            <div className="bg-white rounded-2xl border h-40 animate-pulse" />
          ) : annonces.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-14 flex flex-col items-center gap-4">
              <FileText size={48} className="text-orange-200" />
              <p className="text-base font-bold text-zinc-700">Aucune annonce publiée</p>
              <p className="text-sm text-zinc-400 text-center max-w-xs">
                Créez votre première annonce pour apparaître dans les recherches d&apos;élèves.
              </p>
              <button onClick={openCreate}
                className="mt-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer">
                + Créer une annonce
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {annonces.map((a) => (
                <div key={a.id} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-800 text-base truncate">{a.titre}</p>
                        <p className="text-sm text-orange-500 font-semibold">{a.matiere_nom}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUT_COLOR[a.statut] ?? "bg-zinc-100 text-zinc-500"}`}>
                        {STATUT_LABEL[a.statut] ?? a.statut}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-zinc-500 mt-2">
                      <span className="flex items-center gap-1">
                        💰 <strong className="text-zinc-700">{a.tarif_horaire.toLocaleString("de-DE", { maximumFractionDigits: 0 })} F/h</strong>
                      </span>
                      <span>📍 {MODES.find((m) => m.value === a.mode_cours)?.label ?? a.mode_cours}</span>
                      {a.ville && <span>🏙️ {a.ville}</span>}
                      {a.zone && <span>📌 {a.zone}</span>}
                    </div>
                    {a.description && (
                      <div
                        className="text-sm text-zinc-500 mt-2 line-clamp-2 [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-4 [&_strong]:font-bold [&_em]:italic [&_u]:underline"
                        dangerouslySetInnerHTML={{ __html: a.description }}
                      />
                    )}
                  </div>
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <button onClick={() => openEdit(a)}
                      className="flex items-center gap-2 px-3 py-2 border border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer">
                      <Pencil size={13} /> Modifier
                    </button>
                    <button onClick={() => toggleStatut(a)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                        a.statut === "actif"
                          ? "border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                          : "border-green-200 text-green-600 hover:bg-green-50"
                      }`}>
                      {a.statut === "actif" ? "⏸ Suspendre" : "▶ Activer"}
                    </button>
                    <button onClick={() => handleDelete(a.id)} disabled={deleteId === a.id}
                      className="flex items-center gap-2 px-3 py-2 border border-red-100 text-red-400 hover:bg-red-50 disabled:opacity-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer">
                      <Trash2 size={13} /> {deleteId === a.id ? "…" : "Supprimer"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mt-8 mb-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="text-base font-extrabold text-zinc-800">
                {editId ? "Modifier l'annonce" : "Nouvelle annonce"}
              </h2>
              <button onClick={() => setShowForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-600">Titre de l&apos;annonce *</label>
                  <input
                    value={form.titre}
                    onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
                    placeholder="Ex: Cours de Mathématiques lycée"
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-600">Matière *</label>
                  <input
                    value={form.matiere_nom}
                    onChange={(e) => setForm((f) => ({ ...f, matiere_nom: e.target.value }))}
                    placeholder="Ex: Mathématiques"
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-600">Tarif horaire (FCFA) *</label>
                  <input
                    type="number"
                    min={0}
                    value={form.tarif_horaire || ""}
                    onChange={(e) => setForm((f) => ({ ...f, tarif_horaire: Number(e.target.value) }))}
                    placeholder="Ex: 5000"
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-600">Mode de cours</label>
                  <select
                    value={form.mode_cours}
                    onChange={(e) => setForm((f) => ({ ...f, mode_cours: e.target.value }))}
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
                    {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-600">Ville</label>
                  <input
                    value={form.ville ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, ville: e.target.value }))}
                    placeholder="Ex: Abidjan"
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-600">Zone / Quartier</label>
                  <input
                    value={form.zone ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))}
                    placeholder="Ex: Cocody, Yopougon…"
                    className="px-4 py-2.5 rounded-xl border border-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-xs font-semibold text-zinc-600">Description</label>
                  <RichEditor
                    key={editId ?? `new-${showForm}`}
                    value={form.description ?? ""}
                    onChange={(v) => setForm((f) => ({ ...f, description: v }))}
                    placeholder="Décrivez votre approche pédagogique, vos diplômes, votre expérience…"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-zinc-200 text-zinc-600 font-semibold rounded-xl text-sm hover:bg-zinc-50 transition-colors cursor-pointer">
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.titre.trim() || !form.matiere_nom.trim() || !form.tarif_horaire}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors cursor-pointer">
                  {saving ? "Enregistrement…" : editId ? "Enregistrer" : "Publier l'annonce"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
