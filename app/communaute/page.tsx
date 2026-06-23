"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authService, type Utilisateur } from "@/lib/services/auth.service";
import { communauteService, type ArticleRead, type CommentaireRead, type SondageRead } from "@/lib/services/communaute.service";
import { repetiteurService, type RepetiteurCard } from "@/lib/services/repetiteur.service";

const categories = ["Tous", "Mathématiques", "Physique", "Langues", "Informatique", "Conseils", "Actualités"];

const tendances = [
  { tag: "#Baccalauréat2025", posts: 142 },
  { tag: "#MathsCIV", posts: 89 },
  { tag: "#ApprendreEnLigne", posts: 67 },
  { tag: "#RépétiteurAbidjan", posts: 54 },
  { tag: "#BEPC2025", posts: 43 },
];

function formatTemps(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Hier";
  if (d < 7) return `Il y a ${d} jours`;
  return new Date(iso).toLocaleDateString("fr-FR");
}

function calcInitiales(prenom: string, nom: string): string {
  return `${prenom[0] ?? ""}${nom[0] ?? ""}`.toUpperCase();
}

/* ── Modal connexion requise ── */
function ModalAuthRequise({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h2 className="text-base font-extrabold text-zinc-800">Connexion requise</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 font-bold cursor-pointer">✕</button>
        </div>
        <div className="p-6 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-3xl">🔒</div>
          <div>
            <p className="text-sm font-bold text-zinc-800">Rejoignez la communauté EduMatch CI</p>
            <p className="text-sm text-zinc-500 mt-1">Connectez-vous pour liker, commenter et partager des publications.</p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Link href="/connexion" className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm text-center transition-colors cursor-pointer">
              Se connecter
            </Link>
            <Link href="/inscription" className="w-full py-2.5 border border-zinc-200 hover:border-orange-300 text-zinc-600 hover:text-orange-500 font-semibold rounded-xl text-sm text-center transition-colors cursor-pointer">
              Créer un compte gratuit
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Carte article ── */
function CarteArticle({
  article,
  connecte,
  onAuthRequise,
  utilisateur,
}: {
  article: ArticleRead;
  connecte: boolean;
  onAuthRequise: () => void;
  utilisateur: Utilisateur | null;
}) {
  const [likes, setLikes] = useState(article.nb_likes);
  const [liked, setLiked] = useState(article.liked);
  const [expanded, setExpanded] = useState(false);
  const [showCommentaires, setShowCommentaires] = useState(false);
  const [commentaires, setCommentaires] = useState<CommentaireRead[]>([]);
  const [comLoaded, setComLoaded] = useState(false);
  const [nouveauCommentaire, setNouveauCommentaire] = useState("");
  const [repondreAId, setRepondreAId] = useState<string | null>(null);
  const [texteReponse, setTexteReponse] = useState("");

  const nomAuteur = `${article.auteur.prenom} ${article.auteur.nom}`;
  const photoAuteur = article.auteur.photo_url || `https://i.pravatar.cc/300?u=${article.auteur.id}`;
  const matiereAuteur = article.auteur.matieres?.[0] ?? "";
  const villeAuteur = article.auteur.ville ?? "";
  const initUser = utilisateur ? calcInitiales(utilisateur.prenom, utilisateur.nom) : "";
  const nbCom = comLoaded ? commentaires.length : article.nb_commentaires;

  async function handleLike() {
    if (!connecte) { onAuthRequise(); return; }
    const snapshot = { liked, likes };
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
    try {
      const res = await communauteService.toggleLike(article.id);
      setLiked(res.liked);
      setLikes(res.nb_likes);
    } catch {
      setLiked(snapshot.liked);
      setLikes(snapshot.likes);
    }
  }

  async function handleCommenter() {
    if (!connecte) { onAuthRequise(); return; }
    const next = !showCommentaires;
    setShowCommentaires(next);
    if (next && !comLoaded) {
      try {
        const data = await communauteService.listerCommentaires(article.id);
        setCommentaires(data);
        setComLoaded(true);
      } catch {}
    }
  }

  async function soumettreCom(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!nouveauCommentaire.trim() || !utilisateur) return;
    try {
      const nouveau = await communauteService.commenter(article.id, nouveauCommentaire.trim());
      setCommentaires((prev) => [...prev, nouveau]);
      setNouveauCommentaire("");
    } catch {}
  }

  async function soumettreReponse(e: { preventDefault(): void }, commentaireId: string) {
    e.preventDefault();
    if (!texteReponse.trim() || !utilisateur) return;
    try {
      const reponse = await communauteService.commenter(article.id, texteReponse.trim(), commentaireId);
      const asReponse = { id: reponse.id, auteur: reponse.auteur, texte: reponse.texte, created_at: reponse.created_at };
      setCommentaires((prev) =>
        prev.map((c) =>
          c.id === commentaireId ? { ...c, reponses: [...c.reponses, asReponse] } : c
        )
      );
      setTexteReponse("");
      setRepondreAId(null);
    } catch {}
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">

      {/* En-tête auteur */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-orange-100">
            <Image src={photoAuteur} alt={nomAuteur} fill className="object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-800">{nomAuteur}</p>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              {matiereAuteur && <span className="text-orange-500 font-medium">{matiereAuteur}</span>}
              {matiereAuteur && <span>·</span>}
              {villeAuteur && <span>📍 {villeAuteur}</span>}
              {villeAuteur && <span>·</span>}
              <span>{formatTemps(article.created_at)}</span>
            </div>
          </div>
        </div>
        <span className="text-xs font-semibold text-orange-500 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
          {article.categorie}
        </span>
      </div>

      {/* Titre */}
      <div className="px-5 pb-3">
        <h2 className="text-base font-extrabold text-zinc-800 leading-snug hover:text-orange-500 cursor-pointer transition-colors">
          {article.titre}
        </h2>
      </div>

      {/* Image */}
      {article.image_url && (
        <div className="relative w-full h-52 mb-3">
          <Image src={article.image_url} alt={article.titre} fill className="object-cover" />
        </div>
      )}

      {/* Contenu */}
      <div className="px-5 pb-3">
        <p className="text-sm text-zinc-600 leading-relaxed">
          {expanded ? article.contenu : `${article.contenu.slice(0, 160)}...`}
        </p>
        <button onClick={() => setExpanded(!expanded)}
          className="text-sm text-orange-500 font-semibold hover:underline mt-1 cursor-pointer">
          {expanded ? "Réduire" : "Lire la suite"}
        </button>
      </div>

      {/* Stats */}
      <div className="px-5 py-2 flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-100">
        <span>❤️ {likes} j&apos;aime</span>
        <button
          onClick={handleCommenter}
          className="hover:text-orange-500 transition-colors cursor-pointer"
        >
          💬 {nbCom} commentaire{nbCom > 1 ? "s" : ""}
        </button>
      </div>

      {/* Actions */}
      <div className="px-5 py-2 flex items-center gap-1 border-t border-zinc-100">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
            liked ? "text-orange-500 bg-orange-50" : "text-zinc-500 hover:bg-zinc-50"
          }`}
        >
          {liked ? "❤️" : "🤍"} J&apos;aime
        </button>
        <button
          onClick={handleCommenter}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
            showCommentaires ? "text-orange-500 bg-orange-50" : "text-zinc-500 hover:bg-zinc-50"
          }`}
        >
          💬 Commenter
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold text-zinc-500 hover:bg-zinc-50 transition-colors cursor-pointer">
          ↗️ Partager
        </button>
      </div>

      {/* ── Section commentaires ── */}
      {showCommentaires && (
        <div className="border-t border-zinc-100 bg-zinc-50 px-5 py-4 flex flex-col gap-4">

          {/* Liste des commentaires */}
          {commentaires.length > 0 ? (
            <div className="flex flex-col gap-4">
              {commentaires.map((c) => {
                const initC = calcInitiales(c.auteur.prenom, c.auteur.nom);
                const nomC = `${c.auteur.prenom} ${c.auteur.nom}`;
                return (
                  <div key={c.id} className="flex flex-col gap-2">
                    {/* Commentaire principal */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {c.auteur.photo_url ? (
                          <img src={c.auteur.photo_url} alt={nomC} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-orange-600">{initC}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="bg-white rounded-2xl px-4 py-2.5 border border-zinc-100 shadow-sm">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-bold text-zinc-800">{nomC}</span>
                            <span className="text-xs text-zinc-400">{formatTemps(c.created_at)}</span>
                          </div>
                          <p className="text-sm text-zinc-600 leading-relaxed">{c.texte}</p>
                        </div>
                        {/* Bouton Répondre */}
                        {connecte && (
                          <button
                            onClick={() => {
                              setRepondreAId(repondreAId === c.id ? null : c.id);
                              setTexteReponse("");
                            }}
                            className="mt-1 ml-2 text-xs font-semibold text-zinc-400 hover:text-orange-500 transition-colors cursor-pointer"
                          >
                            {repondreAId === c.id ? "Annuler" : "↩ Répondre"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Réponses imbriquées */}
                    {c.reponses.length > 0 && (
                      <div className="ml-11 flex flex-col gap-2">
                        {c.reponses.map((r) => {
                          const initR = calcInitiales(r.auteur.prenom, r.auteur.nom);
                          const nomR = `${r.auteur.prenom} ${r.auteur.nom}`;
                          const estAuteurReponse = r.auteur.id === article.auteur.id;
                          return (
                            <div key={r.id} className="flex gap-2">
                              <div className="w-7 h-7 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center shrink-0 overflow-hidden">
                                {r.auteur.photo_url ? (
                                  <img src={r.auteur.photo_url} alt={nomR} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xs font-bold text-orange-600">{initR}</span>
                                )}
                              </div>
                              <div className="flex-1 bg-white rounded-2xl px-3 py-2 border border-zinc-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-bold text-zinc-800">{nomR}</span>
                                  {estAuteurReponse && (
                                    <span className="text-xs font-bold text-white bg-orange-500 px-1.5 py-0.5 rounded-full leading-none">
                                      Auteur
                                    </span>
                                  )}
                                  <span className="text-xs text-zinc-400 ml-auto">{formatTemps(r.created_at)}</span>
                                </div>
                                <p className="text-sm text-zinc-600 leading-relaxed">{r.texte}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Formulaire de réponse */}
                    {repondreAId === c.id && connecte && (
                      <form onSubmit={(e) => soumettreReponse(e, c.id)} className="ml-11 flex gap-2 items-start">
                        <div className="w-7 h-7 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center shrink-0 mt-1 overflow-hidden">
                          {utilisateur?.photo_url ? (
                            <img src={utilisateur.photo_url} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-orange-600">{initUser}</span>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col gap-1.5">
                          <textarea
                            value={texteReponse}
                            onChange={(e) => setTexteReponse(e.target.value)}
                            placeholder={`Répondre à ${`${c.auteur.prenom} ${c.auteur.nom}`}…`}
                            rows={2}
                            className="w-full px-3 py-2 rounded-2xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
                          />
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={!texteReponse.trim()}
                              className="px-4 py-1.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-full text-xs transition-colors cursor-pointer"
                            >
                              Répondre
                            </button>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-400 text-center py-2">Aucun commentaire. Soyez le premier !</p>
          )}

          {/* Saisie du commentaire (connecté uniquement) */}
          {connecte ? (
            <form onSubmit={soumettreCom} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center shrink-0 mt-1 overflow-hidden">
                {utilisateur?.photo_url ? (
                  <img src={utilisateur.photo_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-orange-600">{initUser}</span>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <textarea
                  value={nouveauCommentaire}
                  onChange={(e) => setNouveauCommentaire(e.target.value)}
                  placeholder="Laissez un commentaire..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-2xl border border-zinc-200 bg-white text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!nouveauCommentaire.trim()}
                    className="px-5 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-full text-xs transition-colors cursor-pointer"
                  >
                    Publier
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-3 bg-white border border-zinc-200 rounded-2xl px-4 py-3">
              <span className="text-sm text-zinc-500 flex-1">Connectez-vous pour laisser un commentaire.</span>
              <Link href="/connexion" className="text-xs font-bold text-orange-500 hover:underline cursor-pointer shrink-0">
                Se connecter
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Carte Sondage ── */
function CarteSondage({
  sondage: initial,
  connecte,
  onAuthRequise,
}: {
  sondage: SondageRead;
  connecte: boolean;
  onAuthRequise: () => void;
}) {
  const [sondage, setSondage] = useState(initial);
  const nomAuteur = `${sondage.auteur.prenom} ${sondage.auteur.nom}`;
  const photoAuteur = sondage.auteur.photo_url || `https://i.pravatar.cc/300?u=${sondage.auteur.id}`;

  async function voter(optionId: string) {
    if (!connecte) { onAuthRequise(); return; }
    try {
      const updated = await communauteService.voter(sondage.id, optionId);
      setSondage(updated);
    } catch {}
  }

  const aVote = !!sondage.mon_vote;
  const total = sondage.total_votes;

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-orange-100">
            <Image src={photoAuteur} alt={nomAuteur} fill className="object-cover" />
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-800">{nomAuteur}</p>
            <p className="text-xs text-zinc-400">{formatTemps(sondage.created_at)}</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-100 px-3 py-1 rounded-full">📊 Sondage</span>
      </div>

      <div className="px-5 pb-5 flex flex-col gap-3">
        <p className="text-base font-extrabold text-zinc-800 leading-snug">{sondage.question}</p>

        <div className="flex flex-col gap-2">
          {sondage.options.map((opt) => {
            const pct = total > 0 ? Math.round((opt.nb_votes / total) * 100) : 0;
            const estMonVote = sondage.mon_vote === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => !aVote && voter(opt.id)}
                disabled={aVote}
                className={`relative w-full text-left rounded-xl border-2 px-4 py-2.5 overflow-hidden transition-all ${
                  estMonVote
                    ? "border-orange-500 bg-orange-50"
                    : aVote
                    ? "border-zinc-100 bg-zinc-50 cursor-default"
                    : "border-zinc-200 hover:border-orange-300 hover:bg-orange-50 cursor-pointer"
                }`}
              >
                {aVote && (
                  <div
                    className={`absolute inset-y-0 left-0 ${estMonVote ? "bg-orange-100" : "bg-zinc-100"} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                )}
                <div className="relative flex items-center justify-between">
                  <span className={`text-sm font-semibold ${estMonVote ? "text-orange-700" : "text-zinc-700"}`}>
                    {estMonVote && "✓ "}{opt.texte}
                  </span>
                  {aVote && (
                    <span className={`text-xs font-bold ml-2 shrink-0 ${estMonVote ? "text-orange-600" : "text-zinc-400"}`}>
                      {pct}%
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-xs text-zinc-400 text-center">
          {total} vote{total > 1 ? "s" : ""}
          {!connecte && " · Connectez-vous pour voter"}
          {connecte && !aVote && " · Cliquez pour voter"}
        </p>
      </div>
    </div>
  );
}

/* ── Page principale ── */
export default function Communaute() {
  const [categorie, setCategorie] = useState("Tous");
  const [articles, setArticles] = useState<ArticleRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [repetiteurs, setRepetiteurs] = useState<RepetiteurCard[]>([]);
  const [titrePub, setTitrePub] = useState("");
  const [contenuPost, setContenuPost] = useState("");
  const [categoriePub, setCategoriePub] = useState(categories[1]);
  const [showModal, setShowModal] = useState(false);
  const [showSondageModal, setShowSondageModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [sondages, setSondages] = useState<SondageRead[]>([]);
  const [sondageQuestion, setSondageQuestion] = useState("");
  const [sondageOptions, setSondageOptions] = useState(["", ""]);

  useEffect(() => {
    authService.getMoi().then(setUtilisateur).catch(() => setUtilisateur(null));
  }, []);

  useEffect(() => {
    setLoading(true);
    communauteService.listerArticles()
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
    communauteService.listerSondages()
      .then(setSondages)
      .catch(() => setSondages([]));
    repetiteurService.lister()
      .then((data) => setRepetiteurs(data.slice(0, 3)))
      .catch(() => setRepetiteurs([]));
  }, []);

  const connecte = utilisateur !== null;
  const initiales = utilisateur
    ? calcInitiales(utilisateur.prenom, utilisateur.nom)
    : "";
  const nomComplet = utilisateur ? `${utilisateur.prenom} ${utilisateur.nom}` : "";
  const dashboardHref = utilisateur?.role === "eleve" ? "/dashboard/eleve" : "/dashboard";

  const articlesFiltres = categorie === "Tous"
    ? articles
    : articles.filter((a) => a.categorie === categorie);

  const mesArticles = utilisateur ? articles.filter((a) => a.auteur.id === utilisateur.id) : [];
  const mesLikes = mesArticles.reduce((acc, a) => acc + a.nb_likes, 0);
  const mesSondages = utilisateur ? sondages.filter((s) => s.auteur.id === utilisateur.id) : [];

  // Mélanger articles et sondages par date décroissante
  type FeedItem = { type: "article"; data: ArticleRead } | { type: "sondage"; data: SondageRead };
  const feedItems: FeedItem[] = [
    ...articlesFiltres.map((a) => ({ type: "article" as const, data: a })),
    ...(categorie === "Tous" ? sondages.map((s) => ({ type: "sondage" as const, data: s })) : []),
  ].sort((a, b) => new Date(b.data.created_at).getTime() - new Date(a.data.created_at).getTime());

  function handlePublier() {
    if (!connecte) { setShowAuthModal(true); return; }
    setShowModal(true);
  }

  async function publierSondage() {
    const opts = sondageOptions.filter((o) => o.trim());
    if (!sondageQuestion.trim() || opts.length < 2) return;
    try {
      const nouveau = await communauteService.creerSondage({
        question: sondageQuestion.trim(),
        options: opts.map((o) => ({ texte: o.trim() })),
      });
      setSondages((prev) => [nouveau, ...prev]);
      setShowSondageModal(false);
      setSondageQuestion("");
      setSondageOptions(["", ""]);
    } catch {}
  }

  async function publierArticle() {
    if (!titrePub.trim() || !contenuPost.trim()) return;
    try {
      const nouveau = await communauteService.creerArticle({
        categorie: categoriePub,
        titre: titrePub.trim(),
        contenu: contenuPost.trim(),
      });
      setArticles((prev) => [nouveau, ...prev]);
      setShowModal(false);
      setTitrePub("");
      setContenuPost("");
    } catch {}
  }

  return (
    <div className="min-h-screen bg-zinc-100 font-sans">

      {/* ── Header ── */}
      <header className="w-full bg-white border-b border-zinc-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Mobile : bouton retour */}
          <div className="flex items-center gap-3">
            <Link href={connecte ? dashboardHref : "/"} className="md:hidden flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors">
              <span className="text-lg leading-none">←</span>
            </Link>
            <Link href="/" className="flex items-center gap-1 cursor-pointer">
              <span className="text-xl font-extrabold text-orange-500">Edu</span>
              <span className="text-xl font-extrabold text-zinc-800">Match</span>
              <span className="ml-1 text-xs font-semibold text-white bg-green-600 rounded px-1.5 py-0.5">CI</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
            <Link href="/" className="hover:text-orange-500 transition-colors cursor-pointer">Accueil</Link>
            <Link href="/communaute" className="text-orange-500 border-b-2 border-orange-500 pb-0.5 cursor-pointer">Communauté</Link>
          </nav>
          <div className="flex items-center gap-2">
            {connecte ? (
              <>
                <Link href={dashboardHref} className="hidden md:block text-sm font-medium text-zinc-700 border border-zinc-300 hover:border-orange-400 hover:text-orange-500 px-4 py-2 rounded-full transition-colors cursor-pointer">
                  Mon espace
                </Link>
                {/* Mobile : bouton publier rapide */}
                <button onClick={() => setShowModal(true)}
                  className="md:hidden px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full text-xs transition-colors cursor-pointer">
                  + Publier
                </button>
                <div className="w-9 h-9 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center cursor-pointer shrink-0 overflow-hidden">
                  {utilisateur?.photo_url ? (
                    <img src={utilisateur.photo_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-orange-600">{initiales}</span>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/connexion" className="text-sm font-medium text-zinc-700 border border-zinc-300 hover:border-orange-400 hover:text-orange-500 px-4 py-2 rounded-full transition-colors cursor-pointer">
                  Connexion
                </Link>
                <Link href="/inscription" className="hidden md:block text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-full transition-colors cursor-pointer">
                  S&apos;inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Filtres catégories (mobile sticky) ── */}
      <div className="lg:hidden bg-white border-b border-zinc-100 px-4 py-2 sticky top-14 z-40">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setCategorie(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                categorie === cat
                  ? "bg-orange-500 border-orange-500 text-white"
                  : "bg-white border-zinc-200 text-zinc-600 hover:border-orange-300 hover:text-orange-500"
              }`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-4 lg:py-8 grid grid-cols-1 lg:grid-cols-4 gap-6 pb-6">

        {/* ── COLONNE GAUCHE — Profil ou CTA ── */}
        <aside className="hidden lg:flex lg:col-span-1 flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          {connecte ? (
            /* Profil connecté */
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
              <div className="h-16 bg-linear-to-r from-orange-400 to-orange-500" />
              <div className="flex flex-col items-center gap-2 px-4 pb-5 -mt-8">
                <div className="w-16 h-16 rounded-full bg-orange-100 border-4 border-white shadow flex items-center justify-center overflow-hidden">
                  {utilisateur?.photo_url ? (
                    <img src={utilisateur.photo_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-orange-600">{initiales}</span>
                  )}
                </div>
                <p className="text-sm font-extrabold text-zinc-800">{nomComplet}</p>
                <span className="text-xs text-orange-500 font-semibold bg-orange-50 px-2 py-0.5 rounded-full capitalize">
                  {utilisateur?.role}
                </span>
                <div className="flex flex-col gap-1 w-full mt-2 text-xs text-zinc-500">
                  <div className="flex justify-between"><span>Articles publiés</span><strong className="text-zinc-800">{mesArticles.length}</strong></div>
                  <div className="flex justify-between"><span>Likes reçus</span><strong className="text-zinc-800">{mesLikes}</strong></div>
                  <div className="flex justify-between"><span>Sondages publiés</span><strong className="text-zinc-800">{mesSondages.length}</strong></div>
                </div>
              </div>
            </div>
          ) : (
            /* CTA non connecté */
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center text-3xl">👋</div>
              <div>
                <p className="text-sm font-extrabold text-zinc-800">Rejoignez la communauté</p>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Créez un compte pour liker, commenter et partager votre expertise.</p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Link href="/inscription" className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm text-center transition-colors cursor-pointer">
                  S&apos;inscrire gratuitement
                </Link>
                <Link href="/connexion" className="w-full py-2 border border-zinc-200 hover:border-orange-300 text-zinc-600 hover:text-orange-500 font-semibold rounded-xl text-sm text-center transition-colors cursor-pointer">
                  Se connecter
                </Link>
              </div>
            </div>
          )}

          {/* Navigation rapide */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4 flex flex-col gap-1">
            {[
              { icon: "🏠", label: "Fil d'actualité", href: "/communaute" },
              { icon: "📝", label: "Mes articles", href: "#" },
              { icon: "🔖", label: "Enregistrés", href: "#" },
              { icon: "🔔", label: "Notifications", href: "#" },
              { icon: "📊", label: "Statistiques", href: "#" },
            ].map((item) => (
              <Link key={item.label} href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </aside>

        {/* ── COLONNE CENTRE — Feed ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Boite de création de post */}
          {connecte ? (
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-orange-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {utilisateur?.photo_url ? (
                    <img src={utilisateur.photo_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-orange-600">{initiales}</span>
                  )}
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex-1 text-left px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 text-sm text-zinc-400 hover:bg-orange-50 hover:border-orange-200 transition-colors cursor-pointer"
                >
                  Partagez une astuce, un article, une expérience...
                </button>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-100">
                {[
                  { icon: "📝", label: "Article", action: () => setShowModal(true) },
                  { icon: "📊", label: "Sondage", action: () => { if (!connecte) { setShowAuthModal(true); return; } setShowSondageModal(true); } },
                ].map((btn) => (
                  <button key={btn.label} onClick={btn.action}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-500 hover:bg-zinc-50 hover:text-orange-500 transition-colors cursor-pointer">
                    <span>{btn.icon}</span>
                    <span className="hidden sm:inline">{btn.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Banner incitation non connecté */
            <div className="bg-linear-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-4 flex items-center gap-4">
              <span className="text-2xl shrink-0">✍️</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-orange-700">Vous avez une expertise à partager ?</p>
                <p className="text-xs text-orange-600 mt-0.5">Connectez-vous pour publier des articles et interagir avec la communauté.</p>
              </div>
              <Link href="/connexion"
                className="shrink-0 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-full transition-colors cursor-pointer">
                Se connecter
              </Link>
            </div>
          )}

          {/* Filtres catégories — desktop seulement (mobile = barre sticky au-dessus) */}
          <div className="hidden lg:flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setCategorie(cat)}
                className={`shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition-all cursor-pointer ${
                  categorie === cat
                    ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                    : "bg-white border-zinc-200 text-zinc-600 hover:border-orange-300 hover:text-orange-500"
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Feed articles + sondages */}
          {loading ? (
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-zinc-100 shadow-sm h-64 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {feedItems.map((item) =>
                item.type === "article" ? (
                  <CarteArticle
                    key={item.data.id}
                    article={item.data}
                    connecte={connecte}
                    onAuthRequise={() => setShowAuthModal(true)}
                    utilisateur={utilisateur}
                  />
                ) : (
                  <CarteSondage
                    key={item.data.id}
                    sondage={item.data}
                    connecte={connecte}
                    onAuthRequise={() => setShowAuthModal(true)}
                  />
                )
              )}
              {feedItems.length === 0 && (
                <div className="bg-white rounded-2xl border border-zinc-100 p-12 text-center text-zinc-400">
                  <p className="text-4xl mb-3">📭</p>
                  <p className="font-semibold">Aucune publication dans cette catégorie</p>
                  <p className="text-sm mt-1">Soyez le premier à publier !</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── COLONNE DROITE ── */}
        <aside className="hidden lg:flex lg:col-span-1 flex-col gap-4 lg:sticky lg:top-24 lg:self-start">

          {/* Tendances */}
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
            <h3 className="text-sm font-extrabold text-zinc-800 mb-3">🔥 Tendances</h3>
            <div className="flex flex-col gap-2">
              {tendances.map((t) => (
                <button key={t.tag} className="flex items-center justify-between text-sm hover:text-orange-500 transition-colors text-left group cursor-pointer">
                  <span className="text-orange-500 font-semibold group-hover:underline">{t.tag}</span>
                  <span className="text-xs text-zinc-400">{t.posts} posts</span>
                </button>
              ))}
            </div>
          </div>

          {/* Répétiteurs actifs */}
          {repetiteurs.length > 0 && (
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5">
              <h3 className="text-sm font-extrabold text-zinc-800 mb-3">👥 Répétiteurs actifs</h3>
              <div className="flex flex-col gap-3">
                {repetiteurs.map((r) => {
                  const nomR = `${r.prenom} ${r.nom}`;
                  const photoR = r.photo_url || `https://i.pravatar.cc/300?u=${r.id}`;
                  return (
                    <div key={r.id} className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-orange-100 shrink-0">
                        <Image src={photoR} alt={nomR} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-800 truncate">{nomR}</p>
                        <p className="text-xs text-orange-500 truncate">{r.matieres?.[0] ?? ""}</p>
                      </div>
                      <Link
                        href={`/repetiteur/${r.id}`}
                        className="text-xs font-bold text-orange-500 border border-orange-300 hover:bg-orange-500 hover:text-white px-2.5 py-1 rounded-full transition-colors shrink-0 cursor-pointer"
                      >
                        Voir
                      </Link>
                    </div>
                  );
                })}
              </div>
              <Link href="/" className="mt-3 block text-xs text-center text-orange-500 font-semibold hover:underline">
                Voir tous les répétiteurs →
              </Link>
            </div>
          )}

          {/* CTA écrire */}
          <div className="bg-linear-to-br from-orange-500 to-orange-400 rounded-2xl p-5 text-white flex flex-col gap-3">
            <p className="text-sm font-extrabold">✍️ Partagez votre expertise</p>
            <p className="text-xs text-orange-100 leading-relaxed">
              Publiez des articles et gagnez en visibilité auprès de milliers d&apos;élèves.
            </p>
            <button onClick={handlePublier}
              className="w-full py-2 bg-white text-orange-500 font-bold rounded-xl text-xs hover:bg-orange-50 transition-colors cursor-pointer">
              Écrire un article
            </button>
          </div>
        </aside>
      </main>

      {/* ── MODAL Connexion requise ── */}
      {showAuthModal && <ModalAuthRequise onClose={() => setShowAuthModal(false)} />}

      {/* ── MODAL Créer un sondage (connecté seulement) ── */}
      {showSondageModal && connecte && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <h2 className="text-base font-extrabold text-zinc-800">📊 Créer un sondage</h2>
              <button
                onClick={() => { setShowSondageModal(false); setSondageQuestion(""); setSondageOptions(["", ""]); }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 text-lg font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5 block">Question</label>
                <input
                  value={sondageQuestion}
                  onChange={(e) => setSondageQuestion(e.target.value)}
                  placeholder="Posez votre question à la communauté..."
                  maxLength={300}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Options ({sondageOptions.length}/4)</label>
                {sondageOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={opt}
                      onChange={(e) => {
                        const next = [...sondageOptions];
                        next[i] = e.target.value;
                        setSondageOptions(next);
                      }}
                      placeholder={`Option ${i + 1}${i < 2 ? " *" : ""}`}
                      maxLength={200}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                    />
                    {i >= 2 && (
                      <button
                        onClick={() => setSondageOptions(sondageOptions.filter((_, j) => j !== i))}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 text-zinc-400 hover:text-red-500 font-bold transition-colors cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {sondageOptions.length < 4 && (
                  <button
                    onClick={() => setSondageOptions([...sondageOptions, ""])}
                    className="flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors cursor-pointer py-1"
                  >
                    <span className="text-lg leading-none">+</span> Ajouter une option
                  </button>
                )}
              </div>
              <p className="text-xs text-zinc-400">2 options minimum, 4 maximum. Les deux premières sont obligatoires.</p>
            </div>
            <div className="px-5 py-4 border-t border-zinc-100 flex gap-3">
              <button
                onClick={() => { setShowSondageModal(false); setSondageQuestion(""); setSondageOptions(["", ""]); }}
                className="flex-1 py-2.5 border border-zinc-200 text-zinc-600 font-semibold rounded-xl text-sm hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                disabled={!sondageQuestion.trim() || sondageOptions.filter((o) => o.trim()).length < 2}
                onClick={publierSondage}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Publier le sondage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL Créer une publication (connecté seulement) ── */}
      {showModal && connecte && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <h2 className="text-base font-extrabold text-zinc-800">Créer une publication</h2>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 text-lg font-bold transition-colors cursor-pointer">
                ✕
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 border-2 border-orange-100 flex items-center justify-center shrink-0 overflow-hidden">
                  {utilisateur?.photo_url ? (
                    <img src={utilisateur.photo_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-orange-600">{initiales}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-zinc-800">{nomComplet}</p>
                  <select
                    value={categoriePub}
                    onChange={(e) => setCategoriePub(e.target.value)}
                    className="text-xs text-zinc-500 border border-zinc-200 rounded-lg px-2 py-0.5 mt-0.5 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  >
                    {categories.slice(1).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <input
                value={titrePub}
                onChange={(e) => setTitrePub(e.target.value)}
                placeholder="Titre de votre article..."
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              />
              <textarea
                value={contenuPost}
                onChange={(e) => setContenuPost(e.target.value)}
                placeholder="Partagez une astuce pédagogique, une expérience, un conseil pour les élèves de Côte d'Ivoire..."
                rows={5}
                className="w-full text-sm text-zinc-800 placeholder-zinc-400 resize-none focus:outline-none leading-relaxed"
              />
            </div>
            <div className="px-5 py-4 border-t border-zinc-100 flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-zinc-200 text-zinc-600 font-semibold rounded-xl text-sm hover:bg-zinc-50 transition-colors cursor-pointer">
                Annuler
              </button>
              <button
                disabled={!titrePub.trim() || !contenuPost.trim()}
                onClick={publierArticle}
                className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
              >
                Publier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
