import React, { useState } from "react";
import type { ICard, Member, Theme, CardType, PhotocardGroup } from "../../types";
import { PhotocardGroupForm } from "./PhotocardGroupForm";
import { useDragReorder } from "../hooks/useDragReorder";

interface Props {
  card?: ICard;
  members: Member[];
  themes: Theme[];
  cardTypes: CardType[];
  onSave: (card: ICard) => void;
  onCancel: () => void;
}

function newCard(): ICard {
  return {
    type: "album",
    theme: { en: "", ko: "", uuid: "" },
    name: "",
    photocards: [],
  };
}

export function CardForm({ card, members, themes, cardTypes, onSave, onCancel }: Props) {
  const [form, setForm] = useState<ICard>(card ? structuredClone(card) : newCard());
  const [collapsedMap, setCollapsedMap] = useState<Record<number, boolean>>({});
  const isCollapsed = (i: number) => collapsedMap[i] ?? true;
  const toggleCollapse = (i: number) => setCollapsedMap((prev) => ({ ...prev, [i]: !isCollapsed(i) }));
  const expandAll = () => {
    const next: Record<number, boolean> = {};
    form.photocards.forEach((_, i) => { next[i] = false; });
    setCollapsedMap(next);
  };
  const collapseAll = () => {
    const next: Record<number, boolean> = {};
    form.photocards.forEach((_, i) => { next[i] = true; });
    setCollapsedMap(next);
  };

  const [pathPrefix, setPathPrefix] = useState(
    card ? `photocards/${card.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : "photocards/"
  );

  const handleThemeChange = (uuid: string) => {
    const t = themes.find((th) => th.uuid === uuid);
    if (t) setForm({ ...form, theme: { en: t.en, ko: t.ko, uuid: t.uuid } });
  };

  const updateGroup = (index: number, group: PhotocardGroup) => {
    const next = [...form.photocards];
    next[index] = group;
    setForm({ ...form, photocards: next });
  };

  const addGroup = () => {
    setForm({
      ...form,
      photocards: [...form.photocards, { info: crypto.randomUUID(), infoName: "", items: [] }],
    });
  };

  const removeGroup = (index: number) => {
    setForm({ ...form, photocards: form.photocards.filter((_, i) => i !== index) });
  };

  const { dragHandlers: groupDragHandlers, getDragStyle: getGroupDragStyle } = useDragReorder(
    form.photocards,
    (reordered) => setForm({ ...form, photocards: reordered }),
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.theme.uuid) {
      alert("이름과 테마를 입력해주세요");
      return;
    }
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.formHeader}>
        <h2>{card ? "카드 수정" : "새 카드 추가"}</h2>
        <button type="button" onClick={onCancel} style={styles.cancelBtn}>취소</button>
      </div>

      <div style={styles.row}>
        <label style={styles.label}>
          타입
          <select
            value={form.type ?? "album"}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            style={styles.select}
          >
            {cardTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          테마
          <select
            value={form.theme.uuid}
            onChange={(e) => handleThemeChange(e.target.value)}
            style={styles.select}
          >
            <option value="">테마 선택...</option>
            {themes.map((t) => (
              <option key={t.uuid} value={t.uuid}>{t.ko || t.en}</option>
            ))}
          </select>
        </label>
      </div>

      <label style={styles.label}>
        이름
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="예: PLAVE × GS25"
          style={styles.input}
        />
      </label>

      <label style={styles.label}>
        S3 경로 프리픽스
        <input
          value={pathPrefix}
          onChange={(e) => setPathPrefix(e.target.value)}
          placeholder="photocards/collab/gs25"
          style={{ ...styles.input, fontFamily: "monospace" }}
        />
      </label>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h3>포토카드 그룹 ({form.photocards.length})</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={expandAll} style={styles.expandBtn}>일괄 펼치기</button>
            <button type="button" onClick={collapseAll} style={styles.expandBtn}>일괄 닫기</button>
            <button type="button" onClick={addGroup} style={styles.addBtn}>+ 그룹 추가</button>
          </div>
        </div>

        {form.photocards.map((group, i) => (
          <div key={i} {...groupDragHandlers(i)} style={getGroupDragStyle(i)}>
            <PhotocardGroupForm
              group={group}
              index={i}
              members={members}
              pathPrefix={pathPrefix}
              collapsed={isCollapsed(i)}
              onToggleCollapse={() => toggleCollapse(i)}
              onChange={(g) => updateGroup(i, g)}
              onRemove={() => removeGroup(i)}
            />
          </div>
        ))}
        <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
          <button type="button" onClick={addGroup} style={styles.addBtn}>+ 그룹 추가</button>
        </div>
      </div>

      <div style={styles.submitArea}>
        <button type="submit" style={styles.submitBtn}>
          {card ? "저장" : "추가"}
        </button>
      </div>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: { background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  formHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  cancelBtn: { padding: "6px 16px", border: "1px solid #ccc", borderRadius: 6, background: "#fff", cursor: "pointer" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 },
  label: { display: "flex", flexDirection: "column" as const, gap: 4, fontSize: 14, fontWeight: 500, marginBottom: 12 },
  input: { padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 },
  select: { padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 },
  section: { marginTop: 24, borderTop: "1px solid #e5e7eb", paddingTop: 20 },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  addBtn: { padding: "6px 14px", border: "1px solid #2563eb", borderRadius: 6, background: "#eff6ff", color: "#2563eb", cursor: "pointer", fontSize: 13 },
  expandBtn: { padding: "6px 14px", border: "1px solid #6b7280", borderRadius: 6, background: "#f9fafb", color: "#374151", cursor: "pointer", fontSize: 13 },
  submitArea: { marginTop: 24, display: "flex", justifyContent: "flex-end" },
  submitBtn: { padding: "10px 32px", border: "none", borderRadius: 8, background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 600 },
};
