/* SerdarOS 96 — pixel-art icon set (original drawings, 16x16 grid scaled to a 32x32 viewBox, crispEdges). */
const PAL: Record<string, string> = {
  k: '#1d3324', // outline
  d: '#36573a', // dark green
  g: '#5d8250', // green
  l: '#9fbf7f', // light green
  m: '#c4d8a2', // mint highlight
  c: '#eef0d6', // cream
  w: '#fffbe6', // white cream
  s: '#b5c29c', // sage grey
  t: '#7f9070', // grey green
  b: '#173a28', // screen dark
  y: '#e0c46a', // warm yellow
  r: '#b4674a', // terracotta
  o: '#c08a4d', // ochre / wood
  n: '#7a4a2c', // brown
  u: '#8fb7b0', // muted sky
  e: '#e6c3a0', // skin
  p: '#caa4b1'  // dusty pink
};

/** rows of palette chars -> svg string */
export function px(rows: string[]): string {
  let size = 0;
  rows.forEach((r) => { size = Math.max(size, r.length); });
  const s = size > 16 ? 1 : 2;
  let out = "";
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === "." || ch === " " || !PAL[ch]) { x++; continue; }
      let n = 1;
      while (row[x + n] === ch) n++;
      out += '<rect x="' + x * s + '" y="' + y * s + '" width="' + n * s + '" height="' + s + '" fill="' + PAL[ch] + '"/>';
      x += n;
    }
  });
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges" class="px-icon" aria-hidden="true" focusable="false">' + out + "</svg>";
}

const I: Record<string, string> = {};

I.computer = px([
  '................',
  '.kkkkkkkkkkkkkk.',
  '.kcccccccccccck.',
  '.kcbbbbbbbbbbsk.',
  '.kcbllbbbbbbbsk.',
  '.kcbbbbbbbbbbsk.',
  '.kcbmllblbbbbsk.',
  '.kcbbbbbbbbbbsk.',
  '.kcblbbbbbbbbsk.',
  '.kcbbbbbbbbbbsk.',
  '.kcccccccccgcsk.',
  '.kssssssssssssk.',
  '.kkkkkkkkkkkkkk.',
  '.....kssssk.....',
  '...kkssssssskk..',
  '...kkkkkkkkkkk..'
]);

I.folder = px([
  '................',
  '................',
  '.kkkkk..........',
  'kmmmmmk.........',
  'kllllllkkkkkkkk.',
  'kccccccccccccck.',
  'kllllllllllllllk',
  'kmmmmmmmmmmmmmlk',
  'klllllllllllllgk',
  'kllllllkklllllgk',
  'klllllkddklllllk',
  'kllllllkklllllgk',
  'klllllllllllllgk',
  'kgggggggggggggdk',
  'kkkkkkkkkkkkkkkk',
  '................'
]);

I.notes = px([
  '................',
  '.....kkkkkkkk...',
  '.kkkkkwwwwwwk...',
  'kmmmkwgggggwk...',
  'kllllwwwwwwwkkk.',
  'kccccwggggwwcck.',
  'kllllllllllllllk',
  'kmmmmmmmmmmmmmlk',
  'klllllllllllllgk',
  'kllllllkklllllgk',
  'klllllkddklllllk',
  'kllllllkklllllgk',
  'klllllllllllllgk',
  'kgggggggggggggdk',
  'kkkkkkkkkkkkkkkk',
  '................'
]);

I.text = px([
  '................',
  '..kkkkkkkkk.....',
  '..kwwwwwwwkk....',
  '..kwwwwwwwkck...',
  '..kwggggwwkkkk..',
  '..kwwwwwwwwwck..',
  '..kwggggggggck..',
  '..kwwwwwwwwwck..',
  '..kwgggggggwck..',
  '..kwwwwwwwwwck..',
  '..kwggggggggck..',
  '..kwwwwwwwwwck..',
  '..kwgggggwwwck..',
  '..kccccccccccsk.',
  '..kkkkkkkkkkkk..',
  '................'
]);

I.trash = px([
  '................',
  '......kkkk......',
  '..kkkkkllkkkkk..',
  '..kmmmmmmmmmlk..',
  '..kkkkkkkkkkkk..',
  '...kmglglglgk...',
  '...kmglglglgk...',
  '...kmglglglgk...',
  '...kmglglglgk...',
  '...kmglglglgk...',
  '...kmglglglgk...',
  '...kmglglglgk...',
  '...kmglglglgk...',
  '...kgggggggdk...',
  '....kkkkkkkk....',
  '................'
]);

I.calculator = px([
  '................',
  '..kkkkkkkkkkkk..',
  '..kssssssssssk..',
  '..ksbbbbbbbbsk..',
  '..ksbbbbbllbsk..',
  '..ksbbbbbbbbsk..',
  '..kssssssssssk..',
  '..ksccsccsrrsk..',
  '..ksccsccsrrsk..',
  '..kssssssssssk..',
  '..ksccsccsrrsk..',
  '..ksccsccsrrsk..',
  '..kssssssssssk..',
  '..ksccsccsggsk..',
  '..kkkkkkkkkkkk..',
  '................'
]);

