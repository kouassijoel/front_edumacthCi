import { apiFetch } from "../api";

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

export const notificationService = {
  getMesNotifications: (): Promise<NotificationsResponse> =>
    apiFetch<NotificationsResponse>("/notifications/moi"),

  marquerLue: (id: string): Promise<void> =>
    apiFetch(`/notifications/${id}/lire`, { method: "PATCH" }),

  marquerToutLu: (): Promise<{ nb: number }> =>
    apiFetch("/notifications/lire-tout", { method: "PATCH" }),
};
