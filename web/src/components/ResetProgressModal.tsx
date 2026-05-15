"use client";

import { useCallback, useState } from "react";
import { Modal } from "./Modal";
import { lab } from "@/ui/lab";

type ResetProgressModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  body?: string;
  confirmLabel?: string;
};

export function ResetProgressModal({
  open,
  onClose,
  onConfirm,
  title = "Reset all progress?",
  body = "This removes every saved answer and result from this browser. This cannot be undone.",
  confirmLabel = "Reset progress",
}: ResetProgressModalProps) {
  const [confirmPending, setConfirmPending] = useState(false);

  const handleConfirm = useCallback(async () => {
    if (confirmPending) return;
    setConfirmPending(true);
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
    onConfirm();
    onClose();
  }, [confirmPending, onClose, onConfirm]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      closeDisabled={confirmPending}
    >
      <p className={lab.modalBody}>{body}</p>
      <div className={lab.modalActions}>
        <button
          type="button"
          className={lab.btnGhostSm}
          disabled={confirmPending}
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className={lab.btnDanger}
          disabled={confirmPending}
          aria-busy={confirmPending ? true : undefined}
          onClick={() => void handleConfirm()}
        >
          {confirmPending ? "Resetting…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
