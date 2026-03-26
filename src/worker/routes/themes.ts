import { Hono } from "hono";
import type { Env, CardListData } from "../../types";
import { THEMES } from "../../seed";

type HonoEnv = { Bindings: Env };

export const themeRoutes = new Hono<HonoEnv>();

themeRoutes.get("/", async (c) => {
  const data = await c.env.CARDLIST_KV.get("cardlist", "json") as CardListData | null;
  return c.json(data?.themes ?? THEMES);
});
