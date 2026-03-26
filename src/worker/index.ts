import { Hono } from "hono";
import { cors } from "hono/cors";
import { cardRoutes } from "./routes/cards";
import { memberRoutes } from "./routes/members";
import { themeRoutes } from "./routes/themes";
import { cardTypeRoutes } from "./routes/card-types";
import { uploadRoutes } from "./routes/upload";
import type { Env } from "../types";

type HonoEnv = { Bindings: Env };

const app = new Hono<HonoEnv>();

app.use("/api/*", cors());

// 인증 미들웨어 (API 변경 요청만)
app.use("/api/*", async (c, next) => {
  if (c.req.method === "GET") return next();

  const token = c.req.header("Authorization")?.replace("Bearer ", "");
  if (token !== c.env.ADMIN_TOKEN) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  return next();
});

// API routes
app.route("/api/cards", cardRoutes);
app.route("/api/members", memberRoutes);
app.route("/api/themes", themeRoutes);
app.route("/api/card-types", cardTypeRoutes);
app.route("/api/upload", uploadRoutes);

// 공개 API: Next.js ISR에서 호출
app.get("/api/public/cardlist", async (c) => {
  const data = await c.env.CARDLIST_KV.get("cardlist", "json");
  if (!data) return c.json({ cards: [], members: [], themes: [], updatedAt: null });
  return c.json(data);
});

export default app;
