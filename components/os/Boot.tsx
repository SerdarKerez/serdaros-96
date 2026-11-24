"use client";
/* SerdarOS 96 — boot screen (click to boot, segmented progress, synthesized startup chime). */
import { useEffect, useRef, useState, type ReactElement } from "react";
import { getContent } from "@/lib/content-i18n";
import { LANGS, useLang } from "@/lib/i18n";

const T = { loading: 3500, logo: 1200, fade: 450 };

type Stage = "waiting" | "booting" | "logo" | "complete";

function isTouch(): boolean {
  try {
    return window.matchMedia("(pointer: coarse) and (any-hover: none)").matches;
  } catch {
    return false;
  }
}

/* ───── pixel-art logo: CRT monitor + leaning electric guitar ───── */
function logoRects(): [number, number, number, number, string][] {
  const r: [number, number, number, number, string][] = [];
  const R = (x: number, y: number, w: number, h: number, f: string) => r.push([x, y, w, h, f]);
  const K = "#0f2417", C = "#e6e4c4", S = "#b9bb98", D = "#8f9475", B = "#0d2a1c", L = "#8ccf88", M = "#c9f0a8",
    G = "#3f8a55", G2 = "#2a6a40", Rr = "#a8452f", Rd = "#6e2a1c", O = "#c99a5b", Y = "#f0d98a";

  // orbit ring behind
  for (let i = 0; i < 44; i++) {
    const a = (i / 44) * Math.PI * 2;
    const x = Math.round(22 + Math.cos(a) * 21);
    const y = Math.round(17 + Math.sin(a) * 5 - Math.cos(a) * 2);
    if (Math.sin(a) < 0.2) R(x, y, 1, 1, i % 3 ? G2 : G);
  }
  // monitor
  R(5, 3, 24, 19, K); R(6, 4, 22, 17, C); R(26, 5, 2, 16, S); R(6, 19, 22, 2, S); R(6, 4, 22, 1, "#f6f4dc");
  R(8, 6, 16, 11, K); R(9, 7, 14, 9, B);
  // screen: stars, moon, prompt, hills
  R(11, 8, 1, 1, L); R(15, 9, 1, 1, M); R(20, 8, 1, 1, L); R(18, 11, 1, 1, L);
  R(20, 9, 2, 2, Y); R(21, 9, 1, 1, B);
  R(10, 13, 1, 1, L); R(11, 13, 1, 1, M); R(10, 12, 1, 1, L); R(10, 14, 1, 1, L); // ">"
  R(13, 14, 3, 1, M); // "_"
  R(9, 15, 14, 1, G2); R(12, 14, 1, 1, G2); R(17, 14, 3, 1, G2); R(18, 13, 1, 1, G2);
  // front panel
  R(9, 18, 6, 1, D); R(23, 18, 2, 1, L); R(20, 18, 2, 1, D);
  // stand + base
  R(13, 22, 8, 2, K); R(14, 22, 6, 1, S); R(10, 24, 14, 3, K); R(11, 24, 12, 2, C); R(11, 25, 12, 1, S);
  // floppy disks
  R(1, 25, 7, 3, K); R(2, 25, 5, 2, G); R(3, 25, 3, 1, D); R(2, 23, 6, 2, K); R(3, 23, 4, 1, "#355a7a");
  // ivy on monitor top-left
  [[4, 2], [6, 2], [5, 1], [3, 4], [4, 6], [3, 8], [4, 10], [7, 1]].forEach((p, n) => {
    R(p[0], p[1], 2, 1, n % 2 ? G : G2);
    R(p[0], p[1] + 1, 1, 1, G2);
  });

  // guitar body rows [y, x1, x2]
  const body = [[15, 31, 33], [16, 30, 34], [17, 29, 34], [18, 29, 35], [19, 28, 35], [20, 27, 36], [21, 27, 36], [22, 27, 36], [23, 28, 36], [24, 28, 35], [25, 29, 35], [26, 30, 34], [27, 31, 33]];
  body.forEach((b) => R(b[1] - 1, b[0], b[2] - b[1] + 3, 1, K));
  R(30, 14, 4, 1, K); R(30, 28, 4, 1, K);
  body.forEach((b, n) => R(b[1], b[0], b[2] - b[1] + 1, 1, n < 3 ? "#c45a3c" : Rr));
  R(28, 23, 2, 2, Rd); R(35, 20, 1, 4, Rd);
  // pickguard + pickups + bridge + knobs
  R(29, 19, 3, 4, C); R(28, 21, 2, 2, C);
  R(31, 18, 4, 1, K); R(31, 21, 4, 1, K); R(31, 24, 4, 1, D); R(34, 25, 1, 1, Y); R(33, 26, 1, 1, Y);
  // neck
  for (let n = 0; n < 12; n++) {
    const nx = 32 + Math.floor(n / 2);
    const ny = 15 - n;
    R(nx, ny, 2, 1, n % 3 === 0 ? "#8a6338" : O);
    R(nx - 1, ny, 1, 1, K); R(nx + 2, ny, 1, 1, K);
  }
  // headstock
  R(36, 0, 3, 4, K); R(37, 1, 1, 2, D); R(35, 1, 1, 1, S); R(39, 2, 1, 1, S);
  // strings highlight
  R(33, 16, 1, 8, "#e8dcb0");

  // sparkles
  const spark = (x: number, y: number, f: string) => {
    R(x, y - 1, 1, 3, f);
    R(x - 1, y, 3, 1, f);
  };
  spark(2, 15, M); spark(38, 9, M); spark(33, 3, L); spark(1, 1, L);
  return r;
}

