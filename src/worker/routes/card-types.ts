import { Hono } from "hono";
import type { Env, CardType } from "../../types";
import { getData, saveData } from "../kv";

type HonoEnv = { Bindings: Env };

export const cardTypeRoutes = new Hono<HonoEnv>();

// 전체 카드 타입 목록
cardTypeRoutes.get("/", async (c) => {
  const data = await getData(c.env.CARDLIST_KV);
  return c.json(data.cardTypes);
});

// 카드 타입 추가
cardTypeRoutes.post("/", async (c) => {
  const cardType = await c.req.json<CardType>();
  const data = await getData(c.env.CARDLIST_KV);

  if (data.cardTypes.some((t) => t.value === cardType.value)) {
    return c.json({ error: "이미 존재하는 값입니다" }, 400);
  }

  data.cardTypes.push(cardType);
  await saveData(c.env.CARDLIST_KV, data, c.env);
  return c.json(cardType, 201);
});

// 카드 타입 수정 (value 기반)
cardTypeRoutes.put("/:value", async (c) => {
  const value = c.req.param("value");
  const cardType = await c.req.json<CardType>();
  const data = await getData(c.env.CARDLIST_KV);

  const index = data.cardTypes.findIndex((t) => t.value === value);
  if (index === -1) return c.json({ error: "Card type not found" }, 404);

  data.cardTypes[index] = cardType;
  await saveData(c.env.CARDLIST_KV, data, c.env);
  return c.json(cardType);
});

// 카드 타입 삭제
cardTypeRoutes.delete("/:value", async (c) => {
  const value = c.req.param("value");
  const data = await getData(c.env.CARDLIST_KV);

  const index = data.cardTypes.findIndex((t) => t.value === value);
  if (index === -1) return c.json({ error: "Card type not found" }, 404);

  const inUse = data.cards.some((card) => card.type === value);
  if (inUse) return c.json({ error: "이 타입을 사용하는 카드가 있어 삭제할 수 없습니다" }, 400);

  const [removed] = data.cardTypes.splice(index, 1);
  await saveData(c.env.CARDLIST_KV, data, c.env);
  return c.json(removed);
});
