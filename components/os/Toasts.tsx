"use client";
/* SerdarOS 96 — desktop notices (max 3, auto-hide, optional action buttons). */
import { useCallback, useEffect, useRef, useState } from "react";
import { useWM, type Toast } from "./OSContext";

function Notice({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const [leaving, setLeaving] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const actions = toast.opts.actions || [];

  const hide = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setLeaving(true);
    timers.current = [setTimeout(() => onRemove(toast.id), 260)];
  }, [onRemove, toast.id]);

  useEffect(() => {
    const t = setTimeout(hide, toast.opts.timeout || (actions.length ? 10000 : 4000));
    timers.current.push(t);
    const list = timers;
    return () => list.current.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={"desktop__notice" + (leaving ? " is-leaving" : "")}
      role="status"
      onClick={(e) => {
        if (!(e.target as Element).closest("button")) hide();
      }}
    >
      <div>{toast.text}</div>
      {actions.length > 0 && (
        <div className="desktop__notice-actions">
          {actions.map((a, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                hide();
                a.onClick?.();
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Toasts() {
  const { toasts, removeToast } = useWM();
  return (
    <div className="desktop__notices" aria-live="polite">
      {toasts.map((t) => (
        <Notice key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}
