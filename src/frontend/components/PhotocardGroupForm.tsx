import React, { useState, useRef } from "react";
import type { PhotocardGroup, PhotocardItem, Member } from "../../types";
import { useDragReorder } from "../hooks/useDragReorder";
import { api } from "../api";
import { applyWatermark } from "../watermark";
import { ImagePreview } from "./ImagePreview";

interface Props {
  group: PhotocardGroup;
  index: number;
  members: Member[];
  pathPrefix: string;
  onChange: (group: PhotocardGroup) => void;
  onRemove: () => void;
}

export function PhotocardGroupForm({ group, index, members, pathPrefix, onChange, onRemove }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [uploading, setUploading] = useState<Record<string, string>>({});
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState("");
  const bulkRef = useRef<HTMLInputElement>(null);

  const { dragHandlers: itemDragHandlers, getDragStyle: getItemDragStyle } = useDragReorder(
    group.items,
    (reordered) => onChange({ ...group, items: reordered }),
  );

  const updateItem = (itemIndex: number, item: PhotocardItem) => {
    const next = [...group.items];
    next[itemIndex] = item;
    onChange({ ...group, items: next });
  };

  const addItem = () => {
    onChange({
      ...group,
      items: [...group.items, { uuid: crypto.randomUUID(), image: "" }],
    });
  };

  const addMemberSet = () => {
    const memberOrder = ["YEJUN", "NOAH", "BAMBY", "EUNHO", "HAMIN"];
    const newItems = memberOrder.map((en) => {
      const member = members.find((m) => m.en === en);
      return {
        uuid: crypto.randomUUID(),
        member: member?.uuid,
        image: "",
      };
    });
    onChange({ ...group, items: [...group.items, ...newItems] });
  };

  const removeItem = (itemIndex: number) => {
    onChange({ ...group, items: group.items.filter((_, i) => i !== itemIndex) });
  };

  const handleFileUpload = async (itemIndex: number, file: File, field: "image" | "backImage") => {
    const item = group.items[itemIndex];
    const key = `${itemIndex}-${field}`;

    setUploading((prev) => ({ ...prev, [key]: "워터마크 적용 중..." }));
    try {
      const blob = await applyWatermark(file);
      setUploading((prev) => ({ ...prev, [key]: "업로드 중..." }));

      const filename = file.name.replace(/\.[^.]+$/, ".webp");
      const prefix = pathPrefix.endsWith("/") ? pathPrefix : pathPrefix + "/";
      const suffix = field === "backImage" ? "_back" : "";
      const path = `${prefix}${filename.replace(".webp", `${suffix}.webp`)}`;

      const result = await api.uploadImage(blob, path);
      updateItem(itemIndex, { ...item, [field]: result.url });
    } catch (e) {
      alert(e instanceof Error ? e.message : "업로드 실패");
    } finally {
      setUploading((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // 벌크 업로드: 여러 파일 선택 → 워터마크 → S3 업로드 → 아이템 자동 생성
  const handleBulkUpload = async (files: FileList) => {
    setBulkUploading(true);
    const fileArray = Array.from(files);
    const newItems: PhotocardItem[] = [];
    const prefix = pathPrefix.endsWith("/") ? pathPrefix : pathPrefix + "/";

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setBulkProgress(`(${i + 1}/${fileArray.length}) ${file.name}`);

      try {
        const blob = await applyWatermark(file);
        const filename = file.name.replace(/\.[^.]+$/, ".webp");
        const path = `${prefix}${filename}`;
        const result = await api.uploadImage(blob, path);

        newItems.push({
          uuid: crypto.randomUUID(),
          image: result.url,
          alias: file.name.replace(/\.[^.]+$/, ""),
        });
      } catch (e) {
        console.error(`Failed: ${file.name}`, e);
      }
    }

    onChange({ ...group, items: [...group.items, ...newItems] });
    setBulkUploading(false);
    setBulkProgress("");
  };

  return (
    <>
    <ImagePreview src={previewSrc} onClose={() => setPreviewSrc(null)} />
    <div style={styles.groupCard}>
      <div style={styles.groupHeader}>
        <span style={styles.dragHandle}>⠿</span>
        <button type="button" onClick={() => setCollapsed(!collapsed)} style={styles.collapseBtn}>
          {collapsed ? "▶" : "▼"}
        </button>
        <input
          value={group.infoName}
          onChange={(e) => onChange({ ...group, infoName: e.target.value })}
          placeholder="그룹 이름 (예: Photocard A)"
          style={styles.groupNameInput}
        />
        <span style={styles.itemCount}>{group.items.length}장</span>
        <button type="button" onClick={onRemove} style={styles.removeBtn}>삭제</button>
      </div>

      {!collapsed && (
        <div style={styles.itemsArea}>
          {group.items.map((item, i) => (
            <div
              key={item.uuid}
              style={{ ...styles.itemRow, ...getItemDragStyle(i) }}
              {...itemDragHandlers(i)}
            >
              <div style={styles.itemFields}>
                <span style={styles.itemDragHandle}>⠿</span>
                <select
                  value={Array.isArray(item.member) ? item.member[0] ?? "" : item.member ?? ""}
                  onChange={(e) => updateItem(i, { ...item, member: e.target.value || undefined })}
                  style={styles.memberSelect}
                >
                  <option value="">멤버 없음</option>
                  {members.map((m) => (
                    <option key={m.uuid} value={m.uuid}>{m.ko}</option>
                  ))}
                </select>
                <input
                  value={item.alias ?? ""}
                  onChange={(e) => updateItem(i, { ...item, alias: e.target.value || undefined })}
                  placeholder="별칭"
                  style={styles.aliasInput}
                />
                <button type="button" onClick={() => removeItem(i)} style={styles.removeItemBtn}>✕</button>
              </div>

              {/* 앞면 이미지 */}
              <div style={styles.imageRow}>
                <span style={styles.imageLabel}>앞면</span>
                <input
                  value={item.image}
                  onChange={(e) => updateItem(i, { ...item, image: e.target.value })}
                  placeholder="이미지 URL"
                  style={styles.imageInput}
                />
                <FileUploadBtn
                  onFile={(f) => handleFileUpload(i, f, "image")}
                  uploading={uploading[`${i}-image`]}
                />
                {item.image && <img src={item.image} alt="" style={styles.thumbnail} loading="lazy" onClick={() => setPreviewSrc(item.image)} />}
              </div>

              {/* 뒷면 이미지 */}
              <div style={styles.imageRow}>
                <span style={styles.imageLabel}>뒷면</span>
                <input
                  value={item.backImage ?? ""}
                  onChange={(e) => updateItem(i, { ...item, backImage: e.target.value || undefined })}
                  placeholder="뒷면 URL (선택)"
                  style={styles.imageInput}
                />
                <FileUploadBtn
                  onFile={(f) => handleFileUpload(i, f, "backImage")}
                  uploading={uploading[`${i}-backImage`]}
                />
                {item.backImage && <img src={item.backImage} alt="" style={styles.thumbnail} loading="lazy" onClick={() => setPreviewSrc(item.backImage!)} />}
              </div>
            </div>
          ))}

          <div style={styles.bottomActions}>
            <button type="button" onClick={addItem} style={styles.addItemBtn}>+ 포토카드 추가</button>
            <button type="button" onClick={addMemberSet} style={styles.memberSetBtn}>+ 5멤버 세트</button>
            <button
              type="button"
              onClick={() => bulkRef.current?.click()}
              disabled={bulkUploading}
              style={styles.bulkBtn}
            >
              {bulkUploading ? bulkProgress : "벌크 업로드"}
            </button>
            <input
              ref={bulkRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={(e) => {
                if (e.target.files?.length) handleBulkUpload(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      )}
    </div>
    </>
  );
}

function FileUploadBtn({ onFile, uploading }: { onFile: (f: File) => void; uploading?: string }) {
  const ref = useRef<HTMLInputElement>(null);

  if (uploading) {
    return <span style={{ fontSize: 11, color: "#2563eb", whiteSpace: "nowrap" }}>{uploading}</span>;
  }

  return (
    <>
      <button type="button" onClick={() => ref.current?.click()} style={styles.fileBtn}>파일</button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  groupCard: { border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, marginBottom: 12, background: "#fafafa" },
  groupHeader: { display: "flex", alignItems: "center", gap: 8 },
  dragHandle: { fontSize: 16, color: "#aaa", cursor: "grab", userSelect: "none" as const },
  collapseBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 12, padding: "4px 8px" },
  groupNameInput: { flex: 1, padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 },
  itemCount: { fontSize: 12, color: "#888", whiteSpace: "nowrap" as const },
  removeBtn: { padding: "4px 12px", border: "1px solid #dc2626", borderRadius: 4, background: "#fff", color: "#dc2626", cursor: "pointer", fontSize: 12 },
  itemsArea: { marginTop: 12, display: "flex", flexDirection: "column" as const, gap: 8 },
  itemRow: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: 10, display: "flex", flexDirection: "column" as const, gap: 8, cursor: "grab", transition: "border 0.1s" },
  itemFields: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const },
  itemDragHandle: { fontSize: 14, color: "#bbb", cursor: "grab", userSelect: "none" as const },
  memberSelect: { padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, width: 100 },
  aliasInput: { padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, width: 140 },
  imageRow: { display: "flex", alignItems: "center", gap: 8 },
  imageLabel: { fontSize: 11, color: "#888", width: 30, flexShrink: 0 },
  imageInput: { padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, flex: 1, minWidth: 200 },
  fileBtn: { padding: "3px 10px", border: "1px solid #6b7280", borderRadius: 4, background: "#fff", color: "#374151", cursor: "pointer", fontSize: 12, whiteSpace: "nowrap" as const },
  thumbnail: { width: 72, height: 72, objectFit: "cover" as const, borderRadius: 4, background: "#f0f0f0", flexShrink: 0, cursor: "pointer" },
  removeItemBtn: { marginLeft: "auto", background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 16, padding: "2px 6px" },
  bottomActions: { display: "flex", gap: 8, alignItems: "center" },
  addItemBtn: { padding: "6px 14px", border: "1px dashed #aaa", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 13, color: "#666" },
  memberSetBtn: { padding: "6px 14px", border: "1px solid #7c3aed", borderRadius: 6, background: "#f5f3ff", color: "#7c3aed", cursor: "pointer", fontSize: 13, fontWeight: 500 },
  bulkBtn: { padding: "6px 14px", border: "1px solid #059669", borderRadius: 6, background: "#ecfdf5", color: "#059669", cursor: "pointer", fontSize: 13, fontWeight: 500 },
};
