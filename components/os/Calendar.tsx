"use client";
/* SerdarOS 96 — taskbar clock calendar panel. */
import type { RefObject } from "react";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function Month() {
  const now = new Date();
  const y = now.getFullYear();
  const mo = now.getMonth();
  const days = new Date(y, mo + 1, 0).getDate();
  const lead = (new Date(y, mo, 1).getDay() + 6) % 7;
  return (
    <>
      <h2 className="calendar__month">{now.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</h2>
      <div className="calendar__weekdays" aria-hidden="true">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <ol className="calendar__days">
        {Array.from({ length: lead }, (_, i) => (
          <li key={"l" + i} aria-hidden="true"></li>
        ))}
        {Array.from({ length: days }, (_, i) => (
          <li key={i} aria-current={i + 1 === now.getDate() ? "date" : undefined}>
            {i + 1}
          </li>
        ))}
      </ol>
      <p className="calendar__today">
        {now
          .toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
          .replace(",", "")}
      </p>
    </>
  );
}

export default function Calendar({
  open,
  panelRef,
  onClose,
}: {
  open: boolean;
  panelRef: RefObject<HTMLDivElement | null>;
  onClose: (returnFocus: boolean) => void;
}) {
  return (
    <div
      ref={panelRef}
      className="taskbar-panel taskbar-panel--clock"
      role="dialog"
      aria-label="Calendar"
      hidden={!open}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose(true);
      }}
    >
      {open && <Month />}
    </div>
  );
}