I.photos = px([
  '................',
  '................',
  '.kkkkkkkkkkkkkk.',
  '.kcccccccccccck.',
  '.kcuuuuuuuuuuck.',
  '.kcuuuuuuuyyuck.',
  '.kcuuuuuuuyyuck.',
  '.kcuuuluuuuuuck.',
  '.kcuuglluuuuuck.',
  '.kcugggllulluck.',
  '.kcggggggglllck.',
  '.kcddddddddddck.',
  '.kcccccccccccck.',
  '.kkkkkkkkkkkkkk.',
  '................',
  '................'
]);

I.mail = px([
  '................',
  '................',
  '.............gg.',
  '.kkkkkkkkkkkgmmg',
  '.kkcccccccckkgg.',
  '.kckcccccckckk..',
  '.kcckcccckccck..',
  '.kccckcckcccck..',
  '.kcccckkccccck..',
  '.kccccccccccck..',
  '.kccccccccccck..',
  '.kssssssssssssk.',
  '.kkkkkkkkkkkkkk.',
  '................',
  '................',
  '................'
]);

I.games = px([
  '................',
  '................',
  '................',
  '................',
  '..kkkkk..kkkkk..',
  '.klmmmlkklmmmlk.',
  'kllkllllllllrllk',
  'klkkkllllllrlrlk',
  'kllkllllllllrllk',
  'kllllllkkllllllk',
  'kllllkk..kkllllk',
  'kgggk......kgggk',
  '.kkk........kkk.',
  '................',
  '................',
  '................'
]);

I.help = px([
  '.....kkkkkk.....',
  '...kkggggggkk...',
  '..kggggggggggk..',
  '.kggggccccggggk.',
  '.kgggccggccgggk.',
  'kggggggggccggggk',
  'kgggggggccgggggk',
  'kggggggccggggggk',
  'kggggggccggggggk',
  'kggggggggggggggk',
  '.kggggggccggggk.',
  '.kggggggccggggk.',
  '..kggggggggggk..',
  '...kkddddddkk...',
  '.....kkkkkk.....',
  '................'
]);

I.user = px([
  '................',
  '................',
  '.....kkkkkk.....',
  '....kkkkkkkk....',
  '....kkeeeekk....',
  '....keeeeeek....',
  '....kekeekek....',
  '....keeeeeek....',
  '.....keddek.....',
  '......keek......',
  '...kkkggggkkk...',
  '..kggglmmlgggk..',
  '.kgggggllgggggk.',
  '.kgggggggggggggk',
  '.kkkkkkkkkkkkkk.',
  '................'
]);

I.restart = px([
  '................',
  '......dddd......',
  '....dddddddd.d..',
  '...ddd....ddddd.',
  '..dd.......dddd.',
  '..dd......ddddd.',
  '.dd.............',
  '.dd.............',
  '.dd.........dd..',
  '.dd.........dd..',
  '..dd.......dd...',
  '..ddd.....ddd...',
  '...dddddddddd...',
  '.....dddddd.....',
  '................',
  '................'
]);

I.snake = px([
  '................',
  '.kkkkkkkkkkkkkk.',
  '.kbbbbbbbbbbbbk.',
  '.kbmlllllllbbbk.',
  '.kbllllllllbbbk.',
  '.kbbbbbbbllbbbk.',
  '.kbbbbbbbllbbbk.',
  '.kbbllllllllbbk.',
  '.kbbllllllllbbk.',
  '.kbbllbbbbbbbbk.',
  '.kbbllbbbbbrrbk.',
  '.kbbbbbbbbbrrbk.',
  '.kkkkkkkkkkkkkk.',
  '.....kssssk.....',
  '...kkkkkkkkkk...',
  '................'
]);

I.mines = px([
  '........k.......',
  '........k.......',
  '...k...kkk...k..',
  '....k.kkkkk.k...',
  '.....kkkkkkk....',
  '....kkwwkkkkk...',
  '....kkwkkkkkk...',
  '.kkkkkkkkkkkkkkk',
  '....kkkkkkkkk...',
  '....kkkkkkkkk...',
  '.....kkkkkkk....',
  '....k.kkkkk.k...',
  '...k...kkk...k..',
  '........k.......',
  '........k.......',
  '................'
]);

I.stack = px([
  '................',
  '.....kkkkkkkk...',
  '.....kooyyook...',
  '.....kooooook...',
  '.....kkkkkkkk...',
  '...kkkkkkkkkk...',
  '...koooyyooonk..',
  '...koooooooonk..',
  '...kkkkkkkkkkk..',
  '..kkkkkkkkkkkk..',
  '..koooooyyooonk.',
  '..kooooooooooonk',
  '..koooooooooonk.',
  '..knnnnnnnnnnnk.',
  '..kkkkkkkkkkkkk.',
  '................'
]);

