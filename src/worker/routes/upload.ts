import { Hono } from "hono";
import { AwsClient } from "aws4fetch";
import type { Env } from "../../types";

type HonoEnv = { Bindings: Env };

export const uploadRoutes = new Hono<HonoEnv>();

uploadRoutes.post("/", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File | null;
  const path = formData.get("path") as string | null;

  if (!file || !path) {
    return c.json({ error: "file과 path가 필요합니다" }, 400);
  }

  // 허용 확장자 확인
  if (!path.endsWith(".webp") && !path.endsWith(".png") && !path.endsWith(".jpg")) {
    return c.json({ error: "webp, png, jpg만 허용됩니다" }, 400);
  }

  const bucket = c.env.AWS_S3_BUCKET;
  const region = c.env.AWS_S3_REGION;

  const aws = new AwsClient({
    accessKeyId: c.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: c.env.AWS_SECRET_ACCESS_KEY,
    region,
    service: "s3",
  });

  const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${path}`;

  const arrayBuffer = await file.arrayBuffer();

  const res = await aws.fetch(s3Url, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "image/webp",
      "Content-Length": arrayBuffer.byteLength.toString(),
    },
    body: arrayBuffer,
  });

  if (!res.ok) {
    const text = await res.text();
    return c.json({ error: `S3 upload failed: ${res.status}`, detail: text }, 500);
  }

  const cdnUrl = `https://cdn.weareplave.com/${path}`;

  return c.json({
    success: true,
    url: cdnUrl,
    s3Url,
    size: arrayBuffer.byteLength,
  });
});
