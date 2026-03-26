import { Hono } from "hono";
import type { Env } from "../../types";
import { getData } from "../kv";

type HonoEnv = { Bindings: Env };

export const memberRoutes = new Hono<HonoEnv>();

memberRoutes.get("/", async (c) => {
  const data = await getData(c.env.CARDLIST_KV);
  return c.json(data.members);
});
