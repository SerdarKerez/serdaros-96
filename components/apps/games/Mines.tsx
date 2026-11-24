"use client";
/* SerdarOS 96 — Minesweeper, beginner 9x9 / 10 mines. Owner: builder-games. */
import { useEffect, useRef, useState } from "react";
import type { AppProps } from "@/lib/os-types";
import { storage } from "@/lib/storage";
import { useOS } from "@/components/os/OSContext";
import { pick, useLang, type L } from "@/lib/i18n";
import { GameShell, pixelSvg, useGameKeys } from "./shared";

const MW = 9, MH = 9, MINES = 10;

const FACE_C = { o: "#2f4a32", y: "#e9d77a", d: "#2f4a32", w: "#fffbe4", g: "#243e2b" };
const FACE_BASE = [
  "....oooooooo....",
  "..ooyyyyyyyyoo..",
  ".oyyyyyyyyyyyyo.",
  ".oyyyyyyyyyyyyo.",
  "oyyyyyyyyyyyyyyo",
  "oyyy??yyyy??yyyo",
  "oyyy??yyyy??yyyo",
  "oyyyyyyyyyyyyyyo",
  "oyyyyyyyyyyyyyyo",
  "oyyy!!!!!!!!yyyo",
  "oyyy!!!!!!!!yyyo",
  ".oyyyyyyyyyyyyo.",
  ".oyyyyyyyyyyyyo.",
  "..ooyyyyyyyyoo..",
  "....oooooooo....",
  "................",
];
function face(eyes: string[], mouth: string[], extra = ""): string {
  const rows = FACE_BASE.map((r, y) =>
    r.replace(/\?\?/g, () => eyes[y - 5] || "yy").replace("!!!!!!!!", mouth[y - 9] || "yyyyyyyy"),
  );
  return pixelSvg(rows, FACE_C, 16, extra);
}
const FACES = {
  smile: face(["dd", "dd"], ["dyyyyyyd", "yddddddy"]),
  oh: face(["dd", "dd"], ["yyyddyyy", "yyyddyyy"]),
  dead: face(["dy", "yd"], ["yddddddy", "dyyyyyyd"]),
  // sunglasses bridge for the cool face
  cool: face(["gg", "gg"], ["dyyyyyyd", "yddddddy"], '<rect x="3" y="5" width="10" height="1" fill="#243e2b"/>'),
};
type Face = keyof typeof FACES;

const MINE_SVG = pixelSvg([
  ".......d........",
  "...d...d...d....",
  "....d.ddd.d.....",
  ".....ddddd......",
  "....ddwwddd.....",
  ".dddddwdddddd...",
  "....ddddddd.....",
  ".....ddddd......",
  "....d.ddd.d.....",
  "...d...d...d....",
  ".......d........",
], { d: "#243e2b", w: "#fffbe4" }, 13);
const FLAG_SVG = pixelSvg([
  ".....rr.......",
  ".....rrrr.....",
  ".....rrrrrr...",
  ".....rrrr.....",
  ".....rr.......",
  ".....k........",
  ".....k........",
  ".....k........",
  "...kkkkk......",
  ".kkkkkkkkk....",
], { r: "#9d4d4d", k: "#243e2b" }, 12);

interface CellData { mine: boolean; n: number; open: boolean; flag: boolean; hit?: boolean; wrong?: boolean }
interface View {
  cells: CellData[];
  face: Face;
  left: number;
  time: number;
  msg: L | null;
  msgCls: string;
  best: number;
}
type Mode = "open" | "flag";

function pad(n: number): string {
  n = Math.max(-99, Math.min(999, n));
  return n < 0 ? "-" + String(-n).padStart(2, "0") : String(n).padStart(3, "0");
}
function idx(x: number, y: number) { return y * MW + x; }
function around(i: number, fn: (j: number) => void) {
  const x = i % MW, y = Math.floor(i / MW);
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx, ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < MW && ny < MH) fn(idx(nx, ny));
    }
}
const blank = (): CellData[] => Array.from({ length: MW * MH }, () => ({ mine: false, n: 0, open: false, flag: false }));

