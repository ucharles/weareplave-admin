import { Hono } from "hono";
import type { Env, ICard } from "../../types";
import { getData, saveData } from "../kv";

type HonoEnv = { Bindings: Env };

export const cardRoutes = new Hono<HonoEnv>();

// 전체 카드 목록
cardRoutes.get("/", async (c) => {
  const data = await getData(c.env.CARDLIST_KV);
  return c.json(data.cards);
});

// 카드 추가
cardRoutes.post("/", async (c) => {
  const card = await c.req.json<ICard>();
  const data = await getData(c.env.CARDLIST_KV);
  data.cards.unshift(card);
  await saveData(c.env.CARDLIST_KV, data, c.env);
  return c.json(card, 201);
});

// 카드 순서 변경 (전체 배열 덮어쓰기) — /:index보다 먼저 선언
cardRoutes.put("/reorder", async (c) => {
  const cards = await c.req.json<ICard[]>();
  const data = await getData(c.env.CARDLIST_KV);
  data.cards = cards;
  await saveData(c.env.CARDLIST_KV, data, c.env);
  return c.json({ success: true });
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
