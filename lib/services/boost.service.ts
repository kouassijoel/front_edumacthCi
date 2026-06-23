import { apiFetch } from "../api";

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
  statut: string; // actif | expire | refuse
  badge: string | null;
  date_debut: string | null;
  date_fin: string | null;
  created_at: string;
}

export interface MesBoostsData {
  solde_disponible: number;
  boosts: BoostRead[];
}

export const boostService = {
  getForfaits(): Promise<Forfait[]> {
    return apiFetch<Forfait[]>("/boosts/forfaits", { auth: false });
  },

  acheter(forfait: string): Promise<BoostRead> {
    return apiFetch<BoostRead>("/boosts/acheter", {
      method: "POST",
      body: JSON.stringify({ forfait }),
    });
  },

  mesBoosts(): Promise<MesBoostsData> {
    return apiFetch<MesBoostsData>("/boosts/moi");
  },

  monBoostActif(): Promise<BoostRead | null> {
    return apiFetch<BoostRead | null>("/boosts/moi/actif");
  },
};
