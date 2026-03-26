import React, { useState, useEffect } from "react";
import type { ICard, Member, Theme } from "../types";
import { api, setToken } from "./api";
import { CardListView } from "./components/CardList";
import { CardForm } from "./components/CardForm";

export function App() {
  const [cards, setCards] = useState<ICard[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [editing, setEditing] = useState<{ card: ICard; index: number } | null>(null);
  const [creating, setCreating] = useState(false);
  const [token, setTokenState] = useState(localStorage.getItem("admin_token") ?? "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, m, t] = await Promise.all([api.getCards(), api.getMembers(), api.getThemes()]);
      setCards(c);
      setMembers(m);
      setThemes(t);
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

  const handleDelete = async (index: number) => {
    if (!confirm(`"${cards[index].name}" 카드를 삭제하시겠습니까?`)) return;
    try {
      await api.deleteCard(index);
      await fetchData();
    } catch (e) {
      alert(e instanceof Error ? e.message : "삭제 실패");
    }
  };

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

      {error && <div style={styles.error}>{error}</div>}

      {(creating || editing) ? (
        <CardForm
          card={editing?.card}
          members={members}
          themes={themes}
          onSave={handleSave}
          onCancel={() => { setCreating(false); setEditing(null); }}
        />
      ) : (
        <>
          <div style={styles.toolbar}>
            <span style={styles.count}>총 {cards.length}개 카드</span>
            <button onClick={() => setCreating(true)} style={styles.btnPrimary}>+ 새 카드 추가</button>
          </div>
          {loading ? (
            <p style={{ textAlign: "center", padding: 40 }}>로딩 중...</p>
          ) : (
            <CardListView
              cards={cards}
              onEdit={(card, index) => setEditing({ card, index })}
              onDelete={handleDelete}
            />
          )}
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, padding: "16px 0", borderBottom: "2px solid #e0e0e0" },
  title: { fontSize: 24, fontWeight: 700 },
  tokenArea: { display: "flex", gap: 8 },
  tokenInput: { padding: "6px 12px", border: "1px solid #ccc", borderRadius: 6, fontSize: 14, width: 200 },
  btn: { padding: "6px 16px", border: "1px solid #ccc", borderRadius: 6, background: "#fff", cursor: "pointer", fontSize: 14 },
  btnPrimary: { padding: "8px 20px", border: "none", borderRadius: 6, background: "#2563eb", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  count: { fontSize: 14, color: "#666" },
  error: { background: "#fee2e2", color: "#dc2626", padding: "12px 16px", borderRadius: 8, marginBottom: 16 },
};
