import { apiFetch } from "../api";

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

export const repetiteurService = {
  lister(params?: { matiere?: string; ville?: string }): Promise<RepetiteurCard[]> {
    const qs = new URLSearchParams();
    if (params?.matiere) qs.set("matiere", params.matiere);
    if (params?.ville) qs.set("ville", params.ville);
    const query = qs.toString() ? `?${qs}` : "";
    return apiFetch<RepetiteurCard[]>(`/repetiteurs${query}`, { auth: false });
  },

  getById(id: string): Promise<RepetiteurDetail> {
    return apiFetch<RepetiteurDetail>(`/repetiteurs/${id}`, { auth: false });
  },

  envoyerDemande(id: string, payload: DemandePayload): Promise<{ id: string }> {
    return apiFetch<{ id: string }>(`/repetiteurs/${id}/demande`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  getAvis(id: string): Promise<AvisResponse> {
    return apiFetch<AvisResponse>(`/repetiteurs/${id}/avis`, { auth: false });
  },

  getSimilaires(id: string): Promise<RepetiteurCard[]> {
    return apiFetch<RepetiteurCard[]>(`/repetiteurs/${id}/similaires`, { auth: false });
  },

  modifierProfil(data: ProfilUpdate): Promise<RepetiteurDetail> {
    return apiFetch<RepetiteurDetail>("/repetiteurs/moi", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  supprimerAnnonce(): Promise<void> {
    return apiFetch<void>("/repetiteurs/moi", { method: "DELETE" });
  },

  getKYCStatus(): Promise<KYCStatus> {
    return apiFetch<KYCStatus>("/repetiteurs/moi/kyc");
  },

  async soumettreDocument(formData: FormData): Promise<DocumentKYC> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";
    const res = await fetch(`${apiBase}/repetiteurs/moi/kyc`, {
      method: "POST",
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.detail || body?.message || "Erreur lors de l'upload");
    }
    const body = await res.json();
    return body.data as DocumentKYC;
  },
};
