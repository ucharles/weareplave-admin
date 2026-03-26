import React, { useState, useEffect, useRef } from "react";
import type { ICard, Member, Theme, CardType } from "../types";
import { api, setToken } from "./api";
import { CardListView } from "./components/CardList";
import { CardForm } from "./components/CardForm";
import { ThemeManager } from "./components/ThemeManager";
import { CardTypeManager } from "./components/CardTypeManager";

type Tab = "cards" | "themes" | "cardTypes";

export function App() {
  const [tab, setTab] = useState<Tab>("cards");
  const [cards, setCards] = useState<ICard[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  const [editing, setEditing] = useState<{ card: ICard; index: number } | null>(null);
  const [creating, setCreating] = useState(false);
  const [token, setTokenState] = useState(localStorage.getItem("admin_token") ?? "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const serverCards = useRef<ICard[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, m, t, ct] = await Promise.all([
        api.getCards(),
        api.getMembers(),
        api.getThemes(),
        api.getCardTypes(),
      ]);
      setCards(c);
      serverCards.current = c;
      setMembers(m);
      setThemes(t);
      setCardTypes(ct);
      setOrderDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "데이터를 불러올 수 없습니다");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleTokenSave = () => {
    setToken(token);
    setTokenState(token);
  };

  const handleSave = async (card: ICard) => {
    try {
      if (editing) {
        await api.updateCard(editing.index, card);
      } else {
        await api.createCard(card);
      }
      setEditing(null);
      setCreating(false);
      await fetchData();
    } catch (e) {
      alert(e instanceof Error ? e.message : "저장 실패");
    }
  };

  const handleReorder = (reordered: ICard[]) => {
    setCards(reordered);
    setOrderDirty(true);
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      await api.reorderCards(cards);
      serverCards.current = cards;
      setOrderDirty(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : "순서 저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelOrder = () => {
    setCards(serverCards.current);
    setOrderDirty(false);
  };

  const handleDelete = async (index: number) => {
    if (!confirm(`"${cards[index].name}" 카드를 삭제하시겠습니까?`)) return;
    try {
      await api.deleteCard(index);
      await fetchData();
    } catch (e) {
      alert(e instanceof Error ? e.message : "삭제 실패");
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "cards", label: "카드" },
    { key: "themes", label: "테마" },
    { key: "cardTypes", label: "카드 타입" },
  ];

  return (
    <div>
      <header style={styles.header}>
        <h1 style={styles.title}>Cardlist Admin</h1>
        <div style={styles.tokenArea}>
          <input
            type="password"
            placeholder="Admin Token"
            value={token}
            onChange={(e) => setTokenState(e.target.value)}
            style={styles.tokenInput}
          />
          <button onClick={handleTokenSave} style={styles.btn}>저장</button>
        </div>
      </header>

      <nav style={styles.tabBar}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setCreating(false); setEditing(null); }}
            style={tab === t.key ? { ...styles.tab, ...styles.tabActive } : styles.tab}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <p style={{ textAlign: "center", padding: 40 }}>로딩 중...</p>
      ) : (
        <>
          {tab === "cards" && (
            (creating || editing) ? (
              <CardForm
                card={editing?.card}
                members={members}
                themes={themes}
                cardTypes={cardTypes}
                onSave={handleSave}
                onCancel={() => { setCreating(false); setEditing(null); }}
              />
            ) : (
              <>
                <div style={styles.toolbar}>
                  <span style={styles.count}>총 {cards.length}개 카드</span>
                  <button onClick={() => setCreating(true)} style={styles.btnPrimary}>+ 새 카드 추가</button>
                </div>
                <CardListView
                  cards={cards}
                  onEdit={(card, index) => setEditing({ card, index })}
                  onDelete={handleDelete}
                  onReorder={handleReorder}
                />
              </>
            )
          )}

          {tab === "themes" && (
            <ThemeManager themes={themes} onRefresh={fetchData} />
          )}

          {tab === "cardTypes" && (
            <CardTypeManager cardTypes={cardTypes} onRefresh={fetchData} />
          )}
        </>
      )}

      {/* 플로팅 저장 버튼 */}
      {orderDirty && (
        <div style={styles.floatingBar}>
          <span style={styles.floatingText}>순서가 변경되었습니다</span>
          <button onClick={handleCancelOrder} style={styles.floatingCancel}>취소</button>
          <button onClick={handleSaveOrder} disabled={saving} style={styles.floatingSave}>
            {saving ? "저장 중..." : "순서 저장"}
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, padding: "16px 0", borderBottom: "2px solid #e0e0e0" },
  title: { fontSize: 24, fontWeight: 700 },
  tokenArea: { display: "flex", gap: 8 },
  tokenInput: { padding: "6px 12px", border: "1px solid #ccc", borderRadius: 6, fontSize: 14, width: 200 },
  btn: { padding: "6px 16px", border: "1px solid #ccc", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 14 },
  btnPrimary: { padding: "8px 20px", border: "none", borderRadius: 6, background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  tabBar: { display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid #e5e7eb", paddingBottom: 0 },
  tab: { padding: "10px 20px", border: "none", background: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#666", borderBottom: "2px solid transparent", marginBottom: -1 },
  tabActive: { color: "#2563eb", borderBottomColor: "#2563eb" },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  count: { fontSize: 14, color: "#666" },
  error: { background: "#fee2e2", color: "#dc2626", padding: "12px 16px", borderRadius: 8, marginBottom: 16 },
  floatingBar: {
    position: "fixed" as const,
    bottom: 24,
    left: 24,
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#1e293b",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: 12,
    boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
    zIndex: 1000,
  },
  floatingText: { fontSize: 14 },
  floatingCancel: { padding: "6px 16px", border: "1px solid #94a3b8", borderRadius: 6, background: "transparent", color: "#cbd5e1", cursor: "pointer", fontSize: 13 },
  floatingSave: { padding: "6px 20px", border: "none", borderRadius: 6, background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 },
};
