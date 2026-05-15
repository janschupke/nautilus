"use client";

import { useEffect } from "react";
import { lab } from "@/ui/lab";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Suppresses Escape and backdrop-click (e.g. while an async action is in flight). */
  closeDisabled?: boolean;
  children: React.ReactNode;
};

export function Modal({
  open,
  onClose,
  title,
  closeDisabled = false,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open || closeDisabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, closeDisabled]);

  if (!open) return null;

  return (
    <div
      className={`${lab.modalBackdrop}${closeDisabled ? " cursor-wait" : ""}`}
      role="presentation"
      onClick={closeDisabled ? undefined : onClose}
    >
      <div
        className={lab.modalCard}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={lab.modalTitle}>{title}</h2>
        {children}
      </div>
    </div>
  );
}
