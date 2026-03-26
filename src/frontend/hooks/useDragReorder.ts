import { useState, useCallback } from "react";

/**
 * HTML5 Drag & Drop 기반 리스트 순서 변경 훅
 * 각 아이템에 dragHandlers(index)를 spread하면 됨
 */
export function useDragReorder<T>(items: T[], onReorder: (items: T[]) => void) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const dragHandlers = useCallback(
    (index: number) => ({
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        setDragIndex(index);
        e.dataTransfer.effectAllowed = "move";
        // 투명 이미지로 기본 고스트 숨김
        const el = e.currentTarget as HTMLElement;
        el.style.opacity = "0.5";
      },
      onDragEnd: (e: React.DragEvent) => {
        const el = e.currentTarget as HTMLElement;
        el.style.opacity = "1";
        if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
          const next = [...items];
          const [moved] = next.splice(dragIndex, 1);
          next.splice(overIndex, 0, moved);
          onReorder(next);
        }
        setDragIndex(null);
        setOverIndex(null);
      },
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setOverIndex(index);
      },
      onDragLeave: () => {
        // overIndex는 다른 요소의 onDragOver에서 갱신
      },
    }),
    [items, onReorder, dragIndex, overIndex],
  );

  const getDragStyle = useCallback(
    (index: number): React.CSSProperties => {
      if (dragIndex === null || overIndex === null) return {};
      if (index === overIndex && dragIndex !== overIndex) {
        return {
          borderTop: dragIndex > overIndex ? "2px solid #2563eb" : undefined,
          borderBottom: dragIndex < overIndex ? "2px solid #2563eb" : undefined,
        };
      }
      return {};
    },
    [dragIndex, overIndex],
  );

  return { dragHandlers, getDragStyle, isDragging: dragIndex !== null };
}
