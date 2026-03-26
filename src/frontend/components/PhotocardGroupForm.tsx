import React, { useState } from "react";
import type { PhotocardGroup, PhotocardItem, Member } from "../../types";

interface Props {
  group: PhotocardGroup;
  index: number;
  members: Member[];
  onChange: (group: PhotocardGroup) => void;
  onRemove: () => void;
}

export function PhotocardGroupForm({ group, index, members, onChange, onRemove }: Props) {
  const [collapsed, setCollapsed] = useState(false);

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

  const removeItem = (itemIndex: number) => {
    onChange({ ...group, items: group.items.filter((_, i) => i !== itemIndex) });
  };

  return (
    <div style={styles.groupCard}>
      <div style={styles.groupHeader}>
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
            <div key={item.uuid} style={styles.itemRow}>
              <div style={styles.itemFields}>
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
                <input
                  value={item.image}
                  onChange={(e) => updateItem(i, { ...item, image: e.target.value })}
                  placeholder="이미지 URL"
                  style={styles.imageInput}
                />
                {item.image && (
                  <img src={item.image} alt="" style={styles.thumbnail} loading="lazy" />
                )}
                <button type="button" onClick={() => removeItem(i)} style={styles.removeItemBtn}>✕</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addItem} style={styles.addItemBtn}>+ 포토카드 추가</button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  groupCard: { border: "1px solid #e5e7eb", borderRadius: 8, padding: 16, marginBottom: 12, background: "#fafafa" },
  groupHeader: { display: "flex", alignItems: "center", gap: 8 },
  collapseBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 12, padding: "4px 8px" },
  groupNameInput: { flex: 1, padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 },
  itemCount: { fontSize: 12, color: "#888", whiteSpace: "nowrap" as const },
  removeBtn: { padding: "4px 12px", border: "1px solid #dc2626", borderRadius: 4, background: "#fff", color: "#dc2626", cursor: "pointer", fontSize: 12 },
  itemsArea: { marginTop: 12, display: "flex", flexDirection: "column" as const, gap: 8 },
  itemRow: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, padding: 10 },
  itemFields: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const },
  memberSelect: { padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, width: 100 },
  aliasInput: { padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, width: 140 },
  imageInput: { padding: "4px 8px", border: "1px solid #d1d5db", borderRadius: 4, fontSize: 13, flex: 1, minWidth: 200 },
  thumbnail: { width: 36, height: 36, objectFit: "cover" as const, borderRadius: 4, background: "#f0f0f0" },
  removeItemBtn: { background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 16, padding: "2px 6px" },
  addItemBtn: { padding: "6px 14px", border: "1px dashed #aaa", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 13, color: "#666", alignSelf: "flex-start" },
};
