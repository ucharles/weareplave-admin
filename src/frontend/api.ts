import type { ICard, Member, Theme } from "../types";

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
  getCards: () => request<ICard[]>("/cards"),
  createCard: (card: ICard) => request<ICard>("/cards", { method: "POST", body: JSON.stringify(card) }),
  updateCard: (index: number, card: ICard) => request<ICard>(`/cards/${index}`, { method: "PUT", body: JSON.stringify(card) }),
  deleteCard: (index: number) => request<ICard>(`/cards/${index}`, { method: "DELETE" }),
  getMembers: () => request<Member[]>("/members"),
  getThemes: () => request<Theme[]>("/themes"),
};
