import React from "react";
import { colors, spacing, radii, typography, shadows } from "./tokens";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        fontFamily: typography.fontFamily,
      }}
    >
      <div
        style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)" }}
        onClick={onClose}
      />
      <div
        className={className}
        style={{
          position: "relative",
          width: 480,
          maxHeight: "85vh",
          overflow: "auto",
          padding: spacing.xxl,
          borderRadius: radii.xl,
          backgroundColor: colors.surface,
          boxShadow: shadows.lg,
        }}
      >
        {title && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xl }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: colors.text, margin: 0 }}>{title}</h2>
            <button
              onClick={onClose}
              style={{
                border: "none", background: "none", fontSize: 20, cursor: "pointer",
                color: colors.textSecondary, padding: 4,
              }}
            >
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
