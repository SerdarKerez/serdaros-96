/* 16x16 pixel avatars, drawn for SerdarOS. */
import { getContent } from "@/lib/content-i18n";
import type { L } from "@/lib/i18n";

interface Art { pal: Record<string, string>; px: string[] }

const ART: Record<string, Art> = {
  guitar: { pal: { k: "#24352b", s: "#c9b98a", n: "#8a5a34", r: "#5a1e1e", R: "#b0433a", w: "#e8e4c8" }, px: [
    "......kkkk......",
    "......kssk......",
    "......kkkk......",
    ".......nn.......",
    ".......nn.......",
    ".......nn.......",
    ".......nn.......",
    "....rr.nn.rr....",
    "...rRRrnnrRRr...",
    "...rRRRnnRRRr...",
    "....rRRwwRRr....",
    "...rRRRwwRRRr...",
    "..rRRRRkkRRRRr..",
    "..rRRRRRRRRRRr..",
    "...rRRRRRRRRr...",
    "....rrrrrrrr...."] },
  cat: { pal: { k: "#24352b", g: "#d8e8a0", p: "#caa4b1" }, px: [
    "................",
    "..k.........k...",
    "..kk.......kk...",
    "..kkk.....kkk...",
    "..kkkkkkkkkkk...",
    "..kkkkkkkkkkk...",
    "..kkgkkkkkgkk...",
    "..kkgkkkkkgkk...",
    "..kkkkkpkkkkk...",
    "...kkkkkkkkk....",
    "....kkkkkkk.....",
    "...kkkkkkkkk..k.",
    "..kkkkkkkkkkk.k.",
    "..kkkkkkkkkkkk..",
    "..kkkkkkkkkkk...",
    "..kk.kk.kk.kk..."] },
  robot: { pal: { k: "#2c3d33", s: "#b9c7a6", b: "#8ccf88", m: "#5f7558", y: "#e8c46a", l: "#d8e2c3" }, px: [
    ".......yy.......",
    ".......kk.......",
    "...kkkkkkkkkk...",
    "...kssssssssk...",
    "..kksbbssbbskk..",
    "..kksbbssbbskk..",
    "...kssssssssk...",
    "...ksmmmmmmsk...",
    "...kssssssssk...",
    "...kkkkkkkkkk...",
    ".....kssssk.....",
    "..kkkkkkkkkkkk..",
    "..ksslllllllsk..",
    "..kslbmbmblssk..",
    "..ksslllllllsk..",
    "..kkkkkkkkkkkk.."] },
  skull: { pal: { w: "#ece8d2", k: "#1b2a21", g: "#a9b393" }, px: [
    "................",
    ".....wwwwww.....",
    "...wwwwwwwwww...",
    "..wwwwwwwwwwwg..",
    "..wwwwwwwwwwwg..",
    "..wwkkkwwkkkwg..",
    "..wwkkkwwkkkwg..",
    "..wwkkkwwkkkwg..",
    "...wwwwkkwwwg...",
    "....wwwkkwwg....",
    "....wwwwwwwg....",
    ".....wkwkwkg....",
    ".....wwwwwwg....",
    "......gggg......",
    "................",
    "................"] },
  planet: { pal: { p: "#3f6b3a", P: "#7fa462", L: "#c4d89a", r: "#c08a4d", R: "#e0bf9d", y: "#f2eebd" }, px: [
    "................",
    "..y.............",
    "......pppp......",
    "....pPPPPPPp....",
    "...pPPLPPPPPp...",
    "...pPLPPPPPPp...",
    ".rrrrrrrrrrrrrr.",
    "rRRRRRRRRRRRRRRr",
    ".rrrrrrrrrrrrrr.",
    "...pPPPPPPPPp...",
    "...pPPPPPPPPp...",
    "....pPPPPPPp....",
    "......pppp......",
    "............y...",
    "...y............",
    "................"] },
  dna: { pal: { b: "#4f7f9a", r: "#b0433a", w: "#c9d6b4" }, px: [
    "...b........r...",
    "....b......r....",
    ".....bwwwwr.....",
    "......b..r......",
    ".......br.......",
    "......r..b......",
    ".....rwwwwb.....",
    "....r......b....",
    "...r........b...",
    "....r......b....",
    ".....rwwwwb.....",
    "......r..b......",
    ".......rb.......",
    "......b..r......",
    ".....bwwwwr.....",
    "....b......r...."] },
};

export const AVATAR_LABELS: Record<string, L> = {
  guitar: { tr: "Gitar", en: "Guitar" }, cat: { tr: "Kedi", en: "Cat" }, robot: { tr: "Robot", en: "Robot" },
  skull: { tr: "Kafatası", en: "Skull" }, planet: { tr: "Gezegen", en: "Planet" }, dna: { tr: "DNA", en: "DNA" },
};

/** Avatar keys offered in the profile window (the list is language independent). */
const AVATARS = getContent("tr").avatars;
export const AVATAR_KEYS: string[] = (Array.isArray(AVATARS) && AVATARS.length ? AVATARS : Object.keys(ART)).filter((k) => ART[k]);

export function isAvatar(key: string | null | undefined): key is string {
  return !!key && !!ART[key];
}

const svgCache: Record<string, string> = {};

/** Static SVG string for an avatar key (falls back to guitar). */
export function avatarSvg(key: string): string {
  if (svgCache[key]) return svgCache[key];
  const a = ART[key] || ART.guitar;
  let out = "";
  a.px.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      const s = x;
      while (x < row.length && row[x] === c) x++;
      if (c !== "." && a.pal[c]) out += '<rect x="' + s + '" y="' + y + '" width="' + (x - s) + '" height="1" fill="' + a.pal[c] + '"/>';
    }
  });
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">' + out + "</svg>";
  svgCache[key] = svg;
  return svg;
}
