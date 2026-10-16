"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useScrollLock } from "@/hooks/use-scroll-lock";
import { lab } from "@/ui/lab";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Suppresses Escape and backdrop-click (e.g. while an async action is in flight). */
  closeDisabled?: boolean;
  children: React.ReactNode;
};

/** Marks the rest of the app unreachable while a modal owns the screen. */
const APP_ROOT_ID = "app-root";

/** `false` on the server, `true` once hydrated — gates the portal. */
const subscribeNever = () => () => {};

export function Modal({
  open,
  onClose,
  title,
  closeDisabled = false,
  children,
}: ModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

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

  // The dialog is portalled out of the app root, so the root can be inerted
  // wholesale — `aria-modal` alone does not stop screen readers browsing it.
  useEffect(() => {
    if (!open) return;
    const root = document.getElementById(APP_ROOT_ID);
    root?.setAttribute("inert", "");
    return () => root?.removeAttribute("inert");
  }, [open]);

  useFocusTrap(cardRef, open);
  useScrollLock(open);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className={`${lab.modalBackdrop}${closeDisabled ? " cursor-wait" : ""}`}
      role="presentation"
      onClick={closeDisabled ? undefined : onClose}
    >
      <div
        ref={cardRef}
        className={lab.modalCard}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        // Fallback focus target when the dialog holds nothing focusable.
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId} className={lab.modalTitle}>
          {title}
        </h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}
