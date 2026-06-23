import { apiFetch, ApiResponse } from "../api";

export type Role = "eleve" | "repetiteur" | "admin";

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

export interface TokenData {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1";

export const authService = {
  inscrire(payload: InscriptionPayload): Promise<unknown> {
    return apiFetch("/auth/inscription", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    });
  },

  async connexion(email: string, motDePasse: string): Promise<TokenData> {
    const body = new URLSearchParams({
      grant_type: "password",
      username: email,
      password: motDePasse,
      scope: "",
      client_id: "",
      client_secret: "",
    });

    const res = await fetch(`${API_BASE}/auth/connexion`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message || data?.detail || "Identifiants incorrects");
    }

    const json: ApiResponse<TokenData> = await res.json();
    localStorage.setItem("access_token", json.data.access_token);
    localStorage.setItem("refresh_token", json.data.refresh_token);
    return json.data;
  },

  getMoi(): Promise<Utilisateur> {
    return apiFetch<Utilisateur>("/auth/moi");
  },

  mettreAJourProfil(data: ProfilUpdate): Promise<Utilisateur> {
    return apiFetch<Utilisateur>("/auth/profil", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async uploadPhoto(file: File): Promise<string> {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/auth/photo`, {
      method: "POST",
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.detail || body?.message || "Erreur lors de l'upload");
    }
    const body = await res.json();
    return body.data.photo_url as string;
  },

  deconnecter() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  },
};
