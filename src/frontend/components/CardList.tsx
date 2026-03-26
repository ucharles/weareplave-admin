import React from "react";
import type { ICard } from "../../types";
import { useDragReorder } from "../hooks/useDragReorder";

interface Props {
  cards: ICard[];
  onEdit: (card: ICard, index: number) => void;
  onDelete: (index: number) => void;
  onReorder: (cards: ICard[]) => void;
}

export function CardListView({ cards, onEdit, onDelete, onReorder }: Props) {
  const { dragHandlers, getDragStyle } = useDragReorder(cards, onReorder);

  const moveUp = (i: number) => {
    if (i === 0) return;
    const next = [...cards];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    onReorder(next);
  };

  const moveDown = (i: number) => {
    if (i >= cards.length - 1) return;
    const next = [...cards];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    onReorder(next);
  };

  const moveTo = (from: number) => {
    const input = prompt(`"${cards[from].name}"을(를) 몇 번째로 이동하시겠습니까? (1~${cards.length})`, String(from + 1));
    if (!input) return;
    const to = parseInt(input) - 1;
    if (isNaN(to) || to < 0 || to >= cards.length || to === from) return;
    const next = [...cards];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  };

  if (cards.length === 0) {
    return <div style={styles.empty}>등록된 카드가 없습니다. 새 카드를 추가해주세요.</div>;
  }

  return (
    <div style={styles.list}>
      {cards.map((card, i) => (
        <div
          key={`${card.theme.uuid}-${i}`}
          style={{ ...styles.card, ...getDragStyle(i) }}
          {...dragHandlers(i)}
        >
          <div style={styles.orderControls}>
            <div style={styles.dragHandle}>⠿</div>
            <button
              type="button"
              onClick={() => moveUp(i)}
              disabled={i === 0}
              style={{ ...styles.arrowBtn, opacity: i === 0 ? 0.3 : 1 }}
            >▲</button>
            <button
              type="button"
              onClick={() => moveDown(i)}
              disabled={i >= cards.length - 1}
              style={{ ...styles.arrowBtn, opacity: i >= cards.length - 1 ? 0.3 : 1 }}
            >▼</button>
          </div>
          <div style={styles.cardBody}>
            <div style={styles.cardHeader}>
              <button type="button" onClick={() => moveTo(i)} style={styles.indexBtn}>#{i + 1}</button>
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
          </div>
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
  list: { display: "flex", flexDirection: "column" as const, gap: 8 },
  card: { display: "flex", alignItems: "center", gap: 12, background: "#fff", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", cursor: "grab", transition: "border 0.1s" },
  orderControls: { display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 2, flexShrink: 0 },
  dragHandle: { fontSize: 18, color: "#aaa", cursor: "grab", userSelect: "none" as const },
  arrowBtn: { background: "none", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", fontSize: 14, padding: "6px 10px", color: "#666", lineHeight: 1 },
  cardBody: { flex: 1, minWidth: 0 },
  cardHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 4 },
  indexBtn: { fontSize: 12, color: "#2563eb", fontWeight: 600, fontFamily: "monospace", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 4, padding: "2px 6px", cursor: "pointer" },
  badge: { fontSize: 11, fontWeight: 600, background: "#e0e7ff", color: "#3730a3", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" as const },
  themeLabel: { fontSize: 13, color: "#666" },
  cardName: { fontSize: 16, fontWeight: 600, marginBottom: 2 },
  cardInfo: { fontSize: 13, color: "#888", marginBottom: 8 },
  preview: { display: "flex", gap: 4, overflow: "hidden" },
  previewImg: { width: 64, height: 64, objectFit: "cover" as const, borderRadius: 4, background: "#f0f0f0" },
  cardActions: { display: "flex", flexDirection: "column" as const, gap: 4, flexShrink: 0 },
  editBtn: { padding: "5px 14px", border: "1px solid #2563eb", borderRadius: 6, background: "#fff", color: "#2563eb", cursor: "pointer", fontSize: 12, fontWeight: 500 },
  deleteBtn: { padding: "5px 14px", border: "1px solid #dc2626", borderRadius: 6, background: "#fff", color: "#dc2626", cursor: "pointer", fontSize: 12, fontWeight: 500 },
  empty: { textAlign: "center" as const, padding: 60, color: "#999", fontSize: 16 },
};
