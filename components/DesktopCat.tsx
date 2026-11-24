"use client";
/* SerdarOS 96 — Kömür, the little black desktop cat. Owner: builder-games.
   Walks along the desktop floor (just above the taskbar), sits, idles and reacts to clicks.
   The layer itself ignores pointer events; only the sprite button is clickable. */
import { useEffect, useRef, useState } from "react";
import { useOS } from "@/components/os/OSContext";
import { useLang, type L } from "@/lib/i18n";

const NAME = "Kömür";
const SCALE = 4, GW = 18, GH = 11;
const W = GW * SCALE, H = GH * SCALE;
const COLORS: Record<string, string> = { K: "#1b221d", G: "#3a4a3f", E: "#d8e8a0", P: "#c99a9a" };

// original pixel art, facing right. K body, G soft edge, E eye, P nose
const WALK_A = [
  ".............K...K",
  "K............KK.KK",
  "K............KKKKK",
  ".K...........KEKEK",
  "..K..........KKKKP",
  "..KKKKKKKKKKKKKKK.",
  "...KKKKKKKKKKKKKK.",
  "...KKKKKKKKKKKKK..",
  "...KGKKKKKKKKKGK..",
  "...K.K......K.K...",
  "..K...K....K...K..",
];
const WALK_B = WALK_A.slice(0, 9).concat(["....KK.......KK...", "....KK.......KK..."]);
const SIT = [
  "..........K...K...",
  "..........KK.KK...",
  "..........KKKKK...",
  "..........KEKEK...",
  "..........KKKKP...",
  ".........KKKKK....",
  "........KKKKKK....",
  ".......KKKKKKK....",
  ".......KKKKKKK....",
  "..K....KKKKKKKK...",
  "...KKKKKKGKKGKK...",
];
const SIT_BLINK = SIT.slice(0, 3).concat(["..........KKKKK..."], SIT.slice(4));
const SIT_TAIL = SIT.slice(0, 8).concat([".K.....KKKKKKK....", "..K....KKKKKKKK...", "...KKKKKKGKKGKK..."]);

function svg(rows: string[]): string {
  let s = `<svg viewBox="0 0 ${GW} ${GH}" width="${W}" height="${H}" shape-rendering="crispEdges" aria-hidden="true">`;
  rows.forEach((r, y) => {
    for (let x = 0; x < r.length; x++) {
      const c = COLORS[r[x]];
      if (c) s += `<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`;
    }
  });
  return s + "</svg>";
}
const FRAMES = {
  walkA: svg(WALK_A), walkB: svg(WALK_B),
  sit: svg(SIT), blink: svg(SIT_BLINK), tail: svg(SIT_TAIL),
};
type Frame = keyof typeof FRAMES;

const QUIPS: L[] = [
  { tr: "Miyav! Kod derlendi mi?", en: "Meow! Did the code compile?" },
  { tr: "Bir SELECT * daha görürsem klavyenin üstüne yatarım.", en: "One more SELECT * and I'm lying down on the keyboard." },
  { tr: "Mama > bug fix. Bilimsel gerçek.", en: "Food > bug fix. Scientific fact." },
  { tr: "Gitarı D Standard’a indir, biraz Pantera çal.", en: "Tune down to D Standard and play some Pantera." },
  { tr: "Commit mesajını düzgün yaz, miyav.", en: "Write a proper commit message, meow." },
  { tr: "Ben de veri mühendisiyim: kutuları ETL ediyorum.", en: "I'm a data engineer too: I ETL boxes." },
  { tr: "Mrrr… şu an 7/24 çalışan bir uyku servisiyim.", en: "Mrrr… right now I'm a 24/7 sleep service." },
  { tr: "Bug buldum! …Ah, sadece bir sinekmiş.", en: "Found a bug! …Oh, it's just a fly." },
  { tr: "Mouse dedin, kulağım dikildi.", en: "You said mouse? My ears perked up." },
  { tr: "Bu masaüstü benim bölgem. Tamam mı?", en: "This desktop is my territory. Got it?" },
];
const SPEED = 46;

export default function DesktopCat() {
  const { ready, isTouch } = useOS();
  if (!ready || isTouch) return null;
  return <Cat />;
}

