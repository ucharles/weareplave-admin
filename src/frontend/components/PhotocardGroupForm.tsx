import React, { useState, useRef } from "react";
import type { PhotocardGroup, PhotocardItem, Member } from "../../types";
import { useDragReorder } from "../hooks/useDragReorder";
import { api } from "../api";
import { applyWatermark, convertToWebp } from "../watermark";
import { ImagePreview } from "./ImagePreview";

interface Props {
  group: PhotocardGroup;
  index: number;
  members: Member[];
  pathPrefix: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onChange: (group: PhotocardGroup) => void;
  onRemove: () => void;
}

export function PhotocardGroupForm({ group, index, members, pathPrefix, collapsed, onToggleCollapse, onChange, onRemove }: Props) {
  const [uploading, setUploading] = useState<Record<string, string>>({});
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState("");
  const [enableWatermark, setEnableWatermark] = useState(false);
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

  const buildFilename = (item: PhotocardItem, field?: "image" | "backImage") => {
    const groupPart = group.infoName.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") || "group";
    const memberUuid = typeof item.member === "string" ? item.member : undefined;
    const member = memberUuid ? members.find((m) => m.uuid === memberUuid) : undefined;
    const memberPart = member ? `_${member.en.toLowerCase()}` : "";
    const hash = crypto.randomUUID().slice(0, 6);
    const suffix = field === "backImage" ? "_back" : "";
    return `${groupPart}${memberPart}_${hash}${suffix}.webp`;
  };

  const handleFileUpload = async (itemIndex: number, file: File, field: "image" | "backImage") => {
    const item = group.items[itemIndex];
    const key = `${itemIndex}-${field}`;

    setUploading((prev) => ({ ...prev, [key]: enableWatermark ? "워터마크 적용 중..." : "변환 중..." }));
    try {
      const blob = enableWatermark ? await applyWatermark(file) : await convertToWebp(file);
      setUploading((prev) => ({ ...prev, [key]: "업로드 중..." }));

      const prefix = pathPrefix.endsWith("/") ? pathPrefix : pathPrefix + "/";
      const filename = buildFilename(item, field);
      const path = `${prefix}${filename}`;

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
        const blob = enableWatermark ? await applyWatermark(file) : await convertToWebp(file);
        const groupPart = group.infoName.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") || "group";
        const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
        const filename = `${groupPart}_${hash}.webp`;
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
        <button type="button" onClick={onToggleCollapse} style={styles.collapseBtn}>
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
                <MemberSelect
                  value={item.member}
                  members={members}
                  onChange={(v) => updateItem(i, { ...item, member: v })}
                />
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
            <label style={styles.checkLabel}>
              <input
                type="checkbox"
                checked={enableWatermark}
                onChange={(e) => setEnableWatermark(e.target.checked)}
              />
              워터마크 적용
            </label>
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

function MemberSelect({ value, members, onChange }: {
  value?: string | string[];
  members: Member[];
  onChange: (v: string | string[] | undefined) => void;
}) {
  // 현재 모드 판별: none / solo / unit / group
  const currentMode = !value ? "none"
    : typeof value === "string" ? "solo"
    : value.length === 5 ? "group"
    : "unit";

  const soloValue = typeof value === "string" ? value : "";
  const unitValues = Array.isArray(value) && value.length < 5 ? value : [];

  const handleModeChange = (mode: string) => {
    if (mode === "none") onChange(undefined);
    else if (mode === "solo") onChange(members[0]?.uuid ?? "");
    else if (mode === "group") onChange(members.map((m) => m.uuid));
    else if (mode === "unit") onChange([]);
  };

  const toggleUnit = (uuid: string) => {
    const current = Array.isArray(value) ? value : [];
    if (current.includes(uuid)) {
      const next = current.filter((v) => v !== uuid);
      onChange(next.length === 0 ? undefined : next);
    } else {
      onChange([...current, uuid]);
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <select
        value={currentMode}
        onChange={(e) => handleModeChange(e.target.value)}
        style={styles.memberSelect}
      >
        <option value="none">멤버 없음</option>
        <option value="solo">솔로</option>
        <option value="unit">유닛</option>
        <option value="group">그룹 (5명)</option>
      </select>

      {currentMode === "solo" && (
        <select
          value={soloValue}
          onChange={(e) => onChange(e.target.value)}
          style={styles.memberSelect}
        >
          {members.map((m) => (
            <option key={m.uuid} value={m.uuid}>{m.ko}</option>
          ))}
        </select>
      )}

      {currentMode === "unit" && (
        <div style={{ display: "flex", gap: 4 }}>
          {members.map((m) => (
            <button
              key={m.uuid}
              type="button"
              onClick={() => toggleUnit(m.uuid)}
              style={{
                padding: "2px 8px",
                border: "1px solid",
                borderColor: unitValues.includes(m.uuid) ? "#2563eb" : "#d1d5db",
                borderRadius: 4,
                background: unitValues.includes(m.uuid) ? "#eff6ff" : "#fff",
                color: unitValues.includes(m.uuid) ? "#2563eb" : "#666",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: unitValues.includes(m.uuid) ? 600 : 400,
              }}
            >
              {m.ko}
            </button>
          ))}
        </div>
      )}
    </div>
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
  checkLabel: { display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#374151", cursor: "pointer", userSelect: "none" as const },
  addItemBtn: { padding: "6px 14px", border: "1px dashed #aaa", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 13, color: "#666" },
  memberSetBtn: { padding: "6px 14px", border: "1px solid #7c3aed", borderRadius: 6, background: "#f5f3ff", color: "#7c3aed", cursor: "pointer", fontSize: 13, fontWeight: 500 },
  bulkBtn: { padding: "6px 14px", border: "1px solid #059669", borderRadius: 6, background: "#ecfdf5", color: "#059669", cursor: "pointer", fontSize: 13, fontWeight: 500 },
};
