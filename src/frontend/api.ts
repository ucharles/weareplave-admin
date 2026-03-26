import type { ICard, Member, Theme, CardType } from "../types";

const API_BASE = "/api";

function getToken(): string {
  return localStorage.getItem("admin_token") ?? "";
}

export function setToken(token: string) {
  localStorage.setItem("admin_token", token);
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
  return res.json();
}

export const api = {
  // Cards
  getCards: () => request<ICard[]>("/cards"),
  createCard: (card: ICard) => request<ICard>("/cards", { method: "POST", body: JSON.stringify(card) }),
  updateCard: (index: number, card: ICard) => request<ICard>(`/cards/${index}`, { method: "PUT", body: JSON.stringify(card) }),
  deleteCard: (index: number) => request<ICard>(`/cards/${index}`, { method: "DELETE" }),
  reorderCards: (cards: ICard[]) => request<{ success: boolean }>("/cards/reorder", { method: "PUT", body: JSON.stringify(cards) }),

  // Members
  getMembers: () => request<Member[]>("/members"),

  // Themes
  getThemes: () => request<Theme[]>("/themes"),
  createTheme: (theme: Theme) => request<Theme>("/themes", { method: "POST", body: JSON.stringify(theme) }),
  updateTheme: (uuid: string, theme: Theme) => request<Theme>(`/themes/${uuid}`, { method: "PUT", body: JSON.stringify(theme) }),
  deleteTheme: (uuid: string) => request<Theme>(`/themes/${uuid}`, { method: "DELETE" }),

  // Card Types
  getCardTypes: () => request<CardType[]>("/card-types"),
  createCardType: (ct: CardType) => request<CardType>("/card-types", { method: "POST", body: JSON.stringify(ct) }),
  updateCardType: (value: string, ct: CardType) => request<CardType>(`/card-types/${value}`, { method: "PUT", body: JSON.stringify(ct) }),
  deleteCardType: (value: string) => request<CardType>(`/card-types/${value}`, { method: "DELETE" }),

  // Upload
  uploadImage: async (file: Blob, path: string): Promise<{ success: boolean; url: string }> => {
    const formData = new FormData();
    formData.append("file", file, path.split("/").pop());
    formData.append("path", path);

    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
    return res.json();
  },
};
