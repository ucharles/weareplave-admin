import React, { useState, useRef } from "react";
import { api } from "../api";
import { applyWatermark } from "../watermark";

interface Props {
  /** S3 경로 프리픽스 (예: "photocards/collab/gs25/") */
  pathPrefix: string;
  onUploaded: (url: string) => void;
}

interface UploadItem {
  file: File;
  preview: string;
  watermarked?: string;
  status: "pending" | "watermarking" | "uploading" | "done" | "error";
  url?: string;
  error?: string;
  filename: string;
}

export function ImageUploader({ pathPrefix, onUploaded }: Props) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [enableWatermark, setEnableWatermark] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const newItems: UploadItem[] = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      status: "pending" as const,
      filename: file.name.replace(/\.[^.]+$/, ".webp"),
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  const updateItem = (index: number, update: Partial<UploadItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...update } : item)));
  };

  const uploadAll = async () => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.status === "done") continue;

      try {
        let blob: Blob;

        if (enableWatermark) {
          updateItem(i, { status: "watermarking" });
          blob = await applyWatermark(item.file);
          updateItem(i, { watermarked: URL.createObjectURL(blob) });
        } else {
          // 워터마크 없이 원본을 WebP로 변환
          blob = await convertToWebp(item.file);
        }

        updateItem(i, { status: "uploading" });

        const prefix = pathPrefix.endsWith("/") ? pathPrefix : pathPrefix + "/";
        const path = `${prefix}${item.filename}`;

        const result = await api.uploadImage(blob, path);
        updateItem(i, { status: "done", url: result.url });
        onUploaded(result.url);
      } catch (e) {
        updateItem(i, { status: "error", error: e instanceof Error ? e.message : "업로드 실패" });
      }
    }
  };

  const removeItem = (index: number) => {
    setItems((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      if (prev[index].watermarked) URL.revokeObjectURL(prev[index].watermarked!);
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.controls}>
        <button type="button" onClick={() => inputRef.current?.click()} style={styles.selectBtn}>
          이미지 선택
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          style={{ display: "none" }}
        />
        <label style={styles.checkLabel}>
          <input
            type="checkbox"
            checked={enableWatermark}
            onChange={(e) => setEnableWatermark(e.target.checked)}
          />
          워터마크 적용
        </label>
        {items.some((item) => item.status !== "done") && (
          <button type="button" onClick={uploadAll} style={styles.uploadBtn}>
            업로드 ({items.filter((i) => i.status !== "done").length})
          </button>
        )}
      </div>

      <div style={styles.pathInfo}>
        S3 경로: <code>{pathPrefix}</code>
      </div>

      {items.length > 0 && (
        <div style={styles.grid}>
          {items.map((item, i) => (
            <div key={i} style={styles.item}>
              <img
                src={item.watermarked ?? item.preview}
                alt={item.filename}
                style={styles.thumb}
              />
              <div style={styles.itemInfo}>
                <input
                  value={item.filename}
                  onChange={(e) => updateItem(i, { filename: e.target.value })}
                  style={styles.filenameInput}
                  disabled={item.status === "done"}
                />
                <div style={styles.statusRow}>
                  <span style={{
                    ...styles.status,
                    color: item.status === "done" ? "#16a34a"
                      : item.status === "error" ? "#dc2626"
                      : "#666",
                  }}>
                    {item.status === "pending" && "대기"}
                    {item.status === "watermarking" && "워터마크 적용 중..."}
                    {item.status === "uploading" && "업로드 중..."}
                    {item.status === "done" && "완료"}
                    {item.status === "error" && item.error}
                  </span>
                  {item.url && (
                    <button
                      type="button"
                      onClick={() => { navigator.clipboard.writeText(item.url!); }}
                      style={styles.copyBtn}
                    >
                      URL 복사
                    </button>
                  )}
                  <button type="button" onClick={() => removeItem(i)} style={styles.removeBtn}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

async function convertToWebp(file: File): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => { URL.revokeObjectURL(i.src); resolve(i); };
    i.onerror = reject;
    i.src = URL.createObjectURL(file);
  });

  let width = img.width;
  let height = img.height;
  if (width > 220) {
    height = Math.round(height * (220 / width));
    width = 220;
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("Conversion failed")),
      "image/webp",
      0.8,
    );
  });
}

const styles: Record<string, React.CSSProperties> = {
  container: { border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, background: "#fafafa", marginBottom: 16 },
  controls: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  selectBtn: { padding: "6px 14px", border: "1px solid #2563eb", borderRadius: 6, background: "#eff6ff", color: "#2563eb", cursor: "pointer", fontSize: 13, fontWeight: 500 },
  uploadBtn: { padding: "6px 14px", border: "none", borderRadius: 6, background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500 },
  checkLabel: { display: "flex", alignItems: "center", gap: 4, fontSize: 13, cursor: "pointer" },
  pathInfo: { fontSize: 12, color: "#888", marginBottom: 12 },
  grid: { display: "flex", flexDirection: "column" as const, gap: 8 },
  item: { display: "flex", gap: 12, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: 10 },
  thumb: { width: 64, height: 64, objectFit: "cover" as const, borderRadius: 4, flexShrink: 0 },
  itemInfo: { flex: 1, display: "flex", flexDirection: "column" as const, gap: 4 },
  filenameInput: { padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, fontFamily: "monospace" },
  statusRow: { display: "flex", alignItems: "center", gap: 8 },
  status: { fontSize: 12 },
  copyBtn: { padding: "2px 8px", border: "1px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 11 },
  removeBtn: { marginLeft: "auto", background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 14 },
};
