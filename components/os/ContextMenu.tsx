"use client";
/* SerdarOS 96 — desktop right-click menu (also Shift+F10 / ContextMenu key). */
import { Fragment, useLayoutEffect, type RefObject } from "react";
import { TASKBAR_H, clamp } from "./OSContext";

/** Arrow/Home/End navigation for menu-like popups; Escape/Tab close. */
export function menuKeys(container: HTMLElement, e: React.KeyboardEvent, close: (returnFocus: boolean) => void) {
  const items = Array.from(container.querySelectorAll("button"));
  if (!items.length) return;
  const i = items.indexOf(document.activeElement as HTMLButtonElement);
  if (e.key === "ArrowDown") {
    e.preventDefault();
    items[(i + 1) % items.length].focus();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    items[(i - 1 + items.length) % items.length].focus();
  } else if (e.key === "Home") {
    e.preventDefault();
    items[0].focus();
  } else if (e.key === "End") {
    e.preventDefault();
    items[items.length - 1].focus();
  } else if (e.key === "Escape" || e.key === "Tab") {
    if (e.key === "Escape") e.preventDefault();
    close(true);
  }
}

export type MenuItem = [string, () => void] | null;

export default function ContextMenu({
  x,
  y,
  items,
  menuRef,
  onClose,
}: {
  x: number;
  y: number;
  items: MenuItem[];
  menuRef: RefObject<HTMLDivElement | null>;
  onClose: (returnFocus: boolean) => void;
}) {
  useLayoutEffect(() => {
    const m = menuRef.current;
    if (!m) return;
    m.style.left = clamp(x, 4, Math.max(4, window.innerWidth - m.offsetWidth - 4)) + "px";
    m.style.top = clamp(y, 4, Math.max(4, window.innerHeight - TASKBAR_H - m.offsetHeight - 4)) + "px";
    m.querySelector("button")?.focus();
  }, [x, y, menuRef]);

  return (
    <div
      ref={menuRef}
      className="desktop__menu"
      role="menu"
      onKeyDown={(e) => {
        if (menuRef.current) menuKeys(menuRef.current, e, onClose);
      }}
    >
      {items.map((it, i) =>
        it ? (
          <button
            key={i}
            type="button"
            role="menuitem"
            onClick={() => {
              onClose(false);
              it[1]();
            }}
          >
            {it[0]}
          </button>
        ) : (
          <Fragment key={i}>
            <hr />
          </Fragment>
        ),
      )}
    </div>
  );
}
