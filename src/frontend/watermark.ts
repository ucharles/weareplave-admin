/**
 * 브라우저 Canvas에서 워터마크를 적용하고 WebP Blob으로 반환
 * 기존 scripts/watermark.mjs의 패턴을 Canvas로 재현
 */
const MAX_WIDTH = 220;

export async function applyWatermark(file: File): Promise<Blob> {
  const img = await loadImage(file);

  // 가로 220px 초과 시 비율 유지하며 리사이즈
  let width = img.width;
  let height = img.height;
  if (width > MAX_WIDTH) {
    height = Math.round(height * (MAX_WIDTH / width));
    width = MAX_WIDTH;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // 리사이즈된 이미지 그리기
  ctx.drawImage(img, 0, 0, width, height);

  // 워터마크 설정
  const fontSize = width >= 200 ? 20 : 16;
  const lineHeight = fontSize * 3.5;
  const text = "weareplave";

  ctx.save();
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.fillStyle = "rgba(0, 0, 0, 0.20)";

  const rows = Math.ceil(height / lineHeight) + 4;
  const cols = 3;

  for (let row = -2; row < rows; row++) {
    for (let col = -1; col < cols; col++) {
      const x = col * (width / cols) + (row % 2) * 30;
      const y = row * lineHeight;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((-30 * Math.PI) / 180);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  }

  ctx.restore();

  // WebP Blob으로 변환
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas to blob failed"));
      },
      "image/webp",
      0.8,
    );
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
