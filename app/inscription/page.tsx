"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth.service";
import { repetiteurService } from "@/lib/services/repetiteur.service";

type Role = "eleve" | "repetiteur";

type Form = {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  telephone: string;
  role: Role;
  matieres: string[];
  niveaux: string[];
  modalites: string[];
  ville: string;
  commune: string;
  prixParHeure: number;
  titre_annonce: string;
  bio: string;
  photoFile: File | null;
};

const MATIERES = [
  "Mathématiques", "Physique", "Chimie", "SVT", "Français",
  "Anglais", "Espagnol", "Histoire-Géo", "Philosophie",
  "Informatique", "Économie", "Comptabilité", "Arabe",
];

const NIVEAUX = [
  "CP / CE1 / CE2", "CM1 / CM2", "6ème / 5ème",
  "4ème / 3ème", "2nde", "1ère", "Terminale",
  "BTS / DUT", "Licence", "Master",
];

const MODALITES = [
  { val: "domicile_prof", label: "À mon domicile", icon: "🏠" },
  { val: "domicile_eleve", label: "Chez l'élève", icon: "🚗" },
  { val: "en_ligne", label: "En ligne", icon: "💻" },
];

const VILLES = [
  "Abidjan", "Bouaké", "Yamoussoukro", "Daloa",
  "San-Pédro", "Korhogo", "Man", "Gagnoa",
];

const COMMUNES_ABIDJAN = [
  "Abobo", "Adjamé", "Attécoubé", "Cocody", "Koumassi",
  "Marcory", "Plateau", "Port-Bouët", "Treichville", "Yopougon",
  "Bingerville", "Songon",
];

const ETAPES_ELEVE = ["Votre rôle", "Vos infos", "Confirmation"];
const ETAPES_REPETITEUR = [
  "Votre rôle", "Vos infos", "Matières",
  "Niveaux", "Modalités", "Tarif", "Profil", "Confirmation",
];

