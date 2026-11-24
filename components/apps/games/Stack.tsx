"use client";
/* SerdarOS 96 — Box Stack: drop swinging boxes, keep the tower straight. Owner: builder-games. */
import { useEffect, useRef, useState } from "react";
import type { AppProps } from "@/lib/os-types";
import { storage } from "@/lib/storage";
import { useOS } from "@/components/os/OSContext";
import { pick, useLang, type L } from "@/lib/i18n";
import { GameShell, onAway, prefersReduced, setupCanvas, useGameKeys } from "./shared";

const BW = 320, BH = 350, BOXH = 26, GROUND = 20, START_W = 150, PERFECT = 5, MIN_W = 6;
const COLS = [["#c79a63", "#8a6238"], ["#b98d58", "#7a5530"], ["#d1a872", "#8f6a3d"]];

interface Box { x: number; w: number; hue: number }
interface Mover extends Box { dir: number }
interface Falling extends Box { y0: number; y1: number; t: number }
interface Debris extends Box { y: number; vy: number; rot: number; vr: number; a: number }
type State = "play" | "paused" | "over" | "closed";

interface Api { drop: () => void; newGame: () => void; pauseKey: () => void; run: () => void }

export default function Stack({ winId }: AppProps) {
  const { notify } = useOS();
  const { lang, t } = useLang();
  const notifyRef = useRef(notify);
  const langRef = useRef(lang);
  useEffect(() => { notifyRef.current = notify; langRef.current = lang; });

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const api = useRef<Api | null>(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [msg, setMsg] = useState<{ t: L; cls?: string }>({ t: { tr: "Kutuyu bırakmak için tıkla.", en: "Click to drop the box." } });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, BW, BH);
    if (!ctx) return;
    const REDUCED = prefersReduced();

    let best = +storage.get<number>("stack-best", 0) || 0;
    let tower: Box[] = [];
    let mover: Mover | null = null;
    let falling: Falling | null = null;
    let debris: Debris[] = [];
    let cam = 0, camTarget = 0, streak = 0;
    let state: State = "play";
    let raf: number | null = null, last = 0;

    const speed = () => 88 + 9 * Math.min(tower.length - 1, 30);
    const topY = (n: number) => BH - GROUND - n * BOXH; // y of the top edge of box index n-1
    const hoverY = () => Math.min(topY(tower.length) - BOXH - 46, 40 - cam);

    function newGame() {
      tower = [{ x: (BW - START_W) / 2, w: START_W, hue: 0 }];
      debris = []; falling = null; cam = 0; camTarget = 0; streak = 0;
      state = "play";
      spawn();
      say({ tr: "Kutuyu bırakmak için tıkla.", en: "Click to drop the box." });
      hud(); run();
    }
    function spawn() {
      const t = tower[tower.length - 1];
      const fromLeft = tower.length % 2 === 0;
      mover = { x: fromLeft ? 0 : BW - t.w, w: t.w, dir: fromLeft ? 1 : -1, hue: tower.length };
    }
    function hud() { setScore(tower.length - 1); setBest(best); }
    function say(text: L, cls?: string) { setMsg({ t: text, cls }); }

    function drop() {
      if (state === "over") { newGame(); return; }
      if (state === "paused") { state = "play"; say({ tr: "", en: "" }); run(); return; }
      if (state !== "play" || falling || !mover) return;
      falling = { x: mover.x, w: mover.w, hue: mover.hue, y0: hoverY(), y1: topY(tower.length + 1), t: 0 };
      mover = null;
    }
    function land() {
      const f = falling as Falling;
      falling = null;
      const t = tower[tower.length - 1];
      const y = topY(tower.length + 1);
      if (Math.abs(f.x - t.x) <= PERFECT) {
        tower.push({ x: t.x, w: t.w, hue: f.hue });
        streak++;
        say(streak > 1 ? { tr: "Mükemmel! x" + streak, en: "Perfect! x" + streak } : { tr: "Mükemmel!", en: "Perfect!" }, "perfect");
      } else {
        streak = 0;
        const l = Math.max(f.x, t.x), r = Math.min(f.x + f.w, t.x + t.w), ov = r - l;
        if (ov < MIN_W) {
          debris.push({ x: f.x, w: f.w, y, vy: 0, rot: 0, vr: (f.x < t.x ? -1 : 1) * 3, hue: f.hue, a: 1 });
          lose();
          return;
        }
        const cut = f.x < t.x ? { x: f.x, w: t.x - f.x } : { x: r, w: f.x + f.w - r };
        debris.push({ x: cut.x, w: cut.w, y, vy: 0, rot: 0, vr: (f.x < t.x ? -1 : 1) * 2.5, hue: f.hue, a: 1 });
        tower.push({ x: l, w: ov, hue: f.hue });
        say(ov < 40 ? { tr: "Dikkat, kule inceliyor…", en: "Careful, the tower is getting thin…" } : { tr: "Güzel!", en: "Nice!" });
      }
      camTarget = Math.max(0, tower.length * BOXH - 170);
      hud();
      spawn();
    }
    function lose() {
      state = "over";
      const n = tower.length - 1;
      const rec = n > best;
      if (rec) { best = n; storage.set("stack-best", best); }
      hud();
      const boxes = n + (n === 1 ? " box" : " boxes");
      say(
        {
          tr: (rec ? "Yeni rekor! " : "Kule devrildi. ") + n + " kutu — tekrar için tıkla.",
          en: (rec ? "New high score! " : "The tower fell. ") + boxes + " — click to try again.",
        },
        rec ? "perfect" : "lost",
      );
      if (rec && n > 0)
        notifyRef.current(langRef.current === "en" ? "Box Stack: new high score — " + boxes + "!" : "Box Stack: yeni rekor — " + n + " kutu!");
    }
    function pause() {
      if (state !== "play") return;
      state = "paused";
      say({ tr: "Duraklatıldı — devam için tıkla ya da P.", en: "Paused — click or press P to continue." });
    }

    function update(dt: number) {
      if (state === "play") {
        if (mover) {
          mover.x += mover.dir * speed() * dt;
          if (mover.x <= 0) { mover.x = 0; mover.dir = 1; }
          if (mover.x + mover.w >= BW) { mover.x = BW - mover.w; mover.dir = -1; }
        }
        if (falling) {
          falling.t += dt / (REDUCED ? 0.08 : 0.28);
          if (falling.t >= 1) land();
        }
      }
      cam += (camTarget - cam) * Math.min(1, dt * 6);
      debris = debris.filter((d) => {
        d.vy += 900 * dt; d.y += d.vy * dt; d.rot += d.vr * dt; d.a -= dt * 1.4;
        return d.a > 0 && d.y < BH + 200 - cam;
      });
    }

    function box(x: number, y: number, w: number, hue: number) {
      const c = COLS[hue % COLS.length];
      ctx!.fillStyle = c[0]; ctx!.fillRect(x, y, w, BOXH);
      ctx!.fillStyle = c[1]; ctx!.fillRect(x, y + BOXH - 3, w, 3); ctx!.fillRect(x + w - 2, y, 2, BOXH);
      ctx!.fillStyle = "#ecd9a8"; ctx!.fillRect(x, y, w, 2); // top highlight
      if (w > 16) { ctx!.fillStyle = "#e5cf95"; ctx!.fillRect(x + w / 2 - 4, y, 8, BOXH - 3); } // tape
      ctx!.strokeStyle = "#5b3f22"; ctx!.lineWidth = 1; ctx!.strokeRect(x + 0.5, y + 0.5, w - 1, BOXH - 1);
    }
    function render() {
      const c = ctx!;
      c.clearRect(0, 0, BW, BH);
      c.save();
      c.translate(0, cam);
      // ground
      c.fillStyle = "#8fa773"; c.fillRect(0, BH - GROUND, BW, GROUND + 400);
      c.fillStyle = "#6f8a57"; c.fillRect(0, BH - GROUND, BW, 2);
      tower.forEach((b, i) => box(b.x, topY(i + 1), b.w, b.hue));
      if (falling) {
        const e = falling.t * falling.t;
        box(falling.x, falling.y0 + (falling.y1 - falling.y0) * Math.min(1, e), falling.w, falling.hue);
      }
      if (mover) box(mover.x, hoverY(), mover.w, mover.hue);
      debris.forEach((d) => {
        c.save(); c.globalAlpha = Math.max(0, d.a);
        c.translate(d.x + d.w / 2, d.y + BOXH / 2); c.rotate(d.rot);
        box(-d.w / 2, -BOXH / 2, d.w, d.hue);
        c.restore();
      });
      c.restore();
      if (state === "paused" || state === "over") {
        c.fillStyle = "rgba(247,245,231,.85)";
        c.fillRect(32, 140, BW - 64, 58);
        c.strokeStyle = "#a5b78a"; c.strokeRect(32.5, 140.5, BW - 65, 57);
        c.fillStyle = "#4d6a43"; c.font = "26px VT323, monospace"; c.textAlign = "center";
        const en = langRef.current === "en";
        c.fillText(state === "paused" ? (en ? "PAUSED" : "DURAKLATILDI") : (en ? "GAME OVER — " : "OYUN BİTTİ — ") + (tower.length - 1), BW / 2, 176);
      }
    }

    function frame(ts: number) {
      raf = null;
      if (state === "closed") return;
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
      last = ts;
      update(dt); render();
      const busy = state === "play" || debris.length > 0 || Math.abs(camTarget - cam) > 0.5;
      if (busy) raf = requestAnimationFrame(frame); else last = 0;
    }
    function run() { if (!raf && state !== "closed") { last = 0; raf = requestAnimationFrame(frame); } }

    api.current = {
      drop, newGame, run,
      pauseKey: () => { if (state === "play") pause(); else if (state === "paused") drop(); },
    };

    function pdown(e: PointerEvent) { e.preventDefault(); drop(); run(); }
    canvas.addEventListener("pointerdown", pdown);
    const unAway = onAway(() => { pause(); run(); });

    newGame();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      state = "closed";
      canvas.removeEventListener("pointerdown", pdown);
      unAway();
      api.current = null;
    };
  }, []);

  // repaint the canvas overlay text when the language changes
  useEffect(() => {
    api.current?.run();
  }, [lang]);

  useGameKeys(winId, rootRef, (e) => {
    const a = api.current;
    if (!a) return;
    const k = e.key.toLowerCase();
    if (k === " " || k === "enter") {
      const t = e.target as HTMLElement | null;
      if (t && t.tagName === "BUTTON" && rootRef.current?.contains(t)) return;
      e.preventDefault(); a.drop(); a.run();
    } else if (k === "p") {
      e.preventDefault(); a.pauseKey(); a.run();
    }
  });

  return (
    <GameShell
      rootRef={rootRef}
      variant="stack"
      title="BOX STACK"
      sub="96"
      right={
        <button type="button" className="gm__btn" data-act="new" onClick={() => { api.current?.newGame(); api.current?.run(); }}>
          {t("Yeni oyun", "New game")}
        </button>
      }
    >
      <div className="gm__score">
        <span>{t("Kule", "Tower")}<strong data-v="score">{score}</strong></span>
        <span>{t("Rekor", "Best")}<strong data-v="best">{best}</strong></span>
      </div>
      <div className="gm__board gm__board--stack">
        <canvas ref={canvasRef} aria-label={t("Kule oyun alanı", "Tower game board")} />
      </div>
      <p className={"stack__message" + (msg.cls ? " stack__message--" + msg.cls : "")} aria-live="polite">{pick(lang, msg.t)}</p>
      <button type="button" className="gm__btn stack__drop" data-act="drop" onClick={() => { api.current?.drop(); api.current?.run(); }}>
        {t("Bırak", "Drop")}
      </button>
      <p className="gm__keys">
        {t("Boşluk / Enter / tıkla = bırak · ±", "Space / Enter / click = drop · ±")}
        {PERFECT}
        {t(" px = Mükemmel · P duraklat", " px = Perfect · P pause")}
      </p>
    </GameShell>
  );
}
