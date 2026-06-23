import { apiFetch } from "../api";

export interface UtilisateurMini {
  id: string;
  nom: string;
  prenom: string;
  photo_url: string | null;
  matieres: string[] | null;
}

// ── Répétiteur ────────────────────────────────────────────────────────────────

export interface StatsRepetiteur {
  revenus_mois: number;
  eleves_actifs: number;
  heures_donnees: number;
  note_moyenne: number;
  en_attente: number;
  total_reverse: number;
  nb_vues: number;
}

export interface FavoriRepetiteur {
  repetiteur_id: string;
  nom: string;
  prenom: string;
  photo_url: string | null;
  matieres: string[] | null;
  ville: string | null;
  prix_par_heure: number | null;
  note: number;
  nb_avis: number;
  created_at: string;
}

export interface CoursRead {
  id: string;
  eleve: UtilisateurMini;
  matiere: string;
  date_heure: string;
  duree_minutes: number;
  statut: "en_attente" | "confirme" | "annule" | "termine";
}

export interface MessageReactionRead {
  emoji: string;
  utilisateur_id: string;
}

export interface MessageRead {
  id: string;
  expediteur: UtilisateurMini;
  texte: string;
  lu: boolean;
  supprime: boolean;
  reactions: MessageReactionRead[];
  created_at: string;
}

export interface PaiementRecuRead {
  id: string;
  eleve: UtilisateurMini;
  matiere: string;
  montant: number;
  methode: string;
  created_at: string;
}

export interface RetraitRead {
  id: string;
  montant: number;
  methode: string;
  statut: "en_attente" | "verse" | "refuse";
  created_at: string;
}

export interface ComptePaiementRead {
  id: string;
  type: string;
  numero: string;
  defaut: boolean;
}

export interface DemandeRead {
  id: string;
  eleve: UtilisateurMini;
  type: "contact" | "premier_cours";
  niveau: string | null;
  message: string;
  statut: "en_attente" | "accepte" | "refuse";
  created_at: string;
}

export interface DashboardRepetiteur {
  stats: StatsRepetiteur;
  prochains_cours: CoursRead[];
  messages: MessageRead[];
  demandes: DemandeRead[];
  paiements_recus: PaiementRecuRead[];
  retraits: RetraitRead[];
  comptes: ComptePaiementRead[];
}

// ── Élève ─────────────────────────────────────────────────────────────────────

export interface StatsEleve {
  cours_suivis: number;
  heures_apprentissage: number;
  depenses_mois: number;
  repetiteurs_actifs: number;
  total_annee: number;
  cours_payes: number;
}

export interface CoursEleveRead {
  id: string;
  repetiteur: UtilisateurMini;
  matiere: string;
  date_heure: string;
  duree_minutes: number;
  prix: number | null;
  statut: string;
}

export interface TransactionRead {
  id: string;
  repetiteur: UtilisateurMini;
  mois: string | null;
  matiere: string;
  montant: number;
  methode: string;
  statut: "paye" | "rembourse" | "en_attente";
  created_at: string;
}

export interface RepetiteurActifRead {
  id: string;
  nom: string;
  prenom: string;
  photo_url: string | null;
  matieres: string[] | null;
  note: number;
  prix_mensuel: number | null;
  prochain_cours: string | null;
  is_verifie: boolean;
}

export interface MoyenPaiementRead {
  id: string;
  type: string;
  numero: string;
  defaut: boolean;
}

export interface AvisRead {
  id: string;
  eleve: UtilisateurMini;
  cours_id: string;
  note: number;
  commentaire: string;
  reponse: string | null;
  reponse_at: string | null;
  created_at: string;
}

export interface AnnonceRead {
  id: string;
  titre: string;
  matiere_nom: string;
  description: string | null;
  tarif_horaire: number;
  mode_cours: string;
  ville: string | null;
  zone: string | null;
  statut: string;
  date_creation: string;
}

export interface AnnonceCreate {
  titre: string;
  matiere_nom: string;
  description?: string;
  tarif_horaire: number;
  mode_cours: string;
  ville?: string;
  zone?: string;
}