interface Api { newGame: () => void; toggleFlag: () => void; focusMove: (k: string) => void }

export default function Mines({ winId }: AppProps) {
  const { notify } = useOS();
  const { lang, t } = useLang();
  const notifyRef = useRef(notify);
  const langRef = useRef(lang);
  useEffect(() => { notifyRef.current = notify; langRef.current = lang; });

  const rootRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const modeRef = useRef<Mode>("open");
  const api = useRef<Api | null>(null);
  const [mode, setMode] = useState<Mode>("open");
  const [view, setView] = useState<View>(() => ({
    cells: blank(), face: "smile", left: MINES, time: 0, msg: null, msgCls: "", best: 0,
  }));

  useEffect(() => {
    const boardEl = boardRef.current;
    if (!boardEl) return;
    let cells: CellData[] = blank();
    let state: "play" | "won" | "lost" = "play";
    let started = false, flags = 0, opened = 0, seconds = 0;
    let clock: ReturnType<typeof setInterval> | null = null;
    let faceKey: Face = "smile";
    let msg: L | null = null, msgCls = "";
    let best = +storage.get<number>("mines-best", 0) || 0;

    function sync() {
      setView({
        cells: cells.map((c) => ({ ...c })), face: faceKey, left: MINES - flags, time: seconds, msg, msgCls, best,
      });
    }
    function setFace(f: Face) { if (faceKey !== f) { faceKey = f; sync(); } }

    function newGame() {
      cells = blank();
      state = "play"; started = false; flags = 0; opened = 0; seconds = 0;
      stopClock();
      faceKey = "smile"; msg = null; msgCls = "";
      sync();
    }
    function layMines(safe: number) {
      const banned: Record<number, 1> = { [safe]: 1 };
      around(safe, (j) => { banned[j] = 1; });
      let placed = 0;
      while (placed < MINES) {
        const r = Math.floor(Math.random() * MW * MH);
        if (banned[r] || cells[r].mine) continue;
        cells[r].mine = true; placed++;
      }
      cells.forEach((c, i) => { let n = 0; around(i, (j) => { if (cells[j].mine) n++; }); c.n = n; });
    }
    function startClock() {
      stopClock();
      clock = setInterval(() => { if (!document.hidden) { seconds = Math.min(999, seconds + 1); sync(); } }, 1000);
    }
    function stopClock() { if (clock) { clearInterval(clock); clock = null; } }

    function flood(i: number) {
      const stack = [i];
      while (stack.length) {
        const j = stack.pop() as number, c = cells[j];
        if (c.open || c.flag) continue;
        c.open = true; opened++;
        if (!c.mine && c.n === 0) around(j, (k) => { if (!cells[k].open) stack.push(k); });
      }
    }
    function reveal(i: number) {
      if (state !== "play") return;
      const c = cells[i];
      if (c.flag) return;
      if (!started) { layMines(i); started = true; startClock(); }
      if (c.open) { chord(i); return; }
      if (c.mine) { c.hit = true; lose(); return; }
      flood(i);
      check();
      sync();
    }
    function chord(i: number) {
      const c = cells[i];
      if (!c.n) return;
      let f = 0;
      around(i, (j) => { if (cells[j].flag) f++; });
      if (f !== c.n) return;
      let boom = false;
      around(i, (j) => {
        const d = cells[j];
        if (d.open || d.flag) return;
        if (d.mine) { d.hit = true; boom = true; } else flood(j);
      });
      if (boom) lose(); else { check(); sync(); }
    }
    function toggleFlag(i: number) {
      if (state !== "play") return;
      const c = cells[i];
      if (c.open) return;
      c.flag = !c.flag; flags += c.flag ? 1 : -1;
      sync();
    }
    function check() {
      if (opened !== MW * MH - MINES) return;
      state = "won"; stopClock();
      cells.forEach((c) => { if (c.mine && !c.flag) c.flag = true; });
      flags = MINES;
      faceKey = "cool";
      const rec = !best || seconds < best;
      if (rec) { best = seconds; storage.set("mines-best", best); }
      msg = rec
        ? { tr: "Temizlendi! Yeni rekor: " + seconds + " sn", en: "Cleared! New record: " + seconds + " s" }
        : { tr: "Temizlendi! " + seconds + " saniye.", en: "Cleared! " + seconds + (seconds === 1 ? " second." : " seconds.") };
      msgCls = "mines__message--won";
      notifyRef.current(
        langRef.current === "en"
          ? "Minesweeper: field cleared (" + seconds + " s)" + (rec ? " — new record!" : "")
          : "Minesweeper: tarla temizlendi (" + seconds + " sn)" + (rec ? " — rekor!" : ""),
      );
    }
    function lose() {
      state = "lost"; stopClock();
      cells.forEach((c) => {
        if (c.mine && !c.flag) c.open = true;
        else if (!c.mine && c.flag) c.wrong = true;
      });
      faceKey = "dead";
      msg = { tr: "Bom! Yeniden denemek için surata tıkla.", en: "Boom! Click the face to try again." };
      msgCls = "mines__message--lost";
      sync();
    }

    /* input */
    let pressT: ReturnType<typeof setTimeout> | undefined;
    let longDone = false, focusI = 0;
    const cellOf = (e: Event) => (e.target as HTMLElement | null)?.closest<HTMLElement>(".mines__cell") ?? null;
    const cellEls = () => boardEl.querySelectorAll<HTMLButtonElement>(".mines__cell");

    function onContext(e: MouseEvent) {
      e.preventDefault();
      const b = cellOf(e);
      if (b && !longDone) toggleFlag(+(b.dataset.i ?? 0));
    }
    function onDown(e: PointerEvent) {
      const b = cellOf(e);
      if (!b || state !== "play") return;
      longDone = false;
      if (e.button === 0) setFace("oh");
      if (e.pointerType !== "mouse") {
        clearTimeout(pressT);
        pressT = setTimeout(() => {
          longDone = true;
          toggleFlag(+(b.dataset.i ?? 0));
          if (navigator.vibrate) navigator.vibrate(15);
        }, 450);
      }
    }
    function release() { clearTimeout(pressT); if (state === "play") setFace("smile"); }
    function onClick(e: MouseEvent) {
      const b = cellOf(e);
      if (!b) return;
      if (longDone) { longDone = false; return; }
      const i = +(b.dataset.i ?? 0);
      focusI = i;
      if (modeRef.current === "flag" && !cells[i].open) toggleFlag(i); else reveal(i);
    }
    function onFocus(e: FocusEvent) {
      const b = cellOf(e);
      if (b) focusI = +(b.dataset.i ?? 0);
    }
    boardEl.addEventListener("contextmenu", onContext);
    boardEl.addEventListener("pointerdown", onDown);
    boardEl.addEventListener("pointerup", release);
    boardEl.addEventListener("pointerleave", release);
    boardEl.addEventListener("pointercancel", release);
    boardEl.addEventListener("click", onClick);
    boardEl.addEventListener("focusin", onFocus);

    api.current = {
      newGame,
      toggleFlag: () => toggleFlag(focusI),
      focusMove: (k) => {
        const mv = ({ arrowup: -MW, arrowdown: MW, arrowleft: -1, arrowright: 1 } as Record<string, number>)[k];
        const nx = focusI + mv;
        if (k === "arrowleft" && focusI % MW === 0) return;
        if (k === "arrowright" && focusI % MW === MW - 1) return;
        if (nx < 0 || nx >= MW * MH) return;
        focusI = nx;
        cellEls()[nx]?.focus();
      },
    };

    newGame();
    return () => {
      stopClock();
      clearTimeout(pressT);
      boardEl.removeEventListener("contextmenu", onContext);
      boardEl.removeEventListener("pointerdown", onDown);
      boardEl.removeEventListener("pointerup", release);
      boardEl.removeEventListener("pointerleave", release);
      boardEl.removeEventListener("pointercancel", release);
      boardEl.removeEventListener("click", onClick);
      boardEl.removeEventListener("focusin", onFocus);
      api.current = null;
    };
  }, []);

  useGameKeys(winId, rootRef, (e) => {
    const a = api.current;
    if (!a) return;
    const k = e.key.toLowerCase();
    if (k === "f" || k === "2") { e.preventDefault(); a.toggleFlag(); return; }
    if (k === "n" || k === "f2") { e.preventDefault(); a.newGame(); return; }
    if (k === "arrowup" || k === "arrowdown" || k === "arrowleft" || k === "arrowright") {
      e.preventDefault();
      a.focusMove(k);
    }
  });

  function pickMode(m: Mode) { modeRef.current = m; setMode(m); }

  const rows = [];
  for (let y = 0; y < MH; y++) {
    const cols = [];
    for (let x = 0; x < MW; x++) {
      const i = idx(x, y);
      const c = view.cells[i];
      let cls = "mines__cell";
      let label = t("Kapalı", "Hidden");
      let svg: string | null = null;
      let text: string | number = "";
      let num: number | undefined;
      if (c.open) {
        cls += " mines__cell--open";
        if (c.mine) { svg = MINE_SVG; label = t("Mayın", "Mine"); if (c.hit) cls += " mines__cell--hit"; }
        else if (c.n) { text = c.n; num = c.n; label = String(c.n); }
        else label = t("Boş", "Empty");
      } else if (c.flag) {
        svg = FLAG_SVG; label = t("Bayraklı", "Flagged");
        if (c.wrong) cls += " mines__cell--wrong";
      }
      cols.push(
        svg ? (
          <button key={i} type="button" className={cls} data-i={i} role="gridcell" aria-label={label}
            dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <button key={i} type="button" className={cls} data-i={i} data-number={num} role="gridcell" aria-label={label}>
            {text}
          </button>
        ),
      );
    }
    rows.push(<div key={y} className="mines__row" role="row">{cols}</div>);
  }

  return (
    <GameShell
      rootRef={rootRef}
      variant="mines"
      title="MINESWEEPER"
      sub="96"
      right={<span className="gm__level">{t("BAŞLANGIÇ · 9×9 · 10 MAYIN", "BEGINNER · 9×9 · 10 MINES")}</span>}
      contentClass="gm__content--mines"
    >
      <div className="mines__dash">
        <div className="mines__counter"><span>{t("MAYIN", "MINES")}</span><output data-v="left">{pad(view.left)}</output></div>
        <button type="button" className="mines__reset" aria-label={t("Yeni oyun", "New game")} onClick={() => api.current?.newGame()}
          dangerouslySetInnerHTML={{ __html: FACES[view.face] }} />
        <div className="mines__counter"><span>{t("SANİYE", "SECONDS")}</span><output data-v="time">{pad(view.time)}</output></div>
      </div>
      <div className="mines__modes">
        <button type="button" data-mode="open" aria-pressed={mode === "open"} onClick={() => pickMode("open")}>{t("Aç", "Open")}</button>
        <button type="button" data-mode="flag" aria-pressed={mode === "flag"} onClick={() => pickMode("flag")}>
          <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: FLAG_SVG }} />
          {t("Bayrak", "Flag")}
        </button>
        <span data-v="best">{view.best ? t("Rekor: " + view.best + " sn", "Best: " + view.best + " s") : ""}</span>
      </div>
      <div className="mines__board" role="grid" aria-label={t("Mayın tarlası", "Minefield")} ref={boardRef}>{rows}</div>
      <p className={"mines__message" + (view.msgCls ? " " + view.msgCls : "")} aria-live="polite">{view.msg ? pick(lang, view.msg) : ""}</p>
      <p className="gm__keys">
        {t(
          "Sağ tık / F = bayrak · Sayıya tıkla = çevresini aç · Dokunmatikte basılı tut = bayrak",
          "Right-click / F = flag · Click a number = open its neighbours · Long-press on touch = flag",
        )}
      </p>
    </GameShell>
  );
}
