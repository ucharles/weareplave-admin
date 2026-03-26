import { Hono } from "hono";
import type { Env, Theme } from "../../types";
import { getData, saveData } from "../kv";

type HonoEnv = { Bindings: Env };

export const themeRoutes = new Hono<HonoEnv>();

// 전체 테마 목록
themeRoutes.get("/", async (c) => {
  const data = await getData(c.env.CARDLIST_KV);
  return c.json(data.themes);
});

// 테마 추가
themeRoutes.post("/", async (c) => {
  const theme = await c.req.json<Theme>();
  if (!theme.uuid) theme.uuid = crypto.randomUUID();
  const data = await getData(c.env.CARDLIST_KV);
  data.themes.push(theme);
  await saveData(c.env.CARDLIST_KV, data, c.env);
  return c.json(theme, 201);
});

// 테마 수정 (uuid 기반)
themeRoutes.put("/:uuid", async (c) => {
  const uuid = c.req.param("uuid");
  const theme = await c.req.json<Theme>();
  const data = await getData(c.env.CARDLIST_KV);

  const index = data.themes.findIndex((t) => t.uuid === uuid);
  if (index === -1) return c.json({ error: "Theme not found" }, 404);

  data.themes[index] = { ...theme, uuid };
  await saveData(c.env.CARDLIST_KV, data, c.env);
  return c.json(data.themes[index]);
});

// 테마 삭제
themeRoutes.delete("/:uuid", async (c) => {
  const uuid = c.req.param("uuid");
  const data = await getData(c.env.CARDLIST_KV);

  const index = data.themes.findIndex((t) => t.uuid === uuid);
  if (index === -1) return c.json({ error: "Theme not found" }, 404);

  // 사용 중인 테마인지 확인
  const inUse = data.cards.some((card) => card.theme.uuid === uuid);
  if (inUse) return c.json({ error: "이 테마를 사용하는 카드가 있어 삭제할 수 없습니다" }, 400);

  const [removed] = data.themes.splice(index, 1);
  await saveData(c.env.CARDLIST_KV, data, c.env);
  return c.json(removed);
});
