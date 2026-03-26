import React, { useState } from "react";
import type { CardType } from "../../types";
import { api } from "../api";

interface Props {
  cardTypes: CardType[];
  onRefresh: () => void;
}

export function CardTypeManager({ cardTypes, onRefresh }: Props) {
  const [editing, setEditing] = useState<CardType | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CardType>({ value: "", label: "" });

  const startCreate = () => {
    setForm({ value: "", label: "" });
    setCreating(true);
    setEditing(null);
  };

  const startEdit = (ct: CardType) => {
    setForm({ ...ct });
    setEditing(ct);
    setCreating(false);
  };

  const cancel = () => {
    setCreating(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.value || !form.label) return alert("값과 라벨을 입력해주세요");
    try {
      if (editing) {
        await api.updateCardType(editing.value, form);
      } else {
        await api.createCardType(form);
      }
      cancel();
      onRefresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "저장 실패");
    }
  };

  const handleDelete = async (value: string, label: string) => {
    if (!confirm(`"${label}" 카드 타입을 삭제하시겠습니까?`)) return;
    try {
      await api.deleteCardType(value);
      onRefresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "삭제 실패");
    }
  };

  return (
    <div>
      <div style={styles.toolbar}>
        <span style={styles.count}>총 {cardTypes.length}개 카드 타입</span>
        <button onClick={startCreate} style={styles.btnPrimary}>+ 새 카드 타입 추가</button>
      </div>

      {(creating || editing) && (
        <div style={styles.formCard}>
          <h3 style={{ marginBottom: 12 }}>{editing ? "카드 타입 수정" : "새 카드 타입 추가"}</h3>
          <div style={styles.formRow}>
            <label style={styles.label}>
              값 (영문, 코드용)
              <input
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                placeholder="예: album"
                style={styles.input}
                disabled={!!editing}
              />
            </label>
            <label style={styles.label}>
              라벨 (표시용)
              <input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="예: 앨범"
                style={styles.input}
              />
            </label>
          </div>
          <div style={styles.formActions}>
            <button onClick={cancel} style={styles.btn}>취소</button>
            <button onClick={handleSave} style={styles.btnPrimary}>저장</button>
          </div>
        </div>
      )}

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>값</th>
            <th style={styles.th}>라벨</th>
            <th style={{ ...styles.th, width: 120 }}>관리</th>
          </tr>
        </thead>
        <tbody>
          {cardTypes.map((ct) => (
            <tr key={ct.value} style={styles.tr}>
              <td style={{ ...styles.td, fontFamily: "monospace" }}>{ct.value}</td>
              <td style={styles.td}>{ct.label}</td>
              <td style={styles.td}>
                <button onClick={() => startEdit(ct)} style={styles.editBtn}>수정</button>
                <button onClick={() => handleDelete(ct.value, ct.label)} style={styles.deleteBtn}>삭제</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  count: { fontSize: 14, color: "#666" },
  btnPrimary: { padding: "8px 20px", border: "none", borderRadius: 6, background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  btn: { padding: "6px 16px", border: "1px solid #ccc", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 14 },
  formCard: { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", marginBottom: 16 },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 },
  formActions: { display: "flex", gap: 8, justifyContent: "flex-end" },
  label: { display: "flex", flexDirection: "column" as const, gap: 4, fontSize: 14, fontWeight: 500 },
  input: { padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 },
  table: { width: "100%", borderCollapse: "collapse" as const, background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  th: { textAlign: "left" as const, padding: "12px 16px", background: "#f9fafb", fontSize: 13, fontWeight: 600, borderBottom: "1px solid #e5e7eb" },
  tr: { borderBottom: "1px solid #f3f4f6" },
  td: { padding: "10px 16px", fontSize: 14 },
  editBtn: { padding: "3px 10px", border: "1px solid #2563eb", borderRadius: 4, background: "#fff", color: "#2563eb", cursor: "pointer", fontSize: 12, marginRight: 4 },
  deleteBtn: { padding: "3px 10px", border: "1px solid #dc2626", borderRadius: 4, background: "#fff", color: "#dc2626", cursor: "pointer", fontSize: 12 },
};
