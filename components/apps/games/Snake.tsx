"use client";
/* SerdarOS 96 — Riff Snake: a guitar pick slithers around eating notes. Owner: builder-games. */
import { useEffect, useRef, useState } from "react";
import type { AppProps } from "@/lib/os-types";
import { storage } from "@/lib/storage";
import { useOS } from "@/components/os/OSContext";
import { pick, useLang, type L } from "@/lib/i18n";
import { GameShell, onAway, setupCanvas, useGameKeys } from "./shared";

const SN = 14, CELL = 20, SNPX = SN * CELL;
type Dir = "up" | "down" | "left" | "right";
const DIRS: Record<Dir, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const KEYDIR: Record<string, Dir> = {
  arrowup: "up", w: "up", arrowdown: "down", s: "down", arrowleft: "left", a: "left", arrowright: "right", d: "right",
};
type Cell = [number, number];
type State = "ready" | "running" | "paused" | "over";

interface Api {
  turn: (d: Dir) => void;
  start: () => void;
  newGame: () => void;
  toggle: () => void;
}

export default function Snake({ winId }: AppProps) {
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
  const [msg, setMsg] = useState<{ h: L; p: L; btn: L } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas, SNPX, SNPX);
    if (!ctx) return;

    let best = +storage.get<number>("snake-best", 0) || 0;
    let snake: Cell[] = [];
    let dir: Dir = "right";
    let queue: Dir[] = [];
    let food: Cell | null = null;
    let score = 0;
    let state: State = "ready";
    let timer: ReturnType<typeof setTimeout> | null = null;
    let tick = 190;

    function placeFood() {
      const free: Cell[] = [];
      for (let y = 0; y < SN; y++)
        for (let x = 0; x < SN; x++) if (!snake.some((s) => s[0] === x && s[1] === y)) free.push([x, y]);
      food = free.length ? free[Math.floor(Math.random() * free.length)] : null;
    }
    function hud() { setScore(score); setBest(best); }
    function show(h: L, p: L, btn: L) { setMsg({ h, p, btn }); }

    function newGame() {
      const m = Math.floor(SN / 2);
      snake = [[m, m], [m - 1, m], [m - 2, m]];
      dir = "right"; queue = []; score = 0; tick = 190;
      placeFood();
      state = "ready";
      stop();
      show(
        { tr: "Riff Snake", en: "Riff Snake" },
        { tr: "Pena notaları toplasın. Duvara ya da kendine çarparsa riff biter.", en: "Guide the pick to collect notes. Hit a wall or yourself and the riff is over." },
        { tr: "Başla", en: "Start" },
      );
      draw(); hud();
    }
    function start() {
      if (state === "over") newGame();
      if (state === "running") return;
      state = "running";
      setMsg(null);
      loop();
    }
    function loop() {
      stop();
      timer = setTimeout(() => { step(); if (state === "running") loop(); }, tick);
    }
    function stop() { if (timer) { clearTimeout(timer); timer = null; } }
    function pause() {
      if (state !== "running") return;
      state = "paused"; stop();
      show(
        { tr: "Duraklatıldı", en: "Paused" },
        { tr: "Kaldığın yerden devam etmek için P ya da Boşluk.", en: "Press P or Space to pick up where you left off." },
        { tr: "Devam", en: "Resume" },
      );
    }
    function turn(d: Dir) {
      const last = queue.length ? queue[queue.length - 1] : dir;
      const a = DIRS[last], b = DIRS[d];
      if (a[0] + b[0] === 0 && a[1] + b[1] === 0) return;
      if (d === last) return;
      if (queue.length < 2) queue.push(d);
      if (state === "ready" || state === "paused") start();
    }
    function step() {
      if (queue.length) dir = queue.shift() as Dir;
      const v = DIRS[dir];
      const head: Cell = [snake[0][0] + v[0], snake[0][1] + v[1]];
      const eating = !!food && head[0] === food[0] && head[1] === food[1];
      const body = eating ? snake : snake.slice(0, -1);
      const hit = head[0] < 0 || head[1] < 0 || head[0] >= SN || head[1] >= SN ||
        body.some((s) => s[0] === head[0] && s[1] === head[1]);
      if (hit) { gameOver(); return; }
      snake.unshift(head);
      if (eating) {
        score++;
        if (score % 4 === 0) tick = Math.max(95, tick - 12);
        placeFood();
        if (!food) { win(); return; }
      } else snake.pop();
      hud(); draw();
    }
    function gameOver() {
      state = "over"; stop();
      const rec = score > best;
      if (rec) { best = score; storage.set("snake-best", best); }
      hud(); draw(true);
      show(
        rec ? { tr: "Yeni rekor!", en: "New high score!" } : { tr: "Riff bitti", en: "Riff over" },
        {
          tr: score + " nota topladın." + (rec ? " Sahne senin." : " Bir tur daha?"),
          en: "You collected " + score + (score === 1 ? " note." : " notes.") + (rec ? " The stage is yours." : " One more round?"),
        },
        { tr: "Tekrar çal", en: "Play again" },
      );
      if (rec && score > 0)
        notifyRef.current(
          langRef.current === "en" ? "Riff Snake: new high score — " + score + (score === 1 ? " note!" : " notes!") : "Riff Snake: yeni rekor — " + score + " nota!",
        );
    }
    function win() {
      state = "over"; stop();
      best = Math.max(best, score); storage.set("snake-best", best);
      hud(); draw();
      show({ tr: "Solo tamam!", en: "Solo complete!" }, { tr: "Tahtayı doldurdun. Efsane.", en: "You filled the board. Legendary." }, { tr: "Tekrar çal", en: "Play again" });
    }

    /* drawing */
    function pick(x: number, y: number, d: Dir, dead?: boolean) {
      const cx = x * CELL + CELL / 2, cy = y * CELL + CELL / 2;
      const ang = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 }[d];
      ctx!.save();
      ctx!.translate(cx, cy); ctx!.rotate(ang);
      ctx!.beginPath(); // rounded triangle, tip forward
      ctx!.moveTo(11, 0);
      ctx!.quadraticCurveTo(2, 9, -8, 9);
      ctx!.quadraticCurveTo(-12, 0, -8, -9);
      ctx!.quadraticCurveTo(2, -9, 11, 0);
      ctx!.fillStyle = dead ? "#9d4d4d" : "#b8743e";
      ctx!.fill();
      ctx!.lineWidth = 1.5; ctx!.strokeStyle = "#4e2c17"; ctx!.stroke();
      ctx!.fillStyle = "#f3d9a4";
      ctx!.fillRect(-5, -5, 3, 2); ctx!.fillRect(-5, 3, 3, 2); // eyes / shine
      ctx!.restore();
    }
    function note(x: number, y: number) {
      const px = x * CELL, py = y * CELL;
      ctx!.fillStyle = "#243e2b";
      ctx!.fillRect(px + 10, py + 3, 2, 11); // stem
      ctx!.fillRect(px + 12, py + 3, 4, 2); // flag
      ctx!.fillRect(px + 14, py + 5, 2, 3);
      ctx!.fillRect(px + 5, py + 12, 6, 4); // head
      ctx!.fillRect(px + 6, py + 11, 4, 6);
    }
    function draw(dead?: boolean) {
      ctx!.clearRect(0, 0, SNPX, SNPX);
      if (food) note(food[0], food[1]);
      for (let i = snake.length - 1; i > 0; i--) {
        const s = snake[i];
        ctx!.fillStyle = i % 2 ? "#3f6b3e" : "#4e7c47";
        ctx!.fillRect(s[0] * CELL + 2, s[1] * CELL + 2, CELL - 4, CELL - 4);
        ctx!.fillStyle = "#c9d6a3"; // string line
        ctx!.fillRect(s[0] * CELL + 2, s[1] * CELL + CELL / 2 - 1, CELL - 4, 1);
      }
      pick(snake[0][0], snake[0][1], dir, dead);
    }

    api.current = {
      turn, start, newGame,
      toggle: () => (state === "running" ? pause() : start()),
    };

    /* swipe / tap on the board */
    let sx = 0, sy = 0, swiping = false;
    function pdown(e: PointerEvent) { sx = e.clientX; sy = e.clientY; swiping = true; }
    function pup(e: PointerEvent) {
      if (!swiping) return;
      swiping = false;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) { if (state !== "running") start(); return; }
      turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
    }
    canvas.addEventListener("pointerdown", pdown);
    canvas.addEventListener("pointerup", pup);

    const unAway = onAway(pause);
    newGame();
    return () => {
      stop();
      unAway();
      canvas.removeEventListener("pointerdown", pdown);
      canvas.removeEventListener("pointerup", pup);
      api.current = null;
    };
  }, []);

  useGameKeys(winId, rootRef, (e) => {
    const a = api.current;
    if (!a) return;
    const k = e.key.toLowerCase();
    if (KEYDIR[k]) { e.preventDefault(); a.turn(KEYDIR[k]); return; }
    if (k === "p") { e.preventDefault(); a.toggle(); return; }
    if (k === " " || k === "enter") {
      const t = e.target as HTMLElement | null;
      if (t && t.tagName === "BUTTON" && rootRef.current?.contains(t)) return;
      e.preventDefault(); a.toggle();
    }
  });

  return (
    <GameShell
      rootRef={rootRef}
      variant="snake"
      title="RIFF SNAKE"
      sub="96"
      right={<button type="button" className="gm__btn" data-act="new" onClick={() => api.current?.newGame()}>{t("Yeni oyun", "New game")}</button>}
    >
      <div className="gm__score">
        <span>{t("Nota", "Notes")}<strong data-v="score">{score}</strong></span>
        <span>{t("Rekor", "Best")}<strong data-v="best">{best}</strong></span>
      </div>
      <div className="gm__board gm__board--snake">
        <canvas ref={canvasRef} width={280} height={280} aria-label={t("Yılan oyun alanı", "Snake game board")} />
      </div>
      <div className="gm__message" hidden={!msg}>
        <h3>{msg ? pick(lang, msg.h) : null}</h3>
        <p>{msg ? pick(lang, msg.p) : null}</p>
        <button type="button" className="gm__btn" data-act="go" onClick={() => api.current?.start()}>{msg ? pick(lang, msg.btn) : t("Başla", "Start")}</button>
      </div>
      <div className="gm__controls" aria-label={t("Yön tuşları", "Direction keys")}>
        <button type="button" className="gm__btn gm__up" data-dir="up" aria-label={t("Yukarı", "Up")} onClick={() => api.current?.turn("up")}>▲</button>
        <button type="button" className="gm__btn gm__left" data-dir="left" aria-label={t("Sol", "Left")} onClick={() => api.current?.turn("left")}>◀</button>
        <button type="button" className="gm__btn gm__down" data-dir="down" aria-label={t("Aşağı", "Down")} onClick={() => api.current?.turn("down")}>▼</button>
        <button type="button" className="gm__btn gm__right" data-dir="right" aria-label={t("Sağ", "Right")} onClick={() => api.current?.turn("right")}>▶</button>
      </div>
      <p className="gm__keys">{t("Ok tuşları / WASD · P duraklat · Boşluk başlat · Dokunmatikte kaydır", "Arrow keys / WASD · P pause · Space start · Swipe on touch")}</p>
    </GameShell>
  );
}
