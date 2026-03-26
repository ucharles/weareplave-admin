import type { Env, CardListData } from "../types";
import { MEMBERS, THEMES, CARD_TYPES } from "../seed";

export async function getData(kv: KVNamespace): Promise<CardListData> {
  const data = await kv.get("cardlist", "json") as CardListData | null;
  return data ?? {
    cards: [],
    members: MEMBERS,
    themes: THEMES,
    cardTypes: CARD_TYPES,
    updatedAt: new Date().toISOString(),
  };
}

export async function saveData(kv: KVNamespace, data: CardListData, env: Env) {
  data.updatedAt = new Date().toISOString();
  await kv.put("cardlist", JSON.stringify(data));

  // Next.js ISR 캐시 무효화
  try {
    await fetch(env.REVALIDATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: env.REVALIDATE_SECRET }),
    });
  } catch {
    // revalidation 실패해도 저장은 유지
  }
}
