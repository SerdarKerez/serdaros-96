"use client";
/* SerdarOS 96 — Calculator ("SERDAR CALC — 96 / STANDARD"). Owner: builder-games. */
import { useEffect, useRef, useState } from "react";
import type { AppProps } from "@/lib/os-types";
import { pick, useLang, type L } from "@/lib/i18n";
import { useGameKeys } from "./shared";

type Op = "+" | "-" | "*" | "/";
const SYM: Record<Op, string> = { "+": "+", "-": "−", "*": "×", "/": "÷" };
// Errors are thrown as codes and shown in the current language.
const ERR_ZERO = "zero";
const ERR_BIG = "big";
const ERRORS: Record<string, L> = {
  [ERR_ZERO]: { tr: "Sıfıra bölünemez.", en: "Cannot divide by zero." },
  [ERR_BIG]: { tr: "Sonuç çok büyük.", en: "Result is too large." },
};

function fmt(n: number): string {
  if (!isFinite(n)) throw new Error(ERR_BIG);
  let r = Number(n.toPrecision(12));
  if (Math.abs(r) >= 1e15) throw new Error(ERR_BIG);
  if (Object.is(r, -0)) r = 0;
  return String(r);
}

function calc(a: number, op: Op, b: number): number {
  switch (op) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": if (b === 0) throw new Error(ERR_ZERO); return a / b;
  }
  return b;
}

// [key, kind, label, aria-label]
const KEYS: [string, string?, string?, L?][] = [
  ["C", "clear", "C", { tr: "Tümünü temizle", en: "Clear all" }],
  ["CE", "clear", "CE", { tr: "Girişi temizle", en: "Clear entry" }],
  ["back", "utility", "⌫", { tr: "Geri sil", en: "Backspace" }],
  ["%", "utility", "%", { tr: "Yüzde", en: "Percent" }],
  ["7"], ["8"], ["9"], ["/", "operator", "÷", { tr: "Böl", en: "Divide" }],
  ["4"], ["5"], ["6"], ["*", "operator", "×", { tr: "Çarp", en: "Multiply" }],
  ["1"], ["2"], ["3"], ["-", "operator", "−", { tr: "Çıkar", en: "Subtract" }],
  ["neg", "utility", "±", { tr: "İşareti değiştir", en: "Change sign" }], ["0"], [".", "", ".", { tr: "Ondalık", en: "Decimal point" }],
  ["+", "operator", "+", { tr: "Topla", en: "Add" }],
  ["=", "equals", "=", { tr: "Eşittir", en: "Equals" }],
];

interface CalcState {
  display: string;
  acc: number | null;
  op: Op | null;
  expr: string;
  typing: boolean;
  has: boolean;
  error: boolean;
}
const fresh = (): CalcState => ({ display: "0", acc: null, op: null, expr: "", typing: false, has: false, error: false });

