import { apiFetch } from "../api";

export interface AuteurRead {
  id: string;
  nom: string;
  prenom: string;
  photo_url: string | null;
  matieres: string[] | null;
  ville: string | null;
}

export interface ReponseRead {
  id: string;
  auteur: AuteurRead;
  texte: string;
  created_at: string;
}

export interface CommentaireRead {
  id: string;
  auteur: AuteurRead;
  texte: string;
  created_at: string;
  reponses: ReponseRead[];
}

export interface ArticleRead {
  id: string;
  auteur: AuteurRead;
  categorie: string;
  titre: string;
  contenu: string;
  image_url: string | null;
  nb_likes: number;
  nb_commentaires: number;
  created_at: string;
  liked: boolean;
}

export interface ArticleCreate {
  categorie: string;
  titre: string;
  contenu: string;
  image_url?: string;
}

export interface SondageOptionRead {
  id: string;
  texte: string;
  nb_votes: number;
}

export interface SondageRead {
  id: string;
  auteur: AuteurRead;
  question: string;
  options: SondageOptionRead[];
  total_votes: number;
  mon_vote: string | null;
  created_at: string;
}

export const communauteService = {
  listerArticles(categorie?: string): Promise<ArticleRead[]> {
    const qs = categorie && categorie !== "Tous" ? `?categorie=${encodeURIComponent(categorie)}` : "";
    return apiFetch<ArticleRead[]>(`/communaute/articles${qs}`, { auth: false });
  },

  creerArticle(data: ArticleCreate): Promise<ArticleRead> {
    return apiFetch<ArticleRead>("/communaute/articles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  toggleLike(articleId: string): Promise<{ liked: boolean; nb_likes: number }> {
    return apiFetch(`/communaute/articles/${articleId}/likes`, { method: "POST" });
  },

  listerCommentaires(articleId: string): Promise<CommentaireRead[]> {
    return apiFetch<CommentaireRead[]>(`/communaute/articles/${articleId}/commentaires`, { auth: false });
  },

  commenter(articleId: string, texte: string, parentId?: string): Promise<CommentaireRead> {
    return apiFetch<CommentaireRead>(`/communaute/articles/${articleId}/commentaires`, {
      method: "POST",
      body: JSON.stringify({ texte, parent_id: parentId ?? null }),
    });
  },

  listerSondages(): Promise<SondageRead[]> {
    return apiFetch<SondageRead[]>("/communaute/sondages", { auth: false });
  },

  creerSondage(data: { question: string; options: { texte: string }[] }): Promise<SondageRead> {
    return apiFetch<SondageRead>("/communaute/sondages", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  voter(sondageId: string, optionId: string): Promise<SondageRead> {
    return apiFetch<SondageRead>(`/communaute/sondages/${sondageId}/voter?option_id=${optionId}`, {
      method: "POST",
    });
  },
};