export interface AnnonceUpdate {
  titre?: string;
  description?: string;
  tarif_horaire?: number;
  mode_cours?: string;
  ville?: string;
  zone?: string;
  statut?: string;
}

export interface DashboardEleve {
  stats: StatsEleve;
  prochains_cours: CoursEleveRead[];
  repetiteurs_actifs: RepetiteurActifRead[];
  messages: MessageRead[];
  transactions: TransactionRead[];
  moyens_paiement: MoyenPaiementRead[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function formatDuree(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

export function formatDateCours(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86400000);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const hh = date.getHours().toString().padStart(2, "0");
  const mm = date.getMinutes().toString().padStart(2, "0");
  const time = `${hh}h${mm}`;
  if (d.getTime() === today.getTime()) return `Auj. ${time}`;
  if (d.getTime() === tomorrow.getTime()) return `Demain ${time}`;
  const jours = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  return `${jours[date.getDay()]}. ${time}`;
}

export function formatMontant(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// ── Services ──────────────────────────────────────────────────────────────────

export const dashboardRepetiteurService = {
  charger(): Promise<DashboardRepetiteur> {
    return apiFetch<DashboardRepetiteur>("/dashboard/repetiteur");
  },
  traiterDemande(demandeId: string, statut: "accepte" | "refuse"): Promise<{ id: string; statut: string }> {
    return apiFetch(`/dashboard/repetiteur/demandes/${demandeId}?statut=${statut}`, { method: "PATCH" });
  },
  demanderRetrait(montant: number, compte_id: string): Promise<{ id: string }> {
    return apiFetch("/dashboard/repetiteur/retraits", {
      method: "POST",
      body: JSON.stringify({ montant, compte_id }),
    });
  },
  ajouterCompte(data: { type: string; numero: string; defaut?: boolean }): Promise<ComptePaiementRead> {
    return apiFetch<ComptePaiementRead>("/dashboard/repetiteur/comptes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  envoyerMessage(destinataire_id: string, texte: string): Promise<MessageRead> {
    return apiFetch<MessageRead>("/dashboard/messages", {
      method: "POST",
      body: JSON.stringify({ destinataire_id, texte }),
    });
  },
  chargerConversation(userId: string): Promise<MessageRead[]> {
    return apiFetch<MessageRead[]>(`/dashboard/messages/conversation/${userId}`);
  },
  supprimerMessage(messageId: string): Promise<void> {
    return apiFetch<void>(`/dashboard/messages/${messageId}`, { method: "DELETE" });
  },
  modifierMessage(messageId: string, texte: string): Promise<MessageRead> {
    return apiFetch<MessageRead>(`/dashboard/messages/${messageId}`, {
      method: "PATCH",
      body: JSON.stringify({ texte }),
    });
  },
  ajouterReaction(messageId: string, emoji: string): Promise<void> {
    return apiFetch<void>(`/dashboard/messages/${messageId}/reactions`, {
      method: "POST",
      body: JSON.stringify({ emoji }),
    });
  },
  retirerReaction(messageId: string, emoji: string): Promise<void> {
    return apiFetch<void>(`/dashboard/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`, {
      method: "DELETE",
    });
  },
  planifierCours(data: { eleve_id: string; matiere: string; date_heure: string; duree_minutes: number; prix?: number }): Promise<CoursRead> {
    return apiFetch<CoursRead>("/dashboard/cours", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  chargerAvis(): Promise<{ note_moyenne: number; nb_avis: number; avis: AvisRead[] }> {
    return apiFetch("/dashboard/repetiteur/avis");
  },
  repondreAvis(avisId: string, reponse: string): Promise<AvisRead> {
    return apiFetch<AvisRead>(`/dashboard/avis/${avisId}/reponse`, {
      method: "PATCH",
      body: JSON.stringify({ reponse }),
    });
  },
  annulerCours(coursId: string): Promise<{ id: string; statut: string }> {
    return apiFetch(`/dashboard/cours/${coursId}/annuler`, { method: "PATCH" });
  },
  terminerCours(coursId: string): Promise<{ id: string; statut: string }> {
    return apiFetch(`/dashboard/cours/${coursId}/terminer`, { method: "PATCH" });
  },
  chargerTousCours(statut?: string): Promise<CoursRead[]> {
    const qs = statut && statut !== "tous" ? `?statut=${statut}` : "";
    return apiFetch<CoursRead[]>(`/dashboard/repetiteur/cours${qs}`);
  },
  listerAnnonces(): Promise<AnnonceRead[]> {
    return apiFetch<AnnonceRead[]>("/dashboard/annonces");
  },
  creerAnnonce(data: AnnonceCreate): Promise<AnnonceRead> {
    return apiFetch<AnnonceRead>("/dashboard/annonces", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  modifierAnnonce(id: string, data: AnnonceUpdate): Promise<AnnonceRead> {
    return apiFetch<AnnonceRead>(`/dashboard/annonces/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  supprimerAnnonce(id: string): Promise<void> {
    return apiFetch(`/dashboard/annonces/${id}`, { method: "DELETE" });
  },
};

export const dashboardEleveService = {
  charger(): Promise<DashboardEleve> {
    return apiFetch<DashboardEleve>("/dashboard/eleve");
  },
  ajouterMoyenPaiement(data: { type: string; numero: string; defaut?: boolean }): Promise<MoyenPaiementRead> {
    return apiFetch<MoyenPaiementRead>("/dashboard/eleve/moyens-paiement", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  envoyerMessage(destinataire_id: string, texte: string): Promise<MessageRead> {
    return apiFetch<MessageRead>("/dashboard/messages", {
      method: "POST",
      body: JSON.stringify({ destinataire_id, texte }),
    });
  },
  chargerConversation(userId: string): Promise<MessageRead[]> {
    return apiFetch<MessageRead[]>(`/dashboard/messages/conversation/${userId}`);
  },
  supprimerMessage(messageId: string): Promise<void> {
    return apiFetch<void>(`/dashboard/messages/${messageId}`, { method: "DELETE" });
  },
  modifierMessage(messageId: string, texte: string): Promise<MessageRead> {
    return apiFetch<MessageRead>(`/dashboard/messages/${messageId}`, {
      method: "PATCH",
      body: JSON.stringify({ texte }),
    });
  },
  ajouterReaction(messageId: string, emoji: string): Promise<void> {
    return apiFetch<void>(`/dashboard/messages/${messageId}/reactions`, {
      method: "POST",
      body: JSON.stringify({ emoji }),
    });
  },
  retirerReaction(messageId: string, emoji: string): Promise<void> {
    return apiFetch<void>(`/dashboard/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`, {
      method: "DELETE",
    });
  },
  laisserAvis(data: { cours_id: string; note: number; commentaire: string }): Promise<AvisRead> {
    return apiFetch<AvisRead>("/dashboard/avis", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  accepterCours(coursId: string): Promise<{ id: string; statut: string }> {
    return apiFetch(`/dashboard/eleve/cours/${coursId}/accepter`, { method: "PATCH" });
  },
  refuserCours(coursId: string): Promise<{ id: string; statut: string }> {
    return apiFetch(`/dashboard/eleve/cours/${coursId}/refuser`, { method: "PATCH" });
  },
  chargerTousCours(statut?: string): Promise<CoursEleveRead[]> {
    const qs = statut && statut !== "tous" ? `?statut=${statut}` : "";
    return apiFetch<CoursEleveRead[]>(`/dashboard/eleve/cours${qs}`);
  },
};

export const favoriService = {
  lister(): Promise<FavoriRepetiteur[]> {
    return apiFetch<FavoriRepetiteur[]>("/dashboard/eleve/favoris");
  },
  ajouter(repetiteurId: string): Promise<unknown> {
    return apiFetch(`/dashboard/eleve/favoris/${repetiteurId}`, { method: "POST" });
  },
  retirer(repetiteurId: string): Promise<unknown> {
    return apiFetch(`/dashboard/eleve/favoris/${repetiteurId}`, { method: "DELETE" });
  },
};
