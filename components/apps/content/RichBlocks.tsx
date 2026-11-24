"use client";
/* Shared rich-text block renderer (blog posts and project pages). Block model: lib/blog/types.ts. */
import { Fragment, type ReactNode } from "react";
import type { Block } from "@/lib/blog/types";

/** Inline markup: **bold**, *italic* and `code`. Everything else is plain text (no HTML injection). */
export function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) return <code key={i}>{part.slice(1, -1)}</code>;
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "p":
      return <p>{inline(block.text)}</p>;
    case "h":
      return <h3>{inline(block.text)}</h3>;
    case "img":
      return (
        <figure className="blog-post__figure">
          {/* eslint-disable-next-line @next/next/no-img-element -- static local SVG illustrations */}
          <img src={block.src} alt={block.alt} loading="lazy" draggable={false} />
          {block.caption && <figcaption>{inline(block.caption)}</figcaption>}
        </figure>
      );
    case "list": {
      const items = block.items.map((it, i) => <li key={i}>{inline(it)}</li>);
      return block.ordered ? <ol>{items}</ol> : <ul>{items}</ul>;
    }
    case "quote":
      return (
        <blockquote>
          <p>{inline(block.text)}</p>
          {block.cite && <cite>— {block.cite}</cite>}
        </blockquote>
      );
    case "code":
      return (
        <div className="blog-post__code">
          {block.lang && <span className="blog-post__code-lang">{block.lang}</span>}
          <pre><code>{block.code}</code></pre>
        </div>
      );
    case "table":
      return (
        <div className="blog-post__table">
          <table>
            <thead>
              <tr>{block.head.map((h, i) => <th key={i}>{inline(h)}</th>)}</tr>
            </thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j}>{inline(c)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "note":
      return (
        <aside className="blog-post__note" role="note">
          <span aria-hidden="true">!</span>
          <p>{inline(block.text)}</p>
        </aside>
      );
  }
}
