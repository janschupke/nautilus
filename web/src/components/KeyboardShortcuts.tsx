"use client";

import { useState } from "react";
import { Keyboard } from "lucide-react";
import { Modal } from "@/components/Modal";
import { useHotkeys } from "@/hooks/use-hotkeys";
import { useHotkeysEnabled } from "@/hooks/use-hotkeys-enabled";
import { NAV_HOTKEYS } from "@/lib/hotkey-list";
import { setHotkeysEnabled } from "@/lib/storage";
import { lab } from "@/ui/lab";

/**
 * Documents the single-key navigation shortcuts and lets the user switch them
 * off — the mechanism WCAG 2.1.4 requires for unmodified character shortcuts.
 */
export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const enabled = useHotkeysEnabled();

  useHotkeys(enabled ? [{ key: "?", action: () => setOpen(true) }] : []);

  return (
    <>
      <button
        type="button"
        aria-label="Keyboard shortcuts"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={lab.iconButton}
      >
        <Keyboard size={20} />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Keyboard shortcuts"
      >
        <dl className="mt-4 space-y-2">
          {NAV_HOTKEYS.map((shortcut) => (
            <div
              key={shortcut.description}
              className="flex items-baseline justify-between gap-4 border-b border-stroke py-2 last:border-0"
            >
              <dt className="flex gap-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="rounded border border-stroke-muted bg-surface-raised px-2 py-0.5 font-mono text-sm text-fg"
                  >
                    {key}
                  </kbd>
                ))}
              </dt>
              <dd className={lab.muted}>{shortcut.description}</dd>
            </div>
          ))}
        </dl>

        <label className="mt-6 flex items-center gap-3 text-base text-fg-soft">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setHotkeysEnabled(e.target.checked)}
            className={`h-5 w-5 accent-emerald-600 ${lab.focusRing}`}
          />
          Enable single-key shortcuts
        </label>
        <p className={`mt-2 ${lab.hint}`}>
          Turn these off if they interfere with speech input or another
          assistive tool.
        </p>

        <div className={lab.modalActions}>
          <button
            type="button"
            className={lab.btnGhostSm}
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
}
