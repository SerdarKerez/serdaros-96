/* Blog veri modeli. Her yazı lib/blog/<slug>.ts içinde `export const post: BlogPost` olarak durur. */

export type Block =
  | { type: "p"; text: string }                       // paragraf; **kalın**, *italik* ve `kod` desteklenir
  | { type: "h"; text: string }                       // ara başlık (h3)
  | { type: "img"; src: string; alt: string; caption?: string } // src: /blog/<slug>/<dosya>.svg
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "quote"; text: string; cite?: string }
  | { type: "code"; lang?: string; code: string }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "note"; text: string };                   // uyarı / bilgi kutusu

export interface BlogPost {
  slug: string;        // kebab-case, ascii
  title: string;
  date: string;        // ISO yyyy-mm-dd
  tags: string[];
  cover: string;       // /blog/<slug>/cover.svg
  coverAlt: string;
  summary: string;     // 1-2 cümle
  blocks: Block[];
}
