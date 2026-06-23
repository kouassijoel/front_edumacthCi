// ── API ───────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export type Role = "eleve" | "repetiteur" | "admin";

export interface TokenData {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface InscriptionPayload {
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  telephone: string;
  role: Role;
}

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  photo_url: string | null;
  role: Role;
  statut: string;
  matieres: string[] | null;
  ville: string | null;
  prix_par_heure: number | null;
  bio: string | null;
  notif_rappel_cours: boolean;
  notif_nouveau_cours: boolean;
  notif_messages: boolean;
  notif_paiements: boolean;
  disponible: boolean;
  mode_vacances: boolean;
  afficher_telephone: boolean;
  afficher_ville: boolean;
  is_verifie: boolean;
  kyc_statut: "non_soumis" | "en_attente" | "approuve" | "rejete";
}

export interface ProfilUpdate {
  nom?: string;
  prenom?: string;
  telephone?: string;
  photo_url?: string;
  titre_annonce?: string;
  bio?: string;
  ville?: string;
  prix_par_heure?: number;
  annees_experience?: number;
  matieres?: string[];
  niveaux?: string[];
  modalites?: string[];
}

// ── Commun ────────────────────────────────────────────────────────────────────

export interface UtilisateurMini {
  id: string;
  nom: string;
  prenom: string;
  photo_url: string | null;
  matieres: string[] | null;
}

export interface PartieRead {
  id: string;
  nom: string;
  prenom: string;
  photo_url: string | null;
}

export interface MessageRead {
  id: string;
  expediteur: UtilisateurMini;
  texte: string;
  lu: boolean;
  created_at: string;
}

export interface ComptePaiementRead {
  id: string;
  type: string;
  numero: string;
  defaut: boolean;
}

export interface RetraitRead {
  id: string;
  montant: number;
  methode: string;
  statut: "en_attente" | "verse" | "refuse";
  created_at: string;
}

// ── Dashboard répétiteur ──────────────────────────────────────────────────────

export interface StatsRepetiteur {
  revenus_mois: number;
  eleves_actifs: number;
  heures_donnees: number;
  note_moyenne: number;
  en_attente: number;
  total_reverse: number;
  nb_vues: number;
}

export interface CoursRead {
  id: string;
  eleve: UtilisateurMini;
  matiere: string;
  date_heure: string;
  duree_minutes: number;
  statut: "en_attente" | "confirme" | "annule" | "termine";
}

export interface PaiementRecuRead {
  id: string;
  eleve: UtilisateurMini;
  matiere: string;
  montant: number;
  methode: string;
  created_at: string;
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

export interface DashboardRepetiteur {
  stats: StatsRepetiteur;
  prochains_cours: CoursRead[];
  messages: MessageRead[];
  demandes: DemandeRead[];
  paiements_recus: PaiementRecuRead[];
  retraits: RetraitRead[];
  comptes: ComptePaiementRead[];
}

// ── Dashboard élève ───────────────────────────────────────────────────────────

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
  cours_id: string | null;
  mois: string | null;
  matiere: string;
  montant: number;
  methode: string;
  statut: "paye" | "rembourse" | "en_attente";
  created_at: string;
  eleve: PartieRead | null;
  repetiteur: PartieRead | null;
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

export interface DashboardEleve {
  stats: StatsEleve;
  prochains_cours: CoursEleveRead[];
  repetiteurs_actifs: RepetiteurActifRead[];
  messages: MessageRead[];
  transactions: TransactionRead[];
  moyens_paiement: MoyenPaiementRead[];
}

// ── Répétiteur public ─────────────────────────────────────────────────────────

export interface RepetiteurCard {
  id: string;
  nom: string;
  prenom: string;
  photo_url: string | null;
  matieres: string[] | null;
  ville: string | null;
  prix_par_heure: number | null;
  note: number;
  nb_avis: number;
  bio: string | null;
  titre_annonce: string | null;
  boost_badge: string | null;
}

export interface RepetiteurDetail extends RepetiteurCard {
  telephone: string | null;
  niveaux: string[] | null;
  modalites: string[] | null;
  annees_experience: number;
  nb_eleves: number;
  is_verifie: boolean;
  boost_statut: string | null;
}

export interface AvisPublic {
  id: string;
  eleve: { id: string; nom: string; prenom: string; photo_url: string | null };
  cours_id: string;
  note: number;
  commentaire: string;
  reponse: string | null;
  reponse_at: string | null;
  created_at: string;
}

export interface AvisResponse {
  note_moyenne: number;
  nb_avis: number;
  avis: AvisPublic[];
}

export interface DemandePayload {
  type: "contact" | "premier_cours";
  niveau?: string;
  message: string;
}

// ── KYC ───────────────────────────────────────────────────────────────────────

export interface DocumentKYC {
  id: string;
  type_document: "cni" | "passeport" | "diplome";
  nom_fichier: string;
  url_fichier: string;
  statut: "en_attente" | "approuve" | "rejete";
  commentaire: string | null;
  created_at: string;
}

export interface KYCStatus {
  kyc_statut: "non_soumis" | "en_attente" | "approuve" | "rejete";
  documents: DocumentKYC[];
}

// ── Paiement ──────────────────────────────────────────────────────────────────

export interface SoldeRead {
  solde_disponible: number;
  total_brut: number;
  commission: number;
  total_net: number;
  total_retire: number;
  nb_transactions: number;
  taux_commission: number;
}

export interface RechargeRead {
  id: string;
  montant: number;
  methode: string;
  created_at: string;
}

export interface WalletRead {
  solde: number;
  recharges: RechargeRead[];
}

export interface RechargeResponse {
  recharge_id: string;
  montant: number;
  methode: string;
  statut: string;
  payment_url: string;
}

export const METHODES = ["Orange Money", "MTN Mobile Money", "Wave", "Moov Money"] as const;

// ── Communauté ────────────────────────────────────────────────────────────────

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

// ── Notifications ─────────────────────────────────────────────────────────────

export interface UserNotification {
  id: string;
  titre: string;
  message: string;
  lu: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  non_lues: number;
  notifications: UserNotification[];
}

// ── Boost ─────────────────────────────────────────────────────────────────────

export interface Forfait {
  key: string;
  label: string;
  duree_jours: number;
  prix: number;
  badge: string;
}

export interface BoostRead {
  id: string;
  forfait: string;
  duree_jours: number;
  prix: number;
  statut: string;
  badge: string | null;
  date_debut: string | null;
  date_fin: string | null;
  created_at: string;
}

export interface MesBoostsData {
  solde_disponible: number;
  boosts: BoostRead[];
}