function Barre({ etape, role }: { etape: number; role: Role }) {
  const etapes = role === "repetiteur" ? ETAPES_REPETITEUR : ETAPES_ELEVE;
  return (
    <div className="w-full bg-white border-b border-zinc-100 px-4 py-4">
      <div className="max-w-3xl mx-auto">
        {/* Barre linéaire */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${((etape - 1) / (etapes.length - 1)) * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-orange-500 shrink-0">
            {etape}/{etapes.length}
          </span>
        </div>
        {/* Label étape actuelle */}
        <p className="text-xs text-zinc-400">
          Étape {etape} — <span className="font-semibold text-zinc-600">{etapes[etape - 1]}</span>
        </p>
      </div>
    </div>
  );
}

function BtnRetour({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-700 mb-4 transition-colors">
      ← Retour
    </button>
  );
}

function ChipMulti({
  options, selected, onChange,
}: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  function toggle(val: string) {
    onChange(selected.includes(val) ? selected.filter((s) => s !== val) : [...selected, val]);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => toggle(o)}
          className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
            selected.includes(o)
              ? "bg-orange-500 border-orange-500 text-white shadow-sm"
              : "bg-white border-zinc-200 text-zinc-600 hover:border-orange-400 hover:text-orange-500"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

const DRAFT_KEY = "edumatch_inscription_draft";

export default function Inscription() {
  const router = useRouter();
  const [etape, setEtape] = useState(1);
  const [form, setForm] = useState<Form>({
    nom: "", prenom: "", email: "", mot_de_passe: "",
    telephone: "", role: "eleve",
    matieres: [], niveaux: [], modalites: [],
    ville: "", commune: "", prixParHeure: 10000, titre_annonce: "", bio: "",
    photoFile: null,
  });
  const [afficherMdp, setAfficherMdp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  // Restaurer le brouillon au chargement
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return;
      const { etape: e, form: f } = JSON.parse(saved);
      if (e > 1) {
        setEtape(e);
        setForm((prev) => ({ ...prev, ...f, mot_de_passe: "", photoFile: null }));
        setHasDraft(true);
      }
    } catch {}
  }, []);

  // Sauvegarder automatiquement après chaque changement d'étape ou de formulaire
  useEffect(() => {
    if (etape === 1) return; // pas de brouillon à l'étape 1
    try {
      const { mot_de_passe: _, photoFile: __, ...formSafe } = form;
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ etape, form: formSafe }));
    } catch {}
  }, [etape, form]);

  function set(key: keyof Form, val: unknown) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  const suivant = () => setEtape((e) => e + 1);
  const retour  = () => setEtape((e) => e - 1);

  async function soumettre(e: { preventDefault(): void }) {
    e.preventDefault();
    setErreur(null);
    setLoading(true);
    try {
      await authService.inscrire({
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        mot_de_passe: form.mot_de_passe,
        telephone: form.telephone,
        role: form.role,
      });
      // Auto-login pour avoir le token dès l'inscription
      await authService.connexion(form.email, form.mot_de_passe);
      suivant();
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  async function publierProfilRepetiteur() {
    try {
      // Upload photo si sélectionnée
      if (form.photoFile) {
        const formData = new FormData();
        formData.append("file", form.photoFile);
        const token = localStorage.getItem("access_token");
        await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1"}/repetiteurs/moi/photo`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
      }

      await authService.mettreAJourProfil({
        titre_annonce: form.titre_annonce || undefined,
        bio: form.bio || undefined,
        ville: form.ville
          ? (form.ville === "Abidjan" && form.commune ? `${form.commune}, Abidjan` : form.ville)
          : undefined,
        prix_par_heure: form.prixParHeure,
        matieres: form.matieres.length > 0 ? form.matieres : undefined,
        niveaux: form.niveaux.length > 0 ? form.niveaux : undefined,
        modalites: form.modalites.length > 0 ? form.modalites : undefined,
      });
    } catch {
      // Profil non critique — on continue vers la confirmation
    }
    suivant();
  }

  function allerAuDashboard() {
    localStorage.removeItem(DRAFT_KEY);
    router.push(form.role === "eleve" ? "/dashboard/eleve" : "/dashboard");
  }

  function recommencer() {
    localStorage.removeItem(DRAFT_KEY);
    setEtape(1);
    setForm({
      nom: "", prenom: "", email: "", mot_de_passe: "",
      telephone: "", role: "eleve",
      matieres: [], niveaux: [], modalites: [],
      ville: "", commune: "", prixParHeure: 10000, titre_annonce: "", bio: "",
      photoFile: null,
    });
    setHasDraft(false);
  }

  const derniereEtape = form.role === "repetiteur" ? ETAPES_REPETITEUR.length : ETAPES_ELEVE.length;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans flex flex-col">

      {/* Top bar */}
      <div className="w-full bg-white border-b border-zinc-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-xl font-extrabold text-orange-500">Edu</span>
          <span className="text-xl font-extrabold text-zinc-800">Match</span>
          <span className="ml-1 text-xs font-semibold text-white bg-green-600 rounded px-1.5 py-0.5">CI</span>
        </Link>
        <span className="text-sm text-zinc-500">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="text-orange-500 font-semibold hover:underline">
            Se connecter
          </Link>
        </span>
      </div>

      {/* Bandeau reprise de brouillon */}
      {hasDraft && etape > 1 && (
        <div className="bg-orange-50 border-b border-orange-100 px-4 py-2 flex items-center justify-between gap-4">
          <p className="text-sm text-orange-700 font-medium">
            ✏️ Vous avez repris là où vous vous étiez arrêté — étape {etape}.
          </p>
          <button
            onClick={recommencer}
            className="text-xs text-orange-500 underline hover:text-orange-700 shrink-0 cursor-pointer"
          >
            Recommencer depuis le début
          </button>
        </div>
      )}

      {/* Barre de progression */}
      <Barre etape={etape} role={form.role} />

      <div className="flex flex-1 justify-center px-4 py-10">

        {/* ━━━ ÉTAPE 1 — Choix du rôle ━━━ */}
        {etape === 1 && (
          <div className="w-full max-w-2xl flex flex-col items-center gap-8">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold text-zinc-800">Bienvenue sur EduMatch CI</h1>
              <p className="text-zinc-500 mt-2">Commencez par nous dire qui vous êtes</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
              {[
                { role: "eleve" as Role, icon: "🎓", titre: "Je cherche un répétiteur", desc: "Trouvez le prof idéal pour progresser dans vos matières.", btn: "Je suis élève" },
                { role: "repetiteur" as Role, icon: "👨‍🏫", titre: "Je donne des cours", desc: "Publiez votre annonce et trouvez vos premiers élèves gratuitement.", btn: "Je suis répétiteur" },
              ].map((c) => (
                <button
                  key={c.role}
                  onClick={() => { set("role", c.role); suivant(); }}
                  className="group flex flex-col items-center gap-5 bg-white border-2 border-zinc-200 hover:border-orange-500 rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <div className="w-20 h-20 rounded-2xl bg-orange-50 flex items-center justify-center text-4xl group-hover:bg-orange-100 transition-colors">
                    {c.icon}
                  </div>
                  <div className="flex flex-col gap-1 items-center text-center">
                    <span className="text-lg font-extrabold text-zinc-800">{c.titre}</span>
                    <span className="text-sm text-zinc-500 leading-relaxed">{c.desc}</span>
                  </div>
                  <span className="w-full py-2.5 bg-orange-500 group-hover:bg-orange-600 text-white font-bold rounded-xl text-sm text-center transition-colors">
                    {c.btn} →
                  </span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-400">
              {["✅ Inscription gratuite", "🔒 Données sécurisées", "⚡ Compte actif en 2 min"].map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* ━━━ ÉTAPE 2 — Informations personnelles ━━━ */}
        {etape === 2 && (
          <div className="w-full max-w-lg flex flex-col gap-5">
            <BtnRetour onClick={retour} />
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-800">
                {form.role === "eleve" ? "Créez votre compte élève" : "Créez votre compte répétiteur"}
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                {form.role === "repetiteur" ? "Étape rapide — complétez votre profil ensuite" : "Accédez à des centaines de répétiteurs qualifiés"}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
              <form onSubmit={soumettre} className="flex flex-col gap-4">
                <div className="flex gap-3">
                  {[
                    { name: "nom", placeholder: "Koné", label: "Nom" },
                    { name: "prenom", placeholder: "Amina", label: "Prénom" },
                  ].map((f) => (
                    <div key={f.name} className="flex flex-col gap-1 flex-1">
                      <label className="text-sm font-semibold text-zinc-700">{f.label}</label>
                      <input type="text" name={f.name} value={form[f.name as keyof Form] as string}
                        onChange={(e) => set(f.name as keyof Form, e.target.value)}
                        placeholder={f.placeholder} required
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-zinc-700">Adresse e-mail</label>
                  <input type="email" name="email" value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="exemple@email.com" required
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-zinc-700">Téléphone</label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 bg-zinc-100 border border-zinc-200 rounded-xl text-sm text-zinc-500 font-medium shrink-0">🇨🇮 +225</span>
                    <input type="tel" name="telephone" value={form.telephone}
                      onChange={(e) => set("telephone", e.target.value)}
                      placeholder="07 00 00 00 00" required
                      className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-zinc-700">Mot de passe</label>
                  <div className="relative">
                    <input type={afficherMdp ? "text" : "password"} name="mot_de_passe" value={form.mot_de_passe}
                      onChange={(e) => set("mot_de_passe", e.target.value)}
                      placeholder="••••••••" required minLength={8}
                      className="w-full px-4 py-3 pr-16 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    />
                    <button type="button" onClick={() => setAfficherMdp(!afficherMdp)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600 font-medium">
                      {afficherMdp ? "Cacher" : "Voir"}
                    </button>
                  </div>
                  {form.mot_de_passe.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                          form.mot_de_passe.length >= i*3
                            ? i<=1?"bg-red-400":i<=2?"bg-yellow-400":i<=3?"bg-blue-400":"bg-green-500"
                            : "bg-zinc-200"}`} />
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-xs text-zinc-400">
                  En créant un compte, vous acceptez nos{" "}
                  <Link href="/cgu" className="text-orange-500 hover:underline">CGU</Link> et notre{" "}
                  <Link href="/politique-confidentialite" className="text-orange-500 hover:underline">politique de confidentialité</Link>.
                </p>

                {erreur && (
                  <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                    {erreur}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Inscription en cours…
                    </>
                  ) : "Continuer →"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ━━━ ÉTAPE 3 — Matières (répétiteur) ━━━ */}
        {etape === 3 && form.role === "repetiteur" && (
          <div className="w-full max-w-2xl flex flex-col gap-6">
            <BtnRetour onClick={retour} />
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-800">Quelles matières enseignez-vous ?</h1>
              <p className="text-sm text-zinc-500 mt-1">Sélectionnez toutes les matières que vous pouvez enseigner</p>
            </div>
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
              <ChipMulti options={MATIERES} selected={form.matieres} onChange={(v) => set("matieres", v)} />
              {form.matieres.length > 0 && (
                <p className="text-xs text-orange-500 mt-4 font-medium">{form.matieres.length} matière(s) sélectionnée(s)</p>
              )}
            </div>
            <button onClick={suivant} disabled={form.matieres.length === 0}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-sm">
              Continuer →
            </button>
          </div>
        )}

        {/* ━━━ ÉTAPE 4 — Niveaux (répétiteur) ━━━ */}
        {etape === 4 && form.role === "repetiteur" && (
          <div className="w-full max-w-2xl flex flex-col gap-6">
            <BtnRetour onClick={retour} />
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-800">Quels niveaux enseignez-vous ?</h1>
              <p className="text-sm text-zinc-500 mt-1">Sélectionnez tous les niveaux que vous acceptez</p>
            </div>
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
              <ChipMulti options={NIVEAUX} selected={form.niveaux} onChange={(v) => set("niveaux", v)} />
            </div>
            <button onClick={suivant} disabled={form.niveaux.length === 0}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-sm">
              Continuer →
            </button>
          </div>
        )}

        {/* ━━━ ÉTAPE 5 — Modalités + Ville (répétiteur) ━━━ */}
        {etape === 5 && form.role === "repetiteur" && (
          <div className="w-full max-w-xl flex flex-col gap-6">
            <BtnRetour onClick={retour} />
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-800">Où donnez-vous vos cours ?</h1>
              <p className="text-sm text-zinc-500 mt-1">Vous pouvez sélectionner plusieurs options</p>
            </div>

            {/* Modalités */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col gap-3">
              {MODALITES.map((m) => {
                const actif = form.modalites.includes(m.val);
                return (
                  <button key={m.val} type="button"
                    onClick={() => {
                      set("modalites", actif
                        ? form.modalites.filter((x) => x !== m.val)
                        : [...form.modalites, m.val]);
                    }}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      actif ? "border-orange-500 bg-orange-50" : "border-zinc-200 hover:border-orange-300"
                    }`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <span className={`text-sm font-semibold ${actif ? "text-orange-600" : "text-zinc-700"}`}>{m.label}</span>
                    {actif && <span className="ml-auto text-orange-500 font-bold">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Ville */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col gap-3">
              <label className="text-sm font-bold text-zinc-700">Votre ville principale</label>
              <div className="flex flex-wrap gap-2">
                {VILLES.map((v) => (
                  <button key={v} type="button" onClick={() => { set("ville", v); set("commune", ""); }}
                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                      form.ville === v
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "bg-white border-zinc-200 text-zinc-600 hover:border-orange-400 hover:text-orange-500"
                    }`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Communes Abidjan */}
            {form.ville === "Abidjan" && (
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex flex-col gap-3">
                <div>
                  <label className="text-sm font-bold text-zinc-700">Commune à Abidjan</label>
                  <p className="text-xs text-zinc-400 mt-0.5">Précisez votre commune pour mieux cibler les élèves proches</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {COMMUNES_ABIDJAN.map((c) => (
                    <button key={c} type="button" onClick={() => set("commune", c)}
                      className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                        form.commune === c
                          ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                          : "bg-white border-orange-200 text-zinc-600 hover:border-orange-400 hover:text-orange-500"
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
                {form.commune && (
                  <p className="text-xs text-orange-600 font-medium">
                    📍 Votre profil apparaîtra pour les recherches à Abidjan et à {form.commune}
                  </p>
                )}
              </div>
            )}

            <button onClick={suivant} disabled={form.modalites.length === 0 || !form.ville}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-sm">
              Continuer →
            </button>
          </div>
        )}

        {/* ━━━ ÉTAPE 6 — Tarif (répétiteur) ━━━ */}
        {etape === 6 && form.role === "repetiteur" && (
          <div className="w-full max-w-lg flex flex-col gap-6">
            <BtnRetour onClick={retour} />
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-800">Quel est votre tarif horaire ?</h1>
              <p className="text-sm text-zinc-500 mt-1">Vous pourrez le modifier à tout moment depuis votre profil</p>
            </div>
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 flex flex-col items-center gap-6">
              {/* Prix affiché */}
              <div className="flex items-baseline gap-1">
                <span className="text-6xl font-extrabold text-orange-500">
                  {form.prixParHeure.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                </span>
                <span className="text-2xl font-bold text-zinc-400">F/h</span>
              </div>

              {/* Slider */}
              <input type="range" min={10000} max={250000} step={1000} value={form.prixParHeure}
                onChange={(e) => set("prixParHeure", Number(e.target.value))}
                className="w-full accent-orange-500"
              />
              <div className="flex justify-between w-full text-xs text-zinc-400">
                <span>10000 F</span>
                <span>250000 F</span>
              </div>

              {/* Tarifs suggérés */}
              <div className="w-full border-t border-zinc-100 pt-4">
                <p className="text-xs text-zinc-500 mb-3 font-medium">Tarifs pratiqués en Côte d&apos;Ivoire</p>
                <div className="flex gap-3">
                  {[
                    { label: "Débutant", prix: 10000 },
                    { label: "Intermédiaire", prix: 50000 },
                    { label: "Expert", prix: 250000 },
                  ].map((s) => (
                    <button key={s.label} onClick={() => set("prixParHeure", s.prix)}
                      className={`flex-1 flex flex-col items-center py-3 rounded-xl border text-xs font-semibold transition-all ${
                        form.prixParHeure === s.prix ? "border-orange-500 bg-orange-50 text-orange-600" : "border-zinc-200 text-zinc-500 hover:border-orange-300"
                      }`}>
                      <span className="text-base font-extrabold">{s.prix.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}F</span>
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={suivant}
              className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-sm">
              Continuer →
            </button>
          </div>
        )}

        {/* ━━━ ÉTAPE 7 — Profil : photo + bio (répétiteur) ━━━ */}
        {etape === 7 && form.role === "repetiteur" && (
          <div className="w-full max-w-lg flex flex-col gap-6">
            <BtnRetour onClick={retour} />
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-800">Complétez votre profil</h1>
              <p className="text-sm text-zinc-500 mt-1">Les profils avec photo reçoivent 3× plus de demandes</p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 flex flex-col gap-5">

              {/* Photo */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-zinc-700">Photo de profil</label>
                <div className="flex items-center gap-4">
                  {/* Avatar preview */}
                  <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center border-2 border-dashed border-orange-300 overflow-hidden shrink-0">
                    {photoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-orange-500 font-bold text-2xl">
                        {form.prenom && form.nom ? `${form.prenom[0]}${form.nom[0]}` : "📷"}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer px-4 py-2 border-2 border-orange-400 text-orange-500 hover:bg-orange-50 font-semibold rounded-xl text-sm transition-colors">
                      {photoPreview ? "Changer la photo" : "Choisir une photo"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) {
                            alert("Fichier trop volumineux (max 5 Mo)");
                            return;
                          }
                          set("photoFile", file);
                          setPhotoPreview(URL.createObjectURL(file));
                        }}
                      />
                    </label>
                    <p className="text-xs text-zinc-400">JPG, PNG ou WebP · max 5 Mo</p>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={() => { set("photoFile", null); setPhotoPreview(null); }}
                        className="text-xs text-red-400 hover:text-red-600 font-medium text-left cursor-pointer"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Titre annonce */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-zinc-700">Titre de votre annonce</label>
                <input
                  type="text"
                  value={form.titre_annonce}
                  onChange={(e) => set("titre_annonce", e.target.value)}
                  placeholder="Ex : Professeur de Maths passionné, spécialiste Terminale"
                  maxLength={120}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                />
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Accrocheur et court — affiché en tête de votre profil</span>
                  <span className={form.titre_annonce.length >= 20 ? "text-green-500" : ""}>{form.titre_annonce.length}/120</span>
                </div>
              </div>

              {/* Bio */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-zinc-700">Présentation</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  placeholder="Parlez de votre expérience, votre méthode pédagogique, vos diplômes..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
                />
                <div className="flex justify-between text-xs text-zinc-400">
                  <span>Minimum 50 caractères recommandés</span>
                  <span className={form.bio.length >= 50 ? "text-green-500" : ""}>{form.bio.length} car.</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={publierProfilRepetiteur} className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-sm">
                Publier mon profil 🎉
              </button>
              <button onClick={suivant} className="px-4 py-3 border border-zinc-300 text-zinc-500 hover:text-zinc-700 font-medium rounded-xl transition-colors text-sm">
                Passer
              </button>
            </div>
          </div>
        )}

        {/* ━━━ ÉTAPE FINALE — Confirmation ━━━ */}
        {etape === derniereEtape && (
          <div className="w-full max-w-md flex flex-col items-center gap-6 text-center">
            <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center text-5xl">
              {form.role === "repetiteur" ? "🏆" : "🎉"}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-zinc-800">
                {form.role === "repetiteur" ? "Votre profil est en ligne !" : "Compte créé avec succès !"}
              </h1>
              <p className="text-zinc-500 mt-2 text-sm leading-relaxed">
                Bienvenue sur EduMatch CI, <strong>{form.prenom} {form.nom}</strong> !<br />
                Un e-mail de confirmation a été envoyé à <strong>{form.email}</strong>.
              </p>
            </div>

            {form.role === "repetiteur" && (
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 w-full text-left flex flex-col gap-3">
                <p className="text-sm font-bold text-orange-700">Récapitulatif de votre profil</p>
                <div className="flex flex-col gap-1.5 text-sm text-zinc-600">
                  <p>📚 <strong>{form.matieres.slice(0,3).join(", ")}{form.matieres.length > 3 ? ` +${form.matieres.length-3}` : ""}</strong></p>
                  <p>🎓 <strong>{form.niveaux.slice(0,2).join(", ")}{form.niveaux.length > 2 ? ` +${form.niveaux.length-2}` : ""}</strong></p>
                  <p>📍 <strong>{form.ville === "Abidjan" && form.commune ? `${form.commune}, Abidjan` : form.ville}</strong></p>
                  <p>💰 <strong>{form.prixParHeure.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} F/h</strong></p>
                </div>
              </div>
            )}

            <div className="bg-green-50 border border-green-100 rounded-2xl p-4 w-full text-sm text-green-700 text-left">
              {form.role === "repetiteur"
                ? "✅ Votre profil est visible par les élèves. Vous recevrez des demandes par e-mail et sur votre tableau de bord."
                : "✅ Vous pouvez maintenant trouver un répétiteur et réserver votre premier cours."}
            </div>

            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={allerAuDashboard}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors text-sm text-center"
              >
                Accéder à mon tableau de bord
              </button>
              <Link href="/connexion" className="w-full py-3 border border-zinc-200 hover:border-orange-300 text-zinc-600 hover:text-orange-500 font-semibold rounded-xl transition-colors text-sm text-center">
                Se connecter
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
