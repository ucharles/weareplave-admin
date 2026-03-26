import React from "react";
import type { ICard } from "../../types";

interface Props {
  cards: ICard[];
  onEdit: (card: ICard, index: number) => void;
  onDelete: (index: number) => void;
}

export function CardListView({ cards, onEdit, onDelete }: Props) {
  if (cards.length === 0) {
    return <div style={styles.empty}>등록된 카드가 없습니다. 새 카드를 추가해주세요.</div>;
  }

  return (
    <div style={styles.grid}>
      {cards.map((card, i) => (
        <div key={`${card.theme.uuid}-${i}`} style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.badge}>{card.type ?? "album"}</span>
            <span style={styles.themeLabel}>{card.theme.ko || card.theme.en}</span>
          </div>
          <h3 style={styles.cardName}>{card.name}</h3>
          <p style={styles.cardInfo}>
            {card.photocards.length}개 그룹 ·{" "}
            {card.photocards.reduce((sum, g) => sum + g.items.length, 0)}장
          </p>
          {card.photocards.length > 0 && (
            <div style={styles.preview}>
              {card.photocards[0].items.slice(0, 5).map((item) => (
                <img
                  key={item.uuid}
                  src={item.image}
                  alt={item.alias ?? item.uuid}
                  style={styles.previewImg}
                  loading="lazy"
                />
              ))}
            </div>
          )}
          <div style={styles.cardActions}>
            <button onClick={() => onEdit(card, i)} style={styles.editBtn}>수정</button>
            <button onClick={() => onDelete(i)} style={styles.deleteBtn}>삭제</button>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 },
  card: { background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" },
  cardHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 8 },
  badge: { fontSize: 11, fontWeight: 600, background: "#e0e7ff", color: "#3730a3", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" as const },
  themeLabel: { fontSize: 13, color: "#666" },
  cardName: { fontSize: 18, fontWeight: 600, marginBottom: 4 },
  cardInfo: { fontSize: 13, color: "#888", marginBottom: 12 },
  preview: { display: "flex", gap: 4, marginBottom: 12, overflow: "hidden" },
  previewImg: { width: 48, height: 48, objectFit: "cover" as const, borderRadius: 6, background: "#f0f0f0" },
  cardActions: { display: "flex", gap: 8, justifyContent: "flex-end" },
  editBtn: { padding: "6px 16px", border: "1px solid #2563eb", borderRadius: 6, background: "#fff", color: "#2563eb", cursor: "pointer", fontSize: 13, fontWeight: 500 },
  deleteBtn: { padding: "6px 16px", border: "1px solid #dc2626", borderRadius: 6, background: "#fff", color: "#dc2626", cursor: "pointer", fontSize: 13, fontWeight: 500 },
  empty: { textAlign: "center" as const, padding: 60, color: "#999", fontSize: 16 },
};
