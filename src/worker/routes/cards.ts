import { Hono } from "hono";
import type { Env, CardListData, ICard } from "../../types";
import { MEMBERS, THEMES } from "../../seed";

type HonoEnv = { Bindings: Env };

export const cardRoutes = new Hono<HonoEnv>();

async function getData(kv: KVNamespace): Promise<CardListData> {
  const data = await kv.get("cardlist", "json") as CardListData | null;
  return data ?? {
    cards: [],
    members: MEMBERS,
    themes: THEMES,
    updatedAt: new Date().toISOString(),
  };
}

async function saveData(kv: KVNamespace, data: CardListData, env: Env) {
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

// 전체 카드 목록
cardRoutes.get("/", async (c) => {
  const data = await getData(c.env.CARDLIST_KV);
  return c.json(data.cards);
});

// 카드 추가
cardRoutes.post("/", async (c) => {
  const card = await c.req.json<ICard>();
  const data = await getData(c.env.CARDLIST_KV);
  data.cards.push(card);
  await saveData(c.env.CARDLIST_KV, data, c.env);
  return c.json(card, 201);
});

// 카드 수정 (index 기반)
cardRoutes.put("/:index", async (c) => {
  const index = parseInt(c.req.param("index"));
  const card = await c.req.json<ICard>();
  const data = await getData(c.env.CARDLIST_KV);

  if (index < 0 || index >= data.cards.length) {
    return c.json({ error: "Card not found" }, 404);
  }

  data.cards[index] = card;
  await saveData(c.env.CARDLIST_KV, data, c.env);
  return c.json(card);
});

// 카드 삭제
cardRoutes.delete("/:index", async (c) => {
  const index = parseInt(c.req.param("index"));
  const data = await getData(c.env.CARDLIST_KV);

  if (index < 0 || index >= data.cards.length) {
    return c.json({ error: "Card not found" }, 404);
  }

  const [removed] = data.cards.splice(index, 1);
  await saveData(c.env.CARDLIST_KV, data, c.env);
  return c.json(removed);
});

// 카드 순서 변경
cardRoutes.put("/reorder", async (c) => {
  const { fromIndex, toIndex } = await c.req.json<{ fromIndex: number; toIndex: number }>();
  const data = await getData(c.env.CARDLIST_KV);

  const [card] = data.cards.splice(fromIndex, 1);
  data.cards.splice(toIndex, 0, card);
  await saveData(c.env.CARDLIST_KV, data, c.env);
  return c.json({ success: true });
});
