import { apiFetch } from "../api";

export interface PartieRead {
  id: string;
  nom: string;
  prenom: string;
  photo_url: string | null;
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

export const paiementService = {
  creerTransaction(repetiteur_id: string, mois: string, methode: string): Promise<TransactionRead> {
    return apiFetch<TransactionRead>("/paiement/transactions", {
      method: "POST",
      body: JSON.stringify({ repetiteur_id, mois, methode }),
    });
  },

  listerTransactions(): Promise<TransactionRead[]> {
    return apiFetch<TransactionRead[]>("/paiement/transactions");
  },

  monSolde(): Promise<SoldeRead> {
    return apiFetch<SoldeRead>("/paiement/solde");
  },

  demanderRetrait(montant: number, methode: string, numero: string): Promise<RetraitRead> {
    return apiFetch<RetraitRead>("/paiement/retraits", {
      method: "POST",
      body: JSON.stringify({ montant, methode, numero }),
    });
  },

  listerRetraits(): Promise<RetraitRead[]> {
    return apiFetch<RetraitRead[]>("/paiement/retraits");
  },

  listerComptes(): Promise<ComptePaiementRead[]> {
    return apiFetch<ComptePaiementRead[]>("/paiement/comptes");
  },

  ajouterCompte(type: string, numero: string, defaut: boolean): Promise<ComptePaiementRead> {
    return apiFetch<ComptePaiementRead>("/paiement/comptes", {
      method: "POST",
      body: JSON.stringify({ type, numero, defaut }),
    });
  },

  supprimerCompte(compte_id: string): Promise<void> {
    return apiFetch<void>(`/paiement/comptes/${compte_id}`, { method: "DELETE" });
  },

  monWallet(): Promise<WalletRead> {
    return apiFetch<WalletRead>("/paiement/eleve/wallet");
  },

  rechargerWallet(montant: number, methode: string): Promise<RechargeResponse> {
    return apiFetch("/paiement/eleve/recharger", {
      method: "POST",
      body: JSON.stringify({ montant, methode }),
    });
  },
};


