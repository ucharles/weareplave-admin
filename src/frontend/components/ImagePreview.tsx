import React from "react";

interface Props {
  src: string | null;
  onClose: () => void;
}

export function ImagePreview({ src, onClose }: Props) {
  if (!src) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <img
        src={src}
        alt="Preview"
        style={styles.image}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    cursor: "pointer",
  },
  image: {
    maxWidth: "90vw",
    maxHeight: "90vh",
    objectFit: "contain",
    borderRadius: 8,
    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
  },
};