function apply(st: CalcState, k: string): CalcState {
  const s = { ...st };
  const cur = () => parseFloat(s.display) || 0;
  const reset = () => Object.assign(s, fresh());
  if (/^[0-9]$/.test(k) || k === ".") {
    if (s.error) reset();
    if (!s.typing) {
      s.display = k === "." ? "0." : k;
      s.typing = true; s.has = true;
      if (!s.op) s.expr = "";
      return s;
    }
    if (k === "." && s.display.indexOf(".") !== -1) return s;
    if (s.display.replace(/[-.]/g, "").length >= 12) return s;
    s.display = s.display === "0" && k !== "." ? k : s.display + k;
    if (s.display === "-0" && k !== ".") s.display = "-" + k;
    return s;
  }
  if (k === "C") return fresh();
  if (s.error) { reset(); if (k === "back" || k === "CE") return s; }
  switch (k) {
    case "CE": s.display = "0"; s.typing = false; s.has = s.op ? false : s.has; return s;
    case "back":
      if (!s.typing) return s;
      s.display = s.display.slice(0, -1);
      if (s.display === "" || s.display === "-") { s.display = "0"; s.typing = false; }
      return s;
    case "neg":
      if (s.op && !s.has) { s.display = fmt(-(s.acc ?? 0)); s.has = true; s.typing = false; return s; }
      if (s.display === "0" || s.display === "0.") return s;
      s.display = s.display.charAt(0) === "-" ? s.display.slice(1) : "-" + s.display;
      return s;
    case "%": {
      const v = (s.op === "+" || s.op === "-") && s.acc !== null ? (s.acc * cur()) / 100 : cur() / 100;
      s.display = fmt(v); s.typing = false; s.has = true;
      return s;
    }
    case "+": case "-": case "*": case "/":
      if (s.op && s.has) {
        s.acc = calc(s.acc ?? 0, s.op, cur());
        s.display = fmt(s.acc);
      } else if (!s.op) {
        s.acc = cur();
      }
      s.op = k; s.typing = false; s.has = false;
      s.expr = fmt(s.acc ?? 0) + " " + SYM[k];
      return s;
    case "=": {
      if (!s.op) { s.expr = s.display + " ="; s.typing = false; return s; }
      const acc = s.acc ?? 0;
      const b = s.has ? cur() : acc;
      const res = calc(acc, s.op, b);
      const line = fmt(acc) + " " + SYM[s.op] + " " + fmt(b) + " =";
      s.display = fmt(res);
      s.expr = line; s.acc = null; s.op = null; s.typing = false; s.has = false;
      return s;
    }
  }
  return s;
}

const KEYMAP: Record<string, string> = {
  Enter: "=", "=": "=", Escape: "C", Delete: "CE", Backspace: "back", F9: "neg", ",": ".", ".": ".",
  "+": "+", "-": "-", "*": "*", x: "*", X: "*", "/": "/", "%": "%",
};

export default function Calculator({ winId }: AppProps) {
  const { lang, t } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);
  const [st, setSt] = useState<CalcState>(fresh);
  const [hit, setHit] = useState<Record<string, boolean>>({});
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    const set = timers.current;
    return () => set.forEach(clearTimeout);
  }, []);

  function press(k: string) {
    setSt((prev) => {
      try {
        return apply(prev, k);
      } catch (err) {
        return { ...fresh(), error: true, display: (err as Error).message };
      }
    });
  }

  function flash(k: string) {
    if (!KEYS.some((d) => d[0] === k)) return;
    setHit((h) => ({ ...h, [k]: true }));
    const t = setTimeout(() => {
      timers.current.delete(t);
      setHit((h) => ({ ...h, [k]: false }));
    }, 110);
    timers.current.add(t);
  }

  useGameKeys(winId, rootRef, (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = /^[0-9]$/.test(e.key) ? e.key : KEYMAP[e.key];
    if (!k) return;
    e.preventDefault();
    press(k);
    flash(k);
  });

  const dispClass =
    "calc__display" +
    (st.error ? " calc__display--error" : "") +
    (st.display.length > 11 && !st.error ? " calc__display--long" : "");

  return (
    <div className="calc" ref={rootRef}>
      <div className="calc__panel">
        <div className="calc__brand">
          <span>
            SERDAR CALC <span>— 96</span>
          </span>
          <span className="calc__edition">STANDARD</span>
        </div>
        <div className="calc__screen" role="status" aria-live="polite">
          <span className="calc__expression">{st.expr}</span>
          <output className={dispClass}>{st.error && ERRORS[st.display] ? pick(lang, ERRORS[st.display]) : st.display}</output>
        </div>
        <div className="calc__keys">
          {KEYS.map(([key, kind, label, aria]) => {
            const isOp = key === "+" || key === "-" || key === "*" || key === "/";
            return (
              <button
                key={key}
                type="button"
                className={"calc__key" + (kind ? " calc__key--" + kind : "") + (hit[key] ? " calc__key--hit" : "")}
                aria-label={aria ? pick(lang, aria) : key}
                aria-pressed={isOp ? st.op === key && !st.has : undefined}
                data-key={key}
                onClick={() => press(key)}
              >
                {label || key}
              </button>
            );
          })}
        </div>
        <p className="calc__hint">{t("Enter = · Esc temizler · Klavye hazır", "Enter = · Esc clears · Keyboard ready")}</p>
      </div>
    </div>
  );
}