function Cat() {
  const { notify } = useOS();
  const { lang, t } = useLang();
  const notifyRef = useRef(notify);
  const langRef = useRef(lang);
  useEffect(() => { notifyRef.current = notify; langRef.current = lang; });

  const layerRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [frame, setFrameState] = useState<Frame>("sit");
  const [dirLeft, setDirLeft] = useState(false);
  const [jumping, setJumping] = useState(false);
  const clickRef = useRef<() => void>(() => {});

  useEffect(() => {
    const layer = layerRef.current, btn = btnRef.current;
    if (!layer || !btn) return;
    const reduced = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

    let x = 0, dir = 1, target = 0, mode: "sit" | "walk" | "jump" = "sit", modeUntil = 0, jumpT0 = 0, jumpY = 0;
    let frame: Frame = "sit", stepAcc = 0, legs = 0, raf: number | null = null, last = 0, nextQuip = 0, lastQuip = -1;
    let lastDirLeft = false;
    let jumpTimer: ReturnType<typeof setTimeout> | undefined;
    let alive = true;

    function floorBottom() {
      const tb = document.querySelector(".taskbar, footer.taskbar, [data-taskbar]");
      const h = tb && tb.getBoundingClientRect().height;
      return h && h < 200 ? h : 48;
    }
    const maxX = () => Math.max(0, window.innerWidth - W - 4);
    function setFrame(f: Frame) {
      if (f === frame) return;
      frame = f;
      setFrameState(f);
    }
    function place() {
      layer!.style.bottom = floorBottom() + "px";
      btn!.style.transform = "translate3d(" + Math.round(x) + "px," + Math.round(-jumpY) + "px,0)";
      const left = dir < 0;
      if (left !== lastDirLeft) { lastDirLeft = left; setDirLeft(left); }
    }
    function decide(now: number) {
      const r = Math.random();
      if (reduced && reduced.matches) { mode = "sit"; modeUntil = now + 4000; return; }
      if (mode === "walk" || r < 0.35) {
        mode = "sit"; modeUntil = now + 1700 + Math.random() * 3800;
      } else {
        const mx = maxX();
        const dist = 80 + Math.random() * Math.min(420, mx);
        const goRight = x < 40 ? true : x > mx - 40 ? false : Math.random() < 0.5;
        target = Math.max(0, Math.min(mx, x + (goRight ? dist : -dist)));
        dir = target >= x ? 1 : -1;
        mode = "walk"; modeUntil = Infinity;
      }
    }
    function tick(ts: number) {
      raf = null;
      if (!alive) return;
      const dt = last ? Math.min(0.1, (ts - last) / 1000) : 0;
      last = ts;
      const now = performance.now();
      const still = !!(reduced && reduced.matches);

      if (mode === "jump") {
        const t = (now - jumpT0) / 520;
        if (t >= 1) { jumpY = 0; mode = "sit"; modeUntil = now + 1500; }
        else jumpY = 4 * 34 * t * (1 - t);
        setFrame("walkA");
      } else if (mode === "walk" && !still) {
        const stepX = SPEED * dt * dir;
        x += stepX;
        stepAcc += Math.abs(stepX);
        if (stepAcc > 7) { stepAcc = 0; legs ^= 1; }
        setFrame(legs ? "walkB" : "walkA");
        if ((dir > 0 && x >= target) || (dir < 0 && x <= target)) { x = target; decide(now); }
      } else {
        // sitting / idle: occasional blink and tail flick
        const phase = Math.floor(now / 250) % 24;
        setFrame(phase === 5 ? "blink" : phase >= 14 && phase <= 16 ? "tail" : "sit");
        if (now >= modeUntil) decide(now);
      }
      x = Math.max(0, Math.min(maxX(), x));
      place();
      loop();
    }
    function loop() {
      if (raf || !alive || document.hidden) return;
      raf = requestAnimationFrame(tick);
    }

    clickRef.current = () => {
      const now = performance.now();
      if (!(reduced && reduced.matches) && mode !== "jump") {
        mode = "jump"; jumpT0 = now;
        setJumping(true);
        clearTimeout(jumpTimer);
        jumpTimer = setTimeout(() => setJumping(false), 520);
      }
      if (now < nextQuip) return;
      nextQuip = now + 1200;
      let i: number;
      do { i = Math.floor(Math.random() * QUIPS.length); } while (i === lastQuip && QUIPS.length > 1);
      lastQuip = i;
      notifyRef.current(NAME + ": " + QUIPS[i][langRef.current]);
    };

    function onVis() { last = 0; loop(); }
    function onResize() { x = Math.min(x, maxX()); place(); }
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", onResize);

    x = Math.min(maxX(), Math.max(0, window.innerWidth * 0.62));
    modeUntil = performance.now() + 2500;
    place();
    loop();

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      clearTimeout(jumpTimer);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      clickRef.current = () => {};
    };
  }, []);

  return (
    <div className="scat" ref={layerRef} aria-hidden="false">
      <button
        type="button"
        ref={btnRef}
        className={"scat__cat" + (jumping ? " scat__cat--jump" : "")}
        aria-label={NAME + t(" — masaüstü kedisi", " — the desktop cat")}
        onClick={(e) => { e.stopPropagation(); clickRef.current(); }}
        onDoubleClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.stopPropagation()}
      >
        <span className="scat__shadow" />
        <span className="scat__sprite" data-dir={dirLeft ? "left" : "right"} dangerouslySetInnerHTML={{ __html: FRAMES[frame] }} />
        <span className="scat__name">{NAME}</span>
      </button>
    </div>
  );
}
