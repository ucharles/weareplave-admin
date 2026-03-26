import { Hono } from "hono";
import type { Env, CardListData } from "../../types";
import { MEMBERS, THEMES } from "../../seed";

type HonoEnv = { Bindings: Env };

export const memberRoutes = new Hono<HonoEnv>();

memberRoutes.get("/", async (c) => {
  const data = await c.env.CARDLIST_KV.get("cardlist", "json") as CardListData | null;
  return c.json(data?.members ?? MEMBERS);
});