I.desktop = px([
  '................',
  '..kkkkkkkkkkkk..',
  '..kbbbbbbbbbbk..',
  '..kbllbbbbbbbk..',
  '..kbbbbbbbbbbk..',
  '..kbllbbbbbbbk..',
  '..kbbbbbbbbbbk..',
  '..kggggggggggk..',
  '..kkkkkkkkkkkk..',
  '......kssk......',
  '....kkkkkkkk....',
  '................',
  '................',
  '................',
  '................',
  '................'
]);

/* avatars (CONTENT.avatars) */
I['avatar-guitar'] = px([
  '............kk..',
  '...........kddk.',
  '...........kok..',
  '..........kok...',
  '.........kok....',
  '........kok.....',
  '...kkk.kok......',
  '..krrrkkk.......',
  '.krrrrrrk.......',
  '..krkkkrk.......',
  '.krrrrrrrk......',
  'krrkkkkrrk......',
  'krrrrrrryk......',
  '.kkrrrrrk.......',
  '...kkkkk........',
  '................'
]);
I['avatar-cat'] = px([
  '................',
  '..kk........kk..',
  '..kkk......kkk..',
  '..kkkkkkkkkkkk..',
  '.kkkkkkkkkkkkkk.',
  '.kkkkkkkkkkkkkk.',
  '.kkkmmkkkkmmkkk.',
  '.kkkmlkkkklmkkk.',
  '.kkkkkkkkkkkkkk.',
  '.kkkkkkppkkkkkk.',
  '.kkkkkkkkkkkkkk.',
  '..kkkkkkkkkkkk..',
  '...kkkkkkkkkk...',
  '................',
  '................',
  '................'
]);
I['avatar-robot'] = px([
  '.......kk.......',
  '.......yy.......',
  '.......kk.......',
  '...kkkkkkkkkk...',
  '...kssssssssk...',
  '..kksbbssbbskk..',
  '..kksbyssybskk..',
  '...kssssssssk...',
  '...ksskkkkssk...',
  '...kssssssssk...',
  '...kkkkkkkkkk...',
  '.....kttttk.....',
  '..kkkkkkkkkkkk..',
  '..kgglmmmmlggk..',
  '..kggggggggggk..',
  '..kkkkkkkkkkkk..'
]);
I['avatar-skull'] = px([
  '................',
  '....kkkkkkkk....',
  '...kwwwwwwwwk...',
  '..kwwwwwwwwwwk..',
  '..kwwwwwwwwwwk..',
  '..kwkkkwwkkkwk..',
  '..kwkkkwwkkkwk..',
  '..kwwwwkkwwwwk..',
  '...kwwwkkwwwk...',
  '....kwwwwwwk....',
  '....kwkwkwkk....',
  '....kkkkkkkk....',
  '................',
  '................',
  '................',
  '................'
]);
I['avatar-planet'] = px([
  '................',
  '..............y.',
  '.....kkkkkk.....',
  '...kkllmmllkk...',
  '..kllmmllllggkyy',
  '..kllllllllggyy.',
  '.klllllllgggyyk.',
  'kkllllllgyyyygk.',
  '.kllllyyyyggggk.',
  'yyyyyyyllgggggk.',
  'yyklllllgggggk..',
  '..kglllggggddk..',
  '...kkgggggddk...',
  '.....kkkkkk.....',
  '.y..............',
  '................'
]);
I['avatar-dna'] = px([
  '................',
  '...kk......kk...',
  '...kgk....kyk...',
  '....kgk..kyk....',
  '.....kgllyk.....',
  '......kgyk......',
  '.....kyllgk.....',
  '....kykkkkgk....',
  '...kykmmmmkgk...',
  '....kykkkkgk....',
  '.....kyllgk.....',
  '......kygk......',
  '.....kgllyk.....',
  '....kgk..kyk....',
  '...kgk....kyk...',
  '...kk......kk...'
]);

/* aliases */
I.projects = I.folder;
I.recycle = I.trash;
I.about = I.text;
I.welcome = I.text;
I.notepad = I.text;
I.copyright = I.text;
I.privacy = I.text;
I.email = I.mail;
I.profile = I.user;
I.calc = I.calculator;
I.photo = I.photos;
I.minesweeper = I.mines;
I.cat = I['avatar-cat'];


export const ICONS: Record<string, string> = I;
export const ICONS_PALETTE = PAL;

/** Icon by key (falls back to "text"). Renders the svg inside a span; without className the span is display:contents. */
export function Icon({ name, size, className }: { name: string; size?: number; className?: string }) {
  let svg = ICONS[name] || ICONS.text || "";
  if (size) svg = svg.replace(/width="32" height="32"/, `width="${size}" height="${size}"`);
  return (
    <span className={className} style={className ? undefined : { display: "contents" }} dangerouslySetInnerHTML={{ __html: svg }} />
  );
}

/** Inline an svg string with no layout box of its own (an <i> with display:contents), for spots where the
 *  vanilla markup had the bare svg — keeps span-based selectors such as `> span:first-of-type` intact. */
export function RawSvg({ svg }: { svg: string }) {
  return <i style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: svg }} />;
}