function LogoArt({ name }: { name: string }): ReactElement {
  return (
    <svg
      className="boot-logo__art"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 41 30"
      width="410"
      height="300"
      shapeRendering="crispEdges"
      role="img"
      aria-label={name + " logo"}
    >
      {logoRects().map(([x, y, w, h, f], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill={f} />
      ))}
    </svg>
  );
}

/* ───── startup chime (Web Audio) ───── */
let audio: AudioContext | null = null;

function initAudio() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    audio = new AC();
    if (audio.state === "suspended") void audio.resume();
  } catch {
    audio = null;
  }
}
function playChime() {
  if (!audio) return;
  try {
    const ctx = audio;
    const t0 = ctx.currentTime + 0.03;
    const master = ctx.createGain();
    master.gain.value = 0.6;
    const comp = ctx.createDynamicsCompressor();
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 3200;
    master.connect(lp);
    lp.connect(comp);
    comp.connect(ctx.destination);
    // simple feedback echo for a little space
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.23;
    const fb = ctx.createGain();
    fb.gain.value = 0.28;
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    delay.connect(fb);
    fb.connect(delay);
    delay.connect(wet);
    wet.connect(master);

    const note = (freq: number, start: number, dur: number, type: OscillatorType, vol: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(vol, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      o.connect(g);
      g.connect(master);
      g.connect(delay);
      o.start(start);
      o.stop(start + dur + 0.05);
    };
    // D major add9 arpeggio (D standard nod) + warm pad
    const arp = [293.66, 369.99, 440.0, 587.33, 659.25, 880.0];
    arp.forEach((f, i) => {
      note(f, t0 + i * 0.11, 1.5 - i * 0.08, "triangle", 0.16);
      note(f * 2, t0 + i * 0.11, 0.5, "sine", 0.035);
    });
    [146.83, 220.0, 293.66].forEach((f) => note(f, t0 + 0.05, 2.4, "sine", 0.09));
    note(1174.66, t0 + 0.75, 1.2, "sine", 0.05);
  } catch {
    console.info("Startup sound unavailable; continuing silently.");
  }
}
function disposeAudio() {
  if (audio) {
    try {
      void audio.close();
    } catch {
      /* noop */
    }
  }
  audio = null;
}

export default function Boot({ onDone }: { onDone: () => void }) {
  const { lang, setLang, t } = useLang();
  const owner = getContent(lang).owner;
  const NAME = owner?.os || "SerdarOS 96";
  const EDITION = owner?.edition || "Personal Edition";
  const [stage, setStage] = useState<Stage>("waiting");
  const [progress, setProgress] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const trigRef = useRef<HTMLButtonElement>(null);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    disposeAudio(); // a previous boot's chime context
    try {
      trigRef.current?.focus({ preventScroll: true });
    } catch {
      /* noop */
    }
    const list = timers;
    return () => {
      list.current.forEach((t) => {
        clearTimeout(t);
        clearInterval(t);
      });
      list.current = [];
    };
  }, []);

  const later = (fn: () => void, ms: number) => timers.current.push(setTimeout(fn, ms));

  const start = () => {
    if (stage !== "waiting") return;
    initAudio();
    setStage("booting");
    setProgress(0);
    const t0 = Date.now();
    const iv = setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - t0) / T.loading) * 100));
      setProgress(p);
      if (p >= 100) {
        clearInterval(iv);
        setStage("logo");
        later(() => {
          setStage("complete");
          playChime();
          later(() => doneRef.current(), T.fade);
        }, T.logo);
      }
    }, 100);
    timers.current.push(iv);
  };

  const touch = isTouch();
  let prompt = "";
  if (stage === "booting") prompt = "Loading " + NAME + "...";
  else if (stage === "logo") prompt = "Welcome to " + NAME;
  else if (stage === "complete") prompt = touch ? "Starting your apps..." : "Starting your desktop...";

  return (
    <div className="boot-screen" lang="en" data-stage={stage}>
      <div className="boot-screen__content">
        {stage === "waiting" ? (
          <>
            <h1 className="boot-screen__title">{NAME}</h1>
            <p className="boot-screen__edition">{EDITION}</p>
            <p className="boot-screen__prompt">
              {touch ? "Tap anywhere to boot" : "Click anywhere to boot"}
              <span className="boot-screen__cursor" aria-hidden="true">
                _
              </span>
            </p>
          </>
        ) : (
          <>
            <div className="boot-logo">
              <LogoArt name={NAME} />
              <div className="boot-logo__type" aria-hidden="true">
                <span className="boot-logo__name">{NAME.replace(/\s*96$/, "")}</span>
                <span className="boot-logo__tm">TM</span>
                <span className="boot-logo__ver">96</span>
              </div>
              <div className="boot-logo__edition" aria-hidden="true">
                {EDITION}
              </div>
            </div>
            <p className="boot-screen__prompt" aria-live="polite">
              {prompt}
            </p>
            <div className="boot-screen__loading">
              <div className="boot-screen__progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
                <div className="boot-screen__progress-fill" style={{ width: progress + "%" }}></div>
              </div>
              <span className="boot-screen__percentage">{progress}%</span>
            </div>
          </>
        )}
      </div>
      {stage === "waiting" && (
        <button ref={trigRef} type="button" className="boot-screen__trigger" aria-label={"Boot " + NAME} onClick={start} />
      )}
      {stage === "waiting" && (
        <div className="boot-screen__lang" role="group" aria-label={t("Dil", "Language")}>
          {LANGS.map((l, i) => (
            <span key={l}>
              {i > 0 && <span aria-hidden="true"> | </span>}
              <button
                type="button"
                aria-pressed={lang === l ? "true" : "false"}
                lang={l}
                title={l === "tr" ? "Türkçe" : "English"}
                onClick={(e) => {
                  e.stopPropagation();
                  setLang(l);
                }}
              >
                {l.toUpperCase()}
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
